import { env } from 'process';

export const ENVIRONMENT = Object.freeze({
  secretKey: env.SECRET_KEY!,
  refreshSecretKey: env.REFRESH_SECRET_KEY!,
  // db: Object.freeze({
  //   uri: env.DB_URI!,
  //   dialect: env.DB_DIALECT!,
  //   host: env.DB_HOST!,
  //   port: +env.DB_PORT!,
  //   name: env.DB_NAME!,
  // }),
  clientUrl: env.CLIENT_URL!,
  passwordSalt: +env.PASSWORD_SALT!,
  CLOUDINARY_NAME: env.CLOUDINARY_NAME!,
  CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET!,
});
