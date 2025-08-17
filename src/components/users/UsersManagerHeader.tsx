"use client";

import React from "react";
import { Search, Database, Brain } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UsersManagerHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
}

export function UsersManagerHeader({
  searchTerm,
  onSearchChange,
  isLoading,
}: UsersManagerHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          User Access Management
        </h1>
        <p className="text-gray-400">
          Manage both database access (MSSQL) and vector database access (AI operations) for users
        </p>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <div className="flex items-center text-blue-400">
            <Database className="w-4 h-4 mr-1" />
            Database Access
          </div>
          <div className="flex items-center text-purple-400">
            <Brain className="w-4 h-4 mr-1" />
            Vector DB Access
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-64 bg-slate-800 border-slate-600 text-white placeholder-gray-400"
          />
        </div>
      </div>
    </div>
  );
} 