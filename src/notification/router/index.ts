import { Router } from 'express';
import _notificationRouter from './notification.route';

const notificationRouter = Router();

notificationRouter.use('/notifications', _notificationRouter);

export default notificationRouter;
