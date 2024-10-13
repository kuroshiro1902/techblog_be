import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

/**
 * /user
 */
const userRouter = Router();
userRouter.get('/:userId', UserController.getUserById);

export default userRouter;
