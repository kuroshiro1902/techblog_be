import { Request, Response } from '@/types';
import { serverError } from '../../common/errors/serverError';
import { PostService } from '../services/post.service';
import { EPostField, POST_PUBLIC_FIELDS } from '../validators/post.schema';
import { EUserField } from '@/user/validators/user.schema';
import { STATUS_CODE } from '@/common/constants/StatusCode';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { TFindPostQuery } from '../services/queries/findMany.query';
import { parseNumeric } from '@/common/utils/parseNumeric.util';
import { CommentService } from '../services/comment.service';
import { createCommentSchema } from '../validators/comment.schema';

export const PostController = {
  async getPosts(req: Request<{}, {}, {
    search?: string,
    authorId?: string,
    categoryId?: string[] | string,
    pageIndex?: string,
    pageSize?: string,
    orderBy?: `${typeof POST_PUBLIC_FIELDS[number]}-${Prisma.SortOrder}`
  }>, res: Response) {
    try {
      const {
        search,
        authorId,
        pageIndex,
        pageSize,
        orderBy = '',
        categoryId: categoryIds,
      } = req.query;

      const isPublished: boolean | undefined = req.data?.[EPostField.isPublished];

      // Parse orderBy as an array of objects
      const [field, order] = orderBy.split('-');

      const query: TFindPostQuery = {
        pageIndex: +(pageIndex ?? 1),
        pageSize: +(pageSize ?? 12),
        input: {
          search,
          isPublished,
          authorId: authorId ? +authorId : undefined,
          categoryIds: Array.isArray(categoryIds) ? categoryIds.map((cid) => +cid) : categoryIds ? [+categoryIds] : []
        },
        orderBy: !!orderBy ? { field: field as any, order: order as any } : undefined,
      }
      const post = await PostService.findMany(query);

      res.json({ isSuccess: true, data: post });
    } catch (error) {
      return serverError(res, error);
    }
  },


  async getOwnPosts(req: Request, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      // @ts-ignore
      return PostController.getPosts({ ...req, query: { authorId: userId, orderBy: 'views-desc', pageSize: 4 } }, res);
    } catch (error) {
      return serverError(res, error);

    }
  },

  async getDetailPost(req: Request, res: Response) {
    try {
      console.log('REG.USER', req.user);

      const { slug } = req.query;
      const isPublished: boolean | undefined = req.data?.[EPostField.isPublished];

      if (typeof slug === 'string') {
        const post = await PostService.findUnique({
          input: { slug, isPublished }
        });
        if (!post) {
          res.json({
            isSuccess: false,
            message: 'Bài viết không tồn tại, vui lòng kiểm tra lại.',
          });
        } else {

          if (post.id && post.views >= 0 && post?.author?.id) {
            console.log('Tăng view');
            PostService.updateOne(post.id, { views: post.views + 1 }, post.author.id)
          }
          res.json({
            isSuccess: true,
            data: post,
          });
        }
      } else {
        throw new Error('Đường dẫn bài viết không đúng, vui lòng kiểm tra lại.');
      }
    } catch (error) {
      return serverError(res, error);
    }
  },

  async createPost(req: Request, res: Response) {
    try {
      const { data } = req.body;
      const authorId = req.user?.[EUserField.id];
      if (!authorId) {
        res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ isSuccess: false, message: 'Unauthorized.' });
        return;
      }
      const createdPost = await PostService.createOne(data, authorId);
      res.status(STATUS_CODE.CREATED).json({ isSuccess: true, data: createdPost });
    } catch (error) {
      return serverError(res, error);
    }
  },
  async updatePost(req: Request, res: Response) {
    try {
      const { data } = req.body;
      const authorId = req.user?.[EUserField.id];
      const postId = req.params.postId;
      if (!authorId) {
        res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ isSuccess: false, message: 'Unauthorized.' });
        return;
      }
      const updatedPost = await PostService.updateOne(+postId, data, authorId);
      res.status(STATUS_CODE.CREATED).json({ isSuccess: true, data: updatedPost });
    } catch (error) {
      return serverError(res, error);
    }
  },

  async getOwnRatingOfPost(req: Request<unknown, { postId?: string }>, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      const { postId = '' } = req.params;

      const rating = await PostService.findRatingOfUser(+postId, userId)
      return res.json({ isSuccess: true, data: rating });
    } catch (error) {
      return serverError(res, error);

    }
  },

  async ratingPost(req: Request<{ score?: number }, { postId?: string }>, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      const { score } = req.body;
      const { postId = '' } = req.params;
      const { data } = await PostService.rating(+postId, userId, score);
      return res.json({ isSuccess: true, data });
    } catch (error) {
      return serverError(res, error);
    }
  },

  // load comments
  async loadComments(req: Request<unknown, unknown, {
    postId?: string,
    parentCommentId?: string,
    pageIndex?: string,
    pageSize?: string
  }>, res: Response) {
    try {
      const query = parseNumeric(req.query, ['pageIndex', 'pageSize', 'postId', 'parentCommentId']);
      const data = await CommentService.loadComments(query);
      return res.json({ isSuccess: true, data });
    } catch (error) {
      return serverError(res, error);
    }
  },

  async createComment(req: Request, res: Response) {
    try {
      const { data } = req.body;
      const authorId = req.user?.[EUserField.id];
      if (!authorId) {
        res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ isSuccess: false, message: 'Unauthorized.' });
        return;
      }
      const createdComment = await CommentService.createComment(data, authorId);
      return res.json({ isSuccess: true, data: createdComment });
    } catch (error) {
      return serverError(res, error);
    }
  },

  async ratingComment(req: Request, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      const { score, commentId } = req.body;
      const { data } = await CommentService.ratingComment(commentId, userId, score);
      return res.json({ isSuccess: true, data });
    } catch (error) {
      return serverError(res, error);
    }
  }
};
