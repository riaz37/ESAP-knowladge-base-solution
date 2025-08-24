"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Building2, 
  Shield, 
  Edit, 
  Brain,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { useUsersManager } from "./hooks/useUsersManager";
import { UserAccessData } from "@/types/api";

interface DatabaseAccessTabProps {
  userAccessConfigs: UserAccessData[];
  isLoading: boolean;
  onManageVectorDBAccess: (userId: string) => void;
  searchTerm: string;
  onEditAccess: (userId: string) => void;
  onCreateAccess: () => void;
}

export function DatabaseAccessTab({
  userAccessConfigs,
  isLoading,
  onManageVectorDBAccess,
  searchTerm,
  onEditAccess,
  onCreateAccess,
}: DatabaseAccessTabProps) {
  const {
    currentPage,
    rowsPerPage,
    totalPages,
    selectedUsers,
    isAllSelected,
    isIndeterminate,
    setCurrentPage,
    setRowsPerPage,
    setActiveTab,
    handleSelectAll,
    handleSelectUser,
    extractNameFromEmail,
    getAccessSummary,
  } = useUsersManager();

  // Safety check for userAccessConfigs
  const safeUserAccessConfigs = userAccessConfigs || [];

  // Pagination with safety checks
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedConfigs = safeUserAccessConfigs.slice(startIndex, startIndex + rowsPerPage);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-800/30 rounded-lg border border-slate-600 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <h3 className="text-lg font-medium text-white">MSSQL Database Access Management</h3>
            </div>
            <Button
              onClick={onCreateAccess}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Database Access
            </Button>
          </div>
          <p className="text-gray-400 text-sm">
            Manage user access to MSSQL databases. Users can be granted access to specific databases with configurable permissions for data operations.
          </p>
        </div>
        
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-400">Loading database access configurations...</p>
        </div>
      </div>
    );
  }

  if (safeUserAccessConfigs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-800/30 rounded-lg border border-slate-600 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <h3 className="text-lg font-medium text-white">MSSQL Database Access Management</h3>
            </div>
            <Button
              onClick={onCreateAccess}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Database Access
            </Button>
          </div>
          <p className="text-gray-400 text-sm">
            Manage user access to MSSQL databases. Users can be granted access to specific databases with configurable permissions for data operations.
          </p>
        </div>
        
        <div className="text-center py-8">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Database Access Configured</h3>
          <p className="text-gray-400 mb-4">
            No users have database access configured yet.
          </p>
          <p className="text-sm text-gray-500">
            Use the "Create Database Access" button to configure access for users
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/30 rounded-lg border border-slate-600 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <h3 className="text-lg font-medium text-white">MSSQL Database Access Management</h3>
          </div>
          <Button
            onClick={onCreateAccess}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Database Access
          </Button>
        </div>
        <p className="text-gray-400 text-sm">
          Manage user access to MSSQL databases. Users can be granted access to specific databases with configurable permissions for data operations.
        </p>
      </div>

      {/* User Access List */}
      <div className="bg-slate-800/30 rounded-lg border border-slate-600 p-6">
        <div className="space-y-4">
          {paginatedConfigs.map((config, index) => (
            <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-500">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      {extractNameFromEmail(config.user_id)}
                    </h4>
                    <p className="text-gray-400 text-sm">{config.user_id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAccess(config.user_id)}
                    className="border-blue-500 text-blue-300 hover:bg-blue-600/20"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit Access
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onManageVectorDBAccess(config.user_id)}
                    className="border-purple-500 text-purple-300 hover:bg-purple-600/20"
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    Vector DB
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span className="text-gray-400">Access Summary:</span>
                  <span className="text-white ml-2">{getAccessSummary(config)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Parent Company:</span>
                  <span className="text-white ml-2">
                    {config.parent_company_name || 'Not specified'}
                  </span>
                </div>
              </div>
              
              {/* Database Access Details */}
              {config.database_access && (
                <div className="pt-3 border-t border-slate-500">
                  <div className="space-y-2">
                    {/* Parent Company Databases */}
                    {config.database_access.parent_databases && config.database_access.parent_databases.length > 0 && (
                      <div>
                        <span className="text-gray-400 text-sm">Parent Company Databases:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {config.database_access.parent_databases.map((db, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-blue-600/20 text-blue-400">
                              DB {db.db_id} (Level {db.access_level})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Sub Company Databases */}
                    {config.database_access.sub_databases && config.database_access.sub_databases.length > 0 && (
                      <div>
                        <span className="text-gray-400 text-sm">Sub Company Databases:</span>
                        <div className="space-y-1 mt-1">
                          {config.database_access.sub_databases.map((subDb, idx) => (
                            <div key={idx} className="ml-4">
                              <span className="text-gray-400 text-xs">Company {subDb.sub_company_id}:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {subDb.databases?.map((db, dbIdx) => (
                                  <Badge key={dbIdx} variant="secondary" className="bg-green-600/20 text-green-400">
                                    DB {db.db_id} (Level {db.access_level})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-500">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <span className="text-sm text-gray-400">
                ({safeUserAccessConfigs.length} total users)
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-slate-500 text-slate-300 hover:bg-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-slate-500 text-slate-300 hover:bg-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 