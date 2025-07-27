import React from "react";
import { FloatingElements } from "@/components/ui/enhanced-background";
import { StatefulButton } from "@/components/ui/stateful-button";
import { FlipWordsDemo } from "@/components/ui/flip-words";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
      <Card
        className={cn(
          "w-full mb-6 p-6 gap-[18px]",
          theme === "dark"
            ? "border-[3px] border-[rgba(0,191,111,0.27)] bg-gradient-to-b from-[rgba(0,191,111,0.25)] via-[rgba(0,191,111,0.09)] to-[rgba(0,191,111,0.02)] backdrop-blur-[32px] shadow-none"
            : "border-[1.5px] border-[#e1f4ea] bg-white shadow-[0_2px_12px_0_rgba(0,0,0,0.06)]"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center gap-2 font-medium text-base tracking-[-0.2px] leading-[1.3]",
            theme === "dark" ? "text-[#00bf6f]" : "text-[#1a2b22]"
          )}
        >
          <Image src="/roboicon-large.png" alt="Marco" width={28} height={28} />
          <FlipWordsDemo />
        </div>

        {/* Main Content Row */}
        <div className="flex flex-row w-full items-start gap-8">
          {/* Input Area */}
          <div className="flex flex-1 flex-col items-start self-stretch gap-4">
            <div
              className={cn(
                "flex flex-1 self-stretch rounded-[20px] w-full",
                theme === "dark"
                  ? "border-2 border-[rgba(0,191,111,0.30)] bg-[rgba(0,0,0,0.3)] backdrop-blur-[22.5px]"
                  : "border-[1.5px] border-[#e1f4ea] bg-[#f0f9f5]"
              )}
            >
              <textarea
                id="query"
                className={cn(
                  "border-none outline-none bg-transparent resize-none rounded-[24px] p-6 flex-1 w-full min-h-full text-base",
                  theme === "dark" ? "text-white" : "text-[#222]",
                  "placeholder:text-muted-foreground"
                )}
                placeholder="Ask your questions here"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={selected !== "db"}
              />
            </div>

            <div className="flex w-full justify-end">
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

          {/* Quick Action Cards */}
          <div
            className="grid grid-cols-2 gap-4 self-start"
            style={{
              gridTemplateColumns: "repeat(2, 210px)",
              gridAutoRows: "120px",
            }}
          >
            {quickActions.map((action, idx) => (
              <Card
                key={idx}
                className={cn(
                  "quick-action-card animated-card cursor-pointer relative overflow-hidden flex flex-col items-center justify-center p-4 text-center transition-all hover:scale-105",
                  theme === "dark"
                    ? "bg-gradient-to-b from-[rgba(0,191,111,0.18)] via-[rgba(0,191,111,0.09)] to-[rgba(0,191,111,0.02)] border-[1.5px] border-[rgba(0,191,111,0.18)] shadow-[0_2px_8px_0_rgba(0,191,111,0.08)]"
                    : "bg-white border-[1.5px] border-[#e1f4ea] shadow-[0_2px_8px_0_rgba(0,0,0,0.06)]"
                )}
                style={{ animationDelay: `${idx * 0.5}s` }}
                onClick={() => setQuery(action.text)}
              >
                {/* Floating particles background */}
                <div className="particles-container absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, particleIdx) => (
                    <div
                      key={particleIdx}
                      className={cn(
                        "floating-particle absolute w-1 h-1 rounded-full opacity-60",
                        theme === "dark"
                          ? "bg-[rgba(0,191,111,0.6)]"
                          : "bg-[#e1f4ea]"
                      )}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${3 + Math.random() * 2}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Glowing border effect */}
                <div className="glow-border absolute inset-0 rounded-xl opacity-0 transition-opacity hover:opacity-100 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                {/* Content */}
                <span
                  className={cn(
                    "card-icon text-[22px] mb-2 z-10",
                    theme === "dark" ? "text-[#00bf6f]" : "text-[#1a2b22]"
                  )}
                >
                  {action.icon}
                </span>
                <span
                  className={cn(
                    "card-text text-sm font-medium z-10",
                    theme === "dark" ? "text-white" : "text-[#1a2b22]"
                  )}
                >
                  {action.text}
                </span>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </FloatingElements>
  );
};

export default QueryInput;