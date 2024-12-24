import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ENVIRONMENT } from '@/common/environments/environment';
import { TTokenPayload, userSchema, EUserField } from '../validators/user.schema';
import { UserService } from './user.service';
import { z } from 'zod';

const accessTokenExpiresIn = '3d';
// const accessTokenExpiresIn = '30m';
const refreshTokenExpiresIn = '7d';
const passwordSalt = ENVIRONMENT.passwordSalt;

export const AuthService = {
  verifyToken(token?: string) {
    if (!token) {
      return null;
    }
    const decoded = jwt.verify(
      token?.replace('Bearer', '')?.replace('bearer', '')?.trim(),
      ENVIRONMENT.secretKey
    ) as TTokenPayload;
    return decoded;
  },
  hashPassword(password: string) {
    return bcrypt.hashSync(password, passwordSalt);
  },
  comparePassword(plainPassword: string, encryptedPassword: string) {
    return bcrypt.compareSync(plainPassword, encryptedPassword);
  },
  generateAccessToken(payload: TTokenPayload) {
    return jwt.sign(payload, ENVIRONMENT.secretKey, {
      expiresIn: accessTokenExpiresIn,
    });
  },
  generateRefreshToken(payload: TTokenPayload) {
    return jwt.sign(payload, ENVIRONMENT.refreshSecretKey, {});
  },
  async signup(data: z.input<typeof userSchema>) {
    // Validate input data
    const { data: validatedData, error } = userSchema
      .omit({
        [EUserField.id]: true,
        [EUserField.createdAt]: true,
        [EUserField.roles]: true,
        [EUserField.updatedAt]: true,
      })
      .safeParse(data);

    if (error) {
      throw new Error(error.message);
    }

    const { name, username, password, email, dob, avatarUrl, description } = validatedData;

    // Kiểm tra username đã tồn tại
    const existedUser = await UserService.findOne({
      input: { username },
    });

    if (existedUser) {
      throw new Error('Tên đăng nhập đã tồn tại!');
    }

    // Hash password và tạo user mới
    const hashedPassword = this.hashPassword(password);

    const user = await UserService.createUser({
      name,
      username,
      description,
      password: hashedPassword,
      email,
      dob,
      avatarUrl,
    });

    return user;
  },
};
