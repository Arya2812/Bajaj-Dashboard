"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RefreshCw, Sparkles } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string }

const SUGGESTED = [
  "Which retailers have the highest FMR score?",
  "Compare North vs South zone performance",
  "List all Strategic+ category retailers",
  "Which retailers should get premium branding?",
  "What's the avg score by city?",
  "Show retailers with upgrade override flags",
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  // Simple markdown bold/table rendering
  const lines = msg.content.split("\n");

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
        style={{
          background: isUser
            ? "linear-gradient(135deg,#0052A3,#2A7ADE)"
            : "#EBEFF5",
          boxShadow: isUser
            ? "3px 3px 7px rgba(0,82,163,0.3)"
            : "3px 3px 7px #c8cfd8,-3px -3px 7px #ffffff",
        }}
      >
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-cobalt" style={{ color: "#0052A3" }} />}
      </div>

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-sm text-white"
            : "rounded-tl-sm text-slate"
        }`}
        style={{
          background: isUser
            ? "linear-gradient(135deg,#0052A3,#2A7ADE)"
            : "#FFFFFF",
          boxShadow: isUser
            ? "3px 3px 10px rgba(0,82,163,0.25)"
            : "0 2px 10px rgba(0,82,163,0.07)",
          color: isUser ? "white" : "#3A4750",
        }}
      >
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{msg.content}</pre>
      </div>
    </div>
  );
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm the Find My Retailer AI Agent for Bajaj Electricals.\n\nI have access to your full retailer database. Ask me anything — scores, rankings, zone comparisons, branding recommendations, or opportunity analysis.",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res  = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const json = await res.json();
      if (json.success) {
        setMessages(m => [...m, { role: "assistant", content: json.response }]);
      } else {
        setMessages(m => [...m, { role: "assistant", content: `Error: ${json.error}` }]);
      }
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: `Network error: ${e}` }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 flex-shrink-0">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#0052A3,#2A7ADE)", boxShadow: "4px 4px 10px rgba(0,82,163,0.3)" }}
        >
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate">FMR AI Agent</h1>
          <p className="text-xs text-slate-light">Powered by Claude — Ask questions about your retailer data</p>
        </div>
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 flex-shrink-0">
          {SUGGESTED.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="neu-sm p-3 text-left text-xs text-slate-light hover:text-cobalt hover:border-cobalt transition-colors border border-transparent"
              style={{ borderRadius: 10 }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 overflow-y-auto neu-inset rounded-2xl p-4 space-y-4 min-h-0 mb-4">
        {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
        {loading && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#EBEFF5", boxShadow: "3px 3px 7px #c8cfd8,-3px -3px 7px #ffffff" }}
            >
              <Bot size={14} style={{ color: "#0052A3" }} />
            </div>
            <div className="neu-card px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center h-5">
                <span className="w-1.5 h-1.5 rounded-full bg-cobalt animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cobalt animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-cobalt animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 flex-shrink-0">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about your retailer data…"
            disabled={loading}
            className="w-full neu-input text-sm pr-12"
            style={{ background: "#EBEFF5" }}
          />
        </div>
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="neu-btn px-4 py-2.5 disabled:opacity-40"
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
