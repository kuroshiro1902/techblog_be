import { searchPosts } from './queries/search.query';
import { createOne } from './mutations/createOne.mutation';
import { updateOne } from './mutations/updateOne.mutation';
import { rating } from './mutations/rating.mutation';
import { findUnique } from './queries/findUnique.query';
import { findRatingOfUser } from './queries/findRatingOfUser.query';
import { findMany } from './queries/findMany.query';
import { restoreRevision } from './mutations/restoreRevision.mutation';
import { getPostRevisions } from './queries/getPostRevisions.query';

export const PostService = {
  searchPosts,
  findUnique,
  createOne,
  updateOne,
  rating,
  findRatingOfUser,
  findMany,
  restoreRevision,
  getPostRevisions
};
