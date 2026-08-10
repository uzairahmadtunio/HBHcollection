import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/site/CatalogPage";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals — HBH Collection Pakistan" },
      { name: "description", content: "Just dropped: the newest HBH Collection pieces, delivered all over Pakistan." },
      { property: "og:title", content: "New Arrivals — HBH Collection" },
      { property: "og:description", content: "The newest HBH Collection drops." },
    ],
  }),
  component: () => (
    <CatalogPage title="JUST DROPPED 🔥" only="new" subtitle="The freshest HBH Collection pieces." />
  ),
});
