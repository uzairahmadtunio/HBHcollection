import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Phone, MessageCircle, Printer, Search, X, Download, CheckCircle2, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { statusTone, ORDER_STATUSES, tbl } from "@/lib/admin";
import { formatPKR } from "@/lib/shop";
import {
  COURIERS,
  customerWaLink,
  paymentProofUrl,
  paymentVerifiedMessage,
  shippedCustomerMessage,
  timeAgo,
} from "@/lib/orders";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

type Item = {
  id: string;
  product_name: string | null;
  size: string | null;
  color: string | null;
  quantity: number | null;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: Record<string, unknown> | null;
  payment_method: string | null;
  payment_tid: string | null;
  payment_screenshot_url: string | null;
  payment_verified: boolean | null;
  status: string;
  total: number;
  tracking_number: string | null;
  courier_name: string | null;
  estimated_delivery: string | null;
  created_at: string;
  notes: string | null;
  order_items: Item[];
};

const DATE_RANGES = ["All time", "Today", "Yesterday", "Last 7 days", "Last 30 days"] as const;
const PAYMENTS = ["All", "Cash on Delivery", "JazzCash", "Easypaisa", "Bank Transfer"] as const;
const PAY_STATUS = ["All", "Verified", "Pending Verification"] as const;
const SORTS = ["Newest first", "Oldest first", "Highest amount", "Lowest amount"] as const;
const TABS = ["All", ...ORDER_STATUSES] as const;

const ordersQueryKey = ["admin", "orders-full"];

function useOrders() {
  return useQuery({
    queryKey: ordersQueryKey,
    refetchInterval: 60_000, // polling fallback
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(id,product_name,size,color,quantity)")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Order[];
    },
  });
}

function addressOf(o: Order) {
  const a = (o.shipping_address ?? {}) as Record<string, unknown>;
  return [a.street ?? a.address, a.city, a.province, a.postal_code].filter(Boolean).map(String).join(", ");
}

function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders, isLoading } = useOrders();
  const [tab, setTab] = useState<string>("All");
  const [q, setQ] = useState("");
  const [range, setRange] = useState<string>("All time");
  const [payment, setPayment] = useState<string>("All");
  const [payStatus, setPayStatus] = useState<string>("All");
  const [sort, setSort] = useState<string>("Newest first");
  const [shipFor, setShipFor] = useState<Order | null>(null);
  const [proofFor, setProofFor] = useState<Order | null>(null);

  const rows = useMemo(() => {
    let list = [...(orders ?? [])];
    if (tab !== "All") list = list.filter((o) => o.status === tab);
    const needle = q.trim().toLowerCase();
    if (needle)
      list = list.filter((o) =>
        [o.order_number, o.customer_name, o.customer_phone].join(" ").toLowerCase().includes(needle),
      );
    if (range !== "All time") {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let from = new Date(0);
      let to = new Date(8640000000000);
      if (range === "Today") from = start;
      else if (range === "Yesterday") {
        from = new Date(start.getTime() - 86400000);
        to = start;
      } else if (range === "Last 7 days") from = new Date(start.getTime() - 7 * 86400000);
      else if (range === "Last 30 days") from = new Date(start.getTime() - 30 * 86400000);
      list = list.filter((o) => {
        const d = new Date(o.created_at);
        return d >= from && d < to;
      });
    }
    if (payment !== "All") list = list.filter((o) => (o.payment_method ?? "") === payment);
    if (payStatus === "Verified") list = list.filter((o) => o.payment_verified === true);
    if (payStatus === "Pending Verification")
      list = list.filter((o) => o.payment_verified !== true && o.payment_method !== "Cash on Delivery");
    if (sort === "Oldest first") list.reverse();
    if (sort === "Highest amount") list.sort((a, b) => Number(b.total) - Number(a.total));
    if (sort === "Lowest amount") list.sort((a, b) => Number(a.total) - Number(b.total));
    return list;
  }, [orders, tab, q, range, payment, payStatus, sort]);

  const all = orders ?? [];
  const today = new Date().toDateString();
  const stats = [
    { label: "New Orders", dot: "bg-primary", value: all.filter((o) => o.status === "pending").length },
    { label: "Processing", dot: "bg-gold", value: all.filter((o) => o.status === "confirmed" || o.status === "processing").length },
    { label: "Shipped", dot: "bg-gold", value: all.filter((o) => o.status === "shipped").length },
    {
      label: "Delivered Today",
      dot: "bg-success",
      value: all.filter((o) => o.status === "delivered" && new Date(o.created_at).toDateString() === today).length,
    },
  ];

  const refresh = () => qc.invalidateQueries({ queryKey: ordersQueryKey });

  async function updateStatus(o: Order, status: string) {
    if (status === "shipped") {
      setShipFor(o);
      return;
    }
    const patch: Record<string, unknown> = { status };
    if (status === "delivered") patch.delivered_at = new Date().toISOString();
    if (status === "confirmed") patch.confirmed_at = new Date().toISOString();
    const { error } = await tbl("orders").update(patch).eq("id", o.id);
    if (error) return toast.error(error.message);
    toast.success(`Order ${o.order_number} → ${status}`);
    refresh();
  }

  async function verifyPayment(o: Order, verified: boolean) {
    const patch: Record<string, unknown> = { payment_verified: verified };
    if (verified) {
      patch.status = "confirmed";
      patch.confirmed_at = new Date().toISOString();
    }
    const { error } = await tbl("orders").update(patch).eq("id", o.id);
    if (error) return toast.error(error.message);
    setProofFor(null);
    refresh();
    if (verified) {
      toast.success("Payment verified — order confirmed");
      window.open(customerWaLink(o.customer_phone, paymentVerifiedMessage(o.order_number)), "_blank", "noopener");
    } else {
      toast.message("Payment rejected — contact the customer");
      window.open(
        customerWaLink(
          o.customer_phone,
          `Hi ${o.customer_name}, we could not verify the payment for order #${o.order_number}. Please share a valid receipt. — HBH Collection`,
        ),
        "_blank",
        "noopener",
      );
    }
  }

  const chip = "heading whitespace-nowrap border px-3 py-2 text-[10px] tracking-[0.15em]";
  const input = "border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-gold";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-4xl">ORDERS</h1>
        <p className="text-sm text-muted-foreground">Verify payments, update status and notify customers.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-border bg-surface p-4">
            <p className="heading flex items-center gap-2 text-[10px] tracking-[0.15em] text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${s.dot}`} /> {s.label.toUpperCase()}
            </p>
            <p className="display mt-2 text-3xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`${chip} ${tab === t ? "border-gold text-gold" : "border-border text-muted-foreground"}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order #, customer or phone"
            className={`${input} w-full pl-9`}
          />
        </div>
        <Select value={range} onChange={setRange} options={DATE_RANGES as readonly string[]} className={input} />
        <Select value={payment} onChange={setPayment} options={PAYMENTS as readonly string[]} className={input} />
        <Select value={payStatus} onChange={setPayStatus} options={PAY_STATUS as readonly string[]} className={input} />
        <Select value={sort} onChange={setSort} options={SORTS as readonly string[]} className={input} />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading orders…</p>
      ) : !rows.length ? (
        <p className="border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
          No orders match these filters.
        </p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {rows.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              onStatus={updateStatus}
              onProof={() => setProofFor(o)}
            />
          ))}
        </div>
      )}

      {shipFor && (
        <ShipModal
          order={shipFor}
          onClose={() => setShipFor(null)}
          onSaved={() => {
            setShipFor(null);
            refresh();
          }}
        />
      )}
      {proofFor && (
        <ProofModal order={proofFor} onClose={() => setProofFor(null)} onDecide={verifyPayment} />
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  className?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function OrderCard({
  order: o,
  onStatus,
  onProof,
}: {
  order: Order;
  onStatus: (o: Order, status: string) => void;
  onProof: () => void;
}) {
  const cod = o.payment_method === "Cash on Delivery";
  return (
    <article className="border border-border bg-surface p-5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="heading text-sm">
          #{o.order_number} <span className="text-xs text-muted-foreground">· {timeAgo(o.created_at)}</span>
        </p>
        <span className={`heading border px-2 py-0.5 text-[9px] tracking-[0.15em] ${statusTone(o.status)}`}>
          {o.status.toUpperCase()}
        </span>
      </div>

      <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <p>👤 {o.customer_name} · 📞 {o.customer_phone}</p>
        <p className="mt-1">📍 {addressOf(o) || "—"}</p>
      </div>

      <ul className="mt-3 border-t border-border pt-3 text-xs">
        {(o.order_items ?? []).map((it) => (
          <li key={it.id} className="text-muted-foreground">
            🛍️ {it.product_name}
            {it.size || it.color ? ` (${[it.size, it.color].filter(Boolean).join(", ")})` : ""} x{it.quantity ?? 1}
          </li>
        ))}
      </ul>

      <div className="mt-3 space-y-1 border-t border-border pt-3 text-xs">
        <p>
          <span className="text-gold">{formatPKR(Number(o.total ?? 0))}</span> · {o.payment_method ?? "—"}
        </p>
        {!cod && (
          <p className="text-muted-foreground">
            TID: {o.payment_tid || "—"}
            {o.payment_screenshot_url && (
              <button onClick={onProof} className="ml-2 text-gold underline">
                View Screenshot
              </button>
            )}
          </p>
        )}
        {!cod && (
          <p className={o.payment_verified ? "text-success" : "text-primary"}>
            Payment: {o.payment_verified ? "✅ Verified" : "⏳ Pending"}
          </p>
        )}
        {o.tracking_number && (
          <p className="text-muted-foreground">
            {o.courier_name ?? "Courier"}: <span className="text-gold">{o.tracking_number}</span>
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {!cod && !o.payment_verified && (
          <button
            onClick={onProof}
            className="heading border border-success px-3 py-2 text-[10px] tracking-[0.15em] text-success"
          >
            VERIFY PAYMENT
          </button>
        )}
        <select
          value={o.status}
          onChange={(e) => onStatus(o, e.target.value)}
          className="border border-border bg-background px-2 py-2 text-[11px]"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <a href={`tel:${o.customer_phone}`} className="border border-border p-2" title="Call">
          <Phone className="h-3.5 w-3.5" />
        </a>
        <a
          href={customerWaLink(o.customer_phone, `Hi ${o.customer_name}, regarding your order #${o.order_number} —`)}
          target="_blank"
          rel="noreferrer"
          className="border border-success p-2 text-success"
          title="WhatsApp"
        >
          <MessageCircle className="h-3.5 w-3.5" />
        </a>
        <button onClick={() => window.print()} className="border border-border p-2" title="Print">
          <Printer className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

function ShipModal({ order, onClose, onSaved }: { order: Order; onClose: () => void; onSaved: () => void }) {
  const [courier, setCourier] = useState<string>(order.courier_name ?? COURIERS[0]);
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [eta, setEta] = useState(order.estimated_delivery ?? "");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!tracking.trim()) return toast.error("Tracking number is required");
    setBusy(true);
    const { error } = await tbl("orders")
      .update({
        status: "shipped",
        courier_name: courier,
        tracking_number: tracking.trim(),
        estimated_delivery: eta || null,
        shipped_at: new Date().toISOString(),
      })
      .eq("id", order.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Order marked shipped");
    window.open(
      customerWaLink(
        order.customer_phone,
        shippedCustomerMessage({
          orderNumber: order.order_number,
          courier,
          trackingNumber: tracking.trim(),
          estimated: eta || null,
        }),
      ),
      "_blank",
      "noopener",
    );
    onSaved();
  };

  const field = "w-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold";

  return (
    <Modal title="Enter Tracking Details" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="heading mb-1 block text-[10px] tracking-[0.2em] text-muted-foreground">COURIER</label>
          <select value={courier} onChange={(e) => setCourier(e.target.value)} className={field}>
            {COURIERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="heading mb-1 block text-[10px] tracking-[0.2em] text-muted-foreground">
            TRACKING NUMBER *
          </label>
          <input value={tracking} onChange={(e) => setTracking(e.target.value)} className={field} />
        </div>
        <div>
          <label className="heading mb-1 block text-[10px] tracking-[0.2em] text-muted-foreground">
            ESTIMATED DELIVERY
          </label>
          <input type="date" value={eta} onChange={(e) => setEta(e.target.value)} className={field} />
        </div>
        <button
          disabled={busy}
          onClick={save}
          className="heading flex w-full items-center justify-center gap-2 bg-primary py-3 text-[11px] tracking-[0.2em] text-primary-foreground disabled:opacity-60"
        >
          <Truck className="h-4 w-4" /> {busy ? "SAVING…" : "SAVE & NOTIFY"}
        </button>
      </div>
    </Modal>
  );
}

function ProofModal({
  order,
  onClose,
  onDecide,
}: {
  order: Order;
  onClose: () => void;
  onDecide: (o: Order, verified: boolean) => void;
}) {
  const { data: url } = useQuery({
    queryKey: ["payment-proof", order.id],
    queryFn: () => (order.payment_screenshot_url ? paymentProofUrl(order.payment_screenshot_url) : null),
  });

  return (
    <Modal title={`Payment · #${order.order_number}`} onClose={onClose}>
      {url ? (
        <img src={url} alt="Payment screenshot" className="max-h-[50vh] w-full object-contain" />
      ) : (
        <p className="text-sm text-muted-foreground">No screenshot uploaded.</p>
      )}
      <div className="mt-4 space-y-1 text-sm">
        <p className="text-muted-foreground">TID: <span className="text-foreground">{order.payment_tid || "—"}</span></p>
        <p className="text-muted-foreground">Amount: <span className="text-gold">{formatPKR(Number(order.total ?? 0))}</span></p>
        <p className="text-muted-foreground">Method: <span className="text-foreground">{order.payment_method ?? "—"}</span></p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => onDecide(order, true)}
          className="heading flex items-center gap-2 border border-success px-4 py-2 text-[10px] tracking-[0.15em] text-success"
        >
          <CheckCircle2 className="h-4 w-4" /> VERIFY PAYMENT
        </button>
        <button
          onClick={() => onDecide(order, false)}
          className="heading flex items-center gap-2 border border-primary px-4 py-2 text-[10px] tracking-[0.15em] text-primary"
        >
          <X className="h-4 w-4" /> REJECT · CONTACT CUSTOMER
        </button>
        {url && (
          <a
            href={url}
            download
            target="_blank"
            rel="noreferrer"
            className="heading flex items-center gap-2 border border-border px-4 py-2 text-[10px] tracking-[0.15em]"
          >
            <Download className="h-4 w-4" /> DOWNLOAD
          </a>
        )}
      </div>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-border bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="heading text-xs tracking-[0.2em] text-gold">{title.toUpperCase()}</h2>
          <button onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
