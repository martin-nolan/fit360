-- Create metrics table for health data from various sources
CREATE TABLE public.metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT NOT NULL, -- 'oura', 'apple_health', 'manual', etc.
  type TEXT NOT NULL, -- 'sleep_score', 'hrv', 'steps', 'weight', 'resting_hr', etc.
  value NUMERIC, -- for simple numeric values
  value_json JSONB, -- for complex data like sleep stage breakdown
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create macro log table for nutrition tracking
CREATE TABLE public.macro_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date) -- One entry per user per day
);

-- Create photos table for progress photos
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  thumbnail_url TEXT,
  fullres_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI summaries table for insights
CREATE TABLE public.ai_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly')),
  date DATE NOT NULL, -- the date this summary is for
  content TEXT NOT NULL, -- markdown content
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, period, date) -- One summary per user per period per date
);

-- Enable RLS on all tables
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.macro_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for metrics
CREATE POLICY "Users can view their own metrics" 
ON public.metrics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics" 
ON public.metrics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics" 
ON public.metrics FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metrics" 
ON public.metrics FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for macro logs
CREATE POLICY "Users can view their own macro logs" 
ON public.macro_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own macro logs" 
ON public.macro_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own macro logs" 
ON public.macro_logs FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own macro logs" 
ON public.macro_logs FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for photos
CREATE POLICY "Users can view their own photos" 
ON public.photos FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photos" 
ON public.photos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos" 
ON public.photos FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" 
ON public.photos FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for AI summaries
CREATE POLICY "Users can view their own AI summaries" 
ON public.ai_summaries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI summaries" 
ON public.ai_summaries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI summaries" 
ON public.ai_summaries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI summaries" 
ON public.ai_summaries FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for macro_logs updated_at
CREATE TRIGGER update_macro_logs_updated_at
BEFORE UPDATE ON public.macro_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create useful indexes for performance
CREATE INDEX idx_metrics_user_timestamp ON public.metrics(user_id, timestamp DESC);
CREATE INDEX idx_metrics_user_type ON public.metrics(user_id, type);
CREATE INDEX idx_macro_logs_user_date ON public.macro_logs(user_id, date DESC);
CREATE INDEX idx_photos_user_timestamp ON public.photos(user_id, timestamp DESC);
CREATE INDEX idx_ai_summaries_user_period_date ON public.ai_summaries(user_id, period, date DESC);