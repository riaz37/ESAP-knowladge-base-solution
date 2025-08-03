'use client';

import { Building2, Upload, Plus } from "lucide-react";
import { Company } from "./CompanyHierarchy";

interface CompanyCardProps {
  company: Company;
  onAddSubCompany: (name: string, description: string, contactDatabase: string, parentId?: string) => void;
  isSelected: boolean;
  onSelect: () => void;
  level: number;
}

export function CompanyCard({
  company,
  onAddSubCompany,
  isSelected,
  onSelect,
  level
}: CompanyCardProps) {
  return (
    <div
      className="cursor-pointer group"
      onClick={onSelect}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
        isSelected 
          ? 'bg-green-400/20 shadow-[0_0_30px_rgba(34,197,94,0.3)]' 
          : 'group-hover:bg-green-400/10 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]'
      }`} />
      
      {/* Main card */}
      <div className={`relative bg-gray-800/90 backdrop-blur-sm border rounded-2xl p-6 w-64 transition-all duration-300 ${
        isSelected 
          ? 'border-green-400 shadow-lg' 
          : 'border-green-500/30 group-hover:border-green-400/60'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isSelected ? 'bg-green-400/20' : 'bg-green-500/20'
          }`}>
            <Building2 className={`w-5 h-5 ${
              isSelected ? 'text-green-400' : 'text-green-500'
            }`} />
          </div>
          
          {/* Add button for children */}
          <button 
            className="w-6 h-6 rounded-full border border-green-500/40 flex items-center justify-center hover:border-green-400 hover:bg-green-400/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // For demo purposes, add a sample sub-company
              onAddSubCompany(`Sub-${company.name}`, 'New sub-company', 'sub_db', company.id);
            }}
          >
            <Plus className="w-3 h-3 text-green-400" />
          </button>
        </div>

        {/* Company name */}
        <h3 className="text-white font-semibold text-lg mb-2">
          {company.name}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {company.description}
        </p>

        {/* Upload button */}
        <button className="flex items-center gap-2 text-green-400 text-sm hover:text-green-300 transition-colors">
          <Upload className="w-4 h-4" />
          Upload
        </button>

        {/* Connection points */}
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 rounded-full border-2 border-green-500 bg-gray-800 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
        
        {level > 0 && (
          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-green-500 bg-gray-800 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}