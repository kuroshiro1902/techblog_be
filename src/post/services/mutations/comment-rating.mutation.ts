import { DB } from "@/database/database";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import { commentSchema, ECommentField } from "@/post/validators/comment.schema";
import { commentRatingSchema } from "@/post/validators/comment-rating.schema";
import { ERatingCommentStatus } from "../constants/ratingCommentStatus.const";
import { COMMENT_SELECT, TCommentResponse } from "../constants/comment-select.const";
import { ERatingScore } from "@/post/constants/rating-score.const";

export const ratingComment = async (
  commentId$?: number,
  userId$?: number,
  score$?: number
) => {
  const commentId = commentSchema.shape[ECommentField.id].parse(commentId$);
  const userId = userSchema.shape[EUserField.id].parse(userId$);
  const score = commentRatingSchema.shape.score.parse(score$);

  const existingRating = await DB.commentRating.findUnique({
    where: {
      userId_commentId: { userId, commentId }
    }
  });

  // Update or create rating
  if (existingRating) {
    await DB.commentRating.update({
      where: {
        userId_commentId: { userId, commentId }
      },
      data: { score }
    });
  } else {
    await DB.commentRating.create({
      data: {
        userId,
        commentId,
        score
      }
    });
  }

  // Fetch updated comment with ratings
  const comment = await DB.comment.findUnique({
    where: { id: commentId },
    select: COMMENT_SELECT
  });

  if (!comment) {
    throw new Error('Comment không tồn tại');
  }

  // Count likes and dislikes
  const ratings = comment.commentRatings || [];
  const likes = ratings.filter(r => r.score === ERatingScore.LIKE).length;
  const dislikes = ratings.filter(r => r.score === ERatingScore.DISLIKE).length;
  const ownRating = userId ? ratings.find(r => r.userId === userId)?.score : undefined;


  const { commentRatings, ...rest } = comment;

  return {
    status: existingRating ? ERatingCommentStatus.UPDATED : ERatingCommentStatus.CREATED,
    data: { ...rest, rating: { likes, dislikes }, ownRating }
  };
}; 