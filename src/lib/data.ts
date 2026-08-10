import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeProduct, type Category, type Product, type ShippingZone } from "./shop";

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("key,value");
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""])) as Record<
      string,
      string
    >;
  },
  staleTime: 5 * 60 * 1000,
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    if (error) throw error;
    return (data ?? []) as Category[];
  },
  staleTime: 5 * 60 * 1000,
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => normalizeProduct(r as Record<string, unknown>)) as Product[];
  },
  staleTime: 60 * 1000,
});

export const bannersQuery = queryOptions({
  queryKey: ["banners"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 5 * 60 * 1000,
});

export const announcementsQuery = queryOptions({
  queryKey: ["announcements"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true);
    if (error) throw error;
    return data ?? [];
  },
  staleTime: 5 * 60 * 1000,
});
 

export const zonesQuery = queryOptions({
  queryKey: ["shipping_zones"],
  queryFn: async () => {
    const { data, error } = await supabase.from("shipping_zones").select("*").order("province");
    if (error) throw error;
    return (data ?? []).map((z) => ({
      ...z,
      charge: Number(z.charge ?? 0),
      free_above: z.free_above == null ? null : Number(z.free_above),
    })) as ShippingZone[];
  },
  staleTime: 5 * 60 * 1000,
});

export function reviewsQuery(productId: string | undefined) {
  return queryOptions({
    queryKey: ["reviews", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId!)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type Variant = {
  id: string;
  product_id: string | null;
  size: string | null;
  color: string | null;
  stock_quantity: number;
  is_available: boolean;
};

export const variantsQuery = queryOptions({
  queryKey: ["product_variants"],
  queryFn: async () => {
    const { data, error } = await supabase.from("product_variants").select("*");
    if (error) throw error;
    return (data ?? []).map((v) => ({
      ...v,
      stock_quantity: Number(v.stock_quantity ?? 0),
      is_available: v.is_available !== false,
    })) as Variant[];
  },
  staleTime: 60 * 1000,
});

/** Aggregated stock per size for one product (null = no variant rows tracked). */
export function stockBySize(variants: Variant[] | undefined, productId: string) {
  const rows = (variants ?? []).filter((v) => v.product_id === productId && v.size);
  if (!rows.length) return null;
  const map: Record<string, number> = {};
  for (const v of rows) {
    const key = String(v.size);
    map[key] = (map[key] ?? 0) + (v.is_available ? v.stock_quantity : 0);
  }
  return map;
}
