import { findMany } from './queries/findMany.query';
import { createOne } from './mutations/createOne.mutation';

export const PostService = {
  findMany,
  createOne
};
