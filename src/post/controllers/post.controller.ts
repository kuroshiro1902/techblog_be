import { Request, Response } from '@/types';
import { serverError } from '../../common/errors/serverError';
import { PostService } from '../services/post.service';
import { EPostField, POST_PUBLIC_FIELDS } from '../validators/post.schema';
import { EUserField } from '@/user/validators/user.schema';
import { STATUS_CODE } from '@/common/constants/StatusCode';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { TFindPostQuery } from '../services/queries/findMany.query';

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
      const findResponse = await PostService.findMany(query);

      res.json({ isSuccess: true, data: findResponse });
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
          console.log('data0', findResponse.data[0]);

          if (findResponse.data[0].id && findResponse.data[0].views >= 0 && findResponse.data[0].author.id) {
            console.log('Tăng view');

            PostService.updateOne(findResponse.data[0].id, { views: findResponse.data[0].views + 1 }, findResponse.data[0].author.id)
          }
          res.json({
            isSuccess: true,
            data: findResponse.data[0],
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
