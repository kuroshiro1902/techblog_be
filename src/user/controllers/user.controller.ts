import { Request, Response } from '@/types';
import { serverError } from '../../common/errors/serverError';
import { STATUS_CODE } from '@/common/constants/StatusCode';
import { UserService } from '../services/user.service';
import { EUserField, TUserUpdateInput, USER_PUBLIC_FIELDS, userSchema } from '../validators/user.schema';
import { TUserFindManyQuery } from '../services/queries/findMany.query';

export const UserController = {
  async getUserById(req: Request<{ userId: string }>, res: Response) {
    try {
      const _userId = userSchema.shape.id.parse(+(req.params?.userId));

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

  async getMe(req: Request, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      const me = await UserService.findUnique(userId);
      return res.json({ isSuccess: true, data: me })
    } catch (error) {
      return serverError(res, error);
    }
  },

  async updateMeExceptPassword(req: Request, res: Response) {
    try {
      const userId = req.user?.[EUserField.id];
      const { data } = req.body;
      const updatedUser = await UserService.updateOneExceptPassword(userId, data);
      return res.status(STATUS_CODE.SUCCESS).json({ isSuccess: true, data: updatedUser })
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
      const users = await UserService.findMany({ input, select, pageIndex, pageSize });
      return res.status(STATUS_CODE.SUCCESS).json({ isSuccess: true, data: users })
    } catch (error) {
      return serverError(res, error);
    }
  },

};
