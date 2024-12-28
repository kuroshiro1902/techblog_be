import { DB, Elastic } from "@/database/database";
import { Logger } from "@/common/utils/logger.util";
import { ENVIRONMENT } from "@/common/environments/environment";
import { OpenAIService } from "@/openai/openai.service";
import { z } from "zod";

export const getPostDescription = async (postId$: number): Promise<{ description: string | null }> => {
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

    // 2. Nếu không có description trong Elasticsearch thì truy vấn từ DB
    let description: string | null = (
      await DB.post.findUnique({ where: { id: postId }, select: { description: true } })
      ?? { description: null }
    ).description;

    if (!description) {
      // 3. Nếu không có description trong DB, gọi hàm summaryContent để tóm tắt
      description = await OpenAIService.summaryContent(
        post._source.content
      );
    }

    // 4. Lưu summary vào Elasticsearch và DB
    Elastic.update({
      index: ENVIRONMENT.ELASTIC_POST_INDEX,
      id: postId.toString(),
      doc: {
        description
      }
    });
    DB.post.update({
      where: {
        id: postId
      },
      data: {
        description
      }
    })

    return { description };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await Logger.error(`Error getting summary for post ${postId}: ${errorMessage}`);
    throw error;
  }
}; 