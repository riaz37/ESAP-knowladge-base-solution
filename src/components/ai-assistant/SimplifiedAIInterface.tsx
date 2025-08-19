"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Database, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDatabaseOperations } from "@/lib/hooks";
import { useQueryStore } from "@/store/query-store";
import { useAuthContext } from "@/components/providers";
import { toast } from "sonner";
import { BusinessRulesService } from "@/lib/api/services/business-rules-service";
import { BusinessRulesValidator } from "@/lib/utils/business-rules-validator";

// Import reusable components and types
import {
  AIInterfaceHeader,
  UserConfigurationStatus,
  DatabaseQueryTab,
  FileQueryTab,
  QueryStatus,
  QueryHistory,
  type AIInterfaceProps,
  type QueryType,
  type BusinessRulesState,
  type QueryHistoryItem,
} from "./components";

interface SimplifiedAIInterfaceProps extends AIInterfaceProps {
  // No AI configuration state or variables
}

// Main Component
export default function SimplifiedAIInterface({
  isOpen,
  onClose,
}: SimplifiedAIInterfaceProps) {
  const router = useRouter();
  const databaseOps = useDatabaseOperations();
  const { executeFileQuery, executeDatabaseQuery } = useQueryStore();
  const { user } = useAuthContext();
  const userId = user?.id;
  const databaseId = null; // Will be handled by database context later
  const databaseName = ""; // Will be handled by database context later
  const userBusinessRules = ""; // Will be handled by business rules context later
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Query state
  const [query, setQuery] = useState("");
  const [queryType, setQueryType] = useState<"database" | "file">("database");
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

    if (queryType === 'file') {
      toast.error("File queries are not supported in this simplified interface.");
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
          fileId: "N/A", // No file selected in this simplified interface
          query: query.trim(),
          userId: userId,
        });

        // Get the result from the store
        const fileResult = useQueryStore.getState().queryResults;

        // Store file query result for results page
        sessionStorage.setItem(
          "aiQueryResult",
          JSON.stringify({
            query: query.trim(),
            result: fileResult, // Use actual result from store
            timestamp: new Date().toISOString(),
            userId: userId,
            fileId: "N/A", // No file ID for this simplified interface
            type: 'file',
          })
        );

        // For file queries, redirect to the File Query Results page
        setQuery("");
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
          <AIInterfaceHeader onClose={onClose} />
          
          <UserConfigurationStatus
            userId={userId}
            databaseId={databaseId}
            databaseName={databaseName}
            businessRules={businessRules}
          />

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

              <DatabaseQueryTab
                query={query}
                setQuery={setQuery}
                onSubmit={handleQuerySubmit}
                loading={databaseOps.loading}
                suggestions={quickSuggestions.database}
              />

              <FileQueryTab
                query={query}
                setQuery={setQuery}
                onSubmit={handleQuerySubmit}
                suggestions={quickSuggestions.file}
              />
            </Tabs>
          </div>

          <QueryStatus loading={databaseOps.loading} error={databaseOps.error} />

          <QueryHistory
            history={queryHistory}
            onSelect={(item) => {
              setQuery(item.query);
              setQueryType(item.type);
            }}
            onClear={() => setQueryHistory([])}
          />
        </div>
      </div>
    </>
  );
}

