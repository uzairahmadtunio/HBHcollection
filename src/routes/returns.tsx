import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { pageQuery } from "@/lib/pages";
import { PageContent, PageHero } from "@/components/site/PageContent";
import { waLink } from "@/lib/shop";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Exchange Policy — HBH Collection" },
      {
        name: "description",
        content:
          "7-day easy returns and size exchanges on HBH Collection orders. See eligibility, steps and refund timelines.",
      },
      { property: "og:title", content: "Returns & Exchange Policy — HBH Collection" },
      {
        property: "og:description",
        content: "If something isn't right, we'll make it right — 7-day returns across Pakistan.",
      },
    ],
  }),
  component: ReturnsPage,
});

const YES = [
  "Item is unused and unwashed",
  "Original tags are still attached",
  "Item is in original packaging",
  "Return is requested within 7 days of delivery",
  "Item is defective, damaged, or incorrect",
];

const NO = [
  "Item has been worn or washed",
  "Tags have been removed",
  "More than 7 days have passed since delivery",
  "Item is from our SALE section (unless defective)",
  "Item was a custom or made-to-order product",
];

const STEPS = [
  "WhatsApp us at +92 311-2578079 within 7 days. Send your Order Number (HBH-XXXXXX) and reason for return.",
  "Send clear photos of the item showing the issue (for defective/incorrect items).",
  "We'll confirm your return/exchange and provide the return address.",
  "Pack the item securely and send it via any courier service.",
  "Once we receive and inspect the item, we'll process your exchange or refund within 3-5 working days.",
];

function ReturnsPage() {
  const { data: page } = useQuery(pageQuery("returns"));

  return (
    <main>
      <PageHero
        eyebrow="CUSTOMER CARE"
        title="7-DAY EASY RETURNS & EXCHANGE"
        subtitle="We want you to love what you bought. If something isn't right, we'll make it right."
      />

      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="border border-success/40 bg-surface p-6">
            <p className="heading text-xs tracking-[0.2em] text-success">
              WE ACCEPT RETURNS IF
            </p>
            <ul className="mt-4 space-y-3">
              {YES.map((t) => (
                <li key={t} className="flex gap-3 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-primary/40 bg-surface p-6">
            <p className="heading text-xs tracking-[0.2em] text-primary">
              WE DO NOT ACCEPT RETURNS IF
            </p>
            <ul className="mt-4 space-y-3">
              {NO.map((t) => (
                <li key={t} className="flex gap-3 text-sm text-muted-foreground">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h2 className="heading gold-rule mb-6 mt-16 text-sm tracking-[0.25em] text-gold">
          HOW TO RETURN OR EXCHANGE
        </h2>
        <ol className="space-y-4">
          {STEPS.map((s, i) => (
            <li key={i} className="flex gap-5 border border-border bg-surface p-5">
              <span className="display text-3xl leading-none text-gold">{i + 1}</span>
              <p className="text-sm leading-relaxed text-muted-foreground">{s}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16">
          <PageContent content={page?.content ?? ""} />
        </div>

        <div className="mt-16 border border-gold/50 bg-surface p-8 text-center">
          <p className="heading text-xs tracking-[0.2em]">START YOUR RETURN PROCESS NOW</p>
          <p className="mt-2 text-sm text-muted-foreground">WhatsApp: +92 311-2578079</p>
          <a
            href={waLink("Hi HBH Collection! I want to return/exchange my order.")}
            target="_blank"
            rel="noreferrer"
            className="heading mt-5 inline-flex bg-success px-8 py-4 text-xs tracking-[0.2em] text-background"
          >
            WHATSAPP US
          </a>
        </div>
      </div>
    </main>
  );
}
