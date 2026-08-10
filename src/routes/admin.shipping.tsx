import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/AdminCrud";

export const Route = createFileRoute("/admin/shipping")({ component: AdminShipping });

function AdminShipping() {
  return (
    <AdminCrud
      table="shipping_zones"
      title="Shipping Zones"
      description="Set delivery charges and free-shipping thresholds per province."
      orderBy="province"
      defaults={{ charge: 0 }}
      fields={[
        { key: "province", label: "Province" },
        { key: "charge", label: "Charge (PKR)", type: "number" },
        { key: "free_above", label: "Free Above (PKR)", type: "number" },
        { key: "est_days", label: "Estimated Days" },
      ]}
      columns={[
        { key: "province", label: "Province" },
        { key: "charge", label: "Charge" },
        { key: "free_above", label: "Free Above" },
        { key: "est_days", label: "Est. Days" },
      ]}
    />
  );
}
