import { Request, Response } from '@/types';
import { serverError } from '../../common/errors/serverError';
import { PostService } from '../services/post.service';
import { EPostField, POST_PUBLIC_FIELDS } from '../validators/post.schema';
import { EUserField } from '@/user/validators/user.schema';
import { STATUS_CODE } from '@/common/constants/StatusCode';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export const PostController = {
  async getPosts(req: Request<{}, {}, {
    search?: string,
    author?: string,
    pageIndex?: number,
    pageSize?: number,
    orderBy?: `${typeof POST_PUBLIC_FIELDS[number]}:${Prisma.SortOrder}`
  }>, res: Response) {
    try {
      const {
        search,
        author,
        pageIndex,
        pageSize,
        orderBy
      } = req.query;

      const isPublished: boolean = req.data?.[EPostField.isPublished] || true;
      const orderByQuery = orderBy?.split?.(':')
      const findResponse = await PostService.findMany({
        pageIndex: +(pageIndex ?? 1),
        pageSize: +(pageSize ?? 12),
        input: { search, author, isPublished, },
        orderBy: {
          field: orderByQuery?.[0] as any,
          order: orderByQuery?.[1] as any
        }
      });
      res.json({ isSuccess: true, data: findResponse });
    } catch (error) {
      return serverError(res, error);
    }
  },

  async getDetailPost(req: Request, res: Response) {
    try {
      const { slug } = req.query;
      const isPublished: boolean = req.data?.[EPostField.isPublished] || true;
      if (typeof slug === 'string') {
        const findResponse = await PostService.findMany({
          pageIndex: 1,
          pageSize: 1,
          input: { isPublished, slug },
        });
        if (findResponse.data.length <= 0) {
          res.json({
            isSuccess: false,
            message: 'Bài viết không tồn tại, vui lòng kiểm tra lại.',
          });
        } else {
          res.json({
            isSuccess: true,
            data: findResponse.data?.[0],
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
};
