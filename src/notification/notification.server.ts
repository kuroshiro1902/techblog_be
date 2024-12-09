import io from "@/socket/io";
import { ENotificationEvent } from "./constants/notification-event.const";
import { AuthService } from "@/user/services/auth.service";
import { NotificationSocketService } from "./services/notification-socket.service";
import { Socket } from "./model/socket.model";

const notificationServer = io.of('/notification');

notificationServer.use((socket, next) => {
  if (NotificationSocketService.verifyToken(socket)) {
    new Socket(socket);
    next();
  } else {
    next(new Error("Authentication error"));
  }
});

export default notificationServer;