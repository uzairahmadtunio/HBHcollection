import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/site/CatalogPage";

export const Route = createFileRoute("/women")({
  head: () => ({
    meta: [
      { title: "Women's Collection — HBH Collection Pakistan" },
      {
        name: "description",
        content:
          "Shop women's T-shirts, kurtas, tops, jeans and activewear from HBH Collection. Delivery all over Pakistan.",
      },
      { property: "og:title", content: "Women's Collection — HBH Collection" },
      { property: "og:description", content: "Premium women's fashion, delivered across Pakistan." },
    ],
  }),
  component: () => (
    <CatalogPage
      title="WOMEN'S"
      gender="women"
      subtitle="Tops, kurtas, jeans and activewear cut for a premium fit."
    />
  ),
});
