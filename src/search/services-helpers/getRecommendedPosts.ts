import { DB, Elastic } from "@/database/database";
import { Logger } from "@/common/utils/logger.util";
import { getUserEmbedding } from "./getUserEmbedding";
import { ENVIRONMENT } from "@/common/environments/environment";
import { TPost_S } from "../models/post.s.model";

const cache: { [userId: number]: { data: any; expiresAt: number } } = {};
const CACHE_TTL = 10 * 1000; // 10s

export const getRecommendedPosts = async (
  userId?: number,
  limit: number = 4,
  options?: {
    excludeIds?: number[];      // Chỉ loại trừ các ID cụ thể nếu cần
    categoryIds?: number[];     // Filter theo categories
    minScore?: number;         // Điểm tương đồng tối thiểu
  }
) => {
  if (!Elastic) return [];

  if (userId) {
    const cacheEntry = cache[userId];
    const now = Date.now();

    // Kiểm tra cache
    if (cacheEntry && cacheEntry.expiresAt > now) {
      console.log(`Cache hit for userId: ${userId}`);
      return cacheEntry.data;
    }
  }

  try {
    // Lấy user embedding
    const userEmbedding = userId ? await getUserEmbedding(userId) : [];

    // Xây dựng query cơ bản
    const query: any = {
      bool: {
        must: [{ term: { isPublished: true } }]
      }
    };

    // Thêm excludeIds nếu có
    if (options?.excludeIds?.length) {
      query.bool.must_not = {
        terms: { id: options.excludeIds }
      };
    }

    // Thêm filter categories nếu có
    if (options?.categoryIds?.length) {
      query.bool.must.push({
        nested: {
          path: "categories",
          query: {
            terms: { "categories.id": options.categoryIds }
          }
        }
      });
    }

    // Tìm bài viết với script scoring
    const result = await Elastic.search<TPost_S>({
      index: ENVIRONMENT.ELASTIC_POST_INDEX,
      body: {
        query: {
          script_score: {
            query,
            script: {
              source: userEmbedding?.length
                ? `
                  double similarity = cosineSimilarity(params.user_vector, 'embedding') + 1.0;
                  if (similarity < params.min_score) return 0;
                  
                  // Kết hợp với độ mới của bài viết
                  long ageInDays = (System.currentTimeMillis() - doc['createdAt'].value.toInstant().toEpochMilli()) / 86400000;
                  double freshness = Math.exp(-ageInDays / 30.0);
                  
                  // 85% similarity, 15% freshness
                  return similarity * 0.85 + freshness * 0.15;
                `
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
                  
                  // Kết hợp các yếu tố: 50% views, 35% likes, 15% freshness
                  return normalizedViews * 0.5 + likeRatio * 0.35 + freshness * 0.15;
                `,
              params: {
                user_vector: userEmbedding || [],
                min_score: options?.minScore || 0.3
              }
            }
          }
        },
        _source: ['id', 'title', 'slug', 'views', 'description', 'thumbnailUrl', 'author', 'createdAt', 'ratings', 'categories'],
        size: limit,
        sort: { _score: { order: 'desc' } }
      }
    });

    const posts = result.hits.hits
      .filter(hit => hit._score && hit._score > (options?.minScore || 0.3))
      .map(hit => ({
        id: +(hit._id ?? ''),
        title: hit._source?.title ?? '',
        slug: hit._source?.slug ?? '',
        views: hit._source?.views ?? 0,
        isPublished: true,
        description: hit._source?.description ?? null,
        thumbnailUrl: hit._source?.thumbnailUrl ?? null,
        author: hit._source?.author ?? null,
        createdAt: hit._source?.createdAt ?? null,
        ratings: hit._source?.ratings ?? { likes: 0, dislikes: 0 },
        categories: hit._source?.categories ?? [],
        score: hit._score || 0
      }));

    // Cập nhật cache
    if (userId) {
      cache[userId] = {
        data: posts,
        expiresAt: Date.now() + CACHE_TTL
      };
    }

    return posts;

  } catch (error) {
    await Logger.error(`Error getting recommended posts: ${error}`);
    return [];
  }
};
