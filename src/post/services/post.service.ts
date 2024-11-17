import { findMany } from './queries/findMany.query';
import { createOne } from './mutations/createOne.mutation';
import { updateOne } from './mutations/updateOne.mutation';
import { rating } from './mutations/rating.mutation';
import { findUnique } from './queries/findUnique.query';
import { findRatingOfUser } from './queries/findRatingOfUser.query';

export const PostService = {
  findMany,
  findUnique,
  createOne,
  updateOne,
  rating,
  findRatingOfUser,
};
