import { Request, Response } from '@/types';
import { serverError } from '../../common/errors/serverError';
import { PostService } from '../services/post.service';
import { EPostField, POST_PUBLIC_FIELDS } from '../validators/post.schema';
import { EUserField } from '@/user/validators/user.schema';
import { STATUS_CODE } from '@/common/constants/StatusCode';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { TSearchPostQuery } from '../services/queries/search.query';
import { parseNumeric } from '@/common/utils/parseNumeric.util';
import { CommentService } from '../services/comment.service';
import { ERatingScore } from '../constants/rating-score.const';
import { SearchService } from '@/search/search.service';

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

      const query: TSearchPostQuery = {
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
      const post = await PostService.searchPosts(query);

      res.json({ isSuccess: true, data: post });
    } catch (error) {
      return serverError(res, error);
    }
  },


  async getOwnPosts(req: Request, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      const { pageIndex, pageSize, isPublished } = req.query;
      const query: TSearchPostQuery = {
        pageIndex: +(pageIndex ?? 1),
        pageSize: +(pageSize ?? 8),
        input: {
          authorId: userId,
          isPublished: isPublished === 'true'
        },
        orderBy: { field: EPostField.createdAt, order: 'desc' }
      };

      const posts = await PostService.findMany(query);
      res.json({ isSuccess: true, data: posts });
    } catch (error) {
      return serverError(res, error);
    }
  },

  async getDetailPost(req: Request, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      const { slug } = req.query;
      const isPublished: boolean | undefined = userId ? undefined : req.data?.[EPostField.isPublished];

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

          if (post.id && post?.author?.id) {
            console.log('Tăng view');
            PostService.updateOne(post.id, { views: (post.views ?? 0) + 1 }, post.author.id);
            if (userId) {
              // Đánh dấu người dùng đã xem post này rồi
              PostService.rating(post.id, userId, ERatingScore.NONE);
            }
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
      const { data, useCategorize } = req.body;
      const authorId = req.user?.[EUserField.id];
      if (!authorId) {
        res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ isSuccess: false, message: 'Unauthorized.' });
        return;
      }
      const createdPost = await PostService.createOne(data, authorId, useCategorize);
      res.status(STATUS_CODE.CREATED).json({ isSuccess: true, data: createdPost });
    } catch (error) {
      return serverError(res, error);
    }
  },
  async updatePost(req: Request, res: Response) {
    try {
      const { data, useCategorize } = req.body;
      const authorId = req.user?.[EUserField.id];
      const postId = req.params.postId;
      if (!authorId) {
        res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ isSuccess: false, message: 'Unauthorized.' });
        return;
      }
      const updatedPost = await PostService.updateOne(+postId, data, authorId, useCategorize);
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

  async getAllComments(req: Request<unknown, unknown, {
    pageIndex?: string,
    pageSize?: string,
    orderBy?: string
  }>, res: Response) {
    try {
      const { pageIndex, pageSize } = parseNumeric(req.query, ['pageIndex', 'pageSize']);
      const [field, order] = (req.query.orderBy as string || '').split('-');

      const comments = await CommentService.getAllComments({
        pageIndex,
        pageSize,
        orderBy: {
          field: field || 'createdAt' as any,
          order: order || 'desc' as any
        }
      });

      return res.json({
        isSuccess: true,
        data: comments
      });
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
      const userId = req.user?.[EUserField.id];
      const query = parseNumeric(req.query, ['pageIndex', 'pageSize', 'postId', 'parentCommentId']);
      const data = await CommentService.loadComments({ ...query, userId });
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
  },

  async updateComment(req: Request, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      const { data, commentId } = req.body;

      if (!userId) {
        return res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ isSuccess: false, message: 'Unauthorized.' });
      }

      const updatedComment = await CommentService.updateComment(
        +commentId,
        userId,
        data
      );

      return res.json({
        isSuccess: true,
        data: updatedComment
      });
    } catch (error) {
      return serverError(res, error);
    }
  },

  async deleteComment(req: Request, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      const { commentId } = req.params;
      if (!userId) {
        return res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ isSuccess: false, message: 'Invalid request' });
      }

      const result = await CommentService.deleteComment(
        +(commentId ?? ''),
        userId
      );

      return res.json({
        isSuccess: true,
        data: result
      });
    } catch (error) {
      return serverError(res, error);
    }
  },
  async restoreRevision(req: Request, res: Response) {
    try {
      const { revisionId } = req.body;
      const userId = req.user?.[EUserField.id];
      if (!userId) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ isSuccess: false, message: 'Unauthorized.' });
      }
      const restoredPost = await PostService.restoreRevision(revisionId, userId);
      return res.json({ isSuccess: true, data: restoredPost });
    } catch (error) {
      return serverError(res, error);
    }
  },

  async getPostRevisions(req: Request, res: Response) {
    try {
      const authorId = req.user?.[EUserField.id];
      const { pageIndex, pageSize, postId } = req.query;

      if (!authorId) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ isSuccess: false, message: 'Unauthorized.' });
      }

      const data = await PostService.getPostRevisions({
        postId: +(postId ?? ''),
        authorId,
        pageIndex: pageIndex ? +(pageIndex as string) : undefined,
        pageSize: pageSize ? +(pageSize as string) : undefined
      });

      res.json({
        isSuccess: true,
        data
      });
    } catch (error) {
      return serverError(res, error);
    }
  },

  async getUserRatings(req: Request<unknown, unknown, {
    pageIndex?: string,
    pageSize?: string
  }>, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      if (!userId) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ isSuccess: false, message: 'Unauthorized.' });
      }
      const { pageIndex, pageSize } = parseNumeric(req.query, ['pageIndex', 'pageSize']);

      const userRatings = await PostService.findUserRatings({ input: { userId }, pageIndex, pageSize })
      return res.json({ isSuccess: true, data: userRatings })
    } catch (error) {
      return serverError(res, error);

    }
  },
  async getUserComments(req: Request<unknown, unknown, {
    pageIndex?: string,
    pageSize?: string
  }>, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      if (!userId) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ isSuccess: false, message: 'Unauthorized.' });
      }
      const { pageIndex, pageSize } = parseNumeric(req.query, ['pageIndex', 'pageSize']);

      const userComments = await PostService.findUserComments({ input: { userId }, pageIndex, pageSize })
      return res.json({ isSuccess: true, data: userComments })
    } catch (error) {
      return serverError(res, error);

    }
  },
  async addFavoritePost(req: Request, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      if (!userId) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ isSuccess: false, message: 'Unauthorized.' });
      }
      const postId = +(req.params.postId);
      const favoritePost = await PostService.addFavoritePost(userId, postId);
      return res.status(201).json({
        isSuccess: true,
        data: favoritePost
      });
    } catch (error) {
      return serverError(res, error);
    }
  },
  // Xóa bài viết khỏi danh sách yêu thích
  async deleteFavoritePost(req: Request, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      if (!userId) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ isSuccess: false, message: 'Unauthorized.' });
      }
      const postId = +(req.params.postId);

      const result = await PostService.deleteFavoritePost({ userId, postId });
      return res.json({ isSuccess: true, data: result });
    } catch (error) {
      return serverError(res, error);
    }
  },
  // Lấy danh sách bài viết yêu thích của người dùng
  async getFavoritePosts(req: Request, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      if (!userId) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ isSuccess: false, message: 'Unauthorized.' });
      }
      const { pageIndex, pageSize } = req.query;
      const favoritePosts = await PostService.getFavoritePosts({
        userId,
        pageIndex: pageIndex ? +(pageIndex as string) : undefined,
        pageSize: pageSize ? +(pageSize as string) : undefined
      });
      return res.json({
        isSuccess: true,
        data: favoritePosts
      });
    } catch (error) {
      return serverError(res, error);
    }
  },
  async checkFavoritePost(req: Request, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];

      if (!userId) {
        return res.json({ isSuccess: true, data: null })
      }
      const postId = +(req.params.postId); // Lấy postId từ params

      const fav = await PostService.isFavoritePost(postId, userId);
      return res.json({
        isSuccess: true,
        data: fav
      });
    } catch (error) {
      return serverError(res, error);
    }
  },

  async changePostNotification(req: Request, res: Response) {
    try {
      const postId = +req.params.postId;
      const { notification } = req.body;
      const userId = req.user?.[EUserField.id];
      if (!userId) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ isSuccess: false, message: 'Unauthorized.' });
      }
      const fav = await PostService.changePostNotification(userId, postId, notification);
      return res.json({ isSuccess: true, data: fav })
    } catch (error) {
      return serverError(res, error);

    }
  },

  async getRecommendedPosts(req: Request, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      const limit = +(req.query.pageSize ?? 4);

      const posts = await SearchService.getRecommendedPosts(userId, limit);

      return res.json({
        isSuccess: true,
        data: posts
      });
    } catch (error) {
      return serverError(res, error);
    }
  },
  async getPostDescription(req: Request, res: Response) {
    try {
      const postId = +req.params.postId;
      const description = await PostService.getPostDescription(postId);
      return res.json({ isSuccess: true, data: description });
    } catch (error) {
      return serverError(res, error);
    }
  }
};
