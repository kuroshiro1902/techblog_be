import { EPostField, postSchema } from '@/post/validators/post.schema';
import { ratingSchema } from '@/post/validators/rating.schema';
import { EUserField, userSchema } from '@/user/validators/user.schema';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Đánh giá một bài viết.
 * @param postId - ID bài viết
 * @param userId - ID người dùng
 * @param score - Điểm số người dùng đánh giá
 */
export const rating = async (postId$?: number, userId$?: number, score$?: number): Promise<{
  status: 'CREATED' | 'UPDATED',
  data: {
    score: number;
    updatedAt: Date;
  };
}> => {
  const postId = postSchema.shape[EPostField.id].parse(postId$);
  const userId = userSchema.shape[EUserField.id].parse(userId$);
  const score = ratingSchema.shape.score.parse(score$);

  // Kiểm tra xem quan hệ `Rating` đã tồn tại chưa
  const existingRating = await prisma.rating.findUnique({
    where: {
      userId_postId: { userId, postId }, // Sử dụng unique constraint
    },
  });

  const select = { score: true, updatedAt: true }

  if (existingRating) {
    // Nếu đã tồn tại, cập nhật `score`
    const updatedRating = await prisma.rating.update({
      where: {
        userId_postId: { userId, postId },
      },
      data: {
        score,
      },
      select
    });
    return { status: 'UPDATED', data: updatedRating };
  } else {
    // Nếu chưa tồn tại, tạo mới bản ghi `Rating`
    const newRating = await prisma.rating.create({
      data: {
        userId,
        postId,
        score,
      },
      select
    });
    return { status: 'CREATED', data: newRating };
  }

};
