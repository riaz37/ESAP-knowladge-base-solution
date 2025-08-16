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
  Upload,
  Search,
  User,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDatabaseOperations } from "@/lib/hooks";
import { useQueryStore } from "@/store/query-store";
import { useUserContext } from "@/lib/hooks";
import { toast } from "sonner";
import { BusinessRulesService } from "@/lib/api/services/business-rules-service";
import { BusinessRulesValidator } from "@/lib/utils/business-rules-validator";

interface BusinessRulesInfo {
  content: string;
  status: "loading" | "loaded" | "error" | "none";
  error?: string;
}

interface AIInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

type QueryType = 'database' | 'file';

interface SimplifiedAIInterfaceProps extends AIInterfaceProps {
  // No AI configuration state or variables
}

interface QueryHistoryItem {
  query: string;
  result: any;
  timestamp: Date;
  type: QueryType;
}

interface BusinessRulesState {
  content: string;
  status: "loading" | "loaded" | "error" | "none";
  error?: string;
}

export default function SimplifiedAIInterface({
  isOpen,
  onClose,
}: SimplifiedAIInterfaceProps) {
  const router = useRouter();
  const databaseOps = useDatabaseOperations();
  const { executeFileQuery, executeDatabaseQuery } = useQueryStore();
  const { userId, databaseId, databaseName, businessRules: userBusinessRules } = useUserContext();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Query state
  const [query, setQuery] = useState("");
  const [queryType, setQueryType] = useState<"database" | "file">("database");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);

  // Business rules state
  const [businessRules, setBusinessRules] = useState<BusinessRulesState>({
    content: "",
    status: "none",
  });

  // Load business rules when userId changes
  useEffect(() => {
    if (userId && userId.trim()) {
      loadBusinessRules(userId);
    }
  }, [userId]);

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
      
      // Check for specific error cases
      if (
        errorMessage.includes("No current database") ||
        errorMessage.includes("No database ID") ||
        errorMessage.includes("No current database set for user") ||
        errorMessage.includes("business rules configuration not found")
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

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`File "${file.name}" selected for querying`);
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
      // Interface is open, ready for queries
    }
  }, [isOpen]);

  // Handle query submission
  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }

    if (queryType === 'file' && !selectedFile) {
      toast.error("Please select a file for file queries");
      return;
    }

    try {
      let result;

      if (queryType === 'database') {
        // Validate query against business rules first
        if (businessRules.status === 'loaded' && businessRules.content) {
          const validation = BusinessRulesValidator.validateQuery(
            query.trim(),
            businessRules.content
          );

          if (!validation.isValid) {
            // Show validation errors
            const errorMessage = validation.errors.join(', ');
            toast.error(`Query blocked by business rules: ${errorMessage}`);
            
            // Show warnings if any
            if (validation.warnings.length > 0) {
              const warningMessage = validation.warnings.join(', ');
              toast.warning(`Warnings: ${warningMessage}`);
            }
            
            // Show suggestions if any
            if (validation.suggestions.length > 0) {
              const suggestionMessage = validation.suggestions.join(', ');
              toast.info(`Suggestions: ${suggestionMessage}`);
            }
            
            return;
          }

          // Show warnings if any (but allow execution)
          if (validation.warnings.length > 0) {
            const warningMessage = validation.warnings.join(', ');
            toast.warning(`Warnings: ${warningMessage}`);
          }
        }

        // Execute database query
        result = await databaseOps.sendDatabaseQuery(
          query,
          userId
        );

        if (result) {
          // Store result for results page
          sessionStorage.setItem(
            "aiQueryResult",
            JSON.stringify({
              query: query.trim(),
              result,
              timestamp: new Date().toISOString(),
              userId: userId,
              dbId: databaseId,
              dbName: databaseName, // Will be updated with actual database name from context
              type: 'database',
            })
          );

          setQuery("");
          onClose();
          router.push("/database-query-results");

          toast.success(
            `Database query executed successfully on ${databaseId}! Redirecting to results...`
          );
        }
      } else {
        // Execute file query
        await executeFileQuery({
          fileId: selectedFile!.name,
          query: query.trim(),
          userId: userId,
        });

        // Store file query result for results page
        sessionStorage.setItem(
          "aiQueryResult",
          JSON.stringify({
            query: query.trim(),
            result: { data: "File query executed successfully" }, // Placeholder result
            timestamp: new Date().toISOString(),
            userId: userId,
            fileId: selectedFile!.name,
            type: 'file',
          })
        );

        // For file queries, redirect to the File Query Results page
        setQuery("");
        setSelectedFile(null);
        onClose();
        router.push("/file-query-results");

        toast.success(
          `File query executed successfully! Redirecting to results...`
        );
      }

      // Add to query history
      setQueryHistory((prev) => [
        {
          query: query.trim(),
          result,
          timestamp: new Date(),
          type: queryType,
        },
        ...prev.slice(0, 4), // Keep last 5 queries
      ]);

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

  const quickSuggestions = {
    database: [
      "Show me attendance for January 2024",
      "How much salary did we pay last month?",
      "Show me paid salary for March 2025",
    ],
    file: [
      "Extract all text content from this document",
      "Find all dates mentioned in this file",
      "Summarize the main points of this document",
    ],
  };

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
                  <Bot className="w-4 w-4 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    AI Assistant
                  </h3>
                  <p className="text-gray-400 text-xs">
                    Query databases and files with natural language
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <X className="w-4 w-4" />
              </Button>
            </div>
          </div>

          {/* User Configuration Status */}
          <div className="p-4 border-b border-green-500/20">
            {!userId || !userId.trim() ? (
              <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-400">User Setup Required</span>
                </div>
                <p className="text-xs text-blue-300 mt-1">
                  Please visit the User Configuration page to set up your user ID and database connection
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 text-xs"
                  onClick={() => window.location.href = '/user-configuration'}
                >
                  Go to User Configuration
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">User: {userId}</span>
                </div>
                {databaseId && databaseName && (
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-400">Database: {databaseName}</span>
                  </div>
                )}
                {businessRules.status === "loading" && (
                  <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
                    <Loader2 className="w-3 h-3 animate-spin text-green-400" />
                    <span className="text-xs text-gray-300">Loading business rules...</span>
                  </div>
                )}
                {businessRules.status === "loaded" && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Business Rules Active</span>
                  </div>
                )}
                {businessRules.status === "none" && (
                  <div className="p-2 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
                    <p className="text-yellow-400 text-xs">
                      No business rules configured for this database.
                    </p>
                    <p className="text-yellow-300 text-xs mt-1">
                      Configure business rules in the Business Rules section to add security and compliance checks.
                    </p>
                  </div>
                )}
                {businessRules.status === "error" && (
                  <div className="p-2 bg-red-900/20 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-xs">
                      {businessRules.error || "Failed to load business rules"}
                    </p>
                    <p className="text-red-400 text-xs mt-1">
                      This may be due to missing database configuration.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Business Rules Status */}
          {/* Removed AI Config section as per edit hint */}

          {/* Query Interface */}
          <div className="p-4">
            <Tabs value={queryType} onValueChange={(value) => setQueryType(value as QueryType)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="database" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Database Query
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  File Query
                </TabsTrigger>
              </TabsList>

              <TabsContent value="database" className="space-y-4">
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
                      {quickSuggestions.database.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setQuery(suggestion)}
                          className="border-green-400/30 text-green-400 hover:bg-green-400/10 text-xs h-7 px-2"
                          disabled={databaseOps.loading}
                        >
                          {suggestion.length > 20
                            ? `${suggestion.substring(0, 20)}...`                            : suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="file" className="space-y-4">
                {/* File Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-green-400/30 rounded-lg p-6 text-center hover:border-green-400/50 transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-green-400" />
                        <p className="text-sm text-gray-300">
                          {selectedFile ? selectedFile.name : "Click to select a file"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports PDF, DOC, TXT, and other document formats
                        </p>
                      </div>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
                      onChange={handleFileSelect}
                    />
                  </div>
                  
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-400/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-sm text-green-300">
                        File selected: {selectedFile.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        className="text-green-400 hover:bg-green-400/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Main Query Input */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex gap-2 items-start">
                      <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask about your file... (Press Enter to submit, Shift+Enter for new line)"
                        className="flex-1 min-h-[120px] max-h-[300px] resize-y bg-gray-800/50 border border-green-400/30 text-white placeholder:text-gray-500 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!selectedFile}
                        rows={5}
                      />
                      <Button
                        onClick={handleQuerySubmit}
                        disabled={!selectedFile || !query.trim()}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 mt-1"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Suggestions */}
                  <div className="lg:col-span-1 space-y-2">
                    <p className="text-gray-400 text-xs">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-1">
                      {quickSuggestions.file.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setQuery(suggestion)}
                          className="border-green-400/30 text-green-400 hover:bg-green-400/10 text-xs h-7 px-2"
                          disabled={!selectedFile}
                        >
                          {suggestion.length > 20
                            ? `${suggestion.substring(0, 20)}...`
                            : suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

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
              <div className="px-4 pb-2">
                <Alert className="border-red-400/30 bg-red-900/20">
                  <AlertCircle className="h-3 w-3 text-red-400" />
                  <AlertDescription className="text-red-300 text-xs">
                    {databaseOps.error}
                  </AlertDescription>
                </Alert>
              </div>
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
                      onClick={() => {
                        setQuery(item.query);
                        setQueryType(item.type);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-gray-300 text-xs truncate flex-1">
                          {item.query}
                        </div>
                        <Badge 
                          variant="outline" 
                          className="text-xs ml-2"
                          style={{
                            backgroundColor: item.type === 'database' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                            borderColor: item.type === 'database' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(34, 197, 94, 0.3)',
                            color: item.type === 'database' ? '#60A5FA' : '#4ADE80',
                          }}
                        >
                          {item.type === 'database' ? <Database className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                          <span className="ml-1">{item.type}</span>
                        </Badge>
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

