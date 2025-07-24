import React from "react";
import ComingSoon from "./ComingSoon";

interface DashboardProps {
  data: {
    cards: any[];
  };
  onNavigate: (key: string) => void;
}

const Dashboard: React.FC<DashboardProps> = () => {
  return (
    <div className="w-full">
      <ComingSoon
        title="Dashboard Coming Soon"
        subtitle="We're crafting something extraordinary"
        description="Our new dashboard experience is being carefully designed to provide you with powerful insights, beautiful visualizations, and seamless navigation through your knowledge base. Every detail is being perfected to deliver an exceptional user experience."
      />
    </div>
  );
};

export default Dashboard;
