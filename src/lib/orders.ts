import { supabase } from "@/integrations/supabase/client";
import { formatPKR, WHATSAPP_NUMBER } from "./shop";

export const ADMIN_WHATSAPP = WHATSAPP_NUMBER; // 923112578079
export const ADMIN_PHONE_DISPLAY = "0311-2578079";

export const PAYMENT_METHODS = [
  "Cash on Delivery",
  "JazzCash",
  "Easypaisa",
  "Bank Transfer",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const REQUIRES_PROOF: PaymentMethod[] = ["JazzCash", "Easypaisa", "Bank Transfer"];

export const COURIERS = ["TCS", "Leopards", "M&P", "BlueEx", "PostEx", "Daewoo", "Other"] as const;

/** Public tracking URL for a courier + tracking number. */
export function courierTrackingUrl(courier: string | null | undefined, trackingNo: string) {
  const n = encodeURIComponent(trackingNo.trim());
  switch ((courier ?? "").toLowerCase()) {
    case "postex":
      return `https://postex.pk/tracking?tracking_no=${n}`;
    case "tcs":
      return `https://www.tcs.com.pk/track-shipment?waybill=${n}`;
    case "leopards":
      return `https://leopardscourier.com/leopards-tracking/?track_numbers=${n}`;
    case "m&p":
      return `https://www.mulphico.com/tracking/${n}`;
    case "blueex":
      return `https://blueex.com/tracking/${n}`;
    case "daewoo":
      return `https://www.daewoo.com.pk/tracking/${n}`;
    default:
      return `https://www.google.com/search?q=${n}+courier+tracking`;
  }
}

export type OrderLine = {
  name: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
};

/** WhatsApp message sent to the store when a new order lands. */
export function newOrderAdminMessage(o: {
  orderNumber: string;
  name: string;
  phone: string;
  items: OrderLine[];
  total: number;
  payment: string;
  tid?: string;
  address: string;
}) {
  return [
    "🛍️ NEW ORDER RECEIVED!",
    "━━━━━━━━━━━━━━━━",
    `Order: #${o.orderNumber}`,
    `Customer: ${o.name}`,
    `Phone: ${o.phone}`,
    "Items:",
    ...o.items.map(
      (i) => `• ${i.name}${i.size ? ` (${i.size}` : ""}${i.color ? `, ${i.color}` : ""}${i.size ? ")" : ""} x${i.quantity}`,
    ),
    `Total: ${formatPKR(o.total)}`,
    `Payment: ${o.payment}`,
    ...(o.tid ? [`TID: ${o.tid}`] : []),
    `Address: ${o.address}`,
    "━━━━━━━━━━━━━━━━",
    "Please confirm this order.",
  ].join("\n");
}

export function shippedCustomerMessage(o: {
  orderNumber: string;
  courier: string;
  trackingNumber: string;
  estimated?: string | null;
}) {
  return [
    `📦 Your order #${o.orderNumber} has been SHIPPED!`,
    "",
    `Courier: ${o.courier}`,
    `Tracking No: ${o.trackingNumber}`,
    "",
    `Track here: ${courierTrackingUrl(o.courier, o.trackingNumber)}`,
    ...(o.estimated ? [`Est. Delivery: ${o.estimated}`] : []),
    "",
    "Questions? WhatsApp us:",
    ADMIN_PHONE_DISPLAY,
  ].join("\n");
}

export function paymentVerifiedMessage(orderNumber: string) {
  return `Payment received! Your order #${orderNumber} is confirmed ✅\n\nWe'll notify you as soon as it ships.\nHBH Collection`;
}

/** wa.me link for an arbitrary Pakistani number. */
export function customerWaLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("92") ? digits : digits.replace(/^0/, "92");
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

const MAX_PROOF = 10 * 1024 * 1024;

/** Uploads a payment screenshot; returns the storage path (admin-only readable). */
export async function uploadPaymentProof(file: File, orderNumber: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Only JPG/PNG images are allowed");
  if (file.size > MAX_PROOF) throw new Error("Screenshot must be smaller than 10 MB");
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${orderNumber}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("payment-proofs").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

/** Signed URL for viewing a payment proof (admin only). */
export async function paymentProofUrl(pathOrUrl: string): Promise<string | null> {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  const { data } = await supabase.storage.from("payment-proofs").createSignedUrl(pathOrUrl, 3600);
  return data?.signedUrl ?? null;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
