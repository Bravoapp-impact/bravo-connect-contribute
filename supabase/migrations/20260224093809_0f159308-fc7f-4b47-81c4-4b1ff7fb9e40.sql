
DELETE FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
