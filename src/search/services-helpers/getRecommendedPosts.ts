import { DB, Elastic } from "@/database/database";
import { Logger } from "@/common/utils/logger.util";
import { createUserEmbedding } from "./createUserEmbedding";
import { ENVIRONMENT } from "@/common/environments/environment";
import { TPost_S } from "../models/post.s.model";

export const getRecommendedPosts = async (
  userId: number,
  limit: number = 4
) => {
  if (!Elastic) return [];

  try {
    // 1. Lấy hoặc tạo user embedding
    const userEmbedding = await createUserEmbedding(userId);

    // 2. Tìm bài viết dựa trên embedding hoặc trending
    const result = await Elastic.search<TPost_S>({
      index: ENVIRONMENT.ELASTIC_POST_INDEX,
      body: {
        query: {
          script_score: {
            query: {
              bool: {
                must: [
                  { term: { isPublished: true } }
                ],
                must_not: {
                  terms: {
                    id: (await DB.rating.findMany({
                      where: { userId },
                      select: { postId: true }
                    })).map(r => r.postId)
                  }
                }
              }
            },
            script: {
              // Nếu không có embedding, dùng công thức tính trending score
              source: userEmbedding
                ? "cosineSimilarity(params.user_vector, 'embedding') + 1.0"
                : `
                  // Tính điểm dựa trên views và ratings
                  double views = doc['views'].value;
                  double likes = doc['ratings.likes'].value;
                  double dislikes = doc['ratings.dislikes'].value;
                  
                  // Chuẩn hóa views (0-1)
                  double normalizedViews = Math.log10(views + 1) / 5.0;
                  if(normalizedViews > 1.0) normalizedViews = 1.0;
                  
                  // Tính tỷ lệ like (0-1)
                  double likeRatio = likes + dislikes > 0 
                    ? likes / (likes + dislikes) 
                    : 0.5;
                  
                  // Tính độ mới của bài viết (0-1)
                  long ageInDays = (System.currentTimeMillis() - doc['createdAt'].value.toInstant().toEpochMilli()) / 86400000;
                  double freshness = Math.exp(-ageInDays / 30.0);
                  
                  // Kết hợp các yếu tố: 40% views, 30% likes, 30% freshness
                  return normalizedViews * 0.4 * 2.0 + likeRatio * 0.3 * 2.0 + freshness * 0.3 * 2.0;
                `,
              params: userEmbedding ? { user_vector: userEmbedding } : {}
            }
          }
        },
        _source: ['id', 'title', 'content', 'slug', 'description', 'views', 'thumbnailUrl', 'author', 'createdAt', 'ratings', 'categories'],
        size: limit
      }
    });

    return result.hits.hits.map(hit => ({
      id: +(hit._id ?? ''),
      title: hit._source?.title ?? '',
      slug: hit._source?.slug ?? '',
      description: hit._source?.description ?? null,
      thumbnailUrl: hit._source?.thumbnailUrl ?? null,
      author: hit._source?.author ?? null,
      createdAt: hit._source?.createdAt ?? null,
      ratings: hit._source?.ratings ?? { likes: 0, dislikes: 0 },
      categories: hit._source?.categories ?? [],
      score: hit._score || 0
    }));

  } catch (error) {
    await Logger.error(`Error getting recommended posts: ${error}`);
    return [];
  }
};