import { ratingComment } from './mutations/comment-rating.mutation';
import { createComment } from './mutations/createComment.mutation';
import { loadComments } from './queries/loadComment.query';

export const CommentService = {
  loadComments,
  createComment,
  ratingComment
}