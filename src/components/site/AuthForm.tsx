import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { saveCustomerProfile } from "@/lib/customer";


/** Shared customer sign-in / sign-up form used by /login and /signup. */
export function AuthForm({ initialMode }: { initialMode: "signup" | "signin" }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [needsEmail, setNeedsEmail] = useState(false);

  const goHome = () => {
    const back = typeof window !== "undefined" ? window.sessionStorage.getItem("hbh_after_auth") : null;
    if (back) window.sessionStorage.removeItem("hbh_after_auth");
    navigate({ to: back && back.startsWith("/") ? back : "/", replace: true });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNeedsEmail(false);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        goHome();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: name, phone },
        },
      });
      if (error) throw error;

      if (!data.session) {
        // Confirmation is off in this project — sign in straight away.
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setNeedsEmail(true);
          toast.success("Account created! Please confirm your email to continue.");
          return;
        }
      }

      // Store profile basics so the account page is pre-filled.
      try {
        await saveCustomerProfile({ full_name: name, phone, default_address: null });
      } catch {
        /* profile can be completed later from /account */
      }


      toast.success("Account created! Welcome to HBH 🎉");
      goHome();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="display gold-rule mb-3 text-5xl">
        {mode === "signup" ? "CREATE ACCOUNT" : "SIGN IN"}
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Shop faster, save your wishlist and track every order.
      </p>

      {user && (
        <p className="mb-6 border border-gold/50 p-3 text-xs text-muted-foreground">
          You are already signed in as {user.email}.{" "}
          <Link to="/account" className="text-gold underline">
            Go to my account
          </Link>
        </p>
      )}

      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <>
            <input
              required
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-gold"
            />
            <input
              required
              type="tel"
              placeholder="Phone (03XX-XXXXXXX)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-gold"
            />
          </>
        )}
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-gold"
        />
        <div className="relative">
          <input
            required
            minLength={6}
            type={showPassword ? "text" : "password"}
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="heading w-full bg-primary py-4 text-[11px] tracking-[0.25em] text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
        >
          {busy ? "PLEASE WAIT…" : mode === "signup" ? "CREATE ACCOUNT" : "SIGN IN"}
        </button>
      </form>

      <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
        No email verification needed — you're signed in instantly.{" "}
        <span className="text-gold">Check your spam folder if you ever need to verify email.</span>
      </p>

      {needsEmail && (
        <p className="mt-4 border border-gold/60 bg-surface p-4 text-xs leading-relaxed text-muted-foreground">
          We sent a confirmation link to <span className="text-foreground">{email}</span>.{" "}
          <strong className="text-gold">
            Check your spam folder if you don't see our email in inbox.
          </strong>
        </p>
      )}

      <button
        onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-gold"
      >
        {mode === "signup"
          ? "Already have an account? Sign in"
          : "New here? Create an account"}
      </button>
    </main>
  );
}
