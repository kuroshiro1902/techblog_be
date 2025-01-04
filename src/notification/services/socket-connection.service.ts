import { Socket as SocketIO } from "socket.io";

export class SocketConnectionService {
  private static instance: SocketConnectionService;
  private userSocketMap: Map<number, SocketIO>;

  private constructor() {
    this.userSocketMap = new Map();
  }

  public static getInstance(): SocketConnectionService {
    if (!SocketConnectionService.instance) {
      SocketConnectionService.instance = new SocketConnectionService();
    }
    return SocketConnectionService.instance;
  }

  // public setUserSocket(userId: number, socket: SocketIO): void {
  //   const existingSocket = this.userSocketMap.get(userId);
  //   if (existingSocket) {
  //     // Ngắt kết nối cũ
  //     existingSocket.disconnect(true);
  //     console.log(`Disconnected existing socket for user ${userId}`);
  //   }
  //   // Lưu kết nối mới
  //   this.userSocketMap.set(userId, socket);
  //   console.log(`New socket connection saved for user ${userId}`);
  // }

  // public removeUserSocket(userId: number): void {
  //   this.userSocketMap.delete(userId);
  //   console.log(`Removed socket connection for user ${userId}`);
  // }

  // public getUserSocket(userId: number): SocketIO | undefined {
  //   return this.userSocketMap.get(userId);
  // }
} 