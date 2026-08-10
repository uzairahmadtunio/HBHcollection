import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Row = Record<string, unknown>;

type Res<T> = PromiseLike<{ data: T | null; error: { message: string } | null }>;

type Q = Res<Row[]> & {
  select: (cols?: string, opts?: { count?: "exact"; head?: boolean }) => Q;
  insert: (values: Row | Row[]) => Q;
  update: (values: Row) => Q;
  upsert: (values: Row | Row[], opts?: { onConflict?: string }) => Q;
  delete: () => Q;
  eq: (col: string, val: unknown) => Q;
  neq: (col: string, val: unknown) => Q;
  in: (col: string, val: unknown[]) => Q;
  order: (col: string, opts?: { ascending?: boolean }) => Q;
  limit: (n: number) => Q;
  gte: (col: string, val: unknown) => Q;
  maybeSingle: () => Res<Row>;
  single: () => Res<Row>;
};

/** Loosely-typed table accessor for generic admin CRUD screens. */
export function tbl(name: string): Q {
  return (supabase as unknown as { from: (n: string) => Q }).from(name);
}

export const adminSessionQuery = queryOptions({
  queryKey: ["admin-session"],
  queryFn: async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return { user: null, isAdmin: false, profile: null as Row | null };
    const { data: rows } = await tbl("admin_users").select("*").eq("email", user.email ?? "");
    const profile = (rows ?? [])[0] ?? null;
    const isAdmin = !!profile && profile.is_active !== false;
    return { user: { id: user.id, email: user.email ?? "" }, isAdmin, profile };
  },
  staleTime: 30 * 1000,
});

export function listQuery(
  table: string,
  opts?: { orderBy?: string; ascending?: boolean; select?: string },
) {
  return queryOptions({
    queryKey: ["admin", table, opts?.orderBy ?? "", opts?.ascending ?? true],
    queryFn: async () => {
      let q = tbl(table).select(opts?.select ?? "*");
      if (opts?.orderBy) q = q.order(opts.orderBy, { ascending: opts.ascending ?? true });
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return (data ?? []) as Row[];
    },
  });
}

export function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export function statusTone(status: string) {
  switch (status) {
    case "delivered":
      return "border-success text-success";
    case "cancelled":
    case "returned":
      return "border-primary text-primary";
    case "shipped":
    case "processing":
      return "border-gold text-gold";
    default:
      return "border-border text-muted-foreground";
  }
}
