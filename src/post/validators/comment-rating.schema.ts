import { timestampSchema } from '@/common/models/timestamp/timestamp.type';
import { z } from 'zod';
import { ERatingScore } from '../constants/rating-score.const';

export const commentRatingSchema = z.object({
  score: z.number().int().min(ERatingScore.DISLIKE).max(ERatingScore.LIKE)
    .default(ERatingScore.NONE),
  ...timestampSchema()
})

export type TCommentRating = {
  score?: number;
  updatedAt?: Date;
}; 