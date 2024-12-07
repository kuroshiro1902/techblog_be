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
meRouter.put('/update-password', UserController.updatePassword)

userRouter.use('/me', authMiddleware, meRouter)
userRouter.post('/search', UserController.searchUsers);
userRouter.get('/:userId', UserController.getUserById);

export default userRouter;
