"use client";

import React from "react";
import { Building2, ChevronRight, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Company } from "./CompanyTreeView";

interface CompanyTreeSidebarProps {
  companies: Company[];
  selectedParentForFlow: string | null;
  selectedCompany: string | null;
  onSelectParentForFlow: (parentId: string | null) => void;
  onSelectCompany: (companyId: string) => void;
}

export function CompanyTreeSidebar({
  companies,
  selectedParentForFlow,
  selectedCompany,
  onSelectParentForFlow,
  onSelectCompany,
}: CompanyTreeSidebarProps) {
  if (companies.length === 0) {
    return null;
  }

  return (
    <Card className="w-80 bg-white/5 dark:bg-white/5 backdrop-blur-md border-emerald-400/20 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-emerald-400">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          Company Structure
        </CardTitle>
        
        {selectedParentForFlow && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-emerald-400">Viewing: </span>
              {companies.find((c) => c.id === selectedParentForFlow)?.name}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelectParentForFlow(null)}
              className="text-xs border-emerald-400/50 text-emerald-400 hover:bg-emerald-400/10"
            >
              Show All
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {companies.map((company) => (
          <CompanyTreeItem
            key={company.id}
            company={company}
            isSelectedForFlow={selectedParentForFlow === company.id}
            selectedCompany={selectedCompany}
            onSelectForFlow={onSelectParentForFlow}
            onSelectCompany={onSelectCompany}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface CompanyTreeItemProps {
  company: Company;
  isSelectedForFlow: boolean;
  selectedCompany: string | null;
  onSelectForFlow: (parentId: string | null) => void;
  onSelectCompany: (companyId: string) => void;
}

function CompanyTreeItem({
  company,
  isSelectedForFlow,
  selectedCompany,
  onSelectForFlow,
  onSelectCompany,
}: CompanyTreeItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const hasChildren = company.children && company.children.length > 0;

  return (
    <div className="space-y-1">
      {/* Parent Company */}
      <div
        className={`
          flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200
          hover:bg-emerald-500/10 hover:border-emerald-400/30
          ${isSelectedForFlow ? 'bg-emerald-500/20 border border-emerald-400/50' : 'border border-transparent'}
        `}
        onClick={() => {
          if (isSelectedForFlow) {
            onSelectForFlow(null);
          } else {
            onSelectForFlow(company.id);
          }
        }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-emerald-400/20 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-emerald-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-emerald-400" />
            )}
          </button>
        )}
        
        {/* Folder Icon */}
        <div className="w-4 h-4 text-emerald-400">
          📁
        </div>
        
        {/* Status Dot */}
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        
        {/* Company Name */}
        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {company.name}
        </span>
      </div>

      {/* Sub-Companies */}
      {hasChildren && isExpanded && (
        <div className="ml-4 space-y-1">
          {company.children!.map((child, index) => {
            const isLast = index === company.children!.length - 1;
            return (
              <div key={child.id} className="relative">
                {/* Tree connector lines */}
                <div className="absolute left-2 top-0 flex items-center h-8">
                  {!isLast && (
                    <div className="absolute left-0 top-4 w-px h-4 bg-emerald-400/30" />
                  )}
                  <div className="flex">
                    <div className="w-px h-4 bg-emerald-400/30" />
                    <div className="w-3 h-px bg-emerald-400/30 mt-4" />
                  </div>
                </div>

                <div
                  className={`
                    flex items-center gap-2 p-2 ml-6 rounded-lg cursor-pointer transition-all duration-200
                    hover:bg-emerald-500/10
                    ${selectedCompany === child.id ? 'bg-emerald-500/15 border border-emerald-400/30' : ''}
                  `}
                  onClick={() => onSelectCompany(child.id)}
                >
                  {/* File Icon */}
                  <div className="w-4 h-4 text-emerald-400/70">
                    📄
                  </div>
                  
                  {/* Status Dot */}
                  <div className="w-2 h-2 rounded-full bg-emerald-400/70" />
                  
                  {/* Company Name */}
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {child.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
