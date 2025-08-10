"use client";

import React, { useState, useEffect } from "react";
import { useUserConfig } from "@/lib/hooks/use-user-config";
import { UserConfigCreateRequest, DatabaseConfig } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Database, User } from "lucide-react";

interface UserConfigManagerProps {
  className?: string;
}

export const UserConfigManager: React.FC<UserConfigManagerProps> = ({
  className = "",
}) => {
  const {
    userConfigs,
    currentUserConfig,
    isLoading,
    error,
    createUserConfig,
    fetchUserConfigs,
    fetchUserConfig,
    clearError,
  } = useUserConfig();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<UserConfigCreateRequest>({
    user_id: "",
    db_config: {
      DB_HOST: "",
      DB_PORT: 1433,
      DB_NAME: "",
      DB_USER: "",
      DB_PASSWORD: "",
      schema: "public",
    },
    access_level: 2,
    accessible_tables: [],
  });

  // Load user configs on component mount
  useEffect(() => {
    fetchUserConfigs();
  }, [fetchUserConfigs]);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith("db_config.")) {
      const dbField = field.replace("db_config.", "");
      setFormData((prev) => ({
        ...prev,
        db_config: {
          ...prev.db_config,
          [dbField]: dbField === "DB_PORT" ? parseInt(value) || 0 : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: field === "access_level" ? parseInt(value) || 0 : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserConfig(formData);
      setShowCreateForm(false);
      setFormData({
        user_id: "",
        db_config: {
          DB_HOST: "",
          DB_PORT: 1433,
          DB_NAME: "",
          DB_USER: "",
          DB_PASSWORD: "",
          schema: "public",
        },
        access_level: 2,
        accessible_tables: [],
      });
    } catch (error) {
      console.error("Failed to create user config:", error);
    }
  };

  const handleFetchUserConfig = async (userId: string) => {
    if (userId.trim()) {
      await fetchUserConfig(userId);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">User Configuration Manager</h2>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Config</span>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New User Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user_id">User ID</Label>
                  <Input
                    id="user_id"
                    value={formData.user_id}
                    onChange={(e) =>
                      handleInputChange("user_id", e.target.value)
                    }
                    placeholder="Enter user ID"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="access_level">Access Level</Label>
                  <Input
                    id="access_level"
                    type="number"
                    value={formData.access_level}
                    onChange={(e) =>
                      handleInputChange("access_level", e.target.value)
                    }
                    placeholder="Access level (0-3)"
                    min="0"
                    max="3"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Database Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="db_host">Database Host</Label>
                    <Input
                      id="db_host"
                      value={formData.db_config.DB_HOST}
                      onChange={(e) =>
                        handleInputChange("db_config.DB_HOST", e.target.value)
                      }
                      placeholder="Database host"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="db_port">Database Port</Label>
                    <Input
                      id="db_port"
                      type="number"
                      value={formData.db_config.DB_PORT}
                      onChange={(e) =>
                        handleInputChange("db_config.DB_PORT", e.target.value)
                      }
                      placeholder="Database port"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="db_name">Database Name</Label>
                    <Input
                      id="db_name"
                      value={formData.db_config.DB_NAME}
                      onChange={(e) =>
                        handleInputChange("db_config.DB_NAME", e.target.value)
                      }
                      placeholder="Database name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="db_user">Database User</Label>
                    <Input
                      id="db_user"
                      value={formData.db_config.DB_USER}
                      onChange={(e) =>
                        handleInputChange("db_config.DB_USER", e.target.value)
                      }
                      placeholder="Database user"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="db_password">Database Password</Label>
                    <Input
                      id="db_password"
                      type="password"
                      value={formData.db_config.DB_PASSWORD}
                      onChange={(e) =>
                        handleInputChange(
                          "db_config.DB_PASSWORD",
                          e.target.value
                        )
                      }
                      placeholder="Database password"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="db_schema">Schema</Label>
                    <Input
                      id="db_schema"
                      value={formData.db_config.schema}
                      onChange={(e) =>
                        handleInputChange("db_config.schema", e.target.value)
                      }
                      placeholder="Database schema"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Configuration
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* User Configs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>User Configurations ({userConfigs.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && userConfigs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading configurations...</span>
            </div>
          ) : userConfigs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No user configurations found. Create one to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {userConfigs.map((config) => (
                <div
                  key={config.config_id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">User: {config.user_id}</h4>
                      <p className="text-sm text-gray-600">
                        Database: {config.db_config.DB_NAME} | Access Level:{" "}
                        {config.access_level} | Latest:{" "}
                        {config.is_latest ? "Yes" : "No"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(config.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFetchUserConfig(config.user_id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current User Config Details */}
      {currentUserConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>User ID</Label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {currentUserConfig.user_id}
                  </p>
                </div>
                <div>
                  <Label>Config ID</Label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {currentUserConfig.config_id}
                  </p>
                </div>
                <div>
                  <Label>Access Level</Label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {currentUserConfig.access_level}
                  </p>
                </div>
                <div>
                  <Label>Is Latest</Label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {currentUserConfig.is_latest ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div>
                <Label>Database Configuration</Label>
                <div className="text-sm font-mono bg-gray-100 p-4 rounded mt-2">
                  <pre>
                    {JSON.stringify(currentUserConfig.db_config, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <Label>Accessible Tables</Label>
                <div className="text-sm font-mono bg-gray-100 p-2 rounded mt-2">
                  {currentUserConfig.accessible_tables.length > 0
                    ? currentUserConfig.accessible_tables.join(", ")
                    : "No specific tables configured"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserConfigManager;
