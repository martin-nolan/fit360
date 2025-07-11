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

    // Get date ranges for data sync (past month)
    const today = new Date().toISOString().split('T')[0]
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

    // Sync stress data
    console.log('Fetching stress data from Oura API...')
    const stressResponse = await fetch(
      `${OURA_API_BASE}/daily_stress?start_date=${monthAgo}&end_date=${today}`,
      { headers }
    )
    console.log('Stress response status:', stressResponse.status)
    if (stressResponse.ok) {
      const stressData = await stressResponse.json()
      console.log(`Received ${stressData.data?.length || 0} stress records from Oura`)
      for (const stress of stressData.data || []) {
        console.log('Processing stress record:', stress.id, 'score:', stress.average_stress_score, 'day:', stress.day)
        const result = await supabaseClient
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
        if (result.error) {
          console.error('Error inserting stress metric:', result.error)
        }
      }
      console.log(`Synced ${stressData.data?.length || 0} stress records`)
    } else {
      const errorText = await stressResponse.text()
      console.error('Stress API error:', stressResponse.status, errorText)
    }
    // Sync resilience data
    console.log('Fetching resilience data from Oura API...')
    const resilienceResponse = await fetch(
      `${OURA_API_BASE}/daily_resilience?start_date=${monthAgo}&end_date=${today}`,
      { headers }
    )
    console.log('Resilience response status:', resilienceResponse.status)
    if (resilienceResponse.ok) {
      const resilienceData = await resilienceResponse.json()
      console.log(`Received ${resilienceData.data?.length || 0} resilience records from Oura`)
      for (const resilience of resilienceData.data || []) {
        console.log('Processing resilience record:', resilience.id, 'score:', resilience.resilience_score, 'day:', resilience.day)
        const result = await supabaseClient
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
        if (result.error) {
          console.error('Error inserting resilience metric:', result.error)
        }
      }
      console.log(`Synced ${resilienceData.data?.length || 0} resilience records`)
    } else {
      const errorText = await resilienceResponse.text()
      console.error('Resilience API error:', resilienceResponse.status, errorText)
    }

    // Sync cardiovascular age data
    console.log('Fetching cardiovascular age data from Oura API...')
    const cvAgeResponse = await fetch(
      `${OURA_API_BASE}/daily_cardiovascular_age?start_date=${monthAgo}&end_date=${today}`,
      { headers }
    )
    console.log('Cardiovascular age response status:', cvAgeResponse.status)
    if (cvAgeResponse.ok) {
      const cvAgeData = await cvAgeResponse.json()
      console.log(`Received ${cvAgeData.data?.length || 0} cardiovascular age records from Oura`)
      for (const cvAge of cvAgeData.data || []) {
        console.log('Processing CV age record:', cvAge.id, 'age:', cvAge.cvo_age, 'day:', cvAge.day)
        const result = await supabaseClient
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
        if (result.error) {
          console.error('Error inserting cardiovascular age metric:', result.error)
        }
      }
      console.log(`Synced ${cvAgeData.data?.length || 0} cardiovascular age records`)
    } else {
      const errorText = await cvAgeResponse.text()
      console.error('Cardiovascular age API error:', cvAgeResponse.status, errorText)
    }

    // Sync VO2 Max data
    console.log('Fetching VO2 Max data from Oura API...')
    const vo2Response = await fetch(
      `${OURA_API_BASE}/vO2_max?start_date=${monthAgo}&end_date=${today}`,
      { headers }
    )
    console.log('VO2 Max response status:', vo2Response.status)
    if (vo2Response.ok) {
      const vo2Data = await vo2Response.json()
      console.log(`Received ${vo2Data.data?.length || 0} VO2 Max records from Oura`)
      for (const vo2 of vo2Data.data || []) {
        console.log('Processing VO2 Max record:', vo2.id, 'vo2_max:', vo2.vo2_max, 'day:', vo2.day)
        const result = await supabaseClient
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
        if (result.error) {
          console.error('Error inserting VO2 Max metric:', result.error)
        }
      }
      console.log(`Synced ${vo2Data.data?.length || 0} VO2 Max records`)
    } else {
      const errorText = await vo2Response.text()
      console.error('VO2 Max API error:', vo2Response.status, errorText)
    }

    // Sync workouts
    console.log('Fetching workout data from Oura API...')
    const workoutResponse = await fetch(
      `${OURA_API_BASE}/workout?start_date=${monthAgo}&end_date=${today}`,
      { headers }
    )
    console.log('Workout response status:', workoutResponse.status)
    if (workoutResponse.ok) {
      const workoutData = await workoutResponse.json()
      console.log(`Received ${workoutData.data?.length || 0} workout records from Oura`)
      for (const workout of workoutData.data || []) {
        console.log('Processing workout record:', workout.id, 'activity:', workout.activity, 'day:', workout.day)
        const result = await supabaseClient
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
        if (result.error) {
          console.error('Error inserting workout:', result.error)
        }
      }
      console.log(`Synced ${workoutData.data?.length || 0} workout records`)
    } else {
      const errorText = await workoutResponse.text()
      console.error('Workout API error:', workoutResponse.status, errorText)
    }

    // Sync sessions (meditation/rest)
    console.log('Fetching session data from Oura API...')
    const sessionResponse = await fetch(
      `${OURA_API_BASE}/session?start_date=${monthAgo}&end_date=${today}`,
      { headers }
    )
    console.log('Session response status:', sessionResponse.status)
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json()
      console.log(`Received ${sessionData.data?.length || 0} session records from Oura`)
      for (const session of sessionData.data || []) {
        console.log('Processing session record:', session.id, 'category:', session.category, 'day:', session.day)
        const result = await supabaseClient
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
        if (result.error) {
          console.error('Error inserting session:', result.error)
        }
      }
      console.log(`Synced ${sessionData.data?.length || 0} session records`)
    } else {
      const errorText = await sessionResponse.text()
      console.error('Session API error:', sessionResponse.status, errorText)
    }

    // Sync enhanced tags
    console.log('Fetching enhanced tag data from Oura API...')
    const tagResponse = await fetch(
      `${OURA_API_BASE}/enhanced_tag?start_date=${monthAgo}&end_date=${today}`,
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