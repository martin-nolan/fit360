import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "accent";
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  variant = "default",
  trend,
  className
}: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-primary text-primary-foreground border-primary/20 shadow-health";
      case "secondary":
        return "bg-gradient-secondary text-secondary-foreground border-secondary/20 shadow-health";
      case "success":
        return "bg-gradient-to-br from-success to-success/80 text-success-foreground border-success/20 shadow-health";
      case "warning":
        return "bg-gradient-to-br from-warning to-warning/80 text-warning-foreground border-warning/20 shadow-health";
      case "accent":
        return "bg-gradient-accent text-accent-foreground border-accent/20 shadow-health";
      default:
        return "bg-gradient-card border-border shadow-health";
    }
  };

  const getTrendColor = () => {
    if (!trend) return "";
    switch (trend.direction) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={cn(
      "group hover:shadow-metric transition-all duration-300 hover:scale-[1.02] animate-metric-slide-up",
      getVariantStyles(),
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium opacity-90">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-1">
          <div className="text-2xl font-bold metric-number">
            {value}
          </div>
          {unit && (
            <span className="text-sm opacity-70 font-medium">
              {unit}
            </span>
          )}
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center justify-between mt-2">
            {subtitle && (
              <p className="text-xs opacity-70">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className={cn("text-xs font-medium", getTrendColor())}>
                {trend.direction === "up" ? "↗" : trend.direction === "down" ? "↘" : "→"} {trend.value}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}