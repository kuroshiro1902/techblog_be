import { ENVIRONMENT } from "@/common/environments/environment";
import { Elastic } from "@/database/database";
import { createEmbedding } from "@/openai/service-helpers/createEmbedding";
import { Logger } from "@/common/utils/logger.util";
import { summaryContent } from "@/openai/service-helpers/summaryContent";

// limit 5 bài viết
export const updatePostEmbeddings = async (posts: Array<{ id: number; content: string }>) => {
  if (!Elastic) {
    console.warn('Elastic is not available');
    return [];
  }

  const operations = [];

  for (const post of posts) {
    try {
      // Tóm tắt nội dung trước
      const description = await summaryContent(post.content);
      // Tạo embedding từ nội dung tóm tắt
      const embedding = await createEmbedding(description);

      operations.push(
        { update: { _index: ENVIRONMENT.ELASTIC_POST_INDEX, _id: post.id.toString() } },
        { doc: { embedding, description } }
      );
    } catch (error) {
      await Logger.error(`Error creating embedding for post ${post.id}: ${error}`);
    }
  }

  if (operations.length > 0) {
    try {
      const result = await Elastic.bulk({
        refresh: true,
        operations
      });
      return result.items.filter(item => item.update?.status === 200).map(item => item.update?._id);
    } catch (error) {
      await Logger.error('Bulk update failed: ' + (error as Error).message);
      return [];
    }
  }

  return [];
};
