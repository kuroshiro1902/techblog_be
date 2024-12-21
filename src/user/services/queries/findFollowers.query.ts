import { DB } from '@/database/database';
import { userSchema } from '@/user/validators/user.schema';
import { USER_PUBLIC_FIELDS_SELECT } from '@/user/validators/user.schema';

export const findFollowers = async (userId?: number) => {
  const validatedUserId = userSchema.shape.id.parse(userId);

  const followers = await DB.userFollow.findMany({
    where: { followingId: validatedUserId },
    select: {
      follower:
      {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  return followers.map((f) => f.follower);
}; 