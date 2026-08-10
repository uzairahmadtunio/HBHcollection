
DROP POLICY "public read orders" ON public.orders;
DROP POLICY "public read order items" ON public.order_items;
CREATE POLICY "admin read orders" ON public.orders FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admin read order items" ON public.order_items FOR SELECT TO authenticated USING (public.is_admin());
REVOKE SELECT ON public.orders, public.order_items FROM anon;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;

CREATE OR REPLACE FUNCTION public.track_order(p_order_number TEXT, p_phone TEXT)
RETURNS TABLE (
  order_number TEXT, status TEXT, tracking_number TEXT, created_at TIMESTAMPTZ,
  customer_name TEXT, total NUMERIC, shipping_charge NUMERIC, discount_amount NUMERIC,
  subtotal NUMERIC, payment_method TEXT, shipping_address JSONB, items JSONB
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT o.order_number, o.status, o.tracking_number, o.created_at, o.customer_name,
         o.total, o.shipping_charge, o.discount_amount, o.subtotal, o.payment_method,
         o.shipping_address,
         COALESCE((SELECT jsonb_agg(jsonb_build_object(
            'product_name', oi.product_name, 'product_image', oi.product_image,
            'size', oi.size, 'color', oi.color, 'price', oi.price,
            'quantity', oi.quantity, 'subtotal', oi.subtotal))
          FROM public.order_items oi WHERE oi.order_id = o.id), '[]'::jsonb)
  FROM public.orders o
  WHERE upper(o.order_number) = upper(trim(p_order_number))
    AND regexp_replace(o.customer_phone, '\D', '', 'g') = regexp_replace(trim(p_phone), '\D', '', 'g')
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.track_order(TEXT, TEXT) TO anon, authenticated;
