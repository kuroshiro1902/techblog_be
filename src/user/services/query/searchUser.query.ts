import User from '@/user/models/user';
import { FindOptions, Op } from 'sequelize';
import { z } from 'zod';

const searchUserQuerySchema = z
  .object({
    id: User.userSchema.shape.id.optional(),
    name: User.userSchema.shape.name
      .min(1, { message: 'Tên người dùng muốn tìm kiếm tối thiểu 1 ký tự.' })
      .max(50, { message: 'Tên người dùng muốn tìm kiếm tối đa 50 ký tự' })
      .trim()
      .optional(),
    email: User.userSchema.shape.email.optional(),
  })
  .partial();

type TSearchUserQuery = z.infer<typeof searchUserQuerySchema>;

const searchUserQuery = (query?: TSearchUserQuery): FindOptions<User.TUser>['where'] => {
  const validatedQuery = searchUserQuerySchema.parse(query ?? {});

  const where: FindOptions<User.TUser>['where'] = {};

  if (validatedQuery.name && validatedQuery.name.trim()) {
    where.name = { [Op.iLike]: `%${validatedQuery.name.trim()}%` };
  }
  if (validatedQuery.email && validatedQuery.email.trim()) {
    where.email = { [Op.iLike]: `%${validatedQuery.email.trim()}%` };
  }
  if (validatedQuery.id) {
    where.id = { [Op.eq]: validatedQuery.id };
  }

  return where;
};

export { TSearchUserQuery, searchUserQuery };
