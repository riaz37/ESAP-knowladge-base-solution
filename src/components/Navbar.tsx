"use client";
import React, { useState, useEffect } from "react";
import { FadeInSection } from "./ui/opening-animation";
import SearchIcon from "@/icons/sidebar/searchIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import ReloadIcon from "@/icons/sidebar/reloadIcon";
import UserIcon from "@/icons/sidebar/userIcon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  handleReloadDb: () => void;
  showUserTooltip: boolean;
  setShowUserTooltip: (showUserTooltip: boolean) => void;
  userTooltipRef: React.RefObject<HTMLDivElement | null>;
  userId: string;
  setEditingUserId: (editingUserId: boolean) => void;
  handleSaveUserId: (val: string) => void;
  query: string;
  setQuery: (query: string) => void;
  selected: string;
  handleQuerySubmit: () => void;
  loading: boolean;
  quickActions: any[];
  editingUserId: boolean;
}

export default function Navbar({
  searchTerm,
  setSearchTerm,
  handleReloadDb,
  showUserTooltip,
  setShowUserTooltip,
  userTooltipRef,
  userId,
  setEditingUserId,
  handleSaveUserId,
  editingUserId,
}: NavbarProps) {
  const [userIdInput, setUserIdInput] = useState(userId === "default" ? "" : userId);

  useEffect(() => {
    setUserIdInput(userId === "default" ? "" : userId);
  }, [userId]);

  const handleSave = () => {
    handleSaveUserId(userIdInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <FadeInSection delay={0.2}>
      <div className="flex items-center justify-between w-full mb-7">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100"></h1>
        <div className="flex items-center gap-3 w-1/2">
          {/* Search Box */}
          <div className="relative flex-1 group">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 w-full bg-background/50  border-2 border-border/50 dark:border-border/30 focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          {/* Reload Button */}
          <Button
            onClick={handleReloadDb}
            variant="outline"
            className="h-12 px-4 gap-2 bg-background/50 backdrop-blur-sm border-2 border-border/50 dark:border-border/30 hover:bg-accent/50"
          >
            <ReloadIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Reload DB</span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle variant="icon" className="h-12 w-12 p-0" />

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 p-0 rounded-full bg-background/50 backdrop-blur-sm border-2 border-border/50 dark:border-border/30"
              onClick={(e) => {
                e.stopPropagation();
                setShowUserTooltip(!showUserTooltip);
              }}
              aria-label="User settings"
            >
              <UserIcon className="h-6 w-6" />
            </Button>

            {/* User ID Tooltip */}
            {showUserTooltip && (
              <Card
                ref={userTooltipRef}
                className="absolute right-0 mt-2 w-72 p-4 bg-background/80 backdrop-blur-lg border-2 border-border/50 dark:border-border/30 shadow-lg z-50"
              >
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      User ID Settings
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {userId === "default"
                        ? "Set your user ID to save query history"
                        : `Current User ID: ${userId}`}
                    </p>
                  </div>

                  {editingUserId ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="userId" className="text-xs text-muted-foreground">
                          User ID
                        </Label>
                        <Input
                          id="userId"
                          type="text"
                          placeholder="Enter user ID"
                          value={userIdInput}
                          onChange={(e) => setUserIdInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="h-9"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUserId(false);
                            setShowUserTooltip(false);
                          }}
                          className="h-8 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="h-8 text-xs bg-primary/90 hover:bg-primary"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setEditingUserId(true)}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 h-8 text-xs bg-primary/5 hover:bg-primary/10 text-foreground gap-2"
                    >
                      <span>✏️</span>
                      {userId === "default" ? "Set User ID" : "Change User ID"}
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
