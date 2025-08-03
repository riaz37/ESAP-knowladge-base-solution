'use client';

import { useState, useEffect } from 'react';
import { Building2, Database, Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MSSQLConfigService } from '@/lib/api/services/mssql-config-service';
import { MSSQLConfigData } from '@/types/api';
import { toast } from 'sonner';

interface CompanyCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (companyData: CompanyFormData) => Promise<void>;
  type: 'parent' | 'sub';
  parentCompanyId?: number;
}

export interface CompanyFormData {
  name: string;
  description: string;
  address: string;
  contactEmail: string;
  dbId: number;
  parentCompanyId?: number;
}

export interface DatabaseFormData {
  db_url: string;
  db_name: string;
  business_rule?: string;
}

export function CompanyCreationModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  parentCompanyId,
}: CompanyCreationModalProps) {
  // Form states
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [selectedDbId, setSelectedDbId] = useState<number | null>(null);

  // Database states
  const [databases, setDatabases] = useState<MSSQLConfigData[]>([]);
  const [loadingDatabases, setLoadingDatabases] = useState(false);
  const [creatingDatabase, setCreatingDatabase] = useState(false);
  const [creatingCompany, setCreatingCompany] = useState(false);

  // New database form states
  const [newDbUrl, setNewDbUrl] = useState('');
  const [newDbName, setNewDbName] = useState('');
  const [newDbBusinessRule, setNewDbBusinessRule] = useState('');

  // Tab state
  const [activeTab, setActiveTab] = useState('existing');

  // Load databases when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDatabases();
    }
  }, [isOpen]);

  const loadDatabases = async () => {
    setLoadingDatabases(true);
    try {
      const response = await MSSQLConfigService.getMSSQLConfigs();
      console.log('Database loading response:', response);

      // The service returns response.data, which should be {configs: [...], count: number}
      // But let's handle different possible structures
      let configs = [];

      if (response && response.configs && Array.isArray(response.configs)) {
        // Expected structure: { configs: [...], count: number }
        configs = response.configs;
      } else if (response && Array.isArray(response)) {
        // Direct array
        configs = response;
      } else if (response && response.data) {
        // If there's still a nested data property
        if (Array.isArray(response.data)) {
          configs = response.data;
        } else if (response.data.configs && Array.isArray(response.data.configs)) {
          configs = response.data.configs;
        } else {
          // Check if the response.data has any array property
          const dataKeys = Object.keys(response.data);
          console.log('Available data keys:', dataKeys);

          for (const key of dataKeys) {
            if (Array.isArray(response.data[key])) {
              console.log(`Found array in key: ${key}`);
              configs = response.data[key];
              break;
            }
          }
        }
      }

      if (!Array.isArray(configs)) {
        console.error('No valid configs array found in response:', response);
        throw new Error('No database configurations found in response');
      }

      console.log('Extracted configs:', configs);
      setDatabases(configs);
    } catch (error) {
      console.error('Error loading databases:', error);
      toast.error('Failed to load databases');
      setDatabases([]); // Set empty array as fallback
    } finally {
      setLoadingDatabases(false);
    }
  };

  const handleCreateDatabase = async () => {
    if (!newDbUrl.trim() || !newDbName.trim()) {
      toast.error('Database URL and name are required');
      return;
    }

    setCreatingDatabase(true);
    try {
      console.log('Creating database with data:', {
        db_url: newDbUrl,
        db_name: newDbName,
        business_rule: newDbBusinessRule || undefined,
      });

      const databaseConfig = await MSSQLConfigService.createMSSQLConfig({
        db_url: newDbUrl,
        db_name: newDbName,
        business_rule: newDbBusinessRule || undefined,
      });

      console.log('Database creation response:', databaseConfig);

      // The service returns the database object directly (already extracted from response.data)
      if (!databaseConfig || !databaseConfig.db_id) {
        console.error('Invalid response structure:', databaseConfig);
        throw new Error('Invalid response from server');
      }

      // Add the new database to the list (databaseConfig is the database object)
      setDatabases(prev => [...prev, databaseConfig]);
      setSelectedDbId(databaseConfig.db_id);

      // Clear form and switch to existing tab
      setNewDbUrl('');
      setNewDbName('');
      setNewDbBusinessRule('');
      setActiveTab('existing');

      toast.success('Database created successfully');
    } catch (error) {
      console.error('Error creating database:', error);
      toast.error('Failed to create database');
    } finally {
      setCreatingDatabase(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    if (!selectedDbId) {
      toast.error('Please select or create a database');
      return;
    }

    setCreatingCompany(true);
    try {
      const companyData: CompanyFormData = {
        name: companyName.trim(),
        description: description.trim(),
        address: address.trim(),
        contactEmail: contactEmail.trim(),
        dbId: selectedDbId,
        parentCompanyId,
      };

      await onSubmit(companyData);
      handleClose();
      toast.success(`${type === 'parent' ? 'Parent' : 'Sub'} company created successfully`);
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company');
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleClose = () => {
    // Reset all form states
    setCompanyName('');
    setDescription('');
    setAddress('');
    setContactEmail('');
    setSelectedDbId(null);
    setNewDbUrl('');
    setNewDbName('');
    setNewDbBusinessRule('');
    setActiveTab('existing');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-md border border-green-400/30 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-green-400" />
            </div>
            Create {type === 'parent' ? 'Parent' : 'Sub'} Company
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {type === 'parent' 
              ? 'Create a new parent company and associate it with a database'
              : 'Create a new sub-company under the selected parent company'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-400">Company Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-gray-300">
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-gray-300">
                  Contact Email
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the company"
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-300">
                Address
              </Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Company address"
                className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Database Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-green-400">Database Configuration</h3>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
                <TabsTrigger value="existing" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                  Select Existing
                </TabsTrigger>
                <TabsTrigger value="new" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                  Create New
                </TabsTrigger>
              </TabsList>

              <TabsContent value="existing" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Select Database *</Label>
                  {loadingDatabases ? (
                    <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                      <span className="text-gray-400">Loading databases...</span>
                    </div>
                  ) : (
                    <Select
                      value={selectedDbId?.toString() || ''}
                      onValueChange={(value) => setSelectedDbId(parseInt(value))}
                    >
                      <SelectTrigger className="bg-gray-800/50 border-green-400/30 text-white">
                        <SelectValue placeholder="Choose a database" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-green-400/30">
                        {databases.map((db) => (
                          <SelectItem key={db.db_id} value={db.db_id.toString()}>
                            <div className="flex items-center gap-2">
                              <Database className="w-4 h-4 text-green-400" />
                              <span>{db.db_name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="new" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newDbName" className="text-gray-300">
                      Database Name *
                    </Label>
                    <Input
                      id="newDbName"
                      value={newDbName}
                      onChange={(e) => setNewDbName(e.target.value)}
                      placeholder="MyDatabase"
                      className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newDbUrl" className="text-gray-300">
                      Database URL *
                    </Label>
                    <Input
                      id="newDbUrl"
                      value={newDbUrl}
                      onChange={(e) => setNewDbUrl(e.target.value)}
                      placeholder="mssql+pyodbc://..."
                      className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newDbBusinessRule" className="text-gray-300">
                    Business Rules (Optional)
                  </Label>
                  <Textarea
                    id="newDbBusinessRule"
                    value={newDbBusinessRule}
                    onChange={(e) => setNewDbBusinessRule(e.target.value)}
                    placeholder="Enter business rules for this database"
                    className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500 min-h-[80px]"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleCreateDatabase}
                  disabled={creatingDatabase || !newDbUrl.trim() || !newDbName.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {creatingDatabase ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Database...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Database
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-green-400/20">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-green-400/30 text-green-400 hover:bg-green-400/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creatingCompany || !companyName.trim() || !selectedDbId}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {creatingCompany ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  Create {type === 'parent' ? 'Parent' : 'Sub'} Company
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
