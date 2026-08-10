ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_screenshot_url text,
  ADD COLUMN IF NOT EXISTS payment_tid text,
  ADD COLUMN IF NOT EXISTS payment_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS courier_name text,
  ADD COLUMN IF NOT EXISTS estimated_delivery date,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

ALTER TABLE public.return_requests
  ADD COLUMN IF NOT EXISTS order_number text,
  ADD COLUMN IF NOT EXISTS admin_notes text;

CREATE POLICY "customers read own orders" ON public.orders
FOR SELECT TO authenticated
USING (
  customer_id IN (SELECT c.id FROM public.customers c WHERE c.supabase_auth_id = auth.uid())
  OR lower(coalesce(customer_email,'')) = lower(coalesce((auth.jwt() ->> 'email'), '~none~'))
  OR regexp_replace(coalesce(customer_phone,''), '\D', '', 'g') IN (
      SELECT regexp_replace(coalesce(c.phone,''), '\D', '', 'g')
      FROM public.customers c
      WHERE c.supabase_auth_id = auth.uid() AND coalesce(c.phone,'') <> ''
  )
);

CREATE POLICY "customers read own order items" ON public.order_items
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id));

CREATE POLICY "customers read own return requests" ON public.return_requests
FOR SELECT TO authenticated
USING (
  regexp_replace(coalesce(customer_phone,''), '\D', '', 'g') IN (
      SELECT regexp_replace(coalesce(c.phone,''), '\D', '', 'g')
      FROM public.customers c
      WHERE c.supabase_auth_id = auth.uid() AND coalesce(c.phone,'') <> ''
  )
);

CREATE POLICY "public update payment proof" ON public.orders
FOR UPDATE TO anon, authenticated
USING (created_at > now() - interval '1 hour')
WITH CHECK (created_at > now() - interval '1 hour');

DROP FUNCTION IF EXISTS public.track_order(text, text);
CREATE FUNCTION public.track_order(p_order_number text, p_phone text)
 RETURNS TABLE(order_number text, status text, tracking_number text, created_at timestamp with time zone, customer_name text, total numeric, shipping_charge numeric, discount_amount numeric, subtotal numeric, payment_method text, shipping_address jsonb, items jsonb, courier_name text, estimated_delivery date, shipped_at timestamp with time zone, delivered_at timestamp with time zone, delivered_at_2 timestamp with time zone, confirmed_at timestamp with time zone, payment_verified boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT o.order_number, o.status, o.tracking_number, o.created_at, o.customer_name,
         o.total, o.shipping_charge, o.discount_amount, o.subtotal, o.payment_method,
         o.shipping_address,
         COALESCE((SELECT jsonb_agg(jsonb_build_object(
            'product_name', oi.product_name, 'product_image', oi.product_image,
            'size', oi.size, 'color', oi.color, 'price', oi.price,
            'quantity', oi.quantity, 'subtotal', oi.subtotal))
          FROM public.order_items oi WHERE oi.order_id = o.id), '[]'::jsonb),
         o.courier_name, o.estimated_delivery, o.shipped_at, o.delivered_at, o.delivered_at, o.confirmed_at, o.payment_verified
  FROM public.orders o
  WHERE (upper(o.order_number) = upper(trim(p_order_number))
         OR regexp_replace(coalesce(o.order_number,''), '\D', '', 'g') = regexp_replace(trim(p_order_number), '\D', '', 'g'))
    AND regexp_replace(o.customer_phone, '\D', '', 'g') = regexp_replace(trim(p_phone), '\D', '', 'g')
  ORDER BY o.created_at DESC
  LIMIT 1;
$function$;

INSERT INTO public.site_settings (key, value) VALUES
  ('bank_name', 'Meezan Bank'),
  ('bank_account_title', 'HBH Collection'),
  ('bank_account_number', '0110-0102-3456-01'),
  ('bank_iban', 'PK36MEZN0001100102345601'),
  ('jazzcash_number', '0311-2578079'),
  ('easypaisa_number', '0330-2033640')
ON CONFLICT DO NOTHING;