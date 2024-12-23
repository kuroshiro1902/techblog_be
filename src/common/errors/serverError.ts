import { STATUS_CODE } from '@/common/constants/StatusCode';
import { Response } from 'express';

export const serverError = (res: Response, message?: string | any) => {
  const _message: string = (() => {
    if (message) {
      return typeof message === 'object'
        ? message?.issues?.[0]?.message || message?.message
        : message.trim();
    }
    return 'Có lỗi xảy ra! Vui lòng thử lại sau.';
  })();
  return res.status(STATUS_CODE.SERVER_ERROR).json({ isSuccess: false, message: _message });
};
