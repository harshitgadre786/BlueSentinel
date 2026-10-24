"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChatMessage,
  SimulationInputs,
  PortData,
  VesselCalculationResult,
  ComparisonVerdict,
} from "../lib/types";
import { generateBlueAIResponse } from "../lib/rag-knowledge-base";
import {
  Bot,
  User,
  Send,
  Sparkles,
  BookOpen,
  ShieldCheck,
  CheckCircle,
  FileText,
  HelpCircle,
  Hash,
  Compass,
} from "lucide-react";

interface Props {
  inputs: SimulationInputs;
  port: PortData;
  resultA: VesselCalculationResult;
  resultB: VesselCalculationResult;
  verdict: ComparisonVerdict;
}

export default function BlueAIAssistant({
  inputs,
  port,
  resultA,
  resultB,
  verdict,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_welcome",
      sender: "blueai",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content: `Welcome to **BlueSentinel AI Decision Support**. I am **BlueAI**, your verified RAG maritime intelligence officer.

I cross-reference your uploaded **Vessel Specifications** and **${port.name} Marine Circulars** against our **deterministic hydrodynamic calculation engine**.

**Current Voyage Synopsis:**
* **Indian Port**: ${port.name} (Max permissible draft: **${port.maxPermissibleDraft}m CD**)
* **Decision Status**: **${verdict.recommendedVesselId === "vesselB" ? resultB.vesselName : resultA.vesselName}** is recommended.
* **Key Commercial Factor**: Vessel A incurs a critical **${Math.abs(resultA.draftMargin)}m draft breach**, making its true risk-adjusted cost **$${resultA.riskAdjustedCostUSD.toLocaleString()}** vs **$${resultB.riskAdjustedCostUSD.toLocaleString()}** for Vessel B.

Ask me any nautical, regulatory, or commercial question below.`,
      citations: [
        {
          filename: "Paradip_Port_Notice_Marine_Circular_2026.pdf",
          pageNumber: 2,
          section: "Section 2: Maximum Permissible Drafts",
          excerpt: "Berth 4 and Berth 5 maximum permissible draft at Chart Datum is 14.20 meters.",
        },
      ],
      deterministicMetrics: [
        { label: "Recommended Vessel", value: verdict.recommendedVesselId === "vesselB" ? resultB.vesselName : resultA.vesselName },
        { label: "Net Savings", value: `$${Math.abs(verdict.costDifferenceUSD).toLocaleString()}` },
        { label: "Speed", value: `${inputs.speedKnots} kts` },
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: "msg_user_" + Date.now(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery("");
    setIsTyping(true);

    // Realistic response delay
    setTimeout(() => {
      const response = generateBlueAIResponse(q, {
        inputs,
        port,
        resultA,
        resultB,
        verdict,
      });

      const aiMsg: ChatMessage = {
        id: "msg_ai_" + Date.now(),
        sender: "blueai",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        content: response.content,
        citations: response.citations,
        deterministicMetrics: response.deterministicMetrics,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const quickPrompts = [
    "Why is Vessel B recommended over Vessel A?",
    "What is the maximum permissible draft at Paradip Port?",
    "What happens if Vessel A attempts to berth without lightering?",
    "How does speed affect underwater noise & cetaceans?",
    "Break down the risk-adjusted cost difference",
  ];

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl flex flex-col h-[600px] shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-navy-850 border-b border-navy-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Bot className="w-5 h-5" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-navy-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">BlueAI Grounded RAG Assistant</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold">
                Strict Deterministic Grounding
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Answers derived from Port Notices and Vessel Specs; numbers strictly from simulation engine
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "blueai" && (
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-3.5 text-xs ${
                msg.sender === "user"
                  ? "bg-cyan-600 text-white rounded-tr-none"
                  : "bg-navy-850 border border-navy-750 text-slate-200 rounded-tl-none shadow-md"
              }`}
            >
              {/* Message Content */}
              <div className="leading-relaxed whitespace-pre-line prose-invert">
                {msg.content}
              </div>

              {/* Deterministic Metrics Strip (AI only) */}
              {msg.deterministicMetrics && msg.deterministicMetrics.length > 0 && (
                <div className="mt-3 pt-2 border-t border-navy-750 flex flex-wrap gap-1.5">
                  {msg.deterministicMetrics.map((met, i) => (
                    <div
                      key={i}
                      className="px-2 py-0.5 rounded bg-navy-950 text-[10px] text-slate-300 border border-navy-700 flex items-center gap-1"
                    >
                      <span className="text-slate-400">{met.label}:</span>
                      <span className="font-mono text-cyan-300 font-bold">{met.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* RAG Citations (AI only) */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-navy-750 space-y-1.5">
                  <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-amber-400" />
                    <span>Verified Source Citations:</span>
                  </div>
                  {msg.citations.map((cite, i) => (
                    <div
                      key={i}
                      className="p-1.5 rounded bg-navy-950/80 border border-amber-500/20 text-[10px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="font-semibold text-amber-200 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-amber-400" />
                          {cite.filename}
                        </span>
                        <span className="text-cyan-400 font-mono">
                          Page {cite.pageNumber}
                        </span>
                      </div>
                      <div className="text-slate-400 italic">
                        "{cite.excerpt}"
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`text-[9px] mt-1.5 ${
                  msg.sender === "user" ? "text-cyan-100 text-right" : "text-slate-400"
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === "user" && (
              <div className="w-7 h-7 rounded-lg bg-navy-800 border border-navy-700 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-navy-850 border border-navy-750 rounded-xl px-4 py-2.5 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Querying RAG vectors & binding deterministic figures...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-navy-850/80 border-t border-navy-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-400 shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-cyan-400" />
          Prompts:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-navy-850 border-t border-navy-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask BlueAI about ${port.name} draft limits, lightering tariffs, or speed laws...`}
            className="flex-1 bg-navy-950 border border-navy-750 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-navy-950 font-bold transition-all shadow-glow shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
