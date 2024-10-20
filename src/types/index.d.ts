import { TTokenPayload } from '@/user/validators/user.schema';
import { Request as ERequest, Response as EResponse } from 'express';

export type Request<
  ReqBody = { [key: string]: any },
  Params = { [key: string]: string },
  ReqQuery = qs.ParsedQs
> = ERequest<Params, any, Partial<ReqBody>, ReqQuery> & {
  user?: TTokenPayload;
  data?: { [key: string]: any };
};
export interface ResponseBody<T = any> {
  isSuccess?: boolean;
  data?: T;
  message?: string;
}
export type Response<T = any> = EResponse<ResponseBody<T>>;
