import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sun,
  MoonIcon,
  BarChart3,
  Brain,
  Shield,
  Zap,
  Activity,
  Heart
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, loading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!mounted) return null;

  const features = [
    {
      icon: BarChart3,
      title: "360° Data Aggregation",
      description: "Seamlessly connect Oura, Apple Health, MyFitnessPal, and more into one unified dashboard."
    },
    {
      icon: Brain,
      title: "AI-Generated Guidance", 
      description: "Get daily micro-summaries and weekly deep dives with personalized recommendations."
    },
    {
      icon: Shield,
      title: "Privacy-First Architecture",
      description: "GDPR-compliant, UK data residency, and complete control over your health data."
    }
  ];

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
            </div>
            <div className="flex items-center gap-2">
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
              <Button variant="outline" asChild>
                <a href="/auth">Sign In</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Health Insights from Every Angle
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stop juggling multiple apps. Fit360 brings your health data together and makes it actionable.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-border bg-card/50 backdrop-blur-sm hover:shadow-health transition-all duration-300">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Unified <span className="bg-gradient-wellness bg-clip-text text-transparent">Fitness Command Center</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See all your health metrics, trends, and AI insights in one beautiful interface.
            </p>
          </div>
          
          {/* Mock dashboard preview */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm text-muted-foreground ml-4">fit360.app</span>
                </div>
              </div>
              <div className="p-8 grid grid-cols-3 gap-6">
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Heart className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">48</div>
                      <div className="text-sm text-muted-foreground">Resting HR</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/10 border-secondary/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Zap className="h-8 w-8 text-secondary" />
                    <div>
                      <div className="text-2xl font-bold">85</div>
                      <div className="text-sm text-muted-foreground">Readiness</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-accent/10 border-accent/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Activity className="h-8 w-8 text-accent" />
                    <div>
                      <div className="text-2xl font-bold">42</div>
                      <div className="text-sm text-muted-foreground">HRV</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Complete Your Fitness Circle?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join athletes and coaches who've unified their health data with Fit360.
          </p>
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
            asChild
          >
            <a href="/auth">Get Early Access</a>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Free tier available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-bold bg-gradient-wellness bg-clip-text text-transparent">
                Fit360
              </h3>
              <p className="text-sm text-muted-foreground">
                Built in Edinburgh 🏴󠁧󠁢󠁳󠁣󠁴󠁿
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;