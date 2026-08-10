import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "sonner";
import { settingsQuery } from "@/lib/data";

const KEY = "hbh_first_order_coupon_seen";

/** First-visit coupon popup. */
export function CouponPopup() {
  const { data: settings } = useQuery(settingsQuery);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const enabled = settings?.show_coupon_popup !== "false";
    if (!enabled) return;
    if (window.localStorage.getItem(KEY)) return;
    const t = window.setTimeout(() => setOpen(true), 5000);
    return () => window.clearTimeout(t);
  }, [settings]);

  const dismiss = () => {
    window.localStorage.setItem(KEY, "1");
    setOpen(false);
  };

  const code = settings?.first_order_coupon_code || "FIRST10";
  const message = settings?.first_order_coupon_message ||
    "On your first order — premium fashion, delivered all over Pakistan.";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99998] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm border border-gold bg-surface p-8 text-center">
        <button
          onClick={dismiss}
          aria-label="Close offer"
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="heading text-[10px] tracking-[0.3em] text-gold">WELCOME TO HBH</p>
        <h2 className="display mt-3 text-4xl">GET 10% OFF</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 border border-dashed border-gold px-4 py-3">
          <p className="display text-2xl tracking-[0.3em] text-gold">{code}</p>
        </div>
        <button
          onClick={() => {
            navigator.clipboard?.writeText("FIRST10");
            setCopied(true);
            toast.success("Code FIRST10 copied — use it at checkout");
          }}
          className="heading mt-4 w-full bg-primary py-4 text-[11px] tracking-[0.25em] text-primary-foreground hover:bg-primary-hover"
        >
          {copied ? "COPIED!" : "COPY CODE"}
        </button>
        <button
          onClick={dismiss}
          className="mt-3 w-full text-[11px] text-muted-foreground hover:text-gold"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
