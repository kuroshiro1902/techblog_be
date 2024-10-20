import { Router } from 'express';
import userRouter from './user/router';
import postRouter from './post/router';
import cloudRouter from './cloud/router';

const router = Router();

router.use(userRouter);
router.use(postRouter);
router.use(cloudRouter);

export default router;
