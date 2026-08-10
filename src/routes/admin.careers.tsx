import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/AdminCrud";
import type { Row } from "@/lib/admin";

export const Route = createFileRoute("/admin/careers")({ component: AdminCareers });

function AdminCareers() {
  return (
    <AdminCrud
      table="jobs"
      title="Job Openings"
      description="Roles shown on the Careers page."
      orderBy="display_order"
      defaults={{ type: "Full-time", is_active: true, display_order: 0 }}
      transform={(v: Row) => ({ ...v, is_active: !!v.is_active })}
      fields={[
        { key: "title", label: "Job Title" },
        {
          key: "type",
          label: "Type",
          type: "select",
          options: ["Full-time", "Part-time", "Remote", "Contract", "Internship"],
        },
        { key: "location", label: "Location" },
        { key: "requirements", label: "Requirements", type: "textarea", help: "One per line" },
        { key: "display_order", label: "Display Order", type: "number" },
        { key: "is_active", label: "Active", type: "boolean" },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "type", label: "Type" },
        { key: "location", label: "Location" },
        { key: "is_active", label: "Active" },
      ]}
    />
  );
}
