import { STATUS_CODE } from '@/common/constants/StatusCode';
// import { Request, Response } from 'express';
import { serverError } from '../../common/errors/serverError';
import { Request, Response } from '@/types';
import { z } from 'zod';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { USER_PUBLIC_ATTRIBUTE, userSchema } from '../validators/user.schema';

const _LoginSchema = userSchema.pick({ username: true, password: true });

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
        fields: USER_PUBLIC_ATTRIBUTE,
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

  // async signup(req: Request, res: Response) {
  //   try {
  //     const { data, error } = User.userCreateSchema.safeParse(req.body);
  //     if (error) {
  //       return res
  //         .status(STATUS_CODE.INVALID_INPUT)
  //         .json({ isSuccess: false, message: error.message });
  //     }

  //     const { name, username, password, email, dob, avatarUrl, description } = data;

  //     const existedUser = await UserService.findOneBy({ username });
  //     if (existedUser) {
  //       return res
  //         .status(STATUS_CODE.CONFLICT)
  //         .json({ isSuccess: false, message: 'Tên đăng nhập đã tồn tại!' });
  //     }

  //     const hashedPassword = AuthService.hashPassword(password);

  //     const user: Omit<TUser, 'id'> = {
  //       name,
  //       username,
  //       description,
  //       password: hashedPassword,
  //       email,
  //       dob,
  //       avatarUrl,
  //     };

  //     const savedUser = await UserService.createUser(user);

  //     return res
  //       .status(STATUS_CODE.CREATED)
  //       .json({ isSuccess: true, data: User.dto(savedUser) });
  //   } catch (error) {
  //     return serverError(res, error);
  //   }
  // },

  // async verifyToken(req: Request, res: Response) {
  //   const userId = req.user?.id;
  //   const user = await UserService.findOneBy({ id: userId });
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
