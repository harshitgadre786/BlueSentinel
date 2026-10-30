"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot,
  Sparkles,
  Send,
  Loader2,
  X,
  Maximize2,
  Minimize2,
  HelpCircle,
  FileText,
  ShieldCheck,
  Compass,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  provider?: string;
  citations?: { source: string; section: string; page: number }[];
}

interface RAGMaritimeAssistantProps {
  shipmentContext?: {
    originPortId: string;
    destPortId: string;
    cargoTypeId: string;
    vesselId: string;
    cargoTonnageMT: number;
    laycanDate: string;
  };
  className?: string;
}

export default function RAGMaritimeAssistant({
  shipmentContext,
  className = "",
}: RAGMaritimeAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial_welcome",
      sender: "assistant",
      text: "👋 Welcome to **BlueSentinel AI**!\n\nI am grounded in official **IMO Conventions (SOLAS, MARPOL, IMSBC, IMDG)** and real-time shipment hydrodynamics. Select any quick question below or ask anything about your active cargo, port rules, or CII decarbonization metrics.",
      timestamp: "Just now",
      provider: "BlueSentinel RAG",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const QUICK_QUESTIONS = [
    "What are the IMO hazard requirements for this cargo?",
    "Explain our CII rating on this route",
    "Required port documentation",
    "Weather & berth wait times",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: "msg_" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          shipmentContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: Message = {
        id: "resp_" + Date.now(),
        sender: "assistant",
        text: data.reply || "No reply content received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        provider: data.provider || "Gemini 1.5 Flash",
        citations: data.citations || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to connect to the assistant.";
      setMessages((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          sender: "assistant",
          text: `⚠️ **Connection Error:** ${errorMsg}. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-forest text-paper-light dark:bg-paper-light dark:text-forest shadow-xl border-2 border-forest dark:border-paper-light hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold text-xs group"
          aria-label="Open BlueSentinel AI Maritime Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-coral" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border-2 border-forest dark:border-paper-light" />
          </div>
          <span className="hidden sm:inline">Ask BlueSentinel AI</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-coral/20 text-coral font-bold">
            Gemini RAG
          </span>
        </button>
      )}

      {/* Floating Drawer / Modal */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col rounded-2xl border border-forest/20 dark:border-paper-light/20 bg-paper-light dark:bg-paper-dark shadow-2xl overflow-hidden ${
            isExpanded
              ? "inset-4 sm:inset-10"
              : "bottom-6 right-6 w-[94vw] sm:w-[480px] h-[640px] max-h-[88vh]"
          } ${className}`}
        >
          {/* Header */}
          <div className="px-5 py-3.5 bg-paper-surface/80 dark:bg-paper-dark-surface/80 backdrop-blur-sm border-b border-forest/15 dark:border-paper-light/15 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest text-paper-light dark:bg-paper-light dark:text-forest flex items-center justify-center">
                <Bot className="w-4 h-4 text-coral" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-black text-sm text-forest dark:text-paper-light">
                    BlueSentinel AI
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                    Gemini 1.5 Flash RAG
                  </span>
                </div>
                <div className="text-[10px] font-mono text-forest/60 dark:text-paper-light/60">
                  Grounded in IMO Conventions (SOLAS, MARPOL, IMDG)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded hover:bg-forest/10 dark:hover:bg-paper-light/10 text-forest/70 dark:text-paper-light/70 transition-colors"
                title={isExpanded ? "Minimize" : "Maximize"}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded hover:bg-forest/10 dark:hover:bg-paper-light/10 text-forest/70 dark:text-paper-light/70 transition-colors"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Question Chips */}
          <div className="px-4 py-2.5 bg-forest/5 dark:bg-paper-light/5 border-b border-forest/10 dark:border-paper-light/10 overflow-x-auto flex gap-2 scrollbar-none">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15 text-forest/80 dark:text-paper-light/80 hover:border-coral hover:text-coral transition-colors disabled:opacity-50 font-medium"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded bg-forest dark:bg-paper-light text-paper-light dark:text-forest flex items-center justify-center shrink-0 mt-0.5">
                      <Compass className="w-3.5 h-3.5 text-coral" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed space-y-2 ${
                      isUser
                        ? "bg-forest text-paper-light dark:bg-paper-light dark:text-forest font-medium rounded-tr-none shadow-sm"
                        : "bg-paper-surface/80 dark:bg-paper-dark-surface/80 border border-forest/15 dark:border-paper-light/15 text-forest dark:text-paper-light rounded-tl-none shadow-sm"
                    }`}
                  >
                    {isUser ? (
                      <p>{m.text}</p>
                    ) : (
                      <div className="prose prose-xs dark:prose-invert max-w-none text-xs font-sans">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.text}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Citations block for assistant messages */}
                    {!isUser && m.citations && m.citations.length > 0 && (
                      <div className="pt-2 border-t border-forest/10 dark:border-paper-light/10 mt-2 space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-forest/50 dark:text-paper-light/50 flex items-center gap-1">
                          <FileText className="w-2.5 h-2.5 text-mustard" />
                          <span>Grounded RAG Citations:</span>
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {m.citations.map((c, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-forest/5 dark:bg-paper-light/5 text-forest/70 dark:text-paper-light/70 border border-forest/10 dark:border-paper-light/10"
                            >
                              p.{c.page} {c.section.slice(0, 30)}...
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      className={`text-[9px] font-mono ${
                        isUser
                          ? "text-paper-light/60 dark:text-forest/60 text-right"
                          : "text-forest/40 dark:text-paper-light/40"
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 justify-start animate-fadeIn">
                <div className="w-6 h-6 rounded bg-forest dark:bg-paper-light text-paper-light dark:text-forest flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-coral animate-pulse" />
                </div>
                <div className="bg-paper-surface/80 dark:bg-paper-dark-surface/80 border border-forest/15 dark:border-paper-light/15 rounded-xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-coral animate-spin" />
                  <span className="text-forest/70 dark:text-paper-light/70 font-mono text-[11px]">
                    Synthesizing IMO grounded reasoning with Gemini 1.5 Flash...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-paper-surface/60 dark:bg-paper-dark-surface/60 border-t border-forest/15 dark:border-paper-light/15 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about IMO hazard classes, CII, ETA, or port rules..."
              disabled={isLoading}
              className="flex-1 bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-lg px-3 py-2.5 text-xs text-forest dark:text-paper-light placeholder:text-forest/40 dark:placeholder:text-paper-light/40 focus:outline-none focus:border-forest/50 dark:focus:border-paper-light/50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="p-2.5 rounded-lg bg-forest text-paper-light dark:bg-paper-light dark:text-forest hover:bg-forest/90 dark:hover:bg-paper-light/90 disabled:opacity-40 transition-all cursor-pointer shrink-0"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
