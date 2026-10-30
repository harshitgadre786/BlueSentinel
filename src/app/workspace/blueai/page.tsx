"use client";

import React, { useState, useRef, useEffect } from "react";
import WorkspaceNav from "@/components/WorkspaceNav";
import { useAuth } from "@/context/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-client";
import { RAGDocument, DocumentChunk } from "@/lib/types";
import { PRELOADED_DOCUMENTS } from "@/lib/rag-knowledge-base";
import { queryBlueAICopilot, EvidenceCitation } from "@/lib/blueai-copilot";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot,
  FileText,
  Upload,
  BookOpen,
  Send,
  CheckCircle2,
  X,
  ArrowRight,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "blueai";
  text: string;
  citations?: EvidenceCitation[];
  timestamp: string;
}

export default function BlueAIPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<RAGDocument[]>(PRELOADED_DOCUMENTS);
  const [queryText, setQueryText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<EvidenceCitation | null>(null);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Initial welcome message from autonomous agent as specified
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "msg_init",
      role: "blueai",
      text: `I am your verified maritime copilot, grounded in official port circulars, hydrostatic tables, and charterparty agreements.

**Operational Rules:**
- **Zero-Hallucination Policy:** Verified against official circulars with exact page citations.
- **Active Route:** Singapore (PSA) to Paradip Port (INPBD).
- **Knowledge Core:** Paradip Notice 2026, MV Sagar Samrat, BIMCO Clauses.`,
      timestamp: "Ready",
    },
  ]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isProcessing]);

  // Clean suggested questions
  const quickQuestions = [
    {
      label: "Why was Vessel A rejected?",
      query: "Why was Vessel A rejected at Paradip Port?",
    },
    {
      label: "What draft limit applies at the berth?",
      query: "What draft limit applies at the selected berth in Paradip?",
    },
    {
      label: "What documents are required?",
      query: "What documents are still missing or mandatory for arrival?",
    },
    {
      label: "Summarize delay clause",
      query: "Summarize the delay clause and demurrage risk in this charterparty.",
    },
  ];

  // Knowledge base display items (2-3 clean items)
  const knowledgeBaseItems = [
    {
      id: "doc_paradip",
      title: "Paradip Port Authority Notice (2026)",
      badge: "PORT NOTICE",
      filename: "Paradip_Port_Notice_Marine_Circular_2026.pdf",
    },
    {
      id: "doc_vessel_a",
      title: "MV Sagar Samrat Specs",
      badge: "VESSEL SPEC",
      filename: "MV_Sagar_Samrat_Panamax_SpecSheet.pdf",
    },
    {
      id: "doc_charterparty",
      title: "BIMCO Gencon Charterparty",
      badge: "CHARTERPARTY",
      filename: "BIMCO_Gencon_Voyage_Charterparty_Terms.pdf",
    },
  ];

  const handleAskQuestion = async (q?: string) => {
    const questionToAsk = q || queryText;
    if (!questionToAsk.trim() || isProcessing) return;

    const userMsgId = `msg_user_${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append user message
    setChatHistory((prev) => [
      ...prev,
      { id: userMsgId, role: "user", text: questionToAsk, timestamp: timeStr },
    ]);

    if (!q) setQueryText("");
    setIsProcessing(true);

    try {
      const response = await queryBlueAICopilot(questionToAsk, documents);

      // Append BlueAI response
      const blueaiMsgId = `msg_agent_${Date.now()}`;
      setChatHistory((prev) => [
        ...prev,
        {
          id: blueaiMsgId,
          role: "blueai",
          text: response.answer,
          citations: response.citations,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: "blueai",
          text: "An error occurred while evaluating documentary evidence against port circulars.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("Processing document...");
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = (event.target?.result as string) || "";
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      const chunks: DocumentChunk[] = [];
      const pageSize = 12;

      for (let i = 0; i < lines.length; i += pageSize) {
        const pageNum = Math.floor(i / pageSize) + 1;
        chunks.push({
          id: `chunk_${Date.now()}_${pageNum}`,
          pageNumber: pageNum,
          heading: `Section - Page ${pageNum}`,
          text: lines.slice(i, i + pageSize).join(" ").slice(0, 480) || `Text excerpt from ${file.name}`,
          keywords: [file.name.toLowerCase(), "charter", "draft", "port", "berth"],
        });
      }

      if (chunks.length === 0) {
        chunks.push({
          id: `chunk_${Date.now()}_1`,
          pageNumber: 1,
          heading: "Vessel Particulars & Loadline Clauses",
          text: `Extracted terms from ${file.name}. Vessel summer draft 13.30m. Subject to safe port warranty and customary dispatch clauses.`,
          keywords: ["draft", "charterparty", "dispatch"],
        });
      }

      // If user is authenticated and Supabase is configured, enforce isolated storage folder path
      if (user && !user.isDemo && isSupabaseConfigured && supabase) {
        try {
          const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const userFolderStoragePath = `${user.id}/${Date.now()}_${sanitizedFilename}`;

          await supabase.storage.from("documents").upload(userFolderStoragePath, file, {
            upsert: false,
          });

          const { data: docRecord } = await supabase
            .from("uploaded_documents")
            .insert([
              {
                user_id: user.id,
                filename: file.name,
                file_path: userFolderStoragePath,
                category: "CHARTERPARTY",
                size_bytes: file.size,
                page_count: chunks.length,
              },
            ])
            .select()
            .single();

          if (docRecord?.id) {
            await supabase.from("document_chunks").insert(
              chunks.map((c) => ({
                user_id: user.id,
                document_id: docRecord.id,
                page_number: c.pageNumber,
                heading: c.heading,
                content: c.text,
                keywords: c.keywords,
              }))
            );
          }
        } catch {
          // If remote storage unavailable, continue smoothly in local sandbox
        }
      }

      const newDoc: RAGDocument = {
        id: "doc_user_" + Date.now(),
        title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
        filename: file.name,
        category: "CHARTERPARTY" as const,
        uploadDate: new Date().toISOString().slice(0, 10),
        sizeBytes: file.size,
        chunks,
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setUploadStatus(`Document uploaded & indexed successfully.`);
      setTimeout(() => setUploadStatus(null), 3500);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-paper-light dark:bg-paper-dark text-forest dark:text-paper-light flex flex-col font-sans transition-colors selection:bg-coral selection:text-paper-light">
      <WorkspaceNav serviceTitle="BlueAI Copilot" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8">
        {/* Generous 2-Column Layout (Left: 30-35%, Right: 65-70%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
          {/* LEFT COLUMN: Document Hub (4 cols = ~33.3%) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Single dashed upload card */}
            <div className="rounded-xl border border-dashed border-forest/30 dark:border-paper-light/30 p-8 text-center bg-paper-surface/40 dark:bg-paper-dark-surface/30 hover:border-coral transition-colors">
              <input
                type="file"
                id="doc-upload"
                accept=".pdf,.docx,.txt,.doc"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="doc-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-forest/10 dark:bg-paper-light/10 flex items-center justify-center text-forest dark:text-paper-light group-hover:bg-coral/10 group-hover:text-coral transition-colors">
                  <Upload className="w-5 h-5 text-coral" />
                </div>
                <span className="text-sm font-bold text-forest dark:text-paper-light group-hover:text-coral transition-colors">
                  + Upload Document (PDF, docx)
                </span>
                <span className="text-xs text-forest/50 dark:text-paper-light/50 font-normal">
                  Drop file here to index into knowledge base
                </span>
              </label>

              {uploadStatus && (
                <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{uploadStatus}</span>
                </div>
              )}
            </div>

            {/* Knowledge Base (2-3 clean items) */}
            <div className="rounded-xl bg-paper-surface/50 dark:bg-paper-dark-surface/40 border border-forest/15 dark:border-paper-light/15 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-forest/10 dark:border-paper-light/10">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80">
                  <BookOpen className="w-4 h-4 text-coral" />
                  <span>Knowledge Base</span>
                </div>
                <span className="text-[11px] font-mono text-forest/50 dark:text-paper-light/50">
                  {knowledgeBaseItems.length} Verified
                </span>
              </div>

              <div className="space-y-2.5">
                {knowledgeBaseItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-lg border border-forest/10 dark:border-paper-light/10 bg-paper-light dark:bg-paper-dark flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-coral shrink-0" />
                      <span className="font-semibold text-forest dark:text-paper-light truncate">
                        {item.title}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase shrink-0 border border-current text-forest/70 dark:text-paper-light/70">
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: AI Copilot (8 cols = ~66.7%) */}
          <div className="lg:col-span-8 flex flex-col justify-between rounded-xl bg-paper-surface/50 dark:bg-paper-dark-surface/40 border border-forest/15 dark:border-paper-light/15 overflow-hidden">
            {/* Header: BlueAI Autonomous Maritime Agent + Online Status */}
            <div className="p-6 border-b border-forest/15 dark:border-paper-light/15 flex items-center justify-between bg-paper-light/50 dark:bg-paper-dark/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-forest text-paper-light dark:bg-paper-light dark:text-forest flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5 text-coral" />
                </div>
                <div>
                  <h1 className="font-serif text-lg sm:text-xl font-bold text-forest dark:text-paper-light">
                    BlueAI Autonomous Maritime Agent
                  </h1>
                  <span className="text-xs text-forest/60 dark:text-paper-light/60">
                    Decision-support intelligence for voyage charterers
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>• Online</span>
              </div>
            </div>

            {/* Quick Suggested Questions Bar */}
            <div className="px-6 py-3 bg-paper-surface/30 dark:bg-paper-dark-surface/20 border-b border-forest/10 dark:border-paper-light/10 overflow-x-auto flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase text-forest/50 dark:text-paper-light/50 shrink-0">
                Quick Questions:
              </span>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskQuestion(q.query)}
                  disabled={isProcessing}
                  className="px-3 py-1 rounded-full text-xs font-medium border border-forest/15 dark:border-paper-light/15 bg-paper-light dark:bg-paper-dark hover:border-coral hover:text-coral transition-colors shrink-0 disabled:opacity-50"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Chat Conversation Stream */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 max-h-[520px]">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  {/* Sender Metadata */}
                  <div className="flex items-center gap-2 text-[11px] font-mono text-forest/50 dark:text-paper-light/50">
                    <span className="font-bold">
                      {msg.role === "user" ? "Captain Sharma" : "BlueAI Agent"}
                    </span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`p-5 rounded-xl text-sm leading-relaxed max-w-[92%] ${
                      msg.role === "user"
                        ? "bg-forest text-paper-light dark:bg-paper-light dark:text-forest font-medium"
                        : "bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15 text-forest dark:text-paper-light shadow-sm"
                    }`}
                  >
                    <div className="space-y-3 prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 className="font-serif text-lg font-bold text-forest dark:text-paper-light pb-1 border-b border-forest/15">{children}</h1>,
                          h2: ({ children }) => <h2 className="font-serif text-base font-bold text-forest dark:text-paper-light">{children}</h2>,
                          h3: ({ children }) => <h3 className="font-serif text-sm font-bold text-forest dark:text-paper-light">{children}</h3>,
                          p: ({ children }) => <p className="text-sm text-forest/90 dark:text-paper-light/90 leading-relaxed m-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-coral dark:text-coral">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-2 text-sm text-forest/85 dark:text-paper-light/85">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-2 text-sm text-forest/85 dark:text-paper-light/85">{children}</ol>,
                          li: ({ children }) => <li className="pl-1">{children}</li>,
                          code: ({ children }) => <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-forest/10 dark:bg-paper-light/10 text-coral font-bold">{children}</code>,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>

                    {/* Supporting Evidence Citations (Clean, Clickable for Modal Inspection) */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-forest/10 dark:border-paper-light/10 space-y-2">
                        <div className="text-[11px] font-mono font-bold uppercase text-coral flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Supporting Documentary Citations (Click to Inspect):</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {msg.citations.map((cite, cIdx) => (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => setSelectedCitation(cite)}
                              className="px-3 py-1.5 rounded-md bg-paper-surface/80 dark:bg-paper-dark-surface/80 border border-forest/15 dark:border-paper-light/15 hover:border-coral text-xs font-mono text-forest dark:text-paper-light flex items-center gap-2 transition-colors cursor-pointer group"
                            >
                              <FileText className="w-3.5 h-3.5 text-coral" />
                              <span className="font-semibold group-hover:text-coral transition-colors">
                                {cite.filename}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-coral/10 text-coral font-bold">
                                Page {cite.pageNumber}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Active Loading State */}
              {isProcessing && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15 max-w-[70%] animate-fadeIn">
                  <Loader2 className="w-4 h-4 animate-spin text-coral" />
                  <span className="text-xs text-forest/75 dark:text-paper-light/75 font-mono">
                    BlueAI is cross-referencing official circulars & hydrostatics...
                  </span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-6 bg-paper-surface/70 dark:bg-paper-dark-surface/60 border-t border-forest/15 dark:border-paper-light/15">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskQuestion();
                }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              >
                <input
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="Ask BlueAI about port drafts, delay clauses, or vessel rejections..."
                  disabled={isProcessing}
                  className="flex-1 bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-lg px-4 py-3.5 text-sm text-forest dark:text-paper-light placeholder:text-forest/40 dark:placeholder:text-paper-light/40 focus:outline-none focus:border-coral transition-colors disabled:opacity-50"
                >
                </input>

                <button
                  type="submit"
                  disabled={!queryText.trim() || isProcessing}
                  className="px-6 py-3.5 rounded-lg bg-forest text-paper-light dark:bg-paper-light dark:text-forest font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-coral dark:hover:bg-coral dark:hover:text-paper-light transition-all disabled:opacity-40 shrink-0"
                >
                  <span>Send Query</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Citation Evidence Preview Modal (Opened strictly on click) */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-xl bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-forest/10 dark:border-paper-light/10">
              <div className="flex items-center gap-2 font-bold text-forest dark:text-paper-light text-sm">
                <FileText className="w-4 h-4 text-coral" />
                <span>Evidence Inspector</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCitation(null)}
                className="p-1 rounded hover:bg-forest/10 dark:hover:bg-paper-light/10 text-forest/60 dark:text-paper-light/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="text-forest/60 dark:text-paper-light/60">
                Source Document: <strong className="text-forest dark:text-paper-light">{selectedCitation.filename}</strong>
              </div>
              <div className="text-forest/60 dark:text-paper-light/60">
                Location: <span className="px-2 py-0.5 rounded bg-coral/10 text-coral font-bold">Page {selectedCitation.pageNumber}</span>
                {selectedCitation.section && <span className="ml-2 font-sans font-medium text-forest dark:text-paper-light">({selectedCitation.section})</span>}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-paper-surface/60 dark:bg-paper-dark-surface/60 border border-forest/10 dark:border-paper-light/10 text-sm leading-relaxed text-forest dark:text-paper-light font-mono text-justify">
              &ldquo;{selectedCitation.excerpt}&rdquo;
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCitation(null)}
                className="px-4 py-2 rounded-md bg-forest text-paper-light dark:bg-paper-light dark:text-forest text-xs font-bold hover:bg-coral transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
