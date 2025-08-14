"use client";

import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Edit3, RefreshCw, Loader2 } from "lucide-react";

interface UserConfigurationProps {
  onRefresh: (userId: string) => void;
  businessRulesLoading: boolean;
  userId: string;
  setUserId: (userId: string) => void;
}

export function UserConfiguration({
  onRefresh,
  businessRulesLoading,
  userId,
  setUserId,
}: UserConfigurationProps) {
  const [editingUserId, setEditingUserId] = useState(false);
  const [showUserTooltip, setShowUserTooltip] = useState(false);
  const userTooltipRef = useRef<HTMLDivElement>(null);

  const handleUserIdClick = () => {
    setShowUserTooltip(!showUserTooltip);
  };

  const handleSaveUserId = (newUserId: string) => {
    setUserId(newUserId);
    setShowUserTooltip(false);
    setEditingUserId(false);
    onRefresh(newUserId);
  };

  const toggleEditUserId = () => {
    setEditingUserId(!editingUserId);
  };

  const closeTooltip = () => {
    setShowUserTooltip(false);
    setEditingUserId(false);
  };

  return (
    <Card className="bg-gray-900/50 border-green-400/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-400">
          <User className="w-5 h-5" />
          User Configuration
        </CardTitle>
        <CardDescription className="text-gray-400">
          Current user for business rules management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative" ref={userTooltipRef}>
              <Button
                onClick={handleUserIdClick}
                variant="outline"
                className="border-green-400/30 text-green-400 hover:bg-green-400/10 flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                {userId}
                <Edit3 className="w-3 h-3" />
              </Button>

              {showUserTooltip && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-gray-800 border border-green-400/30 rounded-lg shadow-lg z-50 min-w-[200px]">
                  {editingUserId ? (
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-400">
                        Enter User ID
                      </Label>
                      <Input
                        defaultValue={userId}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveUserId(e.currentTarget.value);
                          } else if (e.key === "Escape") {
                            closeTooltip();
                          }
                        }}
                        className="bg-gray-700 border-green-400/30 text-white text-sm"
                        placeholder="Enter user ID"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            const input = e.currentTarget.parentElement
                              ?.previousElementSibling as HTMLInputElement;
                            handleSaveUserId(input?.value || "");
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={closeTooltip}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-300">
                        Current User:{" "}
                        <span className="text-green-400 font-medium">
                          {userId}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={toggleEditUserId}
                        variant="outline"
                        className="border-green-400/30 text-green-400 hover:bg-green-400/10 text-xs w-full"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Change User
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-sm text-gray-400">
              Managing business rules for:{" "}
              <span className="text-green-400 font-medium">{userId}</span>
            </div>
          </div>

          <Button
            onClick={() => onRefresh(userId)}
            disabled={businessRulesLoading}
            variant="outline"
            size="sm"
            className="border-green-400/30 text-green-400 hover:bg-green-400/10"
          >
            {businessRulesLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
