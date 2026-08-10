import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Clock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { formatPKR, waLink } from "@/lib/shop";
import { ADMIN_PHONE_DISPLAY, REQUIRES_PROOF, type PaymentMethod } from "@/lib/orders";

export const Route = createFileRoute("/order-success")({
  head: () => ({
    meta: [
      { title: "Order Placed Successfully — HBH Collection" },
      { name: "description", content: "Your HBH Collection order has been received. Track it any time or reach us on WhatsApp." },
      { property: "og:title", content: "Order Placed Successfully — HBH Collection" },
      { property: "og:description", content: "Thank you for shopping with HBH Collection." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderSuccess,
});

type LastOrder = {
  orderNumber: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  name: string;
  phone?: string;
  payment: PaymentMethod;
  tid?: string | null;
  items?: { name: string; size?: string; color?: string; quantity: number; price: number; image?: string | null }[];
};

function OrderSuccess() {
  const raw = typeof window !== "undefined" ? window.sessionStorage.getItem("hbh_last_order") : null;
  const order = raw ? (JSON.parse(raw) as LastOrder) : null;
  const [copied, setCopied] = useState(false);
  const pendingPayment = order ? REQUIRES_PROOF.includes(order.payment) : false;

  const copy = async () => {
    if (!order) return;
    await navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    toast.success("Order number copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <span className="mx-auto grid h-24 w-24 animate-[scaleIn_0.4s_ease-out] place-items-center rounded-full border-2 border-success bg-success/10">
        <Check className="h-12 w-12 text-success" strokeWidth={3} />
      </span>
      <h1 className="display mt-6 text-5xl">ORDER PLACED SUCCESSFULLY!</h1>
      <p className="mt-3 text-sm text-muted-foreground">Your order has been received.</p>

      {order && (
        <>
          <button
            onClick={copy}
            className="heading mx-auto mt-6 flex items-center gap-3 border border-gold px-6 py-4 text-2xl text-gold"
          >
            {order.orderNumber}
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>

          {pendingPayment ? (
            <div className="mt-8 border border-primary bg-primary/10 p-6 text-left">
              <p className="heading flex items-center gap-2 text-xs tracking-[0.2em] text-primary">
                <Clock className="h-4 w-4" /> PAYMENT PENDING VERIFICATION
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                We will confirm your payment within 1–2 hours.
                {order.tid ? ` Your TID: ${order.tid}.` : ""}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                WhatsApp us if urgent: <span className="text-gold">{ADMIN_PHONE_DISPLAY}</span>
              </p>
            </div>
          ) : (
            <div className="mt-8 border border-border bg-surface p-6 text-left">
              <p className="heading text-xs tracking-[0.2em] text-gold">CASH ON DELIVERY</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Our team will call you to confirm your order within 1 hour.
              </p>
            </div>
          )}

          {!!order.items?.length && (
            <div className="mt-6 border border-border bg-surface p-6 text-left">
              <h2 className="heading mb-4 text-xs tracking-[0.2em] text-gold">ITEMS ORDERED</h2>
              <ul className="space-y-3">
                {order.items.map((it, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {it.image && <img src={it.image} alt={it.name} className="h-16 w-12 object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="heading truncate text-sm">{it.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {it.size ? `Size ${it.size}` : ""}{it.color ? ` · ${it.color}` : ""} · Qty {it.quantity}
                      </p>
                    </div>
                    <span className="text-sm">{formatPKR(it.price * it.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
                {order.subtotal != null && (
                  <p className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPKR(order.subtotal)}</span></p>
                )}
                {order.shipping != null && (
                  <p className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shipping === 0 ? "FREE" : formatPKR(order.shipping)}</span></p>
                )}
                <p className="flex justify-between"><span className="text-muted-foreground">Payment</span><span>{order.payment}</span></p>
                <p className="flex justify-between pt-2"><span className="text-muted-foreground">Total</span><span className="heading text-base">{formatPKR(order.total)}</span></p>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/track" className="heading border border-gold px-6 py-3 text-xs tracking-widest text-gold">TRACK ORDER</Link>
        <Link to="/" className="heading bg-primary px-6 py-3 text-xs tracking-widest text-primary-foreground">CONTINUE SHOPPING</Link>
        <a
          href={waLink(`Hi! I just placed order ${order?.orderNumber ?? ""}. Please confirm.`)}
          target="_blank"
          rel="noreferrer"
          className="heading flex items-center gap-2 border border-success px-6 py-3 text-xs tracking-widest text-success"
        >
          <MessageCircle className="h-4 w-4" /> CONTACT ON WHATSAPP
        </a>
      </div>
    </main>
  );
}
