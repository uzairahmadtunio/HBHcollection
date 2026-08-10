import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { settingsQuery, zonesQuery } from "@/lib/data";
import { formatPKR, waLink } from "@/lib/shop";
import { useShop } from "@/lib/shop-store";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, PROVINCES } from "@/lib/auth";
import { getOrCreateCustomer, saveCustomerProfile } from "@/lib/customer";
import {
  PAYMENT_METHODS,
  REQUIRES_PROOF,
  newOrderAdminMessage,
  uploadPaymentProof,
  type PaymentMethod,
} from "@/lib/orders";
import { PaymentMethodDetails } from "@/components/site/PaymentMethodDetails";
import { PaymentBadges, TrustBadge } from "@/components/site/PaymentBadges";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — HBH Collection" },
      { name: "description", content: "Secure checkout with Cash on Delivery, JazzCash, Easypaisa and Bank Transfer across Pakistan." },
      { property: "og:title", content: "Checkout — HBH Collection" },
      { property: "og:description", content: "COD, JazzCash, Easypaisa and Bank Transfer accepted." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cart, subtotal, clearCart } = useShop();
  const { data: zones } = useQuery(zonesQuery);
  const { data: settings } = useQuery(settingsQuery);
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["customer-profile"],
    queryFn: getOrCreateCustomer,
    enabled: !!user,
  });
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [useSaved, setUseSaved] = useState(true);
  const [tid, setTid] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [f, setF] = useState({
    name: "", phone: "", email: "", address: "", city: "", province: "", postal: "", notes: "",
    payment: PAYMENT_METHODS[0] as PaymentMethod,
  });

  const savedAddress = profile?.default_address ?? null;
  const hasSaved = !!(savedAddress?.street || savedAddress?.city || savedAddress?.province);

  // FIX 1 — auto-fill from the signed-in customer profile.
  useEffect(() => {
    if (!profile) return;
    setF((p) => ({
      ...p,
      name: p.name || profile.full_name || "",
      phone: p.phone || profile.phone || "",
      email: user?.email ?? p.email,
    }));
  }, [profile?.id, user?.email]);

  useEffect(() => {
    if (!hasSaved) return;
    const a = savedAddress ?? {};
    if (useSaved) {
      setF((p) => ({
        ...p,
        address: a.street ?? "",
        city: a.city ?? "",
        province: a.province ?? "",
        postal: a.postal_code ?? "",
      }));
    } else {
      setF((p) => ({ ...p, address: "", city: "", province: "", postal: "" }));
    }
  }, [useSaved, hasSaved, profile?.id]);

  const zone = (zones ?? []).find((z) => z.province === f.province);
  const shipping = zone ? (zone.free_above && subtotal >= zone.free_above ? 0 : zone.charge) : 0;
  const total = subtotal + shipping;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const needsProof = REQUIRES_PROOF.includes(f.payment);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!/^03\d{9}$/.test(f.phone.replace(/[-\s]/g, "")))
      return toast.error("Enter a valid Pakistani mobile number (03XXXXXXXXX)");
    if (!f.province) return toast.error("Select your province");
    if (needsProof && !tid.trim()) return toast.error("Transaction ID is required for this payment method");
    if (needsProof && !proof) return toast.error("Please upload your payment screenshot");

    setSaving(true);
    const orderNumber = `HBH-${Date.now().toString().slice(-8)}`;

    let proofPath: string | null = null;
    if (needsProof && proof) {
      try {
        proofPath = await uploadPaymentProof(proof, orderNumber);
      } catch (err) {
        setSaving(false);
        return toast.error(err instanceof Error ? err.message : "Screenshot upload failed");
      }
    }

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: profile?.id ?? null,
        customer_name: f.name,
        customer_phone: f.phone,
        customer_email: user?.email ?? f.email ?? null,
        shipping_address: {
          street: f.address,
          address: f.address,
          city: f.city,
          province: f.province,
          postal_code: f.postal,
        },
        subtotal,
        shipping_charge: shipping,
        total,
        payment_method: f.payment,
        payment_tid: needsProof ? tid.trim() : null,
        payment_screenshot_url: proofPath,
        payment_verified: false,
        notes: f.notes || null,
      })
      .select("id")
      .maybeSingle();

    if (error || !order?.id) {
      setSaving(false);
      return toast.error("Could not place order. Please try WhatsApp checkout.");
    }

    await supabase.from("order_items").insert(
      cart.map((l) => ({
        order_id: order.id,
        product_id: l.productId,
        product_name: l.name,
        product_image: l.image ?? null,
        size: l.size,
        color: l.color,
        quantity: l.quantity,
        price: l.price,
        subtotal: l.price * l.quantity,
      })),
    );

    // Save address to the profile if the customer wants it stored.
    if (user && (!hasSaved || !useSaved)) {
      const wantsSave = window.confirm("Save this address to your profile for next time?");
      if (wantsSave) {
        try {
          await saveCustomerProfile({
            full_name: f.name,
            phone: f.phone,
            default_address: {
              street: f.address,
              city: f.city,
              province: f.province,
              postal_code: f.postal,
            },
          });
        } catch {
          /* non-blocking */
        }
      }
    }

    const fullAddress = [f.address, f.city, f.province, f.postal].filter(Boolean).join(", ");
    const adminMsg = newOrderAdminMessage({
      orderNumber,
      name: f.name,
      phone: f.phone,
      items: cart.map((l) => ({ name: l.name, size: l.size, color: l.color, quantity: l.quantity })),
      total,
      payment: f.payment,
      tid: needsProof ? tid.trim() : undefined,
      address: fullAddress,
    });

    window.sessionStorage.setItem(
      "hbh_last_order",
      JSON.stringify({
        orderNumber,
        total,
        subtotal,
        shipping,
        name: f.name,
        phone: f.phone,
        payment: f.payment,
        tid: needsProof ? tid.trim() : null,
        items: cart.map((l) => ({
          name: l.name, size: l.size, color: l.color, quantity: l.quantity, price: l.price, image: l.image ?? null,
        })),
      }),
    );

    // FIX 3A — notify the store on WhatsApp.
    window.open(waLink(adminMsg), "_blank", "noopener");

    clearCart();
    setSaving(false);
    navigate({ to: "/order-success" });
  }

  if (!cart.length) {
    return <main className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">Your bag is empty.</main>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="display gold-rule mb-8 text-5xl">CHECKOUT</h1>
      <form onSubmit={placeOrder} className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <p className="heading text-[11px] tracking-[0.25em] text-gold">1 · CUSTOMER INFO</p>
          <Field label="Full name" required value={f.name} onChange={set("name")} />
          <Field label="Phone / WhatsApp (03XXXXXXXXX)" required value={f.phone} onChange={set("phone")} />
          {user ? (
            <Field label="Email" value={user.email ?? ""} readOnly className="opacity-60" />
          ) : (
            <Field label="Email (optional)" value={f.email} onChange={set("email")} />
          )}

          <p className="heading pt-4 text-[11px] tracking-[0.25em] text-gold">2 · SHIPPING ADDRESS</p>
          {hasSaved && (
            <label className="flex cursor-pointer items-center gap-2 border border-border bg-surface px-3 py-3 text-sm">
              <input type="checkbox" checked={useSaved} onChange={(e) => setUseSaved(e.target.checked)} />
              Use saved address
            </label>
          )}
          <div>
            <label className="heading mb-1 block text-[11px] tracking-widest text-muted-foreground">STREET ADDRESS *</label>
            <textarea required value={f.address} onChange={set("address")} rows={3} className="w-full border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-gold" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City" required value={f.city} onChange={set("city")} />
            <div>
              <label className="heading mb-1 block text-[11px] tracking-widest text-muted-foreground">PROVINCE *</label>
              <select required value={f.province} onChange={set("province")} className="w-full border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-gold">
                <option value="">Select…</option>
                {((zones ?? []).length ? (zones ?? []).map((z) => z.province) : PROVINCES).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <Field label="Postal code (optional)" value={f.postal} onChange={set("postal")} />

          <p className="heading pt-4 text-[11px] tracking-[0.25em] text-gold">3 · PAYMENT METHOD</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PAYMENT_METHODS.map((p) => (
              <label key={p} className="flex cursor-pointer items-center gap-2 border border-border bg-surface px-3 py-3 text-sm">
                <input type="radio" name="payment" checked={f.payment === p} onChange={() => setF((s) => ({ ...s, payment: p }))} />
                {p}
              </label>
            ))}
          </div>
          <PaymentMethodDetails
            method={f.payment}
            amount={total}
            settings={settings}
            tid={tid}
            onTid={setTid}
            file={proof}
            onFile={setProof}
          />

          <div className="pt-2">
            <label className="heading mb-1 block text-[11px] tracking-widest text-muted-foreground">ORDER NOTES</label>
            <textarea value={f.notes} onChange={set("notes")} rows={2} className="w-full border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-gold" />
          </div>
        </div>

        <aside className="h-fit border border-border bg-surface p-6 lg:sticky lg:top-24">
          <PaymentBadges />
          <TrustBadge />
          <h2 className="heading mb-4 text-xs tracking-[0.2em] text-gold">ORDER SUMMARY</h2>
          {cart.map((l, i) => (
            <div key={i} className="flex justify-between py-1 text-xs text-muted-foreground">
              <span className="truncate pr-2">{l.name} × {l.quantity}</span>
              <span>{formatPKR(l.price * l.quantity)}</span>
            </div>
          ))}
          <div className="mt-4 border-t border-border pt-3 text-sm">
            <div className="flex justify-between py-1"><span className="text-muted-foreground">Subtotal</span><span>{formatPKR(subtotal)}</span></div>
            <div className="flex justify-between py-1"><span className="text-muted-foreground">Shipping</span><span>{f.province ? (shipping === 0 ? "FREE" : formatPKR(shipping)) : "—"}</span></div>
            <div className="flex justify-between py-1"><span className="text-muted-foreground">Total</span><span className="heading text-base">{formatPKR(total)}</span></div>
          </div>
          <button disabled={saving} type="submit" className="heading mt-5 w-full bg-primary py-4 text-xs tracking-[0.2em] text-primary-foreground hover:bg-primary-hover disabled:opacity-60">
            {saving ? "PLACING ORDER…" : "PLACE ORDER"}
          </button>
          <a
            href={waLink(
              `Order request\nName: ${f.name}\nPhone: ${f.phone}\nCity: ${f.city}\n` +
                cart.map((l) => `• ${l.name} (${l.size}, ${l.color}) x${l.quantity}`).join("\n") +
                `\nTotal: ${formatPKR(total)}`,
            )}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block text-center text-xs text-success underline"
          >
            Complete on WhatsApp
          </a>
        </aside>
      </form>
    </main>
  );
}

function Field({ label, className, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="heading mb-1 block text-[11px] tracking-widest text-muted-foreground">{label.toUpperCase()}</label>
      <input {...rest} className={`w-full border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-gold ${className ?? ""}`} />
    </div>
  );
}
