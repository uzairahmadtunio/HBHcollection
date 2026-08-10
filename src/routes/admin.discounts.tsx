import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/AdminCrud";
import type { Row } from "@/lib/admin";

export const Route = createFileRoute("/admin/discounts")({ component: AdminDiscounts });

function AdminDiscounts() {
  return (
    <AdminCrud
      table="discount_codes"
      title="Discount Codes"
      description="Create percentage or fixed-amount promo codes."
      orderBy="code"
      defaults={{ type: "percentage", value: 0, min_order: 0, is_active: true, used_count: 0 }}
      transform={(v: Row) => ({
        ...v,
        code: String(v.code ?? "").toUpperCase().trim(),
        is_active: !!v.is_active,
        valid_until: v.valid_until ? new Date(String(v.valid_until)).toISOString() : null,
      })}
      fields={[
        { key: "code", label: "Code" },
        { key: "type", label: "Type", type: "select", options: ["percentage", "fixed"] },
        { key: "value", label: "Value", type: "number", help: "Percent (e.g. 10) or PKR amount" },
        { key: "min_order", label: "Minimum Order (PKR)", type: "number" },
        { key: "max_uses", label: "Max Uses", type: "number" },
        { key: "valid_until", label: "Valid Until", type: "date" },
        { key: "is_active", label: "Active", type: "boolean" },
      ]}
      columns={[
        { key: "code", label: "Code" },
        { key: "type", label: "Type" },
        { key: "value", label: "Value" },
        { key: "min_order", label: "Min Order" },
        { key: "used_count", label: "Used" },
        { key: "max_uses", label: "Max" },
        { key: "is_active", label: "Active" },
      ]}
    />
  );
}
