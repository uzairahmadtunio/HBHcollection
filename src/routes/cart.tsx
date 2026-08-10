import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { zonesQuery } from "@/lib/data";
import { formatPKR, waLink } from "@/lib/shop";
import { lineKey, useShop } from "@/lib/shop-store";
import { supabase } from "@/integrations/supabase/client";
import { PaymentBadges, TrustBadge } from "@/components/site/PaymentBadges";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — HBH Collection" },
      { name: "description", content: "Review your HBH Collection cart and checkout with COD, JazzCash or Easypaisa." },
      { property: "og:title", content: "Your Cart — HBH Collection" },
      { property: "og:description", content: "Review your bag and check out." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, subtotal, setQuantity, removeLine } = useShop();
  const { data: zones } = useQuery(zonesQuery);
  const [province, setProvince] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  const zone = (zones ?? []).find((z) => z.province === province);
  const shipping = zone ? (zone.free_above && subtotal >= zone.free_above ? 0 : zone.charge) : 0;
  const total = Math.max(0, subtotal - discount) + shipping;

  async function applyCode() {
    const { data } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();
    if (!data) return toast.error("Invalid or expired code");
    if (subtotal < Number(data.min_order ?? 0))
      return toast.error(`Minimum order ${formatPKR(Number(data.min_order))}`);
    const value =
      data.type === "percentage" ? (subtotal * Number(data.value)) / 100 : Number(data.value);
    setDiscount(value);
    window.sessionStorage.setItem("hbh_discount", JSON.stringify({ code: data.code, value }));
    toast.success(`Code applied — ${formatPKR(value)} off`);
  }

  if (!cart.length) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="display text-5xl">YOUR BAG IS EMPTY</h1>
        <Link to="/men" className="heading mt-8 inline-block bg-primary px-8 py-4 text-xs tracking-widest text-primary-foreground">
          START SHOPPING
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display gold-rule mb-8 text-5xl">YOUR BAG</h1>
      <div className="mb-8 border border-border bg-surface p-4">
        {subtotal >= 2000 ? (
          <p className="heading text-[11px] tracking-[0.15em] text-success">
            🎉 YOU'VE UNLOCKED FREE SHIPPING!
          </p>
        ) : (
          <p className="heading text-[11px] tracking-[0.15em] text-gold">
            ADD {formatPKR(2000 - subtotal)} MORE FOR FREE SHIPPING
          </p>
        )}
        <div className="mt-3 h-1.5 w-full bg-surface-2">
          <div
            className="h-full bg-gold transition-all duration-500"
            style={{ width: `${Math.min(100, (subtotal / 2000) * 100)}%` }}
          />
        </div>
      </div>
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">

        <div className="space-y-4">
          {cart.map((l) => (
            <div key={lineKey(l)} className="grid grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-4 border border-border bg-surface p-4">
              <img src={l.image} alt={l.name} className="h-24 w-20 object-cover" />
              <div className="min-w-0">
                <p className="heading truncate text-sm">{l.name}</p>
                <p className="text-xs text-muted-foreground">Size {l.size} · {l.color}</p>
                <p className="mt-1 text-sm">{formatPKR(l.price)}</p>
                <div className="mt-2 flex w-fit items-center border border-border">
                  <button className="px-3 py-1" onClick={() => setQuantity(lineKey(l), l.quantity - 1)}>−</button>
                  <span className="w-8 text-center text-sm">{l.quantity}</span>
                  <button className="px-3 py-1" onClick={() => setQuantity(lineKey(l), l.quantity + 1)}>+</button>
                </div>
              </div>
              <div className="text-right">
                <p className="heading text-sm">{formatPKR(l.price * l.quantity)}</p>
                <button onClick={() => removeLine(lineKey(l))} className="mt-3 text-muted-foreground hover:text-primary" aria-label="Remove item">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <Link to="/men" className="inline-block text-xs text-gold underline">← Continue shopping</Link>
        </div>

        <aside className="h-fit border border-border bg-surface p-6">
          <h2 className="heading mb-5 text-xs tracking-[0.2em] text-gold">ORDER SUMMARY</h2>
          <Row label="Subtotal" value={formatPKR(subtotal)} />
          <div className="my-4 flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Discount code" className="min-w-0 flex-1 border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold" />
            <button onClick={applyCode} className="heading border border-gold px-4 text-[11px] tracking-widest text-gold">APPLY</button>
          </div>
          {discount > 0 && <Row label="Discount" value={`− ${formatPKR(discount)}`} />}
          <select value={province} onChange={(e) => setProvince(e.target.value)} className="my-3 w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold">
            <option value="">Select province…</option>
            {(zones ?? []).map((z) => (
              <option key={z.id} value={z.province}>{z.province} — {formatPKR(z.charge)}</option>
            ))}
          </select>
          <Row label="Shipping" value={province ? (shipping === 0 ? "FREE" : formatPKR(shipping)) : "—"} />
          <div className="mt-4 border-t border-border pt-4">
            <Row label="Total" value={formatPKR(total)} bold />
          </div>
          <div className="mt-4">
            <div className="mb-3"><PaymentBadges /></div>
            <div><TrustBadge /></div>
          </div>
          <button onClick={() => navigate({ to: "/checkout" })} className="heading mt-5 w-full bg-primary py-4 text-xs tracking-[0.2em] text-primary-foreground hover:bg-primary-hover hbh-btn-primary">
            PROCEED TO CHECKOUT
          </button>
          <a
            href={waLink(
              "Hi! I want to order:\n" +
                cart.map((l) => `• ${l.name} (${l.size}, ${l.color}) x${l.quantity}`).join("\n") +
                `\nTotal: ${formatPKR(total)}`,
            )}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block text-center text-xs text-success underline"
          >
            Order via WhatsApp instead
          </a>
        </aside>
      </div>
    </main>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "heading text-base" : ""}>{value}</span>
    </div>
  );
}
