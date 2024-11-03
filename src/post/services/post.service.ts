import { findMany } from './queries/findMany.query';
import { createOne } from './mutations/createOne.mutation';
import { updateOne } from './mutations/updateOne.mutation';

export const PostService = {
  findMany,
  createOne,
  updateOne
};
