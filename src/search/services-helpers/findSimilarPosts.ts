import { ENVIRONMENT } from "@/common/environments/environment";
import { Elastic } from "@/database/database";
import { TPost_S } from "../models/post.s.model";

export const findSimilarPosts = async (postId: number, limit: number = 5) => {
  if (!Elastic) return [];

  try {
    // Lấy embedding của bài viết gốc
    const sourcePost = await Elastic.get<TPost_S>({
      index: ENVIRONMENT.ELASTIC_POST_INDEX,
      id: postId.toString(),
      _source: ['embedding']
    });

    if (!sourcePost.found || !sourcePost._source?.embedding) {
      console.warn(`Post embedding not found for post ${postId}`);
      return [];
    }

    // Tìm các bài viết tương tự
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
                must_not: [
                  { term: { id: postId } } // Loại bỏ bài viết gốc
                ]
              }
            },
            // script: {
            //   source: "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
            //   params: {
            //     query_vector: sourcePost._source.embedding
            //   }
            // }
            script: {
              source: `
                // 1. Tính cosine similarity (0-2)
                double similarity = cosineSimilarity(params.query_vector, 'embedding') + 1.0;

                // 2. Chuẩn hóa views (0-1)
                double normalizedViews = Math.log10(doc['views'].value + 1) / 5.0;
                if(normalizedViews > 1.0) normalizedViews = 1.0;

                // 3. Kết hợp điểm (70% similarity, 30% views)
                return similarity * 0.7 + normalizedViews * 0.3 * 2.0;
              `,
              params: {
                query_vector: sourcePost._source.embedding
              }
            }
          }
        },
        size: limit,
        _source: ['id', 'title', 'content', 'slug', 'description', 'views', 'thumbnailUrl', 'author', 'createdAt', 'ratings', 'categories']
      }
    });

    return result.hits.hits.map(hit => ({
      id: +(hit._source?.id ?? ''),
      title: hit._source?.title,
      description: hit._source?.description,
      slug: hit._source?.slug,
      // score: hit._score,
      score: {
        total: hit._score,
        // Tính lại các thành phần điểm để hiển thị
        similarity: ((hit?._score ?? 0 * 10) / 7),
        popularity: (hit?._source?.views ?? 0 > 0
          ? (Math.log10(hit?._source?.views ?? 0 + 1) / 5.0)
          : 0
        )
      },
      views: hit._source?.views,
      thumbnailUrl: hit._source?.thumbnailUrl,
      author: hit._source?.author,
      createdAt: hit._source?.createdAt,
      ratings: hit._source?.ratings,
      categories: hit._source?.categories
    }));
  } catch (error) {
    console.error('Error finding similar posts:', error);
    throw error;
  }
}