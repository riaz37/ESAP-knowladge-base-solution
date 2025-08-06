"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

import { TableNode } from "./TableNode";
import { TablesSidebar } from "./TablesSidebar";
import { TableDetailsModal } from "./TableDetailsModal";
import { useMSSQLTableOperations } from "@/lib/hooks/use-mssql-table-operations";
import { useUserCurrentDB } from "@/lib/hooks/use-user-current-db";
import { Button } from "@/components/ui/button";
import { RefreshCw, Layout, ZoomIn, ZoomOut } from "lucide-react";

// Custom node types
const nodeTypes = {
  tableNode: TableNode,
};

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

export function TablesManager() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { currentDB, isLoading: isLoadingDB, getCurrentDB } = useUserCurrentDB();
  const { generateTableInfo, isGeneratingTableInfo } = useMSSQLTableOperations();

  // Load current database on component mount
  React.useEffect(() => {
    // For demo purposes, we'll use a sample user ID
    // In a real app, this would come from authentication context
    getCurrentDB("nilab");
  }, [getCurrentDB]);

  // Sample data for demonstration
  const sampleTableData: TableData[] = [
    {
      id: "users",
      name: "users",
      columns: [
        { name: "id", type: "int", isPrimaryKey: true, isNullable: false },
        { name: "username", type: "varchar(50)", isNullable: false },
        { name: "email", type: "varchar(100)", isNullable: false },
        { name: "password_hash", type: "varchar(255)", isNullable: false },
        { name: "created_at", type: "datetime", isNullable: false },
        { name: "updated_at", type: "datetime", isNullable: true },
        { name: "is_active", type: "boolean", isNullable: false },
      ],
      relationships: [
        { targetTable: "orders", type: "one-to-many", foreignKey: "user_id" },
        { targetTable: "user_profiles", type: "one-to-one", foreignKey: "user_id" },
      ],
    },
    {
      id: "orders",
      name: "orders",
      columns: [
        { name: "id", type: "int", isPrimaryKey: true, isNullable: false },
        { name: "user_id", type: "int", isForeignKey: true, isNullable: false },
        { name: "order_number", type: "varchar(20)", isNullable: false },
        { name: "total_amount", type: "decimal(10,2)", isNullable: false },
        { name: "status", type: "varchar(20)", isNullable: false },
        { name: "created_at", type: "datetime", isNullable: false },
        { name: "shipped_at", type: "datetime", isNullable: true },
      ],
      relationships: [
        { targetTable: "users", type: "many-to-one", foreignKey: "user_id" },
        { targetTable: "order_items", type: "one-to-many", foreignKey: "order_id" },
      ],
    },
    {
      id: "products",
      name: "products",
      columns: [
        { name: "id", type: "int", isPrimaryKey: true, isNullable: false },
        { name: "name", type: "varchar(100)", isNullable: false },
        { name: "description", type: "text", isNullable: true },
        { name: "price", type: "decimal(10,2)", isNullable: false },
        { name: "stock_quantity", type: "int", isNullable: false },
        { name: "category_id", type: "int", isForeignKey: true, isNullable: false },
        { name: "created_at", type: "datetime", isNullable: false },
      ],
      relationships: [
        { targetTable: "categories", type: "many-to-one", foreignKey: "category_id" },
        { targetTable: "order_items", type: "one-to-many", foreignKey: "product_id" },
      ],
    },
    {
      id: "order_items",
      name: "order_items",
      columns: [
        { name: "id", type: "int", isPrimaryKey: true, isNullable: false },
        { name: "order_id", type: "int", isForeignKey: true, isNullable: false },
        { name: "product_id", type: "int", isForeignKey: true, isNullable: false },
        { name: "quantity", type: "int", isNullable: false },
        { name: "unit_price", type: "decimal(10,2)", isNullable: false },
        { name: "total_price", type: "decimal(10,2)", isNullable: false },
      ],
      relationships: [
        { targetTable: "orders", type: "many-to-one", foreignKey: "order_id" },
        { targetTable: "products", type: "many-to-one", foreignKey: "product_id" },
      ],
    },
    {
      id: "categories",
      name: "categories",
      columns: [
        { name: "id", type: "int", isPrimaryKey: true, isNullable: false },
        { name: "name", type: "varchar(50)", isNullable: false },
        { name: "description", type: "text", isNullable: true },
        { name: "parent_id", type: "int", isForeignKey: true, isNullable: true },
      ],
      relationships: [
        { targetTable: "products", type: "one-to-many", foreignKey: "category_id" },
        { targetTable: "categories", type: "one-to-many", foreignKey: "parent_id" },
      ],
    },
    {
      id: "user_profiles",
      name: "user_profiles",
      columns: [
        { name: "id", type: "int", isPrimaryKey: true, isNullable: false },
        { name: "user_id", type: "int", isForeignKey: true, isNullable: false },
        { name: "first_name", type: "varchar(50)", isNullable: true },
        { name: "last_name", type: "varchar(50)", isNullable: true },
        { name: "phone", type: "varchar(20)", isNullable: true },
        { name: "address", type: "text", isNullable: true },
        { name: "date_of_birth", type: "date", isNullable: true },
      ],
      relationships: [
        { targetTable: "users", type: "one-to-one", foreignKey: "user_id" },
      ],
    },
  ];

  // Convert database schema to table data
  const tableData = useMemo(() => {
    // If we have real database schema, use it
    if (currentDB?.db_schema) {
      const tables: TableData[] = [];
      const schema = currentDB.db_schema;
      
      // Extract tables from schema
      Object.entries(schema).forEach(([tableName, tableInfo]: [string, any]) => {
        if (tableInfo && typeof tableInfo === 'object') {
          const columns = [];
          
          // Extract columns information
          if (tableInfo.columns) {
            Object.entries(tableInfo.columns).forEach(([colName, colInfo]: [string, any]) => {
              columns.push({
                name: colName,
                type: colInfo.type || 'unknown',
                isPrimaryKey: colInfo.isPrimaryKey || false,
                isForeignKey: colInfo.isForeignKey || false,
                isNullable: colInfo.isNullable !== false,
              });
            });
          }

          tables.push({
            id: tableName,
            name: tableName,
            columns,
            relationships: tableInfo.relationships || [],
          });
        }
      });

      return tables;
    }
    
    // Otherwise, use sample data for demonstration
    return sampleTableData;
  }, [currentDB]);

  // Generate nodes from table data
  const generateNodes = useCallback((tables: TableData[]) => {
    const nodeSpacing = 300;
    const nodesPerRow = Math.ceil(Math.sqrt(tables.length));
    
    return tables.map((table, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      
      return {
        id: table.id,
        type: 'tableNode',
        position: {
          x: col * nodeSpacing,
          y: row * nodeSpacing,
        },
        data: {
          table,
          onTableClick: (tableData: TableData) => {
            setSelectedTable(tableData);
            setIsModalOpen(true);
          },
        },
      };
    });
  }, []);

  // Generate edges from relationships
  const generateEdges = useCallback((tables: TableData[]) => {
    const edges: Edge[] = [];
    
    tables.forEach((table) => {
      table.relationships?.forEach((rel, index) => {
        const targetExists = tables.some(t => t.name === rel.targetTable);
        if (targetExists) {
          edges.push({
            id: `${table.id}-${rel.targetTable}-${index}`,
            source: table.id,
            target: rel.targetTable,
            type: 'smoothstep',
            animated: true,
            label: rel.type,
            style: {
              stroke: '#10b981',
              strokeWidth: 2,
            },
            labelStyle: {
              fill: '#10b981',
              fontWeight: 600,
            },
          });
        }
      });
    });
    
    return edges;
  }, []);

  // Update nodes and edges when table data changes
  React.useEffect(() => {
    if (tableData.length > 0) {
      const newNodes = generateNodes(tableData);
      const newEdges = generateEdges(tableData);
      
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [tableData, generateNodes, generateEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleRefreshTables = async () => {
    if (!currentDB) return;
    
    setIsLoading(true);
    try {
      await generateTableInfo(currentDB.db_id, currentDB.user_id);
      // The data will be refreshed through the useUserCurrentDB hook
    } catch (error) {
      console.error("Failed to refresh tables:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoLayout = () => {
    // Simple auto-layout algorithm
    const newNodes = nodes.map((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      const radius = Math.max(200, nodes.length * 30);
      
      return {
        ...node,
        position: {
          x: Math.cos(angle) * radius + 400,
          y: Math.sin(angle) * radius + 300,
        },
      };
    });
    
    setNodes(newNodes);
  };

  if (isLoadingDB) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading database schema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <TablesSidebar
        tables={tableData}
        onTableSelect={(table) => {
          setSelectedTable(table);
          setIsModalOpen(true);
        }}
        currentDB={currentDB}
      />

      {/* Main Flow Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          className="bg-slate-900"
        >
          <Background color="#1e293b" gap={20} />
          <Controls className="bg-slate-800 border-slate-700" />
          
          {/* Top Panel with Controls */}
          <Panel position="top-right" className="flex gap-2">
            <Button
              onClick={handleRefreshTables}
              disabled={isLoading || isGeneratingTableInfo}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${(isLoading || isGeneratingTableInfo) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              onClick={handleAutoLayout}
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <Layout className="w-4 h-4 mr-2" />
              Auto Layout
            </Button>
          </Panel>

          {/* Info Panel */}
          <Panel position="top-left">
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
              <h3 className="text-emerald-400 font-semibold mb-2">Database Schema</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Database: <span className="text-emerald-400">{currentDB?.db_name || 'Not selected'}</span></p>
                <p>Tables: <span className="text-emerald-400">{tableData.length}</span></p>
                <p>Relationships: <span className="text-emerald-400">{edges.length}</span></p>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Table Details Modal */}
      {selectedTable && (
        <TableDetailsModal
          table={selectedTable}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTable(null);
          }}
        />
      )}
    </div>
  );
}