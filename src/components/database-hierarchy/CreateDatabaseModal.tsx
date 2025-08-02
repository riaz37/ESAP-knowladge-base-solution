import React, { useState } from "react";
import { X, Database, Plus, Loader2, Link, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MSSQLConfigService } from "@/lib/api/services/mssql-config-service";
import { MSSQLConfigRequest } from "@/types/api";

interface CreateDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateDatabaseModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDatabaseModalProps) {
  const [dbName, setDbName] = useState("");
  const [server, setServer] = useState("");
  const [port, setPort] = useState("1433");
  const [database, setDatabase] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [directUrl, setDirectUrl] = useState("");
  const [useDirectUrl, setUseDirectUrl] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Validate based on input method
    const isDirectUrlValid = useDirectUrl && dbName.trim() && directUrl.trim();
    const isIndividualParamsValid =
      !useDirectUrl &&
      dbName.trim() &&
      server.trim() &&
      database.trim() &&
      username.trim() &&
      password.trim();

    if ((!isDirectUrlValid && !isIndividualParamsValid) || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      let dbUrl: string;

      if (useDirectUrl) {
        // Use direct URL
        dbUrl = directUrl.trim();
      } else {
        // Build connection string from individual parameters
        dbUrl = MSSQLConfigService.buildConnectionString({
          server: server.trim(),
          port: parseInt(port) || 1433,
          database: database.trim(),
          username: username.trim(),
          password: password.trim(),
        });
      }

      const config: MSSQLConfigRequest = {
        db_name: dbName.trim(),
        db_url: dbUrl,
      };

      await MSSQLConfigService.createMSSQLConfig(config);

      // Reset form
      setDbName("");
      setServer("");
      setPort("1433");
      setDatabase("");
      setUsername("");
      setPassword("");
      setDirectUrl("");
      setError(null);

      onSuccess();
    } catch (error: any) {
      console.error("Error creating database configuration:", error);
      const errorMessage =
        error?.message ||
        "Failed to create database configuration. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    setDbName("");
    setServer("");
    setPort("1433");
    setDatabase("");
    setUsername("");
    setPassword("");
    setDirectUrl("");
    setUseDirectUrl(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const isFormValid = useDirectUrl
    ? dbName.trim() && directUrl.trim()
    : dbName.trim() &&
      server.trim() &&
      database.trim() &&
      username.trim() &&
      password.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Create Database Configuration
          </h2>
          <p className="text-gray-400 text-sm">
            Add a new MSSQL database configuration
          </p>
        </div>

        {/* Database Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-20 relative">
              <Database className="w-full h-full text-blue-400/60" />
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-gray-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-400/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Configuration Name
            </label>
            <Input
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
              placeholder="e.g., Production DB"
              disabled={isSubmitting}
              className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-400/50 focus:ring-blue-400/20 disabled:opacity-50"
            />
          </div>

          {/* Connection Method Toggle */}
          <div className="flex items-center justify-center space-x-4 py-4">
            <button
              type="button"
              onClick={() => setUseDirectUrl(false)}
              disabled={isSubmitting}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                !useDirectUrl
                  ? "bg-blue-400/20 border border-blue-400/50 text-blue-400"
                  : "bg-gray-800/50 border border-gray-600/50 text-gray-400 hover:text-white hover:border-gray-500/50"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Individual Parameters</span>
            </button>
            <button
              type="button"
              onClick={() => setUseDirectUrl(true)}
              disabled={isSubmitting}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                useDirectUrl
                  ? "bg-blue-400/20 border border-blue-400/50 text-blue-400"
                  : "bg-gray-800/50 border border-gray-600/50 text-gray-400 hover:text-white hover:border-gray-500/50"
              }`}
            >
              <Link className="w-4 h-4" />
              <span className="text-sm font-medium">Direct URL</span>
            </button>
          </div>

          {/* Conditional Form Fields */}
          {useDirectUrl ? (
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Database Connection URL
              </label>
              <Input
                value={directUrl}
                onChange={(e) => setDirectUrl(e.target.value)}
                placeholder="mssql://username:password@server:port/database"
                disabled={isSubmitting}
                className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-400/50 focus:ring-blue-400/20 disabled:opacity-50"
              />
              <p className="text-gray-500 text-xs mt-1">
                Format: mssql://username:password@server:port/database
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Server
                  </label>
                  <Input
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    placeholder="localhost"
                    disabled={isSubmitting}
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-400/50 focus:ring-blue-400/20 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Port
                  </label>
                  <Input
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="1433"
                    disabled={isSubmitting}
                    className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-400/50 focus:ring-blue-400/20 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Database Name
                </label>
                <Input
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  placeholder="MyDatabase"
                  disabled={isSubmitting}
                  className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-400/50 focus:ring-blue-400/20 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Username
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="sa"
                  disabled={isSubmitting}
                  className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-400/50 focus:ring-blue-400/20 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-400/50 focus:ring-blue-400/20 disabled:opacity-50"
                />
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-8">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="border-gray-600/50 text-gray-300 hover:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="bg-blue-400 hover:bg-blue-300 text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
