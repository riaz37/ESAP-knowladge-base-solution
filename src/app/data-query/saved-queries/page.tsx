"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Search,
  Bookmark,
  Plus,
  Edit,
  Trash2,
  Copy,
  Play,
  Tag,
  Calendar,
  User,
  FileText,
  Database,
  Eye,
  Settings,
} from "lucide-react";
import { EnhancedBackground } from "@/components/ui/enhanced-background";
import { useQueryStore } from "@/store/query-store";
import { toast } from "sonner";

export default function SavedQueriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [editingQuery, setEditingQuery] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const {
    savedQueries,
    loadSavedQueries,
    updateSavedQuery,
    deleteSavedQuery,
  } = useQueryStore();

  // Mock user ID - will be replaced with real user context
  const userId = "user123";

  useEffect(() => {
    loadSavedQueries(userId);
  }, [userId, loadSavedQueries]);

  // Filter saved queries
  const filteredQueries = savedQueries.filter(query => {
    const matchesSearch = query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.query.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || query.type === typeFilter;
    const matchesTag = tagFilter === "all" || query.tags.includes(tagFilter);
    
    return matchesSearch && matchesType && matchesTag;
  });

  // Get unique tags from all saved queries
  const allTags = Array.from(new Set(savedQueries.flatMap(q => q.tags)));

  const handleEditQuery = (query: any) => {
    setEditingQuery(query);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingQuery || !editingQuery.name.trim()) {
      toast.error("Query name is required");
      return;
    }

    try {
      await updateSavedQuery(editingQuery.id, {
        name: editingQuery.name,
        description: editingQuery.description,
        query: editingQuery.query,
        tags: editingQuery.tags,
      });
      
      toast.success("Query updated successfully");
      setIsEditDialogOpen(false);
      setEditingQuery(null);
      
      // Reload saved queries
      loadSavedQueries(userId);
    } catch (error) {
      toast.error("Failed to update query");
    }
  };

  const handleDeleteQuery = async (queryId: string) => {
    if (!confirm("Are you sure you want to delete this saved query?")) return;
    
    try {
      await deleteSavedQuery(queryId);
      toast.success("Query deleted successfully");
      
      // Reload saved queries
      loadSavedQueries(userId);
    } catch (error) {
      toast.error("Failed to delete query");
    }
  };

  const handleCopyQuery = (queryText: string) => {
    navigator.clipboard.writeText(queryText);
    toast.success("Query copied to clipboard");
  };

  const handleExecuteQuery = (query: any) => {
    // TODO: Implement query execution
    // This would redirect to the appropriate query interface
    toast.info(`Redirecting to ${query.type} query interface...`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'database':
        return <Database className="h-4 w-4 text-green-600" />;
      default:
        return <Search className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'file':
        return 'default';
      case 'database':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <EnhancedBackground intensity="medium" className="min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Saved Queries
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage and reuse your saved query templates
          </p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search saved queries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Type Filter */}
              <div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="file">File Queries</SelectItem>
                    <SelectItem value="database">Database Queries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Tag Filter */}
              <div>
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {allTags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saved Queries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQueries.length > 0 ? (
            filteredQueries.map((query) => (
              <Card key={query.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(query.type)}
                      <Badge variant={getTypeBadgeVariant(query.type)}>
                        {query.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditQuery(query)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuery(query.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg">{query.name}</CardTitle>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {query.description}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Query Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Eye className="h-4 w-4" />
                      Query Preview
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm font-mono max-h-20 overflow-hidden">
                      {query.query.length > 100 
                        ? `${query.query.substring(0, 100)}...` 
                        : query.query
                      }
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Tag className="h-4 w-4" />
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {query.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {query.userId}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(query.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleCopyQuery(query.query)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleExecuteQuery(query)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Execute
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Bookmark className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No saved queries found</p>
              <p className="text-sm">
                {searchTerm || typeFilter !== "all" || tagFilter !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "Save your first query to get started"
                }
              </p>
            </div>
          )}
        </div>

        {/* Edit Query Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Saved Query</DialogTitle>
            </DialogHeader>
            
            {editingQuery && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Query Name</label>
                  <Input
                    value={editingQuery.name}
                    onChange={(e) => setEditingQuery({ ...editingQuery, name: e.target.value })}
                    placeholder="Enter query name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editingQuery.description}
                    onChange={(e) => setEditingQuery({ ...editingQuery, description: e.target.value })}
                    placeholder="Describe what this query does"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Query</label>
                  <Textarea
                    value={editingQuery.query}
                    onChange={(e) => setEditingQuery({ ...editingQuery, query: e.target.value })}
                    placeholder="Enter your query"
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input
                    value={editingQuery.tags.join(', ')}
                    onChange={(e) => setEditingQuery({ 
                      ...editingQuery, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    placeholder="e.g., database, users, active"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingQuery(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </EnhancedBackground>
  );
} 