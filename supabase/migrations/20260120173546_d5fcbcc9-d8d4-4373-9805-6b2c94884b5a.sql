-- Create storage bucket for experience cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('experience-images', 'experience-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Experience images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'experience-images');

-- Allow super admins to upload/update/delete
CREATE POLICY "Super admins can manage experience images"
ON storage.objects FOR ALL
USING (bucket_id = 'experience-images' AND public.is_super_admin(auth.uid()))
WITH CHECK (bucket_id = 'experience-images' AND public.is_super_admin(auth.uid()));