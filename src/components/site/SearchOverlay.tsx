import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { categoriesQuery, productsQuery } from "@/lib/data";
import { formatPKR } from "@/lib/shop";

const POPULAR = ["T-Shirts", "Jeans", "Black Shirts", "Sale"];

/** Full-screen, instant product search. */
export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const { data: products } = useQuery(productsQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(q.trim().toLowerCase()), 300);
    return () => window.clearTimeout(t);
  }, [q]);

  const catName = (id: string | null) =>
    (categories ?? []).find((c) => c.id === id)?.name ?? "HBH Collection";

  const results = useMemo(() => {
    if (!debounced) return [];
    return (products ?? [])
      .filter(
        (p) =>
          p.name.toLowerCase().includes(debounced) ||
          (p.description ?? "").toLowerCase().includes(debounced),
      )
      .slice(0, 12);
  }, [products, debounced]);

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col bg-[#0A0A0A]">
      <div className="flex items-center gap-3 border-b border-border px-4 py-4">
        <Search className="h-5 w-5 shrink-0 text-gold" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for T-shirts, Jeans, etc..."
          className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground"
        />
        <button onClick={onClose} aria-label="Close search" className="shrink-0">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl">
          {!q.trim() && (
            <>
              <p className="heading mb-3 text-[10px] tracking-[0.3em] text-gold">POPULAR SEARCHES</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((p) => (
                  <button
                    key={p}
                    onClick={() => setQ(p)}
                    className="border border-border px-4 py-2 text-sm text-muted-foreground hover:border-gold hover:text-gold"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </>
          )}

          {q.trim() && results.length === 0 && debounced === q.trim().toLowerCase() && (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No products found for “{q.trim()}”
              </p>
              <Link to="/men" onClick={onClose} className="mt-4 inline-block text-xs text-gold underline">
                Browse All Products
              </Link>
            </div>
          )}

          <div className="space-y-2">
            {results.map((p) => (
              <Link
                key={p.id}
                to="/products/$slug"
                params={{ slug: p.slug }}
                onClick={onClose}
                className="flex items-center gap-4 border border-border bg-surface p-3 hover:border-gold"
              >
                <img src={p.images[0]} alt="" className="h-16 w-14 shrink-0 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="heading truncate text-sm">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">{catName(p.category_id)}</p>
                </div>
                <span className="heading shrink-0 text-sm text-gold">{formatPKR(p.price)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
