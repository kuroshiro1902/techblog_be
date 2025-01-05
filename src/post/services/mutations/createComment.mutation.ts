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

  // Determine postId and replyToId
  let postId: number;
  let replyToId: number | null = null;

  if (validatedComment.parentCommentId) {
    const parentComment = await DB.comment.findUnique({
      where: { id: validatedComment.parentCommentId },
      select: { postId: true, userId: true }
    });

    if (!parentComment) {
      throw new Error('Parent comment not found or no longer available for replies.');
    }
    postId = parentComment.postId;
    replyToId = parentComment.userId;
  } else if (validatedComment.postId) {
    postId = postSchema.shape[EPostField.id].parse(validatedComment.postId);
  } else {
    throw new Error('Comment must be associated with a post or reply to an existing comment.');
  }

  // Check comment content for compliance and determine sentiment
  const impScore = await OpenAIService.analyzeCommentSentiment(validatedComment.content);

  // Create the new comment in the database
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

  // Send notifications
  NotificationService.handleNewPostComment({
    postId,
    comment: {
      content: createdComment.content,
      replyToId // Reply target ID, if any
    },
    user: {
      name: createdComment.user.name,
      id: createdComment.userId ?? validatedAuthorId
    }
  });

  return createdComment;
};

