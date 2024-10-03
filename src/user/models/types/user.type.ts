import { z } from 'zod';
import { roleSchema } from './role.type';

export const userSchema = z.object({
  id: z.number().positive(),
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
  roles: z.array(roleSchema).optional(),
});

export const userUpdateSchema = z.object({
  name: userSchema.shape.name.optional(),
  password: userSchema.shape.password.optional(),
  email: userSchema.shape.email.optional(),
  avatarUrl: userSchema.shape.avatarUrl.optional(),
  roles: userSchema.shape.roles.optional(),
});

export type IUser = z.infer<typeof userSchema>;
