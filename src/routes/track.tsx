import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Package, Truck, Home, Clock, XCircle, CreditCard, ExternalLink, Factory } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/lib/shop";
import { courierTrackingUrl } from "@/lib/orders";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Order — HBH Collection" },
      {
        name: "description",
        content:
          "Track your HBH Collection order: enter your order ID and phone number to see live delivery status, courier tracking and shipment updates.",
      },
      { property: "og:title", content: "Track Your Order — HBH Collection" },
      { property: "og:description", content: "Live order status and courier tracking for HBH Collection customers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackPage,
});

type OrderItem = {
  product_name?: string;
  product_image?: string;
  size?: string;
  color?: string;
  quantity?: number;
  subtotal?: number;
};

const ORDER_RANK: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  out_for_delivery: 3,
  delivered: 4,
};

function fmt(v: unknown) {
  if (!v) return null;
  return new Date(String(v)).toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setResult(null);
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("track_order", {
        p_order_number: orderNumber.trim(),
        p_phone: phone.trim(),
      });
      const row = Array.isArray(data) ? data[0] : data;
      if (error || !row) {
        setMsg("No order found with those details. Check the order ID and phone number.");
        return;
      }
      setResult(row as Record<string, unknown>);
    } finally {
      setBusy(false);
    }
  }

  const status = String(result?.status ?? "pending").toLowerCase();
  const cancelled = status === "cancelled" || status === "returned";
  const rank = ORDER_RANK[status] ?? 0;
  const items = Array.isArray(result?.items) ? (result?.items as OrderItem[]) : [];
  const address = (result?.shipping_address ?? null) as Record<string, unknown> | null;
  const trackingNo = result?.tracking_number ? String(result.tracking_number) : "";
  const courier = result?.courier_name ? String(result.courier_name) : "";

  const steps = result
    ? [
        { label: "Order Placed", icon: Clock, done: true, at: fmt(result.created_at) },
        {
          label: "Payment Confirmed",
          icon: CreditCard,
          done: rank >= 1 || result.payment_verified === true,
          at: fmt(result.confirmed_at),
        },
        { label: "Processing", icon: Factory, done: rank >= 2, at: null },
        { label: "Shipped", icon: Package, done: rank >= 3, at: fmt(result.shipped_at) },
        { label: "Delivered", icon: Home, done: rank >= 4, at: fmt(result.delivered_at) },
      ]
    : [];

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="display gold-rule mb-3 text-5xl">TRACK ORDER</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Enter the order ID from your confirmation plus the phone number you ordered with.
      </p>

      <form onSubmit={search} className="space-y-4">
        <input
          required
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Order ID (HBH-XXXXXXXX)"
          className="w-full border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-gold"
        />
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number (03XXXXXXXXX)"
          className="w-full border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-gold"
        />
        <button
          disabled={busy}
          className="heading w-full bg-primary py-4 text-xs tracking-[0.2em] text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
        >
          {busy ? "SEARCHING…" : "TRACK ORDER"}
        </button>
      </form>

      {msg && <p className="mt-6 text-sm text-primary">{msg}</p>}

      {result && (
        <section className="mt-10 space-y-6">
          <div className="border border-border bg-surface p-6">
            <p className="heading text-[10px] tracking-[0.2em] text-muted-foreground">ORDER ID</p>
            <p className="display text-3xl">{String(result.order_number ?? orderNumber)}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Placed {fmt(result.created_at) ?? "—"}
              {result.payment_method ? ` · ${String(result.payment_method).toUpperCase()}` : ""}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Customer: {String(result.customer_name ?? "—")} · Total{" "}
              <span className="text-gold">{formatPKR(Number(result.total ?? 0))}</span>
            </p>
            {items.length > 0 && (
              <div className="mt-4 flex gap-2">
                {items.slice(0, 5).map((it, i) =>
                  it.product_image ? (
                    <img key={i} src={it.product_image} alt={it.product_name ?? ""} className="h-16 w-12 object-cover" />
                  ) : null,
                )}
              </div>
            )}
          </div>

          <div className="border border-border bg-surface p-6">
            <h2 className="heading mb-6 text-xs tracking-[0.2em] text-gold">TRACKING TIMELINE</h2>
            {cancelled ? (
              <div className="flex items-center gap-3 text-primary">
                <XCircle className="h-5 w-5" />
                <span className="heading text-sm">ORDER {status.toUpperCase()}</span>
              </div>
            ) : (
              <ol>
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <li key={step.label} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                            step.done ? "border-gold bg-gold text-background" : "border-border text-muted-foreground"
                          }`}
                        >
                          {step.done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        </span>
                        {i < steps.length - 1 && (
                          <span
                            className={`w-px flex-1 ${steps[i + 1]?.done ? "bg-gold" : "bg-border"}`}
                            style={{ minHeight: 28 }}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <p className={`heading text-sm ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label.toUpperCase()}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {step.at ?? (step.done ? "Completed" : "Pending")}
                        </p>

                        {step.label === "Shipped" && step.done && (
                          <div className="mt-3 border border-gold/40 bg-gold/5 p-4">
                            <p className="heading flex items-center gap-2 text-xs tracking-[0.15em] text-gold">
                              <Truck className="h-4 w-4" /> SHIPPED VIA {(courier || "COURIER").toUpperCase()}
                            </p>
                            {trackingNo && (
                              <p className="mt-2 text-xs text-muted-foreground">
                                Tracking No: <span className="text-gold">{trackingNo}</span>
                              </p>
                            )}
                            {!!result.estimated_delivery && (
                              <p className="text-xs text-muted-foreground">
                                Est. Delivery:{" "}
                                {new Date(String(result.estimated_delivery)).toLocaleDateString("en-PK", {
                                  day: "numeric",
                                  month: "long",
                                })}
                              </p>
                            )}
                            {trackingNo && (
                              <a
                                href={courierTrackingUrl(courier, trackingNo)}
                                target="_blank"
                                rel="noreferrer"
                                className="heading mt-3 inline-flex items-center gap-2 border border-gold px-4 py-2 text-[10px] tracking-[0.2em] text-gold"
                              >
                                TRACK ON {(courier || "COURIER").toUpperCase()} WEBSITE
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
            {!trackingNo && !cancelled && (
              <p className="mt-2 border-t border-border pt-4 text-xs text-muted-foreground">
                Your order is being prepared. Tracking info will appear here once shipped.
              </p>
            )}
          </div>

          {items.length > 0 && (
            <div className="border border-border bg-surface p-6">
              <h2 className="heading mb-4 text-xs tracking-[0.2em] text-gold">ITEMS</h2>
              <ul className="space-y-3">
                {items.map((it, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {it.product_image && <img src={it.product_image} alt="" className="h-16 w-12 object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="heading truncate text-sm">{it.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {it.size ? `Size ${it.size}` : ""}
                        {it.color ? ` · ${it.color}` : ""} · Qty {it.quantity ?? 1}
                      </p>
                    </div>
                    <span className="text-sm">{formatPKR(Number(it.subtotal ?? 0))}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border border-border bg-surface p-6 text-sm">
            <h2 className="heading mb-4 text-xs tracking-[0.2em] text-gold">SUMMARY</h2>
            <Row label="Subtotal" value={formatPKR(Number(result.subtotal ?? 0))} />
            {Number(result.discount_amount ?? 0) > 0 && (
              <Row label="Discount" value={`− ${formatPKR(Number(result.discount_amount))}`} />
            )}
            <Row
              label="Shipping"
              value={Number(result.shipping_charge ?? 0) === 0 ? "FREE" : formatPKR(Number(result.shipping_charge))}
            />
            <div className="mt-3 border-t border-border pt-3">
              <Row label="Total" value={formatPKR(Number(result.total ?? 0))} bold />
            </div>
            {address && (
              <p className="mt-4 text-xs text-muted-foreground">
                Delivering to {String(result.customer_name ?? "")} —{" "}
                {[address.street ?? address.address, address.city, address.province, address.postal_code]
                  .filter(Boolean)
                  .map(String)
                  .join(", ")}
              </p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "heading text-base" : ""}>{value}</span>
    </div>
  );
}
