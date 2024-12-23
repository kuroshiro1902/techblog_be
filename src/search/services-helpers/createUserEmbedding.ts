import { DB, Elastic } from "@/database/database";
import { Logger } from "@/common/utils/logger.util";
import { ENVIRONMENT } from "@/common/environments/environment";
import { ERatingScore } from "@/post/constants/rating-score.const";

export const createUserEmbedding = async (userId: number) => {
  if (!Elastic) return [] as number[];
  try {
    // 1. Thu thập hành vi người dùng
    const userBehavior = await DB.user.findUnique({
      where: { id: userId },
      select: {
        // Bài viết đã thích
        ratings: {
          where: { score: ERatingScore.LIKE },
          select: { postId: true }
        },
        // Bài viết đã lưu
        userFavoritePosts: {
          select: { postId: true }
        },
        // Comments - có thể nâng cấp: Đánh sắc thái bằng AI cho comment -> Truy vấn comment có sắc thái tích cực (-1 0 1)
        // comments: {
        //   select: { postId: true }
        // }
      }
    });

    if (!userBehavior) return null;

    // 2. Lấy embeddings của các bài viết liên quan
    const postIds = new Set([
      ...userBehavior.ratings.map(r => r.postId),
      ...userBehavior.userFavoritePosts.map(f => f.postId),
      // ...userBehavior.comments.map(c => c.postId)
    ]);

    if (postIds.size === 0) return null;

    // 3. Lấy embeddings từ Elasticsearch
    const { hits } = await Elastic.search<{ embedding?: number[] }>({
      index: ENVIRONMENT.ELASTIC_POST_INDEX,
      body: {
        query: {
          terms: { id: Array.from(postIds) }
        },
        _source: ["embedding"]
      }
    });

    // 4. Tính trung bình các vectors (cách đơn giản nhất)
    const embeddings = hits.hits
      .map(hit => hit._source?.embedding ?? [])
      .filter(e => e.length > 0);

    if (embeddings.length === 0) return null;

    // Tính trung bình từng chiều của vectors
    const vectorLength = embeddings[0].length;
    const userEmbedding = Array.from({ length: vectorLength }, () => 0);

    embeddings.forEach(embedding => {
      for (let i = 0; i < vectorLength; i++) {
        userEmbedding[i] += embedding[i];
      }
    });

    for (let i = 0; i < vectorLength; i++) {
      userEmbedding[i] /= embeddings.length;
    }

    return userEmbedding;
  } catch (error) {
    await Logger.error(`Error creating user embedding: ${error}`);
    return null;
  }
};
