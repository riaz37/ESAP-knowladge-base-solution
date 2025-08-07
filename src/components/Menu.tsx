"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Upload,
  User,
  Settings,
  History,
  Terminal,
  Square,
  FileText,
  Bot,
} from "lucide-react";

import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

export default function Menu() {
  const pathname = usePathname();
  const { setShowSidebar } = useUIStore();

  // Menu items matching your image
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: Square,
      isActive: pathname === "/",
    },
    {
      name: "Report & Analysis",
      path: "/ai-results",
      icon: BarChart3,
      isActive: pathname === "/ai-results",
    },
    {
      name: "Company Structure",
      path: "/company-structure",
      icon: Upload,
      isActive: pathname === "/company-structure",
    },
    {
      name: "Users",
      path: "/users",
      icon: User,
      isActive: pathname === "/users",
    },
    {
      name: "Business Rules",
      path: "/business-rules",
      icon: FileText,
      isActive: pathname === "/business-rules",
    },

    {
      name: "History Log",
      path: "/database-hierarchy",
      icon: History,
      isActive: pathname === "/database-hierarchy",
    },
  ];

  const handleMenuItemClick = () => {
    setShowSidebar(false);
  };

  return (
    <div className="fixed top-[80px] left-1/2 -translate-x-[calc(50%+300px)] z-50 animate-in slide-in-from-top-4 duration-300">
      <div
        className="backdrop-blur-2xl border border-green-500/30 rounded-2xl shadow-2xl overflow-hidden w-80 max-h-[80vh] overflow-y-auto"
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 50, 30, 0.8) 50%, rgba(0, 0, 0, 0.9) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Menu Items */}
        <div className="p-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                href={item.path}
                key={item.name}
                onClick={handleMenuItemClick}
                className="block group"
              >
                <div
                  className={cn(
                    "flex items-center p-3 rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden",
                    item.isActive
                      ? "bg-gradient-to-r from-green-500/30 to-green-600/20 border border-green-400/40 shadow-lg shadow-green-500/20"
                      : "bg-black/20 hover:bg-green-500/10 hover:border hover:border-green-500/30 border border-transparent"
                  )}
                >
                  {/* Background glow for active item */}
                  {item.isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-green-400/10 to-transparent opacity-50" />
                  )}

                  {/* Icon */}
                  <div className="mr-3 relative z-10">
                    <item.icon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        item.isActive
                          ? "text-green-400"
                          : "text-gray-300 group-hover:text-green-300"
                      )}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 relative z-10">
                    <h3
                      className={cn(
                        "text-sm font-medium transition-colors",
                        item.isActive
                          ? "text-white"
                          : "text-gray-200 group-hover:text-white"
                      )}
                    >
                      {item.name}
                    </h3>
                  </div>

                  {/* Active indicator dot */}
                  {item.isActive && (
                    <div className="w-2 h-2 bg-green-400 rounded-full relative z-10 shadow-lg shadow-green-400/50" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
