import { z } from 'zod';
import { paginationSchema, paginationOptions, TPageInfo } from '@/common/models/pagination/pagination.model';
import { userSchema, EUserField } from '@/user/validators/user.schema';
import { Comment, Prisma } from '@prisma/client';
import { DB } from '@/database/database';

const findUserCommentsSchema = z.object({
  fields: z.array(z.string()).default(['id', 'content', 'createdAt', 'updatedAt', 'post']),
  input: z.object({
    userId: userSchema.shape[EUserField.id],
  }),
  orderBy: z
    .object({
      field: z.enum(['createdAt', 'updatedAt']).default('updatedAt'),
      order: z.nativeEnum(Prisma.SortOrder).default(Prisma.SortOrder.desc),
    })
    .default({ field: 'updatedAt', order: Prisma.SortOrder.desc }),
  ...paginationSchema.shape,
});

export type TFindUserCommentsQuery = Partial<z.input<typeof findUserCommentsSchema>>;

export const findUserComments = async (
  query: TFindUserCommentsQuery
): Promise<{ data: Comment[], pageInfo: TPageInfo }> => {
  const validatedQuery = findUserCommentsSchema.parse(query);
  const { input, fields, pageIndex: _pageIndex, pageSize: _pageSize, orderBy } = validatedQuery;

  const { pageIndex, pageSize, skip, take } = paginationOptions({
    pageIndex: _pageIndex,
    pageSize: _pageSize,
  });

  // WHERE clause
  const where: Prisma.CommentWhereInput = { userId: input.userId };

  // SELECT clause
  const select = fields.reduce(
    (prev, field) => ({ ...prev, [field]: true }),
    {} as Prisma.CommentSelect
  );
  if (select.post) {
    select.post = { select: { slug: true, title: true } }
    where.post = { isPublished: true }
  }

  // ORDER BY clause
  const orderByCondition: Prisma.CommentOrderByWithRelationInput = {
    [orderBy.field]: orderBy.order,
  };

  // Fetch comments
  const comments = await DB.comment.findMany({
    where,
    select,
    orderBy: orderByCondition,
    skip,
    take,
  });

  // Calculate total count
  const totalCount = await DB.comment.count({ where });
  const totalPage = Math.ceil(totalCount / pageSize);
  const hasNextPage = skip + comments.length < totalCount;

  return {
    data: comments,
    pageInfo: {
      pageIndex,
      pageSize,
      hasNextPage,
      totalPage,
    },
  };
};
