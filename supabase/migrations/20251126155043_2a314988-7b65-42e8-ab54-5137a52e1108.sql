-- Update the handle_new_user function to read role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  selected_role TEXT;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, user_id, full_name, email)
  VALUES (gen_random_uuid(), NEW.id, 
          COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
          NEW.email);
  
  -- Get the selected role from metadata, default to 'attendee'
  selected_role := COALESCE(NEW.raw_user_meta_data->>'selected_role', 'attendee');
  
  -- Insert the selected role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, selected_role::app_role);
  
  RETURN NEW;
END;
$$;