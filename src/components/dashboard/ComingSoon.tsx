"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeInSection } from "@/components/ui/opening-animation";
import { useResolvedTheme } from "@/store/theme-store";
import { Sparkles, Clock, Rocket, Star } from "lucide-react";

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  description?: string;
  launchDate?: Date;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title = "Dashboard Coming Soon",
  subtitle = "We're building something amazing",
  description = "Our new dashboard experience is currently under development. Stay tuned for powerful analytics, insights, and tools that will transform how you interact with your knowledge base.",
  launchDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
}) => {
  const resolvedTheme = useResolvedTheme();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
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

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Deep insights into your knowledge base usage and performance",
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized for speed with real-time data updates",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Beautiful Design",
      description: "Intuitive interface with smooth animations and transitions",
    },
  ];

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-r from-[#00bf6f]/20 to-[#5BE49B]/20 blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-32 w-24 h-24 rounded-full bg-gradient-to-r from-[#5BE49B]/15 to-[#00A76F]/15 blur-lg"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-32 left-1/3 w-20 h-20 rounded-full bg-gradient-to-r from-[#00A76F]/10 to-[#00bf6f]/10 blur-md"
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <FadeInSection delay={0.2}>
          {/* Main Icon */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 1,
              ease: "easeOut",
              delay: 0.3,
            }}
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-[#00bf6f] to-[#5BE49B] flex items-center justify-center shadow-lg shadow-[#00bf6f]/25">
              <Clock className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#00bf6f] to-[#5BE49B] bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {subtitle}
          </motion.p>

          {/* Description */}
          <motion.p
            className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {description}
          </motion.p>

          {/* Countdown Timer */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
              {Object.entries(timeLeft).map(([unit, value], index) => (
                <motion.div
                  key={unit}
                  className="bg-white/50 dark:bg-[#232435]/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-white/10"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-[#00bf6f]">
                    {value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {unit}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/30 dark:bg-[#232435]/30 backdrop-blur-sm rounded-xl p-6 border border-gray-200/30 dark:border-white/10 hover:border-[#00bf6f]/30 transition-all duration-300"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(0, 191, 111, 0.1)"
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.5 + index * 0.1 }}
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#00bf6f] to-[#5BE49B] flex items-center justify-center text-white">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </FadeInSection>
      </div>
    </div>
  );
};

export default ComingSoon;
