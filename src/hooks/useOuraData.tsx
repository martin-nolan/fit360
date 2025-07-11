import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OuraMetrics {
  sleepScore: number | null;
  readinessScore: number | null;
  steps: number | null;
  activeCalories: number | null;
  totalCalories: number | null;
  activityScore: number | null;
  stressScore: number | null;
  resilienceScore: number | null;
  cardiovascularAge: number | null;
  vo2Max: number | null;
  restingHeartRate: number | null;
}

interface OuraPersonalInfo {
  age: number | null;
  biologicalSex: string | null;
  height: number | null;
  weight: number | null;
  country: string | null;
  ringModel: string | null;
}

interface OuraWorkout {
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

interface OuraSession {
  id: string;
  category: string;
  day: string;
  start_datetime: string;
  end_datetime: string;
  average_hr: number;
}

interface OuraTag {
  id: string;
  day: string;
  text: string;
  tags: string[];
  comment?: string;
}

interface ChartDataPoint {
  date: string;
  value: number;
}

export function useOuraData() {
  const [metrics, setMetrics] = useState<OuraMetrics>({
    sleepScore: null,
    readinessScore: null,
    steps: null,
    activeCalories: null,
    totalCalories: null,
    activityScore: null,
    stressScore: null,
    resilienceScore: null,
    cardiovascularAge: null,
    vo2Max: null,
    restingHeartRate: null,
  });
  const [personalInfo, setPersonalInfo] = useState<OuraPersonalInfo>({
    age: null,
    biologicalSex: null,
    height: null,
    weight: null,
    country: null,
    ringModel: null,
  });
  const [workouts, setWorkouts] = useState<OuraWorkout[]>([]);
  const [sessions, setSessions] = useState<OuraSession[]>([]);
  const [tags, setTags] = useState<OuraTag[]>([]);
  const [chartData, setChartData] = useState<{
    sleep: ChartDataPoint[];
    readiness: ChartDataPoint[];
    steps: ChartDataPoint[];
    stress: ChartDataPoint[];
    resilience: ChartDataPoint[];
  }>({
    sleep: [],
    readiness: [],
    steps: [],
    stress: [],
    resilience: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const syncOuraData = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('oura-sync');
      
      if (error) {
        throw error;
      }

      toast({
        title: "Sync successful",
        description: "Your Oura data has been updated.",
      });

      // Refresh data after sync
      await fetchMetrics();
    } catch (error) {
      console.error('Error syncing Oura data:', error);
      toast({
        title: "Sync failed",
        description: "Could not sync your Oura data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const today = new Date().toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch latest metrics - get most recent data for each metric type
      const { data: latestMetrics, error: latestError } = await supabase
        .from('metrics')
        .select('type, value, timestamp')
        .eq('user_id', user.user.id)
        .eq('source', 'oura')
        .gte('timestamp', monthAgo)
        .order('timestamp', { ascending: false });

      if (latestError) {
        console.error('Error fetching latest metrics:', latestError);
      } else {
        // Get the most recent value for each metric type
        const metricsMap: { [key: string]: number } = {};
        latestMetrics?.forEach(metric => {
          if (!metricsMap[metric.type]) {
            metricsMap[metric.type] = metric.value;
          }
        });

        setMetrics({
          sleepScore: metricsMap.sleep_score || null,
          readinessScore: metricsMap.readiness_score || null,
          steps: metricsMap.steps || null,
          activeCalories: metricsMap.active_calories || null,
          totalCalories: metricsMap.total_calories || null,
          activityScore: metricsMap.activity_score || null,
          stressScore: metricsMap.stress_score || null,
          resilienceScore: metricsMap.resilience_score || null,
          cardiovascularAge: metricsMap.cardiovascular_age || null,
          vo2Max: metricsMap.vo2_max || null,
          restingHeartRate: metricsMap.resting_heart_rate || null,
        });
      }

      // Fetch month chart data for trends
      const { data: chartMetrics, error: chartError } = await supabase
        .from('metrics')
        .select('type, value, timestamp')
        .eq('user_id', user.user.id)
        .eq('source', 'oura')
        .gte('timestamp', monthAgo)
        .lte('timestamp', today)
        .in('type', ['sleep_score', 'readiness_score', 'steps', 'stress_score', 'resilience_score'])
        .order('timestamp', { ascending: true });

      if (chartError) {
        console.error('Error fetching chart metrics:', chartError);
      } else {
        const sleepData: ChartDataPoint[] = [];
        const readinessData: ChartDataPoint[] = [];
        const stepsData: ChartDataPoint[] = [];
        const stressData: ChartDataPoint[] = [];
        const resilienceData: ChartDataPoint[] = [];

        chartMetrics?.forEach(metric => {
          const dataPoint = { date: metric.timestamp, value: metric.value };
          
          switch (metric.type) {
            case 'sleep_score':
              sleepData.push(dataPoint);
              break;
            case 'readiness_score':
              readinessData.push(dataPoint);
              break;
            case 'steps':
              stepsData.push(dataPoint);
              break;
            case 'stress_score':
              stressData.push(dataPoint);
              break;
            case 'resilience_score':
              resilienceData.push(dataPoint);
              break;
          }
        });

        setChartData({
          sleep: sleepData,
          readiness: readinessData,
          steps: stepsData,
          stress: stressData,
          resilience: resilienceData,
        });
      }

      // Fetch personal info
      const { data: personalData, error: personalError } = await supabase
        .from('oura_personal_info')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (!personalError && personalData) {
        setPersonalInfo({
          age: personalData.age,
          biologicalSex: personalData.biological_sex,
          height: personalData.height,
          weight: personalData.weight,
          country: personalData.country,
          ringModel: personalData.ring_model,
        });
      }

      // Fetch recent workouts
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('oura_workouts')
        .select('*')
        .eq('user_id', user.user.id)
        .gte('day', monthAgo)
        .order('day', { ascending: false });

      if (!workoutsError && workoutsData) {
        setWorkouts(workoutsData.map(w => ({
          id: w.oura_workout_id,
          activity: w.activity,
          intensity: w.intensity,
          calories: w.calories,
          distance: w.distance,
          label: w.label,
          day: w.day,
          start_datetime: w.start_datetime,
          end_datetime: w.end_datetime,
        })));
      }

      // Fetch recent sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('oura_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .gte('day', monthAgo)
        .order('day', { ascending: false });

      if (!sessionsError && sessionsData) {
        setSessions(sessionsData.map(s => ({
          id: s.oura_session_id,
          category: s.category,
          day: s.day,
          start_datetime: s.start_datetime,
          end_datetime: s.end_datetime,
          average_hr: s.average_hr,
        })));
      }

      // Fetch recent tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('oura_tags')
        .select('*')
        .eq('user_id', user.user.id)
        .gte('day', monthAgo)
        .order('day', { ascending: false });

      if (!tagsError && tagsData) {
        setTags(tagsData.map(t => ({
          id: t.oura_tag_id,
          day: t.day,
          text: t.text,
          tags: t.tags,
          comment: t.comment,
        })));
      }
    } catch (error) {
      console.error('Error fetching Oura data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    personalInfo,
    workouts,
    sessions,
    tags,
    chartData,
    isLoading,
    isSyncing,
    syncOuraData,
    refetch: fetchMetrics,
  };
}