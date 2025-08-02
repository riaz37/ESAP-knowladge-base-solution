import React from "react";
import { Building, Building2, Upload, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CompanyNodeProps {
  name: string;
  description: string;
  type: "parent" | "sub";
  onUploadClick?: () => void;
  onAddClick?: () => void;
  showConnectionDots?: boolean;
  width?: string;
}

export function CompanyNode({ 
  name, 
  description, 
  type,
  onUploadClick,
  onAddClick,
  showConnectionDots = true,
  width = type === "parent" ? "w-80" : "w-72"
}: CompanyNodeProps) {
  const isParent = type === "parent";
  const IconComponent = isParent ? Building : Building2;
  const iconSize = isParent ? "w-8 h-8" : "w-7 h-7";
  const circleSize = isParent ? "w-16 h-16" : "w-14 h-14";
  const badgeText = isParent ? "Parent Company" : "Sub Company";
  const titleSize = isParent ? "text-lg" : "text-base";

  return (
    <div className="relative">
      <Card className={`${width} border-green-400/30 bg-gray-900/60 backdrop-blur-sm hover:bg-gray-900/80 transition-all duration-300`}>
        <CardHeader className="pb-3">
          <div className="flex items-start space-x-4">
            {/* Icon Circle */}
            <div className="relative">
              <div className={`${circleSize} rounded-full border border-green-400/50 bg-gray-800/80 flex items-center justify-center`}>
                <IconComponent className={`${iconSize} text-green-400`} />
              </div>

              {/* Connection Dots */}
              {showConnectionDots && (
                <>
                  <div className="absolute -top-8 left-1/2 w-2 h-2 bg-green-400 rounded-full -translate-x-1/2" />
                  {isParent && (
                    <div className="absolute -bottom-8 left-1/2 w-2 h-2 bg-green-400 rounded-full -translate-x-1/2" />
                  )}
                  {!isParent && (
                    <div className="absolute -top-6 left-1/2 w-2 h-2 bg-green-400 rounded-full -translate-x-1/2" />
                  )}
                </>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <CardTitle className={`text-white ${titleSize} mb-2`}>
                {name}
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className={`bg-green-400/20 text-green-400 border-green-400/30 ${!isParent ? 'text-xs' : ''}`}
            >
              {badgeText}
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadClick}
              className={`border-green-400/30 text-green-400 hover:bg-green-400/10 ${!isParent ? 'h-7 px-2' : ''}`}
            >
              <Upload className={`${!isParent ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
              <span className={!isParent ? 'text-xs' : ''}>Upload</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Button */}
      <Button
        size="sm"
        onClick={onAddClick}
        className={`absolute ${isParent ? '-bottom-4 left-1/2 w-6 h-6 -translate-x-1/2' : '-bottom-3 right-4 w-5 h-5'} p-0 bg-green-400 hover:bg-green-300 text-gray-900 rounded-full`}
      >
        <Plus className={isParent ? 'w-3 h-3' : 'w-2.5 h-2.5'} />
      </Button>
    </div>
  );
}