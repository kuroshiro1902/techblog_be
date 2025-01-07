import { ENVIRONMENT } from "@/common/environments/environment";
import { Elastic } from "@/database/database";
import { Logger } from "@/common/utils/logger.util";
import { OpenAIService } from "@/openai/openai.service";

const BATCH_SIZE = 5; // Giới hạn số lượng xử lý mỗi lần

export const updatePostEmbeddings = async (
  posts: Array<{ id: number; content: string; description?: string | null }>,
  updatedEmbeddingMark = false
) => {
  if (!Elastic) {
    console.warn("Elastic is not available");
    return [];
  }

  const successfulIds: string[] = [];

  // Xử lý theo batches để tránh quá tải
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    const operations: Array<any> = [];

    try {

      // 1. Tạo summaries cho những bài chưa có description
      const summariesRes = await Promise.allSettled(
        batch.map((post) =>
          !!post.description ? Promise.resolve(post.description) : OpenAIService.summaryContent(post.content)
        )
      );

      // 2. Lọc các bài viết có description thành công
      const embeddingPosts = batch.reduce((acc, post, index) => {
        const summary = summariesRes[index];
        if (summary.status === "fulfilled" && summary.value) {
          acc.push({ id: post.id, description: summary.value });
        } else if (summary.status === "rejected") {
          Logger.error(
            `Failed to create summary for post ${post.id}: ${summary.reason}`
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

      const updatedAt = new Date().toISOString();
      // 4. Chuẩn bị operations cho bulk update
      embeddingPosts.forEach((post, index) => {
        embeddings?.[index] && embeddings?.[index].length === 768 ? operations.push(
          {
            update: {
              _index: ENVIRONMENT.ELASTIC_POST_INDEX,
              _id: post.id.toString(),
            },
          },
          {
            doc: {
              embedding: embeddings![index],
              description: post.description, // Cập nhật nếu description được tạo mới
              updatedAt: updatedAt,
              embedding_updated_at: updatedEmbeddingMark ? updatedAt : undefined
            },
          }
        ) : undefined;
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
