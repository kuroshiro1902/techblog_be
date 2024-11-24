import { timestampSchema } from '@/common/models/timestamp/timestamp.type';
import { z } from 'zod';
import { ECommentRatingScore } from '../constants/comment-rating-score.const';

export const commentRatingSchema = z.object({
  score: z.number().int().min(ECommentRatingScore.DISLIKE).max(ECommentRatingScore.LIKE)
    .default(ECommentRatingScore.NONE),
  ...timestampSchema()
})

export type TCommentRating = {
  score?: number;
  updatedAt?: Date;
}; 