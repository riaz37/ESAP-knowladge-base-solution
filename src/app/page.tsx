"use client";
import { Dashboard } from "@/components/dashboard";
import { OpeningAnimation } from "@/components/ui/opening-animation";
import { EnhancedBackground } from "@/components/ui/enhanced-background";
import { useEffect, useState } from "react";
import { useDatabaseOperations, useUserSettings } from "@/lib/hooks";

export default function DashboardPage() {
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(false);

  const databaseOps = useDatabaseOperations();
  const userSettings = useUserSettings();

  // Initialize component
  useEffect(() => {
    // Fetch query history with default user ID on first load
    databaseOps.fetchQueryHistory(userSettings.userId);

    const hasSeen =
      typeof window !== "undefined" &&
      localStorage.getItem("welcome-animation-shown");
    if (!hasSeen) {
      setShowOpeningAnimation(true);
    }
  }, []);

  // Fetch history when userId changes
  useEffect(() => {
    if (userSettings.userId) {
      databaseOps.fetchQueryHistory(userSettings.userId);
    }
  }, [userSettings.userId]);

  // toggleTheme is already available from the useTheme hook

  const handleOpeningComplete = () => {
    setShowOpeningAnimation(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("welcome-animation-shown", "true");
    }
  };

  return (
    <>
      {showOpeningAnimation ? (
        <OpeningAnimation duration={4000} onComplete={handleOpeningComplete}>
          <div />
        </OpeningAnimation>
      ) : (
        <main className="flex-1 animate-[fadeIn_0.5s_ease-out_forwards]">
          <EnhancedBackground intensity="medium" className="min-h-screen">
            <Dashboard />
          </EnhancedBackground>
        </main>
      )}
    </>
  );
}
