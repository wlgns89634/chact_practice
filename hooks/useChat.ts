import { useEffect, useRef, useState } from "react";

interface Message {
  type: "message" | "system";
  nickname?: string;
  text: string;
  id?: string;
}

interface User {
  id: string;
  nickname: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000/ws");
    ws.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "users") {
        setUsers(data.users);
        console.log("Updated users:", data.users);
      } else {
        setMessages((prev) => [...prev, data]);
      }
    };

    return () => socket.close();
  }, []);

  const send = (text: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ text }));
    }
  };

  return { messages, users, connected, send };
}
