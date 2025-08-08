import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 bg-gradient-360 rounded-full opacity-20 animate-spin-slow"></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-wellness bg-clip-text text-transparent">
              Your Full Circle
            </span>
            <br />
            <span className="text-foreground">of Fitness</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A unified dashboard turning health data into actionable AI insights.
            <br />
            <span className="text-primary font-medium">Health insights from every angle.</span>
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="px-8 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
            >
              Get Early Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg" 
              className="px-8 py-6 text-lg group hover:bg-primary/10"
            >
              <Play className="mr-2 h-5 w-5 group-hover:text-primary transition-colors" />
              Watch 90-sec Demo
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="pt-12 space-y-4">
            <p className="text-sm text-muted-foreground">
              Trusted by athletes and coaches worldwide
            </p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="text-xs font-medium">Oura</div>
              <div className="text-xs font-medium">Apple Health</div>
              <div className="text-xs font-medium">MyFitnessPal</div>
              <div className="text-xs font-medium">Garmin</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};