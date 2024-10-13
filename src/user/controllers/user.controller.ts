import { Request, Response } from '@/types';
import { serverError } from '../../common/errors/serverError';
import { STATUS_CODE } from '@/common/constants/StatusCode';
import { UserService } from '../services/user.service';
import { userSchema } from '../validators/user.schema';

export const UserController = {
  async getUserById(req: Request<{ userId: string }>, res: Response) {
    try {
      const _userId = userSchema.shape.id.parse(Number(req.params?.userId));

      const user = await UserService.findOne({ input: { id: _userId } });
      if (!user) {
        return res
          .status(STATUS_CODE.NOT_FOUND)
          .json({ isSuccess: false, message: 'User not found' });
      }
      return res.status(STATUS_CODE.SUCCESS).json({ isSuccess: true, data: user });
    } catch (error) {
      return serverError(res, error);
    }
  },
};
