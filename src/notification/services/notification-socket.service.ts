import { AuthService } from "@/user/services/auth.service";
import { Socket } from "socket.io";
import { TSocketData } from "../models/socket-data.model";
import { SocketConnectionService } from "./socket-connection.service";

export const NotificationSocketService = {
  verifyToken(socket: Socket) {
    const token = socket.handshake.auth.token as string | undefined;
    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return false;
    }
    (socket.data as TSocketData).userId = decoded.id;
    return true;
  },

  getSocketData(socket: Socket) {
    return socket.data as TSocketData;
  },

  isUserConnected(userId: number): boolean {
    const socketConnectionService = SocketConnectionService.getInstance();
    return !!socketConnectionService.getUserSocket(userId);
  },

  emitToUser(userId: number, event: string, data: any): void {
    const socketConnectionService = SocketConnectionService.getInstance();
    const userSocket = socketConnectionService.getUserSocket(userId);
    if (userSocket) {
      userSocket.emit(event, data);
    }
  }
};