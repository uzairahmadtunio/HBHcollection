import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Truck } from "lucide-react";
import { pageQuery } from "@/lib/pages";
import { PageContent, PageHero } from "@/components/site/PageContent";
import { zonesQuery } from "@/lib/data";
import { formatPKR, waLink } from "@/lib/shop";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping & Delivery Charges — HBH Collection Pakistan" },
      {
        name: "description",
        content:
          "Delivery charges, free shipping thresholds and estimated delivery times for every province of Pakistan.",
      },
      { property: "og:title", content: "Shipping & Delivery — HBH Collection" },
      {
        property: "og:description",
        content: "Fast, reliable delivery all over Pakistan. Free above PKR 2,000.",
      },
    ],
  }),
  component: ShippingPage,
});

const STEPS = [
  "Place your order on our website",
  "We process your order within 24 hours",
  "Order handed to courier",
  "You receive tracking info on WhatsApp",
  "Delivery to your door!",
];

function ShippingPage() {
  const { data: page } = useQuery(pageQuery("shipping"));
  const { data: zones } = useQuery(zonesQuery);

  return (
    <main>
      <PageHero
        eyebrow="DELIVERY"
        title="WE DELIVER ALL OVER PAKISTAN 🇵🇰"
        subtitle="Fast, reliable delivery to your doorstep."
      />

      <div className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="heading gold-rule mb-6 text-sm tracking-[0.25em] text-gold">
          DELIVERY CHARGES
        </h2>
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-surface">
              <tr className="heading text-[10px] tracking-[0.2em] text-muted-foreground">
                <th className="px-4 py-3">PROVINCE</th>
                <th className="px-4 py-3">CHARGE</th>
                <th className="px-4 py-3">FREE ABOVE</th>
                <th className="px-4 py-3">EST. DAYS</th>
              </tr>
            </thead>
            <tbody>
              {(zones ?? []).map((z) => (
                <tr key={z.id} className="border-t border-border">
                  <td className="px-4 py-3">{z.province}</td>
                  <td className="px-4 py-3">{formatPKR(z.charge)}</td>
                  <td className="px-4 py-3 text-gold">
                    {z.free_above ? formatPKR(z.free_above) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{z.est_days ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex items-start gap-4 border border-gold bg-surface p-6">
          <Truck className="mt-1 h-6 w-6 shrink-0 text-gold" />
          <div>
            <p className="heading text-xs tracking-[0.2em] text-gold">
              FREE DELIVERY ON ORDERS ABOVE PKR 2,000!
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              (PKR 3,000 for Balochistan, AJK &amp; Gilgit-Baltistan)
            </p>
          </div>
        </div>

        <h2 className="heading gold-rule mb-6 mt-16 text-sm tracking-[0.25em] text-gold">
          HOW IT WORKS
        </h2>
        <ol className="grid gap-4 md:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s} className="border border-border bg-surface p-5">
              <span className="display text-3xl text-gold">{i + 1}</span>
              <p className="mt-2 text-sm text-muted-foreground">{s}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16">
          <PageContent content={page?.content ?? ""} />
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2">
          <div className="border border-border bg-surface p-8 text-center">
            <p className="heading text-xs tracking-[0.2em]">ALREADY ORDERED?</p>
            <Link
              to="/track"
              className="heading mt-5 inline-flex bg-primary px-6 py-3 text-xs tracking-[0.2em] text-primary-foreground hover:bg-primary-hover"
            >
              TRACK ORDER
            </Link>
          </div>
          <div className="border border-border bg-surface p-8 text-center">
            <p className="heading text-xs tracking-[0.2em]">DELIVERY QUESTIONS?</p>
            <a
              href={waLink("Hi HBH Collection! I have a delivery question.")}
              target="_blank"
              rel="noreferrer"
              className="heading mt-5 inline-flex bg-success px-6 py-3 text-xs tracking-[0.2em] text-background"
            >
              WHATSAPP +92 311-2578079
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
