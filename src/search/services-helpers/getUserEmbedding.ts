import { DB, Elastic } from "@/database/database";
import { Logger } from "@/common/utils/logger.util";
import { ENVIRONMENT } from "@/common/environments/environment";
import { ERatingScore } from "@/post/constants/rating-score.const";
const DAY_MS = 24 * 60 * 60 * 1000;

// Định nghĩa trọng số cho từng loại tương tác
// - LIKE: Tương tác tích cực mạnh nhất
// - FAVORITE: Đánh dấu để đọc lại, quan tâm cao
// - COMMENT: Phân loại theo sentiment của comment
// - DISLIKE: Tương tác tiêu cực mạnh nhất
// - VIEW: Mức độ quan tâm thấp nhất
const ACTION_WEIGHTS = {
  LIKE: 1.0,
  FAVORITE: 0.8,
  COMMENT_POSITIVE: 0.6,
  COMMENT_NEUTRAL: 0.3,
  COMMENT_NEGATIVE: -0.2,
  DISLIKE: -0.3,
  VIEW: 0.3
} as const;

// Hệ số decay để giảm ảnh hưởng của các tương tác cũ
// Càng lớn thì các tương tác cũ càng ít ảnh hưởng
const DECAY_RATE = 0.1;

// Cache để tránh tính toán lại
const CACHE_TTL = 10 * 1000; // 10s
const userEmbeddingCache = new Map<number, {
  embedding: number[],
  timestamp: Date
}>();

export const getUserEmbedding = async (userId: number) => {
  // BƯỚC 1: Kiểm tra cache
  const cached = userEmbeddingCache.get(userId);
  if (cached && (Date.now() - cached.timestamp.getTime() < CACHE_TTL)) {
    return cached.embedding;
  }

  if (!Elastic) return [];
  try {
    // BƯỚC 2: Thu thập dữ liệu tương tác của user
    const userBehavior = await DB.user.findUnique({
      where: { id: userId },
      select: {
        ratings: {
          select: {
            postId: true,
            score: true,    // Dùng để phân biệt LIKE/DISLIKE/VIEW
            createdAt: true // Dùng để tính time decay
          }
        },
        userFavoritePosts: {
          select: {
            postId: true,
            createdAt: true
          }
        },
        comments: {
          select: {
            postId: true,
            createdAt: true,
            impScore: true  // Sentiment score của comment
          }
        }
      }
    });

    if (!userBehavior) return [];

    // BƯỚC 3: Khởi tạo Map để tính trọng số cho mỗi bài viết
    const postWeights = new Map<number, {
      weight: number,        // Tổng trọng số
      timestamp: Date,       // Thời điểm tương tác gần nhất
      interactionCount: number  // Số lần tương tác
    }>();

    const now = new Date();

    // Helper function để tính và cập nhật trọng số
    const addInteraction = (
      postId: number,
      weight: number,
      timestamp: Date,
      isNegative: boolean = false
    ) => {
      // Tính hệ số giảm theo thời gian
      const daysPassed = (now.getTime() - timestamp.getTime()) / DAY_MS;
      const timeDecay = Math.exp(-DECAY_RATE * daysPassed);

      const existing = postWeights.get(postId) || {
        weight: 0,
        timestamp,
        interactionCount: 0
      };

      // Điều chỉnh trọng số dựa trên số lần tương tác
      const interactionMultiplier = Math.log2(existing.interactionCount + 2);
      const adjustedWeight = isNegative
        ? -Math.abs(weight) * interactionMultiplier
        : weight * interactionMultiplier;

      postWeights.set(postId, {
        weight: existing.weight + (adjustedWeight * timeDecay),
        timestamp: timestamp > existing.timestamp ? timestamp : existing.timestamp,
        interactionCount: existing.interactionCount + 1
      });
    };

    // BƯỚC 4: Xử lý từng loại tương tác
    // 4.1. Xử lý ratings (likes, dislikes, views)
    userBehavior.ratings.forEach(rating => {
      addInteraction(
        rating.postId,
        rating.score === ERatingScore.LIKE
          ? ACTION_WEIGHTS.LIKE
          : rating.score === ERatingScore.DISLIKE
            ? ACTION_WEIGHTS.DISLIKE
            : ACTION_WEIGHTS.VIEW,
        rating.createdAt,
        rating.score === ERatingScore.DISLIKE
      );
    });

    // 4.2. Xử lý favorites
    userBehavior.userFavoritePosts.forEach(favorite => {
      addInteraction(
        favorite.postId,
        ACTION_WEIGHTS.FAVORITE,
        favorite.createdAt
      );
    });

    // 4.3. Xử lý comments theo sentiment
    userBehavior.comments.forEach(comment => {
      const isNegative = (comment.impScore ?? 0) < 0;
      let weight: number = ACTION_WEIGHTS.COMMENT_NEUTRAL;

      if ((comment.impScore ?? 0) > 0) weight = ACTION_WEIGHTS.COMMENT_POSITIVE;
      if ((comment.impScore ?? 0) < 0) weight = ACTION_WEIGHTS.COMMENT_NEGATIVE;

      addInteraction(
        comment.postId,
        weight,
        comment.createdAt,
        isNegative
      );
    });

    // BƯỚC 5: Normalize trọng số
    const weights = Array.from(postWeights.values());
    if (weights.length === 0) return [];

    const maxWeight = Math.max(...weights.map(w => Math.abs(w.weight)));
    const minWeight = Math.min(...weights.map(w => w.weight));

    if (maxWeight === minWeight) return [];

    weights.forEach(weight => {
      weight.weight = (weight.weight - minWeight) / (maxWeight - minWeight);
    });

    // BƯỚC 6: Lấy embeddings từ Elasticsearch và tính weighted average
    const { hits } = await Elastic.search<{ embedding?: number[] }>({
      index: ENVIRONMENT.ELASTIC_POST_INDEX,
      body: {
        query: {
          terms: { id: Array.from(postWeights.keys()) }
        },
        _source: ["embedding"]
      }
    });

    const embeddings = hits.hits
      .map(hit => ({
        embedding: hit._source?.embedding ?? [],
        weight: postWeights.get(Number(hit._id))?.weight ?? 0
      }))
      .filter(e => e.embedding.length > 0);

    if (embeddings.length === 0) return [];

    // BƯỚC 7: Tính weighted average vector
    const vectorLength = embeddings[0].embedding.length;
    const userEmbedding = Array.from({ length: vectorLength }, () => 0);
    let totalWeight = 0;

    embeddings.forEach(({ embedding, weight }) => {
      for (let i = 0; i < vectorLength; i++) {
        userEmbedding[i] += embedding[i] * weight;
      }
      totalWeight += Math.abs(weight);
    });

    // Normalize final vector
    if (totalWeight > 0) {
      for (let i = 0; i < vectorLength; i++) {
        userEmbedding[i] /= totalWeight;
      }
    }

    // BƯỚC 8: Cache kết quả
    userEmbeddingCache.set(userId, {
      embedding: userEmbedding,
      timestamp: new Date()
    });

    if (userEmbedding.every((v) => v === 0)) {
      return [];
    }

    return userEmbedding;

  } catch (error) {
    await Logger.error(`Error creating user embedding: ${error}`);
    return [];
  }
};
