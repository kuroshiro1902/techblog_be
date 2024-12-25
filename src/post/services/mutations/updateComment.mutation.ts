import { DB } from "@/database/database";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import { commentSchema, updateCommentSchema, ECommentField } from "@/post/validators/comment.schema";
import { COMMENT_SELECT } from "../constants/comment-select.const";
import { z } from "zod";
import { TEXT_AI } from "@/openai/generative";
import { removeHtml } from "@/common/utils/removeHtml.util";
import { commentHarmfulCheckInstruction } from "../constants/harmfulCheckInstruction.const";
import { OpenAIService } from "@/openai/openai.service";
// import { OpenAIService } from "@/openai/openai.service";
// import { Logger } from "@/common/utils/logger.util";

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

  // Kiểm tra nội dung bình luận có vi phạm quy định hay không và trả về sắc thái bình luận
  const impScore = await OpenAIService.analyzeCommentSentiment(validatedData.content);

  // Update comment
  const updatedComment = await DB.comment.update({
    where: { id: validatedCommentId },
    data: {
      impScore: isNaN(+impScore) ? null : +impScore,
      content: validatedData.content,
    },
    select: COMMENT_SELECT
  });

  return updatedComment;
}; 