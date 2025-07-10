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
  country: string;
  ring_model: string;
  created_at: string;
}

interface OuraWorkout {
  id: string;
  activity: string;
  intensity: string;
  calories: number;
  distance: number;
  label: string;
  source: string;
  start_datetime: string;
  end_datetime: string;
  day: string;
}

interface OuraSession {
  id: string;
  category: string;
  start_datetime: string;
  end_datetime: string;
  day: string;
  average_hr: number;
}

interface OuraEnhancedTag {
  id: string;
  day: string;
  timestamp: string;
  text: string;
  tags: string[];
  comment?: string;
  start_datetime?: string;
  end_datetime?: string;
  repeat_daily?: boolean;
}

interface OuraStress {
  id: string;
  day: string;
  high_stress_duration: number;
  average_stress_score: number;
}

interface OuraResilience {
  id: string;
  day: string;
  resilience_score: number;
}

interface OuraCardiovascularAge {
  id: string;
  day: string;
  cvo_age: number;
  delta_years: number;
}

interface OuraVO2Max {
  id: string;
  day: string;
  vo2_max: number;
  timestamp: string;
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

    // Get date ranges for data sync
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Sync personal info
    const personalResponse = await fetch(`${OURA_API_BASE}/personal_info`, { headers })
    if (personalResponse.ok) {
      const personalData: OuraPersonalInfo = await personalResponse.json()
      await supabaseClient
        .from('oura_personal_info')
        .upsert({
          user_id: user.id,
          oura_user_id: personalData.id,
          age: personalData.age,
          biological_sex: personalData.biological_sex,
          height: personalData.height,
          weight: personalData.weight,
          email: personalData.email,
          country: personalData.country,
          ring_model: personalData.ring_model
        }, {
          onConflict: 'user_id'
        })
      console.log('Personal info synced')
    }

    // Sync sleep data
    console.log('Fetching sleep data from Oura API...')
    const sleepResponse = await fetch(
      `${OURA_API_BASE}/daily_sleep?start_date=${weekAgo}&end_date=${today}`,
      { headers }
    )
    console.log('Sleep response status:', sleepResponse.status)
    if (sleepResponse.ok) {
      const sleepData = await sleepResponse.json()
      console.log(`Received ${sleepData.data?.length || 0} sleep records from Oura`)
      for (const sleep of sleepData.data || []) {
        console.log('Processing sleep record:', sleep.id, 'score:', sleep.score, 'day:', sleep.day)
        const result = await supabaseClient
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
        if (result.error) {
          console.error('Error inserting sleep metric:', result.error)
        }
      }
      console.log(`Synced ${sleepData.data?.length || 0} sleep records`)
    } else {
      const errorText = await sleepResponse.text()
      console.error('Sleep API error:', sleepResponse.status, errorText)
    }

    // Sync readiness data
    console.log('Fetching readiness data from Oura API...')
    const readinessResponse = await fetch(
      `${OURA_API_BASE}/daily_readiness?start_date=${weekAgo}&end_date=${today}`,
      { headers }
    )
    console.log('Readiness response status:', readinessResponse.status)
    if (readinessResponse.ok) {
      const readinessData = await readinessResponse.json()
      console.log(`Received ${readinessData.data?.length || 0} readiness records from Oura`)
      for (const readiness of readinessData.data || []) {
        console.log('Processing readiness record:', readiness.id, 'score:', readiness.score, 'day:', readiness.day)
        const result = await supabaseClient
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
        if (result.error) {
          console.error('Error inserting readiness metric:', result.error)
        }
      }
      console.log(`Synced ${readinessData.data?.length || 0} readiness records`)
    } else {
      const errorText = await readinessResponse.text()
      console.error('Readiness API error:', readinessResponse.status, errorText)
    }

    // Sync activity data
    console.log('Fetching activity data from Oura API...')
    const activityResponse = await fetch(
      `${OURA_API_BASE}/daily_activity?start_date=${weekAgo}&end_date=${today}`,
      { headers }
    )
    console.log('Activity response status:', activityResponse.status)
    if (activityResponse.ok) {
      const activityData = await activityResponse.json()
      console.log(`Received ${activityData.data?.length || 0} activity records from Oura`)
      for (const activity of activityData.data || []) {
        console.log('Processing activity record:', activity.id, 'steps:', activity.steps, 'day:', activity.day)
        
        // Store multiple metrics from activity data
        const metrics = [
          { type: 'steps', value: activity.steps },
          { type: 'active_calories', value: activity.active_calories },
          { type: 'total_calories', value: activity.total_calories },
          { type: 'activity_score', value: activity.score },
          { type: 'resting_heart_rate', value: activity.contributors?.resting_heart_rate || null }
        ]

        for (const metric of metrics) {
          if (metric.value !== null && metric.value !== undefined) {
            const result = await supabaseClient
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
            if (result.error) {
              console.error(`Error inserting ${metric.type} metric:`, result.error)
            }
          }
        }
      }
      console.log(`Synced ${activityData.data?.length || 0} activity records`)
    } else {
      const errorText = await activityResponse.text()
      console.error('Activity API error:', activityResponse.status, errorText)
    }

    // Sync stress data
    const stressResponse = await fetch(
      `${OURA_API_BASE}/daily_stress?start_date=${weekAgo}&end_date=${today}`,
      { headers }
    )
    if (stressResponse.ok) {
      const stressData = await stressResponse.json()
      for (const stress of stressData.data) {
        await supabaseClient
          .from('metrics')
          .upsert({
            user_id: user.id,
            type: 'stress_score',
            value: stress.average_stress_score,
            source: 'oura',
            timestamp: stress.day,
            value_json: stress
          }, {
            onConflict: 'user_id,type,source,timestamp'
          })
      }
      console.log(`Synced ${stressData.data.length} stress records`)
    }

    // Sync resilience data
    const resilienceResponse = await fetch(
      `${OURA_API_BASE}/daily_resilience?start_date=${weekAgo}&end_date=${today}`,
      { headers }
    )
    if (resilienceResponse.ok) {
      const resilienceData = await resilienceResponse.json()
      for (const resilience of resilienceData.data) {
        await supabaseClient
          .from('metrics')
          .upsert({
            user_id: user.id,
            type: 'resilience_score',
            value: resilience.resilience_score,
            source: 'oura',
            timestamp: resilience.day,
            value_json: resilience
          }, {
            onConflict: 'user_id,type,source,timestamp'
          })
      }
      console.log(`Synced ${resilienceData.data.length} resilience records`)
    }

    // Sync cardiovascular age data
    const cvAgeResponse = await fetch(
      `${OURA_API_BASE}/daily_cardiovascular_age?start_date=${weekAgo}&end_date=${today}`,
      { headers }
    )
    if (cvAgeResponse.ok) {
      const cvAgeData = await cvAgeResponse.json()
      for (const cvAge of cvAgeData.data) {
        await supabaseClient
          .from('metrics')
          .upsert({
            user_id: user.id,
            type: 'cardiovascular_age',
            value: cvAge.cvo_age,
            source: 'oura',
            timestamp: cvAge.day,
            value_json: cvAge
          }, {
            onConflict: 'user_id,type,source,timestamp'
          })
      }
      console.log(`Synced ${cvAgeData.data.length} cardiovascular age records`)
    }

    // Sync VO2 Max data
    const vo2Response = await fetch(
      `${OURA_API_BASE}/vO2_max?start_date=${monthAgo}&end_date=${today}`,
      { headers }
    )
    if (vo2Response.ok) {
      const vo2Data = await vo2Response.json()
      for (const vo2 of vo2Data.data) {
        await supabaseClient
          .from('metrics')
          .upsert({
            user_id: user.id,
            type: 'vo2_max',
            value: vo2.vo2_max,
            source: 'oura',
            timestamp: vo2.day,
            value_json: vo2
          }, {
            onConflict: 'user_id,type,source,timestamp'
          })
      }
      console.log(`Synced ${vo2Data.data.length} VO2 Max records`)
    }

    // Sync workouts
    const workoutResponse = await fetch(
      `${OURA_API_BASE}/workout?start_date=${weekAgo}&end_date=${today}`,
      { headers }
    )
    if (workoutResponse.ok) {
      const workoutData = await workoutResponse.json()
      for (const workout of workoutData.data) {
        await supabaseClient
          .from('oura_workouts')
          .upsert({
            user_id: user.id,
            oura_workout_id: workout.id,
            activity: workout.activity,
            intensity: workout.intensity,
            calories: workout.calories,
            distance: workout.distance,
            label: workout.label,
            source: workout.source,
            start_datetime: workout.start_datetime,
            end_datetime: workout.end_datetime,
            day: workout.day,
            workout_data: workout
          }, {
            onConflict: 'user_id,oura_workout_id'
          })
      }
      console.log(`Synced ${workoutData.data.length} workout records`)
    }

    // Sync sessions (meditation/rest)
    const sessionResponse = await fetch(
      `${OURA_API_BASE}/session?start_date=${weekAgo}&end_date=${today}`,
      { headers }
    )
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json()
      for (const session of sessionData.data) {
        await supabaseClient
          .from('oura_sessions')
          .upsert({
            user_id: user.id,
            oura_session_id: session.id,
            category: session.category,
            start_datetime: session.start_datetime,
            end_datetime: session.end_datetime,
            day: session.day,
            average_hr: session.average_hr,
            session_data: session
          }, {
            onConflict: 'user_id,oura_session_id'
          })
      }
      console.log(`Synced ${sessionData.data.length} session records`)
    }

    // Sync enhanced tags
    const tagResponse = await fetch(
      `${OURA_API_BASE}/enhanced_tag?start_date=${weekAgo}&end_date=${today}`,
      { headers }
    )
    if (tagResponse.ok) {
      const tagData = await tagResponse.json()
      for (const tag of tagData.data) {
        await supabaseClient
          .from('oura_tags')
          .upsert({
            user_id: user.id,
            oura_tag_id: tag.id,
            day: tag.day,
            timestamp_utc: tag.timestamp,
            text: tag.text,
            tags: tag.tags,
            comment: tag.comment,
            start_datetime: tag.start_datetime,
            end_datetime: tag.end_datetime,
            repeat_daily: tag.repeat_daily
          }, {
            onConflict: 'user_id,oura_tag_id'
          })
      }
      console.log(`Synced ${tagData.data.length} tag records`)
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