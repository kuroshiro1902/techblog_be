import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

/**
 * /user
 */
const userRouter = Router();

/**
 * user/me
 */
const meRouter = Router();
meRouter.get('', UserController.getMe);
meRouter.put('/update', UserController.updateMeExceptPassword);
meRouter.put('/update-password', UserController.updatePassword);
meRouter.get('/follow/:userId', UserController.getUserFollow);

// Follow routes
userRouter.post('/follow/:userId', authMiddleware, UserController.followUser);
userRouter.put('/follow/notification/:userId', authMiddleware, UserController.updateFollowNotification);
userRouter.get('/followers/:userId', UserController.getFollowers);
userRouter.get('/following/:userId', UserController.getFollowing);

userRouter.use('/me', authMiddleware, meRouter);
userRouter.get('/profile/:userId', UserController.getUserProfile);
userRouter.post('/search', UserController.searchUsers);
userRouter.get('/:userId', UserController.getUserById);

export default userRouter;
