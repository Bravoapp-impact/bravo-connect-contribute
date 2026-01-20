-- Create storage bucket for association logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('association-logos', 'association-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for association logos
CREATE POLICY "Association logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'association-logos');

CREATE POLICY "Super admins can upload association logos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'association-logos' AND (SELECT get_user_role(auth.uid()) = 'super_admin'));

CREATE POLICY "Super admins can update association logos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'association-logos' AND (SELECT get_user_role(auth.uid()) = 'super_admin'));

CREATE POLICY "Super admins can delete association logos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'association-logos' AND (SELECT get_user_role(auth.uid()) = 'super_admin'));