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
  });
  const [chartData, setChartData] = useState<{
    sleep: ChartDataPoint[];
    readiness: ChartDataPoint[];
    steps: ChartDataPoint[];
  }>({
    sleep: [],
    readiness: [],
    steps: [],
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
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch latest metrics for today
      const { data: latestMetrics, error: latestError } = await supabase
        .from('metrics')
        .select('type, value, timestamp')
        .eq('user_id', user.user.id)
        .eq('source', 'oura')
        .gte('timestamp', today)
        .order('timestamp', { ascending: false });

      if (latestError) {
        console.error('Error fetching latest metrics:', latestError);
      } else {
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
        });
      }

      // Fetch 7-day chart data
      const { data: chartMetrics, error: chartError } = await supabase
        .from('metrics')
        .select('type, value, timestamp')
        .eq('user_id', user.user.id)
        .eq('source', 'oura')
        .gte('timestamp', weekAgo)
        .lte('timestamp', today)
        .in('type', ['sleep_score', 'readiness_score', 'steps'])
        .order('timestamp', { ascending: true });

      if (chartError) {
        console.error('Error fetching chart metrics:', chartError);
      } else {
        const sleepData: ChartDataPoint[] = [];
        const readinessData: ChartDataPoint[] = [];
        const stepsData: ChartDataPoint[] = [];

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
          }
        });

        setChartData({
          sleep: sleepData,
          readiness: readinessData,
          steps: stepsData,
        });
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
    chartData,
    isLoading,
    isSyncing,
    syncOuraData,
    refetch: fetchMetrics,
  };
}