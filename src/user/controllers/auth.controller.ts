import { STATUS_CODE } from '@/common/constants/StatusCode';
// import { Request, Response } from 'express';
import { serverError } from '../../common/errors/serverError';
import { Request, Response } from '@/types';
import { z } from 'zod';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { EUserField, USER_PUBLIC_FIELDS, userSchema } from '../validators/user.schema';

const _LoginSchema = userSchema.pick({
  [EUserField.username]: true,
  [EUserField.password]: true,
});

const AuthController = {
  async login(req: Request<z.infer<typeof _LoginSchema>>, res: Response) {
    try {
      const { data, error } = _LoginSchema.safeParse(req.body);
      if (error) {
        return res
          .status(STATUS_CODE.INVALID_INPUT)
          .json({ isSuccess: false, message: error.message });
      }
      const { username, password } = data;
      const user = await UserService.findOne({
        input: { username },
        select: {
          ...USER_PUBLIC_FIELDS.reduce((p, c) => {
            return { ...p, [c]: true };
          }, {}),
          [EUserField.password]: true,
        } as any,
      });
      if (!user) {
        return res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ isSuccess: false, message: 'Người dùng không tồn tại!' });
      }
      if (!AuthService.comparePassword(password, user.password)) {
        return res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ isSuccess: false, message: 'Sai mật khẩu!' });
      }
      const token = AuthService.generateAccessToken({ id: user.id });
      const { username: _, password: __, ...userDto } = user;
      return res.json({
        isSuccess: true,
        data: { token, user: userDto },
      });
    } catch (error) {
      return serverError(res, error);
    }
  },

  async signup(req: Request, res: Response) {
    try {
      const { data, error } = userSchema
        .omit({
          [EUserField.id]: true,
          [EUserField.createdAt]: true,
          [EUserField.roles]: true,
          [EUserField.updatedAt]: true,
        })
        .safeParse(req.body);
      if (error) {
        return res
          .status(STATUS_CODE.INVALID_INPUT)
          .json({ isSuccess: false, message: error.message });
      }

      const { name, username, password, email, dob, avatarUrl, description } = data;

      const existedUser = await UserService.findOne({
        input: { username },
      });
      if (existedUser) {
        return res
          .status(STATUS_CODE.CONFLICT)
          .json({ isSuccess: false, message: 'Tên đăng nhập đã tồn tại!' });
      }

      const hashedPassword = AuthService.hashPassword(password);

      const user = {
        name,
        username,
        description,
        password: hashedPassword,
        email,
        dob,
        avatarUrl,
      };

      const savedUser = await UserService.createUser(user);

      return res.status(STATUS_CODE.CREATED).json({ isSuccess: true, data: savedUser });
    } catch (error) {
      return serverError(res, error);
    }
  },

  // async verifyToken(req: Request, res: Response) {
  //   const userId = req.user?.id;
  //   const user = await UserService.findOne({ input: userId });
  //   if (!user) {
  //     return res
  //       .status(STATUS_CODE.UNAUTHORIZED)
  //       .json({ isSuccess: false, message: 'User không tồn tại' });
  //   }
  //   return res.status(STATUS_CODE.SUCCESS).json({
  //     isSuccess: true,
  //     data: User.dto(user),
  //   });
  // },

  // async refreshToken(req: Request, res: Response) {
  //   try {
  //     const userId = req.user?.id;
  //     if (!userId) {
  //       return res
  //         .status(STATUS_CODE.UNAUTHORIZED)
  //         .json({ isSuccess: false, message: 'UNAUTHORIZED.' });
  //     }
  //     const user = await UserService.findOneBy({ id: userId });
  //     if (!user) {
  //       return res
  //         .status(STATUS_CODE.UNAUTHORIZED)
  //         .json({ isSuccess: false, message: 'Người dùng không tồn tại!' });
  //     }
  //     const token = AuthService.generateAccessToken({ id: user.id });
  //     return res.json({
  //       isSuccess: true,
  //       data: { token, user: User.dto(user) },
  //     });
  //   } catch (error) {
  //     return serverError(res, error);
  //   }
  // },
};

export default AuthController;
