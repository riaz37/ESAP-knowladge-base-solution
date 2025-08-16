"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Database,
  FileText,
  Play,
  Save,
  Copy,
  Plus,
  Trash2,
  Settings,
  Eye,
  Code,
  Palette,
} from "lucide-react";
import { EnhancedBackground } from "@/components/ui/enhanced-background";
import { useQueryStore } from "@/store/query-store";
import { toast } from "sonner";

interface QueryBuilderNode {
  id: string;
  type: 'select' | 'from' | 'where' | 'join' | 'group' | 'order' | 'limit';
  value: string;
  parameters: Record<string, any>;
}

interface VisualQuery {
  id: string;
  name: string;
  description: string;
  nodes: QueryBuilderNode[];
  queryType: 'file' | 'database';
  target: string; // table name or file path
}

export default function QueryBuilderPage() {
  const [currentQuery, setCurrentQuery] = useState<VisualQuery>({
    id: '',
    name: '',
    description: '',
    nodes: [],
    queryType: 'database',
    target: '',
  });
  
  const [queryType, setQueryType] = useState<'file' | 'database'>('database');
  const [target, setTarget] = useState('');
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  
  const {
    saveQuery,
    savedQueries,
    loadSavedQueries,
  } = useQueryStore();

  // Mock user ID - will be replaced with real user context
  const userId = "user123";

  // Mock targets - will be replaced with real API data
  const availableTargets = {
    database: [
      { id: "users", name: "Users Table", description: "User information and profiles" },
      { id: "orders", name: "Orders Table", description: "Customer orders and transactions" },
      { id: "products", name: "Products Table", description: "Product catalog and inventory" },
    ],
    file: [
      { id: "documents", name: "Documents", description: "General document collection" },
      { id: "reports", name: "Reports", description: "Business reports and analytics" },
      { id: "contracts", name: "Contracts", description: "Legal contracts and agreements" },
    ]
  };

  useEffect(() => {
    loadSavedQueries(userId);
  }, [userId, loadSavedQueries]);

  const addNode = (type: QueryBuilderNode['type']) => {
    const newNode: QueryBuilderNode = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      value: '',
      parameters: {},
    };

    setCurrentQuery(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  };

  const updateNode = (nodeId: string, updates: Partial<QueryBuilderNode>) => {
    setCurrentQuery(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }));
  };

  const removeNode = (nodeId: string) => {
    setCurrentQuery(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId)
    }));
  };

  const generateQuery = () => {
    if (queryType === 'database') {
      generateSQLQuery();
    } else {
      generateFileQuery();
    }
  };

  const generateSQLQuery = () => {
    let sql = '';
    
    // SELECT clause
    const selectNode = currentQuery.nodes.find(n => n.type === 'select');
    if (selectNode) {
      sql += `SELECT ${selectNode.value || '*'} `;
    } else {
      sql += 'SELECT * ';
    }
    
    // FROM clause
    const fromNode = currentQuery.nodes.find(n => n.type === 'from');
    if (fromNode) {
      sql += `FROM ${fromNode.value || target} `;
    } else if (target) {
      sql += `FROM ${target} `;
    }
    
    // WHERE clause
    const whereNode = currentQuery.nodes.find(n => n.type === 'where');
    if (whereNode && whereNode.value) {
      sql += `WHERE ${whereNode.value} `;
    }
    
    // JOIN clause
    const joinNode = currentQuery.nodes.find(n => n.type === 'join');
    if (joinNode && joinNode.value) {
      sql += `${joinNode.value} `;
    }
    
    // GROUP BY clause
    const groupNode = currentQuery.nodes.find(n => n.type === 'group');
    if (groupNode && groupNode.value) {
      sql += `GROUP BY ${groupNode.value} `;
    }
    
    // ORDER BY clause
    const orderNode = currentQuery.nodes.find(n => n.type === 'order');
    if (orderNode && orderNode.value) {
      sql += `ORDER BY ${orderNode.value} `;
    }
    
    // LIMIT clause
    const limitNode = currentQuery.nodes.find(n => n.type === 'limit');
    if (limitNode && limitNode.value) {
      sql += `LIMIT ${limitNode.value}`;
    }
    
    setGeneratedQuery(sql.trim());
  };

  const generateFileQuery = () => {
    let query = '';
    
    // Build natural language query based on nodes
    const selectNode = currentQuery.nodes.find(n => n.type === 'select');
    if (selectNode && selectNode.value) {
      query += selectNode.value;
    }
    
    const whereNode = currentQuery.nodes.find(n => n.type === 'where');
    if (whereNode && whereNode.value) {
      query += ` ${whereNode.value}`;
    }
    
    if (!query.trim()) {
      query = 'Extract all relevant information from the document';
    }
    
    setGeneratedQuery(query.trim());
  };

  const saveCurrentQuery = async () => {
    if (!currentQuery.name.trim()) {
      toast.error("Please enter a query name");
      return;
    }

    if (currentQuery.nodes.length === 0) {
      toast.error("Please add at least one query node");
      return;
    }

    try {
      await saveQuery({
        name: currentQuery.name,
        description: currentQuery.description || `Visual query for ${currentQuery.target}`,
        query: generatedQuery || 'Query will be generated when executed',
        type: currentQuery.queryType,
        userId,
        tags: ['visual-builder', currentQuery.queryType],
      });
      
      toast.success("Query saved successfully!");
    } catch (error) {
      toast.error("Failed to save query");
    }
  };

  const loadSavedQuery = (savedQuery: any) => {
    // This would need to be enhanced to properly reconstruct the visual query
    setCurrentQuery({
      id: savedQuery.id,
      name: savedQuery.name,
      description: savedQuery.description,
      nodes: [], // Would need to parse the saved query back to nodes
      queryType: savedQuery.type,
      target: '',
    });
    setGeneratedQuery(savedQuery.query);
  };

  const getNodeIcon = (type: QueryBuilderNode['type']) => {
    switch (type) {
      case 'select': return <Eye className="h-4 w-4" />;
      case 'from': return <Database className="h-4 w-4" />;
      case 'where': return <Search className="h-4 w-4" />;
      case 'join': return <Plus className="h-4 w-4" />;
      case 'group': return <Settings className="h-4 w-4" />;
      case 'order': return <Code className="h-4 w-4" />;
      case 'limit': return <Palette className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getNodePlaceholder = (type: QueryBuilderNode['type']) => {
    switch (type) {
      case 'select': return 'e.g., id, name, email';
      case 'from': return 'e.g., users, orders';
      case 'where': return 'e.g., status = "active"';
      case 'join': return 'e.g., JOIN orders ON users.id = orders.user_id';
      case 'group': return 'e.g., status, created_at';
      case 'order': return 'e.g., created_at DESC';
      case 'limit': return 'e.g., 100';
      default: return 'Enter value...';
    }
  };

  return (
    <EnhancedBackground intensity="medium" className="min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Visual Query Builder
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Build queries visually using an intuitive drag-and-drop interface
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Query Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Query Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Query Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="query-name">Query Name</Label>
                    <Input
                      id="query-name"
                      placeholder="Enter query name"
                      value={currentQuery.name}
                      onChange={(e) => setCurrentQuery(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="query-type">Query Type</Label>
                    <Select value={queryType} onValueChange={(value: 'file' | 'database') => setQueryType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="database">Database Query</SelectItem>
                        <SelectItem value="file">File Query</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="query-description">Description</Label>
                  <Textarea
                    id="query-description"
                    placeholder="Describe what this query does"
                    value={currentQuery.description}
                    onChange={(e) => setCurrentQuery(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="query-target">Target {queryType === 'database' ? 'Table' : 'File'}</Label>
                  <Select value={target} onValueChange={setTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Choose a ${queryType === 'database' ? 'table' : 'file'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTargets[queryType].map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-xs text-gray-500">{item.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Query Builder Nodes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Query Builder</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      {previewMode ? <Code className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {previewMode ? 'Builder View' : 'Preview'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateQuery}
                      disabled={currentQuery.nodes.length === 0}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {previewMode ? (
                  /* Preview Mode - Show generated query */
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Generated Query</Label>
                      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <pre className="text-sm text-gray-800 dark:text-gray-200">
                          {generatedQuery || 'No query generated yet. Add nodes and click Generate.'}
                        </pre>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(generatedQuery)}
                        disabled={!generatedQuery}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Query
                      </Button>
                      <Button
                        onClick={saveCurrentQuery}
                        disabled={!currentQuery.name.trim() || currentQuery.nodes.length === 0}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Query
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Builder Mode - Show visual nodes */
                  <div className="space-y-4">
                    {/* Add Node Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {['select', 'from', 'where', 'join', 'group', 'order', 'limit'].map((type) => (
                        <Button
                          key={type}
                          variant="outline"
                          size="sm"
                          onClick={() => addNode(type as QueryBuilderNode['type'])}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                      ))}
                    </div>
                    
                    {/* Query Nodes */}
                    <div className="space-y-3">
                      {currentQuery.nodes.map((node, index) => (
                        <div key={node.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                            {getNodeIcon(node.type)}
                            {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
                          </div>
                          
                          <Input
                            placeholder={getNodePlaceholder(node.type)}
                            value={node.value}
                            onChange={(e) => updateNode(node.id, { value: e.target.value })}
                            className="flex-1"
                          />
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNode(node.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                      
                      {currentQuery.nodes.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No query nodes added yet</p>
                          <p className="text-sm">Click the buttons above to start building your query</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Saved Queries & Help */}
          <div className="space-y-6">
            {/* Saved Queries */}
            <Card>
              <CardHeader>
                <CardTitle>Saved Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-auto">
                  {savedQueries.length > 0 ? (
                    savedQueries.map((query) => (
                      <div
                        key={query.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => loadSavedQuery(query)}
                      >
                        <div className="font-medium text-sm mb-1">{query.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {query.description}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {query.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(query.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Save className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No saved queries yet</p>
                      <p className="text-xs">Build and save your first query</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Builder Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Builder Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-gray-600 dark:text-gray-400">
                <div>
                  <strong>SELECT:</strong> Choose which fields to retrieve
                </div>
                <div>
                  <strong>FROM:</strong> Specify the data source
                </div>
                <div>
                  <strong>WHERE:</strong> Add filtering conditions
                </div>
                <div>
                  <strong>JOIN:</strong> Combine data from multiple sources
                </div>
                <div>
                  <strong>GROUP BY:</strong> Group results by specific fields
                </div>
                <div>
                  <strong>ORDER BY:</strong> Sort the results
                </div>
                <div>
                  <strong>LIMIT:</strong> Restrict the number of results
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </EnhancedBackground>
  );
} 