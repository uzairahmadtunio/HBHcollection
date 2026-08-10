import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { categoriesQuery, productsQuery } from "@/lib/data";
import { formatPKR, type Product } from "@/lib/shop";
import { ProductGrid } from "./ProductCard";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  gender?: "men" | "women" | "kids";
  categorySlug?: string;
  only?: "sale" | "new";
  banner?: React.ReactNode;
};

const SORTS = [
  { key: "newest", label: "Newest" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "best", label: "Bestselling" },
] as const;

export function CatalogPage({ title, subtitle, gender, categorySlug, only, banner }: Props) {
  const { data: products, isLoading } = useQuery(productsQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("newest");
  const [drawer, setDrawer] = useState(false);
  const [visible, setVisible] = useState(12);

  const scopeCategories = useMemo(
    () => (categories ?? []).filter((c) => (gender ? c.gender === gender : true)),
    [categories, gender],
  );

  const scoped = useMemo(() => {
    let list = products ?? [];
    if (gender) {
      const ids = new Set(scopeCategories.map((c) => c.id));
      list = list.filter((p) => p.category_id && ids.has(p.category_id));
    }
    if (categorySlug) {
      const cat = (categories ?? []).find((c) => c.slug === categorySlug);
      list = list.filter((p) => p.category_id === cat?.id);
    }
    if (only === "sale") list = list.filter((p) => p.is_on_sale);
    if (only === "new") list = list.filter((p) => p.is_new_arrival);
    return list;
  }, [products, gender, categorySlug, only, categories, scopeCategories]);

  const allSizes = useMemo(
    () => Array.from(new Set(scoped.flatMap((p) => p.sizes))),
    [scoped],
  );
  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    scoped.forEach((p) => p.colors.forEach((c) => map.set(c.name, c.hex)));
    return Array.from(map, ([name, hex]) => ({ name, hex }));
  }, [scoped]);
  const priceCeiling = Math.max(1000, ...scoped.map((p) => p.price));

  const filtered = useMemo(() => {
    let list = scoped;
    if (selectedCats.length) list = list.filter((p) => selectedCats.includes(p.category_id ?? ""));
    if (selectedSizes.length)
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    if (selectedColors.length)
      list = list.filter((p) => p.colors.some((c) => selectedColors.includes(c.name)));
    if (maxPrice != null) list = list.filter((p) => p.price <= maxPrice);

    const sorted = [...list];
    if (sort === "price_asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "best") sorted.sort((a, b) => Number(b.is_bestseller) - Number(a.is_bestseller));
    if (sort === "newest")
      sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return sorted as Product[];
  }, [scoped, selectedCats, selectedSizes, selectedColors, maxPrice, sort]);

  const toggle = (arr: string[], set: (v: string[]) => void, value: string) =>
    set(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);

  const Filters = (
    <div className="space-y-8">
      {scopeCategories.length > 0 && (
        <div>
          <h3 className="heading mb-3 text-xs tracking-[0.2em] text-gold">CATEGORY</h3>
          <div className="space-y-2">
            {scopeCategories.map((c) => (
              <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(c.id)}
                  onChange={() => toggle(selectedCats, setSelectedCats, c.id)}
                  className="h-4 w-4 accent-[#CC0000]"
                />
                <span className="text-muted-foreground">{c.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {allSizes.length > 0 && (
        <div>
          <h3 className="heading mb-3 text-xs tracking-[0.2em] text-gold">SIZE</h3>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((s) => (
              <button
                key={s}
                onClick={() => toggle(selectedSizes, setSelectedSizes, s)}
                className={cn(
                  "border px-3 py-1.5 text-xs",
                  selectedSizes.includes(s)
                    ? "border-gold bg-gold text-background"
                    : "border-border text-muted-foreground hover:border-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {allColors.length > 0 && (
        <div>
          <h3 className="heading mb-3 text-xs tracking-[0.2em] text-gold">COLOR</h3>
          <div className="flex flex-wrap gap-2.5">
            {allColors.map((c) => (
              <button
                key={c.name}
                title={c.name}
                onClick={() => toggle(selectedColors, setSelectedColors, c.name)}
                className={cn(
                  "h-7 w-7 rounded-full border-2",
                  selectedColors.includes(c.name) ? "border-gold" : "border-border",
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="heading mb-3 text-xs tracking-[0.2em] text-gold">MAX PRICE</h3>
        <input
          type="range"
          min={500}
          max={priceCeiling}
          step={100}
          value={maxPrice ?? priceCeiling}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#CC0000]"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Up to {formatPKR(maxPrice ?? priceCeiling)}
        </p>
      </div>

      <button
        onClick={() => {
          setSelectedCats([]);
          setSelectedSizes([]);
          setSelectedColors([]);
          setMaxPrice(null);
        }}
        className="heading w-full border border-border py-2.5 text-xs tracking-widest hover:border-gold"
      >
        CLEAR FILTERS
      </button>
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{title}</span>
      </nav>

      {banner}

      <header className="mb-8">
        <h1 className="display gold-rule text-5xl sm:text-6xl">{title}</h1>
        {subtitle && <p className="mt-4 text-sm text-muted-foreground">{subtitle}</p>}
      </header>

      <div className="flex gap-8">
        <aside className="hidden w-60 shrink-0 lg:block">{Filters}</aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
            <p className="min-w-0 truncate text-xs text-muted-foreground">
              Showing {Math.min(visible, filtered.length)} of {filtered.length} products
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setDrawer(true)}
                className="heading flex items-center gap-2 border border-border px-3 py-2 text-[11px] tracking-widest lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> FILTER
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="border border-border bg-surface px-3 py-2 text-xs outline-none focus:border-gold"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="">
                  <div className="flex flex-col overflow-hidden border border-border bg-surface">
                    <div className="aspect-3/4 skeleton" />
                    <div className="p-4">
                      <div className="h-4 w-3/4 skeleton mb-3 rounded" />
                      <div className="h-3 w-1/2 skeleton mb-2 rounded" />
                      <div className="h-8 w-full skeleton rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <ProductGrid products={filtered.slice(0, visible)} />
              {filtered.length > visible && (
                <div className="mt-10 text-center">
                  <button
                    onClick={() => setVisible((v) => v + 12)}
                    className="heading border border-gold px-8 py-3 text-xs tracking-widest text-gold hover:bg-gold hover:text-background"
                  >
                    LOAD MORE
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-100 flex lg:hidden">
          <div className="flex-1 bg-background/70" onClick={() => setDrawer(false)} />
          <div className="w-80 overflow-y-auto border-l border-border bg-surface p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="heading text-sm tracking-widest">FILTERS</span>
              <button onClick={() => setDrawer(false)} aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            {Filters}
          </div>
        </div>
      )}
    </main>
  );
}
