import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

/**
 * /auth
 */
const authRouter = Router();
authRouter.post('/login', AuthController.login);
authRouter.post('/signup', AuthController.signup);
// authRouter.post('/verify-token', authMiddleware, AuthController.verifyToken);
authRouter.post('/refresh-token', authMiddleware, AuthController.refreshToken);

export default authRouter;
