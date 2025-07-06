import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Calendar, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: "daily" | "weekly" | "recommendation";
  title: string;
  content: string;
  confidence?: number;
  category?: "sleep" | "fitness" | "nutrition" | "recovery";
  date: string;
}

interface AIInsightsProps {
  insights?: Insight[];
  isLoading?: boolean;
  className?: string;
}

export function AIInsights({ insights = [], isLoading = false, className }: AIInsightsProps) {
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "sleep":
        return "bg-gradient-to-r from-blue-500 to-purple-500";
      case "fitness":
        return "bg-gradient-primary";
      case "nutrition":
        return "bg-gradient-secondary";
      case "recovery":
        return "bg-gradient-accent";
      default:
        return "bg-gradient-wellness";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "daily":
        return Calendar;
      case "weekly":
        return TrendingUp;
      case "recommendation":
        return Lightbulb;
      default:
        return Brain;
    }
  };

  const mockInsights: Insight[] = [
    {
      id: "1",
      type: "daily",
      title: "Recovery Status",
      content: "Your HRV is 15% above baseline today, indicating excellent recovery. Consider a moderate-intensity workout to capitalize on your readiness.",
      confidence: 92,
      category: "recovery",
      date: new Date().toISOString()
    },
    {
      id: "2",
      type: "recommendation",
      title: "Sleep Optimization",
      content: "You've been averaging 6.2 hours of sleep this week. Aim for 7-8 hours to improve your readiness scores and workout performance.",
      confidence: 87,
      category: "sleep",
      date: new Date().toISOString()
    },
    {
      id: "3",
      type: "weekly",
      title: "Weight Loss Progress",
      content: "You're down 0.8 lbs this week while maintaining strength metrics. Your current deficit appears optimal for lean mass retention.",
      confidence: 89,
      category: "nutrition",
      date: new Date().toISOString()
    }
  ];

  const displayInsights = insights.length > 0 ? insights : mockInsights;

  if (isLoading) {
    return (
      <Card className={cn("shadow-health animate-pulse", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary animate-health-pulse" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-12 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-health animate-metric-slide-up", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary animate-health-pulse" />
          AI Insights
          <Badge variant="secondary" className="ml-auto">
            {displayInsights.length} insights
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayInsights.map((insight) => {
          const IconComponent = getTypeIcon(insight.type);
          
          return (
            <div
              key={insight.id}
              className="group p-4 rounded-lg border bg-gradient-card hover:shadow-health transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex-shrink-0 p-2 rounded-lg text-white",
                  getCategoryColor(insight.category)
                )}>
                  <IconComponent className="h-4 w-4" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      {insight.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      {insight.confidence && (
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2 py-0"
                        >
                          {insight.confidence}% confident
                        </Badge>
                      )}
                      <Badge 
                        variant="secondary"
                        className="text-xs px-2 py-0 capitalize"
                      >
                        {insight.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.content}
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    {new Date(insight.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}