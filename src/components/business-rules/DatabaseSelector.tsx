"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { DatabaseService } from "@/lib/api/services/database-service";
import { toast } from "sonner";

interface DatabaseSelectorProps {
  onDatabaseSelect: (databaseId: number, databaseName: string) => void;
  selectedDatabaseId: number | null;
}

interface MSSQLConfig {
  db_id: number;
  db_name: string;
  db_url: string;
  business_rule?: string;
  created_at?: string;
  updated_at?: string;
  table_info?: any;
}

export function DatabaseSelector({ onDatabaseSelect, selectedDatabaseId }: DatabaseSelectorProps) {
  const [databaseConfigs, setDatabaseConfigs] = useState<MSSQLConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDatabaseConfigs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await DatabaseService.getAllDatabases();
      
      let configs: MSSQLConfig[] = [];
      if (response?.configs && Array.isArray(response.configs)) {
        configs = response.configs;
      } else if (Array.isArray(response)) {
        configs = response;
      } else if (response?.data && Array.isArray(response.data)) {
        configs = response.data;
      }
      
      const validConfigs = configs.filter(config => 
        config && 
        typeof config.db_id === 'number' && 
        !isNaN(config.db_id) &&
        typeof config.db_name === 'string' &&
        config.db_name.trim() !== ''
      );
      
      setDatabaseConfigs(validConfigs);
    } catch (err: any) {
      setError(err.message || "Failed to fetch database configurations");
      setDatabaseConfigs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseConfigs();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchDatabaseConfigs();
      toast.success("Database list refreshed");
    } catch (error) {
      toast.error("Failed to refresh database list");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDatabaseChange = (databaseId: string) => {
    if (!databaseId?.trim()) return;
    
    const dbId = parseInt(databaseId);
    if (isNaN(dbId)) return;
    
    const selectedDb = databaseConfigs.find(db => db.db_id === dbId);
    if (selectedDb) {
      onDatabaseSelect(dbId, selectedDb.db_name);
      toast.success(`Selected database: ${selectedDb.db_name}`);
    }
  };

  const selectedDatabase = databaseConfigs.find(db => db.db_id === selectedDatabaseId);
  const selectValue = selectedDatabaseId?.toString() || "";

  const getHostnameFromUrl = (url: string | undefined): string => {
    if (!url) return 'No URL';
    try {
      return new URL(url).hostname;
    } catch {
      return 'Invalid URL';
    }
  };

  return (
    <Card className="bg-gray-900/50 border-blue-400/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Database className="w-5 h-5" />
              Database Selection
            </CardTitle>
            <CardDescription className="text-gray-400">
              Select a database to view and edit its business rules
            </CardDescription>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            variant="outline"
            size="sm"
            className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="database-select" className="text-gray-300">
              Available Databases
            </Label>
            {databaseConfigs.length === 0 ? (
              <div className="p-3 bg-gray-800/50 border border-gray-600/30 rounded-lg text-center text-gray-400">
                <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No databases available</p>
                <p className="text-sm">Configure a database first to manage business rules</p>
              </div>
            ) : (
              <Select
                value={selectValue}
                onValueChange={handleDatabaseChange}
                disabled={isLoading || isRefreshing}
              >
                <SelectTrigger className="bg-gray-800/50 border-blue-400/30 text-white">
                  <SelectValue placeholder="Select a database..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-blue-400/30">
                  {databaseConfigs.map((db) => (
                    <SelectItem
                      key={db.db_id}
                      value={db.db_id.toString()}
                      className="text-white hover:bg-blue-400/20"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{db.db_name}</span>
                        <span className="text-xs text-gray-400">
                          {getHostnameFromUrl(db.db_url)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedDatabase && (
            <div className="p-3 bg-blue-400/10 border border-blue-400/30 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Database className="w-4 h-4" />
                <span className="font-medium">Selected Database</span>
              </div>
              <div className="text-sm text-gray-300">
                <p><strong>Name:</strong> {selectedDatabase.db_name}</p>
                <p><strong>URL:</strong> {selectedDatabase.db_url || 'Not configured'}</p>
                <p><strong>ID:</strong> {selectedDatabase.db_id}</p>
              </div>
            </div>
          )}

          {error && (
            <Alert className="border-red-400/30 bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <span className="ml-2 text-gray-400">Loading databases...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 