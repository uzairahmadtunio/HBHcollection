import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

function generateUUID() {
  try {
    // Prefer native randomUUID when available
    if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
      return (crypto as any).randomUUID();
    }
    // Fallback to crypto.getRandomValues UUID v4
    if (typeof crypto !== "undefined" && typeof (crypto as any).getRandomValues === "function") {
      const buf = new Uint8Array(16);
      (crypto as any).getRandomValues(buf);
      buf[6] = (buf[6] & 0x0f) | 0x40;
      buf[8] = (buf[8] & 0x3f) | 0x80;
      const hex = Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
      return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20, 12)}`;
    }
  } catch {
    // ignore and fallback
  }
  // Last-resort fallback (not cryptographically secure)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Mirrors a wishlist change into the backend for signed-in customers. */
async function syncWishlist(productId: string, add: boolean) {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("supabase_auth_id", user.id)
      .maybeSingle();
    let customerId = customer?.id;
    if (!customerId) {
      const { data: created } = await supabase
        .from("customers")
        .insert({
          supabase_auth_id: user.id,
          email: user.email ?? null,
          full_name: (user.user_metadata?.full_name as string) ?? null,
          phone: (user.user_metadata?.phone as string) ?? null,
        })
        .select("id")
        .maybeSingle();
      customerId = created?.id;
    }
    if (!customerId) return;
    if (add) {
      await supabase.from("wishlists").insert({ customer_id: customerId, product_id: productId });
    } else {
      await supabase
        .from("wishlists")
        .delete()
        .eq("customer_id", customerId)
        .eq("product_id", productId);
    }
  } catch {
    /* guest or offline — local wishlist stays authoritative */
  }
}

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
};

type ShopState = {
  cart: CartLine[];
  wishlist: string[];
  addToCart: (line: CartLine) => void;
  setQuantity: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  cartCount: number;
  subtotal: number;
  sessionId: string;
};

const ShopContext = createContext<ShopState | null>(null);

export const lineKey = (l: Pick<CartLine, "productId" | "size" | "color">) =>
  `${l.productId}|${l.size}|${l.color}`;

const CART_KEY = "hbh_cart_v1";
const WISH_KEY = "hbh_wishlist_v1";
const SESSION_KEY = "hbh_session_v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCart(read<CartLine[]>(CART_KEY, []));
    setWishlist(read<string[]>(WISH_KEY, []));
    let sid = window.localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = generateUUID();
      window.localStorage.setItem(SESSION_KEY, sid);
    }
    setSessionId(sid);
    setLoaded(true);
  }, []);

  // Keep every open tab (and every refresh) in sync with localStorage.
  useEffect(() => {
    const sync = () => {
      setCart(read<CartLine[]>(CART_KEY, []));
      setWishlist(read<string[]>(WISH_KEY, []));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY || e.key === WISH_KEY || e.key === null) sync();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !loaded) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, loaded]);

  useEffect(() => {
    if (typeof window === "undefined" || !loaded) return;
    window.localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, loaded]);

  // Best-effort mirror of the guest cart into the backend for this session.
  useEffect(() => {
    if (!sessionId) return;
    const timer = window.setTimeout(async () => {
      try {
        await supabase.from("cart_items").delete().eq("session_id", sessionId);
        if (cart.length) {
          await supabase.from("cart_items").insert(
            cart.map((l) => ({
              session_id: sessionId,
              product_id: l.productId,
              size: l.size,
              color: l.color,
              quantity: l.quantity,
            })),
          );
        }
      } catch {
        /* offline / RLS — local cart still authoritative */
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [cart, sessionId]);

  const value = useMemo<ShopState>(() => {
    const cartCount = cart.reduce((n, l) => n + l.quantity, 0);
    const subtotal = cart.reduce((n, l) => n + l.quantity * l.price, 0);
    return {
      cart,
      wishlist,
      sessionId,
      cartCount,
      subtotal,
      addToCart: (line) =>
        setCart((prev) => {
          const k = lineKey(line);
          const existing = prev.find((l) => lineKey(l) === k);
          if (existing) {
            return prev.map((l) =>
              lineKey(l) === k ? { ...l, quantity: l.quantity + line.quantity } : l,
            );
          }
          return [...prev, line];
        }),
      setQuantity: (key, qty) =>
        setCart((prev) =>
          prev
            .map((l) => (lineKey(l) === key ? { ...l, quantity: Math.max(1, qty) } : l))
            .filter((l) => l.quantity > 0),
        ),
      removeLine: (key) => setCart((prev) => prev.filter((l) => lineKey(l) !== key)),
      clearCart: () => setCart([]),
      toggleWishlist: (productId) => {
        const isSaved = wishlist.includes(productId);
        setWishlist((prev) =>
          prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
        );
        toast[isSaved ? "message" : "success"](
          isSaved ? "Removed from wishlist" : "Saved to your wishlist ♥",
        );
        void syncWishlist(productId, !isSaved);
      },
    };
  }, [cart, wishlist, sessionId]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}

const RECENT_KEY = "hbh_recent_v1";

export function pushRecentlyViewed(slug: string) {
  if (typeof window === "undefined") return;
  const prev = read<string[]>(RECENT_KEY, []).filter((s) => s !== slug);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify([slug, ...prev].slice(0, 8)));
}

export function getRecentlyViewed(): string[] {
  return read<string[]>(RECENT_KEY, []);
}
