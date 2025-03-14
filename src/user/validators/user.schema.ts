import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { roleSchema } from './role.schema';
import { ERoleName, ROLES } from '../constants/role.constant';
import { timestampSchema } from '@/common/models/timestamp/timestamp.type';

export enum EUserField {
  id = 'id',
  name = 'name',
  username = 'username',
  password = 'password',
  description = 'description',
  email = 'email',
  dob = 'dob',
  avatarUrl = 'avatarUrl',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  roles = 'roles',
  posts = 'posts',
  comments = 'comments'
}

export const userFieldSchema = z.nativeEnum(EUserField);

export const userSchema = z.object({
  [EUserField.id]: z
    .number({ message: 'ID phải là chữ số nguyên lớn hơn 0.' })
    .int({ message: 'ID phải là chữ số nguyên lớn hơn 0.' })
    .max(Number.MAX_SAFE_INTEGER)
    .positive({ message: 'ID phải là chữ số nguyên lớn hơn 0.' }),
  [EUserField.name]: z
    .string()
    .min(3, { message: 'Tên phải có ít nhất 3 ký tự.' })
    .max(255, { message: 'Tên tối đa 255 ký tự.' }),
  [EUserField.username]: z
    .string()
    .min(6, { message: 'Tên đăng nhập phải có ít nhất 6 ký tự.' })
    .max(255, { message: 'Tên đăng nhập tối đa 255 ký tự.' }),
  [EUserField.password]: z
    .string()
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' })
    .max(255, { message: 'Mật khẩu tối đa 255 ký tự.' }),
  [EUserField.description]: z
    .string()
    .max(1000, { message: 'Mô tả tối đa 1000 ký tự.' })
    .nullable().optional(),
  [EUserField.email]: z
    .string()
    .email({ message: 'Email chưa đúng định dạng.' })
    .max(255, { message: 'Email tối đa 255 ký tự.' })
    .nullable().optional(),
  [EUserField.dob]: z
    .number()
    .int()
    .positive({
      message: 'Ngày tháng năm sinh chưa đúng định dạng timestamp 10 chữ số.',
    })
    .nullable().optional(),
  [EUserField.avatarUrl]: z
    .string()
    .url({ message: 'Url ảnh không đúng định dạng.' })
    .max(500, { message: 'Url tối đa 500 ký tự.' })
    .nullable().optional(),
  [EUserField.roles]: z.array(roleSchema).default([ROLES[ERoleName.USER]]),
  ...timestampSchema(),
}) satisfies z.Schema<Prisma.UserUncheckedCreateWithoutRolesInput>;
// export type TUser = z.infer<typeof userSchema>;

export type TTokenPayload = { [EUserField.id]: number };

export const USER_PUBLIC_FIELDS: EUserField[] = [
  EUserField.id,
  EUserField.name,
  EUserField.avatarUrl,
  EUserField.email,
  EUserField.description,
  EUserField.dob,
  EUserField.createdAt,
  EUserField.updatedAt,
  EUserField.roles,
];

export const USER_PUBLIC_FIELDS_SELECT: Prisma.UserSelect = USER_PUBLIC_FIELDS.reduce(
  (prev, f) => ({ ...prev, [f]: true }),
  {} as Prisma.UserSelect
);

export const userCreateSchema = userSchema
  .pick({
    [EUserField.name]: true,
    [EUserField.username]: true,
    [EUserField.password]: true,
    [EUserField.avatarUrl]: true,
    [EUserField.email]: true,
    [EUserField.description]: true,
    [EUserField.dob]: true,
  })
  .strict();

export const userUpdateSchema = userSchema
  .pick({
    [EUserField.name]: true,
    [EUserField.password]: true,
    [EUserField.avatarUrl]: true,
    [EUserField.email]: true,
    [EUserField.description]: true,
    [EUserField.dob]: true,
  })
  .partial()
  .strict()
export type TUserCreateInput = z.infer<typeof userCreateSchema>;
export type TUserUpdateInput = z.infer<typeof userUpdateSchema>;
