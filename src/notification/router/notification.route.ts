import { Router } from 'express';
import { authMiddleware } from '@/user/middlewares/auth.middleware';
import { NotificationController } from '../controllers/notification.controller';

/**
 * /notifications
 */
const notificationRouter = Router();
notificationRouter.get('/', authMiddleware, NotificationController.findUserNotifications);
notificationRouter.post('/read/:notificationId', authMiddleware, NotificationController.markAsRead);
notificationRouter.post('/read-all', authMiddleware, NotificationController.markAllAsRead);

export default notificationRouter;
