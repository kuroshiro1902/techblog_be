import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { roleSchema } from './role.schema';
import { ERoleName, ROLES } from '../constants/role.constant';
import { timestampSchema } from '@/common/models/timestamp/timestamp.type';

export const userSchema = z.object({
  id: z
    .number({ message: 'ID phải là chữ số lớn hơn 0.' })
    .max(Number.MAX_SAFE_INTEGER)
    .positive({ message: 'ID phải là chữ số lớn hơn 0.' }),
  name: z
    .string()
    .min(3, { message: 'Tên phải có ít nhất 3 ký tự.' })
    .max(255, { message: 'Tên tối đa 255 ký tự.' }),
  username: z
    .string()
    .min(6, { message: 'Tên đăng nhập phải có ít nhất 6 ký tự.' })
    .max(255, { message: 'Tên đăng nhập tối đa 255 ký tự.' }),
  password: z
    .string()
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' })
    .max(255, { message: 'Mật khẩu tối đa 255 ký tự.' }),
  description: z.string().max(1000, { message: 'Mô tả tối đa 1000 ký tự.' }).optional(),
  email: z
    .string()
    .email({ message: 'Email chưa đúng định dạng.' })
    .max(255, { message: 'Email tối đa 255 ký tự.' })
    .optional(),
  dob: z
    .number()
    .int()
    .positive({
      message: 'Ngày tháng năm sinh chưa đúng định dạng timestamp 10 chữ số.',
    })
    .optional(),
  avatarUrl: z
    .string()
    .url({ message: 'Url ảnh không đúng định dạng.' })
    .max(500, { message: 'Url tối đa 500 ký tự.' })
    .optional(),
  roles: z.array(roleSchema).default([ROLES[ERoleName.USER]]),
  ...timestampSchema(),
}) satisfies z.Schema<Prisma.UserUncheckedCreateWithoutRolesInput>;

export const userAttributeSchema = z.enum(userSchema.keyof()._def.values);

export type TUser = z.infer<typeof userSchema>;
export type TUserAttribute = z.infer<typeof userAttributeSchema>;
export type TTokenPayload = Pick<TUser, 'id'>;

export const USER_PUBLIC_ATTRIBUTE: TUserAttribute[] = [
  'id',
  'name',
  'avatarUrl',
  'email',
  'description',
  'dob',
  'roles',
  'createdAt',
  'updatedAt',
];
