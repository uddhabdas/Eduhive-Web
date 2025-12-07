"use client";

import React, { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface ChatAssistantProps {
  courseTitle?: string;
}

export default function ChatAssistant({ courseTitle }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I'm your AI learning assistant. Ask me anything about this course.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const responseText = await api.askAssistant(userMsg.text, courseTitle);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: responseText,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col transition-all animate-in fade-in slide-in-from-bottom-10 duration-300 ring-1 ring-white/10">
          {/* Header */}
          <div className="relative overflow-hidden bg-gray-900 p-4 flex items-center justify-between border-b border-gray-800">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 via-gray-900 to-gray-900"></div>
            <div className="relative flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                    <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zM12 4a8 8 0 00-8 8c0 1.335.326 2.618.94 3.766l-.93 3.157 3.247-.866A7.963 7.963 0 0012 20a8 8 0 000-16zm0 9a1 1 0 010 2 1 1 0 010-2zm0-5a1 1 0 011 1v3a1 1 0 01-2 0V9a1 1 0 011-1z" />
                 </svg>
                 <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-white text-base tracking-tight">EduHive AI</h3>
                <p className="text-emerald-400/80 text-xs font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="relative text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 bg-gray-900/50 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent" ref={scrollRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm shadow-md backdrop-blur-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-br-none border border-emerald-500/20"
                      : "bg-gray-800/80 text-gray-200 border border-gray-700 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed tracking-wide">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/80 border border-gray-700 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-gray-900 border-t border-gray-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-gray-500 text-white"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 transform rotate-90">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group p-4 rounded-full shadow-2xl shadow-emerald-500/30 transition-all duration-500 hover:scale-110 active:scale-90 flex items-center justify-center ${
          isOpen 
            ? "bg-gray-800 rotate-90 border border-gray-700" 
            : "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500"
        }`}
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-gray-300">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        ) : (
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white relative z-10">
              <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zM12 4a8 8 0 00-8 8c0 1.335.326 2.618.94 3.766l-.93 3.157 3.247-.866A7.963 7.963 0 0012 20a8 8 0 000-16zm0 9a1 1 0 010 2 1 1 0 010-2zm0-5a1 1 0 011 1v3a1 1 0 01-2 0V9a1 1 0 011-1z" />
            </svg>
            <div className="absolute inset-0 bg-white/30 rounded-full filter blur-md animate-pulse z-0"></div>
          </div>
        )}
      </button>
    </div>
  );
}
