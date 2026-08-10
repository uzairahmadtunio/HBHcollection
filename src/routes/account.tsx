import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, LogOut, Package, RotateCcw, UserRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { productsQuery } from "@/lib/data";
import { formatPKR } from "@/lib/shop";
import { useShop } from "@/lib/shop-store";
import { useAuth, useSignOut, PROVINCES } from "@/lib/auth";
import { getOrCreateCustomer, saveCustomerProfile, type CustomerProfile } from "@/lib/customer";
import { ProductCard } from "@/components/site/ProductCard";
import { statusTone } from "@/lib/admin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — HBH Collection" },
      {
        name: "description",
        content: "Manage your HBH Collection profile, orders, wishlist and return requests.",
      },
      { property: "og:title", content: "My Account — HBH Collection" },
      { property: "og:description", content: "Profile, orders, wishlist and returns." },
    ],
  }),
  component: AccountPage,
});

const TABS = [
  { key: "profile", label: "Profile", icon: UserRound },
  { key: "orders", label: "My Orders", icon: Package },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "returns", label: "Returns", icon: RotateCcw },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function AccountPage() {
  const { user, loading, displayName } = useAuth();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("profile");

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-24 text-center text-sm text-muted-foreground">
        Loading your account…
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="display gold-rule mb-4 text-5xl">MY ACCOUNT</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to see your orders, wishlist and returns.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link
            to="/login"
            className="heading border border-gold py-4 text-[11px] tracking-[0.2em] text-gold"
          >
            LOGIN
          </Link>
          <Link
            to="/signup"
            className="heading bg-primary py-4 text-[11px] tracking-[0.2em] text-primary-foreground"
          >
            CREATE ACCOUNT
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-5xl">MY ACCOUNT</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hi {displayName || "there"} — {user.email}
          </p>
        </div>
        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
          className="heading flex items-center gap-2 border border-border px-4 py-2.5 text-[10px] tracking-[0.2em] hover:border-primary hover:text-primary"
        >
          <LogOut className="h-3.5 w-3.5" /> LOGOUT
        </button>
      </div>

      <div className="no-scrollbar mt-8 flex gap-6 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "heading flex shrink-0 items-center gap-2 pb-3 text-xs tracking-widest",
              tab === t.key ? "border-b-2 border-gold text-gold" : "text-muted-foreground",
            )}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="py-8">
        {tab === "profile" && <ProfileTab email={user.email ?? ""} />}
        {tab === "orders" && <OrdersTab />}
        {tab === "wishlist" && <WishlistTab />}
        {tab === "returns" && <ReturnsTab />}
      </div>
    </main>
  );
}

function ProfileTab({ email }: { email: string }) {
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["customer-profile"],
    queryFn: getOrCreateCustomer,
  });
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    street: "",
    city: "",
    province: "",
    postal_code: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const a = profile.default_address ?? {};
    setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      street: a.street ?? "",
      city: a.city ?? "",
      province: a.province ?? "",
      postal_code: a.postal_code ?? "",
    });
  }, [profile?.id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await saveCustomerProfile({
        full_name: form.full_name,
        phone: form.phone,
        default_address: {
          street: form.street,
          city: form.city,
          province: form.province,
          postal_code: form.postal_code,
        },
      });
      await qc.invalidateQueries({ queryKey: ["customer-profile"] });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-gold";

  return (
    <form onSubmit={save} className="max-w-xl space-y-4">
      <div>
        <label className="heading mb-1.5 block text-[10px] tracking-[0.2em] text-muted-foreground">
          EMAIL
        </label>
        <input value={email} readOnly className={cn(field, "opacity-60")} />
      </div>
      <div>
        <label className="heading mb-1.5 block text-[10px] tracking-[0.2em] text-muted-foreground">
          FULL NAME
        </label>
        <input
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className={field}
        />
      </div>
      <div>
        <label className="heading mb-1.5 block text-[10px] tracking-[0.2em] text-muted-foreground">
          PHONE
        </label>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="03XX-XXXXXXX"
          className={field}
        />
      </div>
      <p className="heading pt-2 text-[10px] tracking-[0.2em] text-gold">DEFAULT ADDRESS</p>
      <input
        value={form.street}
        onChange={(e) => setForm({ ...form, street: e.target.value })}
        placeholder="Street address"
        className={field}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          placeholder="City"
          className={field}
        />
        <select
          value={form.province}
          onChange={(e) => setForm({ ...form, province: e.target.value })}
          className={field}
        >
          <option value="">Province…</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <input
        value={form.postal_code}
        onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
        placeholder="Postal code"
        className={field}
      />
      <button
        type="submit"
        disabled={busy}
        className="heading w-full bg-primary py-4 text-[11px] tracking-[0.25em] text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
      >
        {busy ? "SAVING…" : "SAVE CHANGES"}
      </button>
    </form>
  );
}

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  tracking_number: string | null;
};

function OrdersTab() {
  const qc = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async (): Promise<OrderRow[]> => {
      const customer = await getOrCreateCustomer();
      const { data: auth } = await supabase.auth.getUser();
      const email = auth.user?.email ?? "";
      const digits = (customer?.phone ?? "").replace(/\D/g, "");
      const filters: string[] = [];
      if (customer?.id) filters.push(`customer_id.eq.${customer.id}`);
      if (email) filters.push(`customer_email.eq.${email}`);
      if (digits.length >= 10) filters.push(`customer_phone.eq.${customer?.phone}`);
      if (!filters.length) return [];
      const { data } = await supabase
        .from("orders")
        .select("id,order_number,status,total,created_at,tracking_number,courier_name,payment_method,payment_verified")
        .or(filters.join(","))
        .order("created_at", { ascending: false });
      return (data ?? []) as OrderRow[];
    },
  });

  // FIX 3C — new orders appear instantly.
  useEffect(() => {
    const channel = supabase
      .channel("my-orders-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        qc.invalidateQueries({ queryKey: ["my-orders"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading orders…</p>;

  if (!orders?.length) {
    return (
      <div className="border border-border bg-surface p-10 text-center">
        <p className="heading text-sm">NO ORDERS YET</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Orders placed as a guest can still be found on the tracking page.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/men"
            className="heading bg-primary px-6 py-3 text-[11px] tracking-[0.2em] text-primary-foreground"
          >
            START SHOPPING
          </Link>
          <Link to="/track" className="heading border border-gold px-6 py-3 text-[11px] tracking-[0.2em] text-gold">
            TRACK AN ORDER
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div
          key={o.id}
          className="flex flex-wrap items-center justify-between gap-4 border border-border bg-surface p-5"
        >
          <div>
            <p className="heading text-sm">{o.order_number}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(o.created_at).toLocaleDateString()} · {formatPKR(Number(o.total ?? 0))}
            </p>
            {o.tracking_number && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Tracking: <span className="text-gold">{o.tracking_number}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "heading border px-3 py-1.5 text-[10px] tracking-[0.15em]",
                statusTone(o.status),
              )}
            >
              {o.status.toUpperCase()}
            </span>
            <Link to="/track" className="text-xs text-gold underline">
              Track
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function WishlistTab() {
  const { wishlist } = useShop();
  const { data: products } = useQuery(productsQuery);
  const saved = (products ?? []).filter((p) => wishlist.includes(p.id));

  if (!saved.length) {
    return (
      <div className="border border-border bg-surface p-10 text-center">
        <p className="heading text-sm">YOUR WISHLIST IS EMPTY</p>
        <Link
          to="/new-arrivals"
          className="heading mt-6 inline-block bg-primary px-6 py-3 text-[11px] tracking-[0.2em] text-primary-foreground"
        >
          BROWSE NEW ARRIVALS
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {saved.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

type ReturnRow = {
  id: string;
  order_id: string | null;
  item_name: string | null;
  reason: string | null;
  status: string;
  created_at: string;
};

const REASONS = ["Wrong size", "Damaged item", "Not as described", "Changed my mind", "Other"];

function ReturnsTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    order_number: "",
    phone: "",
    item_name: "",
    reason: REASONS[0],
    description: "",
  });
  const [busy, setBusy] = useState(false);

  const { data: requests } = useQuery({
    queryKey: ["my-returns"],
    queryFn: async (): Promise<ReturnRow[]> => {
      const customer = await getOrCreateCustomer();
      if (!customer) return [];
      const { data } = await supabase
        .from("orders")
        .select("id")
        .eq("customer_id", customer.id);
      const ids = (data ?? []).map((o) => o.id);
      if (!ids.length) return [];
      const { data: rows } = await supabase
        .from("return_requests")
        .select("id,order_id,item_name,reason,status,created_at")
        .in("order_id", ids)
        .order("created_at", { ascending: false });
      return (rows ?? []) as ReturnRow[];
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const customer = await getOrCreateCustomer();
      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", form.order_number.trim().toUpperCase())
        .maybeSingle();
      const { error } = await supabase.from("return_requests").insert({
        order_id: order?.id ?? null,
        customer_name: customer?.full_name ?? "Customer",
        customer_phone: form.phone || customer?.phone || "",
        item_name: form.item_name,
        reason: form.reason,
        description: form.description,
      });
      if (error) throw new Error(error.message);
      toast.success("Return request submitted — our team will contact you within 24 hours");
      setForm({ order_number: "", phone: "", item_name: "", reason: REASONS[0], description: "" });
      await qc.invalidateQueries({ queryKey: ["my-returns"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit request");
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-gold";

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form onSubmit={submit} className="space-y-4">
        <h2 className="heading text-xs tracking-[0.2em] text-gold">REQUEST A RETURN</h2>
        <input
          required
          value={form.order_number}
          onChange={(e) => setForm({ ...form, order_number: e.target.value })}
          placeholder="Order number (e.g. HBH-1234)"
          className={field}
        />
        <input
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Phone used on the order"
          className={field}
        />
        <input
          required
          value={form.item_name}
          onChange={(e) => setForm({ ...form, item_name: e.target.value })}
          placeholder="Item name"
          className={field}
        />
        <select
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          className={field}
        >
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Tell us more…"
          className={field}
        />
        <button
          type="submit"
          disabled={busy}
          className="heading w-full bg-primary py-4 text-[11px] tracking-[0.25em] text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
        >
          {busy ? "SUBMITTING…" : "SUBMIT REQUEST"}
        </button>
        <p className="text-[11px] text-muted-foreground">
          Returns accepted within 7 days of delivery. See our{" "}
          <Link to="/returns" className="text-gold underline">
            returns policy
          </Link>
          .
        </p>
      </form>

      <div>
        <h2 className="heading mb-4 text-xs tracking-[0.2em] text-gold">YOUR REQUESTS</h2>
        {!requests?.length && (
          <p className="text-sm text-muted-foreground">No return requests yet.</p>
        )}
        <div className="space-y-3">
          {(requests ?? []).map((r) => (
            <div key={r.id} className="border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="heading text-sm">{r.item_name}</p>
                <span
                  className={cn(
                    "heading border px-2.5 py-1 text-[10px] tracking-[0.15em]",
                    statusTone(r.status),
                  )}
                >
                  {(r.status ?? "pending").toUpperCase()}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {r.reason} · {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
