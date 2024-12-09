import { Server } from "http";
import app from "./app";

const server = new Server(app);

export default server;