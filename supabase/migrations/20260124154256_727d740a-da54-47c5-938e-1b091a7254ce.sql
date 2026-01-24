-- Fix RLS infinite-recursion issues by preventing inlining + bypassing RLS inside helper functions.
-- We keep roles in public.user_roles (NOT in profiles) and only adjust helper functions.

CREATE OR REPLACE FUNCTION public.get_user_company_id(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  result uuid;
BEGIN
  SELECT p.company_id
    INTO result
  FROM public.profiles p
  WHERE p.id = user_uuid;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_association_id(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  result uuid;
BEGIN
  SELECT p.association_id
    INTO result
  FROM public.profiles p
  WHERE p.id = user_uuid;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  result text;
BEGIN
  SELECT ur.role::text
    INTO result
  FROM public.user_roles ur
  WHERE ur.user_id = user_uuid
  ORDER BY ur.created_at DESC
  LIMIT 1;

  RETURN result;
END;
$$;
