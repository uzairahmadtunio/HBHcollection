import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/AdminCrud";
import type { Row } from "@/lib/admin";

export const Route = createFileRoute("/admin/team")({ component: AdminTeam });

function AdminTeam() {
  return (
    <AdminCrud
      table="admin_users"
      title="Admin Users"
      description="Emails allowed into this panel. Each person signs up with the same email to set their own password."
      orderBy="created_at"
      defaults={{ role: "manager", is_active: true }}
      transform={(v: Row) => ({
        ...v,
        email: String(v.email ?? "").toLowerCase().trim(),
        is_active: !!v.is_active,
      })}
      fields={[
        { key: "email", label: "Email" },
        { key: "name", label: "Name" },
        { key: "role", label: "Role", type: "select", options: ["super_admin", "manager", "staff"] },
        { key: "is_active", label: "Active", type: "boolean" },
      ]}
      columns={[
        { key: "email", label: "Email" },
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "is_active", label: "Active" },
      ]}
    />
  );
}
