import { Router } from 'express';
import authRouter from './auth.route';
import _userRouter from './user.route';

const userRouter = Router();

userRouter.use('/auth', authRouter);
userRouter.use('/user', _userRouter);

export default userRouter;
