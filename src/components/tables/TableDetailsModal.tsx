"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Key,
  Link,
  Eye,
  EyeOff,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
} from "lucide-react";

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

interface TableDetailsModalProps {
  table: TableData;
  isOpen: boolean;
  onClose: () => void;
}

export function TableDetailsModal({
  table,
  isOpen,
  onClose,
}: TableDetailsModalProps) {
  const getColumnIcon = (column: any) => {
    if (column.isPrimary) {
      return <Key className="w-4 h-4 text-yellow-400" />;
    }
    if (column.isForeign) {
      return <Link className="w-4 h-4 text-blue-400" />;
    }
    return <Hash className="w-4 h-4 text-gray-400" />;
  };

  const getTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("int") || lowerType.includes("number")) {
      return <Hash className="w-4 h-4 text-blue-400" />;
    }
    if (
      lowerType.includes("varchar") ||
      lowerType.includes("text") ||
      lowerType.includes("string")
    ) {
      return <Type className="w-4 h-4 text-green-400" />;
    }
    if (lowerType.includes("date") || lowerType.includes("time")) {
      return <Calendar className="w-4 h-4 text-purple-400" />;
    }
    if (lowerType.includes("bool")) {
      return <ToggleLeft className="w-4 h-4 text-orange-400" />;
    }
    return <Type className="w-4 h-4 text-gray-400" />;
  };

  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("int") || lowerType.includes("number")) {
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
    if (
      lowerType.includes("varchar") ||
      lowerType.includes("text") ||
      lowerType.includes("string")
    ) {
      return "bg-green-500/20 text-green-400 border-green-500/30";
    }
    if (lowerType.includes("date") || lowerType.includes("time")) {
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    }
    if (lowerType.includes("bool")) {
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    }
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case "one-to-one":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "one-to-many":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "many-to-many":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl text-white">
            <Database className="w-6 h-6 text-emerald-400" />
            <div className="flex flex-col items-start">
              <span>{table.name}</span>
              <span className="text-sm text-gray-400 font-normal">
                {table.fullName}
              </span>
            </div>
            <Badge
              variant="outline"
              className="ml-auto border-emerald-500/30 text-emerald-400"
            >
              {table.columns.length} columns
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columns Section */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-emerald-400" />
              Columns
            </h3>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {table.columns.map((column, index) => (
                  <div
                    key={index}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getColumnIcon(column)}
                        <h4 className="font-medium text-white">
                          {column.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {!column.isRequired ? (
                          <Eye
                            className="w-4 h-4 text-gray-400"
                            title="Nullable"
                          />
                        ) : (
                          <EyeOff
                            className="w-4 h-4 text-red-400"
                            title="Required"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      {getTypeIcon(column.type)}
                      <Badge
                        variant="outline"
                        className={`font-mono text-xs ${getTypeColor(
                          column.type
                        )}`}
                      >
                        {column.type}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {column.isPrimary && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          Primary Key
                        </Badge>
                      )}
                      {column.isForeign && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Foreign Key
                        </Badge>
                      )}
                      {column.references && (
                        <Badge
                          variant="outline"
                          className="border-blue-500/30 text-blue-400"
                        >
                          → {column.references.table}.{column.references.column}
                        </Badge>
                      )}
                      {!column.isRequired && (
                        <Badge
                          variant="outline"
                          className="border-gray-500/30 text-gray-400"
                        >
                          Nullable
                        </Badge>
                      )}
                      {column.isRequired && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          Required
                        </Badge>
                      )}
                      {column.maxLength && (
                        <Badge
                          variant="outline"
                          className="border-gray-500/30 text-gray-400"
                        >
                          Max: {column.maxLength}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Relationships Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Link className="w-5 h-5 text-emerald-400" />
              Relationships
              <Badge
                variant="outline"
                className="border-emerald-500/30 text-emerald-400"
              >
                {table.relationships?.length || 0}
              </Badge>
            </h3>

            {table.relationships && table.relationships.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {table.relationships.map((relationship, index) => (
                    <div
                      key={index}
                      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Link className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-medium text-white text-sm">
                          {relationship.relatedTable}
                        </h4>
                      </div>

                      <Badge
                        variant="outline"
                        className={`mb-2 text-xs ${getRelationshipColor(
                          relationship.type
                        )}`}
                      >
                        {relationship.type}
                      </Badge>

                      <div className="text-xs text-gray-400 space-y-1">
                        <div>
                          <span className="font-medium">Via Column:</span>
                          <br />
                          <span className="font-mono text-gray-300">
                            {relationship.viaColumn}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Related Column:</span>
                          <br />
                          <span className="font-mono text-gray-300">
                            {relationship.relatedTable}.
                            {relationship.viaRelated}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="bg-slate-700/30 rounded-lg p-6 text-center border border-slate-600">
                <Link className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  No relationships defined for this table
                </p>
              </div>
            )}

            {/* Table Statistics */}
            <div className="mt-6 bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <h4 className="font-medium text-white mb-3">Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Columns:</span>
                  <span className="text-emerald-400">
                    {table.columns.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Primary Keys:</span>
                  <span className="text-yellow-400">
                    {table.columns.filter((col) => col.isPrimary).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Foreign Keys:</span>
                  <span className="text-blue-400">
                    {table.columns.filter((col) => col.isForeign).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Nullable Columns:</span>
                  <span className="text-gray-400">
                    {table.columns.filter((col) => !col.isRequired).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Row Count:</span>
                  <span className="text-emerald-400">
                    {table.rowCount ? table.rowCount.toLocaleString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Relationships:</span>
                  <span className="text-purple-400">
                    {table.relationships?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
