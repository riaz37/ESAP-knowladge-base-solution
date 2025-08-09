"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Database, Users, FileText, DollarSign, Calendar, Settings, Folder, Link } from "lucide-react";

interface TableNodeData {
  table: {
    name: string;
    full_name: string;
    columns?: any[];
    relationships?: any[];
  };
  label: string;
}

// Get appropriate icon based on table name
const getTableIcon = (tableName: string) => {
  const name = tableName.toLowerCase();
  if (name.includes('user') || name.includes('employee') || name.includes('person')) {
    return Users;
  }
  if (name.includes('transaction') || name.includes('payment') || name.includes('salary') || name.includes('expense')) {
    return DollarSign;
  }
  if (name.includes('report') || name.includes('document') || name.includes('file')) {
    return FileText;
  }
  if (name.includes('attendance') || name.includes('time') || name.includes('date')) {
    return Calendar;
  }
  if (name.includes('config') || name.includes('setting') || name.includes('permission')) {
    return Settings;
  }
  if (name.includes('project') || name.includes('department') || name.includes('company')) {
    return Folder;
  }
  return Database;
};

// Get color scheme based on table type
const getTableColors = (tableName: string) => {
  const name = tableName.toLowerCase();
  if (name.includes('user') || name.includes('employee') || name.includes('person')) {
    return {
      bg: 'bg-blue-900/20',
      border: 'border-blue-500/40',
      icon: 'text-blue-400',
      title: 'text-blue-100',
      subtitle: 'text-blue-300/60',
      dots: 'bg-blue-400/60',
      relationships: 'text-blue-300/60'
    };
  }
  if (name.includes('transaction') || name.includes('payment') || name.includes('salary') || name.includes('expense')) {
    return {
      bg: 'bg-green-900/20',
      border: 'border-green-500/40',
      icon: 'text-green-400',
      title: 'text-green-100',
      subtitle: 'text-green-300/60',
      dots: 'bg-green-400/60',
      relationships: 'text-green-300/60'
    };
  }
  if (name.includes('report') || name.includes('document') || name.includes('file')) {
    return {
      bg: 'bg-purple-900/20',
      border: 'border-purple-500/40',
      icon: 'text-purple-400',
      title: 'text-purple-100',
      subtitle: 'text-purple-300/60',
      dots: 'bg-purple-400/60',
      relationships: 'text-purple-300/60'
    };
  }
  if (name.includes('attendance') || name.includes('time') || name.includes('date')) {
    return {
      bg: 'bg-orange-900/20',
      border: 'border-orange-500/40',
      icon: 'text-orange-400',
      title: 'text-orange-100',
      subtitle: 'text-orange-300/60',
      dots: 'bg-orange-400/60',
      relationships: 'text-orange-300/60'
    };
  }
  if (name.includes('project') || name.includes('department') || name.includes('company')) {
    return {
      bg: 'bg-indigo-900/20',
      border: 'border-indigo-500/40',
      icon: 'text-indigo-400',
      title: 'text-indigo-100',
      subtitle: 'text-indigo-300/60',
      dots: 'bg-indigo-400/60',
      relationships: 'text-indigo-300/60'
    };
  }
  // Default emerald theme
  return {
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-500/40',
    icon: 'text-emerald-400',
    title: 'text-emerald-100',
    subtitle: 'text-emerald-300/60',
    dots: 'bg-emerald-400/60',
    relationships: 'text-emerald-300/60'
  };
};

export const TableNode = memo(({ data }: NodeProps<TableNodeData>) => {
  const { table, label } = data;
  const Icon = getTableIcon(table.name);
  const colors = getTableColors(table.name);

  return (
    <div className="relative group">
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-600 border-2 border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-600 border-2 border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
      />

      {/* Enhanced table card */}
      <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 min-w-[200px] backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105`}>
        {/* Header with icon and title */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`${colors.icon} p-2 rounded-lg bg-black/20`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`${colors.title} font-semibold text-sm leading-tight`}>
              {label}
            </h3>
            <p className={`${colors.subtitle} text-xs font-mono mt-1 truncate`}>
              {table.full_name}
            </p>
          </div>
        </div>

        {/* Column indicators */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: Math.min(table.columns?.length || 0, 8) }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 ${colors.dots} rounded-full`}
              />
            ))}
          </div>
          <span className={`${colors.subtitle} text-xs`}>
            {table.columns?.length || 0} columns
          </span>
        </div>

        {/* Relationship indicator */}
        {table.relationships && table.relationships.length > 0 && (
          <div className="flex items-center gap-2">
            <Link className={`${colors.icon} h-3 w-3`} />
            <span className={`${colors.relationships} text-xs`}>
              {table.relationships.length} relationship{table.relationships.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* No relationships indicator */}
        {(!table.relationships || table.relationships.length === 0) && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-600/40 rounded-full" />
            <span className="text-gray-400/60 text-xs">
              Isolated table
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

TableNode.displayName = "TableNode";