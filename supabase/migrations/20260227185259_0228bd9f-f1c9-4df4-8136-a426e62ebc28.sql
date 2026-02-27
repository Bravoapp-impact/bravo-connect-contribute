
-- Create experience_reviews table
CREATE TABLE public.experience_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  would_recommend BOOLEAN NOT NULL,
  feedback_positive TEXT,
  feedback_improvement TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

-- Add validation trigger instead of CHECK constraint (more robust for restore)
CREATE OR REPLACE FUNCTION public.validate_review_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_review_rating
  BEFORE INSERT OR UPDATE ON public.experience_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_review_rating();

-- Indexes
CREATE INDEX idx_experience_reviews_booking_id ON public.experience_reviews(booking_id);

-- Enable RLS
ALTER TABLE public.experience_reviews ENABLE ROW LEVEL SECURITY;

-- Employee can insert review for own past confirmed booking
CREATE POLICY "Users can insert review for own past booking"
ON public.experience_reviews
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.experience_dates ed ON b.experience_date_id = ed.id
    WHERE b.id = booking_id
      AND b.user_id = auth.uid()
      AND b.status = 'confirmed'
      AND ed.start_datetime < now()
  )
);

-- Employee can view own reviews
CREATE POLICY "Users can view own reviews"
ON public.experience_reviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id AND b.user_id = auth.uid()
  )
);

-- HR can view reviews of their company's employees (anonymous)
CREATE POLICY "HR can view company reviews"
ON public.experience_reviews
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'hr_admin') AND
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.profiles p ON b.user_id = p.id
    WHERE b.id = booking_id
      AND p.company_id = public.get_user_company_id(auth.uid())
  )
);

-- Association admin can view reviews for their experiences
CREATE POLICY "Association admin can view experience reviews"
ON public.experience_reviews
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'association_admin') AND
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.experience_dates ed ON b.experience_date_id = ed.id
    JOIN public.experiences e ON ed.experience_id = e.id
    WHERE b.id = booking_id
      AND e.association_id = public.get_user_association_id(auth.uid())
  )
);

-- Super admin full access
CREATE POLICY "Super admin full access on experience_reviews"
ON public.experience_reviews
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
