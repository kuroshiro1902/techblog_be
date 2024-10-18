import { Router } from 'express';
import _postRouter from './post.route';

const postRouter = Router();

postRouter.use('/posts', _postRouter);

export default postRouter;
