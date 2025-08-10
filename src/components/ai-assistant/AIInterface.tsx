"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Send,
  FileText,
  Settings,
  Loader2,
  MessageSquare,
  Database,
  Zap,
  AlertCircle,
  CheckCircle,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDatabaseOperations, useBusinessRules, useUserSettings } from "@/lib/hooks";
import { DatabaseSelector } from "./DatabaseSelector";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import UserAccessService from "@/lib/api/services/user-access-service";
import UserCurrentDBService from "@/lib/api/services/user-current-db-service";

interface AIInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function AIInterface({
  isOpen,
  onClose,
  userId = "nilab",
}: AIInterfaceProps) {
  const [query, setQuery] = useState("");
  const [businessRulesStatus, setBusinessRulesStatus] = useState<
    "loading" | "loaded" | "error" | "none"
  >("loading");
  const [queryHistory, setQueryHistory] = useState<
    Array<{ query: string; result: any; timestamp: Date }>
  >([]);
  const [currentDbId, setCurrentDbId] = useState<number | undefined>();
  const [currentDbName, setCurrentDbName] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>(userId);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Array<{id: string, name: string}>>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const databaseOps = useDatabaseOperations();
  const { userId: currentUserId } = useUserSettings();
  const {
    businessRulesText,
    businessRulesLoading,
    businessRulesError,
    fetchBusinessRules,
  } = useBusinessRules();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if the click is inside the AI interface
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }
      
      // Check if the click is inside a dropdown menu (which is rendered in a portal)
      const dropdownMenu = document.querySelector('[data-radix-popper-content-wrapper]');
      if (dropdownMenu && dropdownMenu.contains(target)) {
        return;
      }
      
      // Check if the click is on any dropdown trigger or menu item
      const isDropdownElement = (target as Element).closest('[data-radix-dropdown-menu-trigger], [data-radix-dropdown-menu-content], [data-radix-dropdown-menu-item]');
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

  // Load users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await UserAccessService.getUserAccessConfigs();
        // Extract unique users from the access configs
        const users = new Map<string, string>();
        response.access_configs.forEach(config => {
          if (config.user_id && !users.has(config.user_id)) {
            users.set(config.user_id, config.user_id); // Using user_id as both id and name
          }
        });
        
        const userList = Array.from(users.entries()).map(([id, name]) => ({ id, name }));
        setAvailableUsers(userList);
        
        // If no user is selected, select the first available user
        if (userList.length > 0 && !selectedUserId) {
          setSelectedUserId(userList[0].id);
        }
        
        setUsersError(null);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsersError("Failed to load users. Please try again later.");
        toast.error("Failed to load users");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Load current database when selected user changes
  useEffect(() => {
    const fetchCurrentDb = async () => {
      if (!selectedUserId) return;
      try {
        const resp: any = await UserCurrentDBService.getUserCurrentDB(selectedUserId);
        if (resp && resp.db_id) {
          setCurrentDbId(resp.db_id);
          setCurrentDbName(resp.db_name ?? "");
        } else {
          setCurrentDbId(undefined);
          setCurrentDbName("");
        }
      } catch (err: any) {
        // 404 means user has no current DB, handle silently
        setCurrentDbId(undefined);
        setCurrentDbName("");
      }
    };

    fetchCurrentDb();
  }, [selectedUserId]);

  // Load business rules when selected user changes
  useEffect(() => {
    if (isOpen && selectedUserId) {
      loadBusinessRules(selectedUserId);
    }
  }, [isOpen, selectedUserId]);

  // Update selected user ID when the prop changes
  useEffect(() => {
    if (userId && userId !== selectedUserId) {
      setSelectedUserId(userId);
    }
  }, [userId]);

  // Update business rules status
  useEffect(() => {
    if (businessRulesLoading) {
      setBusinessRulesStatus("loading");
    } else if (businessRulesError) {
      setBusinessRulesStatus("error");
    } else if (businessRulesText && businessRulesText.trim()) {
      setBusinessRulesStatus("loaded");
    } else {
      setBusinessRulesStatus("none");
    }
  }, [businessRulesLoading, businessRulesError, businessRulesText]);

  const loadBusinessRules = async (userId: string) => {
    try {
      await fetchBusinessRules(userId);
    } catch (error) {
      console.error("Failed to load business rules:", error);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserDropdown(false);
    // Clear query history when switching users
    setQueryHistory([]);
  };

  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }

    if (!currentDbId) {
      toast.error("Please select a database first");
      return;
    }

    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    try {
      const result = await databaseOps.sendDatabaseQuery(query, selectedUserId);

      if (result) {
        // Add to query history for display in AI interface
        setQueryHistory((prev) => [
          {
            query: query.trim(),
            result,
            timestamp: new Date(),
          },
          ...prev.slice(0, 4), // Keep last 5 queries for dropdown
        ]);

        // Store the result in sessionStorage to pass to the results page
        sessionStorage.setItem(
          "aiQueryResult",
          JSON.stringify({
            query: query.trim(),
            result,
            timestamp: new Date().toISOString(),
            userId,
            dbId: currentDbId,
            dbName: currentDbName,
          })
        );

        // Clear input after successful query
        setQuery("");

        // Close the AI interface and navigate to results page
        onClose();
        router.push("/ai-results");

        toast.success(`Query executed successfully on ${currentDbName}! Redirecting to results...`);
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

  const handleDatabaseChange = (dbId: number, dbName: string) => {
    setCurrentDbId(dbId);
    setCurrentDbName(dbName);
    // Clear query history when switching databases
    setQueryHistory([]);
    toast.success(`Switched to database: ${dbName}`);
  };

  const selectedUserName = availableUsers.find(u => u.id === selectedUserId)?.name || selectedUserId;

  const handleBusinessRulesUpdated = () => {
    loadBusinessRules();
    toast.success(
      "Business rules updated! Your next queries will use the new rules."
    );
  };

  const getBusinessRulesStatusInfo = () => {
    switch (businessRulesStatus) {
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
                    <DropdownMenu open={showUserDropdown} onOpenChange={setShowUserDropdown}>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="text-green-400 text-xs font-medium hover:bg-green-500/10 px-2 py-0.5 rounded-md flex items-center gap-1"
                          disabled={isLoadingUsers}
                        >
                          {isLoadingUsers ? (
                            <span className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Loading...
                            </span>
                          ) : usersError ? (
                            <span className="text-red-400">Error</span>
                          ) : (
                            <>
                              {selectedUserName}
                              <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48 bg-gray-800 border-gray-700">
                        <DropdownMenuLabel className="text-xs">Switch User</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        {availableUsers.length > 0 ? (
                          availableUsers.map((user) => (
                            <DropdownMenuItem
                              key={user.id}
                              className={`text-sm cursor-pointer ${selectedUserId === user.id ? 'bg-green-500/10 text-green-400' : 'text-gray-300 hover:bg-gray-700'}`}
                              onClick={() => handleUserSelect(user.id)}
                            >
                              {user.name}
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-xs text-gray-400">
                            {usersError || 'No users found'}
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
               key={selectedUserId}
               userId={selectedUserId}
               currentDbId={currentDbId}
               onDatabaseChange={handleDatabaseChange}
               className="w-full"
             />
            {currentDbName && (
              <div className="mt-2 p-2 bg-green-900/20 border border-green-400/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Database className="w-3 h-3 text-green-400 mt-0.5" />
                  <p className="text-green-400 text-xs">
                    Querying database: <span className="font-medium">{currentDbName}</span>
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

            {businessRulesStatus === "loaded" && (
              <div className="mt-2 p-2 bg-green-900/20 border border-green-400/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Zap className="w-3 h-3 text-green-400 mt-0.5" />
                  <p className="text-green-400 text-xs">
                    Rules are active and will guide your queries.
                  </p>
                </div>
              </div>
            )}

            {businessRulesStatus === "none" && (
              <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-400/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3 h-3 text-yellow-400 mt-0.5" />
                  <p className="text-yellow-400 text-xs">
                    No business rules configured.
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
