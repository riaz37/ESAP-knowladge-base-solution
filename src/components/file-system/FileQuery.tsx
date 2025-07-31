"use client";
import { useState } from "react";
import Lottie from "lottie-react";
import robotAnimation2 from "../../../public/robot-lottie3.json";
import { motion, AnimatePresence } from "framer-motion";
import { useFileQuery } from "@/lib/hooks";
import ReactMarkdown from "react-markdown";
import React from "react";
import remarkGfm from "remark-gfm";
import { StatefulButton } from "../ui/stateful-button";
import { useResolvedTheme } from "@/store/theme-store";

interface FileQueryProps {}

interface FileQueryHistory {
  id: string;
  question: string;
  timestamp: string;
  files: string[];
}

export const FileQuery: React.FC<FileQueryProps> = () => {
  const theme = useResolvedTheme();
  const [query, setQuery] = useState("");
  const [queryHistory, setQueryHistory] = useState<FileQueryHistory[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [useIntentReranker, setUseIntentReranker] = useState(false);
  const [useChunkReranker, setUseChunkReranker] = useState(false);

  const { loading, error, response, sendQuery, setResponse } = useFileQuery();

  // Mock uploaded files for demonstration
  const availableFiles = [
    { id: "1", name: "sales_report_2024.pdf", type: "PDF", size: "2.3 MB" },
    { id: "2", name: "employee_handbook.docx", type: "DOCX", size: "1.8 MB" },
    { id: "3", name: "financial_data.xlsx", type: "XLSX", size: "4.1 MB" },
    { id: "4", name: "meeting_notes.txt", type: "TXT", size: "156 KB" },
    { id: "5", name: "product_catalog.pdf", type: "PDF", size: "3.2 MB" },
  ];

  const quickActions = [
    {
      icon: "📊",
      text: "what was the recent file we uploaded",
    },
    {
      icon: "📋",
      text: "Any qualified person with computer science background",
    },
    {
      icon: "💰",
      text: "Do you have any financial report?",
    },
    {
      icon: "📝",
      text: "What are the key policies in the employee handbook?",
    },
  ];

  const handleQuerySubmit = async () => {
    if (!query.trim()) return;

    setResponse(null);
    // Add to history
    const newHistoryItem: FileQueryHistory = {
      id: Date.now().toString(),
      question: query,
      timestamp: new Date().toISOString(),
      files: selectedFiles,
    };
    setQueryHistory((prev) => [newHistoryItem, ...prev]);

    await sendQuery({
      query,
      useIntentReranker,
      useChunkReranker,
      useDualEmbeddings: true,
      intentTopK: 20,
      chunkTopK: 40,
      chunkSource: "reranked",
      maxChunksForAnswer: 40,
      answerStyle: "detailed",
    });
  };

  const handleFileToggle = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleHistoryClick = (historyItem: FileQueryHistory) => {
    setQuery(historyItem.question);
    setSelectedFiles(historyItem.files);
  };

  return (
    <div className="w-full">
      {/* File Selection */}

      {/* Query Input */}
      <div className="w-full">
        <div
          className="rounded-2xl border"
          style={{
            border:
              theme === "dark"
                ? "3px solid rgba(0, 191, 111, 0.27)"
                : "1.5px solid #e1f4ea",
            background:
              theme === "dark"
                ? "linear-gradient(180deg, rgba(0, 191, 111, 0.25) 0%, rgba(0, 191, 111, 0.09) 52.11%, rgba(0, 191, 111, 0.02) 100%)"
                : "#fff",
            boxShadow:
              theme === "dark" ? "none" : "0 2px 12px 0 rgba(0,0,0,0.06)",
            backdropFilter: theme === "dark" ? "blur(32px)" : undefined,
            padding: 24,
            marginBottom: 24,
            gap: 18,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🤖</span>
            <span
              className={`font-semibold ${
                theme === "dark" ? "text-[#00bf6f]" : "text-green-800"
              }`}
            >
              File Query Assistant
            </span>
          </div>
          {/* Input Row */}
          <div className="flex flex-col md:flex-row w-full gap-6">
            {/* Textarea and send button */}
            <div className="flex-1 flex flex-col gap-3 min-w-[60%]">
              <textarea
                className={`rounded-xl border px-4 py-3 w-full min-h-[60px] max-h-40 resize-y focus:outline-none ${
                  theme === "dark"
                    ? "bg-gray-900/30 bg-opacity-10 border-gray-700 text-white placeholder:text-gray-400"
                    : "bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400"
                }`}
                placeholder="Ask your questions about the selected files..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleQuerySubmit();
                  }
                }}
              />
              <div className="flex justify-end w-full">
                <StatefulButton
                  onClick={handleQuerySubmit}
                  disabled={!query.trim() || loading}
                  className="h-[40px] send-button"
                  mode={theme === "dark" ? "dark" : "light"}
                >
                  {loading ? "Sending..." : "Send"}
                </StatefulButton>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-3 min-w-[220px]">
              {quickActions.map((action, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl cursor-pointer transition-all border flex items-center gap-2"
                  style={{
                    animationDelay: `${idx * 0.2}s`,
                    background:
                      theme === "dark"
                        ? "linear-gradient(180deg, rgba(0,191,111,0.18) 0%, rgba(0,191,111,0.09) 52.78%, rgba(0,191,111,0.02) 103.39%)"
                        : "#f0f9f5",
                    border:
                      theme === "dark"
                        ? "1.5px solid rgba(0,191,111,0.18)"
                        : "1.5px solid #e1f4ea",
                    color: theme === "dark" ? "#00bf6f" : "#1a2b22",
                    boxShadow:
                      theme === "dark"
                        ? "0 2px 8px 0 rgba(0,191,111,0.08)"
                        : "0 2px 8px 0 rgba(0,0,0,0.06)",
                  }}
                  onClick={() => setQuery(action.text)}
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="text-sm font-medium truncate">
                    {action.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reranker Checkboxes */}
      <div className="flex items-center gap-6 mb-16">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useIntentReranker}
            onChange={() => setUseIntentReranker((v) => !v)}
            className="accent-green-500"
          />
          <span className="text-gray-700 dark:text-gray-200 text-sm">
            Use Intent Reranker
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useChunkReranker}
            onChange={() => setUseChunkReranker((v) => !v)}
            className="accent-green-500"
          />
          <span className="text-gray-700 dark:text-gray-200 text-sm">
            Use Chunk Reranker
          </span>
        </label>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6">
          <div className="w-64 h-64">
            <Lottie
              animationData={robotAnimation2}
              loop={true}
              autoplay={true}
            />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Analyzing your files...
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Our AI is searching through your uploaded files for answers
            </p>
          </div>
        </div>
      )}

      {/* Response with animation */}
      <AnimatePresence>
        {!loading && response && (
          <>
            <motion.div
              key="answer-box"
              initial={{ opacity: 0, scale: 0.96, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 30 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6"
            >
              <div
                className={`relative p-8 rounded-3xl border shadow-2xl overflow-hidden ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-[#1a2a2f]/20 to-[#223c3a]/10 border-green-400/20"
                    : "bg-gradient-to-br from-white/90 to-green-50/80 border-green-200"
                } animate-fade-in`}
              >
                {/* Border Glow */}
                <div
                  className="pointer-events-none absolute -inset-1 rounded-3xl z-0"
                  style={{
                    boxShadow:
                      theme === "dark"
                        ? "0 0 32px 4px #00ffb355, 0 0 0 1.5px #00ffb3"
                        : "0 0 32px 4px #6ee7b755, 0 0 0 1.5px #6ee7b7",
                  }}
                />

                <div className="markdown-body max-h-[55vh] overflow-auto text-gray-800 dark:text-white text-base leading-7">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {response.answer}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
            {/* Sources Box */}
            {Array.isArray(response.sources) && response.sources.length > 0 && (
              <motion.div
                key="sources-box"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{
                  delay: 0.15,
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`relative p-6 rounded-2xl border shadow-xl overflow-hidden ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-[#1a2a2f]/20 to-[#223c3a]/10 border-green-400/20"
                    : "bg-gradient-to-br from-white/90 to-green-50/80 border-green-200"
                } animate-fade-in mb-8`}
              >
                <div className="relative z-10">
                  <div className="font-semibold text-green-500 dark:text-green-300 mb-2 text-lg flex items-center gap-2">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path
                        stroke="currentColor"
                        strokeWidth="2"
                        d="M7 7h10M7 12h10M7 17h6"
                      />
                    </svg>
                    Sources
                  </div>
                  <div className="h-[2px] w-16 bg-gradient-to-r from-green-400/80 to-transparent mb-4 rounded-full" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                    {(() => {
                      const docMatches =
                        (response.answer || "").match(/Document (\d+)/g) ||
                        (response.answer || "").match(/document (\d+)/g) ||
                        [];
                      const docNums: number[] = Array.from(
                        new Set(
                          docMatches.map((m: string) =>
                            parseInt(m.replace(/\D/g, ""), 10)
                          )
                        )
                      );
                      return docNums.map((num) => {
                        const src = response.sources.find(
                          (s: any) => s.document_number === num
                        );
                        if (!src) return null as React.ReactNode;
                        return (
                          <a
                            key={num}
                            href={
                              src.file_path && src.file_path.startsWith("http")
                                ? src.file_path.replace(/\\/g, "/")
                                : undefined
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block p-4 rounded-xl border transition-all shadow-md hover:scale-[1.03] focus:ring-2 focus:ring-green-400 outline-none ${
                              theme === "dark"
                                ? "bg-gray-900/80 border-green-700/30 hover:border-green-400 text-green-100"
                                : "bg-green-50 border-green-200 hover:border-green-400 text-green-900"
                            }`}
                          >
                            <div className="font-bold text-base mb-1 flex items-center gap-2">
                              <span className="inline-block px-2 py-0.5 rounded bg-green-500/80 text-white text-xs">
                                Doc {num}
                              </span>
                              <span className="truncate">{src.title}</span>
                            </div>
                            <div className="text-xs opacity-80 truncate mb-1">
                              {src.file_name}
                            </div>
                            <div className="text-xs opacity-70">
                              Pages: {src.page_range}
                            </div>
                          </a>
                        );
                      });
                    })()}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-red-700 dark:text-red-400 font-medium">
              {error}
            </span>
          </div>
        </div>
      )}

      {/* Query History */}
      {queryHistory.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Recent Queries
          </h3>
          <div className="space-y-2">
            {queryHistory.slice(0, 5).map((historyItem) => (
              <button
                key={historyItem.id}
                onClick={() => handleHistoryClick(historyItem)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  theme === "dark"
                    ? "hover:bg-gray-800/50 text-gray-300"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{historyItem.question}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(historyItem.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
