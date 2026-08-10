import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPKR } from "@/lib/shop";

function ding() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
    setTimeout(() => void ctx.close(), 900);
  } catch {
    /* audio not available */
  }
}

/** Realtime + polling alerts for incoming orders (FIX 8). */
export function useNewOrderAlerts(enabled: boolean) {
  const qc = useQueryClient();
  const [newCount, setNewCount] = useState(0);
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      void Notification.requestPermission();
    }

    const announce = (o: Record<string, unknown>) => {
      const num = String(o.order_number ?? "");
      if (!num || seen.current.has(num)) return;
      seen.current.add(num);
      setNewCount((c) => c + 1);
      ding();
      const amount = formatPKR(Number(o.total ?? 0));
      const method = String(o.payment_method ?? "—");
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        const n = new Notification("🛍️ New order received!", { body: `#${num} · ${amount} · ${method}` });
        n.onclick = () => {
          window.focus();
          window.location.assign("/admin/orders");
        };
      }
      toast.success(`🛍️ New order received! #${num}`, {
        duration: 8000,
        action: { label: "VIEW ORDER", onClick: () => window.location.assign("/admin/orders") },
      });
      qc.invalidateQueries({ queryKey: ["admin", "orders-full"] });
    };

    const channel = supabase
      .channel("admin-new-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        announce(payload.new as Record<string, unknown>);
      })
      .subscribe();

    // Polling fallback in case realtime is unavailable.
    const poll = window.setInterval(async () => {
      const { data } = await supabase
        .from("orders")
        .select("order_number,total,payment_method,created_at")
        .gte("created_at", new Date(Date.now() - 5 * 60_000).toISOString());
      for (const row of data ?? []) announce(row as Record<string, unknown>);
    }, 60_000);

    // Seed already-known orders so existing rows don't trigger alerts.
    void supabase
      .from("orders")
      .select("order_number")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        for (const r of data ?? []) seen.current.add(String(r.order_number));
      });

    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(poll);
    };
  }, [enabled, qc]);

  return { newCount, clearNewCount: () => setNewCount(0) };
}
