import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/AdminCrud";
import type { Row } from "@/lib/admin";

export const Route = createFileRoute("/admin/announcements")({ component: AdminAnnouncements });

function AdminAnnouncements() {
  return (
    <AdminCrud
      table="announcements"
      title="Announcements"
      description="The scrolling ticker at the top of the store."
      defaults={{ bg_color: "#CC0000", text_color: "#FFFFFF", is_active: false }}
      transform={(v: Row) => ({ ...v, is_active: !!v.is_active })}
      fields={[
        { key: "text", label: "Text" },
        { key: "bg_color", label: "Background Colour", placeholder: "#CC0000" },
        { key: "text_color", label: "Text Colour", placeholder: "#FFFFFF" },
        { key: "link", label: "Link" },
        { key: "is_active", label: "Active", type: "boolean" },
      ]}
      columns={[
        { key: "text", label: "Text" },
        { key: "link", label: "Link" },
        { key: "is_active", label: "Active" },
      ]}
    />
  );
}
