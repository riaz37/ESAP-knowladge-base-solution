"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateDatabaseAccessModal } from "./CreateDatabaseAccessModal";
import { CreateVectorDBAccessModal } from "./CreateVectorDBAccessModal";
import { Database, Brain, ArrowRight, Shield, Sparkles } from "lucide-react";

interface AccessTypeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSuccess?: () => void;
}

export function AccessTypeSelectorModal({
  isOpen,
  onClose,
  userId = "",
  onSuccess,
}: AccessTypeSelectorModalProps) {
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showVectorDBModal, setShowVectorDBModal] = useState(false);

  const handleDatabaseAccess = () => {
    setShowDatabaseModal(true);
  };

  const handleVectorDBAccess = () => {
    setShowVectorDBModal(true);
  };

  const handleDatabaseSuccess = () => {
    setShowDatabaseModal(false);
    if (onSuccess) onSuccess();
  };

  const handleVectorDBSuccess = () => {
    setShowVectorDBModal(false);
    if (onSuccess) onSuccess();
  };

  const handleBack = () => {
    setShowDatabaseModal(false);
    setShowVectorDBModal(false);
  };

  return (
    <>
      {/* Main Selection Modal */}
      <Dialog open={isOpen && !showDatabaseModal && !showVectorDBModal} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-blue-500/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              Database Access Configuration
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-gray-400 text-sm">
              Choose the type of database access to configure for this user
            </p>
          {/* Database Access Option */}
          <div
            onClick={handleDatabaseAccess}
            className="group cursor-pointer p-6 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-500/50 hover:bg-slate-700/70 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                  <Database className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    MSSQL Database Access
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Configure traditional database access for data operations, table management, and business queries
                  </p>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-blue-400" />
                      Database connection management
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-blue-400" />
                      Table access permissions
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-blue-400" />
                      SQL query execution
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-blue-400" />
                      Business rule enforcement
                    </div>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>

          {/* Vector DB Access Option */}
          <div
            onClick={handleVectorDBAccess}
            className="group cursor-pointer p-6 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-purple-500/50 hover:bg-slate-700/70 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    Vector Database Access
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Configure AI-powered access for semantic search, vector operations, and intelligent data analysis
                  </p>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                      Semantic search capabilities
                    </div>
                    <div className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                      Vector embeddings and similarity
                    </div>
                    <div className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                      AI model integration
                    </div>
                    <div className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                      Natural language processing
                    </div>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
            </div>
          </div>

          {/* Information Section */}
          <div className="bg-slate-800/30 rounded-lg border border-slate-600 p-4">
            <h4 className="text-white font-medium mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-yellow-400" />
              Key Differences
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-400 font-medium">MSSQL Access:</span>
                <p className="text-gray-400 mt-1">
                  Traditional database operations, structured queries, business logic
                </p>
              </div>
              <div>
                <span className="text-purple-400 font-medium">Vector DB Access:</span>
                <p className="text-gray-400 mt-1">
                  AI operations, semantic understanding, intelligent insights
                </p>
              </div>
            </div>
          </div>
        </div>
          </DialogContent>
        </Dialog>

      {/* Database Access Creation Modal */}
      <CreateDatabaseAccessModal
        isOpen={showDatabaseModal}
        onClose={() => setShowDatabaseModal(false)}
        onSuccess={handleDatabaseSuccess}
        selectedUser={userId}
      />

      {/* Vector DB Access Creation Modal */}
      <CreateVectorDBAccessModal
        isOpen={showVectorDBModal}
        onClose={() => setShowVectorDBModal(false)}
        onSuccess={handleVectorDBSuccess}
        selectedUser={userId}
      />
    </>
  );
} 