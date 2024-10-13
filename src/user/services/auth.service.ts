import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ENVIRONMENT } from '@/common/environments/environment';
import User from '../models/user';

const accessTokenExpiresIn = '3d';
// const accessTokenExpiresIn = '30m';
const refreshTokenExpiresIn = '7d';
const passwordSalt = ENVIRONMENT.passwordSalt;
export const AuthService = {
  hashPassword(password: string) {
    return bcrypt.hashSync(password, passwordSalt);
  },
  comparePassword(plainPassword: string, encryptedPassword: string) {
    return bcrypt.compareSync(plainPassword, encryptedPassword);
  },
  generateAccessToken(payload: User.TTokenPayload) {
    return jwt.sign(payload, ENVIRONMENT.secretKey, {
      expiresIn: accessTokenExpiresIn,
    });
  },
  generateRefreshToken(payload: User.TTokenPayload) {
    return jwt.sign(payload, ENVIRONMENT.refreshSecretKey, {});
  },
};
