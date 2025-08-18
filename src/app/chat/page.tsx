"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";

type ChatMessage = { role: "user" | "bot"; text: string };

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);

    // Show user message immediately
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    const userMessage = input;
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: userMessage,
      });
      const replyText = await res.text(); // Expect plain text back
      setMessages((prev) => [...prev, { role: "bot", text: replyText || "" }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, something went wrong." }]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-gray-300 hover:text-green-400 mb-4 transition-colors duration-200">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">🤖 Chat</h1>
            <p className="text-lg text-gray-300">Ask questions and get answers</p>
          </div>

          {/* Chat panel */}
          <div className="bg-gray-900 border border-green-500 rounded-2xl shadow-lg p-4 md:p-6">
            <div ref={listRef} className="h-[60vh] overflow-y-auto pr-1 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">Start the conversation by typing below.</div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2 rounded-xl text-sm md:text-base border ${m.role === 'user' ? 'bg-blue-900/30 text-blue-200 border-blue-600' : 'bg-green-900/30 text-green-200 border-green-600'}`}>
                      {m.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                placeholder="Type your message and press Enter..."
              />
              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
