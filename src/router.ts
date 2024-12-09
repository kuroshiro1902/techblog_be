import { Router } from 'express';
import userRouter from './user/router';
import postRouter from './post/router';
import cloudRouter from './cloud/router';
import categoryRouter from './category/router';
import notificationRouter from './notification/router';

const router = Router();

router.use(userRouter);
router.use(postRouter);
router.use(categoryRouter)
router.use(cloudRouter);
router.use(notificationRouter)

export default router;
