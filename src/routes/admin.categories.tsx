import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/AdminCrud";
import { slugify, type Row } from "@/lib/admin";

export const Route = createFileRoute("/admin/categories")({ component: AdminCategories });

function AdminCategories() {
  return (
    <AdminCrud
      table="categories"
      title="Categories"
      description="Organise the catalogue by gender and category."
      orderBy="display_order"
      defaults={{ gender: "all", display_order: 0, is_active: true }}
      transform={(v: Row) => ({
        ...v,
        slug: v.slug ? slugify(String(v.slug)) : slugify(String(v.name ?? "")),
        is_active: !!v.is_active,
      })}
      fields={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        { key: "gender", label: "Gender", type: "select", options: ["men", "women", "kids", "all"] },
        { key: "icon", label: "Icon (emoji)" },
        { key: "image_url", label: "Category Image", type: "image", help: "Upload an image or paste a link" },
        { key: "display_order", label: "Display Order", type: "number" },
        { key: "is_active", label: "Active", type: "boolean" },
      ]}
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="text-xs text-muted-foreground">{String(r.id).slice(0, 8)}…</span> },
        { key: "name", label: "Name" },
        { key: "gender", label: "Gender" },
        { key: "display_order", label: "Order" },
        { key: "is_active", label: "Active" },
      ]}
    />
  );
}
