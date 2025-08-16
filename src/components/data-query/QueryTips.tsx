import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface QueryTip {
  text: string;
  category?: string;
}

interface QueryTipsProps {
  tips: QueryTip[];
  title?: string;
  icon?: React.ReactNode;
}

export function QueryTips({ 
  tips, 
  title = "Query Tips",
  icon = <Lightbulb className="h-5 w-5" />
}: QueryTipsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {tip.text}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 