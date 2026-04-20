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

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return <strong key={i} className="font-semibold text-slate">{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`"))
      return <code key={i} className="px-1 py-0.5 rounded text-[11px] font-mono bg-[#F0F4F8] text-cobalt">{p.slice(1, -1)}</code>;
    return p;
  });
}

function MarkdownBlock({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      nodes.push(
        <div key={i} className="flex items-center gap-2 mt-4 mb-2 first:mt-0">
          <span className="text-xs font-bold uppercase tracking-widest text-slate">{renderInline(line.slice(3))}</span>
          <div className="flex-1 h-px bg-[#EEF2F7]" />
        </div>
      );
      i++; continue;
    }

    if (line.startsWith("### ")) {
      nodes.push(<p key={i} className="text-xs font-semibold text-slate-light uppercase tracking-wide mt-3 mb-1">{renderInline(line.slice(4))}</p>);
      i++; continue;
    }

    if (line.startsWith("|") && /^\|[\s\-|]+\|/.test(lines[i + 1] ?? "")) {
      const headers = line.split("|").filter(Boolean).map(h => h.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        rows.push(lines[i].split("|").filter(Boolean).map(c => c.trim()));
        i++;
      }
      nodes.push(
        <div key={`table-${i}`} className="my-3 rounded-xl overflow-hidden border border-[#EEF2F7]">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#F8FAFC]">
                {headers.map((h, hi) => <th key={hi} className="px-3 py-2 text-left font-semibold text-slate-light uppercase tracking-wide border-b border-[#EEF2F7]">{renderInline(h)}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-[#FAFBFC]"}>
                  {row.map((cell, ci) => <td key={ci} className="px-3 py-2 text-slate border-b border-[#F0F4F8] last:border-0">{renderInline(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (/^[-*] /.test(line)) {
      const bullets: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) { bullets.push(lines[i].slice(2)); i++; }
      nodes.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1.5 pl-1">
          {bullets.map((b, bi) => (
            <li key={bi} className="flex items-start gap-2 text-[13px] text-slate leading-snug">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: "#2A7ADE" }} />
              <span>{renderInline(b)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, "")); i++; }
      nodes.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1.5 pl-1">
          {items.map((item, ii) => (
            <li key={ii} className="flex items-start gap-2 text-[13px] text-slate leading-snug">
              <span className="w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5" style={{ background: "#EEF2F7", color: "#2A7ADE" }}>{ii + 1}</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.startsWith("---")) { nodes.push(<div key={i} className="my-3 h-px bg-[#EEF2F7]" />); i++; continue; }
    if (line.trim() === "") { i++; continue; }
    nodes.push(<p key={i} className="text-[13px] text-slate leading-relaxed my-1">{renderInline(line)}</p>);
    i++;
  }

  return <div className="space-y-0.5">{nodes}</div>;
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "items-start"}`}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
        style={{ background: isUser ? "linear-gradient(135deg,#0052A3,#2A7ADE)" : "#EBEFF5", boxShadow: isUser ? "3px 3px 7px rgba(0,82,163,0.3)" : "2px 2px 6px #c8cfd8,-2px -2px 6px #ffffff" }}>
        {isUser ? <User size={13} className="text-white" /> : <Bot size={13} style={{ color: "#0052A3" }} />}
      </div>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
        style={{ background: isUser ? "linear-gradient(135deg,#0052A3,#2A7ADE)" : "#FFFFFF", boxShadow: isUser ? "3px 3px 10px rgba(0,82,163,0.25)" : "0 2px 12px rgba(0,82,163,0.08), 0 1px 3px rgba(0,0,0,0.04)" }}>
        {isUser ? <p className="text-sm text-white leading-relaxed">{msg.content}</p> : <MarkdownBlock content={msg.content} />}
      </div>
    </div>
  );
}

export default function Agent() {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "## FMR AI Agent\n\nI have access to your full retailer database. Ask me anything:\n\n- Scores, rankings, bands\n- Zone / city comparisons\n- Branding recommendations\n- Growth opportunities",
  }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: Message = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res  = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const json = await res.json();
      setMessages(m => [...m, { role: "assistant", content: json.success ? json.response : `**Error:** ${json.error}` }]);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: `**Network error:** ${e}` }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-5 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0052A3,#2A7ADE)", boxShadow: "4px 4px 10px rgba(0,82,163,0.3)" }}>
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate leading-tight">FMR AI Agent</h1>
          <p className="text-[11px] text-slate-light">Bajaj Electricals · Retailer Intelligence</p>
        </div>
      </div>

      {messages.length <= 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 flex-shrink-0">
          {SUGGESTED.map(s => (
            <button key={s} onClick={() => send(s)} className="rounded-xl p-3 text-left text-xs text-slate-light hover:text-cobalt transition-colors border border-[#EEF2F7] bg-white hover:border-cobalt hover:bg-[#F8FAFC]">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto rounded-2xl p-4 space-y-4 min-h-0 mb-4"
        style={{ background: "#F8FAFC", boxShadow: "inset 2px 2px 6px #e0e5ec, inset -2px -2px 6px #ffffff" }}>
        {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
        {loading && (
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ background: "#EBEFF5", boxShadow: "2px 2px 6px #c8cfd8,-2px -2px 6px #ffffff" }}>
              <Bot size={13} style={{ color: "#0052A3" }} />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3" style={{ boxShadow: "0 2px 12px rgba(0,82,163,0.08)" }}>
              <div className="flex gap-1.5 items-center h-4">
                {[0, 150, 300].map(delay => <span key={delay} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#2A7ADE", animationDelay: `${delay}ms` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask about your retailer data…" disabled={loading}
          className="flex-1 px-4 py-2.5 text-sm rounded-xl outline-none transition-all"
          style={{ background: "#EBEFF5", boxShadow: "inset 3px 3px 6px #c8cfd8, inset -3px -3px 6px #ffffff", color: "#3A4750" }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all"
          style={{ background: "linear-gradient(135deg,#0052A3,#2A7ADE)", boxShadow: "4px 4px 10px rgba(0,82,163,0.3), -2px -2px 6px rgba(255,255,255,0.8)" }}>
          {loading ? <RefreshCw size={15} className="animate-spin text-white" /> : <Send size={15} className="text-white" />}
        </button>
      </div>
    </div>
  );
}
