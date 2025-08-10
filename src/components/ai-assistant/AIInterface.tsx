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
  ChevronDown,
  RefreshCw,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useDatabaseOperations } from "@/lib/hooks";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAccessService } from "@/lib/api/services/user-access-service";
import { MSSQLConfigService } from "@/lib/api/services/mssql-config-service";
import { UserCurrentDBService } from "@/lib/api/services/user-current-db-service";
import { BusinessRulesService } from "@/lib/api/services/business-rules-service";
import { DatabaseSelector } from "./DatabaseSelector";

// Types for the redesigned interface
interface UserData {
  id: string;
  name: string;
  access_configs: Array<{
    parent_company_id: number;
    parent_company_name?: string;
    database_access: {
      parent_databases: Array<{
        db_id: number;
        db_name?: string;
        access_level: "full" | "read_only" | "limited";
      }>;
      sub_databases: Array<{
        sub_company_id: number;
        databases: Array<{
          db_id: number;
          db_name?: string;
          access_level: "full" | "read_only" | "limited";
        }>;
      }>;
    };
  }>;
}

interface DatabaseInfo {
  db_id: number;
  db_name: string;
  db_url: string;
  access_level: "full" | "read_only" | "limited";
}

interface BusinessRulesInfo {
  content: string;
  status: "loading" | "loaded" | "error" | "none";
  error?: string;
}

interface AIInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function AIInterface({
  isOpen,
  onClose,
  userId = "default",
}: AIInterfaceProps) {
  // Core state
  const [query, setQuery] = useState("");
  const [queryHistory, setQueryHistory] = useState<
    Array<{ query: string; result: any; timestamp: Date }>
  >([]);

  // User management state
  const [availableUsers, setAvailableUsers] = useState<UserData[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(userId);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Database management state
  const [availableDatabases, setAvailableDatabases] = useState<DatabaseInfo[]>(
    []
  );
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<number | null>(
    null
  );
  const [currentDatabaseName, setCurrentDatabaseName] = useState<string>("");
  const [databasesLoading, setDatabasesLoading] = useState(false);
  const [databasesError, setDatabasesError] = useState<string | null>(null);

  // Business rules state
  const [businessRules, setBusinessRules] = useState<BusinessRulesInfo>({
    content: "",
    status: "none",
  });

  // UI state
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const databaseOps = useDatabaseOperations();

  // Load available users on mount
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);

      const response = await UserAccessService.getUserAccessConfigs();
      const userMap = new Map<string, UserData>();

      response.access_configs.forEach((config) => {
        if (config.user_id && !userMap.has(config.user_id)) {
          userMap.set(config.user_id, {
            id: config.user_id,
            name: config.user_id, // Use user_id as name for now
            access_configs: [config],
          });
        } else if (config.user_id && userMap.has(config.user_id)) {
          const existingUser = userMap.get(config.user_id)!;
          existingUser.access_configs.push(config);
        }
      });

      setAvailableUsers(Array.from(userMap.values()));
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsersError("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  // Load databases for selected user
  const loadUserDatabases = async (userId: string) => {
    try {
      setDatabasesLoading(true);
      setDatabasesError(null);

      // Get user access configuration
      const userAccessResponse = await UserAccessService.getUserAccess(userId);

      // Get all available databases
      const allDatabasesResponse = await MSSQLConfigService.getMSSQLConfigs();
      const allDatabases =
        allDatabasesResponse.configs || allDatabasesResponse || [];

      // Create a map of accessible databases with their access levels
      const accessibleDatabases: DatabaseInfo[] = [];
      const dbAccessMap = new Map<number, "full" | "read_only" | "limited">();

      // Process user access configs to build database access map
      if (
        userAccessResponse.access_configs &&
        Array.isArray(userAccessResponse.access_configs)
      ) {
        userAccessResponse.access_configs.forEach((config) => {
          // Add parent databases
          config.database_access?.parent_databases?.forEach((db) => {
            dbAccessMap.set(db.db_id, db.access_level);
          });

          // Add sub databases
          config.database_access?.sub_databases?.forEach((subDb) => {
            subDb.databases?.forEach((db) => {
              // If database already exists with 'full' access, don't downgrade
              if (
                !dbAccessMap.has(db.db_id) ||
                dbAccessMap.get(db.db_id) !== "full"
              ) {
                dbAccessMap.set(db.db_id, db.access_level);
              }
            });
          });
        });
      }

      // Filter databases based on access
      if (Array.isArray(allDatabases)) {
        allDatabases.forEach((db) => {
          if (dbAccessMap.has(db.db_id)) {
            accessibleDatabases.push({
              db_id: db.db_id,
              db_name: db.db_name,
              db_url: db.db_url,
              access_level: dbAccessMap.get(db.db_id)!,
            });
          }
        });
      }

      setAvailableDatabases(accessibleDatabases);

      // Try to load current database
      try {
        const currentDbResponse = await UserCurrentDBService.getUserCurrentDB(
          userId
        );
        if (currentDbResponse.db_id) {
          const currentDb = accessibleDatabases.find(
            (db) => db.db_id === currentDbResponse.db_id
          );
          if (currentDb) {
            setSelectedDatabaseId(currentDb.db_id);
            setCurrentDatabaseName(currentDb.db_name);
          }
        }
      } catch (error) {
        // No current database set, that's okay
        console.log("No current database set for user:", userId);
      }
    } catch (error) {
      console.error("Failed to load user databases:", error);
      setDatabasesError(
        error instanceof Error ? error.message : "Failed to load databases"
      );
      setAvailableDatabases([]); // Clear databases on error
    } finally {
      setDatabasesLoading(false);
    }
  };

  // Load business rules for selected user and database
  const loadBusinessRules = async (userId: string) => {
    try {
      setBusinessRules((prev) => ({ ...prev, status: "loading" }));

      const businessRulesContent = await BusinessRulesService.getBusinessRules(
        userId
      );

      console.log("Business rules loaded:", {
        userId,
        content: businessRulesContent,
        contentLength: businessRulesContent?.length || 0,
        trimmedLength: businessRulesContent?.trim()?.length || 0,
        hasContent: !!businessRulesContent?.trim(),
      });

      const hasContent =
        businessRulesContent && businessRulesContent.trim().length > 0;

      setBusinessRules({
        content: businessRulesContent || "",
        status: hasContent ? "loaded" : "none",
      });
    } catch (error) {
      console.error("Failed to load business rules:", error);

      // Check if the error is due to no database being configured
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

      const dropdownMenu = document.querySelector(
        "[data-radix-popper-content-wrapper]"
      );
      if (dropdownMenu && dropdownMenu.contains(target)) {
        return;
      }

      const isDropdownElement = (target as Element).closest(
        "[data-radix-dropdown-menu-trigger], [data-radix-dropdown-menu-content], [data-radix-dropdown-menu-item]"
      );
      if (isDropdownElement) {
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

  // Load users on mount
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // Load user data when user changes
  useEffect(() => {
    if (isOpen && selectedUserId && selectedUserId !== "default") {
      loadUserDatabases(selectedUserId);
      loadBusinessRules(selectedUserId);
    }
  }, [isOpen, selectedUserId]);

  // Update selected user ID when prop changes
  useEffect(() => {
    if (userId && userId !== selectedUserId) {
      setSelectedUserId(userId);
    }
  }, [userId, selectedUserId]);

  // Handle user selection
  const handleUserSelect = async (userId: string) => {
    console.log("Selecting user:", userId, "Current selected:", selectedUserId);

    setSelectedUserId(userId);
    setShowUserDropdown(false);
    setQueryHistory([]);

    // Reset database and business rules state
    setAvailableDatabases([]);
    setSelectedDatabaseId(null);
    setCurrentDatabaseName("");
    setBusinessRules({ content: "", status: "none" });

    // Load new user data
    if (userId !== "default") {
      await loadUserDatabases(userId);
      await loadBusinessRules(userId);
    }
  };

  // Handle database selection from DatabaseSelector component
  const handleDatabaseChange = (dbId: number, dbName: string) => {
    setSelectedDatabaseId(dbId);
    setCurrentDatabaseName(dbName);
    setQueryHistory([]); // Clear query history when switching databases

    // Reload business rules for the new database
    loadBusinessRules(selectedUserId);
  };

  // Handle query submission
  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }

    if (!selectedDatabaseId) {
      toast.error("Please select a database first");
      return;
    }

    if (!selectedUserId || selectedUserId === "default") {
      toast.error("Please select a user");
      return;
    }

    try {
      const result = await databaseOps.sendDatabaseQuery(query, selectedUserId);

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
            userId: selectedUserId,
            dbId: selectedDatabaseId,
            dbName: currentDatabaseName,
          })
        );

        setQuery("");
        onClose();
        router.push("/ai-results");

        toast.success(
          `Query executed successfully on ${currentDatabaseName}! Redirecting to results...`
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

  // Helper functions
  const selectedUserName =
    availableUsers.find((u) => u.id === selectedUserId)?.name || selectedUserId;

  // Debug logging
  console.log("Current state:", {
    selectedUserId,
    selectedUserName,
    availableUsers: availableUsers.map((u) => ({ id: u.id, name: u.name })),
    usersLoading,
    usersError,
  });

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
                  <div className="flex items-center gap-2">
                    <p className="text-gray-400 text-xs">
                      Ask questions about your database
                    </p>
                    <span className="text-gray-400">•</span>
                    <DropdownMenu
                      open={showUserDropdown}
                      onOpenChange={setShowUserDropdown}
                    >
                      <DropdownMenuTrigger asChild>
                        <button
                          className="text-green-400 text-xs font-medium hover:bg-green-500/10 px-2 py-0.5 rounded-md flex items-center gap-1"
                          disabled={usersLoading}
                        >
                          {usersLoading ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Loading...
                            </span>
                          ) : usersError ? (
                            <span className="text-red-400">Error</span>
                          ) : (
                            <>
                              <User className="w-3 h-3" />
                              {selectedUserName}
                              <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48 bg-gray-800 border-gray-700">
                        <DropdownMenuLabel className="text-xs flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          Switch User
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        {availableUsers.length > 0 ? (
                          availableUsers.map((user) => (
                            <DropdownMenuItem
                              key={user.id}
                              className={`text-sm cursor-pointer ${
                                selectedUserId === user.id
                                  ? "bg-green-500/10 text-green-400"
                                  : "text-gray-300 hover:bg-gray-700"
                              }`}
                              onClick={() => handleUserSelect(user.id)}
                            >
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3" />
                                {user.name}
                                {selectedUserId === user.id && (
                                  <CheckCircle className="w-3 h-3 ml-auto" />
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-xs text-gray-400">
                            {usersError || "No users found"}
                          </div>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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

          {/* Database Selection */}
          <div className="p-4 border-b border-green-500/20">
            <DatabaseSelector
              userId={selectedUserId}
              selectedDatabaseId={selectedDatabaseId}
              onDatabaseChange={handleDatabaseChange}
            />
            {currentDatabaseName && (
              <div className="mt-2 p-2 bg-green-900/20 border border-green-400/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Database className="w-3 h-3 text-green-400 mt-0.5" />
                  <p className="text-green-400 text-xs">
                    Querying database:{" "}
                    <span className="font-medium">{currentDatabaseName}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Business Rules Status */}
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

          {/* Query Interface */}
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
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm font-medium">
                    Recent Queries
                  </span>
                </div>
                <div className="space-y-2">
                  {queryHistory.map((item, index) => (
                    <div
                      key={index}
                      className="border border-green-400/20 rounded-lg p-2 cursor-pointer hover:bg-green-400/5 transition-colors"
                      onClick={() => setQuery(item.query)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 text-xs font-medium truncate">
                          {item.query}
                        </span>
                        <span className="text-gray-500 text-xs ml-auto">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs">
                        Click to reuse this query
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-green-500/20 bg-black/10 p-3">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                <Bot className="w-3 h-3 text-green-400" />
              </div>
              <span className="text-white text-xs font-medium">
                AI-Powered Database Queries
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
