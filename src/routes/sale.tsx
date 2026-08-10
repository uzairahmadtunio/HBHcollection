import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/site/CatalogPage";

export const Route = createFileRoute("/sale")({
  head: () => ({
    meta: [
      { title: "Sale — Up To 50% Off | HBH Collection" },
      { name: "description", content: "Discounted premium fashion from HBH Collection. Limited stock, all Pakistan delivery." },
      { property: "og:title", content: "Sale — Up To 50% Off | HBH Collection" },
      { property: "og:description", content: "Limited-time discounts on premium HBH Collection pieces." },
    ],
  }),
  component: () => (
    <CatalogPage
      title="SALE"
      only="sale"
      subtitle="Limited stock. Once it's gone, it's gone."
      banner={
        <div className="mb-8 bg-primary p-8 text-center">
          <p className="display text-4xl text-primary-foreground sm:text-6xl">SALE UP TO 50% OFF</p>
        </div>
      }
    />
  ),
});
