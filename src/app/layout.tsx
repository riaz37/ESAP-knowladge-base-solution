"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeStoreProvider } from "@/components/ThemeStoreProvider";
import { EnhancedBackground } from "@/components/ui/enhanced-background";
import { ThemeTransitionProvider } from "@/components/ThemeTransitionProvider";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { useState, useRef } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Example state management (replace with Zustand if needed)
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserTooltip, setShowUserTooltip] = useState(false);
  const [userId, setUserId] = useState("default");
  const [editingUserId, setEditingUserId] = useState(false);
  const userTooltipRef = useRef<HTMLDivElement | null>(null);
  const handleReloadDb = () => {};
  const handleSaveUserId = (val: string) => {
    setUserId(val || "default");
    setEditingUserId(false);
    setShowUserTooltip(false);
  };
  // ...other state as needed...
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen no-transition`}
        suppressHydrationWarning
      >
        <ThemeStoreProvider>
          <ThemeTransitionProvider>
            <EnhancedBackground intensity="low">
              <div className="flex min-h-screen w-full">
                <div className="m-5">
                  <Sidebar />
                </div>
                <div className="flex-1 flex flex-col min-h-screen mt-10">
                  <Navbar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    handleReloadDb={handleReloadDb}
                    showUserTooltip={showUserTooltip}
                    setShowUserTooltip={setShowUserTooltip}
                    userTooltipRef={userTooltipRef}
                    userId={userId}
                    setEditingUserId={setEditingUserId}
                    handleSaveUserId={handleSaveUserId}
                    query={""}
                    setQuery={() => {}}
                    selected={"dashboard"}
                    handleQuerySubmit={() => {}}
                    loading={false}
                    quickActions={[]}
                    editingUserId={editingUserId}
                  />
                  <div className="flex-1">{children}</div>
                </div>
              </div>
            </EnhancedBackground>
          </ThemeTransitionProvider>
          <Toaster />
        </ThemeStoreProvider>
      </body>
    </html>
  );
}
