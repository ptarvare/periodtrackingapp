"use client";

import { useState, useEffect, useRef, JSX } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { calculateCycleStatus } from "@/lib/predictionEngine";
import PleaseSignIn from "@/components/PleaseSignIn";
import Nav from "@/components/Nav";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

const SUGGESTED = [
  "What phase am I in and what does it mean?",
  "What should I eat today?",
  "Can I do HIIT today?",
  "Why do I feel low energy right now?",
  "What supplements should I take?",
];

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadContext() {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const p = snap.data().profile;
          const status = calculateCycleStatus(p);
          setContext({
            phase: status.currentPhase,
            dayOfCycle: status.dayOfCycle,
            phaseDay: status.phaseDay,
            cycleLength: status.cycleLength,
            daysUntilNextPeriod: status.daysUntilNextPeriod,
            ovulationDate: status.ovulationDate.toISOString(),
            confidenceScore: status.confidenceScore,
            profile: p,
          });
        }
      } catch (e) {
        console.error("Context load error", e);
      }
    }
    loadContext();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), text, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages.slice(-10), context }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: data.error
            ? "I'm having trouble connecting right now. Please try again."
            : data.text,
          sender: "bot",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: "Connection error. Please try again.", sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PleaseSignIn>
      <div className="flex flex-col h-screen bg-gray-50">
        <Nav />

        {/* Phase context strip */}
        {context?.phase && (
          <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2">
            <span className="text-xs text-gray-400">You&apos;re in your</span>
            <span className="text-xs font-semibold bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-full">
              {context.phase} Phase
            </span>
            <span className="text-xs text-gray-400">· Cycle day {context.dayOfCycle}</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="space-y-4 pt-2">
              <div className="bg-white rounded-2xl rounded-bl-none p-4 shadow-sm border border-gray-100 max-w-[85%]">
                <p className="text-sm text-gray-800">
                  Hi! I&apos;m Luna. I know your cycle, your goals, and your health conditions — ask me anything.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-400 pl-1">Try asking:</p>
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="block w-full text-left text-sm px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gray-900 text-white rounded-br-none"
                    : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none"
                }`}
              >
                {msg.sender === "bot" ? <BotMessage text={msg.text} /> : msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3.5 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="p-4 bg-white border-t border-gray-100 safe-area-inset-bottom">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Ask about your cycle…"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </PleaseSignIn>
  );
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

function BotMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-0.5" />;

        if (/^[-*]\s/.test(line)) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-pink-400 mt-0.5 shrink-0 leading-relaxed">•</span>
              <span>{renderInline(line.replace(/^[-*]\s/, ""))}</span>
            </div>
          );
        }

        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): (string | JSX.Element)[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}
