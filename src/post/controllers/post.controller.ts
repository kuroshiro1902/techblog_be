import { Request, Response } from '@/types';
import { serverError } from '../../common/errors/serverError';
import { PostService } from '../services/post.service';
import { EPostField } from '../validators/post.schema';

export const PostController = {
  async getPosts(req: Request, res: Response) {
    try {
      const {
        search: _search,
        author: _author,
        pageIndex: _pageIndex,
        pageSize: _pageSize,
      } = req.query;

      const isPublished: boolean = req.data?.[EPostField.isPublished] || true;
      let search: string = '',
        author: string = '',
        pageIndex: number | undefined = undefined,
        pageSize: number | undefined = undefined;
      if (typeof _search === 'string') {
        search = _search;
      }
      if (typeof _author === 'string') {
        author = _author;
      }
      if (typeof _pageIndex === 'string') {
        pageIndex = isNaN(+_pageIndex) ? 1 : +_pageIndex;
      }
      if (typeof _pageSize === 'string') {
        pageSize = isNaN(+_pageSize) ? 0 : +_pageSize;
      }
      const findResponse = await PostService.findMany({
        pageIndex,
        pageSize,
        input: { search, author, isPublished },
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
    // Hàm sinh id ngẫu nhiên và gắn vào slug của post, cắt title để tổng độ dài của slug = title (đã mã hóa) + random_id <= 255
  },
};
