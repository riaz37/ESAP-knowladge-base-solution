import React, { useState, useEffect } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

interface OnboardingTourProps {
  isVisible: boolean;
  onComplete: () => void;
  theme?: "light" | "dark";
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isVisible,
  onComplete,
  theme = "dark", // Default to dark mode
}) => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setRun(true);
    }
  }, [isVisible]);

  const steps: Step[] = [
    {
      target: ".sidebar-tab-list",
      content: (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-100">
            Welcome to Knowledge Base Solution! 🎉
          </h3>
          <p className="text-sm text-gray-300">
            Let's explore the different sections available in the sidebar. Each
            button represents a different type of knowledge base.
          </p>
        </div>
      ),
      placement: "right",
      disableBeacon: true,
    },
    {
      target: ".sidebar-tab-list div:first-child",
      content: (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-100">
            Database Knowledge 📊
          </h3>
          <p className="text-sm text-gray-300">
            Click on "DB Knowledge" to access our AI-powered query system. This
            is where you can ask questions about your data in natural language.
          </p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "#query",
      content: (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-100">
            Ask Your Question 💬
          </h3>
          <p className="text-sm text-gray-300">
            Type your question here in natural language. For example: "What is
            the pending task for manager?" or "Show me all employees in the
            sales department"
          </p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".send-button",
      content: (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-100">
            Submit Your Query 🚀
          </h3>
          <p className="text-sm text-gray-300">
            Click the "Send" button to process your question. Our AI will
            convert it to SQL and fetch the relevant data from your database.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: ".card-gradient",
      content: (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-100">
            View Your Results 📋
          </h3>
          <p className="text-sm text-gray-300">
            Here you can see your query results in a clean, organized table
            format. The data is automatically displayed with proper columns and
            rows.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: ".filter-toggle-button",
      content: (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-100">
            Filter Your Data 🔍
          </h3>
          <p className="text-sm text-gray-300">
            Use the "Show Filter" button to search and filter through your
            results. You can search across all columns or filter by specific
            fields.
          </p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".pagination-controls",
      content: (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-100">
            Navigate Through Pages 📄
          </h3>
          <p className="text-sm text-gray-300">
            Use pagination controls to navigate through large datasets. You can
            also change the number of rows displayed per page.
          </p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: ".charts-section",
      content: (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-100">
            Visualize Your Data 📈
          </h3>
          <p className="text-sm text-gray-300">
            Explore interactive charts and graphs that automatically visualize
            your data. Toggle between different chart types to better understand
            your results.
          </p>
        </div>
      ),
      placement: "top",
    },
    {
      target: "button[aria-label='User settings']",
      content: (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-100">
            Set Your User ID 👤
          </h3>
          <p className="text-sm text-gray-300">
            Click the user icon to set your unique User ID. This will save your
            query history so you can revisit your previous questions and
            results.
          </p>
        </div>
      ),
      placement: "left",
    },
    {
      target: ".query-history",
      content: (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-100">
            Access Your History 📚
          </h3>
          <p className="text-sm text-gray-300">
            Once you set a User ID, your query history will appear here. Click
            on any previous query to quickly re-run it. You can also clear your
            history if needed.
          </p>
        </div>
      ),
      placement: "left",
    },
  ];

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      onComplete();
    }
  };

  // Always use dark mode styling
  const customStyles = {
    options: {
      primaryColor: "#00bf6f",
      backgroundColor: "#011f17",
      textColor: "#e5e7eb",
      arrowColor: "#011f17",
      overlayColor: "rgba(0, 0, 0, 0.5)",
      spotlightPadding: 8,
      zIndex: 1000,
    },
    tooltip: {
      backgroundColor: "#011f17",
      borderRadius: "12px",
      color: "#e5e7eb",
      fontSize: "14px",
      padding: "20px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
      border: "1px solid #013828",
    },
    tooltipTitle: {
      color: "#00bf6f",
      fontSize: "18px",
      fontWeight: "600",
    },
    tooltipContent: {
      color: "#9ca3af",
      fontSize: "14px",
      lineHeight: "1.5",
    },
    buttonNext: {
      backgroundColor: "#00bf6f",
      color: "#ffffff",
      borderRadius: "8px",
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "500",
      border: "none",
      cursor: "pointer",
      transition: "all 0.2s ease",
      background: "linear-gradient(to right, #00bf6f, #006f4a)",
    },
    buttonBack: {
      backgroundColor: "#012920",
      color: "#e5e7eb",
      borderRadius: "8px",
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "500",
      border: "1px solid #013828",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    buttonSkip: {
      color: "#9ca3af",
      fontSize: "14px",
      fontWeight: "500",
      textDecoration: "none",
    },
    buttonClose: {
      color: "#9ca3af",
      fontSize: "16px",
      fontWeight: "500",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    spotlight: {
      backgroundColor: "transparent",
      borderRadius: "8px",
    },
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleCallback}
      styles={customStyles}
      locale={{
        back: "Previous",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip Tour",
      }}
    />
  );
};

export default OnboardingTour;
