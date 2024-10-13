import { z } from 'zod';
import { roleSchema, TRole } from '../role/role.type';
import { EUserRoleAssociation } from '@/user/constants/associations/user-role.constant';

export const userSchema = z.object({
  id: z.number().max(Number.MAX_SAFE_INTEGER).positive(),
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
  // Không cần validate roles ở đây vì nó chỉ được lấy ra chứ không cần validate,
  // hơn nữa việc truyền roleSchema vào đây sẽ gây ra circular dependency.
  // Tương tự với các quan hệ khác.
});

const SHAPE = userSchema.shape;

export const userCreateSchema = z.object({
  name: SHAPE.name,
  username: SHAPE.username,
  password: SHAPE.password,
  description: SHAPE.description.optional(),
  email: SHAPE.email.optional(),
  dob: SHAPE.dob.optional(),
  avatarUrl: SHAPE.avatarUrl.optional(),
});

// export const userUpdateSchema = z.object({
//   name: SHAPE.name.optional(),
//   password: SHAPE.password.optional(),
//   description: SHAPE.description.optional(),
//   email: SHAPE.email.optional(),
//   avatarUrl: SHAPE.avatarUrl.optional(),
//   dob: SHAPE.dob.optional(),
//   [EUserRoleAssociation.roleAssociationKey]: z.array(roleSchema.shape.id).optional(),
// });

export const userAttributeSchema = z.enum(userSchema.keyof()._def.values);

export type TUser = z.infer<typeof userSchema> & {
  // Cần chỉ định roles ở đây để đảm bảo user có đủ mọi thuộc tính, tương tự với các quan hệ khác
  [EUserRoleAssociation.roleAssociationKey]?: TRole[];
};
export type TUserAttribute =
  | z.infer<typeof userAttributeSchema>
  | EUserRoleAssociation.roleAssociationKey;
export type TUserCreate = z.infer<typeof userCreateSchema>;
// export type TUserUpdate = z.infer<typeof userUpdateSchema>;
export type TTokenPayload = Pick<TUser, 'id'>;
