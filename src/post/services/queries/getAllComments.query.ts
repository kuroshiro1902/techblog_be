import { DB } from "@/database/database";
import { paginationOptions, paginationSchema, TPageInfo } from "@/common/models/pagination/pagination.model";
import { COMMENT_SELECT, TCommentResponse } from "../constants/comment-select.const";
import { z } from "zod";
import { ERatingScore } from "@/post/constants/rating-score.const";

const getAllCommentsSchema = z.object({
  ...paginationSchema.shape,
  orderBy: z.object({
    field: z.enum(['createdAt']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc')
  }).default({ field: 'createdAt', order: 'desc' })
});

export type TGetAllCommentsQuery = z.input<typeof getAllCommentsSchema>;

export const getAllComments = async (query: TGetAllCommentsQuery) => {
  const { pageIndex: _pageIndex, pageSize: _pageSize, orderBy } = getAllCommentsSchema.parse(query);

  const { pageIndex, pageSize, skip, take } = paginationOptions({
    pageIndex: _pageIndex,
    pageSize: _pageSize,
  });

  // Lấy comments của các bài viết đã publish
  const where = {
    post: {
      isPublished: true
    }
  };

  const [comments, totalCount] = await Promise.all([
    DB.comment.findMany({
      where,
      select: { ...COMMENT_SELECT, post: { select: { slug: true } } },
      orderBy: {
        [orderBy.field]: orderBy.order
      },
      skip,
      take
    }),
    DB.comment.count({ where })
  ]);

  // Tính toán số lượng likes/dislikes cho mỗi comment
  const commentsWithRatings = comments.map(comment => {
    const ratings = comment.commentRatings || [];
    const likes = ratings.filter(r => r.score === ERatingScore.LIKE).length;
    const dislikes = ratings.filter(r => r.score === ERatingScore.DISLIKE).length;

    const { commentRatings, ...rest } = comment;
    return {
      ...rest,
      likes,
      dislikes
    };
  });

  const totalPage = Math.ceil(totalCount / pageSize);
  const hasNextPage = skip + comments.length < totalCount;

  return {
    data: commentsWithRatings,
    pageInfo: {
      pageIndex,
      pageSize,
      totalPage,
      hasNextPage
    }
  };
}; 