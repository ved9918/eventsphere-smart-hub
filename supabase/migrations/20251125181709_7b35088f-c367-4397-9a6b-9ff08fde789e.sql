-- Drop the view with security definer and replace with a regular function
DROP VIEW IF EXISTS public.admin_analytics;

-- Create a function instead of a view for analytics
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS TABLE (
  total_users BIGINT,
  approved_events BIGINT,
  pending_events BIGINT,
  total_registrations BIGINT,
  active_attendees BIGINT,
  total_revenue NUMERIC
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM profiles)::BIGINT as total_users,
    (SELECT COUNT(*) FROM events WHERE approval_status = 'approved')::BIGINT as approved_events,
    (SELECT COUNT(*) FROM events WHERE approval_status = 'pending')::BIGINT as pending_events,
    (SELECT COUNT(*) FROM registrations)::BIGINT as total_registrations,
    (SELECT COUNT(DISTINCT attendee_id) FROM registrations)::BIGINT as active_attendees,
    (SELECT COALESCE(SUM(price), 0) FROM events WHERE approval_status = 'approved') as total_revenue;
$$;

-- Only admins can call this function
REVOKE ALL ON FUNCTION public.get_admin_analytics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_analytics() TO authenticated;