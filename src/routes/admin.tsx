import { useNewOrderAlerts } from "@/lib/admin-alerts";
import { useState } from "react";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgePercent,
  Briefcase,
  FileText,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  Package,
  RotateCcw,

  ShieldCheck,
  ShoppingBag,
  Star,
  Tags,
  Truck,
  Users,
  Settings as SettingsIcon,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminSessionQuery } from "@/lib/admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — HBH Collection" },
      { name: "description", content: "HBH Collection store management dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const NAV: { to: string; label: string; icon: typeof LayoutDashboard }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/discounts", label: "Discounts", icon: BadgePercent },
  { to: "/admin/shipping", label: "Shipping", icon: Truck },
  { to: "/admin/banners", label: "Banners", icon: Image },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/returns", label: "Returns", icon: RotateCcw },

  { to: "/admin/messages", label: "Messages", icon: Mail },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/pages", label: "Pages", icon: FileText },
  { to: "/admin/careers", label: "Careers", icon: Briefcase },
  { to: "/admin/team", label: "Admin Users", icon: ShieldCheck },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

function AdminLayout() {
  const qc = useQueryClient();
  const { data: session, isLoading } = useQuery(adminSessionQuery);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { newCount, clearNewCount } = useNewOrderAlerts(Boolean(session?.user && session.isAdmin));

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="heading text-xs tracking-[0.3em] text-muted-foreground">LOADING…</p>
      </div>
    );
  }

  if (!session?.user || !session.isAdmin) {
    return <AdminLogin signedInEmail={session?.user?.email ?? null} />;
  }

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface lg:block">
        <div className="border-b border-border px-5 py-5">
          <div className="flex items-baseline gap-1.5">
            <span className="display text-2xl text-gold">HBH</span>
            <span className="heading text-[9px] tracking-[0.3em] text-primary">ADMIN</span>
          </div>
          <p className="mt-2 truncate text-xs text-muted-foreground">{session.user.email}</p>
        </div>
        <nav className="p-2">
          {NAV.map((item) => {
            const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
            const badge = item.to === "/admin/orders" && newCount > 0 && !active ? newCount : 0;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => item.to === "/admin/orders" && clearNewCount()}
                className={`heading mb-0.5 flex items-center gap-3 px-3 py-2.5 text-[10px] tracking-[0.18em] ${
                  active ? "bg-surface-2 text-gold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" /> {item.label.toUpperCase()}
                {badge > 0 && (
                  <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[9px] text-primary-foreground">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3">
          <Link to="/" className="heading text-[10px] tracking-[0.2em] text-muted-foreground hover:text-gold">
            ← VIEW STORE
          </Link>
          <button
            onClick={signOut}
            className="heading flex items-center gap-2 border border-border px-3 py-2 text-[10px] tracking-[0.2em] hover:border-primary hover:text-primary"
          >
            <LogOut className="h-3.5 w-3.5" /> SIGN OUT
          </button>
        </header>

        <div className="overflow-x-auto border-b border-border bg-surface px-2 py-2 lg:hidden">
          <div className="flex gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="heading whitespace-nowrap px-3 py-2 text-[10px] tracking-[0.15em] text-muted-foreground"
              >
                {item.label.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminLogin({ signedInEmail }: { signedInEmail: string | null }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await qc.invalidateQueries({ queryKey: ["admin-session"] });
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) throw signInError;
        }
        toast.success("Admin account created. Signed in.");
        await qc.invalidateQueries({ queryKey: ["admin-session"] });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    qc.invalidateQueries({ queryKey: ["admin-session"] });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm border border-border bg-surface p-8">
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="display text-3xl text-gold">HBH</span>
          <span className="heading text-[9px] tracking-[0.3em] text-primary">ADMIN</span>
        </div>
        <h1 className="heading mt-6 text-center text-xs tracking-[0.25em]">
          {mode === "signin" ? "ADMIN SIGN IN" : "CREATE ADMIN ACCOUNT"}
        </h1>

        {signedInEmail && (
          <div className="mt-5 border border-primary/50 p-3 text-xs text-muted-foreground">
            Signed in as {signedInEmail}, but this account is not an authorised admin.{" "}
            <button onClick={signOut} className="text-primary underline">
              Sign out
            </button>
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={busy}
            className="heading w-full bg-primary py-3 text-[11px] tracking-[0.25em] text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
          >
            {busy ? "PLEASE WAIT…" : mode === "signin" ? "SIGN IN" : "SIGN UP"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-center text-xs text-muted-foreground hover:text-gold"
        >
          {mode === "signin"
            ? "First time? Create your admin account"
            : "Already have an account? Sign in"}
        </button>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
          Only emails listed as active admins can access this panel.
        </p>
      </div>
    </div>
  );
}
