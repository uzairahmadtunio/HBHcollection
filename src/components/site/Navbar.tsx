import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { announcementsQuery, categoriesQuery } from "@/lib/data";
import { useShop } from "@/lib/shop-store";
import { useAuth, useSignOut } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "@/components/site/SearchOverlay";
import logo from "@/assets/hbh-logo.png";

const GENDERS = [
  { label: "Men", to: "/men", key: "men" },
  { label: "Women", to: "/women", key: "women" },
  { label: "Kids", to: "/kids", key: "kids" },
] as const;

function Ticker() {
  const { data } = useQuery(announcementsQuery);
  const items = data ?? [];
  if (!items.length) return null;
  const line = items.map((a) => a.text).join("     •     ");

  return (
    <div className="overflow-hidden bg-primary py-2">
      <div className="marquee-track text-[11px] font-medium tracking-[0.2em] text-primary-foreground">
        <span className="px-6">{line}</span>
        <span className="px-6">{line}</span>
      </div>
    </div>
  );
}

function UserMenu() {
  const { user, displayName } = useAuth();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="hidden rounded-full border border-border px-3 py-2 text-[11px] tracking-[0.2em] transition hover:border-gold hover:text-gold sm:inline-flex"
        >
          LOGIN
        </Link>
        <Link
          to="/signup"
          className="hidden rounded-full border border-gold bg-gold px-3 py-2 text-[11px] tracking-[0.2em] text-background transition hover:bg-gold/90 sm:inline-flex"
        >
          SIGN UP
        </Link>
        <Link to="/login" aria-label="Login" className="sm:hidden">
          <User className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} aria-label="Account menu">
        <User className="h-5 w-5 text-gold" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 w-60 border border-border bg-surface p-2 shadow-2xl">
          <p className="border-b border-border px-3 pb-2 pt-1">
            <span className="heading block text-[10px] tracking-[0.2em] text-gold">
              HI, {(displayName || "CUSTOMER").toUpperCase()}
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">{user.email}</span>
          </p>
          <MenuItem to="/account" onClick={() => setOpen(false)} label="👤 My Profile" />
          <MenuItem to="/account" onClick={() => setOpen(false)} label="📦 My Orders" />
          <MenuItem to="/account" onClick={() => setOpen(false)} label="❤️ Wishlist" />
          <MenuItem to="/track" onClick={() => setOpen(false)} label="📍 Track Order" />
          <div className="my-2 h-px bg-border" />
          <button
            onClick={async () => {
              setOpen(false);
              await signOut();
              navigate({ to: "/" });
            }}
            className="heading flex w-full items-center gap-2 px-3 py-2 text-[11px] tracking-[0.15em] text-destructive hover:bg-surface-2"
          >
            <LogOut className="h-3.5 w-3.5" /> LOGOUT
          </button>
        </div>
      )}
    </div>
  );
}

function MenuItem({ to, label, onClick }: { to: string; label: string; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-3 py-2 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground"
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const { cartCount, wishlist } = useShop();
  const { data: categories } = useQuery(categoriesQuery);
  const { user, displayName } = useAuth();
  const signOut = useSignOut();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("men");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
    setSearch(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const byGender = (g: string) => (categories ?? []).filter((c) => c.gender === g);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <Ticker />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="HBH Collection" className="h-10 w-auto" width={40} height={40} />
            <span className="heading text-[10px] tracking-[0.35em] text-primary">COLLECTION</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-7 lg:flex">
          {GENDERS.map((g) => (
            <div key={g.key} className="group relative">
              <Link
                to={g.to}
                className="heading py-5 text-xs tracking-[0.18em] text-foreground transition-colors hover:text-gold"
              >
                {g.label.toUpperCase()}
              </Link>
              <div className="invisible absolute left-1/2 top-full w-64 -translate-x-1/2 border border-border bg-surface p-4 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:opacity-100">
                <p className="mb-2 text-[10px] tracking-[0.25em] text-gold">
                  SHOP {g.label.toUpperCase()}
                </p>
                <div className="flex flex-col">
                  {byGender(g.key).map((c) => (
                    <Link
                      key={c.id}
                      to={g.to}
                      className="py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}

            <Link
              to="/sale"
              className="heading text-xs tracking-[0.18em] text-primary transition-colors hover:text-gold"
            >
              SALE
            </Link>
            <Link
              to="/new-arrivals"
              className="heading text-xs tracking-[0.18em] transition-colors hover:text-gold"
            >
              NEW ARRIVALS
            </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => setSearch(true)} aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          <Link to="/account" className="relative hidden sm:block" aria-label="Wishlist">
            <Heart className={cn("h-5 w-5", wishlist.length > 0 && "fill-primary text-primary")} />
            {wishlist.length > 0 && <Badge n={wishlist.length} />}
          </Link>
          <UserMenu />
          <Link to="/cart" className="relative" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && <Badge n={cartCount} />}
          </Link>
        </div>
      </div>

      {search && <SearchOverlay onClose={() => setSearch(false)} />}

      {open && (
        <div className="fixed inset-0 w-screen h-screen bg-[#0A0A0A] z-[99999] flex flex-col overflow-y-auto lg:hidden animate-slide-in-left">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="heading text-sm tracking-[0.3em] text-gold">HBH COLLECTION</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="grid shrink-0 grid-cols-3 border-b border-border">
            {GENDERS.map((g) => (
              <button
                key={g.key}
                onClick={() => setActiveTab(g.key)}
                className={cn(
                  "heading py-4 text-sm tracking-[0.2em]",
                  activeTab === g.key
                    ? "border-b-2 border-gold text-gold"
                    : "text-white",
                )}
              >
                {g.label.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
            <div className="space-y-1">
              {byGender(activeTab).map((c) => (
                <Link
                  key={c.id}
                  to={activeTab === "men" ? "/men" : activeTab === "women" ? "/women" : "/kids"}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b border-border/60 py-4 text-lg text-white"
                >
                  <span>{c.name}</span>
                  <ChevronRight className="h-5 w-5 opacity-40" />
                </Link>
              ))}
            </div>

            {byGender(activeTab).length === 0 && (
              <p className="py-4 text-sm text-white/70">No categories yet.</p>
            )}

            <div className="mt-6 border-t border-border pt-4 space-y-1">
              {[
                { label: "🔥 New Arrivals", to: "/new-arrivals" },
                { label: "🏷️ Sale", to: "/sale" },
                { label: "📦 Track Order", to: "/track" },
                { label: "About Us", to: "/about" },
                { label: "Contact Us", to: "/contact" },
                { label: "FAQs", to: "/faq" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b border-border/60 py-4 text-lg text-white"
                >
                  {link.label}
                  <ChevronRight className="h-5 w-5 opacity-40" />
                </Link>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-border bg-[#0A0A0A] px-5 py-4">
            {!user ? (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="heading block w-full rounded-md bg-[#CC0000] px-4 py-4 text-center text-sm tracking-[0.2em] text-white"
              >
                LOGIN / SIGN UP
              </Link>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gold">Hello, {displayName || "Customer"}</p>
                <Link
                  to="/account"
                  onClick={() => setOpen(false)}
                  className="block text-sm text-white underline"
                >
                  My Account
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                    setOpen(false);
                    navigate({ to: "/" });
                  }}
                  className="heading w-full rounded-md border border-[#CC0000] px-4 py-3 text-sm tracking-[0.2em] text-[#CC0000]"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
      {n}
    </span>
  );
}
