import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Clock, Heart } from "lucide-react";
import { format } from "date-fns";

interface Session {
  id: string;
  category: string;
  day: string;
  start_datetime: string;
  end_datetime: string;
  average_hr: number;
}

interface SessionsListProps {
  sessions: Session[];
}

export function SessionsList({ sessions }: SessionsListProps) {
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'guided':
        return 'bg-primary/20 text-primary';
      case 'unguided':
        return 'bg-secondary/20 text-secondary';
      case 'breathing':
        return 'bg-accent/20 text-accent';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Meditation & Rest Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No sessions found. Try some meditation or breathing exercises!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Meditation & Rest Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.slice(0, 5).map((session) => {
          const duration = new Date(session.end_datetime).getTime() - new Date(session.start_datetime).getTime();
          const durationMinutes = Math.round(duration / (1000 * 60));

          return (
            <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Brain className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium capitalize">{session.category} Session</h4>
                    <Badge variant="outline" className={getCategoryColor(session.category)}>
                      {session.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(session.day), 'MMM dd')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {durationMinutes}m
                  </div>
                  {session.average_hr > 0 && (
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {session.average_hr} bpm
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