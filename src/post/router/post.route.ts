import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { publishedPost } from '../middlewares/published-post.middleware';
import { authMiddleware } from '@/user/middlewares/auth.middleware';
import { userMiddleware } from '@/user/middlewares/user.middleware';

/**
 * /posts
 */
const postRouter = Router();
postRouter.get('/detail', publishedPost, userMiddleware, PostController.getDetailPost);
postRouter.get('/me', authMiddleware, PostController.getOwnPosts);
postRouter.post('/create', authMiddleware, PostController.createPost);
postRouter.put('/update/:postId', authMiddleware, PostController.updatePost);
postRouter.get('/rating/:postId', authMiddleware, PostController.getOwnRatingOfPost)
postRouter.put('/rating/:postId', authMiddleware, publishedPost, PostController.ratingPost);
postRouter.post("/favorite/:postId", authMiddleware, PostController.addFavoritePost);
postRouter.get("/favorites", authMiddleware, PostController.getFavoritePosts);
postRouter.delete("/favorite/:postId", authMiddleware, PostController.deleteFavoritePost);
postRouter.get('/revisions', authMiddleware, PostController.getPostRevisions);
postRouter.post('/restore-revision', authMiddleware, PostController.restoreRevision);
postRouter.get('/', publishedPost, PostController.getPosts);

postRouter.get('/own-ratings', authMiddleware, PostController.getUserRatings);
postRouter.get('/own-comments', authMiddleware, PostController.getUserComments);

postRouter.post('/comment/create', authMiddleware, PostController.createComment);
postRouter.post('/comment/rating', authMiddleware, PostController.ratingComment);
postRouter.put('/comment/update', authMiddleware, PostController.updateComment);
postRouter.get('/comments', publishedPost, userMiddleware, PostController.loadComments);
postRouter.delete('/comments/:commentId', authMiddleware, PostController.deleteComment);

export default postRouter;
