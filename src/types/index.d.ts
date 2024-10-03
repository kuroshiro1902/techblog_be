import { ITokenPayload } from '@/user/models/user.model';
import { Request as ERequest, Response as EResponse } from 'express';

export type Request<
  ReqBody = { [key: string]: any },
  Params = { [key: string]: string },
  ReqQuery = qs.ParsedQs
> = ERequest<Params, any, Partial<ReqBody>, ReqQuery> & {
  user?: ITokenPayload;
};
export interface ResponseBody<T = any> {
  isSuccess?: boolean;
  data?: T;
  message?: string;
}
export type Response<T = any> = EResponse<ResponseBody<T>>;
