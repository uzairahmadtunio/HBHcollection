import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/site/CatalogPage";

export const Route = createFileRoute("/men")({
  head: () => ({
    meta: [
      { title: "Men's Collection — HBH Collection Pakistan" },
      {
        name: "description",
        content:
          "Shop men's premium T-shirts, casual shirts, jeans, hoodies and shorts from HBH Collection. Delivery all over Pakistan.",
      },
      { property: "og:title", content: "Men's Collection — HBH Collection" },
      {
        property: "og:description",
        content: "Premium men's fashion with delivery all over Pakistan.",
      },
    ],
  }),
  component: () => (
    <CatalogPage
      title="MEN'S"
      gender="men"
      subtitle="Premium T-shirts, shirts, jeans and hoodies built for everyday wear."
    />
  ),
});
