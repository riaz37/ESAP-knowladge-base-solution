"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Table, 
  Plus, 
  Settings, 
  Eye, 
  Edit, 
  Trash2,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useAuthContext, useDatabaseContext } from "@/components/providers";
import { useVectorDB } from "@/lib/hooks/use-vector-db";

interface VectorDBAccessSectionProps {
  selectedUserForVectorDB: string;
  extractNameFromEmail: (email: string) => string;
  onClose: () => void;
}

export function VectorDBAccessSection({
  selectedUserForVectorDB,
  extractNameFromEmail,
  onClose,
}: VectorDBAccessSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Use contexts instead of local state
  const { user } = useAuthContext();
  const { availableDatabases, currentDatabaseId, currentDatabaseName } = useDatabaseContext();
  
  const {
    vectorDBConfigs,
    userTableNames,
    isLoading: vectorDBLoading,
    error: vectorDBError,
    getVectorDBConfigs,
    getUserTableNames,
  } = useVectorDB();

  // Placeholder state - will be implemented with proper database context
  const userConfigs = { configs: [] };
  const userConfigLoading = false;
  
  const getUserConfigs = async () => {
    // TODO: Implement with database context
  };

  const isLoading = vectorDBLoading || userConfigLoading;

  useEffect(() => {
    if (selectedUserForVectorDB) {
      loadData();
    }
  }, [selectedUserForVectorDB]);

  const loadData = async () => {
    await Promise.all([
      getVectorDBConfigs(),
      getUserConfigs(),
      getUserTableNames(selectedUserForVectorDB),
      getUserTableNamesWithMetadata(selectedUserForVectorDB),
    ]);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    loadData(); // Refresh data
  };

  const handleOpenModal = () => {
    // Only open modal if we have the necessary data
    if (availableDatabases.length > 0) {
      setIsModalOpen(true);
    } else {
      // If no databases available, load data first
      loadData();
    }
  };

  const getUserVectorDBConfigs = () => {
    if (!userConfigs || !availableDatabases) return [];
    
    return userConfigs.configs.filter(config => 
      config.user_id === selectedUserForVectorDB && 
      config.access_level >= 2 // Vector DB access level
    );
  };

  const getAvailableDatabases = () => {
    if (!availableDatabases) return [];
    return availableDatabases;
  };

  const getAccessLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return "Read Only";
      case 2:
        return "Vector DB Access";
      case 3:
        return "Full Access";
      default:
        return "Unknown";
    }
  };

  const getAccessLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case 2:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case 3:
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  if (!selectedUserForVectorDB) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Vector Database Access
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage vector database access for {extractNameFromEmail(selectedUserForVectorDB)}
          </p>
        </div>
        
        {/* Status Badges */}
        <div className="flex items-center gap-3">
          {currentDatabaseId && (
            <Badge variant="outline" className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              Current DB: {currentDatabaseName || currentDatabaseId}
            </Badge>
          )}
          {availableDatabases.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              {availableDatabases.length} Databases Available
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configs">Configurations</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Current Database Status
              </CardTitle>
              <CardDescription>
                Overview of the currently selected database and user access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentDatabaseId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800 dark:text-blue-200">Current Database</span>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300">
                      {currentDatabaseName || `Database ${currentDatabaseId}`}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">User</span>
                    </div>
                    <p className="text-green-700 dark:text-green-300">
                      {extractNameFromEmail(selectedUserForVectorDB)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="font-medium">No Database Selected</p>
                  <p className="text-sm">Please select a database to view vector DB access</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common actions for managing vector database access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  onClick={handleOpenModal}
                  disabled={isLoading || getAvailableDatabases().length === 0}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Vector DB Access
                </Button>
                
                <Button
                  onClick={loadData}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurations Tab */}
        <TabsContent value="configs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Vector DB Configurations
              </CardTitle>
              <CardDescription>
                Current vector database access configurations for this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-2">Loading configurations...</span>
                </div>
              ) : getUserVectorDBConfigs().length > 0 ? (
                <div className="space-y-4">
                  {getUserVectorDBConfigs().map((config, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Database {config.db_id}</span>
                        </div>
                        <Badge className={getAccessLevelColor(config.access_level)}>
                          {getAccessLevelLabel(config.access_level)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Access Level:</span>
                          <span className="ml-2">{config.access_level}</span>
                        </div>
                        <div>
                          <span className="font-medium">Tables:</span>
                          <span className="ml-2">{config.accessible_tables?.length || 0}</span>
                        </div>
                        <div>
                          <span className="font-medium">Updated:</span>
                          <span className="ml-2">
                            {new Date(config.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="font-medium">No Vector DB Configurations</p>
                  <p className="text-sm">This user has no vector database access configured</p>
                  <Button
                    onClick={handleOpenModal}
                    className="mt-4"
                    disabled={getAvailableDatabases().length === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Configuration
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tables Tab */}
        <TabsContent value="tables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="w-5 h-5" />
                Available Tables
              </CardTitle>
              <CardDescription>
                Tables accessible to this user for vector database operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-2">Loading tables...</span>
                </div>
              ) : userTableNames && userTableNames.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userTableNames.map((tableName, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Table className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{tableName}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Available for vector operations
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Table className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="font-medium">No Tables Available</p>
                  <p className="text-sm">No tables are configured for vector database access</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {vectorDBError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800 dark:text-red-200">
                  Vector DB Error
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm">{vectorDBError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 