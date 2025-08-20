"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { chatDB } from "@/lib/db";

type ChatMessage = { role: "user" | "bot"; text: string };

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [convKey, setConvKey] = useState<string | null>(null);
  const VISIBLE_COUNT = 8;

  // No auto-scroll; we clip older messages and keep layout fixed within viewport

  // Create/read a stable conversation key in localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let key = localStorage.getItem('chatConvKey');
    if (!key) {
      key = `conv-${crypto.randomUUID()}`;
      localStorage.setItem('chatConvKey', key);
    }
    setConvKey(key);
  }, []);

  // Load persisted messages from IndexedDB
  useEffect(() => {
    const load = async () => {
      if (!convKey) return;
      try {
        await chatDB.initIfNeeded();
        const state = await chatDB.get(convKey);
        setMessages(state.messages.map(m => ({ role: m.role, text: m.text })));
      } catch {
        // ignore
      }
    };
    load();
  }, [convKey]);

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);

    // Show user message immediately
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    const userMessage = input;
    setInput("");

    try {
      // Persist user message to IndexedDB
      const key = convKey || (typeof window !== 'undefined' ? (localStorage.getItem('chatConvKey') || '') : '');
      if (key) {
        await chatDB.initIfNeeded();
        await chatDB.append(key, { role: 'user', text: userMessage, at: new Date() });
      }

      const payload = {
        message: userMessage,
        history: [...messages, { role: "user", text: userMessage }],
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const replyText = await res.text();
      setMessages((prev) => [...prev, { role: "bot", text: replyText || "" }]);

      // Persist bot message to IndexedDB
      if (key) {
        await chatDB.append(key, { role: 'bot', text: replyText || '', at: new Date() });
      }
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
  <div className="h-[100dvh] bg-black text-white flex flex-col">
      <Navigation />
  <div className="flex-1 p-4 flex flex-col">
  <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-gray-300 hover:text-green-400 mb-4 transition-colors duration-200">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-green-400 mb-2 drop-shadow-lg ml-0 ht">Chat</h1>
            <p className="text-lg text-gray-300">Ask questions and get answers</p>
          </div>

          {/* Chat panel */}
          <div className="glass-card border border-green-500/30 rounded-2xl shadow-lg p-3 md:p-6 flex-1 flex flex-col">
            <div className="flex-1 pr-1 space-y-3 flex flex-col justify-end">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">Start the conversation by typing below.</div>
              ) : (
                messages.slice(-VISIBLE_COUNT).map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[80%] px-4 py-2 rounded-xl text-sm md:text-base border break-words whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-900/30 text-blue-200 border-blue-600' : 'bg-green-900/30 text-green-200 border-green-600'}`}>
                      {m.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 md:mt-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <div className="flex gap-2 items-stretch flex-col sm:flex-row">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  placeholder="Type your message..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={sendMessage}
                    disabled={sending || !input.trim()}
                    className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {sending ? 'Sending…' : 'Send'}
                  </button>
                  <button
                    onClick={async () => {
                      setMessages([]);
                      try { if (convKey) { await chatDB.clear(convKey); } } catch {}
                    }}
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg border border-gray-700 w-full sm:w-auto"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
