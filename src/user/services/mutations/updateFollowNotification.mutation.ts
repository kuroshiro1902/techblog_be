import { DB } from '@/database/database';
import { userSchema } from '@/user/validators/user.schema';
import { z } from 'zod';

export const updateFollowNotification = async (
  followerId?: number,
  followingId?: number,
  notification?: boolean
) => {
  const validatedFollowerId = userSchema.shape.id.parse(followerId);
  const validatedFollowingId = userSchema.shape.id.parse(followingId);
  const validatedNotification = z.boolean().parse(notification);

  const existingFollow = await DB.userFollow.findUnique({
    where: {
      followerId_followingId: {
        followerId: validatedFollowerId,
        followingId: validatedFollowingId,
      },
    },
  });

  if (!existingFollow) {
    throw new Error('Bạn chưa theo dõi người dùng này!');
  }

  const follow = await DB.userFollow.update({
    where: {
      followerId_followingId: {
        followerId: validatedFollowerId,
        followingId: validatedFollowingId,
      },
    },
    data: { notification: validatedNotification },
  });

  return follow;
}; 