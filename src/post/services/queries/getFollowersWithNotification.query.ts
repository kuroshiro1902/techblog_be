import { DB } from "@/database/database";
import { EPostField, postSchema } from "@/post/validators/post.schema";

/**
 * Lấy ra những người dùng 
 */
export const getFollowersWithNotification = async (postId$: number) => {
  const postId = postSchema.shape[EPostField.id].parse(postId$);

  const { slug, title, userFavoritePosts } = await DB.post.findUniqueOrThrow({
    where: { id: postId, isPublished: true },
    select: { slug: true, title: true, userFavoritePosts: { select: { userId: true } } }
  })

  const followerIds = userFavoritePosts.map(({ userId }) => userId);

  return { title, slug, followerIds };
}