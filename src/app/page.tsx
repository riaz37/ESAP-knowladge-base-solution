"use client";
import { Dashboard } from "@/components/dashboard";
import { OpeningAnimation } from "@/components/ui/opening-animation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collectionData } from "./dummy-data/information";

// Import custom hooks
import { useDatabaseOperations, useUserSettings } from "@/lib/hooks";

export default function DashboardPage() {
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(false);
  const router = useRouter();

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

  // Remove Sidebar, Navbar, and SPA-style conditional rendering
  // Only render the Dashboard component and related UI
  return (
    <>
      {showOpeningAnimation ? (
        <OpeningAnimation duration={4000} onComplete={handleOpeningComplete}>
          <div />
        </OpeningAnimation>
      ) : (
        <main className="flex-1 flex flex-col p-5 gap-6 animate-[fadeIn_0.5s_ease-out_forwards] ml-3">
          <Dashboard
            data={collectionData["dashboard"]}
            onNavigate={(key) => {
              if (key === "db") router.push("/db-knowledge");
              else if (key === "File system") router.push("/file-system");
              else if (key === "HR Knowledge") router.push("/hr-knowledge");
              else if (key === "Support Team") router.push("/support-team");
              else router.push("/");
            }}
          />
        </main>
      )}
    </>
  );
}
