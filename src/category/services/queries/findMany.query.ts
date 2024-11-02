import {
  paginationOptions,
  paginationSchema,
  TPageInfo,
} from '@/common/models/pagination/pagination.model';
import { DB } from '@/database/database';
import { ECategoryField } from '@/category/validators/category.schema';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const findCategoryQuerySchema = z.object({
  input: z.object({
    search: z.string().trim().max(255, 'Tìm kiếm tối đa 255 ký tự').default(''),
  }),
  orderBy: z
    .object({
      field: z.enum([ECategoryField.id, ECategoryField.createdAt, ECategoryField.name]).default(ECategoryField.name),
      order: z.nativeEnum(Prisma.SortOrder).default(Prisma.SortOrder.asc),
    })
    .default({ field: ECategoryField.name, order: Prisma.SortOrder.asc }),
  ...paginationSchema.shape,
});

export type TFindCategoryQuery = Partial<z.input<typeof findCategoryQuerySchema>>;

export const findMany = async (query?: TFindCategoryQuery) => {
  const validatedQuery = findCategoryQuerySchema.parse(query);
  const {
    input,
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
  const where: Prisma.CategoryWhereInput = {};
  if (input.search) {
    where[ECategoryField.name] = { contains: input.search, mode };
  }

  // SELECT

  // ORDER BY
  const orderBy: Prisma.CategoryOrderByWithRelationInput = { [orderCond.field]: orderCond.order };

  // Calculate totalCount to determine total pages and hasNextPage
  const totalCount = await DB.category.count({ where });
  const totalPage = Math.ceil(totalCount / pageSize);
  const hasNextPage = pageIndex < totalPage - 1;

  // Fetch - Lấy ra category con - độ sâu: 2 cấp
  const categories = await DB.category.findMany({ where, include: { children: { include: { children: true } } }, orderBy, take, skip });

  // Return data with pageInfo
  return {
    data: categories,
    pageInfo: {
      pageIndex,
      pageSize,
      hasNextPage,
      totalPage,
    } as TPageInfo,
  };
};
