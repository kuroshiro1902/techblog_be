import { DB } from "@/database/database";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import { commentSchema, ECommentField } from "@/post/validators/comment.schema";
import { commentRatingSchema } from "@/post/validators/comment-rating.schema";
import { ERatingCommentStatus } from "../constants/ratingCommentStatus.const";

export const ratingComment = async (
  commentId$?: number,
  userId$?: number,
  score$?: number
): Promise<{
  status: ERatingCommentStatus;
  data: {
    score: number;
    updatedAt: Date;
  };
}> => {
  const commentId = commentSchema.shape[ECommentField.id].parse(commentId$);
  const userId = userSchema.shape[EUserField.id].parse(userId$);
  const score = commentRatingSchema.shape.score.parse(score$);

  const select = { score: true, updatedAt: true };

  const existingRating = await DB.commentRating.findUnique({
    where: {
      userId_commentId: { userId, commentId }
    }
  });

  if (existingRating) {
    const updatedRating = await DB.commentRating.update({
      where: {
        userId_commentId: { userId, commentId }
      },
      data: { score },
      select
    });
    return { status: ERatingCommentStatus.UPDATED, data: updatedRating };
  }

  const newRating = await DB.commentRating.create({
    data: {
      userId,
      commentId,
      score
    },
    select
  });
  return { status: ERatingCommentStatus.CREATED, data: newRating };
}; 