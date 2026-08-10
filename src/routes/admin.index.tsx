import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { listQuery, statusTone, type Row } from "@/lib/admin";
import { formatPKR } from "@/lib/shop";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: orders } = useQuery(listQuery("orders", { orderBy: "created_at", ascending: false }));
  const { data: products } = useQuery(listQuery("products"));
  const { data: customers } = useQuery(listQuery("customers"));
  const { data: messages } = useQuery(listQuery("contact_messages"));
  const { data: reviews } = useQuery(listQuery("reviews"));

  const all = orders ?? [];
  const revenue = all
    .filter((o) => o.status !== "cancelled" && o.status !== "returned")
    .reduce((s, o) => s + Number(o.total ?? 0), 0);
  const pending = all.filter((o) => o.status === "pending").length;
  const unread = (messages ?? []).filter((m) => !m.is_read).length;
  const unapproved = (reviews ?? []).filter((r) => !r.is_approved).length;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const dayOrders = all.filter((o) => String(o.created_at ?? "").slice(0, 10) === key);
    return {
      day: d.toLocaleDateString("en-PK", { weekday: "short" }),
      revenue: dayOrders.reduce((s, o) => s + Number(o.total ?? 0), 0),
      orders: dayOrders.length,
    };
  });

  const stats = [
    ["Total Orders", String(all.length)],
    ["Revenue", formatPKR(revenue)],
    ["Pending Orders", String(pending)],
    ["Products", String((products ?? []).length)],
    ["Customers", String((customers ?? []).length)],
    ["Unread Messages", String(unread)],
    ["Reviews To Approve", String(unapproved)],
    [
      "Avg Order Value",
      formatPKR(all.length ? revenue / Math.max(all.length, 1) : 0),
    ],
  ];

  return (
    <div>
      <h1 className="display text-3xl">DASHBOARD</h1>
      <p className="mt-1 text-sm text-muted-foreground">Store performance at a glance.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="border border-border bg-surface p-5">
            <p className="heading text-[10px] tracking-[0.2em] text-muted-foreground">
              {label.toUpperCase()}
            </p>
            <p className="display mt-2 text-3xl text-gold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 border border-border bg-surface p-5">
        <h2 className="heading mb-4 text-xs tracking-[0.2em] text-gold">LAST 7 DAYS</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days}>
              <CartesianGrid stroke="hsl(0 0% 20%)" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(0 0% 55%)" fontSize={11} />
              <YAxis stroke="hsl(0 0% 55%)" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid #333", fontSize: 12 }}
                formatter={(v: number) => formatPKR(v)}
              />
              <Bar dataKey="revenue" fill="#C9A84C" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="heading text-xs tracking-[0.2em] text-gold">RECENT ORDERS</h2>
            <Link to="/admin/orders" className="text-xs text-muted-foreground hover:text-gold">
              View all
            </Link>
          </div>
          <ul>
            {all.slice(0, 6).map((o: Row) => (
              <li
                key={String(o.id)}
                className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 text-sm last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate">{String(o.order_number)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {String(o.customer_name ?? "")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gold">{formatPKR(Number(o.total ?? 0))}</p>
                  <span
                    className={`heading mt-1 inline-block border px-2 py-0.5 text-[9px] tracking-[0.15em] ${statusTone(
                      String(o.status),
                    )}`}
                  >
                    {String(o.status).toUpperCase()}
                  </span>
                </div>
              </li>
            ))}
            {!all.length && <li className="px-5 py-6 text-sm text-muted-foreground">No orders yet.</li>}
          </ul>
        </section>

        <section className="border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="heading text-xs tracking-[0.2em] text-gold">OUT OF STOCK</h2>
            <Link to="/admin/products" className="text-xs text-muted-foreground hover:text-gold">
              Manage
            </Link>
          </div>
          <ul>
            {(products ?? [])
              .filter((p) => p.stock_status !== "in_stock")
              .slice(0, 6)
              .map((p) => (
                <li
                  key={String(p.id)}
                  className="flex items-center justify-between border-b border-border px-5 py-3 text-sm last:border-0"
                >
                  <span className="truncate">{String(p.name)}</span>
                  <span className="text-xs text-primary">
                    {String(p.stock_status).replace("_", " ")}
                  </span>
                </li>
              ))}
            {!(products ?? []).some((p) => p.stock_status !== "in_stock") && (
              <li className="px-5 py-6 text-sm text-muted-foreground">
                Everything is in stock. 🎉
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
