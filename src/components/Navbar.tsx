"use client";
import React from "react";
import { FadeInSection } from "./ui/opening-animation";
import SearchIcon from "@/icons/sidebar/searchIcon";
import { SecondaryButton } from "./glass-ui/buttons/SecondaryButton";
import ReloadIcon from "@/icons/sidebar/reloadIcon";
import DarkModeToggleIcon from "@/icons/sidebar/darkModeToggleIcon";
import UserIcon from "@/icons/sidebar/userIcon";
import { useTheme } from "@/contexts/ThemeContext";
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
  query,
  setQuery,
  selected,
  handleQuerySubmit,
  loading,
  quickActions,
  editingUserId,
}: NavbarProps) {
  // Use centralized theme solution
  const { resolvedTheme, toggleTheme } = useTheme();
  return (
    <FadeInSection delay={0.2}>
      <div className="flex items-center flex-row justify-between mb-7 w-full">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100"></h1>
        <div
          style={{
            display: "flex",
            width: "50%",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Search Box */}
          <div className="flex h-12 px-6 items-center flex-1 rounded-full border-2 bg-white/50 dark:bg-[#232435]/20 border-gray-200 dark:border-white/12 text-gray-800 dark:text-white text-base min-w-0 mr-3 gap-3">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-gray-800 dark:text-white text-base flex-1 min-w-0"
            />
          </div>
          {/* Reload Button */}
          <SecondaryButton
            text="Reload DB"
            iconPlacement="left"
            icon={
              (
                <ReloadIcon fill={resolvedTheme === "dark" ? "#fff" : "#222"} />
              ) as unknown as string
            }
            onClick={handleReloadDb}
            width="180px"
            style={{
              minHeight: "40px",
            }}
            mode={resolvedTheme === "dark" ? "dark" : "light"}
          />
          {/* ZenUI-style Theme Toggle */}
          <ThemeToggle
            variant="icon"
            size="md"
            className="hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50"
          />
          {/* User Icon with Tooltip */}
          <div className="relative">
            <button
              className="w-12 h-12 rounded-full bg-white/50 dark:bg-[#232435]/50 flex items-center justify-center overflow-hidden cursor-pointer z-10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowUserTooltip(!showUserTooltip);
              }}
              aria-label="User settings"
            >
              <UserIcon width={36} height={36} />
            </button>

            {/* User ID Tooltip */}
            {showUserTooltip && (
              <div
                style={{
                  zIndex: 1000,
                }}
                ref={userTooltipRef}
                className="absolute top-15 right-0 w-70 backdrop-blur-12 border-2 border-green-200/27 dark:border-green-200/27 bg-gradient-to-b from-green-200/25 via-green-200/9 to-green-200/2 dark:from-green-200/25 dark:via-green-200/9 dark:to-green-200/2 rounded-2xl p-4 shadow-2xl z-40"
              >
                <div className="mb-3">
                  <h3 className="m-0 mb-2 text-sm font-semibold text-gray-800 dark:text-white">
                    User ID Settings
                  </h3>
                  <p className="m-0 text-xs text-gray-600 dark:text-gray-300">
                    {userId === "default"
                      ? "Set your user ID to save query history"
                      : `Current User ID: ${userId}`}
                  </p>
                </div>

                {editingUserId ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Enter user ID"
                      defaultValue={userId === "default" ? "" : userId}
                      autoFocus
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        color: "#FFFFFF",
                        fontSize: "14px",
                        outline: "none",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSaveUserId(
                            (e.target as HTMLInputElement).value
                          );
                        }
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={() => {
                          setEditingUserId(false);
                          setShowUserTooltip(false);
                        }}
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          color: "#FFFFFF",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const input = document.querySelector(
                            'input[placeholder="Enter user ID"]'
                          ) as HTMLInputElement;
                          handleSaveUserId(input?.value || "");
                        }}
                        style={{
                          background: "#5BE49B",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          color: "#000000",
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingUserId(true)}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      color: "#FFFFFF",
                      fontSize: "14px",
                      cursor: "pointer",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <span>✏️</span>
                    {userId === "default" ? "Set User ID" : "Change User ID"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </FadeInSection>
  );
}
