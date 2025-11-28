-- Add additional fields to registrations table for enhanced registration
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS contact_number TEXT,
ADD COLUMN IF NOT EXISTS ticket_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS special_request TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Add check constraint for ticket_count
ALTER TABLE public.registrations
ADD CONSTRAINT ticket_count_positive CHECK (ticket_count > 0);