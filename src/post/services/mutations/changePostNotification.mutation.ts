import { DB } from "@/database/database";
import { EPostField, postSchema } from "@/post/validators/post.schema";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import { z } from "zod";

export const changePostNotification = async (userId$: number, postId$: number, notification$: boolean) => {
  const postId = postSchema.shape[EPostField.id].parse(postId$);
  const userId = userSchema.shape[EUserField.id].parse(userId$);
  const notification = z.boolean().parse(notification$);
  const favorite = await DB.userFavoritePost.update({
    where: {
      userId_postId: {
        userId,
        postId,
      }
    },
    data: {
      notification,
    },
  });

  return favorite;
}