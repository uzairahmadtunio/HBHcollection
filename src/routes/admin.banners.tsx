import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/AdminCrud";
import type { Row } from "@/lib/admin";

export const Route = createFileRoute("/admin/banners")({ component: AdminBanners });

function AdminBanners() {
  return (
    <AdminCrud
      table="banners"
      title="Hero Banners"
      description="Homepage slider images and call-to-action links."
      orderBy="display_order"
      defaults={{ display_order: 0, is_active: true }}
      transform={(v: Row) => ({ ...v, is_active: !!v.is_active })}
      fields={[
        { key: "title", label: "Title" },
        { key: "subtitle", label: "Subtitle" },
        { key: "image_url", label: "Hero Image", type: "image", help: "Upload an image or paste a link" },
        { key: "cta_text", label: "Button Text" },
        { key: "cta_link", label: "Button Link", placeholder: "/men" },
        { key: "display_order", label: "Display Order", type: "number" },
        { key: "is_active", label: "Active", type: "boolean" },
      ]}
      columns={[
        {
          key: "image_url",
          label: "Image",
          render: (r) =>
            r.image_url ? (
              <img src={String(r.image_url)} alt="" className="h-10 w-16 object-cover" />
            ) : (
              "—"
            ),
        },
        { key: "title", label: "Title" },
        { key: "cta_text", label: "CTA" },
        { key: "display_order", label: "Order" },
        { key: "is_active", label: "Active" },
      ]}
    />
  );
}
