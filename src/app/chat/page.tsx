"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);

  async function sendMessage() {
    if (!input.trim()) return;

    // Show user message immediately
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    const userMessage = input;
    setInput("");

    // Send plain text to the API
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: userMessage,
    });

    const replyText = await res.text(); // Expect plain text back
    if (replyText) {
      setMessages((prev) => [...prev, { role: "bot", text: replyText }]);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="border p-4 h-96 overflow-y-auto mb-4">
        {messages.map((m, i) => (
          <p key={i} className={m.role === "user" ? "text-blue-600" : "text-green-600"}>
            <strong>{m.role}:</strong> {m.text}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border flex-1 p-2 rounded"
          placeholder="Ask Gemini something..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
