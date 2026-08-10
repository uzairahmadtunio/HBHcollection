import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/AdminCrud";
import { slugify, type Row } from "@/lib/admin";

export const Route = createFileRoute("/admin/pages")({ component: AdminPages });

function AdminPages() {
  return (
    <AdminCrud
      table="pages"
      title="Content Pages"
      description="Edit About, FAQ, Privacy, Terms, Shipping, Returns and Careers content."
      orderBy="slug"
      transform={(v: Row) => ({
        ...v,
        slug: slugify(String(v.slug ?? v.title ?? "")),
        updated_at: new Date().toISOString(),
      })}
      fields={[
        { key: "title", label: "Title" },
        { key: "slug", label: "Slug", help: "e.g. about, faq, privacy-policy, terms" },
        { key: "meta_description", label: "Meta Description" },
        {
          key: "content",
          label: "Content",
          type: "textarea",
          help: "Use '## Heading' for sections, '• ' for bullets, and 'Q:' / 'A:' for FAQ items.",
        },
      ]}
      columns={[
        { key: "title", label: "Title" },
        { key: "slug", label: "Slug" },
        {
          key: "updated_at",
          label: "Updated",
          render: (r) => new Date(String(r.updated_at)).toLocaleDateString("en-PK"),
        },
      ]}
    />
  );
}
