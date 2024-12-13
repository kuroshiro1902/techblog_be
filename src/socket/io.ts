import { Server } from "socket.io";
import server from "@/server/server";
import { ENVIRONMENT } from "@/common/environments/environment";

const io = new Server(server, {
  cors: {
    origin: [ENVIRONMENT.clientUrl],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// io.engine.generateId = (req)=>{

// }

export default io;