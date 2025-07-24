import React from "react";
import AuroraBackground from "./AuroraBackground";

interface StatCard {
  type: "stat";
  title: string;
  value: string | number;
  subtext?: string;
}

interface ProgressCard {
  type: "progress";
  title: string;
  value: number;
  subtext?: string;
}

interface ListCard {
  type: "list";
  title: string;
  items: string[];
}

type DashboardCard = StatCard | ProgressCard | ListCard;

interface DashboardStatsCardProps {
  card: DashboardCard;
  index: number;
}

const DashboardStatsCard: React.FC<DashboardStatsCardProps> = ({
  card,
  index,
}) => {
  return (
    <div className="relative rounded-2xl p-6 border border-[#e1f4ea]/70 dark:border-[#013828]/30 bg-white/50 dark:bg-transparent overflow-hidden">
      <AuroraBackground />
      <div className="relative z-10">
        {card.type === "stat" && (
          <div className="text-center">
            <div className="text-3xl font-bold text-[#00bf6f] mb-2">
              {typeof card.value === "number"
                ? card.value.toLocaleString()
                : card.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {card.title}
            </div>
            {card.subtext && (
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {card.subtext}
              </div>
            )}
          </div>
        )}
        {card.type === "progress" && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {card.title}
              </span>
              <span className="text-sm text-[#00bf6f] font-medium">
                {card.value}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-[#00bf6f] h-2 rounded-full transition-all duration-300"
                style={{ width: `${card.value}%` }}
              ></div>
            </div>
            {card.subtext && (
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {card.subtext}
              </div>
            )}
          </div>
        )}
        {card.type === "list" && (
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              {card.title}
            </div>
            <div className="space-y-2">
              {card.items.map((item, idx) => (
                <div
                  key={idx}
                  className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-[#00bf6f] rounded-full"></div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardStatsCard;
