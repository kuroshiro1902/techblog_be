import {
  paginationOptions,
  paginationSchema,
  TPageInfo,
} from '@/common/models/pagination/pagination.model';
import { DB } from '@/database/database';
import { categorySchema, ECategoryField } from '@/category/validators/category.schema';
import {
  EPostField,
  POST_PUBLIC_FIELDS,
  postFieldSchema,
  postSchema,
  TPost,
} from '@/post/validators/post.schema';
import { EUserField, userSchema } from '@/user/validators/user.schema';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const findPostQuerySchema = z.object({
  fields: z.array(postFieldSchema).default(POST_PUBLIC_FIELDS),
  input: z.object({
    slug: z.string().trim().max(255).optional(),
    search: z.string().trim().max(255, 'Tìm kiếm tối đa 255 ký tự').toLowerCase().default(''),
    categoryIds: z.array(categorySchema.shape[ECategoryField.id]).default([]),
    authorId: userSchema.shape[EUserField.id].optional(),
    isPublished: postSchema.shape.isPublished,
  }),
  orderBy:
    z.object({
      field: z.enum([EPostField.id, EPostField.createdAt, EPostField.views]).default(EPostField.createdAt),
      order: z.nativeEnum(Prisma.SortOrder).default(Prisma.SortOrder.desc),
    })
      .default({ field: EPostField.createdAt, order: Prisma.SortOrder.desc }),
  ...paginationSchema.shape,
});


export type TFindPostQuery = Partial<z.input<typeof findPostQuerySchema>>;

export const findMany = async (query?: TFindPostQuery): Promise<{ data: TPost[], pageInfo: TPageInfo }> => {
  const validatedQuery = findPostQuerySchema.parse(query);
  const {
    input,
    fields,
    pageIndex: _pageIndex,
    pageSize: _pageSize,
    orderBy: orderCondition,
  } = validatedQuery;
  const { pageIndex, pageSize, skip, take } = paginationOptions({
    pageIndex: _pageIndex,
    pageSize: _pageSize,
  });

  const mode = 'insensitive';

  // WHERE
  const where: Prisma.PostWhereInput = { isPublished: input.isPublished };
  if (input.search) {
    where[EPostField.title] = { contains: input.search, mode };
    // where[EPostField.author] = { name: { contains: input.search, mode } };
  }
  if (input.authorId) {
    where[EPostField.author] = { id: input.authorId };
  }
  if (input.slug) {
    where[EPostField.slug] = { equals: input.slug, mode: 'default' };
  }
  if (input.categoryIds.length > 0) {
    where[EPostField.categories] = { some: { id: { in: input.categoryIds } } }
  }

  // SELECT
  const select: Prisma.PostSelect = (
    fields && fields.length > 0 ? fields : POST_PUBLIC_FIELDS
  ).reduce((prev, field) => ({ ...prev, [field]: true }), {} as Record<EPostField, true>);
  if (select.author) {
    select.author = { select: { [EUserField.id]: true, [EUserField.name]: true } };
  }
  if (select.categories) {
    select.categories = { select: { [ECategoryField.id]: true, [ECategoryField.name]: true } };
  }

  // ORDER BY
  const orderBy: Prisma.PostOrderByWithRelationInput = {
    [orderCondition.field]: orderCondition.order,
  };

  // Calculate totalCount to determine total pages and hasNextPage
  const totalCount = await DB.post.count({ where });
  const totalPage = Math.ceil(totalCount / pageSize);
  const hasNextPage = pageIndex < totalPage - 1;

  // Fetch posts
  const posts = await DB.post.findMany({ where, select, orderBy, take, skip });

  const postsWithAverageScore = await DB.rating.groupBy({
    by: ['postId'], //Tính trung bình đánh giá theo từng post
    _avg: {
      score: true
    },
    // orderBy: { _avg: { score: 'desc' } },
    where: { postId: { in: posts.map(p => p.id) } }
  });
  const postScore = postsWithAverageScore.reduce((prev, { _avg, postId }) => ({ ...prev, [postId]: _avg.score ?? 0 }), {} as { [postId: number]: number })
  console.log({ postsWithAverageScore });

  // Return data with pageInfo
  return {
    data: posts.map((p) => ({ ...p, rating: { score: postScore[p.id] } })),
    pageInfo: {
      pageIndex,
      pageSize,
      hasNextPage,
      totalPage,
    },
  };
};
