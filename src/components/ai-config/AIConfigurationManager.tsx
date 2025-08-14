"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UserCurrentDBService } from "@/lib/api/services/user-current-db-service";

interface AIConfigurationManagerProps {
  userId: string;
}

export function AIConfigurationManager({
  userId,
}: AIConfigurationManagerProps) {
  // Database selection state
  const [dbId, setDbId] = useState<number | null>(null);
  const [configSaved, setConfigSaved] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [settingDB, setSettingDB] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const setUserDatabase = async () => {
    if (!userId.trim()) {
      setError("Please enter a user ID");
      return;
    }

    if (!dbId || dbId <= 0) {
      setError("Please enter a valid database ID");
      return;
    }

    setSettingDB(true);
    setError(null);
    setSuccess(null);
    if (!userId?.trim()) {
      setError("Invalid user ID. Please select a valid user.");
      setSettingDB(false);
      return;
    }

    try {
      await UserCurrentDBService.setUserCurrentDB(userId, { db_id: dbId });
      setSuccess(`Successfully set database ID ${dbId} for user ${userId}`);
      setConfigSaved(true);
    } catch (err) {
      console.error("Error setting current database:", err);
      setError(
        "Failed to set current database. Please check the user ID and database ID.",
      );
    } finally {
      setSettingDB(false);
    }
  };

  useEffect(() => {
    const loadConfig = async () => {
      setLoadingConfig(true);
      try {
        const response = await UserCurrentDBService.getUserCurrentDB(userId);
        if (response && response.db_id) {
          setDbId(response.db_id);
          setConfigSaved(true);
        } else {
          setDbId(null);
          setConfigSaved(false);
        }
      } catch (error) {
        console.error("Failed to load AI configuration:", error);
        setDbId(null);
        setConfigSaved(false);
      } finally {
        setLoadingConfig(false);
      }
    };

    if (userId.trim()) {
      loadConfig();
    } else {
      setDbId(null);
      setConfigSaved(false);
      setLoadingConfig(false);
    }
  }, [userId]);

  return (
    <>
      {/* Database Configuration */}
      <Card className="bg-gray-900/50 border-green-400/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Settings className="w-5 h-5" />
            AI Assistant Database
          </CardTitle>
          <CardDescription className="text-gray-400">
            Set the database for AI queries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400 whitespace-nowrap">
                Database ID:
              </label>
              <Input
                type="number"
                placeholder="Enter DB ID"
                value={dbId !== null ? dbId.toString() : ""}
                onChange={(e) => {
                  const parsedValue = parseInt(e.target.value);
                  setDbId(isNaN(parsedValue) ? null : parsedValue);
                }}
                className="w-32"
                min="1"
              />
            </div>
            <Button
              onClick={setUserDatabase}
              disabled={settingDB || !userId.trim()}
              variant="outline"
            >
              {settingDB ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
              Set Database
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration Status */}
      <Card className="bg-gray-900/50 border-green-400/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Settings className="w-5 h-5" />
            AI Assistant Configuration
          </CardTitle>
          <CardDescription className="text-gray-400">
            View the current configuration for the AI assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert className="border-red-400/30 bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-400/30 bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  {success}
                </AlertDescription>
              </Alert>
            )}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="space-y-1">
                <div className="text-sm font-medium text-white">
                  Current Configuration
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>
                    User:{" "}
                    <span className="text-green-400">
                      {userId ? userId : "Not selected"}
                    </span>
                  </div>
                  <div>
                    Database:{" "}
                    <span className="text-green-400">
                      {dbId ? `Database-${dbId}` : "Not selected"}
                    </span>
                  </div>
                  <div>
                    Status:{" "}
                    <span
                      className={
                        configSaved ? "text-green-400" : "text-yellow-400"
                      }
                    >
                      {loadingConfig
                        ? "Loading..."
                        : configSaved
                          ? "Saved"
                          : "Unsaved changes"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default AIConfigurationManager;
