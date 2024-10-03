import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ENVIRONMENT } from '@/common/environments/environment';
import { ITokenPayload } from '../models/user.model';

const accessTokenExpiresIn = '7d';
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
  generateAccessToken(payload: ITokenPayload) {
    return jwt.sign(payload, ENVIRONMENT.secretKey, {
      expiresIn: accessTokenExpiresIn,
    });
  },
  generateRefreshToken(payload: ITokenPayload) {
    return jwt.sign(payload, ENVIRONMENT.refreshSecretKey, {});
  },
};
