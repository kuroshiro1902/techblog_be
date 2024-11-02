import { env } from 'process';

export const ENVIRONMENT = Object.freeze({
  secretKey: env.SECRET_KEY!,
  refreshSecretKey: env.REFRESH_SECRET_KEY!,
  clientUrl: env.CLIENT_URL!,
  passwordSalt: +env.PASSWORD_SALT!,
  // cloudinary
  CLOUDINARY_NAME: env.CLOUDINARY_NAME!,
  CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET!,
  // elasticsearch
  ELASTIC_NODE: env.ELASTIC_NODE!,
  ELASTIC_AUTH_USERNAME: env.ELASTIC_AUTH_USERNAME!,
  ELASTIC_AUTH_PASSWORD: env.ELASTIC_AUTH_PASSWORD!,
  ELASTIC_POST_INDEX: env.ELASTIC_POST_INDEX!,
});
