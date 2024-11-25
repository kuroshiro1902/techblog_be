import { DB } from "@/database/database";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import { commentSchema, updateCommentSchema, ECommentField } from "@/post/validators/comment.schema";
import { COMMENT_SELECT } from "../constants/comment-select.const";
import { z } from "zod";

export const updateComment = async (
  commentId: number,
  userId: number,
  data: z.input<typeof updateCommentSchema>
) => {
  // Validate input
  const validatedData = updateCommentSchema.parse(data);
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
    throw new Error('Comment không tồn tại hoặc bạn không có quyền chỉnh sửa');
  }

  // Update comment
  const updatedComment = await DB.comment.update({
    where: { id: validatedCommentId },
    data: validatedData,
    select: COMMENT_SELECT
  });

  return updatedComment;
}; 