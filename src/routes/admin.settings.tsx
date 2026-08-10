import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/AdminCrud";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

function AdminSettings() {
  return (
    <AdminCrud
      table="site_settings"
      title="Store Settings"
      description="Brand name, contact details, WhatsApp number, policies, social links, and optional coupon popup keys. Add keys such as show_coupon_popup, first_order_coupon_code, and first_order_coupon_message."
      orderBy="key"
      fields={[
        { key: "key", label: "Setting Key", help: "e.g. whatsapp, phone, email, tagline" },
        { key: "value", label: "Value", type: "textarea" },
      ]}
      columns={[
        { key: "key", label: "Key" },
        { key: "value", label: "Value" },
      ]}
    />
  );
}
