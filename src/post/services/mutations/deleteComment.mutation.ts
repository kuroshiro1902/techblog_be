import { DB } from "@/database/database";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import { commentSchema, ECommentField } from "@/post/validators/comment.schema";

export const deleteComment = async (
  commentId: number,
  userId: number
) => {
  // Validate input
  const validatedCommentId = commentSchema.shape[ECommentField.id].parse(commentId);
  const validatedUserId = userSchema.shape[EUserField.id].parse(userId);

  // Check if comment exists and belongs to user
  const existingComment = await DB.comment.findFirst({
    where: {
      id: validatedCommentId,
      userId: validatedUserId
    }
  });

  if (!existingComment) {
    throw new Error('Comment không tồn tại hoặc bạn không có quyền xóa');
  }

  // Delete comment and its notifications
  const result = await DB.$transaction([
    // Delete notifications related to this comment
    DB.notification.deleteMany({
      where: {
        itemType: 'comment',
        itemId: validatedCommentId
      }
    }),

    // Delete comment
    DB.comment.delete({
      where: { id: validatedCommentId }
    })
  ]);

  return result[1]; // Return deleted comment
}; 