import {
  paginationOptions,
  paginationSchema,
} from '@/common/models/pagination/pagination.model';
import { DB } from '@/database/database';
import { roleSchema } from '@/user/validators/role.schema';
import { EUserField, userSchema } from '@/user/validators/user.schema';
import { z } from 'zod';

// Định nghĩa schema cho truy vấn
const findManyQuerySelectSchema = z
  .object({
    [EUserField.id]: z.boolean().default(true),
    [EUserField.name]: z.boolean().default(true),
    [EUserField.username]: z.boolean().default(false),
    [EUserField.password]: z.boolean().default(false),
    [EUserField.email]: z.boolean().default(true),
    [EUserField.dob]: z.boolean().default(true),
    [EUserField.avatarUrl]: z.boolean().default(true),
    [EUserField.roles]: z.union([
      z.object({
        id: z.boolean().default(false),
        name: z.boolean().default(true),
      }),
      z.boolean().default(true),
    ]),
  })
  .optional();
const findManyQuerySchema = z.object({
  input: z
    .object({
      [EUserField.id]: userSchema.shape[EUserField.id].min(0).optional(),
      [EUserField.name]: userSchema.shape[EUserField.name].min(0).optional(),
      [EUserField.username]: userSchema.shape[EUserField.username].min(0).optional(),
      [EUserField.email]: userSchema.shape[EUserField.email].optional(),
      [EUserField.dob]: z
        .union([
          z
            .object({
              lte: userSchema.shape[EUserField.dob],
              eq: userSchema.shape[EUserField.dob],
              gte: userSchema.shape[EUserField.dob],
            })
            .partial()
            .optional(),
          userSchema.shape[EUserField.dob].optional(), // Hoặc là một số
        ])
        .optional(),
      [EUserField.roles]: roleSchema.pick({ name: true }).partial().optional(),
    })
    .partial()
    .optional(),
  select: findManyQuerySelectSchema,
  ...paginationSchema.shape,
});

export type TUserFindManyQuery = z.input<typeof findManyQuerySchema>;
export const findMany = async (query: TUserFindManyQuery) => {
  const parsedQuery = findManyQuerySchema.parse(query);
  const { input, pageIndex, pageSize, select } = parsedQuery;
  console.log({ query, parsedQuery });

  // PAGINATION
  const pagination = paginationOptions({ pageIndex, pageSize });

  // WHERE
  const where: Partial<Record<EUserField, any>> = {};
  if (input) {
    if (input[EUserField.id]) {
      where.id = input[EUserField.id];
    }
    if (input[EUserField.name]) {
      where.name = { contains: input[EUserField.name], mode: 'insensitive' };
    }
    if (input[EUserField.username]) {
      where.username = { contains: input[EUserField.username], mode: 'insensitive' };
    }
    if (input[EUserField.email]) {
      where.email = { contains: input[EUserField.email], mode: 'insensitive' };
    }
    if (input[EUserField.dob]) {
      if (typeof input[EUserField.dob] === 'object') {
        where.dob = {};
        if (input[EUserField.dob].lte) {
          where.dob.lte = input[EUserField.dob].lte;
        }
        if (input[EUserField.dob].eq) {
          where.dob.eq = input[EUserField.dob].eq;
        }
        if (input[EUserField.dob].gte) {
          where.dob.gte = input[EUserField.dob].gte;
        }
      } else {
        where.dob = input[EUserField.dob];
      }
    }
    if (input[EUserField.roles]) {
      where.roles = {
        some: {
          name: { in: input[EUserField.roles].name ? [input[EUserField.roles].name] : [] },
        },
      };
    }
  }

  // SELECT
  const selectFields: Partial<Record<EUserField, any>> = {};
  if (select) {
    selectFields.id = select.id;
    selectFields.name = select.name;
    selectFields.username = select.username;
    selectFields.email = select.email;
    selectFields.dob = select.dob;
    selectFields.avatarUrl = select.avatarUrl;
    selectFields.password = select.password;
    if (select.roles) {
      if (typeof select.roles === 'object') {
        selectFields.roles = {
          select:
            !select.roles.id && !select.roles.name
              ? { name: true }
              : {
                  id: select.roles.id ?? false,
                  name: select.roles.name ?? false,
                },
        };
      } else {
        selectFields.avatarUrl = select.roles;
      }
    }
  }
  console.log({
    where,
    select: selectFields,
    ...pagination,
  });

  const users = await DB.user.findMany({
    where,
    select: { ...selectFields, name: true },
    ...pagination,
  });
  return users;
};
