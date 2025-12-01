-- Add event_type and team_size columns to events table
ALTER TABLE public.events 
ADD COLUMN event_type text NOT NULL DEFAULT 'individual',
ADD COLUMN team_size integer NULL;

-- Add check constraint to ensure team_size is set for team events
ALTER TABLE public.events 
ADD CONSTRAINT check_team_size CHECK (
  (event_type = 'individual' AND team_size IS NULL) OR
  (event_type = 'team' AND team_size > 0)
);