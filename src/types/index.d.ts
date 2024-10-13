import User from '@/user/models/user';
import { Request as ERequest, Response as EResponse } from 'express';

export type Request<
  ReqBody = { [key: string]: any },
  Params = { [key: string]: string },
  ReqQuery = qs.ParsedQs
> = ERequest<Params, any, Partial<ReqBody>, ReqQuery> & {
  user?: User.TTokenPayload;
};
export interface ResponseBody<T = any> {
  isSuccess?: boolean;
  data?: T;
  message?: string;
}
export type Response<T = any> = EResponse<ResponseBody<T>>;
