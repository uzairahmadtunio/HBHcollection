import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AuthState = {
  user: User | null;
  loading: boolean;
  displayName: string;
};

/** Live Supabase auth state for the storefront. */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const displayName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    user?.email?.split("@")[0] ||
    "";

  return { user, loading, displayName };
}

/** Clears local shop state, signs out and reports it. */
export function useSignOut() {
  const qc = useQueryClient();
  return async () => {
    await supabase.auth.signOut();
    qc.removeQueries({ queryKey: ["customer-profile"] });
    qc.removeQueries({ queryKey: ["my-orders"] });
    qc.removeQueries({ queryKey: ["admin-session"] });
    toast.success("Logged out successfully");
  };
}

export const PROVINCES = [
  "Punjab",
  "Sindh",
  "KPK",
  "Balochistan",
  "Islamabad",
  "AJK",
  "Gilgit-Baltistan",
];
