"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { WorkflowStep } from "../CompanyCreationModal";

interface CompanyInfoStepProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  contactEmail: string;
  setContactEmail: (value: string) => void;
  setCurrentStep: (step: WorkflowStep) => void;
}

export function CompanyInfoStep({
  companyName,
  setCompanyName,
  description,
  setDescription,
  address,
  setAddress,
  contactEmail,
  setContactEmail,
  setCurrentStep,
}: CompanyInfoStepProps) {
  const handleNext = () => {
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    setCurrentStep("database-config");
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-green-400">Company Information</h3>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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

        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-300">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the company"
            className="bg-gray-800/50 border-green-400/30 text-white placeholder:text-gray-500 min-h-[60px] resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Next: Configure Database
        </Button>
      </div>
    </div>
  );
}