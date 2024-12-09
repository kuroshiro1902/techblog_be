import { DB } from "@/database/database";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import { EPostField, postSchema } from "@/post/validators/post.schema";
import { z } from "zod";
import { createCommentSchema } from "@/post/validators/comment.schema";
import { COMMENT_SELECT } from "../constants/comment-select.const";
import { NotificationService } from "@/notification/services/notification.service";

export const createComment = async (
  comment: z.input<typeof createCommentSchema>,
  authorId: number
) => {
  // Validate input data
  const validatedComment = createCommentSchema.parse(comment);
  const validatedAuthorId = userSchema.shape[EUserField.id].parse(authorId);

  // Nếu không có postId, lấy từ parent comment
  let postId: number;
  if (validatedComment.postId) {
    postId = postSchema.shape[EPostField.id].parse(validatedComment.postId);
  } else if (validatedComment.parentCommentId) {
    const parentComment = await DB.comment.findUnique({
      where: { id: validatedComment.parentCommentId },
      select: { postId: true }
    });
    if (!parentComment) {
      throw new Error('Parent comment không tồn tại');
    }
    postId = parentComment.postId;
  } else {
    throw new Error('Phải có ít nhất một trong hai: postId hoặc parentCommentId');
  }

  // Create comment
  const createdComment = await DB.comment.create({
    data: {
      content: validatedComment.content,
      post: {
        connect: { id: postId }
      },
      user: {
        connect: { id: validatedAuthorId }
      },
      ...(validatedComment.parentCommentId && {
        parentComment: {
          connect: { id: validatedComment.parentCommentId }
        }
      })
    },
    select: COMMENT_SELECT
  });

  NotificationService.handleNewPostComment({
    postId,
    comment: { content: createdComment.content },
    user: { name: createdComment.user.name, id: createdComment.userId ?? createdComment.user.id }
  });

  return createdComment;
};
