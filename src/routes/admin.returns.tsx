import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/AdminCrud";
import type { Row } from "@/lib/admin";

export const Route = createFileRoute("/admin/returns")({ component: AdminReturns });

const STATUSES = ["pending", "approved", "rejected", "completed"];

function AdminReturns() {
  return (
    <AdminCrud
      table="return_requests"
      title="Return Requests"
      description="Review customer return and exchange requests."
      orderBy="created_at"
      ascending={false}
      canCreate={false}
      fields={[
        { key: "status", label: "Status", type: "select", options: STATUSES },
        { key: "item_name", label: "Item" },
        { key: "reason", label: "Reason" },
        { key: "description", label: "Details", type: "textarea" },
      ]}
      columns={[
        { key: "customer_name", label: "Customer" },
        { key: "customer_phone", label: "Phone" },
        { key: "item_name", label: "Item" },
        { key: "reason", label: "Reason" },
        { key: "status", label: "Status" },
        {
          key: "created_at",
          label: "Requested",
          render: (r: Row) => new Date(String(r.created_at)).toLocaleDateString(),
        },
      ]}
    />
  );
}
