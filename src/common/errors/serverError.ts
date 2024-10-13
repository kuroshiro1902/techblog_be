import { STATUS_CODE } from '@/common/constants/StatusCode';
import { Response } from 'express';

export const serverError = (res: Response, message?: string | any) => {
  const _message: string = (() => {
    if (message) {
      return typeof message === 'string' ? message.trim() : message?.issues?.[0]?.message;
    }
    return 'Internal Server Error! Try again later.';
  })();
  return res.status(STATUS_CODE.SERVER_ERROR).json({ isSuccess: false, message: _message });
};
