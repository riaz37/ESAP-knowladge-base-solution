import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCard {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface QueryStatsCardsProps {
  stats: StatCard[];
  columns?: 2 | 3 | 4 | 5;
}

export function QueryStatsCards({ stats, columns = 5 }: QueryStatsCardsProps) {
  const getGridCols = () => {
    switch (columns) {
      case 2: return "grid-cols-1 md:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      case 5: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-5";
      default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-5";
    }
  };

  return (
    <div className={`grid ${getGridCols()} gap-6`}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
            {stat.trend && (
              <div className="flex items-center mt-2">
                <span className={`text-xs ${
                  stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">from last month</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 