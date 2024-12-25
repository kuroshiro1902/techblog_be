import { DB } from "@/database/database";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import { EPostField, postSchema } from "@/post/validators/post.schema";
import { z } from "zod";
import { createCommentSchema } from "@/post/validators/comment.schema";
import { COMMENT_SELECT } from "../constants/comment-select.const";
import { NotificationService } from "@/notification/services/notification.service";
import { TEXT_AI } from "@/openai/generative";
import { removeHtml } from "@/common/utils/removeHtml.util";
import { OpenAIService } from "@/openai/openai.service";
// import { Logger } from "@/common/utils/logger.util";

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
      throw new Error('Bình luận này không còn khả dụng để trả lời');
    }
    postId = parentComment.postId;
  } else {
    throw new Error('Bình luận không này không được chỉ định bài viết hoặc bình luận trả lời.');
  }

  // Kiểm tra nội dung bình luận có vi phạm quy định hay không và trả về sắc thái bình luận
  const impScore = await OpenAIService.analyzeCommentSentiment(validatedComment.content);

  // Create comment
  const createdComment = await DB.comment.create({
    data: {
      impScore: isNaN(+impScore) ? null : +impScore,
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
