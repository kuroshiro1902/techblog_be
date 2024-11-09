import { ENVIRONMENT } from "@/common/environments/environment";
import { DB, Elastic } from "@/database/database";
import { Prisma } from "@prisma/client";
import schedule from "node-schedule";

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
      const postsToSync = await tx.post.findMany({
        where: condition,
        take: batchSize,
        include: { author: { select: { id: true, name: true, avatarUrl: true } }, categories: { select: { id: true, name: true } } }
      });

      if (postsToSync.length <= 0) {
        return { count: 0 };
      }
      // Thực hiện bulk upsert lên Elasticsearch
      const { items } = await Elastic.bulk({
        refresh: true, operations: postsToSync.flatMap((post) => {
          const { thumbnailUrl, slug, views, updatedAt, authorId, ...syncData } = post;
          return [
            {
              update: {
                _index: ENVIRONMENT.ELASTIC_POST_INDEX,
                _id: post.id,
              },
            },
            {
              doc: { ...syncData },
              doc_as_upsert: true,
            },
          ]
        })
      });

      // Xử lý phản hồi từ Elasticsearch
      const successfulPostIds = items.reduce((prev, item) => {
        if (item.update?.status === 200 || item.update?.status === 201 || item.create?.status === 201) {
          const pid = +(item.update?._id ?? item.create?._id ?? NaN);
          if (pid && !isNaN(pid)) {
            return [...prev, pid];
          }
        }
        return [...prev];
      }, [] as number[]);


      //Cập nhật status cho các bài viết đã đồng bộ thành công
      const updateStatusRes = await tx.postLog.updateMany({ where: { postId: { in: successfulPostIds } }, data: { status: "SYNCED" } });
      return updateStatusRes;
    } catch (error) {
      console.log(error);
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