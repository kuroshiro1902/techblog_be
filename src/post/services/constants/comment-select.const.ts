import { Prisma } from "@prisma/client";
import { ECommentRatingScore } from "@/post/constants/comment-rating-score.const";

export const COMMENT_SELECT: Prisma.CommentSelect = {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  parentCommentId: true,
  postId: true,
  user: { select: { id: true, name: true, avatarUrl: true, } },
  // _count: {
  //   select: {
  //     replies: true,
  //   }
  // },
  commentRatings: {
    select: {
      score: true
    }
  }
};

export type TCommentResponse = Prisma.CommentGetPayload<{
  select: typeof COMMENT_SELECT;
}> & {
  likes: number;
  dislikes: number;
};