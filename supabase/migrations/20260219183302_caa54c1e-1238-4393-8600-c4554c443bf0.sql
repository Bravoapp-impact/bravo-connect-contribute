
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_role text;
  v_company_id uuid;
  v_association_id uuid;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'employee');
  
  -- Safely parse UUIDs — invalid strings become NULL
  BEGIN
    v_company_id := (NEW.raw_user_meta_data->>'company_id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_company_id := NULL;
  END;

  BEGIN
    v_association_id := (NEW.raw_user_meta_data->>'association_id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_association_id := NULL;
  END;

  -- Attempt full insert with FKs
  BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role, company_id, association_id)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      v_role,
      v_company_id,
      v_association_id
    );
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: insert with NULL FKs to guarantee profile creation
    RAISE LOG 'handle_new_user: FK insert failed for user %, retrying without FKs. Error: %', NEW.id, SQLERRM;
    INSERT INTO public.profiles (id, email, first_name, last_name, role, company_id, association_id)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      v_role,
      NULL,
      NULL
    )
    ON CONFLICT (id) DO NOTHING;
  END;

  -- user_roles insert with fallback
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, v_role::app_role)
    ON CONFLICT DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: user_roles insert failed for user %. Error: %', NEW.id, SQLERRM;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'employee'::app_role)
    ON CONFLICT DO NOTHING;
  END;

  -- user_tenants insert with fallback
  BEGIN
    INSERT INTO public.user_tenants (user_id, company_id, association_id)
    VALUES (NEW.id, v_company_id, v_association_id)
    ON CONFLICT (user_id)
    DO UPDATE SET
      company_id = EXCLUDED.company_id,
      association_id = EXCLUDED.association_id,
      updated_at = now();
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: user_tenants insert failed for user %. Error: %', NEW.id, SQLERRM;
    INSERT INTO public.user_tenants (user_id, company_id, association_id)
    VALUES (NEW.id, NULL, NULL)
    ON CONFLICT (user_id) DO NOTHING;
  END;

  RETURN NEW;
END;
$function$;
