"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export const EnhancedBackground = ({
  children,
  className,
  intensity = "medium",
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: "low" | "medium" | "high";
}) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full" />;
  }

  const currentTheme = resolvedTheme || theme;
  const particleCount =
    intensity === "high" ? 30 : intensity === "low" ? 10 : 20;
  const gridSize = intensity === "high" ? 40 : intensity === "low" ? 60 : 50;

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Theme-aware gradient background with smooth transitions */}
      <div
        className="absolute inset-0 bg-gradient-to-br transition-colors duration-700 ease-in-out"
        style={{
          backgroundImage: currentTheme === "dark"
            ? "linear-gradient(to bottom right, #0a0a0a, #1a1a1a, #2a2a2a)"
            : "linear-gradient(to bottom right, #ffffff, #f0f9f5, #e6f7ff)"
        }}
      />

      {/* Animated grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34,197,94,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,197,94,0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(particleCount)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-green-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      {/* Animated lines */}
      <div className="absolute inset-0">
        {[...Array(intensity === "high" ? 8 : intensity === "low" ? 3 : 5)].map(
          (_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-green-400 to-transparent"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${100 + Math.random() * 200}px`,
              }}
              animate={{
                x: [0, 100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 6,
              }}
            />
          )
        )}
      </div>

      {/* Glowing orbs */}
      <div className="absolute inset-0">
        {[...Array(intensity === "high" ? 6 : intensity === "low" ? 2 : 4)].map(
          (_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 bg-green-400/10 rounded-full blur-xl"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          )
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export const AnimatedGradient = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 animate-pulse" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export const FloatingElements = ({
  children,
  className,
  count = 5,
}: {
  children: React.ReactNode;
  className?: string;
  count?: number;
}) => {
  return (
    <div className={cn("relative", className)}>
      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
};
