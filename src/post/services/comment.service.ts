import { ratingComment } from './mutations/comment-rating.mutation';
import { createComment } from './mutations/createComment.mutation';
import { loadComments } from './queries/loadComment.query';
import { updateComment } from './mutations/updateComment.mutation';
import { deleteComment } from './mutations/deleteComment.mutation';

export const CommentService = {
  loadComments,
  createComment,
  ratingComment,
  updateComment,
  deleteComment
}