import { DB } from "@/database/database";
import { EPostField, postSchema } from "@/post/validators/post.schema";

/**
 * Lấy ra những người dùng đang theo dõi bài viết và đăng kí nhận thông báo
 */
export const getPostFollowersWithNotification = async (postId$: number) => {
  // Xác thực và parse postId
  const postId = postSchema.shape[EPostField.id].parse(postId$);

  // Lấy bài viết với thông tin người dùng theo dõi và đăng ký nhận thông báo
  const post = await DB.post.findUnique({
    where: { id: postId },
    select: {
      slug: true,
      title: true,
      userFavoritePosts: {
        where: { notification: true },  // Chỉ lấy những người theo dõi có thông báo bật
        select: { userId: true },
      },
    },
  });

  if (!post) {
    throw new Error('Bài viết không tồn tại');
  }

  // Trích xuất danh sách userId từ các người theo dõi
  const followerIds = post.userFavoritePosts.map(({ userId }) => userId);

  // Trả về thông tin bài viết và danh sách người theo dõi
  return { title: post.title, slug: post.slug, followerIds };
};
