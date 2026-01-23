-- Tabella per i template email per azienda
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('booking_confirmation', 'booking_reminder')),
  subject TEXT NOT NULL,
  intro_text TEXT,
  closing_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, template_type)
);

-- Tabella per le impostazioni email per azienda
CREATE TABLE public.email_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  confirmation_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_hours_before INTEGER NOT NULL DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per tracciare le email inviate (evita duplicati reminder)
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('booking_confirmation', 'booking_reminder')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent',
  UNIQUE(booking_id, email_type)
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies per email_templates
CREATE POLICY "Super admin full access on email_templates" 
ON public.email_templates 
FOR ALL 
USING (get_user_role(auth.uid()) = 'super_admin');

CREATE POLICY "HR admin can view own company templates" 
ON public.email_templates 
FOR SELECT 
USING (is_admin(auth.uid()) AND company_id = get_user_company_id(auth.uid()));

CREATE POLICY "HR admin can update own company templates" 
ON public.email_templates 
FOR UPDATE 
USING (is_admin(auth.uid()) AND company_id = get_user_company_id(auth.uid()));

-- RLS Policies per email_settings
CREATE POLICY "Super admin full access on email_settings" 
ON public.email_settings 
FOR ALL 
USING (get_user_role(auth.uid()) = 'super_admin');

CREATE POLICY "HR admin can view own company settings" 
ON public.email_settings 
FOR SELECT 
USING (is_admin(auth.uid()) AND company_id = get_user_company_id(auth.uid()));

CREATE POLICY "HR admin can update own company settings" 
ON public.email_settings 
FOR UPDATE 
USING (is_admin(auth.uid()) AND company_id = get_user_company_id(auth.uid()));

-- RLS Policies per email_logs (solo lettura per admin)
CREATE POLICY "Super admin can view all email_logs" 
ON public.email_logs 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'super_admin');

CREATE POLICY "Admins can insert email_logs" 
ON public.email_logs 
FOR INSERT 
WITH CHECK (true);

-- Trigger per updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_settings_updated_at
BEFORE UPDATE ON public.email_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indici per performance
CREATE INDEX idx_email_templates_company_type ON public.email_templates(company_id, template_type);
CREATE INDEX idx_email_settings_company ON public.email_settings(company_id);
CREATE INDEX idx_email_logs_booking ON public.email_logs(booking_id);