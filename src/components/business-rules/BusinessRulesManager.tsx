"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Save,
  Download,
  Upload,
  User,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Clock,
  Keyboard,
  Edit3,
  Database,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBusinessRules } from "@/lib/hooks/use-business-rules";
import { useUserSettings } from "@/lib/hooks/use-user-settings";
import { useUserCurrentDB } from "@/lib/hooks/use-user-current-db";
import { DatabaseSelector } from "@/components/ai-assistant/DatabaseSelector";
import { AIConfigService } from "@/lib/api/services/ai-config-service";
import { toast } from "sonner";

export function BusinessRulesManager() {
  const {
    userId,
    editingUserId,
    showUserTooltip,
    userTooltipRef,
    handleUserIdClick,
    handleSaveUserId,
    toggleEditUserId,
    closeTooltip,
  } = useUserSettings();
  const [editedContent, setEditedContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

  // Database selection state
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<number | null>(
    null
  );
  const [selectedDatabaseName, setSelectedDatabaseName] = useState<string>("");
  const [configSaved, setConfigSaved] = useState(false);

  // Handle database selection
  const handleDatabaseChange = (dbId: number, dbName: string) => {
    setSelectedDatabaseId(dbId);
    setSelectedDatabaseName(dbName);
    setConfigSaved(false); // Mark config as unsaved when database changes
  };

  // Save AI configuration
  const saveAIConfiguration = async () => {
    if (!userId.trim()) {
      toast.error("Please select a user first");
      return;
    }

    if (!selectedDatabaseId) {
      toast.error("Please select a database first");
      return;
    }

    try {
      await AIConfigService.saveConfiguration({
        userId,
        databaseId: selectedDatabaseId,
        databaseName: selectedDatabaseName,
      });

      setConfigSaved(true);
      toast.success("AI configuration saved successfully!");
    } catch (error) {
      console.error("Failed to save AI configuration:", error);
      toast.error("Failed to save AI configuration");
    }
  };

  // Load AI configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await AIConfigService.loadConfiguration();
        if (config && config.userId === userId) {
          setSelectedDatabaseId(config.databaseId);
          setSelectedDatabaseName(config.databaseName);
          setConfigSaved(true);
        }
      } catch (error) {
        console.error("Failed to load AI configuration:", error);
      }
    };

    loadConfig();
  }, [userId]);

  const {
    businessRulesText,
    businessRulesLoading,
    businessRulesError,
    downloadingRules,
    uploadingRules,
    uploadError,
    uploadSuccess,
    fetchBusinessRules,
    downloadBusinessRules,
    updateBusinessRules,
  } = useBusinessRules();

  // Load business rules when component mounts or userId changes
  useEffect(() => {
    if (userId.trim()) {
      fetchBusinessRules(userId);
    }
  }, [userId, fetchBusinessRules]);

  // Update edited content when business rules are loaded
  useEffect(() => {
    setEditedContent(businessRulesText);
    setHasUnsavedChanges(false);
  }, [businessRulesText]);

  const handleContentChange = (content: string) => {
    setEditedContent(content);
    setHasUnsavedChanges(content !== businessRulesText);
  };

  const handleSave = useCallback(async () => {
    if (!userId.trim()) {
      toast.error("Please enter a user ID");
      return;
    }

    const success = await updateBusinessRules(editedContent, userId);
    if (success) {
      toast.success("Business rules updated successfully");
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } else {
      toast.error(
        "Failed to update business rules. Please check the console for details."
      );
    }
  }, [userId, editedContent, updateBusinessRules]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        if (hasUnsavedChanges && !uploadingRules) {
          handleSave();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, hasUnsavedChanges, uploadingRules]);

  const handleRefresh = () => {
    if (userId.trim()) {
      fetchBusinessRules(userId);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadBusinessRules();
      toast.success("Business rules file downloaded");
    } catch (error) {
      toast.error("Failed to download business rules file");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".md") && !file.name.endsWith(".txt")) {
      toast.error("Please upload a .md or .txt file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleContentChange(content);
      toast.success("File content loaded");
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = "";
  };

  return (
    <div className="space-y-6 relative">
      {/* User Selection */}
      <Card className="bg-gray-900/50 border-green-400/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <User className="w-5 h-5" />
            User Configuration
          </CardTitle>
          <CardDescription className="text-gray-400">
            Current user for business rules management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative" ref={userTooltipRef}>
                <Button
                  onClick={handleUserIdClick}
                  variant="outline"
                  className="border-green-400/30 text-green-400 hover:bg-green-400/10 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {userId}
                  <Edit3 className="w-3 h-3" />
                </Button>

                {showUserTooltip && (
                  <div className="absolute top-full left-0 mt-2 p-3 bg-gray-800 border border-green-400/30 rounded-lg shadow-lg z-50 min-w-[200px]">
                    {editingUserId ? (
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-400">
                          Enter User ID
                        </Label>
                        <Input
                          defaultValue={userId}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveUserId(e.currentTarget.value);
                            } else if (e.key === "Escape") {
                              closeTooltip();
                            }
                          }}
                          className="bg-gray-700 border-green-400/30 text-white text-sm"
                          placeholder="Enter user ID"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              const input = e.currentTarget.parentElement
                                ?.previousElementSibling as HTMLInputElement;
                              handleSaveUserId(input?.value || "");
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={closeTooltip}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-300">
                          Current User:{" "}
                          <span className="text-green-400 font-medium">
                            {userId}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={toggleEditUserId}
                          variant="outline"
                          className="border-green-400/30 text-green-400 hover:bg-green-400/10 text-xs w-full"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Change User
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-400">
                Managing business rules for:{" "}
                <span className="text-green-400 font-medium">{userId}</span>
              </div>
            </div>

            <Button
              onClick={handleRefresh}
              disabled={businessRulesLoading || !userId.trim()}
              variant="outline"
              size="sm"
              className="border-green-400/30 text-green-400 hover:bg-green-400/10"
            >
              {businessRulesLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Database Configuration */}
      <Card className="bg-gray-900/50 border-green-400/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Database className="w-5 h-5" />
            Database Configuration
          </CardTitle>
          <CardDescription className="text-gray-400">
            Select the database for AI queries and business rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <DatabaseSelector
              userId={userId}
              selectedDatabaseId={selectedDatabaseId}
              onDatabaseChange={handleDatabaseChange}
            />

            {selectedDatabaseName && (
              <div className="p-3 bg-green-900/20 border border-green-400/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">
                    Selected database:{" "}
                    <span className="font-medium">{selectedDatabaseName}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration */}
      <Card className="bg-gray-900/50 border-green-400/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Settings className="w-5 h-5" />
            AI Assistant Configuration
          </CardTitle>
          <CardDescription className="text-gray-400">
            Save your configuration for the AI assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="space-y-1">
                <div className="text-sm font-medium text-white">
                  Current Configuration
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>
                    User: <span className="text-green-400">{userId}</span>
                  </div>
                  <div>
                    Database:{" "}
                    <span className="text-green-400">
                      {selectedDatabaseName || "Not selected"}
                    </span>
                  </div>
                  <div>
                    Status:{" "}
                    <span
                      className={
                        configSaved ? "text-green-400" : "text-yellow-400"
                      }
                    >
                      {configSaved ? "Saved" : "Unsaved changes"}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                onClick={saveAIConfiguration}
                disabled={!userId.trim() || !selectedDatabaseId || configSaved}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Config
              </Button>
            </div>

            {configSaved && (
              <Alert className="border-green-400/30 bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  AI configuration saved! You can now use the AI assistant with
                  these settings.
                </AlertDescription>
              </Alert>
            )}

            {(!userId.trim() || !selectedDatabaseId) && (
              <Alert className="border-yellow-400/30 bg-yellow-900/20">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-300">
                  Please select both a user and database before saving the AI
                  configuration.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Alerts */}
      {businessRulesError && (
        <Alert className="border-red-400/30 bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            {businessRulesError}
          </AlertDescription>
        </Alert>
      )}

      {uploadError && (
        <Alert className="border-red-400/30 bg-red-900/20">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            {uploadError}
          </AlertDescription>
        </Alert>
      )}

      {uploadSuccess && (
        <Alert className="border-green-400/30 bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">
            Business rules updated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Business Rules Editor */}
      <Card className="bg-gray-900/50 border-green-400/30">
        {/* Sticky Header with Actions */}
        <div className="sticky top-20 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-green-400/30 rounded-t-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <FileText className="w-5 h-5" />
                  Business Rules Editor
                </CardTitle>
                <CardDescription className="text-gray-400 flex items-center gap-4">
                  <span>
                    Edit business rules that will affect database queries and
                    operations
                  </span>
                  {lastSaved && (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <Clock className="w-3 h-3" />
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {/* Save Button - Always visible in header */}
                <Button
                  onClick={handleSave}
                  disabled={
                    uploadingRules || !hasUnsavedChanges || !userId.trim()
                  }
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {uploadingRules ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>

                {/* File Upload */}
                <div className="relative">
                  <input
                    type="file"
                    accept=".md,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-400/30 text-green-400 hover:bg-green-400/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>

                {/* Download */}
                <Button
                  onClick={handleDownload}
                  disabled={downloadingRules}
                  variant="outline"
                  size="sm"
                  className="border-green-400/30 text-green-400 hover:bg-green-400/10"
                >
                  {downloadingRules ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Download
                </Button>
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <div className="flex items-center gap-4">
                <span className="text-gray-400">
                  {editedContent.length} characters
                </span>
                {hasUnsavedChanges && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <AlertCircle className="w-3 h-3" />
                    Unsaved changes
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Keyboard className="w-3 h-3" />
                <span>Press Ctrl+S to save</span>
              </div>
            </div>
          </CardHeader>
        </div>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessRules" className="text-gray-300">
                Business Rules Content
              </Label>
              <Textarea
                id="businessRules"
                value={editedContent}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Enter your business rules here..."
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500 min-h-[400px] font-mono text-sm"
                disabled={businessRulesLoading}
              />
            </div>

            {hasUnsavedChanges && (
              <Alert className="border-yellow-400/30 bg-yellow-900/20">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-300">
                  You have unsaved changes. Don't forget to save your
                  modifications.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
