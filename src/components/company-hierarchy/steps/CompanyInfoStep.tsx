"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import  {CompanyInfoStepProps} from "../types"

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
    <div className="space-y-8 p-1">
      <div>
        <h3 className="text-xl font-semibold text-green-400 mb-1">
          Company Information
        </h3>
        <p className="text-sm text-gray-400">
          Enter your company details to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label
            htmlFor="companyName"
            className="text-sm font-medium text-gray-300"
          >
            Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Inc."
            className="h-11 bg-gray-800/70 border-gray-600/50 hover:border-green-400/50 focus:border-green-400 text-white placeholder:text-gray-500 transition-colors focus-visible:ring-2 focus-visible:ring-green-400/30"
            required
          />
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <Label
            htmlFor="contactEmail"
            className="text-sm font-medium text-gray-300"
          >
            Contact Email
          </Label>
          <Input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="contact@company.com"
            className="h-11 bg-gray-800/70 border-gray-600/50 hover:border-green-400/50 focus:border-green-400 text-white placeholder:text-gray-500 transition-colors focus-visible:ring-2 focus-visible:ring-green-400/30"
          />
        </div>

        {/* Address - Full Width */}
        <div className="md:col-span-2 space-y-2">
          <Label
            htmlFor="address"
            className="text-sm font-medium text-gray-300"
          >
            Company Address
          </Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Business St, City, Country"
            className="h-11 bg-gray-800/70 border-gray-600/50 hover:border-green-400/50 focus:border-green-400 text-white placeholder:text-gray-500 transition-colors focus-visible:ring-2 focus-visible:ring-green-400/30"
          />
        </div>

        {/* Description - Full Width */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex justify-between items-center">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-300"
            >
              About the Company
            </Label>
            <span className="text-xs text-gray-500">
              {description.length}/500
            </span>
          </div>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            placeholder="Tell us about your company's mission, values, and what makes it unique..."
            className="min-h-[120px] bg-gray-800/70 border-gray-600/50 hover:border-green-400/50 focus:border-green-400 text-white placeholder:text-gray-500 transition-colors focus-visible:ring-2 focus-visible:ring-green-400/30 resize-none"
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
