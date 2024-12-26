import { ENVIRONMENT } from "@/common/environments/environment";
import { Elastic } from "@/database/database";
import { Logger } from "@/common/utils/logger.util";
import { OpenAIService } from "@/openai/openai.service";

const BATCH_SIZE = 5; // Giới hạn số lượng xử lý mỗi lần

export const updatePostEmbeddings = async (
  posts: Array<{ id: number; content: string; description?: string | null }>
) => {
  if (!Elastic) {
    console.warn("Elastic is not available");
    return [];
  }

  const successfulIds: string[] = [];

  // Lọc chỉ những bài chưa có description
  const postsWithoutDescription = posts.filter((post) => !post.description);

  // Xử lý theo batches để tránh quá tải
  for (let i = 0; i < postsWithoutDescription.length; i += BATCH_SIZE) {
    const batch = postsWithoutDescription.slice(i, i + BATCH_SIZE);
    const operations: Array<any> = [];

    try {
      // 1. Tạo summaries
      const descriptionsRes = await Promise.allSettled(
        batch.map((post) => OpenAIService.summaryContent(post.content))
      );

      // 2. Lọc các posts có summary thành công
      const embeddingPosts = batch.reduce((acc, post, index) => {
        const description = descriptionsRes[index];
        if (description.status === "fulfilled" && description.value) {
          acc.push({ id: post.id, description: description.value });
        } else if (description.status === "rejected") {
          Logger.error(
            `Failed to create summary for post ${post.id}: ${description.reason}`
          );
        }
        return acc;
      }, [] as Array<{ id: number; description: string }>);

      if (embeddingPosts.length === 0) continue;

      // 3. Tạo embeddings
      const embeddings =
        embeddingPosts.length > 1
          ? await OpenAIService.createEmbeddingBatch(
            embeddingPosts.map((item) => item.description)
          )
          : [await OpenAIService.createEmbedding(embeddingPosts[0].description)];

      // 4. Chuẩn bị operations cho bulk update
      embeddingPosts.forEach((post, index) => {
        operations.push(
          {
            update: {
              _index: ENVIRONMENT.ELASTIC_POST_INDEX,
              _id: post.id.toString(),
            },
          },
          {
            doc: {
              embedding: embeddings[index],
              description: post.description,
              updatedAt: new Date().toISOString(),
            },
          }
        );
      });

      // 5. Thực hiện bulk update
      if (operations.length > 0) {
        const result = await Elastic.bulk({
          refresh: true,
          operations,
        });

        const batchSuccessIds = result.items
          .filter((item) => item.update?.status === 200)
          .map((item) => item.update?._id)
          .filter((id): id is string => id !== undefined);

        successfulIds.push(...batchSuccessIds);
      }
    } catch (error) {
      await Logger.error(
        `Batch update failed for posts ${batch.map((p) => p.id).join(",")}: ${error}`
      );
    }

    // Delay nhỏ giữa các batches
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return successfulIds;
};
