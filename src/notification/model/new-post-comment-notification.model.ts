import { Comment, NotificationType, Post, User } from "@prisma/client"

export type TNewPostCommentNotification = {
  /**
   * Người vừa comment vào bài viết.
   */
  user: Pick<User, 'name'>,
  postId: number
  comment: Pick<Comment, 'content'>
}