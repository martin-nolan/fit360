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
  metrics?: any;
  workouts?: any[];
  sessions?: any[];
}

export function AIInsights({ 
  insights = [], 
  isLoading = false, 
  className, 
  metrics, 
  workouts = [],
  sessions = []
}: AIInsightsProps) {
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

  const generateInsights = (): Insight[] => {
    const generatedInsights: Insight[] = [];
    
    // Sleep insights
    if (metrics?.sleepScore) {
      const sleepScore = metrics.sleepScore;
      let sleepContent = "";
      let sleepConfidence = 85;
      
      if (sleepScore >= 85) {
        sleepContent = `Excellent sleep score of ${sleepScore}/100! Your body is well-recovered and ready for high-intensity training.`;
        sleepConfidence = 95;
      } else if (sleepScore >= 70) {
        sleepContent = `Good sleep score of ${sleepScore}/100. Consider going to bed 30 minutes earlier to optimize recovery.`;
        sleepConfidence = 88;
      } else {
        sleepContent = `Sleep score of ${sleepScore}/100 indicates poor recovery. Prioritize 7-9 hours of sleep tonight.`;
        sleepConfidence = 92;
      }
      
      generatedInsights.push({
        id: "sleep",
        type: "daily",
        title: "Sleep Analysis",
        content: sleepContent,
        confidence: sleepConfidence,
        category: "sleep",
        date: new Date().toISOString()
      });
    }

    // Readiness insights
    if (metrics?.readinessScore) {
      const readiness = metrics.readinessScore;
      let readinessContent = "";
      
      if (readiness >= 85) {
        readinessContent = `Outstanding readiness score of ${readiness}/100! Perfect day for challenging workouts or setting PRs.`;
      } else if (readiness >= 70) {
        readinessContent = `Moderate readiness of ${readiness}/100. Light to moderate exercise recommended today.`;
      } else {
        readinessContent = `Low readiness of ${readiness}/100. Focus on recovery activities like walking or gentle stretching.`;
      }
      
      generatedInsights.push({
        id: "readiness",
        type: "daily",
        title: "Training Readiness",
        content: readinessContent,
        confidence: 90,
        category: "recovery",
        date: new Date().toISOString()
      });
    }

    // Activity insights
    if (metrics?.steps) {
      const steps = metrics.steps;
      let activityContent = "";
      
      if (steps >= 10000) {
        activityContent = `Great job! You've taken ${steps.toLocaleString()} steps today, exceeding the 10,000 step goal.`;
      } else {
        const remaining = 10000 - steps;
        activityContent = `You're ${remaining.toLocaleString()} steps away from your 10,000 step goal. A 15-minute walk should get you there!`;
      }
      
      generatedInsights.push({
        id: "activity",
        type: "daily",
        title: "Daily Activity",
        content: activityContent,
        confidence: 95,
        category: "fitness",
        date: new Date().toISOString()
      });
    }

    // Stress insights
    if (metrics?.stressScore) {
      const stress = metrics.stressScore;
      let stressContent = "";
      
      if (stress <= 25) {
        stressContent = `Low stress level of ${stress}/100. Your body is managing stress well - great for recovery!`;
      } else if (stress <= 50) {
        stressContent = `Moderate stress level of ${stress}/100. Consider meditation or breathing exercises.`;
      } else {
        stressContent = `Elevated stress level of ${stress}/100. Prioritize relaxation and avoid intense training today.`;
      }
      
      generatedInsights.push({
        id: "stress",
        type: "daily",
        title: "Stress Management",
        content: stressContent,
        confidence: 87,
        category: "recovery",
        date: new Date().toISOString()
      });
    }

    // Workout insights
    if (workouts.length > 0) {
      const recentWorkout = workouts[0];
      const workoutContent = `Last workout: ${recentWorkout.activity} for ${recentWorkout.calories} calories. ${
        recentWorkout.intensity === 'high' ? 'High intensity session - ensure adequate recovery.' :
        recentWorkout.intensity === 'moderate' ? 'Good moderate intensity training.' :
        'Light session - consider increasing intensity when ready.'
      }`;
      
      generatedInsights.push({
        id: "workout",
        type: "weekly",
        title: "Workout Summary",
        content: workoutContent,
        confidence: 83,
        category: "fitness",
        date: new Date().toISOString()
      });
    }

    // Default insights if no data
    if (generatedInsights.length === 0) {
      return [
        {
          id: "sync",
          type: "recommendation",
          title: "Sync Your Data",
          content: "Connect your Oura ring and sync your data to get personalized AI insights based on your sleep, activity, and recovery metrics.",
          confidence: 100,
          category: "sleep",
          date: new Date().toISOString()
        }
      ];
    }

    return generatedInsights;
  };

  const displayInsights = insights.length > 0 ? insights : generateInsights();

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