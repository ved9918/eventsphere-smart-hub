-- Add profile fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role_type TEXT,
ADD COLUMN IF NOT EXISTS area_of_interest TEXT,
ADD COLUMN IF NOT EXISTS preferred_event_type TEXT,
ADD COLUMN IF NOT EXISTS motivation TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Create index for querying incomplete profiles
CREATE INDEX IF NOT EXISTS idx_profiles_completed ON public.profiles(profile_completed);