import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/AdminCrud";
import type { Row } from "@/lib/admin";

export const Route = createFileRoute("/admin/messages")({ component: AdminMessages });

function AdminMessages() {
  return (
    <AdminCrud
      table="contact_messages"
      title="Messages"
      description="Enquiries submitted through the contact form."
      orderBy="created_at"
      ascending={false}
      canCreate={false}
      transform={(v: Row) => ({ is_read: !!v.is_read })}
      fields={[{ key: "is_read", label: "Marked Read", type: "boolean" }]}
      columns={[
        { key: "sender_name", label: "From" },
        { key: "sender_email", label: "Email" },
        { key: "subject", label: "Subject" },
        { key: "message", label: "Message" },
        { key: "is_read", label: "Read" },
        {
          key: "created_at",
          label: "Received",
          render: (r) => new Date(String(r.created_at)).toLocaleDateString("en-PK"),
        },
      ]}
    />
  );
}
