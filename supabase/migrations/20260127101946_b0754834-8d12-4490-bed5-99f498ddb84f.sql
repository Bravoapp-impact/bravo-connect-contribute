-- Rimuovi il constraint esistente
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Ricrea il constraint con tutti i ruoli validi
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY['super_admin'::text, 'hr_admin'::text, 'employee'::text, 'association_admin'::text]));