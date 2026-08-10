import { ShieldCheck, CreditCard, DollarSign } from "lucide-react";

export function PaymentBadges({ compact }: { compact?: boolean }) {
  return (
    <div className={compact ? "flex items-center gap-3 text-xs text-muted-foreground" : "flex items-center gap-4"}>
      <div className="flex items-center gap-2">
        <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm border border-border bg-surface p-1">
          <rect width="36" height="24" rx="3" fill="#fff" />
        </svg>
        <span className="text-xs">Cash on Delivery</span>
      </div>
      <div className="flex items-center gap-2">
        <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm border border-border bg-surface p-1">
          <rect width="36" height="24" rx="3" fill="#fff" />
        </svg>
        <span className="text-xs">JazzCash</span>
      </div>
      <div className="flex items-center gap-2">
        <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm border border-border bg-surface p-1">
          <rect width="36" height="24" rx="3" fill="#fff" />
        </svg>
        <span className="text-xs">Easypaisa</span>
      </div>
      <div className="flex items-center gap-2">
        <svg width="36" height="24" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm border border-border bg-surface p-1">
          <rect width="36" height="24" rx="3" fill="#fff" />
        </svg>
        <span className="text-xs">Bank Transfer</span>
      </div>
    </div>
  );
}

export function TrustBadge() {
  return (
    <div className="mt-4 flex items-center justify-center gap-3 rounded-md border border-border/50 bg-surface p-3 text-sm text-muted-foreground">
      <ShieldCheck className="h-5 w-5 text-gold" />
      <div className="text-left">
        <div className="text-foreground">100% Secure Checkout</div>
        <div className="text-xs text-muted-foreground">Verified guarantee · secure payments · buyer protection</div>
      </div>
    </div>
  );
}
