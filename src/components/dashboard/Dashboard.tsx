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
     <ComingSoon/>
    </div>
  );
};

export default Dashboard;
