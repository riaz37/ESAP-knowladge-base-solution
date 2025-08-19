"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Brain, 
  Shield, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Settings,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { useVectorDB } from "@/lib/hooks/use-vector-db";
import { useDatabaseConfig } from "@/lib/hooks/use-database-config";
import { useAuthContext } from "@/components/providers";


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
  
  const {
    vectorDBConfigs,
    userTableNames,
    isLoading: vectorDBLoading,
    error: vectorDBError,
    getVectorDBConfigs,
    getUserTableNames,
  } = useVectorDB();

  const {
    databaseConfigs,
    isLoading: dbLoading,
    getDatabaseConfigs,
  } = useDatabaseConfig();

  const { user } = useAuthContext();
  
  // Placeholder state - will be implemented with proper database context
  const userConfigs = { configs: [] };
  const userConfigLoading = false;
  
  const getUserConfigs = async () => {
    // TODO: Implement with database context
  };

  const isLoading = vectorDBLoading || dbLoading || userConfigLoading;

  useEffect(() => {
    if (selectedUserForVectorDB) {
      loadData();
    }
  }, [selectedUserForVectorDB]);

  const loadData = async () => {
    await Promise.all([
      getVectorDBConfigs(),
      getDatabaseConfigs(),
      getUserConfigs(),
      getUserTableNames(selectedUserForVectorDB),
    ]);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    loadData(); // Refresh data
  };

  const handleOpenModal = () => {
    // Only open modal if we have the necessary data
    if (getAvailableDatabases().length > 0) {
      setIsModalOpen(true);
    } else {
      // If no databases available, load data first
      loadData();
    }
  };

  const getUserVectorDBConfigs = () => {
    if (!userConfigs || !databaseConfigs) return [];
    
    return userConfigs.configs.filter(config => 
      config.user_id === selectedUserForVectorDB && 
      config.access_level >= 2 // Vector DB access level
    );
  };

  const getAvailableDatabases = () => {
    if (!databaseConfigs) return [];
    return databaseConfigs.configs;
  };

  const getAccessLevelLabel = (level: number) => {
    if (level >= 8) return { label: "Full Access", color: "bg-green-600", icon: CheckCircle };
    if (level >= 5) return { label: "Advanced Access", color: "bg-blue-600", icon: Shield };
    if (level >= 2) return { label: "Vector DB Access", color: "bg-purple-600", icon: Brain };
    return { label: "Read Only", color: "bg-gray-600", icon: Info };
  };

  return (
    <div className="bg-slate-800/50 rounded-lg border border-emerald-500/30 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            Vector Database Access for {extractNameFromEmail(selectedUserForVectorDB)}
          </h2>
          <p className="text-gray-400">
            Manage vector database access, table permissions, and AI operation capabilities
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={loadData}
            disabled={isLoading}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleOpenModal}
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isLoading ? 'Loading...' : 'Add Vector DB Access'}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Back to Users
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-700">
          <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
          <TabsTrigger value="configurations" className="text-white">Configurations</TabsTrigger>
          <TabsTrigger value="tables" className="text-white">Table Access</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Access Summary */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-400" />
                  Current Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUserVectorDBConfigs().length > 0 ? (
                    getUserVectorDBConfigs().map((config, index) => {
                      const accessInfo = getAccessLevelLabel(config.access_level);
                      const IconComponent = accessInfo.icon;
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-600/50 rounded-lg">
                          <div className="flex items-center">
                            <IconComponent className="w-4 h-4 mr-2 text-white" />
                            <span className="text-white text-sm">DB #{config.db_id}</span>
                          </div>
                          <Badge className={accessInfo.color}>
                            {accessInfo.label}
                          </Badge>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4">
                      <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">No vector DB access configured</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Available Tables */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center">
                  <Database className="w-5 h-5 mr-2 text-green-400" />
                  Available Tables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userTableNames && userTableNames.length > 0 ? (
                    userTableNames.map((tableName, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-600/50 rounded">
                        <span className="text-white text-sm">{tableName}</span>
                        <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                          Available
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <Info className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">No tables available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={handleOpenModal}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    size="sm"
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isLoading ? 'Loading...' : 'Add Access'}
                  </Button>
                  <Button
                    onClick={loadData}
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configurations Tab */}
        <TabsContent value="configurations" className="space-y-6 mt-6">
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                Vector DB Configurations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getUserVectorDBConfigs().length > 0 ? (
                <div className="space-y-4">
                  {getUserVectorDBConfigs().map((config, index) => {
                    const accessInfo = getAccessLevelLabel(config.access_level);
                    const IconComponent = accessInfo.icon;
                    const dbConfig = getAvailableDatabases().find(db => db.db_id === config.db_id);
                    
                    return (
                      <div key={index} className="p-4 bg-slate-600/50 rounded-lg border border-slate-500">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <IconComponent className="w-5 h-5 mr-2 text-white" />
                            <span className="text-white font-medium">Database #{config.db_id}</span>
                            <Badge className={`ml-2 ${accessInfo.color}`}>
                              {accessInfo.label}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-500 text-slate-300 hover:bg-slate-600"
                            >
                              <Settings className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-300 hover:bg-red-600/20"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                        
                        {dbConfig && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Host:</span>
                              <span className="text-white ml-2">{dbConfig.db_config.DB_HOST}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Port:</span>
                              <span className="text-white ml-2">{dbConfig.db_config.DB_PORT}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Database:</span>
                              <span className="text-white ml-2">{dbConfig.db_config.DB_NAME}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Schema:</span>
                              <span className="text-white ml-2">{dbConfig.db_config.schema}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3 pt-3 border-t border-slate-500">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Accessible Tables:</span>
                            <span className="text-white text-sm">{config.accessible_tables.length} tables</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {config.accessible_tables.slice(0, 5).map((table, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-blue-600/20 text-blue-400">
                                {table}
                              </Badge>
                            ))}
                            {config.accessible_tables.length > 5 && (
                              <Badge variant="secondary" className="bg-gray-600/20 text-gray-400">
                                +{config.accessible_tables.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Vector DB Access</h3>
                  <p className="text-gray-400 mb-4">
                    This user doesn't have any vector database access configured yet.
                  </p>
                  <Button
                    onClick={handleOpenModal}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isLoading ? 'Loading...' : 'Configure Access'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tables Tab */}
        <TabsContent value="tables" className="space-y-6 mt-6">
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center">
                <Database className="w-5 h-5 mr-2 text-green-400" />
                Table Access Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Available Tables for User</h4>
                    <p className="text-gray-400 text-sm">
                      Tables that can be accessed by this user for vector operations
                    </p>
                  </div>
                  <Button
                    onClick={loadData}
                    variant="outline"
                    size="sm"
                    className="border-slate-500 text-slate-300 hover:bg-slate-600"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Tables
                  </Button>
                </div>
                
                {userTableNames && userTableNames.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {userTableNames.map((tableName, index) => (
                      <div key={index} className="p-3 bg-slate-600/50 rounded-lg border border-slate-500">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Database className="w-4 h-4 mr-2 text-green-400" />
                            <span className="text-white font-medium">{tableName}</span>
                          </div>
                          <Badge className="bg-green-600/20 text-green-400">
                            Available
                          </Badge>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Ready for vector operations and AI queries
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Tables Available</h3>
                    <p className="text-gray-400 mb-4">
                      This user doesn't have access to any tables yet.
                    </p>
                    <Button
                      onClick={handleOpenModal}
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={isLoading}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isLoading ? 'Loading...' : 'Configure Table Access'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vector DB Access Modal */}
      <VectorDBAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={selectedUserForVectorDB}
        onSuccess={handleModalSuccess}
        availableDatabases={getAvailableDatabases()}
        userTableNames={userTableNames || []}
      />
    </div>
  );
} 