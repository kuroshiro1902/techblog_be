import { DB } from "@/database/database";
import { EPostField, postSchema } from "@/post/validators/post.schema"
import { EUserField, userSchema } from "@/user/validators/user.schema";

export const isFavoritePost = async (postId$: number, userId$: number) => {
  const postId = postSchema.shape[EPostField.id].parse(postId$);
  const userId = userSchema.shape[EUserField.id].parse(userId$);
  const p = await DB.userFavoritePost.findUnique({ where: { userId_postId: { userId, postId } }, select: { createdAt: true, } })
  console.log({ postId, userId });

  return p;
}