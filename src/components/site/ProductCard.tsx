import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useShop } from "@/lib/shop-store";
import { discountPercent, formatPKR, type Product } from "@/lib/shop";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const [size, setSize] = useState<string>(product.sizes[0] ?? "");
  const [hover, setHover] = useState(false);
  const [current, setCurrent] = useState(0);
  const [imgLoaded, setImgLoaded] = useState<boolean[]>(
    Array(product.images.length).fill(false),
  );
  const slideshowRef = useRef<number | null>(null);
  const userInteractedRef = useRef(false);
  const saved = wishlist.includes(product.id);
  const off = discountPercent(product);
  const image = product.images[current] ?? product.images[0];

  // Start slideshow on hover (desktop). If user manually interacts (tap/dot), stop autoplay.
  useEffect(() => {
    if (hover && product.images.length > 1 && !userInteractedRef.current) {
      slideshowRef.current = window.setInterval(() => {
        setCurrent((c) => (c + 1) % product.images.length);
      }, 1500) as unknown as number;
    } else {
      if (slideshowRef.current) {
        window.clearInterval(slideshowRef.current);
        slideshowRef.current = null;
      }
      if (!hover && !userInteractedRef.current) {
        // reset to first image when leaving hover
        setCurrent(0);
      }
    }
    return () => {
      if (slideshowRef.current) {
        window.clearInterval(slideshowRef.current);
        slideshowRef.current = null;
      }
    };
  }, [hover, product.images.length]);

  return (
    <div
      className="group hbh-card relative flex flex-col overflow-hidden border border-border bg-surface"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-3/4 overflow-hidden bg-surface-2"
        onTouchStart={(e) => {
          (e as any).currentTarget.dataset.touchStartX = String((e as TouchEvent).touches?.[0]?.clientX ?? 0);
        }}
        onTouchEnd={(e) => {
          const start = Number((e as any).currentTarget.dataset.touchStartX || 0);
          const end = (e as TouchEvent).changedTouches?.[0]?.clientX ?? 0;
          const dx = end - start;
          if (Math.abs(dx) > 40) {
            userInteractedRef.current = true;
            if (dx < 0) {
              setCurrent((c) => (c + 1) % product.images.length);
            } else {
              setCurrent((c) => (c - 1 + product.images.length) % product.images.length);
            }
          }
        }}
      >
        {/* Render all images stacked for smooth fade transitions */}
        {product.images.map((src, idx) => (
          <img
            key={src + idx}
            src={src}
            alt={product.name}
            loading={idx === 0 ? "eager" : "lazy"}
            onLoad={() => setImgLoaded((s) => {
              const copy = [...s];
              copy[idx] = true;
              return copy;
            })}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              current === idx ? "opacity-100" : "opacity-0"
            } ${imgLoaded[idx] ? "" : "skeleton"}`}
            style={{ transformOrigin: "center" }}
            draggable={false}
          />
        ))}

        {/* Dots for touch/mobile */}
        {product.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:hidden">
            {product.images.map((_, i) => (
              <button
                key={i}
                aria-label={`View image ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  userInteractedRef.current = true;
                  setCurrent(i);
                }}
                className={cn(
                  "h-2 w-2 rounded-full",
                  current === i ? "bg-gold" : "bg-surface-2/80",
                )}
              />
            ))}
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.is_new_arrival && (
            <span className="heading rounded-full bg-gold px-2.5 py-1 text-[10px] tracking-widest text-background">
              NEW
            </span>
          )}
          {product.is_on_sale && (
            <span className="heading rounded-full bg-primary px-2.5 py-1 text-[10px] tracking-widest text-primary-foreground">
              {off ? `-${off}%` : "SALE"}
            </span>
          )}
          {product.is_bestseller && (
            <span className="heading rounded-full bg-primary-hover px-2.5 py-1 text-[10px] tracking-widest text-primary-foreground">
              BESTSELLER 🔥
            </span>
          )}
        </div>
      </Link>

      <button
        type="button"
        aria-label="Save to wishlist"
        onClick={() => {
          toggleWishlist(product.id);
          toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
        }}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/70 backdrop-blur transition-colors hover:bg-background"
      >
        <Heart
          className={cn("h-4 w-4", saved ? "fill-primary text-primary" : "text-foreground")}
        />
      </button>
      

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="heading line-clamp-1 text-sm text-foreground transition-colors hover:text-gold"
        >
          {product.name}
        </Link>

        {product.colors.length > 0 && (
          <div className="flex items-center gap-1.5">
            {product.colors.slice(0, 5).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="heading text-base">{formatPKR(product.price)}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPKR(product.original_price)}
            </span>
          )}
        </div>

        {product.sizes.length > 0 && (
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={cn(
                  "min-w-9 shrink-0 border px-2 py-1 text-[11px] transition-colors",
                  s === size
                    ? "border-gold bg-gold text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            addToCart({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: product.images[0] ?? "",
              price: product.price,
              size: size || "One Size",
              color: product.colors[0]?.name ?? "Default",
              quantity: 1,
            });
            toast.success(`${product.name} added to cart`);
          }}
          className="heading mt-auto flex items-center justify-center gap-2 bg-primary py-2.5 text-xs tracking-widest text-primary-foreground transition-transform hover:bg-primary-hover hbh-btn-primary"
        >
          <ShoppingBag className="h-3.5 w-3.5" /> ADD TO CART
        </button>
      </div>
    </div>
  );
}

// Start/stop slideshow effect outside render to avoid stale closure issues
function useSlideshow(
  enabled: boolean,
  length: number,
  onTick: (next: number) => void,
  resetOnStop = true,
) {
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (!enabled || length <= 1) return;
    ref.current = window.setInterval(() => {
      onTick(Date.now()); // caller handles index logic
    }, 1500);
    return () => {
      if (ref.current) window.clearInterval(ref.current);
      ref.current = null;
    };
  }, [enabled, length, onTick]);
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No products match your filters yet.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
