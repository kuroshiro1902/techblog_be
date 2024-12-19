import { z } from 'zod';
import { timestampSchema } from '@/common/models/timestamp/timestamp.type';
import { Prisma } from '@prisma/client';

export enum EUserFollowField {
  id = 'id',
  followerId = 'followerId',
  followingId = 'followingId',
  notification = 'notification',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt'
}

export const userFollowSchema = z.object({
  [EUserFollowField.id]: z.number().positive(),
  [EUserFollowField.followerId]: z.number().positive(),
  [EUserFollowField.followingId]: z.number().positive(),
  [EUserFollowField.notification]: z.boolean().default(true),
  ...timestampSchema()
});

export type TUserFollow = z.infer<typeof userFollowSchema>; 