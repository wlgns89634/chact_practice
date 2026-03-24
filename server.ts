import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { Socket } from "net";
import { roomManager } from "./lib/roomManager";
import { randomUUID } from "crypto";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws) => {
    console.log("WebSocket 연결됨!");
    const id = randomUUID();
    const nickname = `유저${Math.floor(Math.random() * 1000)}`;

    roomManager.add(id, nickname, ws);
    roomManager.broadcast({
      type: "system",
      text: `${nickname}님이 입장했습니다.`,
    });

    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(
          JSON.stringify({ type: "users", users: roomManager.getUsers() }),
        );
      }
    });

    ws.on("message", (raw) => {
      const { text } = JSON.parse(raw.toString());
      roomManager.broadcast({ type: "message", nickname, text, id });
    });

    ws.on("close", () => {
      roomManager.remove(id);
      roomManager.broadcast({
        type: "system",
        text: `${nickname}님이 퇴장했습니다.`,
      });
      wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
          client.send(
            JSON.stringify({ type: "users", users: roomManager.getUsers() }),
          );
        }
      });
    });
  });

  // upgrade 단계에서 /ws 경로만 허용
  server.on("upgrade", (req: IncomingMessage, socket: Socket, head: Buffer) => {
    const { pathname } = parse(req.url!);
    if (pathname === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
  });

  server.listen(3000, () => {
    console.log("> http://localhost:3000");
  });
});
