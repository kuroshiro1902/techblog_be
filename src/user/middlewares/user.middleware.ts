import { Request, Response } from '@/types';
import jwt from 'jsonwebtoken';
import { STATUS_CODE } from '@/common/constants/StatusCode';
import { ENVIRONMENT } from '@/common/environments/environment';
import { TTokenPayload } from '../validators/user.schema';
import { NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

/**
 * Lấy ra user từ token, nếu không có thì vẫn chuyển tiếp và hoạt động bình thường.
 */
export function userMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.header('Authorization');
  if (token) {
    try {
      const decoded = AuthService.verifyToken(token);

      if (decoded) {
        req.user = decoded;
      }
    } catch (error) {
    }
  }
  next();
}
