import { paginationOptions, paginationSchema, TPageInfo } from "@/common/models/pagination/pagination.model";
import { DB } from "@/database/database";
import { ERatingScore } from "@/post/constants/rating-score.const";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import { Prisma, Rating } from "@prisma/client";
import { z } from "zod";

const findUserRatingsSchema = z.object({
  fields: z.array(z.string()).default(['id', 'score', 'createdAt', 'updatedAt', 'post']),
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

export type TFindUserRatingsQuery = Partial<z.input<typeof findUserRatingsSchema>>;

export const findUserRatings = async (
  query: TFindUserRatingsQuery
): Promise<{ data: Rating[], pageInfo: TPageInfo }> => {
  const validatedQuery = findUserRatingsSchema.parse(query);
  const { input, fields, pageIndex: _pageIndex, pageSize: _pageSize, orderBy } = validatedQuery;

  const { pageIndex, pageSize, skip, take } = paginationOptions({
    pageIndex: _pageIndex,
    pageSize: _pageSize,
  });

  // WHERE clause
  const where: Prisma.RatingWhereInput = { userId: input.userId, score: { not: ERatingScore.NONE } };

  // SELECT clause
  const select = fields.reduce(
    (prev, field) => ({ ...prev, [field]: true }),
    {} as Prisma.RatingSelect
  );
  if (select.post) {
    select.post = { select: { slug: true, title: true } }
    where.post = { isPublished: true }
  }

  // ORDER BY clause
  const orderByCondition: Prisma.RatingOrderByWithRelationInput = {
    [orderBy.field]: orderBy.order,
  };

  // Fetch ratings
  const ratings = await DB.rating.findMany({
    where,
    select,
    orderBy: orderByCondition,
    skip,
    take,
  });

  // Calculate total count
  const totalCount = await DB.rating.count({ where });
  const totalPage = Math.ceil(totalCount / pageSize);
  const hasNextPage = skip + ratings.length < totalCount;

  return {
    data: ratings,
    pageInfo: {
      pageIndex,
      pageSize,
      hasNextPage,
      totalPage,
    },
  };
};

