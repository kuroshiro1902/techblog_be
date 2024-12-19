import { DB } from '@/database/database';
import { userSchema } from '@/user/validators/user.schema';
import { z } from 'zod';

export const followUser = async (followerId?: number, followingId?: number, follow?: boolean) => {
  const validatedFollowerId = userSchema.shape.id.parse(followerId);
  const validatedFollowingId = userSchema.shape.id.parse(followingId);
  const validatedFollow = z.union([z.boolean(), z.string().regex(/true|false/)]).parse(follow);

  if (validatedFollowerId === validatedFollowingId) {
    throw new Error('Không thể tự theo dõi chính mình!');
  }

  if (!validatedFollow) {
    const existingFollow = await DB.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: validatedFollowerId,
          followingId: validatedFollowingId,
        },
      },
    });

    if (existingFollow) {
      throw new Error('Bạn đã theo dõi người dùng này!');
    }

    const unfollow = await DB.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId: validatedFollowerId,
          followingId: validatedFollowingId,
        },
      },
    });

    return unfollow;
  }
  else {
    const follow = await DB.userFollow.create({
      data: {
        followerId: validatedFollowerId,
        followingId: validatedFollowingId,
        notification: true,
      },
    });

    return follow;
  }
}; 