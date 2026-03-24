"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";

export default function ChatPage() {
  const { messages, users, connected, send } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    send(input);
    setInput("");
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* 사이드바 - 접속자 목록 */}
      <aside className="w-56 bg-gray-900 border-r border-gray-800 p-4 flex flex-col gap-2">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          접속자 {users.length}명
        </h2>
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-gray-300">{user.nickname}</span>
          </div>
        ))}
      </aside>
      {/* 메인 채팅 영역 */}
      <main className="flex flex-col flex-1">
        {/* 헤더 */}
        <header className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
          <h1 className="font-semibold">💬 채팅방</h1>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${connected ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}
          >
            {connected ? "연결됨" : "연결 중..."}
          </span>
        </header>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
          {messages.map((msg, i) =>
            msg.type === "system" ? (
              <p key={i} className="text-center text-xs text-gray-500">
                {msg.text}
              </p>
            ) : (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-400">{msg.nickname}</span>
                <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 text-sm max-w-md w-fit">
                  {msg.text}
                </div>
              </div>
            ),
          )}
          <div ref={bottomRef} />
        </div>

        {/* 입력창 */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-4 border-t border-gray-800 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-gray-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 transition px-4 py-2 rounded-xl text-sm font-medium"
          >
            전송
          </button>
        </form>
      </main>
    </div>
  );
}
