import { Request, Response } from '@/types';
import { EPostField } from '../validators/post.schema';

export function publishedPost(req: Request, res: Response, next: any) {
  req.data = { ...req.data, [EPostField.isPublished]: true };
  next();
}
