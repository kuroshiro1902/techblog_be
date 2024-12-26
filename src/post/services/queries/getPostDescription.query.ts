import { Elastic } from "@/database/database";
import { Logger } from "@/common/utils/logger.util";
import { ENVIRONMENT } from "@/common/environments/environment";
import { OpenAIService } from "@/openai/openai.service";
import { z } from "zod";

export const getPostDescription = async (postId$: number): Promise<{ description: string }> => {
  if (!Elastic) {
    throw new Error("Elasticsearch is not available");
  }

  const postId = z.number().parse(postId$);

  try {
    // 1. Kiểm tra description trong Elasticsearch
    const post = await Elastic.get<{ description?: string, content: string }>({
      index: ENVIRONMENT.ELASTIC_POST_INDEX,
      id: postId.toString(),
      _source: ["description", "content"]
    });

    // Nếu đã có description, trả về luôn
    if (post._source?.description) {
      return { description: post._source.description };
    }

    if (!post._source?.content) {
      return { description: '' };
    }

    // 3. Gọi hàm summaryContent để tóm tắt
    const description = await OpenAIService.summaryContent(
      post._source.content
    );

    // 4. Lưu summary vào Elasticsearch
    Elastic.update({
      index: ENVIRONMENT.ELASTIC_POST_INDEX,
      id: postId.toString(),
      doc: {
        description
      }
    });

    return { description };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await Logger.error(`Error getting summary for post ${postId}: ${errorMessage}`);
    throw error;
  }
}; 