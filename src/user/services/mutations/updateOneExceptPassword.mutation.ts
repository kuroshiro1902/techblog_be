import { DB } from "@/database/database";
import { EUserField, TUserUpdateInput, USER_PUBLIC_FIELDS, USER_PUBLIC_FIELDS_SELECT, userSchema, userUpdateSchema } from "@/user/validators/user.schema";
import { AuthService } from "../auth.service";
import { findMany } from "../queries/findMany.query";
import { findUnique } from "../queries/findUnique.query";

export const updateOneExceptPassword = async (userId?: number, user?: TUserUpdateInput) => {
  const validatedUserId = userSchema.shape[EUserField.id].parse(userId);
  const { password, ...validatedUser } = userUpdateSchema.parse(user);
  const existedUser = await findUnique(validatedUserId, { password: true });
  if (!existedUser) {
    throw new Error('Không tìm thấy người dùng!');
  }
  if (!AuthService.comparePassword(password ?? '', existedUser.password)) {
    throw new Error('Mật khẩu không đúng!');
  }
  const updatedUser = await DB.user.update({
    data: validatedUser,
    where: { id: validatedUserId },
    select: USER_PUBLIC_FIELDS_SELECT,
  });
  return updatedUser;
}