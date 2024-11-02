import { Request, Response } from '@/types';
import { serverError } from '../../common/errors/serverError';
import { Prisma } from '@prisma/client';
import { CATEGORY_PUBLIC_FIELDS } from '../validators/category.schema';
import { CategoryService } from '../services/category.service';
import { STATUS_CODE } from '@/common/constants/StatusCode';

export const CategoryController = {
  async getCategories(req: Request<{}, {}, {
    search?: string,
    pageIndex?: number,
    pageSize?: number,
    orderBy?: `${typeof CATEGORY_PUBLIC_FIELDS[number]}:${Prisma.SortOrder}`
  }>, res: Response) {
    try {
      const {
        search,
        pageIndex,
        pageSize,
        orderBy
      } = req.query;

      const orderByQuery = orderBy?.split?.(':')
      const findResponse = await CategoryService.findMany({
        pageIndex: +(pageIndex ?? 1),
        pageSize: +(pageSize ?? 12),
        input: { search },
        orderBy: {
          field: orderByQuery?.[0] as any,
          order: orderByQuery?.[1] as any
        }
      });
      res.status(STATUS_CODE.SUCCESS).json({ isSuccess: true, data: findResponse });
    } catch (error) {
      return serverError(res, error);
    }
  },

  // async getDetailPost(req: Request, res: Response) {
  //   try {
  //     const { slug } = req.query;
  //     const isPublished: boolean = req.data?.[EPostField.isPublished] || true;
  //     if (typeof slug === 'string') {
  //       const findResponse = await PostService.findMany({
  //         pageIndex: 1,
  //         pageSize: 1,
  //         input: { isPublished, slug },
  //       });
  //       if (findResponse.data.length <= 0) {
  //         res.json({
  //           isSuccess: false,
  //           message: 'Bài viết không tồn tại, vui lòng kiểm tra lại.',
  //         });
  //       } else {
  //         res.json({
  //           isSuccess: true,
  //           data: findResponse.data?.[0],
  //         });
  //       }
  //     } else {
  //       throw new Error('Đường dẫn bài viết không đúng, vui lòng kiểm tra lại.');
  //     }
  //   } catch (error) {
  //     return serverError(res, error);
  //   }
  // },

  // async createPost(req: Request, res: Response) {
  //   try {
  //     const { data } = req.body;
  //     const authorId = req.user?.[EUserField.id];
  //     if (!authorId) {
  //       res
  //         .status(STATUS_CODE.UNAUTHORIZED)
  //         .json({ isSuccess: false, message: 'Unauthorized.' });
  //       return;
  //     }
  //     const createdPost = await PostService.createOne(data, authorId);
  //     res.status(STATUS_CODE.CREATED).json({ isSuccess: true, data: createdPost });
  //   } catch (error) {
  //     return serverError(res, error);
  //   }
  // },
};
