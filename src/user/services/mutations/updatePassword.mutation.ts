import { DB } from "@/database/database";
import { EUserField, TUserUpdateInput, USER_PUBLIC_FIELDS, USER_PUBLIC_FIELDS_SELECT, userSchema, userUpdateSchema } from "@/user/validators/user.schema";
import { AuthService } from "../auth.service";
import { findMany } from "../queries/findMany.query";
import { findUnique } from "../queries/findUnique.query";
import { z } from "zod";

export type TUserUpdatePassword = {
  oldPassword: string,
  newPassword: string
}

const userUpdatePasswordSchema = z.object({ oldPassword: userSchema.shape[EUserField.password], newPassword: userSchema.shape[EUserField.password] })

export const updatePassword = async (userId: number, input: TUserUpdatePassword) => {
  const { oldPassword, newPassword } = userUpdatePasswordSchema.parse(input);
  if (oldPassword !== newPassword) {
    throw new Error('Mật khẩu không khớp nhau.');
  }

  const existedUser = await findUnique(userId, { password: true });
  if (!existedUser) {
    throw new Error('Không tìm thấy người dùng!');
  }
  if (!AuthService.comparePassword(oldPassword, existedUser.password)) {
    throw new Error('Mật khẩu không đúng!');
  }
  const updatedUser = await DB.user.update({
    data: { password: AuthService.hashPassword(newPassword) },
    where: { id: userId },
    select: USER_PUBLIC_FIELDS_SELECT,
  });
  return updatedUser;
}