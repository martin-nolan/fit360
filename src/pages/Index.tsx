import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { MetricCard } from "@/components/health/MetricCard";
import { HealthChart } from "@/components/health/HealthChart";
import { MacroLogger } from "@/components/health/MacroLogger";
import { ProgressPhotos } from "@/components/health/ProgressPhotos";
import { AIInsights } from "@/components/health/AIInsights";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Moon, 
  Activity, 
  Scale, 
  Footprints, 
  Zap,
  Menu,
  Sun,
  MoonIcon,
  LogOut,
  User,
  BarChart3
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Mock health data - in real app this would come from APIs
  const mockHealthData = {
    sleepScore: 85,
    readiness: 78,
    weight: 175.2,
    restingHR: 48,
    hrv: 42,
    steps: 8547
  };

  // Mock 7-day chart data
  const chartData = [
    { date: '2024-01-01', value: 82 },
    { date: '2024-01-02', value: 79 },
    { date: '2024-01-03', value: 85 },
    { date: '2024-01-04', value: 88 },
    { date: '2024-01-05', value: 83 },
    { date: '2024-01-06', value: 90 },
    { date: '2024-01-07', value: 85 }
  ];

  const handleMacroSave = (entry: any) => {
    console.log('Macro entry saved:', entry);
    // In real app, save to Supabase
  };

  const handlePhotoUpload = (file: File) => {
    console.log('Photo uploaded:', file.name);
    // In real app, upload to Supabase storage
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-wellness bg-clip-text text-transparent">
                Fit360
              </h1>
              <p className="text-sm text-muted-foreground">
                Your Full Circle of Fitness
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:block">
                Welcome, {user.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hover:bg-primary/10"
              >
                {theme === "dark" ? 
                  <Sun className="h-5 w-5" /> : 
                  <MoonIcon className="h-5 w-5" />
                }
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Health Metrics Grid */}
        <section>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Today's Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard
              title="Sleep Score"
              value={mockHealthData.sleepScore}
              unit="/100"
              icon={Moon}
              variant="primary"
              trend={{ direction: "up", value: "+3%" }}
            />
            <MetricCard
              title="Readiness"
              value={mockHealthData.readiness}
              unit="/100"
              icon={Zap}
              variant="secondary"
              trend={{ direction: "down", value: "-2%" }}
            />
            <MetricCard
              title="Weight"
              value={mockHealthData.weight}
              unit="lbs"
              icon={Scale}
              variant="success"
              trend={{ direction: "down", value: "-0.3 lbs" }}
            />
            <MetricCard
              title="Resting HR"
              value={mockHealthData.restingHR}
              unit="bpm"
              icon={Heart}
              variant="accent"
              trend={{ direction: "neutral", value: "stable" }}
            />
            <MetricCard
              title="HRV"
              value={mockHealthData.hrv}
              unit="ms"
              icon={Activity}
              variant="primary"
              trend={{ direction: "up", value: "+8%" }}
            />
            <MetricCard
              title="Steps"
              value={mockHealthData.steps.toLocaleString()}
              icon={Footprints}
              variant="warning"
              subtitle="Goal: 10,000"
            />
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid md:grid-cols-2 gap-6">
          <HealthChart
            title="Sleep Score (7 days)"
            data={chartData}
            color="hsl(var(--primary))"
            type="area"
            unit="/100"
          />
          <HealthChart
            title="Weight Trend (7 days)"
            data={chartData.map(d => ({ ...d, value: 175 + Math.random() * 2 }))}
            color="hsl(var(--secondary))"
            type="line"
            unit=" lbs"
          />
        </section>

        {/* Bottom Grid */}
        <section className="grid lg:grid-cols-3 gap-6">
          <MacroLogger onSave={handleMacroSave} />
          <ProgressPhotos onUpload={handlePhotoUpload} />
          <AIInsights />
        </section>
      </div>
    </div>
  );
};

export default Index;
