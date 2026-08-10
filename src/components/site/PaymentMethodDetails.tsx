import { useState } from "react";
import { Banknote, Building2, Smartphone, Upload } from "lucide-react";
import { formatPKR } from "@/lib/shop";
import { ADMIN_PHONE_DISPLAY, type PaymentMethod } from "@/lib/orders";

type Props = {
  method: PaymentMethod;
  amount: number;
  settings: Record<string, string> | undefined;
  tid: string;
  onTid: (v: string) => void;
  file: File | null;
  onFile: (f: File | null) => void;
};

const box = "mt-3 border border-gold/40 bg-gold/5 p-5 text-sm";
const stepList = "mt-3 space-y-1 text-xs text-muted-foreground";

export function PaymentMethodDetails({ method, amount, settings, tid, onTid, file, onFile }: Props) {
  if (method === "Cash on Delivery") {
    return (
      <div className={box}>
        <p className="heading flex items-center gap-2 text-xs tracking-[0.2em] text-gold">
          <Banknote className="h-4 w-4" /> CASH ON DELIVERY
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Pay in cash when your order arrives at your doorstep. Our rider will collect the payment.
          Available across Pakistan.
        </p>
      </div>
    );
  }

  const wallet =
    method === "JazzCash"
      ? { number: settings?.jazzcash_number || "0311-2578079", label: "JazzCash" }
      : method === "Easypaisa"
        ? { number: settings?.easypaisa_number || "0330-2033640", label: "Easypaisa" }
        : null;

  return (
    <div className={box}>
      {wallet ? (
        <>
          <p className="heading flex items-center gap-2 text-xs tracking-[0.2em] text-gold">
            <Smartphone className="h-4 w-4" /> {wallet.label.toUpperCase()} PAYMENT
          </p>
          <div className="mt-3 space-y-1">
            <Line label="Account" value={wallet.number} />
            <Line label="Account Name" value="HBH Collection" />
          </div>
          <ol className={stepList}>
            <li>1. Open the {wallet.label} app</li>
            <li>2. Go to “Send Money”</li>
            <li>3. Enter number: {wallet.number}</li>
            <li>
              4. Enter exact amount: <span className="text-gold">{formatPKR(amount)}</span>
            </li>
            <li>5. Complete the payment</li>
            <li>6. Take a screenshot of the receipt</li>
          </ol>
        </>
      ) : (
        <>
          <p className="heading flex items-center gap-2 text-xs tracking-[0.2em] text-gold">
            <Building2 className="h-4 w-4" /> BANK TRANSFER
          </p>
          <div className="mt-3 space-y-1">
            <Line label="Bank" value={settings?.bank_name || "Meezan Bank"} />
            <Line label="Account Title" value={settings?.bank_account_title || "HBH Collection"} />
            <Line label="Account No" value={settings?.bank_account_number || "—"} />
            <Line label="IBAN" value={settings?.bank_iban || "—"} />
            <Line label="Amount" value={formatPKR(amount)} />
          </div>
        </>
      )}

      <div className="mt-5 space-y-3 border-t border-gold/30 pt-4">
        <div>
          <label className="heading mb-1.5 flex items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground">
            <Upload className="h-3.5 w-3.5" /> UPLOAD PAYMENT SCREENSHOT *
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            className="w-full border border-border bg-surface px-3 py-2 text-xs file:mr-3 file:border-0 file:bg-gold/20 file:px-3 file:py-1.5 file:text-xs file:text-gold"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            {file ? `Selected: ${file.name}` : "JPG / PNG, max 10 MB"}
          </p>
        </div>
        <div>
          <label className="heading mb-1.5 block text-[10px] tracking-[0.2em] text-muted-foreground">
            {method === "Bank Transfer" ? "TRANSACTION ID / REF NO *" : "TRANSACTION ID (TID) *"}
          </label>
          <input
            value={tid}
            onChange={(e) => onTid(e.target.value)}
            placeholder="e.g. TID123456789"
            className="w-full border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </div>
        <p className="text-[11px] text-primary">
          ⚠️ Your order is confirmed{method === "Bank Transfer" ? " in 2–4 hours" : ""} after we
          verify your payment. Need help? WhatsApp {ADMIN_PHONE_DISPLAY}.
        </p>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="heading text-sm">{value}</span>
    </p>
  );
}
