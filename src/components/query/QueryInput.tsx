import React from "react";
import { FloatingElements } from "@/components/ui/enhanced-background";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { StatefulButton } from "@/components/ui/stateful-button";
import { FlipWordsDemo } from "@/components/ui/flip-words";
import Image from "next/image";

interface QuickAction {
  icon: React.ReactNode;
  text: string;
}

interface QueryInputProps {
  query: string;
  setQuery: (query: string) => void;
  handleQuerySubmit: () => void;
  loading: boolean;
  selected: string;
  quickActions: QuickAction[];
  theme: string | undefined;
}

const QueryInput: React.FC<QueryInputProps> = ({
  query,
  setQuery,
  handleQuerySubmit,
  loading,
  selected,
  quickActions,
  theme,
}) => {
  return (
    <FloatingElements count={8}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 24,
          alignItems: "flex-start",
          alignSelf: "stretch",
          borderRadius: 16,
          border:
            theme === "dark"
              ? "3px solid rgba(0, 191, 111, 0.27)"
              : "1.5px solid #e1f4ea",
          background:
            theme === "dark"
              ? "linear-gradient(180deg, rgba(0, 191, 111, 0.25) 0%, rgba(0, 191, 111, 0.09) 52.11%, rgba(0, 191, 111, 0.02) 100%)"
              : "#fff",
          boxShadow:
            theme === "dark" ? "none" : "0 2px 12px 0 rgba(0,0,0,0.06)",
          backdropFilter: theme === "dark" ? "blur(32px)" : undefined,
          width: "100%",
          marginBottom: 24,
          gap: 18,
          boxSizing: "border-box",
        }}
      >
        {/* Header text */}
        <div
          style={{
            color: theme === "dark" ? "#00bf6f" : "#1a2b22",
            fontWeight: 500,
            fontSize: 16,
            letterSpacing: "-0.2px",
            marginBottom: 0,
            lineHeight: 1.3,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Image src="/roboicon-large.png" alt="Marco" width={28} height={28} />
          <FlipWordsDemo />
        </div>
        {/* Row: Input area + Quick action cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            alignItems: "flex-start",
            gap: 32,
          }}
        >
          {/* Left: Input area */}
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              alignItems: "flex-start",
              alignSelf: "stretch",
              gap: 16,
            }}
          >
            <BackgroundBeamsWithCollision intensity="high">
              <div
                style={{
                  display: "flex",
                  padding: 0,
                  alignItems: "flex-start",
                  flex: 1,
                  borderRadius: 20,
                  alignSelf: "stretch",
                  height: "100%",
                  border:
                    theme === "dark"
                      ? "2px solid rgba(0, 191, 111, 0.30)"
                      : "1.5px solid #e1f4ea",
                  background: theme === "dark" ? "transparent" : "#f0f9f5",
                  backdropFilter: theme === "dark" ? "blur(22.5px)" : undefined,
                  width: "100%",
                }}
              >
                <textarea
                  id="query"
                  className=""
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    color: theme === "dark" ? "#fff" : "#222",
                    fontSize: 16,
                    width: "100%",
                    minHeight: "100%",
                    resize: "none",
                    borderRadius: 24,
                    padding: 24,
                    flex: 1,
                  }}
                  placeholder="Ask your questions here"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={selected !== "db"}
                />
              </div>
            </BackgroundBeamsWithCollision>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "flex-end",
              }}
            >
              <StatefulButton
                onClick={handleQuerySubmit}
                disabled={!query.trim() || selected !== "db" || loading}
                className="h-14 send-button"
                mode={theme === "dark" ? "dark" : "light"}
              >
                {loading ? "Sending" : "Send"}
              </StatefulButton>
            </div>
          </div>
          {/* Right: Quick action cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 210px)",
              gridAutoRows: "120px",
              gap: 16,
              alignSelf: "flex-start",
            }}
          >
            {quickActions.map((action, idx) => (
              <div
                key={idx}
                className="quick-action-card animated-card"
                onClick={() => setQuery(action.text)}
                style={{
                  animationDelay: `${idx * 0.5}s`,
                  background:
                    theme === "dark"
                      ? "linear-gradient(180deg, rgba(0,191,111,0.18) 0%, rgba(0,191,111,0.09) 52.78%, rgba(0,191,111,0.02) 103.39%)"
                      : "#fff",
                  border:
                    theme === "dark"
                      ? "1.5px solid rgba(0,191,111,0.18)"
                      : "1.5px solid #e1f4ea",
                  color: theme === "dark" ? "#00bf6f" : "#1a2b22",
                  boxShadow:
                    theme === "dark"
                      ? "0 2px 8px 0 rgba(0,191,111,0.08)"
                      : "0 2px 8px 0 rgba(0,0,0,0.06)",
                  cursor: "pointer",
                }}
              >
                {/* Floating particles background */}
                <div className="particles-container">
                  {[...Array(6)].map((_, particleIdx) => (
                    <div
                      key={particleIdx}
                      className="floating-particle"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${3 + Math.random() * 2}s`,
                        background:
                          theme === "dark"
                            ? "rgba(0, 191, 111, 0.6)"
                            : "#e1f4ea",
                      }}
                    />
                  ))}
                </div>
                {/* Glowing border effect */}
                <div className="glow-border" />
                {/* Content */}
                <span
                  className="card-icon"
                  style={{
                    fontSize: 22,
                    marginBottom: 8,
                    color: theme === "dark" ? "#00bf6f" : "#1a2b22",
                  }}
                >
                  {action.icon}
                </span>
                <span
                  className="card-text"
                  style={{
                    color: theme === "dark" ? "#fff" : "#1a2b22",
                  }}
                >
                  {action.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FloatingElements>
  );
};

export default QueryInput;
