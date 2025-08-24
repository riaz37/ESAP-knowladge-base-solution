"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Database, 
  Brain, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield,
  UserCheck,
  AlertCircle,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useUsersManager } from "./hooks/useUsersManager";
import { CreateDatabaseAccessModal } from "./modals/CreateDatabaseAccessModal";
import { CreateVectorDBAccessModal } from "./modals/CreateVectorDBAccessModal";

export function UsersManager() {
  // Local state for modals
  const [activeTab, setActiveTab] = useState("mssql");
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isVectorDBModalOpen, setIsVectorDBModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [editingUser, setEditingUser] = useState<string>("");

  const {
    searchTerm,
    setSearchTerm,
    userAccessConfigs,
    userConfigs,
    userConfigLoading,
    loadUserAccessConfigs,
    loadUserConfigs,
    extractNameFromEmail,
    availableDatabases,
  } = useUsersManager();

  // Load data on component mount
  useEffect(() => {
    loadUserAccessConfigs();
    loadUserConfigs();
  }, [loadUserAccessConfigs, loadUserConfigs]);

  // Filtered data based on search term
  const filteredUserAccess = useMemo(() => {
    if (!userAccessConfigs || !Array.isArray(userAccessConfigs)) return [];
    if (!searchTerm.trim()) return userAccessConfigs;
    
    return userAccessConfigs.filter(config =>
      config && config.user_id && (
        config.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extractNameFromEmail(config.user_id).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [userAccessConfigs, searchTerm, extractNameFromEmail]);

  // Filter users by access type
  const mssqlUsers = useMemo(() => {
    return filteredUserAccess.filter((config) =>
      config.database_access?.parent_databases?.length > 0 ||
      config.database_access?.sub_databases?.some((sub: any) => sub.databases?.length > 0)
    );
  }, [filteredUserAccess]);

  const vectorDBUsers = useMemo(() => {
    return userConfigs.filter((config) => 
      config.db_id && config.table_names && config.table_names.length > 0
    );
  }, [userConfigs]);

  // Handle modal operations
  const handleCreateMSSQLAccess = () => {
    setSelectedUser("");
    setEditingUser("");
    setIsDatabaseModalOpen(true);
  };

  const handleCreateVectorDBAccess = () => {
    setSelectedUser("");
    setEditingUser("");
    setIsVectorDBModalOpen(true);
  };

  const handleEditUser = (userId: string, type: 'mssql' | 'vector') => {
    setSelectedUser(userId);
    setEditingUser(userId);
    if (type === 'mssql') {
      setIsDatabaseModalOpen(true);
    } else {
      setIsVectorDBModalOpen(true);
    }
  };

  const handleModalSuccess = () => {
    loadUserAccessConfigs();
    loadUserConfigs();
    setIsDatabaseModalOpen(false);
    setIsVectorDBModalOpen(false);
    setSelectedUser("");
    setEditingUser("");
  };

  const handleModalClose = () => {
    setIsDatabaseModalOpen(false);
    setIsVectorDBModalOpen(false);
    setSelectedUser("");
    setEditingUser("");
  };

  // Helper functions
  const getDatabaseName = (dbId: number) => {
    const database = availableDatabases?.find(db => db.db_id === dbId);
    return database ? database.db_name : `DB ${dbId}`;
  };

  const formatTableNames = (tableNames: string[]) => {
    if (!tableNames || tableNames.length === 0) return 'No tables';
    if (tableNames.length <= 3) return tableNames.join(', ');
    return `${tableNames.slice(0, 3).join(', ')} +${tableNames.length - 3} more`;
  };

  const getAccessLevelBadge = (config: any) => {
    const hasMSSQL = config.database_access?.parent_databases?.length > 0 || 
                     config.database_access?.sub_databases?.some((sub: any) => sub.databases?.length > 0);
    const hasVectorDB = config.access_level >= 2;
    
    if (hasMSSQL && hasVectorDB) {
      return <Badge className="bg-green-600 hover:bg-green-700">Full Access</Badge>;
    } else if (hasMSSQL) {
      return <Badge className="bg-blue-600 hover:bg-blue-700">MSSQL Only</Badge>;
    } else if (hasVectorDB) {
      return <Badge className="bg-purple-600 hover:bg-purple-700">Vector DB Only</Badge>;
    } else {
      return <Badge variant="secondary">No Access</Badge>;
    }
  };

  const getDatabaseCount = (config: any) => {
    const parentCount = config.database_access?.parent_databases?.length || 0;
    const subCount = config.database_access?.sub_databases?.reduce((total: number, sub: any) => 
      total + (sub.databases?.length || 0), 0) || 0;
    return parentCount + subCount;
  };

  if (userConfigLoading || !activeTab) {
    return (
      <div className="w-full min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-white mb-2">Loading Users</h2>
            <p className="text-gray-400">Please wait while we load user access configurations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-400" />
                User Access Management
              </h1>
              <p className="text-gray-400 mt-2">
                Manage user access to MSSQL databases and vector databases
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCreateMSSQLAccess}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add MSSQL Access
              </Button>
              <Button
                onClick={handleCreateVectorDBAccess}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Brain className="w-4 h-4 mr-2" />
                Add Vector DB Access
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{filteredUserAccess.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">MSSQL Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{mssqlUsers.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Vector DB Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{vectorDBUsers.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Full Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {filteredUserAccess.filter(config => 
                  (config.database_access?.parent_databases?.length > 0 || 
                   config.database_access?.sub_databases?.some((sub: any) => sub.databases?.length > 0)) &&
                  config.access_level >= 2
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab || "mssql"} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger
              value="mssql"
              className="flex items-center gap-2 data-[state=active]:bg-slate-700"
            >
              <Database className="h-4 w-4" />
              MSSQL Database Access
            </TabsTrigger>
            <TabsTrigger
              value="vector"
              className="flex items-center gap-2 data-[state=active]:bg-slate-700"
            >
              <Brain className="h-4 w-4" />
              Vector Database Access
            </TabsTrigger>
          </TabsList>

          {/* MSSQL Database Access Tab */}
          <TabsContent value="mssql" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-400" />
                  MSSQL Database Access Users
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  Users with access to MSSQL databases for data operations
                </p>
              </CardHeader>
              <CardContent>
                {mssqlUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No MSSQL Access Users</h3>
                    <p className="text-gray-400 mb-4">
                      No users have been granted access to MSSQL databases yet.
                    </p>
                    <Button onClick={handleCreateMSSQLAccess} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Grant First Access
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mssqlUsers.map((config) => (
                      <div
                        key={config.user_id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-medium text-white">
                                {extractNameFromEmail(config.user_id)}
                              </h4>
                              {getAccessLevelBadge(config)}
                            </div>
                            <p className="text-sm text-gray-400">{config.user_id}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Databases: {getDatabaseCount(config)}</span>
                              <span>Sub-companies: {config.sub_company_ids?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleEditUser(config.user_id, 'mssql')}
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vector Database Access Tab */}
          <TabsContent value="vector" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Vector Database Access Users
                </CardTitle>
                <p className="text-gray-400 text-sm">
                  Users with access to vector databases for AI and ML operations
                </p>
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={loadUserConfigs}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    disabled={userConfigLoading}
                  >
                    {userConfigLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {userConfigLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-medium text-white mb-2">Loading Vector DB Access Users</h3>
                    <p className="text-gray-400">
                      Fetching user configurations from the server...
                    </p>
                  </div>
                ) : vectorDBUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Vector DB Access Users</h3>
                    <p className="text-gray-400 mb-4">
                      No users have been granted access to vector databases yet.
                    </p>
                    <Button onClick={handleCreateVectorDBAccess} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Grant First Access
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vectorDBUsers.map((config) => (
                      <div
                        key={config.user_id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-medium text-white">
                                {extractNameFromEmail(config.user_id)}
                              </h4>
                              {getAccessLevelBadge(config)}
                            </div>
                            <p className="text-sm text-gray-400">{config.user_id}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Access Level: {config.access_level}</span>
                              <span>Database: {getDatabaseName(config.db_id)}</span>
                              <span>Tables: {formatTableNames(config.table_names)}</span>
                            </div>
                            {config.table_names && config.table_names.length > 3 && (
                              <div className="mt-2 text-xs text-gray-400">
                                <details className="cursor-pointer">
                                  <summary className="hover:text-gray-300">Show all tables</summary>
                                  <div className="mt-2 pl-4">
                                    {config.table_names.map((table, index) => (
                                      <div key={index} className="text-gray-400">
                                        • {table}
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleEditUser(config.user_id, 'vector')}
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CreateDatabaseAccessModal
          isOpen={isDatabaseModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          selectedUser={selectedUser}
          editingUser={editingUser}
        />

        <CreateVectorDBAccessModal
          isOpen={isVectorDBModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          selectedUser={selectedUser}
          editingUser={editingUser}
        />
      </div>
    </div>
  );
}
