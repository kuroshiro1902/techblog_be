import { DB } from "@/database/database"
import { ERatingScore } from "@/post/constants/rating-score.const";
import { EPostField, postSchema } from "@/post/validators/post.schema";
import { TRating } from "@/post/validators/rating.schema";
import { EUserField, userSchema } from "@/user/validators/user.schema"

export const findRatingOfUser = async (postId$?: number, userId$?: number): Promise<TRating> => {
  const userId = userSchema.shape[EUserField.id].parse(userId$);
  const postId = postSchema.shape[EPostField.id].parse(postId$);

  const rating = await DB.rating.findUnique({ where: { userId_postId: { postId, userId }, score: { not: ERatingScore.NONE } }, select: { score: true, updatedAt: true } },)
  return rating ?? { score: undefined, updatedAt: undefined };
}