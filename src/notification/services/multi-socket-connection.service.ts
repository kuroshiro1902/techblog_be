import { Socket as SocketIO } from "socket.io";

export class MultiSocketConnectionService {
  private static instance: MultiSocketConnectionService;
  private userSocketsMap: Map<number, Set<SocketIO>>;

  private constructor() {
    this.userSocketsMap = new Map();
  }

  public static getInstance(): MultiSocketConnectionService {
    if (!MultiSocketConnectionService.instance) {
      MultiSocketConnectionService.instance = new MultiSocketConnectionService();
    }
    return MultiSocketConnectionService.instance;
  }

  public addUserSocket(userId: number, socket: SocketIO): void {
    let userSockets = this.userSocketsMap.get(userId);

    if (!userSockets) {
      userSockets = new Set();
      this.userSocketsMap.set(userId, userSockets);
    }

    userSockets.add(socket);
    console.log(`New socket connection added for user ${userId}. Total connections: ${userSockets.size}`);
  }

  public removeUserSocket(userId: number, socket: SocketIO): void {
    const userSockets = this.userSocketsMap.get(userId);
    if (userSockets) {
      userSockets.delete(socket);
      console.log(`Socket connection removed for user ${userId}. Remaining connections: ${userSockets.size}`);

      if (userSockets.size === 0) {
        this.userSocketsMap.delete(userId);
        console.log(`No more connections for user ${userId}. Removed from map.`);
      }
    }
  }

  public getUserSockets(userId: number): Set<SocketIO> | undefined {
    return this.userSocketsMap.get(userId);
  }

  public emitToUser(userId: number, event: string, data: any): void {
    const userSockets = this.userSocketsMap.get(userId);
    if (userSockets) {
      userSockets.forEach(socket => {
        socket.emit(event, data);
      });
      console.log(`Emitted ${event} to ${userSockets.size} socket(s) for user ${userId}`);
    } else {
      console.log(`No socket connections found for user ${userId}`);
    }
  }

  public getAllConnections(): Map<number, Set<SocketIO>> {
    return this.userSocketsMap;
  }

  public getUserConnectionCount(userId: number): number {
    const userSockets = this.userSocketsMap.get(userId);
    return userSockets ? userSockets.size : 0;
  }

  public getTotalConnections(): number {
    let total = 0;
    this.userSocketsMap.forEach(sockets => {
      total += sockets.size;
    });
    return total;
  }
} 