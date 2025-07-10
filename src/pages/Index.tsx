import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { MetricCard } from "@/components/health/MetricCard";
import { HealthChart } from "@/components/health/HealthChart";
import { MacroLogger } from "@/components/health/MacroLogger";
import { ProgressPhotos } from "@/components/health/ProgressPhotos";
import { AIInsights } from "@/components/health/AIInsights";
import { WorkoutsList } from "@/components/health/WorkoutsList";
import { SessionsList } from "@/components/health/SessionsList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Moon, 
  Activity, 
  Scale, 
  Footprints, 
  Zap,
  Sun,
  MoonIcon,
  LogOut,
  User,
  BarChart3,
  TrendingUp,
  Camera,
  Utensils,
  Brain,
  RefreshCw
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { useOuraData } from "@/hooks/useOuraData";

const Index = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, signOut, loading } = useAuth();
  const { 
    metrics, 
    personalInfo, 
    workouts, 
    sessions, 
    tags, 
    chartData, 
    isLoading: ouraLoading, 
    isSyncing, 
    syncOuraData 
  } = useOuraData();

  useEffect(() => {
    setMounted(true);
    // Auto-sync on first load
    if (mounted && !ouraLoading) {
      syncOuraData();
    }
  }, [mounted, ouraLoading]);

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

  // Health data from Oura or fallback to mock data
  const healthData = {
    sleepScore: metrics.sleepScore ?? 85,
    readiness: metrics.readinessScore ?? 78,
    weight: 175.2, // This would come from manual input or other sources
    restingHR: 48, // This would come from HRV data in Oura
    hrv: 42, // This would come from HRV data in Oura
    steps: metrics.steps ?? 8547
  };

  // Generate recent mock chart data as fallback
  const generateRecentMockData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: 75 + Math.random() * 20
      });
    }
    return data;
  };

  const mockChartData = generateRecentMockData();

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
                onClick={syncOuraData}
                disabled={isSyncing}
                className="hover:bg-primary/10"
                title="Sync Oura data"
              >
                <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
              </Button>
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

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="today" className="space-y-6">
          <div className="flex items-center justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-6 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger value="today" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Today</span>
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Trends</span>
              </TabsTrigger>
              <TabsTrigger value="nutrition" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                <span className="hidden sm:inline">Nutrition</span>
              </TabsTrigger>
              <TabsTrigger value="wellness" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Wellness</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="today" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Today's Overview</h2>
              <p className="text-muted-foreground">Your current health metrics at a glance</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <MetricCard
                title="Sleep Score"
                value={healthData.sleepScore}
                unit="/100"
                icon={Moon}
                variant="primary"
                trend={{ direction: "up", value: "+3%" }}
              />
              <MetricCard
                title="Readiness"
                value={healthData.readiness}
                unit="/100"
                icon={Zap}
                variant="secondary"
                trend={{ direction: "down", value: "-2%" }}
              />
              <MetricCard
                title="Weight"
                value={healthData.weight}
                unit="lbs"
                icon={Scale}
                variant="success"
                trend={{ direction: "down", value: "-0.3 lbs" }}
              />
              <MetricCard
                title="Resting HR"
                value={healthData.restingHR}
                unit="bpm"
                icon={Heart}
                variant="accent"
                trend={{ direction: "neutral", value: "stable" }}
              />
              <MetricCard
                title="HRV"
                value={healthData.hrv}
                unit="ms"
                icon={Activity}
                variant="primary"
                trend={{ direction: "up", value: "+8%" }}
              />
              <MetricCard
                title="Steps"
                value={healthData.steps.toLocaleString()}
                icon={Footprints}
                variant="warning"
                subtitle="Goal: 10,000"
              />
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Trends & Analytics</h2>
              <p className="text-muted-foreground">Track your progress over time</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <HealthChart
                title="Sleep Score (7 days)"
                data={chartData.sleep.length > 0 ? chartData.sleep : mockChartData}
                color="hsl(var(--primary))"
                type="area"
                unit="/100"
              />
              <HealthChart
                title="Readiness Score (7 days)"
                data={chartData.readiness.length > 0 ? chartData.readiness : mockChartData.map(d => ({ ...d, value: 70 + Math.random() * 20 }))}
                color="hsl(var(--secondary))"
                type="area"
                unit="/100"
              />
              <HealthChart
                title="Steps (7 days)"
                data={chartData.steps.length > 0 ? chartData.steps : mockChartData.map(d => ({ ...d, value: 6000 + Math.random() * 4000 }))}
                color="hsl(var(--accent))"
                type="line"
                unit=""
              />
              <HealthChart
                title="Weight Trend (7 days)"
                data={mockChartData.map(d => ({ ...d, value: 175 + Math.random() * 2 }))}
                color="hsl(var(--success))"
                type="line"
                unit=" lbs"
              />
            </div>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Nutrition & Progress</h2>
              <p className="text-muted-foreground">Log your meals and track your physique</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <MacroLogger onSave={handleMacroSave} />
              <ProgressPhotos onUpload={handlePhotoUpload} />
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <WorkoutsList workouts={workouts} />
              <SessionsList sessions={sessions} />
            </div>
          </TabsContent>

          <TabsContent value="wellness" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Wellness Metrics</h2>
              <p className="text-muted-foreground">Advanced health and recovery data</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <MetricCard
                title="Stress"
                value={metrics.stressScore}
                unit="/100"
                icon={Zap}
                variant="warning"
                trend={{ direction: "down", value: "-5%" }}
              />
              <MetricCard
                title="Resilience"
                value={metrics.resilienceScore}
                unit="/100"
                icon={Activity}
                variant="success"
                trend={{ direction: "up", value: "+8%" }}
              />
              <MetricCard
                title="CV Age"
                value={metrics.cardiovascularAge}
                unit=" years"
                icon={Heart}
                variant="accent"
                trend={{ direction: "down", value: "-1 year" }}
              />
              <MetricCard
                title="VO2 Max"
                value={metrics.vo2Max}
                unit=" ml/kg/min"
                icon={Activity}
                variant="primary"
                trend={{ direction: "up", value: "+2%" }}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <HealthChart
                title="Stress Score (7 days)"
                data={chartData.stress.length > 0 ? chartData.stress : mockChartData}
                color="hsl(var(--warning))"
                type="area"
                unit="/100"
              />
              <HealthChart
                title="Resilience Score (7 days)"
                data={chartData.resilience.length > 0 ? chartData.resilience : mockChartData}
                color="hsl(var(--success))"
                type="area"
                unit="/100"
              />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Personal Information</h2>
              <p className="text-muted-foreground">Your Oura profile and device details</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-4">
                <MetricCard
                  title="Age"
                  value={personalInfo.age || "N/A"}
                  unit=" years"
                  icon={User}
                  variant="secondary"
                />
                <MetricCard
                  title="Height"
                  value={personalInfo.height ? Math.round(personalInfo.height) : "N/A"}
                  unit=" cm"
                  icon={BarChart3}
                  variant="secondary"
                />
                <MetricCard
                  title="Weight"
                  value={personalInfo.weight ? personalInfo.weight.toFixed(1) : "N/A"}
                  unit=" kg"
                  icon={Scale}
                  variant="secondary"
                />
                <MetricCard
                  title="Ring Model"
                  value={personalInfo.ringModel || "N/A"}
                  icon={User}
                  variant="secondary"
                />
              </div>
              
              {personalInfo.biologicalSex && (
                <div className="mt-4 p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    <strong>Sex:</strong> {personalInfo.biologicalSex}
                  </p>
                  {personalInfo.country && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Country:</strong> {personalInfo.country}
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">AI Insights</h2>
              <p className="text-muted-foreground">Personalized recommendations based on your data</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <AIInsights 
                insights={[]}
                isLoading={ouraLoading}
                metrics={metrics}
                workouts={workouts}
                sessions={sessions}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
