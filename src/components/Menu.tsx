"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useUIStore } from "@/store/uiStore";
import { getSidebarRoutes } from "@/lib/utils/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight, X } from "lucide-react";

export default function Menu() {
  const pathname = usePathname();
  const { setShowSidebar } = useUIStore();

  // Get navigation routes
  const menuRoutes = getSidebarRoutes();

  const handleMenuItemClick = () => {
    // Close menu when item is clicked
    setShowSidebar(false);
  };

  return (
    <div className="fixed top-28 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden min-w-[500px]">
        {/* Menu Header */}
        <div className="relative bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Navigation</h2>
              <p className="text-emerald-300/80 text-sm">
                Choose your destination
              </p>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110 group cursor-pointer"
            >
              <X className="w-5 h-5 text-white group-hover:text-emerald-300" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4">
          <div className="space-y-2">
            {menuRoutes.map((route, index) => {
              const isActive = pathname === route.path;
              return (
                <Link
                  href={route.path}
                  key={route.key}
                  onClick={handleMenuItemClick}
                  className="block group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={cn(
                      "flex items-center p-4 rounded-2xl transition-all duration-300 cursor-pointer relative overflow-hidden",
                      "hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg",
                      isActive
                        ? "bg-gradient-to-r from-emerald-500/30 to-teal-500/20 border border-emerald-500/30"
                        : "bg-white/5 border border-white/5 hover:border-white/20"
                    )}
                  >
                    {/* Background glow effect */}
                    <div
                      className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        "bg-gradient-to-r from-emerald-500/10 to-transparent"
                      )}
                    />

                    {/* Icon */}
                    <div className="relative z-10 mr-4">
                      {route.sidebarIcon && (
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all group-hover:scale-110">
                          <route.sidebarIcon
                            fill={isActive ? "#10b981" : "#ffffff"}
                            className="w-6 h-6 transition-all"
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 relative z-10">
                      <h3
                        className={cn(
                          "text-lg font-semibold mb-1 transition-colors",
                          isActive
                            ? "text-emerald-300"
                            : "text-white group-hover:text-emerald-200"
                        )}
                      >
                        {route.name}
                      </h3>
                      <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                        {getRouteDescription(route.key)}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="relative z-10 ml-4">
                      <ChevronRight
                        className={cn(
                          "w-5 h-5 transition-all duration-300 group-hover:translate-x-1",
                          isActive
                            ? "text-emerald-300"
                            : "text-gray-400 group-hover:text-white"
                        )}
                      />
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-r-full" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>


      </div>
    </div>
  );
}

// Helper function to get route descriptions
function getRouteDescription(routeKey: string): string {
  const descriptions: Record<string, string> = {
    dashboard: "Access your main dashboard and overview",
    "db-knowledge": "Query and explore database information",
    "hr-knowledge": "Human resources and team information",
    "file-system": "Manage and organize your files",
    "support-team": "Get help and contact support",
  };

  return descriptions[routeKey] || "Navigate to this section";
}
