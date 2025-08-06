"use client";

import React, { useState } from "react";
import { Search, Database, Table, Key, Link, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TableData {
  id: string;
  name: string;
  columns: Array<{
    name: string;
    type: string;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    isNullable?: boolean;
  }>;
  relationships?: Array<{
    targetTable: string;
    type: "one-to-one" | "one-to-many" | "many-to-many";
    foreignKey: string;
  }>;
}

interface TablesSidebarProps {
  tables: TableData[];
  onTableSelect: (table: TableData) => void;
  currentDB: any;
}

export function TablesSidebar({ tables, onTableSelect, currentDB }: TablesSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "with-relations" | "no-relations">("all");

  const filteredTables = tables.filter((table) => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.columns.some(col => col.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      filterType === "all" ||
      (filterType === "with-relations" && table.relationships && table.relationships.length > 0) ||
      (filterType === "no-relations" && (!table.relationships || table.relationships.length === 0));

    return matchesSearch && matchesFilter;
  });

  const getTableStats = (table: TableData) => {
    const primaryKeys = table.columns.filter(col => col.isPrimaryKey).length;
    const foreignKeys = table.columns.filter(col => col.isForeignKey).length;
    const relationships = table.relationships?.length || 0;

    return { primaryKeys, foreignKeys, relationships };
  };

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-lg font-semibold text-white">Database Tables</h2>
            <p className="text-sm text-gray-400">{currentDB?.db_name || 'No database selected'}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search tables or columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-1">
          <Button
            onClick={() => setFilterType("all")}
            size="sm"
            variant={filterType === "all" ? "default" : "outline"}
            className={`text-xs ${
              filterType === "all" 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : "border-slate-600 text-slate-300 hover:bg-slate-700"
            }`}
          >
            All
          </Button>
          <Button
            onClick={() => setFilterType("with-relations")}
            size="sm"
            variant={filterType === "with-relations" ? "default" : "outline"}
            className={`text-xs ${
              filterType === "with-relations" 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : "border-slate-600 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Link className="w-3 h-3 mr-1" />
            Related
          </Button>
          <Button
            onClick={() => setFilterType("no-relations")}
            size="sm"
            variant={filterType === "no-relations" ? "default" : "outline"}
            className={`text-xs ${
              filterType === "no-relations" 
                ? "bg-emerald-600 hover:bg-emerald-700" 
                : "border-slate-600 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Isolated
          </Button>
        </div>
      </div>

      {/* Tables List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredTables.length === 0 ? (
            <div className="text-center py-8">
              <Table className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                {searchTerm ? "No tables match your search" : "No tables found"}
              </p>
            </div>
          ) : (
            filteredTables.map((table) => {
              const stats = getTableStats(table);
              
              return (
                <div
                  key={table.id}
                  onClick={() => onTableSelect(table)}
                  className="bg-slate-700 hover:bg-slate-600 rounded-lg p-3 cursor-pointer transition-colors border border-slate-600 hover:border-emerald-500/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-medium text-white text-sm truncate">
                        {table.name}
                      </h3>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 mb-2">
                    {table.columns.length} column{table.columns.length !== 1 ? 's' : ''}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs">
                    {stats.primaryKeys > 0 && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Key className="w-3 h-3" />
                        <span>{stats.primaryKeys}</span>
                      </div>
                    )}
                    {stats.foreignKeys > 0 && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <Link className="w-3 h-3" />
                        <span>{stats.foreignKeys}</span>
                      </div>
                    )}
                    {stats.relationships > 0 && (
                      <div className="flex items-center gap-1 text-purple-400">
                        <Filter className="w-3 h-3" />
                        <span>{stats.relationships}</span>
                      </div>
                    )}
                  </div>

                  {/* Preview of first few columns */}
                  <div className="mt-2 space-y-1">
                    {table.columns.slice(0, 3).map((column, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          {column.isPrimaryKey && <Key className="w-2 h-2 text-yellow-400" />}
                          {column.isForeignKey && <Link className="w-2 h-2 text-blue-400" />}
                          <span className="text-gray-300 truncate">{column.name}</span>
                        </div>
                        <span className="text-gray-500 font-mono">{column.type}</span>
                      </div>
                    ))}
                    {table.columns.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{table.columns.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>Total Tables:</span>
            <span className="text-emerald-400">{tables.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Filtered:</span>
            <span className="text-emerald-400">{filteredTables.length}</span>
          </div>
          <div className="flex justify-between">
            <span>With Relations:</span>
            <span className="text-emerald-400">
              {tables.filter(t => t.relationships && t.relationships.length > 0).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}