import { WebSocket } from "ws";

interface Client {
  id: string;
  nickname: string;
  ws: WebSocket;
}

const clients = new Map<string, Client>();

export const roomManager = {
  add(id: string, nickname: string, ws: WebSocket) {
    clients.set(id, { id, nickname, ws });
  },
  remove(id: string) {
    clients.delete(id);
  },
  broadcast(message: object, excludeId?: string) {
    const data = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.id !== excludeId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    });
  },
  getUsers() {
    return Array.from(clients.values()).map((c) => ({
      id: c.id,
      nickname: c.nickname,
    }));
  },
};
