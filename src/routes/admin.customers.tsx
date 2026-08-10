import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/AdminCrud";

export const Route = createFileRoute("/admin/customers")({ component: AdminCustomers });

function AdminCustomers() {
  return (
    <AdminCrud
      table="customers"
      title="Customers"
      description="Everyone who has ordered or created an account."
      orderBy="created_at"
      ascending={false}
      canCreate={false}
      canDelete={false}
      fields={[
        { key: "full_name", label: "Full Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
      ]}
      columns={[
        { key: "full_name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        {
          key: "created_at",
          label: "Joined",
          render: (r) => new Date(String(r.created_at)).toLocaleDateString("en-PK"),
        },
      ]}
    />
  );
}
