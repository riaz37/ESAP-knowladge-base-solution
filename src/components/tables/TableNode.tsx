"use client";

import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Database, Key, Link, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableData {
  id: string;
  name: string;
  fullName: string;
  schema: string;
  primaryKeys: string[];
  columns: Array<{
    name: string;
    type: string;
    isPrimary: boolean;
    isForeign: boolean;
    isRequired: boolean;
    maxLength?: number;
    references?: {
      table: string;
      column: string;
      constraint: string;
    };
  }>;
  relationships: Array<{
    type: string;
    viaColumn: string;
    viaRelated: string;
    relatedTable: string;
  }>;
  sampleData?: Array<Record<string, any>>;
  rowCount?: number;
}

interface TableNodeData {
  table: TableData;
  onTableClick: (table: TableData) => void;
}

export function TableNode({ data }: NodeProps<TableNodeData>) {
  const { table, onTableClick } = data;
  
  // Limit displayed columns to prevent node from being too large
  const displayColumns = table.columns.slice(0, 5);
  const hasMoreColumns = table.columns.length > 5;

  const getColumnIcon = (column: any) => {
    if (column.isPrimary) {
      return <Key className="w-3 h-3 text-yellow-400" />;
    }
    if (column.isForeign) {
      return <Link className="w-3 h-3 text-blue-400" />;
    }
    return null;
  };

  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('int') || lowerType.includes('number')) {
      return 'text-blue-400';
    }
    if (lowerType.includes('varchar') || lowerType.includes('text') || lowerType.includes('string')) {
      return 'text-green-400';
    }
    if (lowerType.includes('date') || lowerType.includes('time')) {
      return 'text-purple-400';
    }
    if (lowerType.includes('bool')) {
      return 'text-orange-400';
    }
    return 'text-gray-400';
  };

  return (
    <div className="bg-slate-800 border-2 border-slate-600 rounded-lg shadow-lg min-w-[250px] max-w-[300px]">
      {/* Connection handles */}
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-emerald-500 border-2 border-slate-800"
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-emerald-500 border-2 border-slate-800"
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-emerald-500 border-2 border-slate-800"
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-emerald-500 border-2 border-slate-800"
      />

      {/* Table Header */}
      <div className="bg-emerald-600 text-white p-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Database className="w-4 h-4 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate">{table.name}</h3>
              <p className="text-xs text-emerald-100 truncate">{table.fullName}</p>
            </div>
          </div>
          <Button
            onClick={() => onTableClick(table)}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-emerald-700 flex-shrink-0"
          >
            <Eye className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Columns List */}
      <div className="p-3">
        <div className="space-y-1">
          {displayColumns.map((column, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-700/50"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getColumnIcon(column)}
                <span className="text-gray-200 truncate font-medium">
                  {column.name}
                </span>
              </div>
              <span className={`text-xs font-mono ${getTypeColor(column.type)} ml-2`}>
                {column.type}
              </span>
            </div>
          ))}
          
          {hasMoreColumns && (
            <div className="text-xs text-gray-400 text-center py-1">
              +{table.columns.length - 5} more columns
            </div>
          )}
        </div>

        {/* Relationships indicator */}
        {table.relationships && table.relationships.length > 0 && (
          <div className="mt-3 pt-2 border-t border-slate-600">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <Link className="w-3 h-3" />
              <span>{table.relationships.length} relationship{table.relationships.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-1">
              {table.relationships.slice(0, 2).map((rel, index) => (
                <div key={index} className="text-xs text-gray-300 bg-slate-600/30 rounded px-2 py-1">
                  <div className="font-medium text-emerald-400">{rel.type}</div>
                  <div className="text-gray-400">
                    {rel.viaColumn} → {rel.relatedTable}.{rel.viaRelated}
                  </div>
                </div>
              ))}
              {table.relationships.length > 2 && (
                <div className="text-xs text-gray-400 text-center">
                  +{table.relationships.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Row count indicator */}
        {table.rowCount && (
          <div className="mt-2 pt-2 border-t border-slate-600">
            <div className="text-xs text-gray-400 text-center">
              ~{table.rowCount.toLocaleString()} rows
            </div>
          </div>
        )}
      </div>
    </div>
  );
}