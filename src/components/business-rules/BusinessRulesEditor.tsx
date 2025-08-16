"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Save, Upload, Download, Loader2, AlertCircle, Clock, Keyboard } from "lucide-react";
import { toast } from "sonner";
import { useBusinessRules } from "@/lib/hooks/use-business-rules"; // Assuming this hook exists

interface BusinessRulesEditorProps {
  userId: string;
}

export function BusinessRulesEditor({ userId }: BusinessRulesEditorProps) {
  const [editedContent, setEditedContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
    if (!hasUnsavedChanges) {
      toast.info("No unsaved changes to save.");
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
  }, [userId, editedContent, updateBusinessRules, hasUnsavedChanges]);

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
                  businessRulesLoading || uploadingRules || !hasUnsavedChanges || !userId.trim()
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
    </Card>
  );
}

export default BusinessRulesEditor;
