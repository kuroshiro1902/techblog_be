import { DB } from "@/database/database";
import { userSchema } from "@/user/validators/user.schema";
import { EUserField } from "@/user/validators/user.schema";

export const findUserFollow = async (userId$?: number, followingId$?: number) => {
  const followerId = userSchema.shape[EUserField.id].parse(userId$);
  const followingId = userSchema.shape[EUserField.id].parse(followingId$);
  const follow = await DB.userFollow.findFirst({ where: { followerId, followingId }, select: { id: true, updatedAt: true, notification: true } })
  return follow;
}