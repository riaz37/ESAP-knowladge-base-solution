"use client";

import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersManagerHeader } from "./UsersManagerHeader";
import { DatabaseAccessTab } from "./DatabaseAccessTab";
import { VectorDBAccessTab } from "./VectorDBAccessTab";
import { CreateDatabaseAccessModal } from "./modals/CreateDatabaseAccessModal";
import { useUsersManager } from "./hooks/useUsersManager";

export function UsersManager() {
  const [activeTab, setActiveTab] = useState("database");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [selectedUserForDatabase, setSelectedUserForDatabase] = useState<string>("");

  const {
    // Core state
    isLoading,
    userAccessConfigs,
    userConfigs,
    databaseConfigs,
    
    // Actions
    loadUserAccessConfigs,
    loadUserConfigs,
    loadDatabaseConfigs,
    handleManageVectorDBAccess,
    handleCloseVectorDBAccess,
    selectedUserForVectorDB,
    extractNameFromEmail,
  } = useUsersManager();

  // Load data only once when component mounts
  React.useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadUserAccessConfigs(),
          loadUserConfigs(),
          loadDatabaseConfigs(),
        ]);
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };
    initializeData();
  }, []); // Empty dependency array - only run once

  // Filtered data based on search term with safety checks
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

  const filteredUserConfigs = useMemo(() => {
    if (!userConfigs || !userConfigs.configs || !Array.isArray(userConfigs.configs)) return [];
    if (!searchTerm.trim()) return userConfigs.configs;
    
    return userConfigs.configs.filter(config =>
      config && config.user_id && 
      config.user_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [userConfigs, searchTerm]);

  // Handle access creation success
  const handleAccessSuccess = () => {
    // Refresh data
    loadUserAccessConfigs();
    loadUserConfigs();
    setIsDatabaseModalOpen(false);
    setSelectedUserForDatabase("");
  };

  // Handle create database access
  const handleCreateDatabaseAccess = () => {
    setSelectedUserForDatabase("");
    setIsDatabaseModalOpen(true);
  };

  // Handle edit database access
  const handleEditDatabaseAccess = (userId: string) => {
    setSelectedUserForDatabase(userId);
    setIsDatabaseModalOpen(true);
  };

  return (
    <div className="w-full min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <UsersManagerHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLoading={isLoading}
        />

        {/* Access Type Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">User Access Management</h2>
          <p className="text-gray-400 text-lg max-w-3xl">
            Manage two distinct types of user access: Database Access for MSSQL operations and Vector DB Access for AI operations
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Database Access Card */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-600 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Database Access</h3>
                  <p className="text-sm text-gray-400">MSSQL Database Operations</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Configure user access to MSSQL databases for data querying, table management, and business operations.
              </p>
              <div className="text-sm text-gray-400">
                • Database connection management<br/>
                • Table access permissions<br/>
                • SQL query execution<br/>
                • Business rule enforcement
              </div>
            </div>

            {/* Vector DB Access Card */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-600 p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Vector DB Access</h3>
                  <p className="text-sm text-gray-400">AI & Vector Operations</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Configure user access to vector databases for AI operations, semantic search, and intelligent data analysis.
              </p>
              <div className="text-sm text-gray-400">
                • Vector database connections<br/>
                • AI query capabilities<br/>
                • Semantic search access<br/>
                • Embedding generation
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-600">
            <TabsTrigger 
              value="database" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                Database Access
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="vector-db" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Vector DB Access
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Database Access Tab */}
          <TabsContent value="database" className="space-y-6 mt-6">
            <DatabaseAccessTab
              userAccessConfigs={filteredUserAccess}
              isLoading={isLoading}
              onManageVectorDBAccess={handleManageVectorDBAccess}
              searchTerm={searchTerm}
              onEditAccess={handleEditDatabaseAccess}
              onCreateAccess={handleCreateDatabaseAccess}
            />
          </TabsContent>

          {/* Vector DB Access Tab */}
          <TabsContent value="vector-db" className="space-y-6 mt-6">
            <VectorDBAccessTab
              userConfigs={filteredUserConfigs}
              databaseConfigs={databaseConfigs || []}
              isLoading={isLoading}
              selectedUserForVectorDB={selectedUserForVectorDB}
              onManageVectorDBAccess={handleManageVectorDBAccess}
              onCloseVectorDBAccess={handleCloseVectorDBAccess}
              extractNameFromEmail={extractNameFromEmail}
            />
          </TabsContent>
        </Tabs>

        {/* Database Access Creation Modal */}
        <CreateDatabaseAccessModal
          isOpen={isDatabaseModalOpen}
          onClose={() => setIsDatabaseModalOpen(false)}
          onSuccess={handleAccessSuccess}
          selectedUser={selectedUserForDatabase}
        />
      </div>
    </div>
  );
}
