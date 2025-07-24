import React from "react";
import { FadeInSection } from "@/components/ui/opening-animation";
import DashboardStatsCard from "./DashboardStatsCard";
import KnowledgeTypeCard from "./KnowledgeTypeCard";
import { collections } from "@/app/dummy-data/information";

interface DashboardProps {
  data: {
    cards: any[];
  };
  onNavigate: (key: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onNavigate }) => {
  return (
    <div className="w-full">
      <FadeInSection delay={0.3}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Welcome to Knowledge Base
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a knowledge type to get started
          </p>
        </div>

        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {data.cards.map((card, index) => (
            <DashboardStatsCard key={index} card={card} index={index} />
          ))}
        </div>

        {/* Knowledge Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections
            .filter((col) => col.key !== "dashboard")
            .map((collection) => (
              <KnowledgeTypeCard
                key={collection.key}
                collection={collection}
                onClick={onNavigate}
              />
            ))}
        </div>
      </FadeInSection>
    </div>
  );
};

export default Dashboard;
