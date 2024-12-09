import { Socket as SocketIO } from "socket.io";
import { ENotificationEvent } from "../constants/notification-event.const";
import { NotificationSocketService } from "../services/notification-socket.service";
import { TSocketData } from "./socket-data.model";

export class Socket {
  socket!: SocketIO;
  constructor(socket: SocketIO) {
    this.socket = socket;
    /**
     * Thêm socket vào room của user (trường hợp một user có thể dùng nhiều thiết bị để kết nối).
     */
    const userId = NotificationSocketService.getSocketData(socket).userId;
    socket.join(`${userId}`);
    /**
     * Khởi tạo events
     */
    this.initEvents();
  }
  private initEvents() {
    console.log(`User ${(this.socket.data as TSocketData).userId} kết nối hợp lệ đến server notification!`);
    this.socket.on('disconnect', () => { console.log(`User ${this.socket.data.userId} disconnected.`) })
  }
  get data(): TSocketData {
    return this.socket.data as TSocketData
  }
}