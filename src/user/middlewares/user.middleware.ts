import { Request, Response } from '@/types';
import jwt from 'jsonwebtoken';
import { STATUS_CODE } from '@/common/constants/StatusCode';
import { ENVIRONMENT } from '@/common/environments/environment';
import { TTokenPayload } from '../validators/user.schema';
import { NextFunction } from 'express';

/**
 * Lấy ra user từ token, nếu không có thì vẫn chuyển tiếp và hoạt động bình thường.
 */
export function userMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.header('Authorization');
  console.log({ token });
  if (token) {
    try {
      const decoded = jwt.verify(
        token?.replace('Bearer', '')?.replace('bearer', '')?.trim(),
        ENVIRONMENT.secretKey
      ) as TTokenPayload;

      req.user = decoded;
    } catch (error) {
    }
  }
  next();
}
