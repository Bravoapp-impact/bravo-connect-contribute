-- Fix: Rimuovi la policy troppo permissiva e crea una più sicura
DROP POLICY IF EXISTS "Admins can insert email_logs" ON public.email_logs;

-- Solo le edge functions (via service role) possono inserire log
-- Gli utenti autenticati non devono poter inserire direttamente
CREATE POLICY "Service role can insert email_logs" 
ON public.email_logs 
FOR INSERT 
WITH CHECK (false);

-- Nota: le edge functions useranno service_role key che bypassa RLS