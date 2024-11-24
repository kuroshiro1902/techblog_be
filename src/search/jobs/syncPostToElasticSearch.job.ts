import { ENVIRONMENT } from "@/common/environments/environment";
import { DB, Elastic } from "@/database/database";
import { Prisma } from "@prisma/client";
import schedule from "node-schedule";
import { TPost_S } from "../models/post.s.model";
import { Logger } from "../../common/utils/logger.util";


const condition: Prisma.PostWhereInput = { PostLog: { some: { OR: [{ status: "NOT_SYNCED" }, { status: "NEED_SYNC" }] } } };
const batchSize = 100;
const syncPostToElasticSearchByBatch = async (): Promise<{ count: number }> => {
  if (!Elastic) {
    console.error('[WARN] Elastic is not available, post cannot be synced to ElasticSearch!!!');
    return { count: 0 };
  }
  // Bắt đầu transaction
  const transaction = await DB.$transaction(async (tx) => {
    if (!Elastic) {
      console.error('[WARN] Elastic is not available, post cannot be synced to ElasticSearch!!!');
      return { count: 0 };
    }
    try {
      // Lấy các bài viết cần đồng bộ
      const _postsToSync = await tx.post.findMany({
        where: condition,
        take: batchSize,
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          categories: { select: { id: true, name: true } },
          createdAt: true,
          views: true,
          ratings: { select: { score: true } }
        }
      });

      const postsToSync: TPost_S[] = _postsToSync.map(({ ratings, ...rest }) => ({
        ...rest,
        ratings: +(ratings.reduce((acc, { score }) => acc + (score ?? 0), 0) / ratings.length).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
      }))

      if (postsToSync.length <= 0) {
        await Logger.info('No posts to sync');
        return { count: 0 };
      }
      // Thực hiện bulk upsert lên Elasticsearch
      const { items } = await Elastic.bulk({
        refresh: true, operations: postsToSync.flatMap((post) => {
          return [
            {
              update: {
                _index: ENVIRONMENT.ELASTIC_POST_INDEX,
                _id: '' + post.id,
              },
            },
            {
              doc: post,
              doc_as_upsert: true,
            },
          ]
        })
      });

      // Xử lý phản hồi từ Elasticsearch
      const successfulPostIds = items.reduce((prev, item) => {
        if (item.update?.status === 200 || item.update?.status === 201 || item.create?.status === 200 || item.create?.status === 201) {
          const pid = +(item.update?._id ?? item.create?._id ?? NaN);
          if (pid && !isNaN(pid)) {
            return [...prev, pid];
          }
        }
        return [...prev];
      }, [] as number[]);


      //Cập nhật status cho các bài viết đã đồng bộ thành công
      const updateStatusRes = await tx.postLog.updateMany({ where: { postId: { in: successfulPostIds } }, data: { status: "SYNCED" } });

      await Logger.info(`Successfully synced ${successfulPostIds.length} posts`);
      return updateStatusRes;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error during sync';
      await Logger.error(`Sync failed: ${errorMsg}`);
      throw error;
    }
  });

  return transaction;
}

export const syncPostToElasticSearchJob = async () => {
  const syncPostToElasticSearchRule = (() => {
    const jobStartMinute = (new Date().getMinutes() + 1) % 60;
    const rule = new schedule.RecurrenceRule();
    rule.minute = Array.from({ length: 12 }, (_, i) => (jobStartMinute + i * 5) % 60);
    return { jobStartMinute, rule }
  })()

  schedule.scheduleJob(syncPostToElasticSearchRule.rule, async () => {
    console.log('!!! RUN JOB!');

    const syncCount = await syncPostToElasticSearchByBatch();
    console.log({ syncCount });
  });

  console.log(`[Init syncPostToElasticSearchJob]: run at minute ${syncPostToElasticSearchRule.jobStartMinute}.`);
}