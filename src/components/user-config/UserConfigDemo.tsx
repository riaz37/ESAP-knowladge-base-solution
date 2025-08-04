"use client";

import React, { useState } from "react";
import { CompanyCreationModal, CompanyFormData } from "@/components/company-hierarchy/CompanyCreationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";

export const UserConfigDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateCompany = async (companyData: CompanyFormData) => {
    // Simulate company creation
    console.log("Creating company with data:", companyData);
    
    // In a real implementation, this would call your company creation API
    // For demo purposes, we'll just log the data and show a success message
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    toast.success(`Company "${companyData.name}" created successfully!`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            User Configuration Integration Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            This demo shows how the user configuration API has been integrated into the company creation modal.
            When creating a company, users can now:
          </p>
          
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Select from existing user configurations</li>
            <li>Create new user configurations with database connection details</li>
            <li>Configure access levels (0-3) for different users</li>
            <li>Set up database connections with host, port, credentials, and schema</li>
            <li>Associate user configurations with company creation</li>
          </ul>

          <div className="pt-4">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Open Company Creation Modal
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Integration Features:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ User Configuration API endpoints integrated</li>
              <li>✅ Create new user configurations</li>
              <li>✅ Select existing user configurations</li>
              <li>✅ Form validation and error handling</li>
              <li>✅ Loading states and user feedback</li>
              <li>✅ Automatic list refresh after creation</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <CompanyCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCompany}
        type="parent"
      />
    </div>
  );
};

export default UserConfigDemo;