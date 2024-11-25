import { paginationOptions, paginationSchema, TPagination } from "@/common/models/pagination/pagination.model";
import { DB } from "@/database/database";
import { commentSchema, ECommentField } from "@/post/validators/comment.schema";
import { EPostField, postSchema } from "@/post/validators/post.schema";
import { COMMENT_SELECT } from "../constants/comment-select.const";
import { Prisma } from "@prisma/client";
import { ERatingScore } from "@/post/constants/rating-score.const";
import { EUserField } from "@/user/validators/user.schema";
import { userSchema } from "@/user/validators/user.schema";

type TLoadComments = TPagination & {
  postId?: number;
  parentCommentId?: number;
  userId?: number;
};

export const loadComments = async ({
  postId: postId$,
  parentCommentId: parentCommentId$,
  pageIndex: pageIndex$,
  pageSize: pageSize$,
  userId: userId$
}: TLoadComments) => {
  const pagination = paginationSchema.parse({ pageIndex: pageIndex$, pageSize: pageSize$ });
  const { pageIndex, pageSize, skip, take } = paginationOptions(pagination);
  const postId = postSchema.shape[EPostField.id].optional().parse(postId$);
  const parentCommentId = commentSchema.shape[ECommentField.id].optional().parse(parentCommentId$);
  const userId = userSchema.shape[EUserField.id].optional().parse(userId$);

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
    const likes = ratings.filter(r => r.score === ERatingScore.LIKE).length;
    const dislikes = ratings.filter(r => r.score === ERatingScore.DISLIKE).length;
    // Lấy rating của user hiện tại
    const ownRating = userId ? ratings.find(r => r.userId === userId)?.score : undefined;

    const { commentRatings, ...rest } = comment;
    return { ...rest, rating: { likes, dislikes }, ownRating };
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
