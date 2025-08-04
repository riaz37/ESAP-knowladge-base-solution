"use client";

import React from "react";
import { Building2, Plus, Upload } from "lucide-react";
import { Handle, Position } from "reactflow";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Company } from "./CompanyTreeView";

interface CompanyCardProps {
  company: Company;
  onAddSubCompany?: (parentId: string) => void;
  onUpload?: (
    companyId: string,
    companyName: string,
    companyType: "parent" | "sub"
  ) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  level?: number;
}

export function CompanyCard({
  company,
  onAddSubCompany,
  onUpload,
  isSelected = false,
  onSelect,
  level = 0,
}: CompanyCardProps) {
  const isMainCompany = level === 0;

  return (
    <div className="relative group">
      {/* ReactFlow Handles - Render based on node's role in hierarchy */}

      {/* Target handle - for receiving connections from parent (all non-root nodes) */}
      {!isMainCompany && (
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{
            width: "12px",
            height: "12px",
            background: "#10b981",
            border: "2px solid #10b981",
            top: "-6px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      )}

      {/* Source handle - for connecting to children (main companies always have this for potential children) */}
      {isMainCompany && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          style={{
            width: "12px",
            height: "12px",
            background: "#10b981",
            border: "2px solid #10b981",
            bottom: "-6px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      )}

      {/* Main Card */}
      <Card
        className={`
          relative cursor-pointer transition-all duration-300 border-emerald-400/20
          bg-white/5 dark:bg-white/5 backdrop-blur-sm
          hover:bg-white/10 dark:hover:bg-white/10
          hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/20
          ${
            isSelected
              ? "ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/30 scale-105"
              : "hover:scale-105"
          }
          ${isMainCompany ? "w-96 h-48" : "w-80 h-44"}
        `}
        onClick={onSelect}
      >
        <CardContent className="p-6 h-full flex items-center gap-4">
          {/* Company Icon */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Status Indicator */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
            </div>
          </div>

          {/* Company Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
              {company.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
              {company.description || "No description available"}
            </p>
            {company.address && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                📍 {company.address}
              </p>
            )}
          </div>
        </CardContent>

        {/* Selected State Indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">ACTIVE</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          {/* Add Sub-Company Button - Only for main companies */}
          {isMainCompany && onAddSubCompany && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onAddSubCompany(company.id);
              }}
              className="border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Sub-Company
            </Button>
          )}

          {/* Upload Button - Available for both parent and sub companies */}
          {onUpload && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                const companyType = company.id.startsWith("parent-")
                  ? "parent"
                  : "sub";
                onUpload(company.id, company.name, companyType);
              }}
              className="border-blue-400/50 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400"
            >
              <Upload className="w-3 h-3 mr-1" />
              Upload
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
