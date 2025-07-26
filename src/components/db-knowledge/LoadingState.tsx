"use client";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Lottie from "lottie-react";
import robotAnimation2 from "../../../public/robot-lottie3.json";

export default function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mt-6 relative">
        <CardContent className="relative flex flex-col items-center justify-center py-16 gap-6">
          <div className="relative">
            <div className="w-64 h-64 relative">
              {/* Glass container for lottie */}
              <div className="absolute inset-0 rounded-full backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-white/10" />
              <Lottie
                animationData={robotAnimation2}
                loop={true}
                autoplay={true}
              />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg"
            >
              <Loader2 className="w-4 h-4 text-primary" />
            </motion.div>
          </div>

          <div className="w-full max-w-md space-y-3">
            <Skeleton className="h-3 w-full bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
            <Skeleton className="h-3 w-3/4 bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
            <Skeleton className="h-3 w-1/2 bg-white/10 dark:bg-black/10 backdrop-blur-sm" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
