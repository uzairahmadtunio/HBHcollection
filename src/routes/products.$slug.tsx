import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { productsQuery, reviewsQuery, settingsQuery, variantsQuery, zonesQuery, stockBySize } from "@/lib/data";
import { discountPercent, formatPKR, SIZE_CHART, waLink } from "@/lib/shop";
import { pushRecentlyViewed, useShop } from "@/lib/shop-store";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/upload";
import { ProductCard } from "@/components/site/ProductCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => {
    const pretty = params.slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    return {
      meta: [
        { title: `${pretty} — HBH Collection` },
        { name: "description", content: `Buy ${pretty} from HBH Collection. Delivery all over Pakistan, COD available.` },
        { property: "og:title", content: `${pretty} — HBH Collection` },
        { property: "og:description", content: `Buy ${pretty} with delivery all over Pakistan.` },
      ],
    };
  },
  component: ProductPage,
});

const TABS = ["Description", "Size & Fit", "Material & Care", "Reviews"] as const;
const FIT_OPTIONS = ["Slim", "Regular", "Loose", "Oversized"] as const;

function parseHeightCm(input: string, feet: number, inches: number) {
  const raw = input.trim().toLowerCase();
  if (raw) {
    const parsed = raw.match(/^(\d+)(?:[.,]\s*(\d+))?\s*(?:ft|feet|')?\s*(\d+)?\s*(?:in|inches|")?$/);
    if (parsed) {
      const feetPart = Number(parsed[1]);
      let inchesPart = 0;
      if (parsed[3]) {
        inchesPart = Number(parsed[3]);
      } else if (parsed[2]) {
        const decimals = parsed[2];
        const parsedInches = Number(decimals);
        if (parsedInches <= 12) {
          inchesPart = parsedInches;
        } else {
          inchesPart = Math.round(Number(`0.${decimals}`) * 12);
        }
      }
      const totalInches = feetPart * 12 + inchesPart;
      if (totalInches > 0) return totalInches * 2.54;
    }

    const numeric = Number(raw.replace(/[^0-9.]/g, ""));
    if (!Number.isNaN(numeric) && numeric > 0) {
      if (numeric < 10) {
        const feetPart = Math.floor(numeric);
        const remainder = numeric - feetPart;
        const decimalPart = raw.includes(".") ? raw.split(".")[1] : "";
        if (decimalPart) {
          const digits = Number(decimalPart);
          if (digits <= 12) {
            return (feetPart * 12 + digits) * 2.54;
          }
        }
        const inchesPart = Math.round(remainder * 12);
        return (feetPart * 12 + inchesPart) * 2.54;
      }
      return numeric;
    }
  }

  const totalInches = feet * 12 + inches;
  return totalInches * 2.54;
}

function recommendSize(heightCm: number, weightKg: number, fit: string, available: string[]) {
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const normalized = available.map((s) => s.toUpperCase());

  const getBaseSize = () => {
    if (weightKg <= 58) return "S";
    if (weightKg <= 68) return heightCm > 175 ? "L" : "M";
    if (weightKg <= 78) return heightCm > 178 ? "XL" : "L";
    if (weightKg <= 90) return heightCm > 182 ? "XXL" : "XL";
    return "XXL";
  };

  let recommended = getBaseSize();
  const fitKey = fit.toLowerCase();
  const sizeIndex = sizes.indexOf(recommended);

  if (fitKey === "loose" || fitKey === "oversized") {
    recommended = sizes[Math.min(sizes.length - 1, sizeIndex + 1)];
  } else if (fitKey === "slim") {
    recommended = sizes[Math.max(0, sizeIndex - 1)];
  }

  if (normalized.includes(recommended)) return available[normalized.indexOf(recommended)];

  const fallbackOrder = ["S", "M", "L", "XL", "XXL", "XS"];
  for (const size of fallbackOrder) {
    const index = normalized.indexOf(size);
    if (index !== -1) return available[index];
  }
  return available[0] ?? "One Size";
}

function viewersForProduct(slug: string) {
  if (typeof window === "undefined") return 0;
  const key = `hbh_product_viewers_${slug}`;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as { count: number; expiry: number } | null;
      if (parsed && parsed.expiry > Date.now()) return parsed.count;
    }
  } catch {
    /* ignore malformed saved state */
  }

  const count = 8 + Math.floor(Math.random() * 11);
  window.localStorage.setItem(key, JSON.stringify({ count, expiry: Date.now() + 30_000 }));
  return count;
}

function ProductPage() {
  const { slug } = useParams({ from: "/products/$slug" });
  const { data: products } = useQuery(productsQuery);
  const { data: settings } = useQuery(settingsQuery);
  const { data: zones } = useQuery(zonesQuery);
  const { data: variants } = useQuery(variantsQuery);
  const queryClient = useQueryClient();
  const { addToCart } = useShop();
  const { user } = useAuth();

  const product = (products ?? []).find((p) => p.slug === slug);
  const { data: reviews } = useQuery(reviewsQuery(product?.id));

  const [imgIdx, setImgIdx] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Description");
  const [viewers, setViewers] = useState(0);
  const [recommenderOpen, setRecommenderOpen] = useState(false);
  const [heightInput, setHeightInput] = useState("");
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(8);
  const [weightKg, setWeightKg] = useState("");
  const [fit, setFit] = useState<(typeof FIT_OPTIONS)[number]>("Regular");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewPhoto, setReviewPhoto] = useState<File | null>(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    if (!product) return;
    setColor(product.colors[0]?.name ?? "Default");
    setSize(product.sizes[0] ?? "One Size");
    pushRecentlyViewed(product.slug);
    setViewers(viewersForProduct(product.slug));
  }, [product?.id, product?.slug]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPageUrl(window.location.href);
  }, []);

  const stockMap = product ? stockBySize(variants, product.id) : null;
  const totalStock = stockMap ? Object.values(stockMap).reduce((sum, value) => sum + value, 0) : null;
  const isSoldOut = totalStock === 0 || (totalStock === null && product?.stock_status === "out_of_stock");
  const stockHint = totalStock === null
    ? product?.stock_status === "low_stock"
      ? "Low stock, order soon"
      : product?.stock_status === "out_of_stock"
      ? "Currently unavailable"
      : "In stock"
    : totalStock === 0
    ? "Out of stock"
    : totalStock <= 5
    ? `Only ${totalStock} left`
    : totalStock <= 15
    ? `${totalStock} available`
    : "In stock";

  useEffect(() => {
    if (product) {
      setColor(product.colors[0]?.name ?? "Default");
      setSize(product.sizes[0] ?? "One Size");
      pushRecentlyViewed(product.slug);
    }
  }, [product?.id]);

  const related = useMemo(
    () =>
      (products ?? [])
        .filter((p) => p.category_id === product?.category_id && p.id !== product?.id)
        .slice(0, 4),
    [products, product],
  );

  const completeLook = related.slice(0, 3);
  const canAddToCart = !isSoldOut;

  const addLookToCart = () => {
    completeLook.forEach((p) => {
      addToCart({
        productId: p.id,
        slug: p.slug,
        name: p.name,
        image: p.images[0] ?? "",
        price: p.price,
        size: p.sizes[0] ?? "One Size",
        color: p.colors[0]?.name ?? "Default",
        quantity: 1,
      });
    });
    toast.success("Added complete look to cart");
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!reviewComment.trim()) {
      toast.error("Please add a comment for your review.");
      return;
    }

    setReviewBusy(true);
    try {
      let photoUrl: string | null = null;
      if (reviewPhoto) {
        photoUrl = await uploadImage(reviewPhoto);
      }

      const customerName = user
        ? ((user.user_metadata as Record<string, unknown>)?.full_name as string) || user.email?.split("@")[0] || "Customer"
        : "Guest";
      const customerEmail = user?.email ?? null;

      const { error } = await supabase.from("reviews").insert({
        product_id: product.id,
        customer_name: customerName,
        customer_email: customerEmail,
        rating: reviewRating,
        title: reviewTitle || null,
        comment: reviewComment,
        photo_url: photoUrl,
        is_approved: false,
        is_verified: false,
        is_verified_buyer: false,
      });
      if (error) throw error;
      toast.success("Review submitted for approval.");
      setReviewRating(5);
      setReviewTitle("");
      setReviewComment("");
      setReviewPhoto(null);
      queryClient.invalidateQueries({ queryKey: ["reviews", product.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit review.");
    } finally {
      setReviewBusy(false);
    }
  };

  if (!product) {
    return <main className="mx-auto max-w-7xl px-4 py-24 text-center text-muted-foreground">Loading product…</main>;
  }

  const rating =
    (reviews ?? []).length > 0
      ? (reviews ?? []).reduce((n, r) => n + (r.rating ?? 0), 0) / (reviews ?? []).length
      : 0;
  const off = discountPercent(product);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-3/4 overflow-hidden border border-border bg-surface">
            <img src={product.images[imgIdx]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setImgIdx(i)}
                  className={cn("h-24 w-20 overflow-hidden border", i === imgIdx ? "border-gold" : "border-border")}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="heading text-[10px] tracking-[0.35em] text-gold">HBH COLLECTION</p>
          <h1 className="display mt-2 text-5xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={cn("h-4 w-4", n <= Math.round(rating) ? "fill-gold text-gold" : "text-border")} />
              ))}
            </span>
            {(reviews ?? []).length} review{(reviews ?? []).length === 1 ? "" : "s"}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="display text-4xl">{formatPKR(product.price)}</span>
            {product.original_price && product.original_price > product.price && (
              <>
                <span className="text-sm text-muted-foreground line-through">{formatPKR(product.original_price)}</span>
                <span className="heading bg-primary px-2 py-1 text-[10px] tracking-widest text-primary-foreground">
                  SAVE {formatPKR(product.original_price - product.price)} ({off}%)
                </span>
              </>
            )}
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
              {stockHint}
            </span>
            {viewers > 0 && (
              <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
                👀 {viewers} people are viewing this now
              </span>
            )}
          </div>

          {product.colors.length > 0 && (
            <div className="mt-7">
              <p className="heading mb-2 text-xs tracking-widest">COLOR: {color}</p>
              <div className="flex gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    title={c.name}
                    onClick={() => setColor(c.name)}
                    className={cn("h-9 w-9 rounded-full border-2", c.name === color ? "border-gold" : "border-border")}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <p className="heading text-xs tracking-widest">SIZE: {size}</p>
                <div className="flex gap-2">
                  <button onClick={() => setTab("Size & Fit")} className="text-xs text-gold underline">
                    Size Guide
                  </button>
                  <button
                    onClick={() => setRecommenderOpen(true)}
                    className="text-xs text-muted-foreground underline"
                  >
                    Size Recommender
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "min-w-12 border px-3 py-2 text-xs",
                      s === size ? "border-gold bg-gold text-background" : "border-border text-muted-foreground hover:border-foreground",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {recommenderOpen && (
            <div className="fixed inset-0 z-[99999] bg-black/70 p-4 backdrop-blur-sm">
              <div className="mx-auto max-w-lg rounded-3xl border border-border bg-surface p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="heading text-xl">Size Recommender</h2>
                    <p className="text-sm text-muted-foreground">Enter your height, weight and fit preference to get a recommended size.</p>
                  </div>
                  <button onClick={() => setRecommenderOpen(false)} className="text-muted-foreground hover:text-foreground">
                    Close
                  </button>
                </div>
                <div className="mt-6 grid gap-4">
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Height (e.g. 5.8 feet or 172 cm)
                  </label>
                  <input
                    type="text"
                    placeholder="5.8 or 172"
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value)}
                    className="w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-gold"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Feet</label>
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Inches</label>
                    <select
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(Number(e.target.value))}
                      className="w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-gold"
                    >
                      {[4, 5, 6, 7].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                    <select
                      value={heightInches}
                      onChange={(e) => setHeightInches(Number(e.target.value))}
                      className="w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-gold"
                    >
                      {Array.from({ length: 12 }, (_, i) => i).map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Weight (kg)</label>
                  <input
                    type="number"
                    min={35}
                    max={150}
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-gold"
                  />
                  <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Fit preference</label>
                  <div className="flex flex-wrap gap-2">
                    {FIT_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFit(option)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-xs",
                          fit === option ? "border-gold bg-gold text-background" : "border-border text-muted-foreground hover:border-foreground",
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                {(() => {
                  const heightCmValue = parseHeightCm(heightInput, heightFeet, heightInches);
                  const recommended = recommendSize(heightCmValue, Number(weightKg), fit, product.sizes);
                  return (
                    <>
                      <div className="mt-6 rounded-3xl border border-gold bg-[#121212] p-4 text-center text-white">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Recommended size</p>
                        <div className="mt-3 inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-3xl font-black text-background">
                          {recommended}
                        </div>
                      </div>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setSize(recommended);
                            setRecommenderOpen(false);
                            toast.success(`Selected recommended size: ${recommended}`);
                          }}
                          className="heading w-full bg-primary py-3 text-xs tracking-[0.2em] text-primary-foreground hover:bg-primary-hover sm:w-auto"
                        >
                          Select Size {recommended} & Close
                        </button>
                        <p className="text-sm text-muted-foreground">
                          Our recommender uses Pakistani sizing logic for height, weight, and fit preference.
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <span className="heading text-xs tracking-widest">QTY</span>
            <div className="flex items-center border border-border">
              <button className="px-4 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button className="px-4 py-2" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
          </div>

          <div className="mt-7 space-y-3">
            <button
              onClick={() => {
                addToCart({
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  image: product.images[0] ?? "",
                  price: product.price,
                  size,
                  color,
                  quantity: qty,
                });
                toast.success("Added to cart");
              }}
              disabled={!canAddToCart}
              className={cn(
                "heading w-full py-4 text-xs tracking-[0.2em] text-primary-foreground",
                canAddToCart
                  ? "bg-primary hover:bg-primary-hover"
                  : "cursor-not-allowed bg-border text-muted-foreground",
              )}
            >
              {canAddToCart ? "ADD TO CART" : "OUT OF STOCK"}
            </button>
            <a
              href={waLink(
                `Hi! I want to order ${product.name}\nSize: ${size}\nColor: ${color}\nQuantity: ${qty}\nProduct: ${pageUrl || `https://hbhcollection.com/products/${product.slug}`}\nPlease confirm availability.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="heading flex w-full items-center justify-center gap-2 border border-success py-4 text-xs tracking-[0.2em] text-success hover:bg-success hover:text-background"
            >
              <MessageCircle className="h-4 w-4" /> BUY ON WHATSAPP
            </a>
          </div>

          <div className="mt-7 space-y-2 border border-border bg-surface p-5 text-sm text-muted-foreground">
            <p className="flex items-center gap-2 text-foreground">
              <Truck className="h-4 w-4 text-gold" /> {settings?.shipping_time}
            </p>
            <p>{settings?.delivery_info}</p>
            <p className="text-xs">
              {(zones ?? []).map((z) => `${z.province}: ${z.est_days}`).join(" · ")}
            </p>
            <Link to="/track" className="inline-block text-xs text-gold underline">
              Track your order
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <div className="no-scrollbar flex gap-6 overflow-x-auto border-b border-border">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "heading shrink-0 pb-3 text-xs tracking-widest",
                tab === t ? "border-b-2 border-gold text-gold" : "text-muted-foreground",
              )}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="py-8 text-sm text-muted-foreground">
          {tab === "Description" && <p className="max-w-2xl leading-relaxed">{product.description}</p>}

          {tab === "Size & Fit" && (
            <table className="w-full max-w-xl border border-border text-left text-xs">
              <thead className="bg-surface-2 text-foreground">
                <tr>
                  <th className="p-3">Size</th>
                  <th className="p-3">Chest (in)</th>
                  <th className="p-3">Waist (in)</th>
                  <th className="p-3">Length (in)</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_CHART.map((r) => (
                  <tr key={r.size} className="border-t border-border">
                    <td className="p-3 text-foreground">{r.size}</td>
                    <td className="p-3">{r.chest}</td>
                    <td className="p-3">{r.waist}</td>
                    <td className="p-3">{r.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "Material & Care" && (
            <div className="space-y-2">
              <p><span className="text-foreground">Material:</span> {product.material ?? "—"}</p>
              <p><span className="text-foreground">Care:</span> {product.care_instructions ?? "—"}</p>
              {product.sku && <p><span className="text-foreground">SKU:</span> {product.sku}</p>}
            </div>
          )}

          {tab === "Reviews" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-surface p-6">
                <h3 className="heading mb-4 text-sm tracking-[0.2em] text-gold">WRITE A REVIEW</h3>
                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <p className="heading mb-2 text-[10px] tracking-[0.2em] text-muted-foreground">RATING</p>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewRating(n)}
                          className={cn(
                            "text-2xl leading-none",
                            n <= reviewRating ? "text-gold" : "text-border",
                          )}
                          aria-label={`${n} stars`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <input
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="Review title (optional)"
                      className="w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <textarea
                      required
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this product"
                      className="w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground">Upload photo (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReviewPhoto(e.target.files?.[0] ?? null)}
                      className="mt-2 w-full text-sm text-muted-foreground"
                    />
                    {reviewPhoto && <p className="mt-2 text-xs text-foreground">Selected file: {reviewPhoto.name}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={reviewBusy}
                    className="heading rounded-full bg-primary px-6 py-3 text-xs tracking-[0.2em] text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
                  >
                    {reviewBusy ? "SUBMITTING…" : "SUBMIT REVIEW"}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    Reviews are moderated and will appear after approval.
                  </p>
                </form>
              </div>

              {!(reviews ?? []).length ? (
                <p>No reviews yet — be the first to review this product.</p>
              ) : (
                <div className="space-y-4">
                  {(reviews ?? []).map((r) => (
                    <div key={r.id} className="border border-border bg-surface p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} className={cn("h-3.5 w-3.5", n <= (r.rating ?? 0) ? "fill-gold text-gold" : "text-border")} />
                          ))}
                        </span>
                        <span className="heading text-xs text-foreground">{r.customer_name}</span>
                        {(r.is_verified || r.is_verified_buyer) && (
                          <span className="text-[10px] text-success">✓ Verified buyer</span>
                        )}
                      </div>
                      {r.title && <p className="heading mt-2 text-sm text-foreground">{r.title}</p>}
                      <p className="mt-1 text-sm">{r.comment}</p>
                      {r.photo_url && (
                        <img src={r.photo_url} alt="Customer review" className="mt-3 max-h-40 w-full rounded-xl object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {completeLook.length > 0 && (
        <section className="mt-10 rounded-xl border border-border bg-surface p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="heading text-[10px] tracking-[0.3em] text-gold">COMPLETE THE LOOK</p>
              <h2 className="mt-2 text-3xl">Add the full outfit to your cart</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Hand-picked pieces that go perfectly with this item. Add the look in one tap and save time while shopping.
              </p>
            </div>
            <button
              type="button"
              onClick={addLookToCart}
              className="heading w-full max-w-[240px] bg-primary py-3 text-xs tracking-[0.2em] text-primary-foreground hover:bg-primary-hover lg:w-auto"
            >
              ADD COMPLETE LOOK
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completeLook.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-xl border border-border bg-background">
                <img src={p.images[0]} alt={p.name} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <p className="heading text-sm text-foreground">{p.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{p.colors[0]?.name ?? "Classic style"}</p>
                  <p className="mt-2 text-sm text-gold">{formatPKR(p.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="display gold-rule mb-8 text-4xl">YOU MIGHT ALSO LIKE</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
