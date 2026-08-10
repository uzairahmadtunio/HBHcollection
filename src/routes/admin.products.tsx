import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/AdminCrud";
import { slugify, type Row } from "@/lib/admin";
import { formatPKR } from "@/lib/shop";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

const toList = (v: unknown) =>
  String(v ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

function AdminProducts() {
  return (
    <AdminCrud
      table="products"
      title="Products"
      description="Add and edit products, pricing, images, sizes and colours."
      orderBy="created_at"
      ascending={false}
      defaults={{ price: 0, stock_status: "in_stock" }}
      transform={(v: Row) => ({
        ...v,
        slug: v.slug ? slugify(String(v.slug)) : slugify(String(v.name ?? "")),
        images: String(v.images ?? "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        sizes: toList(v.sizes),
        colors: toList(v.colors).map((c) => {
          const [name, hex] = c.split("|");
          return { name: (name ?? "").trim(), hex: (hex ?? "#000000").trim() };
        }),
        is_featured: !!v.is_featured,
        is_new_arrival: !!v.is_new_arrival,
        is_bestseller: !!v.is_bestseller,
        is_on_sale: !!v.is_on_sale,
      })}
      fields={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug", help: "Leave blank to generate from the name" },
        { key: "description", label: "Description", type: "textarea" },
        { key: "price", label: "Price (PKR)", type: "number" },
        { key: "original_price", label: "Original Price (PKR)", type: "number" },
        { key: "images", label: "Product Images", type: "imagelist", help: "Upload files or paste links — one link per line" },
        { key: "sizes", label: "Sizes", type: "list", help: "Comma separated, e.g. S, M, L, XL" },
        {
          key: "colors",
          label: "Colours",
          type: "list",
          help: "One per line as Name|#HEX — e.g. Black|#000000",
        },
        { key: "material", label: "Material" },
        { key: "care_instructions", label: "Care Instructions", type: "textarea" },
        {
          key: "stock_status",
          label: "Stock Status",
          type: "select",
          options: ["in_stock", "low_stock", "out_of_stock"],
        },
        { key: "sku", label: "SKU" },
        { key: "weight_grams", label: "Weight (grams)", type: "number" },
        { key: "category_id", label: "Category ID", help: "Copy from the Categories page" },
        { key: "is_featured", label: "Featured", type: "boolean" },
        { key: "is_new_arrival", label: "New Arrival", type: "boolean" },
        { key: "is_bestseller", label: "Bestseller", type: "boolean" },
        { key: "is_on_sale", label: "On Sale", type: "boolean" },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "sku", label: "SKU" },
        {
          key: "price",
          label: "Price",
          render: (r) => <span className="text-gold">{formatPKR(Number(r.price ?? 0))}</span>,
        },
        { key: "stock_status", label: "Stock" },
        { key: "is_featured", label: "Featured" },
        { key: "is_on_sale", label: "Sale" },
      ]}
    />
  );
}
