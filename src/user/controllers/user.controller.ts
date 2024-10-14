import { Request, Response } from '@/types';
import { serverError } from '../../common/errors/serverError';
import { STATUS_CODE } from '@/common/constants/StatusCode';
import { UserService } from '../services/user.service';
import { USER_PUBLIC_FIELDS, userSchema } from '../validators/user.schema';
import { TUserFindManyQuery } from '../services/queries/findMany.query';

export const UserController = {
  async getUserById(req: Request<{ userId: string }>, res: Response) {
    try {
      const _userId = userSchema.shape.id.parse(Number(req.params?.userId));

      const user = await UserService.findOne({
        input: { id: _userId },
        pageSize: 1,
        select: { roles: { id: false, name: true } },
      });
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

  async searchUsers(req: Request<TUserFindManyQuery>, res: Response) {
    try {
      const { input: rawInput, select: rawSelect, pageIndex, pageSize } = req.body;

      // prevent users search for private informations
      const select: TUserFindManyQuery['select'] = rawSelect
        ? { ...rawSelect, roles: { id: false, name: true }, username: false }
        : undefined;
      const input: TUserFindManyQuery['input'] = rawInput
        ? { ...rawInput, username: undefined, roles: undefined }
        : undefined;
      return await UserService.findMany({ input, select, pageIndex, pageSize });
    } catch (error) {
      return serverError(res, error);
    }
  },
};
