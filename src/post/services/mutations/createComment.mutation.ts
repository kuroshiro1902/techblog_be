import { DB } from "@/database/database";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import { EPostField, postSchema } from "@/post/validators/post.schema";
import { z } from "zod";
import { createCommentSchema } from "@/post/validators/comment.schema";
import { COMMENT_SELECT } from "../constants/comment-select.const";
import { NotificationService } from "@/notification/services/notification.service";
import { TEXT_AI } from "@/openai/generative";
import { removeHtml } from "@/common/utils/removeHtml.util";
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

  const harmfulCheck = await TEXT_AI(removeHtml(validatedComment.content),
    "Bạn là một trợ lý kiểm tra nội dung bình luận có phải là nội dung bạo lực, xúc phạm, hay không phù hợp không? Nếu có, hãy trả về 'true', ngược lại trả về 'false'.")

  const isHarmful = harmfulCheck.includes('true')
  if (isHarmful) {
    throw new Error('Nội dung bình luận vi phạm quy định! Vui lòng kiểm tra lại.');
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

  // Phân tích sentiment bất đồng bộ
  // OpenAIService.analyzeCommentSentiment(validatedComment.content)
  //   .then(async (sentiment) => {
  //     await DB.comment.update({
  //       where: { id: createdComment.id },
  //       data: { impScore: sentiment }
  //     });
  //   })
  //   .catch(error => {
  //     Logger.error(`Failed to analyze sentiment for comment ${createdComment.id}:`, error);
  //   });

  NotificationService.handleNewPostComment({
    postId,
    comment: { content: createdComment.content },
    user: { name: createdComment.user.name, id: createdComment.userId ?? createdComment.user.id }
  });

  return createdComment;
};
