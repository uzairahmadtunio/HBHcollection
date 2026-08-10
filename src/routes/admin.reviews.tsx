import { createFileRoute } from "@tanstack/react-router";
import { AdminCrud } from "@/components/admin/AdminCrud";
import type { Row } from "@/lib/admin";

export const Route = createFileRoute("/admin/reviews")({ component: AdminReviews });

function AdminReviews() {
  return (
    <AdminCrud
      table="reviews"
      title="Reviews"
      description="Approve or remove customer reviews before they appear on the store."
      orderBy="created_at"
      ascending={false}
      canCreate={false}
      transform={(v: Row) => ({
        ...v,
        is_approved: !!v.is_approved,
        is_verified: !!v.is_verified,
        is_verified_buyer: !!v.is_verified_buyer,
      })}
      fields={[
        { key: "is_approved", label: "Approved", type: "boolean" },
        { key: "is_verified", label: "Verified Buyer (legacy)", type: "boolean" },
        { key: "is_verified_buyer", label: "Verified Buyer", type: "boolean" },
        { key: "title", label: "Title" },
        { key: "comment", label: "Comment", type: "textarea" },
        { key: "photo_url", label: "Customer Photo", type: "image" },
      ]}
      columns={[
        { key: "customer_name", label: "Customer" },
        { key: "rating", label: "Rating", render: (r) => "★".repeat(Number(r.rating ?? 0)) },
        { key: "title", label: "Title" },
        { key: "comment", label: "Comment" },
        {
          key: "photo_url",
          label: "Photo",
          render: (r) =>
            r.photo_url ? (
              <img src={String(r.photo_url)} alt="" className="h-12 w-10 object-cover" />
            ) : (
              "—"
            ),
        },
        { key: "is_approved", label: "Approved" },
      ]}

    />
  );
}
