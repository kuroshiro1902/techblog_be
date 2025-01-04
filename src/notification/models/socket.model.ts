import { Socket as SocketIO } from "socket.io";
import { ENotificationEvent } from "../constants/notification-event.const";
import { NotificationSocketService } from "../services/notification-socket.service";
import { TSocketData } from "./socket-data.model";
import { SocketConnectionService } from "../services/socket-connection.service";

export class Socket {
  socket!: SocketIO;
  private socketConnectionService: SocketConnectionService;

  constructor(socket: SocketIO) {
    this.socket = socket;
    this.socketConnectionService = SocketConnectionService.getInstance();
    const userId = NotificationSocketService.getSocketData(socket).userId;

    console.log(`User ${userId} attempting to connect to notification server`);

    // // Lưu socket connection mới (tự động ngắt kết nối cũ nếu có)
    // this.socketConnectionService.setUserSocket(userId, socket);

    // Join room của user
    socket.join(`${userId}`);

    // Khởi tạo events
    this.initializeEvents(userId);
  }

  private initializeEvents(userId: number): void {
    this.socket.on('disconnect', () => {
      // Khi disconnect, xóa socket khỏi map
      // this.socketConnectionService.removeUserSocket(userId);
      this.socket.leave(`${userId}`);
      console.log(`User ${userId} disconnected.`);
    });
  }

  get data(): TSocketData {
    return this.socket.data as TSocketData;
  }
}