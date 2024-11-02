import { Router } from 'express';
import userRouter from './user/router';
import postRouter from './post/router';
import cloudRouter from './cloud/router';
import categoryRouter from './category/router';

const router = Router();

router.use(userRouter);
router.use(postRouter);
router.use(categoryRouter)
router.use(cloudRouter);

export default router;
