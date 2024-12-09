import { AuthService } from "@/user/services/auth.service";
import { EUserField } from "@/user/validators/user.schema";
import { Socket } from "socket.io";
import { TSocketData } from "../models/socket-data.model";


export const NotificationSocketService = {
  verifyToken(socket: Socket) {
    const token = socket.handshake.auth.token as string | undefined;
    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      return false;
    }
    (socket.data as TSocketData).userId = decoded.id;
    return true;
  },
  getSocketData(socket: Socket) {
    return socket.data as TSocketData
  },
}