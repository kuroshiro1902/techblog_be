import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { publishedPost } from '../middlewares/published-post.middleware';
import { authMiddleware } from '@/user/middlewares/auth.middleware';

/**
 * /posts
 */
const postRouter = Router();
postRouter.get('/detail', publishedPost, PostController.getDetailPost);
postRouter.get('/me', authMiddleware, PostController.getOwnPosts);
postRouter.post('/create', authMiddleware, PostController.createPost);
postRouter.put('/update/:postId', authMiddleware, PostController.updatePost)
postRouter.get('/', publishedPost, PostController.getPosts);

export default postRouter;
