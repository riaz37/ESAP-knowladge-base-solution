"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeStoreProvider } from "@/components/ThemeStoreProvider";
import { ThemeTransitionProvider } from "@/components/ThemeTransitionProvider";
import { UserContextProvider } from "@/components/providers";
import Navbar from "@/components/Navbar";
import Menu from "@/components/Menu";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ui/error-boundary";
import { useUIStore } from "@/store/uiStore";
import SimplifiedAIInterface from "@/components/ai-assistant/SimplifiedAIInterface";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showSidebar, setShowSidebar, showAIAssistant, setShowAIAssistant } = useUIStore();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen no-transition`}
        suppressHydrationWarning
      >
        <ThemeStoreProvider>
          <ThemeTransitionProvider>
            <UserContextProvider>
              <Navbar />

              {/* Menu Overlay */}
              {showSidebar && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                    onClick={() => setShowSidebar(false)}
                  />

                  {/* Menu */}
                  <Menu />
                </>
              )}

              {/* AI Interface Dropdown */}
              <SimplifiedAIInterface
                isOpen={showAIAssistant}
                onClose={() => setShowAIAssistant(false)}
              />

              <div className="min-h-screen w-full">
                <div className="flex-1 -mt-22 pt-22">
                  <ErrorBoundary>{children}</ErrorBoundary>
                </div>
              </div>
            </UserContextProvider>
          </ThemeTransitionProvider>
          <Toaster />
        </ThemeStoreProvider>
      </body>
    </html>
  );
}
