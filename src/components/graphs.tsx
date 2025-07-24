import React from "react";
import { Shimmer } from "./glass-ui/Shimmer";
import { useTheme } from "@/contexts/ThemeContext";

// Chart dimensions
const CARD_MIN_H = 380;
const CARD_PADDING = 24;
const paddingX = 38;
const paddingY = 44;

function getPoints(
  data: number[],
  chartW: number,
  chartH: number
): [number, number][] {
  const maxY = Math.max(...data, 1); // Use actual max value instead of fixed 100
  const stepX = chartW / (data.length - 1);
  return data.map((y, i) => {
    const x = paddingX + i * stepX;
    const yPos = paddingY + chartH - (y / maxY) * chartH;
    return [x, yPos];
  });
}

function getSmoothPath(points: [number, number][]) {
  return points.reduce(
    (acc, [x, y], i, arr) =>
      i === 0
        ? `M${x},${y}`
        : `${acc} C${x - 18},${arr[i - 1][1]} ${x - 18},${y} ${x},${y}`,
    ""
  );
}

interface ChartLineCardProps {
  loading?: boolean;
  isDummy?: boolean;
  chartData?: { key: string; data: any[] };
}

interface ChartDonutCardProps {
  loading?: boolean;
  isDummy?: boolean;
  chartData?: { key: string; data: any[] };
}

interface ChartBarCardProps {
  loading?: boolean;
  isDummy?: boolean;
  chartData?: { key: string; data: any[] };
}

interface GraphsRowProps {
  chartData?: {
    line?: { key: string; data: any[] };
    bar?: { key: string; data: any[] };
    pie?: { key: string; data: any[] };
  };
  loading?: boolean;
  isDummy?: boolean;
}

export const ChartLineCard: React.FC<ChartLineCardProps> = ({
  loading = false,
  isDummy = false,
  chartData,
} = {}) => {
  const { theme } = useTheme();

  // Responsive width/height
  const ref = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ w: 320, h: CARD_MIN_H });
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const handle = () => {
      const rect = ref.current!.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const glowPad = 22; // margin for glows/dots
  const svgW = size.w - CARD_PADDING * 2;
  const svgH = size.h - CARD_PADDING * 2;
  const chartW = svgW - paddingX * 2 - glowPad * 2;
  const chartH = svgH - paddingY * 2 - glowPad * 2;
  const chartOffsetX = paddingX + glowPad;
  const chartOffsetY = paddingY + glowPad;

  // Process real data for line chart
  let lineData1: number[] = [];
  let lineData2: number[] = [];
  let labels: string[] = [];
  let yTicks: number[] = [];

  if (chartData && chartData.data && chartData.data.length > 0) {
    // Limit to last 8 data points for readability
    const limitedData = chartData.data.slice(-8);
    const values = limitedData.map((item: any) =>
      typeof item.value === "number" ? item.value : Number(item.value) || 0
    );
    labels = limitedData.map(
      (item: any) =>
        item.name || item.label || `Item ${chartData.data.indexOf(item) + 1}`
    );
    // Create two different lines for better visualization
    lineData1 = values;
    lineData2 = values.map((val, i) => {
      if (i === 0) return val * 0.8;
      return (val + values[i - 1]) / 2;
    });
    // Generate Y-axis ticks based on actual data
    const maxValue = Math.max(...values, ...lineData2, 1);
    const minValue = Math.min(...values, ...lineData2, 0);
    const range = maxValue - minValue;
    const step = range / 5;
    yTicks = Array.from({ length: 6 }, (_, i) =>
      Math.round(minValue + i * step)
    );
  } else {
    // Fallback to dummy data
    labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    lineData1 = [40, 45, 38, 36, 32, 28, 22];
    lineData2 = [10, 18, 28, 38, 48, 44, 32];
    yTicks = [0, 20, 40, 60, 80, 100];
  }

  const pointsGreen = getPoints(lineData1, chartW, chartH).map(
    ([x, y]) => [x + glowPad, y + glowPad] as [number, number]
  );
  const pointsPink = getPoints(lineData2, chartW, chartH).map(
    ([x, y]) => [x + glowPad, y + glowPad] as [number, number]
  );
  const pathGreen = getSmoothPath(pointsGreen);
  const pathPink = getSmoothPath(pointsPink);

  return (
    <div
      ref={ref}
      style={{
        flex: "1 1 0",
        width: "100%",
        height: CARD_MIN_H,
        minWidth: 0,
        minHeight: CARD_MIN_H,
        borderRadius: 32,
        background:
          theme === "dark"
            ? "linear-gradient(180deg, rgba(0, 191, 111, 0.25) 0%, rgba(0, 191, 111, 0.09) 52.11%, rgba(0, 191, 111, 0.02) 100%)"
            : "#fff",
        border:
          theme === "dark"
            ? "3px solid rgba(0, 191, 111, 0.27)"
            : "1.5px solid #e1f4ea",
        backdropFilter: theme === "dark" ? "blur(36px)" : undefined,
        WebkitBackdropFilter: theme === "dark" ? "blur(36px)" : undefined,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        padding: CARD_PADDING,
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        boxShadow: theme === "dark" ? "none" : "0 2px 12px 0 rgba(0,0,0,0.06)",
      }}
    >
      <span
        style={{
          color: theme === "dark" ? "#fff" : "#1a2b22",
          fontWeight: 400,
          fontSize: 14,
          marginTop: 0,
          marginLeft: 4,
          marginBottom: 8,
          letterSpacing: 0.1,
        }}
      >
        {chartData?.key ? `${chartData.key} Trends` : "Total Statistics"}
      </span>
      <div style={{ width: "100%", flex: 1, display: "flex" }}>
        {loading ? (
          <Shimmer width="100%" height={svgH} borderRadius={24} />
        ) : (
          <svg
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            style={{
              display: "block",
              marginTop: 0,
              overflow: "hidden",
              width: "100%",
              opacity: isDummy ? 0.4 : 1,
              transition: "opacity 0.3s",
            }}
          >
            {/* X-axis labels at the top */}
            {labels.map((label, i) => (
              <text
                key={label}
                x={chartOffsetX + i * (chartW / (labels.length - 1))}
                y={chartOffsetY - 18}
                fill={theme === "dark" ? "#fff" : "#1a2b22"}
                fontSize={14}
                fontWeight={500}
                opacity={0.85}
                textAnchor="middle"
              >
                {label.length > 6 ? label.slice(0, 6) + "..." : label}
              </text>
            ))}
            {/* Y-axis labels */}
            {yTicks.map((tick) => (
              <text
                key={tick}
                x={chartOffsetX - 24}
                y={
                  chartOffsetY +
                  chartH -
                  (tick / Math.max(...yTicks, 1)) * chartH +
                  6
                }
                fill={theme === "dark" ? "#fff" : "#1a2b22"}
                fontSize={14}
                fontWeight={600}
                opacity={0.85}
                textAnchor="end"
              >
                {tick}
              </text>
            ))}
            {/* Grid lines */}
            {yTicks.map((tick, i) => (
              <line
                key={tick}
                x1={chartOffsetX}
                x2={chartOffsetX + chartW}
                y1={
                  chartOffsetY +
                  chartH -
                  (tick / Math.max(...yTicks, 1)) * chartH
                }
                y2={
                  chartOffsetY +
                  chartH -
                  (tick / Math.max(...yTicks, 1)) * chartH
                }
                stroke={theme === "dark" ? "#fff" : "#1a2b22"}
                strokeOpacity={theme === "dark" ? 0.07 : 0.1}
                strokeWidth={1}
              />
            ))}
            {/* Green line with glow */}
            <g filter="url(#glowGreen)">
              <path
                d={getSmoothPath(
                  pointsGreen.map(([x, y], i) => [x * (svgW / chartW), y])
                )}
                stroke="#00bf6f"
                strokeWidth={6.5}
                strokeLinecap="round"
                fill="none"
              />
              {/* Start and end dots for green line */}
              <circle
                cx={pointsGreen[0][0] * (svgW / chartW)}
                cy={pointsGreen[0][1]}
                r={7}
                fill="#00bf6f"
                filter="url(#glowGreen)"
              />
              <circle
                cx={pointsGreen[pointsGreen.length - 1][0] * (svgW / chartW)}
                cy={pointsGreen[pointsGreen.length - 1][1]}
                r={7}
                fill="#00bf6f"
                filter="url(#glowGreen)"
              />
            </g>
            {/* Pink line with glow */}
            <g filter="url(#glowPink)">
              <path
                d={getSmoothPath(
                  pointsPink.map(([x, y], i) => [x * (svgW / chartW), y])
                )}
                stroke="#FF87FD"
                strokeWidth={6.5}
                strokeLinecap="round"
                fill="none"
              />
              {/* Start and end dots for pink line */}
              <circle
                cx={pointsPink[0][0] * (svgW / chartW)}
                cy={pointsPink[0][1]}
                r={7}
                fill="#FF87FD"
                filter="url(#glowPink)"
              />
              <circle
                cx={pointsPink[pointsPink.length - 1][0] * (svgW / chartW)}
                cy={pointsPink[pointsPink.length - 1][1]}
                r={7}
                fill="#FF87FD"
                filter="url(#glowPink)"
              />
            </g>
            {/* Glow filters */}
            <defs>
              <filter id="glowGreen" x="-40" y="-40" width="400" height="320">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="8"
                  floodColor="#00bf6f"
                  floodOpacity="0.7"
                />
              </filter>
              <filter id="glowPink" x="-40" y="-40" width="400" height="320">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="8"
                  floodColor="#FF87FD"
                  floodOpacity="0.7"
                />
              </filter>
            </defs>
          </svg>
        )}
      </div>
    </div>
  );
};

const cardBaseStyle = {
  flex: "1 1 0",
  width: "100%",
  height: CARD_MIN_H,
  minWidth: 0,
  minHeight: CARD_MIN_H,
  borderRadius: 32,
  background:
    "linear-gradient(180deg, rgba(148,255,212,0.18) 0.09%, rgba(55,69,82,0.21) 21.85%, rgba(11,11,20,0.52) 58.17%)",
  boxShadow:
    "0px 0px 16px 0px rgba(248,248,248,0.13) inset, 0px 0px 16px 0px #FFF2 inset, 0px 24px 24px -7px rgba(18,18,18,0.28)",
  backdropFilter: "blur(36px)",
  WebkitBackdropFilter: "blur(36px)",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  padding: CARD_PADDING,
  position: "relative" as const,
  boxSizing: "border-box" as const,
};

const donutData = [
  { label: "Sales", value: 20, color: "#5BE49B" },
  { label: "Marketing", value: 18, color: "#FF87FD" },
  { label: "Engineering", value: 15, color: "#FF5C5C" },
  { label: "HR", value: 12, color: "#61F3F3" },
  { label: "Finance", value: 10, color: "#FFD666" },
];

// Figma-inspired color pairs for gradients
const donutColorPairs = [
  { from: "#5BE49B", to: "#007867" }, // Green
  { from: "#FF87FD", to: "#923390" }, // Pink
  { from: "#FF5C5C", to: "#B71D18" }, // Red (Engineering, adapted from orange)
  { from: "#61F3F3", to: "#006C9C" }, // Cyan (HR)
  { from: "#FFD666", to: "#B76E00" }, // Yellow (Finance)
];

function getDonutArcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  // Convert angles to radians
  const start = ((startAngle - 90) * Math.PI) / 180;
  const end = ((endAngle - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  // Sweep-flag 0 for anti-clockwise
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2}`;
}

function lightenColor(hex: string, percent: number) {
  // Simple lighten: blend with white
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) + Math.round((255 - (num >> 16)) * percent);
  let g =
    ((num >> 8) & 0x00ff) + Math.round((255 - ((num >> 8) & 0x00ff)) * percent);
  let b = (num & 0x0000ff) + Math.round((255 - (num & 0x0000ff)) * percent);
  r = Math.min(255, r);
  g = Math.min(255, g);
  b = Math.min(255, b);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function darkenColor(hex: string, percent: number) {
  // Simple darken: blend with black
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) - Math.round((num >> 16) * percent);
  let g = ((num >> 8) & 0x00ff) - Math.round(((num >> 8) & 0x00ff) * percent);
  let b = (num & 0x0000ff) - Math.round((num & 0x0000ff) * percent);
  r = Math.max(0, r);
  g = Math.max(0, g);
  b = Math.max(0, b);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const ChartDonutCard: React.FC<ChartDonutCardProps> = ({
  loading = false,
  isDummy = false,
  chartData,
}) => {
  const { theme } = useTheme();
  // Donut chart
  const donutSize = 192;
  const donutRadius = donutSize / 2 - 12; // leave room for stroke
  const donutStroke = 28;
  const cx = donutSize / 2;
  const cy = donutSize / 2;
  let total = 0;
  let donutArcs: {
    path: string;
    color: string;
    gradId: string;
    startAngle: number;
    endAngle: number;
    midAngle: number;
    label: string;
    value: number;
  }[] = [];

  if (chartData && chartData.data && chartData.data.length > 0) {
    // Process real data for donut chart
    const processedData = chartData.data
      .slice(0, 5)
      .map((item: any, i: number) => ({
        label: item.name || item.label || `Item ${i + 1}`,
        value:
          typeof item.value === "number" ? item.value : Number(item.value) || 0,
        color: donutColorPairs[i % donutColorPairs.length].from,
      }));

    total = processedData.reduce((sum: number, d: any) => sum + d.value, 0);
    const gapDeg = 2; // degrees of gap between segments
    let antiAngle = 0;
    donutArcs = processedData.map((d: any, i: number) => {
      const valueAngle = (d.value / total) * 360 - gapDeg;
      const startAngle = antiAngle;
      const endAngle = antiAngle - valueAngle;
      const path = getDonutArcPath(cx, cy, donutRadius, startAngle, endAngle);
      antiAngle = endAngle - gapDeg; // add gap before next segment
      const gradId = `donut-grad-${i}`;
      const midAngle = (startAngle + endAngle) / 2 - 90;
      return {
        path,
        color: d.color,
        gradId,
        startAngle,
        endAngle,
        midAngle,
        label: d.label,
        value: d.value,
      };
    });
  } else {
    total = donutData.reduce((sum, d) => sum + d.value, 0);
    const gapDeg = 2; // degrees of gap between segments
    let antiAngle = 0;
    donutArcs = donutData.map((d, i) => {
      const valueAngle = (d.value / total) * 360 - gapDeg;
      const startAngle = antiAngle;
      const endAngle = antiAngle - valueAngle;
      const path = getDonutArcPath(cx, cy, donutRadius, startAngle, endAngle);
      antiAngle = endAngle - gapDeg; // add gap before next segment
      const gradId = `donut-grad-${i}`;
      const midAngle = (startAngle + endAngle) / 2 - 90;
      return {
        path,
        color: d.color,
        gradId,
        startAngle,
        endAngle,
        midAngle,
        label: d.label,
        value: d.value,
      };
    });
  }

  // For the first segment, calculate the start point for the cap
  const firstArc = donutArcs[0];
  const firstStartRad = ((firstArc.startAngle - 90) * Math.PI) / 180;
  const firstStartX = cx + donutRadius * Math.cos(firstStartRad);
  const firstStartY = cy + donutRadius * Math.sin(firstStartRad);

  // OUTER GLOW WRAPPER
  return (
    <div
      style={{
        borderRadius: 36,
        padding: 3,
        background:
          theme === "dark"
            ? "linear-gradient(0deg, #FF87FD33 0%, rgba(43,32,58,0.98) 60%, rgba(43,32,58,1) 100%)"
            : "#fff",
        border: theme === "dark" ? "none" : "1.5px solid #e5e7eb",
        boxShadow:
          theme === "dark"
            ? "0 8px 48px 12px #FF87FD33, 0 0px 0px 0px #FF87FD33"
            : "0 2px 12px 0 rgba(0,0,0,0.06)",
        width: 336,
        height: 392,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        filter: "none",
      }}
    >
      <div
        style={{
          borderRadius: 32,
          background:
            theme === "dark"
              ? "linear-gradient(180deg, #2B203A 0%, #FF87FD33 100%)"
              : "#fff",
          width: 330,
          height: 386,
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          position: "relative",
          boxShadow: "none",
        }}
      >
        {/* Title */}
        <div
          style={{
            width: "100%",
            marginTop: 32,
            marginBottom: 0,
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          <span
            style={{
              color: theme === "dark" ? "#fff" : "#1a2b22",
              fontWeight: 400,
              fontSize: 14,
              letterSpacing: 0.1,
            }}
          >
            {chartData?.key
              ? `${chartData.key} Distribution`
              : "Total Statistics"}
          </span>
        </div>
        {/* Donut Chart */}
        <div
          style={{
            width: donutSize,
            height: donutSize,
            margin: "18px 0 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // opacity: isDummy ? 0.4 : 1,
            transition: "opacity 0.3s",
          }}
        >
          <svg
            width={donutSize}
            height={donutSize}
            viewBox={`0 0 ${donutSize} ${donutSize}`}
            style={{
              display: "block",
              filter: "drop-shadow(0 0 32px #FF87FD88)",
              borderRadius: "50%",
              overflow: "visible",
              transform: "rotate(-90deg)",
            }}
          >
            <defs>
              {donutArcs.map((arc, i) => {
                const colorPair = donutColorPairs[i % donutColorPairs.length];
                const lightFrom = lightenColor(colorPair.from, 0.18);
                const lightTo = lightenColor(colorPair.to, 0.18);
                return (
                  <linearGradient
                    key={arc.gradId}
                    id={arc.gradId}
                    gradientUnits="userSpaceOnUse"
                    x1={
                      cx +
                      donutRadius *
                        Math.cos(((arc.startAngle - 90) * Math.PI) / 180)
                    }
                    y1={
                      cy +
                      donutRadius *
                        Math.sin(((arc.startAngle - 90) * Math.PI) / 180)
                    }
                    x2={
                      cx +
                      donutRadius *
                        Math.cos(((arc.endAngle - 90) * Math.PI) / 180)
                    }
                    y2={
                      cy +
                      donutRadius *
                        Math.sin(((arc.endAngle - 90) * Math.PI) / 180)
                    }
                  >
                    <stop
                      offset="0%"
                      stopColor={lightFrom}
                      stopOpacity="0.98"
                    />
                    <stop
                      offset="100%"
                      stopColor={lightTo}
                      stopOpacity="0.98"
                    />
                  </linearGradient>
                );
              })}
            </defs>
            {/* Draw a circle at the start of the first segment to simulate the round cap (drawn BEFORE arcs) */}
            <circle
              cx={firstStartX}
              cy={firstStartY}
              r={donutStroke / 2}
              fill={lightenColor(donutColorPairs[0].from, 0.18)}
              style={{
                filter: `drop-shadow(0 0 12px ${lightenColor(
                  donutColorPairs[0].from,
                  0.18
                )}66) drop-shadow(0 0 24px ${lightenColor(
                  donutColorPairs[0].from,
                  0.18
                )}33)`,
              }}
              opacity={0.98}
            />
            {/* Donut segments as stroked arcs with rounded ends and gradient */}
            {donutArcs.map((arc, i) => (
              <path
                key={i}
                d={arc.path}
                fill="none"
                stroke={`url(#${arc.gradId})`}
                strokeWidth={donutStroke}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 12px ${lightenColor(
                    donutColorPairs[i % donutColorPairs.length].from,
                    0.18
                  )}66) drop-shadow(0 0 24px ${lightenColor(
                    donutColorPairs[i % donutColorPairs.length].from,
                    0.18
                  )}33)`,
                }}
              />
            ))}
          </svg>
        </div>
        {/* Legend */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: 18,
            marginTop: 18,
            marginBottom: 0,
            // opacity: isDummy ? 0.4 : 1,
            transition: "opacity 0.3s",
          }}
        >
          {donutArcs.map((arc, i) => (
            <div
              key={arc.color}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                margin: "4px 10px",
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: lightenColor(
                    donutColorPairs[i % donutColorPairs.length].from,
                    0.18
                  ),
                  display: "inline-block",
                  marginRight: 4,
                  boxShadow: `0 0 8px ${lightenColor(
                    donutColorPairs[i % donutColorPairs.length].from,
                    0.18
                  )}55`,
                }}
              />
              <span
                style={{
                  color: theme === "dark" ? "#fff" : "#1a2b22",
                  fontSize: 15,
                  fontWeight: 500,
                  opacity: 0.92,
                }}
              >
                {arc.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const barData = [80, 55, 90, 60, 70, 65, 30];
const barMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const barYTicks = [0, 20, 40, 60, 80, 100];

const ChartBarCard: React.FC<ChartBarCardProps> = ({
  loading = false,
  isDummy = false,
  chartData,
}) => {
  const { theme } = useTheme();
  // Card style
  const cardStyle = {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    flex: "1 0 0",
    alignSelf: "stretch",
    borderRadius: 32,
    background:
      theme === "dark"
        ? "linear-gradient(180deg, rgba(0, 191, 111, 0.25) 0%, rgba(0, 191, 111, 0.09) 52.11%, rgba(0, 191, 111, 0.02) 100%)"
        : "#fff",
    border:
      theme === "dark"
        ? "3px solid rgba(0, 191, 111, 0.27)"
        : "1.5px solid #e1f4ea",
    backdropFilter: theme === "dark" ? "blur(32px)" : undefined,
    WebkitBackdropFilter: theme === "dark" ? "blur(32px)" : undefined,
    minWidth: 0,
    minHeight: 0,
    position: "relative" as const,
    boxSizing: "border-box" as const,
    width: 260,
    height: 386,
    padding: 24,
    boxShadow: theme === "dark" ? "none" : "0 2px 12px 0 rgba(0,0,0,0.06)",
  };
  // Bar chart dimensions
  const chartW = 360;
  const chartH = 194;
  const barW = 22;
  const barGap = 18;
  let maxY = 100;
  let barDataToUse: number[] = [];
  let barMonthsToUse: string[] = [];

  if (chartData && chartData.data && chartData.data.length > 0) {
    // Limit to last 8 data points for readability
    const limitedData = chartData.data.slice(-8);
    console.log("limitedData", limitedData);
    console.log("chartData.data", chartData.data);
    barDataToUse = limitedData.map((item: any) => {
      const value = item[chartData.key] || item.value;
      return typeof value === "number" ? value : Number(value) || 0;
    });
    barMonthsToUse = limitedData.map(
      (item: any) =>
        item.name || item.label || `Item ${chartData.data.indexOf(item) + 1}`
    );
    maxY = Math.max(...barDataToUse, 1);
  } else {
    barDataToUse = barData;
    barMonthsToUse = barMonths;
    maxY = Math.max(...barData, 1);
  }

  return (
    <div style={{ ...cardStyle, overflow: "hidden" }}>
      <span
        style={{
          color: theme === "dark" ? "#fff" : "#1a2b22",
          fontWeight: 400,
          fontSize: 14,
          marginBottom: 8,
          letterSpacing: 0.1,
          alignSelf: "flex-start",
        }}
      >
        {chartData?.key ? `${chartData.key} Overview` : "Total Statistics"}
      </span>
      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Shimmer width={chartW} height={chartH + 16} borderRadius={16} />
        ) : (
          <>
            {/* Y-axis labels */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: chartH,
                marginRight: 12,
                alignItems: "flex-end",
                paddingBottom: 16,
              }}
            >
              {(() => {
                const maxValue = Math.max(...barDataToUse, 1);
                const minValue = Math.min(...barDataToUse, 0);
                const range = maxValue - minValue;
                const step = range / 5;
                const ticks = Array.from({ length: 6 }, (_, i) =>
                  Math.round(minValue + i * step)
                );
                return ticks
                  .slice()
                  .reverse()
                  .map((tick) => (
                    <span
                      key={tick}
                      style={{
                        color: theme === "dark" ? "#fff" : "#1a2b22",
                        fontSize: 14,
                        fontWeight: 600,
                        opacity: 0.85,
                        height: 1,
                        lineHeight: 1,
                      }}
                    >
                      {tick}
                    </span>
                  ));
              })()}
            </div>
            {/* Bar chart area */}
            <div
              style={{
                position: "relative",
                width: chartW,
                height: chartH + 16,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                paddingBottom: 16,
                opacity: isDummy ? 0.4 : 1,
                transition: "opacity 0.3s",
              }}
            >
              {/* Bars */}
              {barDataToUse.map((val, i) => {
                const h = (val / maxY) * chartH;
                return (
                  <div
                    key={i}
                    style={{
                      width: barW,
                      height: h,
                      borderRadius: "4px 4px 0px 0px",
                      background:
                        "linear-gradient(180deg, #FF87FD 28.98%, #923390 85.97%)",
                      boxShadow:
                        "0px 0px 12px -1.34px rgba(255, 135, 253, 0.88)",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      marginLeft: i === 0 ? 0 : barGap,
                      transition: "height 0.3s cubic-bezier(.4,2,.6,1)",
                    }}
                  />
                );
              })}
              {/* X-axis labels (months) */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: -22,
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  pointerEvents: "none",
                }}
              >
                {barMonthsToUse.map((month, i) => (
                  <span
                    key={month}
                    style={{
                      color: theme === "dark" ? "#fff" : "#1a2b22",
                      fontSize: 14,
                      fontWeight: 500,
                      opacity: 0.85,
                      width: barW,
                      textAlign: "center" as const,
                      marginLeft: i === 0 ? 0 : barGap,
                      pointerEvents: "none",
                    }}
                  >
                    {month.length > 6 ? month.slice(0, 6) + "..." : month}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const GraphsRow: React.FC<GraphsRowProps> = ({
  chartData,
  loading = false,
  isDummy = false,
}) => (
  <div
    style={{ display: "flex", width: "100%", gap: 24, minHeight: CARD_MIN_H }}
  >
    <ChartLineCard
      loading={loading}
      isDummy={isDummy || !chartData?.line}
      chartData={chartData?.line}
    />
    <ChartDonutCard
      loading={loading}
      isDummy={isDummy || !chartData?.pie}
      chartData={chartData?.pie}
    />
    <ChartBarCard
      loading={loading}
      isDummy={isDummy || !chartData?.bar}
      chartData={chartData?.bar}
    />
  </div>
);

export default ChartLineCard;
