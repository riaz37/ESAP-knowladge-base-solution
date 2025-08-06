"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Save, 
  Download, 
  Upload, 
  User, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useBusinessRules } from "@/lib/hooks/use-business-rules";
import { toast } from "sonner";

export function BusinessRulesManager() {
  const [userId, setUserId] = useState("nilab"); // Default user ID
  const [editedContent, setEditedContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const handleSave = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a user ID");
      return;
    }

    if (!editedContent.trim()) {
      toast.error("Business rules content cannot be empty");
      return;
    }

    const success = await updateBusinessRules(editedContent, userId);
    if (success) {
      toast.success("Business rules updated successfully");
      setHasUnsavedChanges(false);
    } else {
      toast.error("Failed to update business rules. Please check the console for details.");
    }
  };

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
    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
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
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* User Selection */}
      <Card className="bg-gray-900/50 border-green-400/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <User className="w-5 h-5" />
            User Configuration
          </CardTitle>
          <CardDescription className="text-gray-400">
            Select the user for whom you want to manage business rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="userId" className="text-gray-300">
                User ID
              </Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID (e.g., nilab)"
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleRefresh}
                disabled={businessRulesLoading || !userId.trim()}
                variant="outline"
                className="border-green-400/30 text-green-400 hover:bg-green-400/10"
              >
                {businessRulesLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <FileText className="w-5 h-5" />
                Business Rules Editor
              </CardTitle>
              <CardDescription className="text-gray-400">
                Edit business rules that will affect database queries and operations
              </CardDescription>
            </div>
            <div className="flex gap-2">
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
        </CardHeader>
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
                  You have unsaved changes. Don't forget to save your modifications.
                </AlertDescription>
              </Alert>
            )}

            <Separator className="bg-green-400/20" />

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {businessRulesLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading business rules...
                  </span>
                ) : (
                  <span>
                    {editedContent.length} characters
                    {hasUnsavedChanges && " • Unsaved changes"}
                  </span>
                )}
              </div>

              <Button
                onClick={handleSave}
                disabled={uploadingRules || !hasUnsavedChanges || !userId.trim()}
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
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-gray-900/50 border-green-400/30">
        <CardHeader>
          <CardTitle className="text-green-400">How Business Rules Work</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-3">
          <p>
            Business rules define how database queries should be processed and what constraints should be applied.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Rules are applied automatically when users perform database queries</li>
            <li>You can define data validation rules, access restrictions, and query modifications</li>
            <li>Rules are user-specific and can be customized for different users</li>
            <li>Changes take effect immediately after saving</li>
          </ul>
          <p className="text-sm text-gray-400">
            Tip: Use Markdown format for better readability and organization of your business rules.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}