CREATE TABLE public.return_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id text,
  customer_name text,
  customer_phone text,
  item_name text,
  reason text,
  description text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.return_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.return_requests TO authenticated;
GRANT ALL ON public.return_requests TO service_role;

ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public create return requests" ON public.return_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "admin read return requests" ON public.return_requests FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admin update return requests" ON public.return_requests FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin delete return requests" ON public.return_requests FOR DELETE TO authenticated USING (public.is_admin());

CREATE TRIGGER return_requests_touch_updated_at
BEFORE UPDATE ON public.return_requests
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_verified_buyer boolean NOT NULL DEFAULT false;