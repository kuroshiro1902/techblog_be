import { DB } from "@/database/database";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import { commentSchema, updateCommentSchema, ECommentField } from "@/post/validators/comment.schema";
import { COMMENT_SELECT } from "../constants/comment-select.const";
import { z } from "zod";
import { TEXT_AI } from "@/openai/generative";
import { removeHtml } from "@/common/utils/removeHtml.util";
import { commentHarmfulCheckInstruction } from "../constants/harmfulCheckInstruction.const";

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
    throw new Error('Comment không tồn tại hoặc bạn không có quyền chỉnh sửa.');
  }

  const harmfulCheck = await TEXT_AI(removeHtml(validatedData.content), commentHarmfulCheckInstruction);

  const isHarmful = harmfulCheck.includes('true')
  if (isHarmful) {
    throw new Error('Nội dung bình luận vi phạm quy định! Vui lòng kiểm tra lại.');
  }

  // Update comment
  const updatedComment = await DB.comment.update({
    where: { id: validatedCommentId },
    data: validatedData,
    select: COMMENT_SELECT
  });

  return updatedComment;
}; 