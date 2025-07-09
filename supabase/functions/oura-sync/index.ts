import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OuraPersonalInfo {
  id: string;
  email: string;
  age: number;
  weight: number;
  height: number;
  biological_sex: string;
  timezone: string;
}

interface OuraSleepData {
  id: string;
  contributors: {
    deep_sleep: number;
    efficiency: number;
    latency: number;
    rem_sleep: number;
    restfulness: number;
    timing: number;
    total_sleep: number;
  };
  day: string;
  score: number;
  timestamp: string;
}

interface OuraReadinessData {
  id: string;
  contributors: {
    activity_balance: number;
    body_temperature: number;
    hrv_balance: number;
    previous_day_activity: number;
    previous_night: number;
    recovery_index: number;
    resting_heart_rate: number;
    sleep_balance: number;
  };
  day: string;
  score: number;
  timestamp: string;
}

interface OuraActivityData {
  id: string;
  class_5_min: string;
  score: number;
  active_calories: number;
  average_met_minutes: number;
  contributors: {
    meet_daily_targets: number;
    move_every_hour: number;
    recovery_time: number;
    stay_active: number;
    training_frequency: number;
    training_volume: number;
  };
  equivalent_walking_distance: number;
  high_activity_met_minutes: number;
  high_activity_time: number;
  inactivity_alerts: number;
  low_activity_met_minutes: number;
  low_activity_time: number;
  medium_activity_met_minutes: number;
  medium_activity_time: number;
  met: {
    interval: number;
    items: number[];
    timestamp: string;
  };
  meters_to_target: number;
  non_wear_time: number;
  resting_time: number;
  sedentary_met_minutes: number;
  sedentary_time: number;
  steps: number;
  target_calories: number;
  target_meters: number;
  total_calories: number;
  day: string;
  timestamp: string;
}

const OURA_API_BASE = 'https://api.ouraring.com/v2/usercollection';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Get Oura token from secrets (for now, we'll expect it to be configured)
    const ouraToken = Deno.env.get('OURA_PERSONAL_ACCESS_TOKEN')
    if (!ouraToken) {
      return new Response('Oura token not configured', { status: 400, headers: corsHeaders })
    }

    const headers = {
      'Authorization': `Bearer ${ouraToken}`,
      'Content-Type': 'application/json',
    }

    // Sync personal info
    const personalResponse = await fetch(`${OURA_API_BASE}/personal_info`, { headers })
    if (personalResponse.ok) {
      const personalData: OuraPersonalInfo = await personalResponse.json()
      console.log('Personal info synced:', personalData)
    }

    // Get today's date for data sync
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Sync sleep data
    const sleepResponse = await fetch(
      `${OURA_API_BASE}/daily_sleep?start_date=${weekAgo}&end_date=${today}`,
      { headers }
    )
    if (sleepResponse.ok) {
      const sleepData = await sleepResponse.json()
      for (const sleep of sleepData.data) {
        await supabaseClient
          .from('metrics')
          .upsert({
            user_id: user.id,
            type: 'sleep_score',
            value: sleep.score,
            source: 'oura',
            timestamp: sleep.day,
            value_json: sleep
          }, {
            onConflict: 'user_id,type,source,timestamp'
          })
      }
      console.log(`Synced ${sleepData.data.length} sleep records`)
    }

    // Sync readiness data
    const readinessResponse = await fetch(
      `${OURA_API_BASE}/daily_readiness?start_date=${weekAgo}&end_date=${today}`,
      { headers }
    )
    if (readinessResponse.ok) {
      const readinessData = await readinessResponse.json()
      for (const readiness of readinessData.data) {
        await supabaseClient
          .from('metrics')
          .upsert({
            user_id: user.id,
            type: 'readiness_score',
            value: readiness.score,
            source: 'oura',
            timestamp: readiness.day,
            value_json: readiness
          }, {
            onConflict: 'user_id,type,source,timestamp'
          })
      }
      console.log(`Synced ${readinessData.data.length} readiness records`)
    }

    // Sync activity data
    const activityResponse = await fetch(
      `${OURA_API_BASE}/daily_activity?start_date=${weekAgo}&end_date=${today}`,
      { headers }
    )
    if (activityResponse.ok) {
      const activityData = await activityResponse.json()
      for (const activity of activityData.data) {
        // Store multiple metrics from activity data
        const metrics = [
          { type: 'steps', value: activity.steps },
          { type: 'active_calories', value: activity.active_calories },
          { type: 'total_calories', value: activity.total_calories },
          { type: 'activity_score', value: activity.score }
        ]

        for (const metric of metrics) {
          await supabaseClient
            .from('metrics')
            .upsert({
              user_id: user.id,
              type: metric.type,
              value: metric.value,
              source: 'oura',
              timestamp: activity.day,
              value_json: activity
            }, {
              onConflict: 'user_id,type,source,timestamp'
            })
        }
      }
      console.log(`Synced ${activityData.data.length} activity records`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Oura data synced successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error syncing Oura data:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to sync Oura data',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})