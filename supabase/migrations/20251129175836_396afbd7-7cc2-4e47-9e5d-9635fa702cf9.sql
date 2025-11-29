-- Add event settings columns
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS registration_deadline timestamp with time zone,
ADD COLUMN IF NOT EXISTS max_tickets_per_user integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS allow_cancellation boolean DEFAULT false;

-- Add index for better query performance on approval_status
CREATE INDEX IF NOT EXISTS idx_events_approval_status ON public.events(approval_status);

-- Add index for host_id for faster host dashboard queries
CREATE INDEX IF NOT EXISTS idx_events_host_id ON public.events(host_id);