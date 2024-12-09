import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ENVIRONMENT } from '@/common/environments/environment';
import { TTokenPayload } from '../validators/user.schema';

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
};
