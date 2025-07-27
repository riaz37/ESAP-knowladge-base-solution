"use client";

import React, { useState, useEffect } from "react";
import { useResolvedTheme } from "@/store/theme-store";
import { Clock } from "lucide-react";

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  description?: string;
  launchDate?: Date;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title = "Coming Soon",
  subtitle = "We're working on something amazing",
  description = "This feature is currently under development and will be available soon. Please check back later for updates.",
  launchDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
}) => {
  const resolvedTheme = useResolvedTheme();
  const [timeLeft, setTimeLeft] = useState({
    days: 30,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center max-w-2xl mx-auto">
        {/* Icon/Illustration */}
        <div className="mb-8">
          <div 
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: resolvedTheme === "dark" 
                ? "linear-gradient(135deg, rgba(91,228,155,0.2) 0%, rgba(148,255,212,0.1) 100%)"
                : "linear-gradient(135deg, rgba(91,228,155,0.1) 0%, rgba(148,255,212,0.05) 100%)",
              border: resolvedTheme === "dark" 
                ? "2px solid rgba(91,228,155,0.3)" 
                : "2px solid rgba(91,228,155,0.2)"
            }}
          >
            <Clock 
              className="w-16 h-16" 
              style={{
                color: resolvedTheme === "dark" ? "#5BE49B" : "#059669"
              }}
            />
          </div>
        </div>

        {/* Title */}
        <h1 
          className="text-4xl font-bold mb-4"
          style={{
            color: resolvedTheme === "dark" ? "#fff" : "#1f2937",
            letterSpacing: "-0.02em"
          }}
        >
          {title}
        </h1>
        
        {/* Subtitle */}
        <p 
          className="text-xl mb-8"
          style={{
            color: resolvedTheme === "dark" ? "#94a3b8" : "#6b7280",
            lineHeight: "1.6"
          }}
        >
          {subtitle}
        </p>
        
        {/* Description */}
        <p 
          className="mb-8 text-lg"
          style={{
            color: resolvedTheme === "dark" ? "#cbd5e1" : "#4b5563"
          }}
        >
          {description}
        </p>

        {/* Countdown Timer */}
        <div className="mb-12">
          <div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
            style={{
              background: resolvedTheme === "dark" 
                ? "rgba(91, 228, 155, 0.1)" 
                : "rgba(91, 228, 155, 0.05)",
              border: resolvedTheme === "dark" 
                ? "1px solid rgba(91, 228, 155, 0.2)" 
                : "1px solid rgba(91, 228, 155, 0.1)",
              color: resolvedTheme === "dark" ? "#5BE49B" : "#059669"
            }}
          >
            <Clock className="w-5 h-5" />
            <span className="font-medium">
              Coming in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
