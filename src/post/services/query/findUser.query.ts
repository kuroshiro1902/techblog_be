import {
  paginationOptions,
  paginationSchema,
  TPagination,
} from '@/common/models/pagination/pagination.model';
import { userFieldSchema, userSchema } from '@/user/validators/user.schema';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const findUserQueryTypeSchema = z.enum(['AND', 'OR', 'and', 'or']).default('and');

const findUserQuerySchema = z.object({
  type: findUserQueryTypeSchema,
  fields: z.array(userFieldSchema).optional(),
  input: userSchema.omit({ roles: true, password: true }).partial(),
});

type TFindUserQuery = Partial<z.infer<typeof findUserQuerySchema>>;

const findUserQuery = (
  query?: TFindUserQuery,
  pagination?: TPagination
): Prisma.UserFindManyArgs => {
  const validatedQuery = findUserQuerySchema.parse(query);
  const paging = paginationOptions(paginationSchema.parse(pagination));

  // where
  const where: Prisma.UserWhereInput = {};
  const type = validatedQuery.type?.toUpperCase() as 'AND' | 'OR';
  const mode = 'insensitive';

  // Building the where query by filtering out undefined or empty values
  const whereQuery: Prisma.UserWhereInput = {
    id: query?.input?.id || undefined,
    name: query?.input?.name ? { contains: query?.input.name, mode } : undefined,
    email: query?.input?.email ? { contains: query?.input.email, mode } : undefined,
    username: query?.input?.username ? { contains: query?.input.username, mode } : undefined,
    dob: query?.input?.dob || undefined,
  };

  // Remove undefined or null values from the whereQuery
  const filteredWhereQuery = Object.fromEntries(
    Object.entries(whereQuery).filter(([_, value]) => value !== undefined)
  );

  // Apply the AND/OR logic
  if (type === 'OR') {
    where.OR = Object.keys(filteredWhereQuery).map((key) => ({
      [key]: filteredWhereQuery[key as keyof typeof filteredWhereQuery],
    }));
  } else if (type === 'AND') {
    where.AND = filteredWhereQuery;
  }

  // fields (select)
  const select = query?.fields
    ? query.fields.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {} as Record<string, boolean>)
    : undefined;

  return {
    where,
    ...paging,
    select: { ...select },
  };
};

export { TFindUserQuery, findUserQuery };
