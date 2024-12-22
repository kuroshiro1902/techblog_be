import { ENVIRONMENT } from "@/common/environments/environment";
import { Elastic } from "@/database/database";
import { Logger } from "@/common/utils/logger.util";
import { TPost_S } from "../models/post.s.model";
import { updatePostEmbeddings } from "../services-helpers/updatePostEmbeddings";
import schedule from 'node-schedule';

const batchSize = 5; // Giảm batch size vì OpenAI API có rate limit

export const updateMissingEmbeddingsByBatch = async (size = batchSize): Promise<{ count: number }> => {
  if (!Elastic) {
    await Logger.warn('Elastic is not available, embeddings cannot be updated!!!');
    return { count: 0 };
  }

  try {
    // Tìm các bài viết chưa có embedding
    const result = await Elastic.search<TPost_S>({
      index: ENVIRONMENT.ELASTIC_POST_INDEX,
      body: {
        query: {
          bool: {
            should: [
              { bool: { must_not: { exists: { field: "embedding" } } } },
              {
                script: {
                  script: {
                    source: "doc['embedding'].length == 0"
                  }
                }
              }
            ],
            minimum_should_match: 1
          }
        },
        _source: ["id", "content"],
        size
      }
    });

    const postsToUpdate = result.hits.hits.map(hit => ({
      id: +hit._id!,
      content: hit._source?.content ?? ""
    }));

    if (postsToUpdate.length <= 0) {
      await Logger.info('No posts need embedding update');
      return { count: 0 };
    }

    const res = await updatePostEmbeddings(postsToUpdate);
    await Logger.info(`Updated ${res.length} posts: ${res.join(', ')}`);
    return { count: res.length };
  } catch (error) {
    await Logger.error(`Error updating embeddings: ${error}`);
    throw error;
  }
};

export const updateMissingEmbeddingsJob = async () => {
  const startMinute = 5;
  const runEveryMinutes = 2;
  const size = 5;

  const updateMissingEmbeddingsRule = {
    jobStartMinute: (new Date().getMinutes() + 1) % 60,
    rule: new schedule.RecurrenceRule(),
    minute: Array.from({ length: 12 }, (_, i) => (startMinute + i * runEveryMinutes) % 60)
  }

  schedule.scheduleJob(updateMissingEmbeddingsRule.rule, async () => {
    console.log('!!! RUN JOB!');

    const syncCount = await updateMissingEmbeddingsByBatch(size);
    console.log({ syncCount });
  });
}
