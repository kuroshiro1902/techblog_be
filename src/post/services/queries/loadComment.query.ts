import { paginationOptions, paginationSchema, TPagination } from "@/common/models/pagination/pagination.model";
import { DB } from "@/database/database";
import { commentSchema, ECommentField } from "@/post/validators/comment.schema";
import { EPostField, postSchema } from "@/post/validators/post.schema";
import { COMMENT_SELECT, TCommentResponse } from "../constants/comment-select.const";
import { Prisma } from "@prisma/client";
import { ECommentRatingScore } from "@/post/constants/comment-rating-score.const";

type TLoadComments = TPagination & {
  postId?: number;
  parentCommentId?: number;
};

export const loadComments = async ({
  postId: postId$,
  parentCommentId: parentCommentId$,
  pageIndex: pageIndex$,
  pageSize: pageSize$
}: TLoadComments) => {
  const pagination = paginationSchema.parse({ pageIndex: pageIndex$, pageSize: pageSize$ });
  const { pageIndex, pageSize, skip, take } = paginationOptions(pagination);
  const postId = postSchema.shape[EPostField.id].optional().parse(postId$);
  const parentCommentId = commentSchema.shape[ECommentField.id].optional().parse(parentCommentId$);

  const where: Prisma.CommentWhereInput = {};

  if (!postId && !parentCommentId) {
    throw new Error('postId or parentCommentId is required');
  }

  if (postId) {
    where.postId = postId;
  }

  if (parentCommentId) {
    where.parentCommentId = parentCommentId;
  } else {
    where.parentCommentId = null;
  }

  const [totalCount, comments] = await Promise.all([
    DB.comment.count({ where }),
    DB.comment.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      select: COMMENT_SELECT
    })
  ]);

  const hasNextPage = skip + comments.length < totalCount;

  const transformedComments = comments.map(comment => {
    const ratings = comment.commentRatings || [];
    const likes = ratings.filter(r => r.score === ECommentRatingScore.LIKE).length;
    const dislikes = ratings.filter(r => r.score === ECommentRatingScore.DISLIKE).length;

    const { commentRatings, ...rest } = comment;
    return { ...rest, likes, dislikes };
  });

  return {
    data: transformedComments,
    pageInfo: {
      pageIndex,
      pageSize,
      totalCount,
      totalPage: Math.ceil(totalCount / pageSize),
      hasNextPage
    }
  };
};
