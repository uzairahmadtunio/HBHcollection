export type ProductColor = { name: string; hex: string };

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  material: string | null;
  care_instructions: string | null;
  stock_status: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  is_on_sale: boolean;
  sku: string | null;
  weight_grams: number | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  gender: string;
  icon: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
};

export type ShippingZone = {
  id: string;
  province: string;
  charge: number;
  free_above: number | null;
  est_days: string | null;
};

export const WHATSAPP_NUMBER = "923112578079";

export function formatPKR(value: number) {
  return "PKR " + Math.round(value).toLocaleString("en-PK");
}

export function waLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function normalizeProduct(row: Record<string, unknown>): Product {
  const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  return {
    ...(row as unknown as Product),
    price: Number(row.price ?? 0),
    original_price: row.original_price == null ? null : Number(row.original_price),
    images: asArray<string>(row.images),
    sizes: asArray<string>(row.sizes),
    colors: asArray<ProductColor>(row.colors),
  };
}

export function discountPercent(p: Product) {
  if (!p.original_price || p.original_price <= p.price) return 0;
  return Math.round(((p.original_price - p.price) / p.original_price) * 100);
}

export const SIZE_CHART = [
  { size: "XS", chest: "34-36", waist: "28-30", length: "26" },
  { size: "S", chest: "36-38", waist: "30-32", length: "27" },
  { size: "M", chest: "38-40", waist: "32-34", length: "28" },
  { size: "L", chest: "40-42", waist: "34-36", length: "29" },
  { size: "XL", chest: "42-44", waist: "36-38", length: "30" },
  { size: "XXL", chest: "44-46", waist: "38-40", length: "31" },
];

export const ORDER_STEPS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
] as const;

export const STATUS_LABEL: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};
