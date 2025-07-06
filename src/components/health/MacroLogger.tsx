import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save } from "lucide-react";

interface MacroEntry {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroLoggerProps {
  onSave?: (entry: MacroEntry & { date: string }) => void;
}

export function MacroLogger({ onSave }: MacroLoggerProps) {
  const [entry, setEntry] = useState<MacroEntry>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const { toast } = useToast();

  const handleInputChange = (field: keyof MacroEntry, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEntry(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleSave = () => {
    if (entry.calories === 0) {
      toast({
        title: "Invalid Entry",
        description: "Please enter at least the total calories.",
        variant: "destructive"
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    onSave?.({
      ...entry,
      date: today
    });

    toast({
      title: "Macros Logged",
      description: `Successfully logged ${entry.calories} calories for today.`,
    });

    // Reset form
    setEntry({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });
  };

  const totalMacroCalories = (entry.protein * 4) + (entry.carbs * 4) + (entry.fat * 9);
  const macroCaloriesDiff = entry.calories - totalMacroCalories;

  return (
    <Card className="shadow-health animate-metric-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Log Daily Macros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="calories">Total Calories</Label>
            <Input
              id="calories"
              type="number"
              value={entry.calories || ""}
              onChange={(e) => handleInputChange("calories", e.target.value)}
              placeholder="2000"
              className="text-center font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="protein">Protein (g)</Label>
            <Input
              id="protein"
              type="number"
              value={entry.protein || ""}
              onChange={(e) => handleInputChange("protein", e.target.value)}
              placeholder="150"
              className="text-center font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carbs">Carbs (g)</Label>
            <Input
              id="carbs"
              type="number"
              value={entry.carbs || ""}
              onChange={(e) => handleInputChange("carbs", e.target.value)}
              placeholder="200"
              className="text-center font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fat">Fat (g)</Label>
            <Input
              id="fat"
              type="number"
              value={entry.fat || ""}
              onChange={(e) => handleInputChange("fat", e.target.value)}
              placeholder="70"
              className="text-center font-mono"
            />
          </div>
        </div>

        {totalMacroCalories > 0 && (
          <div className="bg-muted rounded-lg p-3 text-sm">
            <div className="flex justify-between items-center">
              <span>Macro calories:</span>
              <span className="font-mono">{totalMacroCalories.toFixed(0)}</span>
            </div>
            {Math.abs(macroCaloriesDiff) > 10 && (
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Difference:</span>
                <span className={`font-mono ${macroCaloriesDiff > 0 ? 'text-warning' : 'text-primary'}`}>
                  {macroCaloriesDiff > 0 ? '+' : ''}{macroCaloriesDiff.toFixed(0)}
                </span>
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={handleSave} 
          className="w-full bg-gradient-primary hover:opacity-90"
          disabled={entry.calories === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Today's Macros
        </Button>
      </CardContent>
    </Card>
  );
}