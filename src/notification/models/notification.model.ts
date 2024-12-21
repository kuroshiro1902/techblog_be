import { Comment, NotificationType, Post, User } from "@prisma/client"

export type TNewPostCommentNotification = {
  /**
   * Người vừa comment vào bài viết.
   */
  user: Pick<User, 'id' | 'name'>,
  postId: number
  comment: Pick<Comment, 'content'>
}

export type TNewPostNotification = {
  post: Pick<Post, 'id' | 'title' | 'slug' | 'createdAt'> & { author: Pick<User, 'id' | 'name'> }
}
