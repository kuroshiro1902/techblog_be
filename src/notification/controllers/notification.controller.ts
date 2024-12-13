import { STATUS_CODE } from "@/common/constants/StatusCode";
import { Request, Response } from "@/types";
import { EUserField } from "@/user/validators/user.schema";
import { NotificationService } from "../services/notification.service";
import { parseNumeric } from "@/common/utils/parseNumeric.util";
import { serverError } from "@/common/errors/serverError";

export const NotificationController = {
  async findUserNotifications(req: Request<unknown, unknown, {
    pageIndex?: string,
    pageSize?: string
  }>, res: Response) {
    try {
      const userId = req.user?.[EUserField.id]
      if (!userId) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ isSuccess: false, message: 'Unauthorized.' });
      }
      const { pageIndex, pageSize } = parseNumeric(req.query, ['pageIndex', 'pageSize']);
      const notifications = await NotificationService.findUserNotifications(userId, { pageIndex, pageSize });
      return res.json({ isSuccess: true, data: notifications })
    } catch (error) {
      return serverError(res);
    }
  },

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.[EUserField.id]
      if (!userId) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ isSuccess: false, message: 'Unauthorized.' });
      }

      const notificationId = +req.params.notificationId;
      const r = await NotificationService.markAsRead(notificationId, userId);
      return res.json({ isSuccess: true, data: r });
    } catch (error) {
      return serverError(res);
    }
  },
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.[EUserField.id]
      if (!userId) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ isSuccess: false, message: 'Unauthorized.' });
      }

      const r = await NotificationService.markAllAsRead(userId);
      return res.json({ isSuccess: true, data: r });
    } catch (error) {
      return serverError(res);
    }
  }
}