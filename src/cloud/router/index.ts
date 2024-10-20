import { Router } from 'express';
import cloudinaryRouter from './cloudinary.route';

const cloudRouter = Router();
cloudRouter.use('/cloudinary', cloudinaryRouter);

export default cloudRouter;
