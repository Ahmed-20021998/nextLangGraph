"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  metadata?: {
    claude_decision: string;
    ollama_decision: string;
  };
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting to fetch from:", "https://ai-lang-graph-jj5z.vercel.app/ask");
      const response = await fetch(
    "https://ai-lang-graph-jj5z.vercel.app/ask",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: input,
    }),
  }
);

      console.log("Response received status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Error ${response.status}: ${errorText || 'Failed to fetch response from AI'}`);
      }

      const data = await response.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.final_response,
        metadata: {
          claude_decision: data.claude_decision,
          ollama_decision: data.ollama_decision,
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ai-bg text-slate-200 flex flex-col items-center justify-between p-4 md:p-8 selection:bg-ai-accent/30">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-8 glass-effect p-4 rounded-2xl ai-glow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-ai-accent rounded-lg shadow-lg shadow-ai-accent/40">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              NeuralGraph AI
            </h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Dual-AI Verification Engine
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-ai-accent/10 border border-ai-accent/20 text-ai-accent-light text-xs font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>Optimized for Accuracy</span>
        </div>
      </header>

      {/* Chat Container */}
      <main
        ref={scrollRef}
        className="flex-1 w-full max-w-4xl overflow-y-auto space-y-6 pr-2 mb-8"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <div className="p-4 rounded-full bg-ai-surface border border-white/10 mb-2">
              <Bot className="w-12 h-12 text-ai-accent" />
            </div>
            <h2 className="text-2xl font-light text-slate-300">How can I assist you today?</h2>
            <p className="max-w-sm text-sm text-slate-500">
              Our dual-AI pipeline generates an answer and then verifies it for accuracy.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.role === "user" ? "bg-slate-700" : "bg-ai-accent"
                }`}>
                  {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                <div className="space-y-2">
                  <div className={`p-4 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-ai-user-bubble text-slate-100 rounded-tr-none"
                      : "bg-gradient-to-br from-indigo-900 to-ai-accent text-white rounded-tl-none shadow-xl shadow-ai-accent/10"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {msg.metadata && (
                    <div className="flex gap-2 text-[10px] font-mono uppercase tracking-tighter opacity-60">
                      <span className="px-2 py-0.5 rounded-md bg-ai-surface border border-white/10">
                        Claude: <span className="text-ai-accent-light">{msg.metadata.claude_decision}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-ai-surface border border-white/10">
                        Ollama: <span className="text-ai-accent-light">{msg.metadata.ollama_decision}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-ai-accent flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-ai-surface p-4 rounded-2xl rounded-tl-none border border-white/10">
              <div className="flex gap-1">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  className="w-1.5 h-1.5 rounded-full bg-ai-accent"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-ai-accent"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-1.5 h-1.5 rounded-full bg-ai-accent"
                />
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="w-full max-w-4xl">
        <form
          onSubmit={sendMessage}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-ai-accent to-ai-cyan rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
          <div className="relative flex items-center gap-2 glass-effect p-2 rounded-2xl border border-white/10 transition-all duration-300 group-focus-within:border-ai-accent/50">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the dual-AI engine..."
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 bg-ai-accent hover:bg-ai-accent-light disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all duration-200 shadow-lg shadow-ai-accent/20 active:scale-95"
            >
              {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
        <p className="text-center text-[10px] text-slate-600 mt-4 uppercase tracking-widest">
          Powered by LangGraph & Multi-Model Verification
        </p>
      </footer>
    </div>
  );
}
