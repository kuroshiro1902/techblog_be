import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { publishedPost } from '../middlewares/published-post.middleware';

/**
 * /posts
 */
const postRouter = Router();
postRouter.get('/', publishedPost, PostController.getPosts);
postRouter.get('/detail', publishedPost, PostController.getDetailPost);

export default postRouter;
