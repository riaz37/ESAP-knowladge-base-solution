"use client";
import React from "react";
import Image from "next/image";
import { Bell, User } from "lucide-react";
import { useUIStore } from "@/store/uiStore";

export default function Navbar() {
  const { showSidebar, setShowSidebar } = useUIStore();

  const handleMenuClick = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <nav
      className="fixed top-[30px] left-1/2 transform -translate-x-1/2 z-50 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-between shadow-2xl shadow-black/20"
      style={{
        width: "1351px",
        height: "64px",
        paddingLeft: "20px",
        paddingRight: "20px",
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Left side - Logo and Menu */}
      <div className="flex items-center gap-6">
        {/* ESAP Logo */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full">
          <Image
            src="/logo/ESAP_W.png"
            alt="ESAP"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </div>

        {/* Menu Button */}
        <div 
          onClick={handleMenuClick}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 rounded-full border border-emerald-500/25 hover:bg-emerald-500/20 transition-all duration-300 cursor-pointer group"
        >
          <div className="w-4 h-4 flex flex-col items-center justify-center gap-0.5">
            {/* Three horizontal bars */}
            <div className={`w-4 h-0.5 bg-emerald-400 rounded-full transition-all duration-300 ${showSidebar ? 'rotate-45 translate-y-1' : ''}`}></div>
            <div className={`w-4 h-0.5 bg-emerald-400 rounded-full transition-all duration-300 ${showSidebar ? 'opacity-0' : ''}`}></div>
            <div className={`w-4 h-0.5 bg-emerald-400 rounded-full transition-all duration-300 ${showSidebar ? '-rotate-45 -translate-y-1' : ''}`}></div>
          </div>
          <span className="text-emerald-400 text-sm font-medium group-hover:text-emerald-300 transition-colors">
            {showSidebar ? 'Close' : 'Menu'}
          </span>
        </div>

        {/* Robot Icon */}
        <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center border border-gray-600/30 hover:bg-gray-600/50 transition-colors cursor-pointer">
          <Image
            src="/roboicon-small.png"
            alt="Robot"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </div>
      </div>

      {/* Right side - Notifications and User */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center border border-gray-600/30 hover:bg-gray-600/50 transition-colors cursor-pointer">
            <Bell className="w-5 h-5 text-white/90" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-black/50">
            <span className="text-white text-xs font-bold">1</span>
          </div>
        </div>

        {/* User Avatar */}
        <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center border border-gray-600/30 hover:bg-gray-600/50 transition-colors cursor-pointer">
          <User className="w-5 h-5 text-white/90" />
        </div>
      </div>
    </nav>
  );
}
