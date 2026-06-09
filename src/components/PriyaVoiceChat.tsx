"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { calculateCycleStatus } from "@/lib/predictionEngine";

type Message = { role: "user" | "priya"; text: string };

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

export default function PriyaVoiceChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [context, setContext] = useState<Record<string, unknown>>({});
  const [hasSpeech, setHasSpeech] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setHasSpeech(!!SR);
  }, []);

  // Load user context once auth is ready
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data();
        const profile = data?.profile;
        const status = profile?.lastPeriodDate
          ? calculateCycleStatus(profile)
          : null;
        setContext({
          name: profile?.name ?? "there",
          phase: status?.currentPhase ?? "unknown",
          dayOfCycle: status?.dayOfCycle ?? null,
          goal: profile?.goals?.[0] ?? "know_my_body",
        });
      } catch {
        // silently fail — Priya still works without context
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      const userMsg: Message = { role: "user", text: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      try {
        const res = await fetch("/api/priya", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            history: messages.slice(-8),
            context,
          }),
        });
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "priya", text: data.text ?? "Sorry, try again." },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "priya", text: "Something went wrong — please try again." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, context]
  );

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [sendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return (
    <>
      {/* Floating mic button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat with Priya"
        className={`fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          open
            ? "bg-[#C8A4D4] text-white scale-95"
            : "bg-[#7B4F9E] text-white hover:bg-[#6a3d8e] active:scale-95"
        }`}
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      {/* Slide-up panel */}
      {open && (
        <div className="fixed bottom-16 right-0 left-0 z-40 sm:left-auto sm:right-4 sm:w-96">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            style={{ height: "480px" }}>
            {/* Header */}
            <div className="bg-[#7B4F9E] px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C8A4D4] flex items-center justify-center text-white font-semibold text-sm">
                P
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Priya</div>
                <div className="text-purple-200 text-xs">Your fitness & nutrition guide</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="text-3xl mb-2">👋</div>
                  <p className="text-gray-600 text-sm font-medium">Hi{context.name ? `, ${context.name}` : ""}!</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Ask me anything about training, nutrition, or your cycle.
                    {hasSpeech && " Tap the mic to speak."}
                  </p>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                      m.role === "user"
                        ? "bg-[#7B4F9E] text-white rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input row */}
            <div className="px-3 py-2 border-t border-gray-100 bg-white flex items-center gap-2">
              {hasSpeech && (
                <button
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                  onTouchStart={startListening}
                  onTouchEnd={stopListening}
                  aria-label="Hold to speak"
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    listening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}
              <input
                className="flex-1 text-sm border border-gray-200 rounded-full px-3 py-2 outline-none focus:border-[#7B4F9E] placeholder-gray-400"
                placeholder="Ask Priya anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="flex-shrink-0 w-9 h-9 rounded-full bg-[#7B4F9E] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#6a3d8e] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 bg-white flex items-center justify-center">
              <a
                href="https://www.instagram.com/fit_coach__priya"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#7B4F9E] hover:underline"
              >
                Work with the real Priya →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
