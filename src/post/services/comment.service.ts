import { ratingComment } from './mutations/comment-rating.mutation';
import { createComment } from './mutations/createComment.mutation';
import { loadComments } from './queries/loadComment.query';
import { updateComment } from './mutations/updateComment.mutation';

export const CommentService = {
  loadComments,
  createComment,
  ratingComment,
  updateComment
}