import { DB } from "@/database/database";
import { EPostField, postSchema } from "@/post/validators/post.schema";
import { EUserField, userSchema } from "@/user/validators/user.schema";

// Thêm bài viết vào danh sách yêu thích
export const addFavoritePost = async (userId$: number, postId$: number) => {
  const userId = userSchema.shape[EUserField.id].parse(userId$);
  const postId = postSchema.shape[EPostField.id].parse(postId$)
  return await DB.userFavoritePost.create({
    data: {
      userId,
      postId
    },
    select: { post: { select: { id: true, slug: true, title: true } }, createdAt: true }
  });
};
