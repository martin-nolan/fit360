-- Add new tables for comprehensive Oura data

-- Personal information table
CREATE TABLE public.oura_personal_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  oura_user_id TEXT NOT NULL,
  age INTEGER,
  biological_sex TEXT,
  height FLOAT,
  weight FLOAT,
  email TEXT,
  country TEXT,
  ring_model TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Workouts table
CREATE TABLE public.oura_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  oura_workout_id TEXT NOT NULL,
  activity TEXT,
  intensity TEXT,
  calories FLOAT,
  distance INTEGER,
  label TEXT,
  source TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE,
  end_datetime TIMESTAMP WITH TIME ZONE,
  day DATE,
  workout_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, oura_workout_id)
);

-- Sessions table (meditation/rest)
CREATE TABLE public.oura_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  oura_session_id TEXT NOT NULL,
  category TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE,
  end_datetime TIMESTAMP WITH TIME ZONE,
  day DATE,
  average_hr INTEGER,
  session_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, oura_session_id)
);

-- Enhanced tags table
CREATE TABLE public.oura_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  oura_tag_id TEXT NOT NULL,
  day DATE,
  timestamp_utc TIMESTAMP WITH TIME ZONE,
  text TEXT,
  tags TEXT[],
  comment TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE,
  end_datetime TIMESTAMP WITH TIME ZONE,
  repeat_daily BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, oura_tag_id)
);

-- Enable Row Level Security
ALTER TABLE public.oura_personal_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oura_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oura_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oura_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own personal info" 
ON public.oura_personal_info 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal info" 
ON public.oura_personal_info 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own personal info" 
ON public.oura_personal_info 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own workouts" 
ON public.oura_workouts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts" 
ON public.oura_workouts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions" 
ON public.oura_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" 
ON public.oura_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tags" 
ON public.oura_tags 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags" 
ON public.oura_tags 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_oura_personal_info_updated_at
BEFORE UPDATE ON public.oura_personal_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_oura_workouts_user_day ON public.oura_workouts(user_id, day);
CREATE INDEX idx_oura_sessions_user_day ON public.oura_sessions(user_id, day);
CREATE INDEX idx_oura_tags_user_day ON public.oura_tags(user_id, day);
CREATE INDEX idx_metrics_user_type_timestamp ON public.metrics(user_id, type, timestamp);