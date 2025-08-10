"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Send,
  FileText,
  Settings,
  Loader2,
  Database,
  Zap,
  AlertCircle,
  CheckCircle,
  X,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useDatabaseOperations } from "@/lib/hooks";
import { toast } from "sonner";
import { BusinessRulesService } from "@/lib/api/services/business-rules-service";
import {
  AIConfigService,
  type AIConfiguration,
} from "@/lib/api/services/ai-config-service";

interface BusinessRulesInfo {
  content: string;
  status: "loading" | "loaded" | "error" | "none";
  error?: string;
}

interface AIInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SimplifiedAIInterface({ isOpen, onClose }: AIInterfaceProps) {
  // Core state
  const [query, setQuery] = useState("");
  const [queryHistory, setQueryHistory] = useState<
    Array<{ query: string; result: any; timestamp: Date }>
  >([]);

  // Configuration state
  const [aiConfig, setAiConfig] = useState<AIConfiguration | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Business rules state
  const [businessRules, setBusinessRules] = useState<BusinessRulesInfo>({
    content: "",
    status: "none",
  });

  // UI state
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const databaseOps = useDatabaseOperations();

  // Load AI configuration using AIConfigService
  const loadAIConfiguration = async () => {
    try {
      setConfigLoading(true);
      const config = await AIConfigService.loadConfiguration();
      if (config) {
        setAiConfig(config);
        // Load business rules for the configured user
        loadBusinessRules(config.userId);
      } else {
        setAiConfig(null);
      }
    } catch (error) {
      console.error("Failed to load AI configuration:", error);
      setAiConfig(null);
    } finally {
      setConfigLoading(false);
    }
  };

  // Load business rules for configured user
  const loadBusinessRules = async (userId: string) => {
    try {
      setBusinessRules((prev) => ({ ...prev, status: "loading" }));

      const businessRulesContent = await BusinessRulesService.getBusinessRules(
        userId
      );

      const hasContent =
        businessRulesContent && businessRulesContent.trim().length > 0;

      setBusinessRules({
        content: businessRulesContent || "",
        status: hasContent ? "loaded" : "none",
      });
    } catch (error) {
      console.error("Failed to load business rules:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load business rules";
      if (
        errorMessage.includes("No current database") ||
        errorMessage.includes("No database ID")
      ) {
        setBusinessRules({
          content: "",
          status: "none",
        });
      } else {
        setBusinessRules({
          content: "",
          status: "error",
          error: errorMessage,
        });
      }
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }

      onClose();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Load configuration when interface opens
  useEffect(() => {
    if (isOpen) {
      loadAIConfiguration();
    }
  }, [isOpen]);

  // Handle query submission
  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }

    if (!aiConfig) {
      toast.error("Please configure the AI assistant in Business Rules first");
      return;
    }

    try {
      const result = await databaseOps.sendDatabaseQuery(
        query,
        aiConfig.userId
      );

      if (result) {
        // Add to query history
        setQueryHistory((prev) => [
          {
            query: query.trim(),
            result,
            timestamp: new Date(),
          },
          ...prev.slice(0, 4), // Keep last 5 queries
        ]);

        // Store result for results page
        sessionStorage.setItem(
          "aiQueryResult",
          JSON.stringify({
            query: query.trim(),
            result,
            timestamp: new Date().toISOString(),
            userId: aiConfig.userId,
            dbId: aiConfig.databaseId,
            dbName: aiConfig.databaseName,
          })
        );

        setQuery("");
        onClose();
        router.push("/ai-results");

        toast.success(
          `Query executed successfully on ${aiConfig.databaseName}! Redirecting to results...`
        );
      }
    } catch (error) {
      toast.error("Failed to execute query");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuerySubmit();
    }
  };

  const getBusinessRulesStatusInfo = () => {
    switch (businessRules.status) {
      case "loading":
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin text-blue-400" />,
          text: "Loading...",
          color: "bg-blue-900/20 border-blue-400/30 text-blue-300",
        };
      case "loaded":
        return {
          icon: <CheckCircle className="w-3 h-3 text-green-400" />,
          text: "Active",
          color: "bg-green-900/20 border-green-400/30 text-green-300",
        };
      case "error":
        return {
          icon: <AlertCircle className="w-3 h-3 text-red-400" />,
          text: "Error",
          color: "bg-red-900/20 border-red-400/30 text-red-300",
        };
      case "none":
        return {
          icon: <AlertCircle className="w-3 h-3 text-yellow-400" />,
          text: "None",
          color: "bg-yellow-900/20 border-yellow-400/30 text-yellow-300",
        };
      default:
        return {
          icon: <FileText className="w-3 h-3 text-gray-400" />,
          text: "Unknown",
          color: "bg-gray-900/20 border-gray-400/30 text-gray-300",
        };
    }
  };

  const statusInfo = getBusinessRulesStatusInfo();

  const quickSuggestions = [
    "Show me attendance for January 2024",
    "How much salary did we pay last month?",
    "Show me paid salary for March 2025",
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* AI Interface Dropdown */}
      <div
        ref={dropdownRef}
        className="fixed top-20 left-4 right-4 z-50 max-w-6xl mx-auto animate-in slide-in-from-top-4 duration-300"
      >
        <div
          className="backdrop-blur-2xl border border-green-500/30 rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 50, 30, 0.8) 50%, rgba(0, 0, 0, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-green-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    AI Database Assistant
                  </h3>
                  <p className="text-gray-400 text-xs">
                    Ask questions about your database
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Configuration Status */}
          <div className="p-4 border-b border-green-500/20">
            {configLoading ? (
              <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                <span className="text-gray-400 text-xs">
                  Loading configuration...
                </span>
              </div>
            ) : !aiConfig ? (
              <div className="p-3 bg-yellow-900/20 border border-yellow-400/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-yellow-400 text-sm font-medium">
                      Configuration Required
                    </p>
                    <p className="text-yellow-300 text-xs mt-1">
                      Please configure your user and database settings in
                      Business Rules first.
                    </p>
                    <Button
                      onClick={() => {
                        onClose();
                        router.push("/business-rules");
                      }}
                      variant="outline"
                      size="sm"
                      className="mt-2 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 text-xs"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Go to Configuration
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-green-900/20 border border-green-400/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-green-400 text-sm font-medium">
                        Configuration Active
                      </p>
                      <div className="text-green-300 text-xs mt-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          <span>User: {aiConfig.userId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Database className="w-3 h-3" />
                          <span>Database: {aiConfig.databaseName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Business Rules Status */}
          {aiConfig && (
            <div className="p-4 border-b border-green-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm font-medium">
                    Business Rules
                  </span>
                  <Badge className={`${statusInfo.color} text-xs px-2 py-0.5`}>
                    {statusInfo.icon}
                    <span className="ml-1">{statusInfo.text}</span>
                  </Badge>
                </div>
                <Button
                  onClick={() => {
                    onClose();
                    router.push("/business-rules");
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-green-400 hover:bg-green-400/10 text-xs"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Config
                </Button>
              </div>

              {businessRules.status === "loaded" && (
                <div className="mt-2 p-2 bg-green-900/20 border border-green-400/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Zap className="w-3 h-3 text-green-400 mt-0.5" />
                    <p className="text-green-400 text-xs">
                      Rules are active and will guide your queries.
                    </p>
                  </div>
                </div>
              )}

              {businessRules.status === "none" && (
                <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-400/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 text-yellow-400 mt-0.5" />
                    <p className="text-yellow-400 text-xs">
                      No business rules configured.
                    </p>
                  </div>
                </div>
              )}

              {businessRules.status === "error" && (
                <div className="mt-2 p-2 bg-red-900/20 border border-red-400/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 text-red-400 mt-0.5" />
                    <p className="text-red-400 text-xs">
                      {businessRules.error || "Failed to load business rules"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Query Interface */}
          {aiConfig && (
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main Query Input */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex gap-2 items-start">
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask about your database... (Press Enter to submit, Shift+Enter for new line)"
                      className="flex-1 min-h-[120px] max-h-[300px] resize-y bg-gray-800/50 border border-green-400/30 text-white placeholder:text-gray-500 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={databaseOps.loading}
                      rows={5}
                    />
                    <Button
                      onClick={handleQuerySubmit}
                      disabled={databaseOps.loading || !query.trim()}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 mt-1"
                    >
                      {databaseOps.loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Quick Suggestions */}
                <div className="lg:col-span-1 space-y-2">
                  <p className="text-gray-400 text-xs">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-1">
                    {quickSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery(suggestion)}
                        className="border-green-400/30 text-green-400 hover:bg-green-400/10 text-xs h-7 px-2"
                        disabled={databaseOps.loading}
                      >
                        {suggestion.length > 20
                          ? `${suggestion.substring(0, 20)}...`
                          : suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Query Status */}
          {databaseOps.loading && (
            <div className="px-4 pb-2">
              <Alert className="border-blue-400/30 bg-blue-900/20">
                <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                <AlertDescription className="text-blue-300 text-xs">
                  Processing your query...
                </AlertDescription>
              </Alert>
            </div>
          )}

          {databaseOps.error && (
            <div className="px-4 pb-2">
              <Alert className="border-red-400/30 bg-red-900/20">
                <AlertCircle className="h-3 w-3 text-red-400" />
                <AlertDescription className="text-red-300 text-xs">
                  {databaseOps.error}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Query History */}
          {queryHistory.length > 0 && (
            <div className="border-t border-green-500/20">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white text-sm font-medium">
                    Recent Queries
                  </h4>
                  <Button
                    onClick={() => setQueryHistory([])}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    Clear
                  </Button>
                </div>
                <div className="space-y-2">
                  {queryHistory.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-800/30 rounded-lg border border-gray-700/50 cursor-pointer hover:bg-gray-800/50 transition-colors"
                      onClick={() => setQuery(item.query)}
                    >
                      <div className="text-gray-300 text-xs truncate">
                        {item.query}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
