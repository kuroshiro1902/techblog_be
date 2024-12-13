import { DB } from "@/database/database";
import { userSchema } from "@/user/validators/user.schema";
import { EPostField, postSchema } from "@/post/validators/post.schema";
import { EUserField } from "@/user/validators/user.schema";

type TDeleteFavoritePostParams = {
  userId: number;
  postId: number;
};

export const deleteFavoritePost = async ({ userId, postId }: TDeleteFavoritePostParams) => {
  // Xác thực userId và postId
  userSchema.shape[EUserField.id].parse(userId);
  postSchema.shape[EPostField.id].parse(postId);

  // Thực hiện xóa bài viết yêu thích
  const deletedFavoritePost = await DB.userFavoritePost.delete({
    where: {
      userId_postId: { userId, postId }
    },
    select: { id: true, postId: true }
  });

  // Kiểm tra xem có bản ghi nào bị xóa không
  if (!deletedFavoritePost) {
    throw new Error('Không tìm thấy bài viết yêu thích để xóa.');
  }

  return deletedFavoritePost;
};
