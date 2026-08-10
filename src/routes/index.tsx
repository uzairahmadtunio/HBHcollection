import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Package, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { bannersQuery, productsQuery, settingsQuery } from "@/lib/data";
import { ProductCard } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HBH Collection — Premium T-Shirts, Jeans & Shirts in Pakistan" },
      {
        name: "description",
        content:
          "Shop HBH Collection: premium T-shirts, jeans, shirts and more. Free delivery above PKR 2,000, all over Pakistan. COD, JazzCash & Easypaisa.",
      },
      { property: "og:title", content: "HBH Collection — Premium Pakistani Fashion" },
      {
        property: "og:description",
        content: "Premium streetwear-inspired fashion with delivery all over Pakistan.",
      },
    ],
  }),
  component: Home,
});

function Hero() {
  const { data: banners } = useQuery(bannersQuery);
  const slides = banners ?? [];
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = window.setInterval(() => setI((p) => (p + 1) % slides.length), 6000);
    return () => window.clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return <div className="h-[70vh] bg-surface" />;

  return (
    <section className="relative h-[85vh] min-h-125 overflow-hidden">
      {slides.map((b, idx) => (
        <div
          key={b.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            idx === i ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <img src={b.image_url ?? ""} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/30" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-7xl px-4 pb-24">
              <p className="heading mb-3 text-[11px] tracking-[0.4em] text-gold">HBH COLLECTION</p>
              <h1 className="display max-w-3xl text-6xl sm:text-8xl lg:text-9xl">{b.title}</h1>
              <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
                {b.subtitle}
              </p>
              <Link
                to={b.cta_link ?? "/men"}
                className="heading mt-8 inline-flex bg-primary px-9 py-4 text-xs tracking-[0.2em] text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                {(b.cta_text ?? "SHOP NOW").toUpperCase()}
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button
        aria-label="Previous slide"
        onClick={() => setI((p) => (p - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border border-border bg-background/50 backdrop-blur hover:border-gold"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        aria-label="Next slide"
        onClick={() => setI((p) => (p + 1) % slides.length)}
        className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border border-border bg-background/50 backdrop-blur hover:border-gold"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            aria-label={`Slide ${idx + 1}`}
            onClick={() => setI(idx)}
            className={cn("h-1 transition-all", idx === i ? "w-10 bg-gold" : "w-4 bg-border")}
          />
        ))}
      </div>
    </section>
  );
}

const GENDER_TILES = [
  {
    label: "MEN",
    to: "/men" as const,
    img: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&q=80&fm=webp",
  },
  {
    label: "WOMEN",
    to: "/women" as const,
    img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80&fm=webp",
  },
  {
    label: "KIDS",
    to: "/kids" as const,
    img: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80&fm=webp",
  },
];

function SectionTitle({ title, action }: { title: string; action?: ReactNodeLike }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <h2 className="display gold-rule text-4xl sm:text-5xl">{title}</h2>
      {action}
    </div>
  );
}
type ReactNodeLike = React.ReactNode;

function Newsletter() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <section className="bg-primary py-16">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="display text-5xl text-primary-foreground">GET 10% OFF</h2>
        <p className="mt-2 text-sm text-primary-foreground/80">
          Subscribe and get 10% off your first HBH Collection order.
        </p>
        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!email.includes("@")) return toast.error("Enter a valid email address");
            setBusy(true);
            const { error } = await supabase
              .from("newsletter_subscribers")
              .insert({ email: email.trim().toLowerCase() });
            setBusy(false);
            if (error && !error.message.includes("duplicate")) return toast.error(error.message);
            toast.success("Subscribed! Use code HBH10 at checkout.");
            setEmail("");
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 border border-primary-foreground/30 bg-background/20 px-4 py-3.5 text-sm text-primary-foreground outline-none placeholder:text-primary-foreground/60 focus:border-gold"
          />
          <button
            disabled={busy}
            className="heading bg-background px-8 py-3.5 text-xs tracking-[0.2em] text-gold disabled:opacity-60"
          >
            {busy ? "…" : "SUBSCRIBE"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Home() {
  const { data: products } = useQuery(productsQuery);
  const { data: settings } = useQuery(settingsQuery);
  const all = products ?? [];
  const newArrivals = all.filter((p) => p.is_new_arrival);
  const bestsellers = all.filter((p) => p.is_bestseller);
  const onSale = all.filter((p) => p.is_on_sale);

  return (
    <main>
      <Hero />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-16 md:grid-cols-3">
        {GENDER_TILES.map((t) => (
          <Link
            key={t.label}
            to={t.to}
            className="group relative aspect-4/5 overflow-hidden border border-border"
          >
            <img
              src={t.img}
              alt={t.label}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-background/60 transition-colors group-hover:bg-background/35" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="display text-6xl">{t.label}</span>
              <span className="heading mt-2 text-[10px] tracking-[0.3em] text-gold opacity-0 transition-opacity group-hover:opacity-100">
                SHOP NOW →
              </span>
            </div>
          </Link>
        ))}
      </section>

      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <SectionTitle
            title="NEW ARRIVALS"
            action={
              <Link to="/new-arrivals" className="heading text-xs tracking-widest text-gold">
                VIEW ALL →
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {newArrivals.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {bestsellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <SectionTitle title="BESTSELLERS" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {bestsellers.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Truck, text: settings?.delivery_info ?? "Free Delivery Above PKR 2,000" },
            { icon: RotateCcw, text: settings?.return_policy ?? "7-Day Easy Returns" },
            { icon: ShieldCheck, text: "100% Genuine Products" },
            { icon: Package, text: "All Pakistan Delivery" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <Icon className="h-7 w-7 shrink-0 text-gold" />
              <span className="heading text-xs tracking-wide">{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="relative my-16 h-100 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80&fm=webp"
          alt="Premium T-shirts collection"
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h2 className="display text-5xl sm:text-7xl">PREMIUM T-SHIRTS COLLECTION 🔥</h2>
          <p className="heading mt-3 text-sm text-gold">STARTING FROM PKR 999</p>
          <Link
            to="/category/$slug"
            params={{ slug: "premium-t-shirts" }}
            className="heading mt-7 bg-primary px-9 py-4 text-xs tracking-[0.2em] text-primary-foreground hover:bg-primary-hover"
          >
            SHOP NOW
          </Link>
        </div>
      </section>

      {onSale.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <SectionTitle
            title="ON SALE"
            action={
              <Link to="/sale" className="heading text-xs tracking-widest text-primary">
                ALL DEALS →
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {onSale.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="display gold-rule mb-8 text-4xl sm:text-5xl">
          WHY CHOOSE HBH COLLECTION?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Premium Quality Fabric", "Sourced and tested for Pakistani weather."],
            ["Stitched With Precision", "Reinforced seams that survive real wear."],
            ["Sizes XS to XXL", "Fits for everyone, kids sizes included."],
            ["1000+ Happy Customers", "Trusted across all provinces of Pakistan."],
          ].map(([t, d]) => (
            <div key={t} className="border border-border bg-surface p-6">
              <h3 className="heading text-sm text-gold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="display mb-6 text-center text-4xl">FOLLOW US @HBH.COLLECTION</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {[
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80&fm=webp",
            "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&q=80&fm=webp",
            "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80&fm=webp",
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80&fm=webp",
            "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80&fm=webp",
            "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80&fm=webp",
          ].map((src) => (
            <a
              key={src}
              href={settings?.tiktok || "#"}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden border border-border"
            >
              <img
                src={src}
                alt="HBH Collection social post"
                loading="lazy"
                className="h-full w-full object-cover opacity-70 transition-opacity group-hover:opacity-100"
              />
            </a>
          ))}
        </div>
      </section>

      <Newsletter />
    </main>
  );
}
