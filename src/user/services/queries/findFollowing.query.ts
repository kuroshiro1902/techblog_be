import { DB } from '@/database/database';
import { userSchema } from '@/user/validators/user.schema';
import { USER_PUBLIC_FIELDS_SELECT } from '@/user/validators/user.schema';

export const findFollowing = async (userId?: number) => {
  const validatedUserId = userSchema.shape.id.parse(userId);

  const following = await DB.userFollow.findMany({
    where: { followerId: validatedUserId },
    include: {
      following: {
        select: USER_PUBLIC_FIELDS_SELECT,
      },
    },
  });

  return following.map((f) => f.following);
}; 