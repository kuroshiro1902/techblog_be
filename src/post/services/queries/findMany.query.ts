import {
  paginationOptions,
  paginationSchema,
  TPageInfo,
} from '@/common/models/pagination/pagination.model';
import { DB } from '@/database/database';
import {
  EPostField,
  POST_PUBLIC_FIELDS,
  postFieldSchema,
  postSchema,
} from '@/post/validators/post.schema';
import { EUserField, userSchema } from '@/user/validators/user.schema';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const findPostQuerySchema = z.object({
  fields: z.array(postFieldSchema).default(POST_PUBLIC_FIELDS),
  input: z.object({
    slug: z.string().trim().max(255).optional(),
    search: z.string().trim().max(255, 'Tìm kiếm tối đa 255 ký tự').trim().default(''),
    author: z.string().max(255, 'Tên tác giả tối đa 255 ký tự').trim().default(''),
    isPublished: postSchema.shape.isPublished,
  }),
  orderBy: z
    .object({
      field: z.enum([EPostField.id, EPostField.createdAt]).default(EPostField.createdAt),
      order: z.nativeEnum(Prisma.SortOrder).default(Prisma.SortOrder.desc),
    })
    .default({ field: EPostField.createdAt, order: Prisma.SortOrder.desc }),
  ...paginationSchema.shape,
});

export type TFindPostQuery = Partial<z.input<typeof findPostQuerySchema>>;

export const findMany = async (query?: TFindPostQuery) => {
  const validatedQuery = findPostQuerySchema.parse(query);
  const {
    input,
    fields,
    pageIndex: _pageIndex,
    pageSize: _pageSize,
    orderBy: orderCond,
  } = validatedQuery;
  const { pageIndex, pageSize, skip, take } = paginationOptions({
    pageIndex: _pageIndex,
    pageSize: _pageSize,
  });

  const mode = 'insensitive';

  // WHERE
  const where: Prisma.PostWhereInput = { isPublished: input.isPublished || true };
  if (input.search) {
    where[EPostField.title] = { contains: input.search, mode };
  }
  if (input.author) {
    where[EPostField.author] = { name: { contains: input.author, mode } };
  }
  if (input.slug) {
    where[EPostField.slug] = { equals: input.slug, mode: 'default' };
  }

  // SELECT
  const select: Record<EPostField, any> = (
    fields && fields.length > 0 ? fields : POST_PUBLIC_FIELDS
  ).reduce((prev, field) => ({ ...prev, [field]: true }), {} as Record<EPostField, true>);
  if (select.author) {
    select.author = { select: { [EUserField.id]: true, [EUserField.name]: true } };
  }

  // ORDER BY
  const orderBy: Prisma.PostOrderByWithRelationInput = { [orderCond.field]: orderCond.order };

  // Calculate totalCount to determine total pages and hasNextPage
  const totalCount = await DB.post.count({ where });
  const totalPage = Math.ceil(totalCount / pageSize);
  const hasNextPage = pageIndex < totalPage - 1;

  console.log('aaaa', { fields, select });

  // Fetch posts
  const posts = await DB.post.findMany({ where, select, orderBy, take, skip });

  // Return data with pageInfo
  return {
    data: posts,
    pageInfo: {
      pageIndex,
      pageSize,
      hasNextPage,
      totalPage,
    } as TPageInfo,
  };
};
