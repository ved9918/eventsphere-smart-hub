-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'host', 'attendee');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add approval_status to events table
ALTER TABLE public.events
ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Drop ALL old policies first before modifying schema
DROP POLICY IF EXISTS "Hosts can create events" ON public.events;
DROP POLICY IF EXISTS "Hosts can update their own events" ON public.events;
DROP POLICY IF EXISTS "Hosts can delete their own events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view active events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
DROP POLICY IF EXISTS "Attendees can create registrations" ON public.registrations;

-- Now safe to remove the role column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Create new RLS policies using has_role function
CREATE POLICY "Hosts can create events"
ON public.events FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'host'));

CREATE POLICY "Hosts can update their own events"
ON public.events FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = events.host_id
  )
);

CREATE POLICY "Hosts can delete their own events"
ON public.events FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = events.host_id
  )
);

CREATE POLICY "Users can view approved events"
ON public.events FOR SELECT
USING (
  approval_status = 'approved' 
  OR auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = events.host_id
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- Admins can manage all events
CREATE POLICY "Admins can manage all events"
ON public.events FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update registrations policies
CREATE POLICY "Attendees can create registrations"
ON public.registrations FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = registrations.attendee_id
  )
  AND EXISTS (
    SELECT 1 FROM events WHERE id = registrations.event_id AND approval_status = 'approved'
  )
);

-- Update profiles trigger to assign default attendee role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, user_id, full_name, email)
  VALUES (gen_random_uuid(), NEW.id, 
          COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
          NEW.email);
  
  -- Assign default attendee role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'attendee');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create analytics view for admin dashboard
CREATE OR REPLACE VIEW public.admin_analytics AS
SELECT
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM events WHERE approval_status = 'approved') as approved_events,
  (SELECT COUNT(*) FROM events WHERE approval_status = 'pending') as pending_events,
  (SELECT COUNT(*) FROM registrations) as total_registrations,
  (SELECT COUNT(DISTINCT attendee_id) FROM registrations) as active_attendees,
  (SELECT COALESCE(SUM(price), 0) FROM events WHERE approval_status = 'approved') as total_revenue;

-- Grant access to analytics view
GRANT SELECT ON public.admin_analytics TO authenticated;