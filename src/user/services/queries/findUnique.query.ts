import { DB } from "@/database/database";
import { EUserField, USER_PUBLIC_FIELDS_SELECT, userSchema } from "@/user/validators/user.schema";
import { Prisma } from "@prisma/client";

export const findUnique = async (userId?: number, select?: Prisma.UserSelect) => {
  const validatedUserId = userSchema.shape[EUserField.id].parse(userId);
  const me = await DB.user.findUnique({ where: { id: validatedUserId }, select: select ?? USER_PUBLIC_FIELDS_SELECT })
  return me;
}