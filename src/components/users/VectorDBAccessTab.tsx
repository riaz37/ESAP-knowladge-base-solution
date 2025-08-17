"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/tabs";
import { 
  Brain, 
  Database, 
  Shield, 
  Plus, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { VectorDBAccessSection } from "./VectorDBAccessSection";
import { VectorDBAccessEmptyState } from "./VectorDBAccessEmptyState";
import { CreateVectorDBAccessModal } from "./modals/CreateVectorDBAccessModal";

interface VectorDBAccessTabProps {
  userConfigs: any[];
  databaseConfigs: any[];
  isLoading: boolean;
  selectedUserForVectorDB: string;
  onManageVectorDBAccess: (userId: string) => void;
  onCloseVectorDBAccess: () => void;
  extractNameFromEmail: (email: string) => string;
}

export function VectorDBAccessTab({
  userConfigs,
  databaseConfigs,
  isLoading,
  selectedUserForVectorDB,
  onManageVectorDBAccess,
  onCloseVectorDBAccess,
  extractNameFromEmail,
}: VectorDBAccessTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Helper functions
  const getAccessLevelLabel = (level: number) => {
    if (level >= 8) return { label: "Full Access", color: "bg-green-600", icon: CheckCircle };
    if (level >= 5) return { label: "Advanced Access", color: "bg-blue-600", icon: Shield };
    if (level >= 2) return { label: "Vector DB Access", color: "bg-purple-600", icon: Brain };
    return { label: "Read Only", color: "bg-gray-600", icon: Info };
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'CheckCircle':
        return CheckCircle;
      case 'Shield':
        return Shield;
      case 'Brain':
        return Brain;
      case 'Info':
        return Info;
      default:
        return Info;
    }
  };

  // Filter for vector DB access (access_level >= 2) with safety checks
  const vectorDBConfigs = React.useMemo(() => {
    if (!userConfigs || !Array.isArray(userConfigs)) return [];
    
    return userConfigs.filter(config => 
      config && 
      config.access_level && 
      typeof config.access_level === 'number' && 
      config.access_level >= 2
    );
  }, [userConfigs]);

  // Safe database configs
  const safeDatabaseConfigs = databaseConfigs || [];

  // Handle create success
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    // The parent component will handle refreshing data
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/30 rounded-lg border border-slate-600 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Brain className="w-5 h-5 text-purple-400 mr-2" />
            <h3 className="text-lg font-medium text-white">Vector Database Access Management</h3>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Vector DB Access
          </Button>
        </div>
        <p className="text-gray-400 text-sm">
          Configure user access to vector databases for AI operations. This enables semantic search, intelligent data analysis, and AI-powered querying capabilities.
        </p>
      </div>

      {/* Current Vector DB Access Configurations */}
      <div className="bg-slate-800/30 rounded-lg border border-slate-600 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-white flex items-center">
              <Brain className="w-5 h-5 text-purple-400 mr-2" />
              Current Vector DB Access Configurations
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              All users with vector database access configurations
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-500 text-slate-300 hover:bg-slate-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
            <p className="text-gray-400">Loading vector DB access configurations...</p>
          </div>
        ) : vectorDBConfigs.length > 0 ? (
          <div className="space-y-4">
            {vectorDBConfigs.map((config, index) => {
              if (!config || typeof config.access_level !== 'number') return null;
              
              const accessInfo = getAccessLevelLabel(config.access_level);
              const IconComponent = getIconComponent(accessInfo.icon);
              const dbConfig = safeDatabaseConfigs.find(db => db && db.db_id === config.db_id);
              
              return (
                <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-500">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <IconComponent className="w-5 h-5 mr-2 text-white" />
                      <span className="text-white font-medium">User: {config.user_id}</span>
                      <Badge className={`ml-2 ${accessInfo.color}`}>
                        {accessInfo.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        Database #{config.db_id}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onManageVectorDBAccess(config.user_id)}
                        className="border-purple-500 text-purple-300 hover:bg-purple-600/20"
                      >
                        Manage Access
                      </Button>
                    </div>
                  </div>
                  
                  {dbConfig && dbConfig.db_config && (
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-400">Host:</span>
                        <span className="text-white ml-2">{dbConfig.db_config.DB_HOST || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Port:</span>
                        <span className="text-white ml-2">{dbConfig.db_config.DB_PORT || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Database:</span>
                        <span className="text-white ml-2">{dbConfig.db_config.DB_NAME || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Schema:</span>
                        <span className="text-white ml-2">{dbConfig.db_config.schema || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-3 border-t border-slate-500">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Accessible Tables:</span>
                      <span className="text-white text-sm">
                        {config.accessible_tables && Array.isArray(config.accessible_tables) 
                          ? config.accessible_tables.length 
                          : 0} tables
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {config.accessible_tables && Array.isArray(config.accessible_tables) ? (
                        <>
                          {config.accessible_tables.slice(0, 5).map((table, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-purple-600/20 text-purple-400">
                              {table}
                            </Badge>
                          ))}
                          {config.accessible_tables.length > 5 && (
                            <Badge variant="secondary" className="bg-gray-600/20 text-gray-400">
                              +{config.accessible_tables.length - 5} more
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-500 text-sm">No tables configured</span>
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
            <h3 className="text-lg font-medium text-white mb-2">No Vector DB Access Configured</h3>
            <p className="text-gray-400 mb-4">
              No users have vector database access configured yet.
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Vector DB Access
            </Button>
          </div>
        )}
      </div>

      {/* Individual User Vector DB Management */}
      {selectedUserForVectorDB ? (
        <VectorDBAccessSection
          selectedUserForVectorDB={selectedUserForVectorDB}
          extractNameFromEmail={extractNameFromEmail}
          onClose={onCloseVectorDBAccess}
        />
      ) : (
        <VectorDBAccessEmptyState
          onGoToUserAccess={() => {/* This will be handled by parent */}}
        />
      )}

      {/* Create Vector DB Access Modal */}
      <CreateVectorDBAccessModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
} 