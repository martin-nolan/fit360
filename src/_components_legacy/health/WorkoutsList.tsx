import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, Zap, MapPin } from "lucide-react";
import { format } from "date-fns";

interface Workout {
  id: string;
  activity: string;
  intensity: string;
  calories: number;
  distance: number;
  label: string;
  day: string;
  start_datetime: string;
  end_datetime: string;
}

interface WorkoutsListProps {
  workouts: Workout[];
}

export function WorkoutsList({ workouts }: WorkoutsListProps) {
  const getIntensityColor = (intensity: string) => {
    switch (intensity?.toLowerCase()) {
      case 'easy':
        return 'bg-success/20 text-success';
      case 'moderate':
        return 'bg-warning/20 text-warning';
      case 'hard':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getActivityIcon = (activity: string) => {
    // You can expand this with more specific icons based on activity type
    return Dumbbell;
  };

  if (workouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Recent Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No workouts found. Start exercising to see your activity here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Recent Workouts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {workouts.slice(0, 5).map((workout) => {
          const ActivityIcon = getActivityIcon(workout.activity);
          const duration = new Date(workout.end_datetime).getTime() - new Date(workout.start_datetime).getTime();
          const durationMinutes = Math.round(duration / (1000 * 60));

          return (
            <div key={workout.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <ActivityIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium capitalize">{workout.activity}</h4>
                    <Badge variant="outline" className={getIntensityColor(workout.intensity)}>
                      {workout.intensity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {workout.label || format(new Date(workout.day), 'MMM dd')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {durationMinutes}m
                  </div>
                  {workout.calories > 0 && (
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {Math.round(workout.calories)} cal
                    </div>
                  )}
                  {workout.distance > 0 && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {(workout.distance / 1000).toFixed(1)} km
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}