import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/site/CatalogPage";

export const Route = createFileRoute("/kids")({
  head: () => ({
    meta: [
      { title: "Kids Collection — HBH Collection Pakistan" },
      { name: "description", content: "Boys and girls collections from HBH Collection, delivered across Pakistan." },
      { property: "og:title", content: "Kids Collection — HBH Collection" },
      { property: "og:description", content: "Durable, comfortable kidswear delivered across Pakistan." },
    ],
  }),
  component: () => (
    <CatalogPage title="KIDS" gender="kids" subtitle="Soft, durable fits for boys and girls." />
  ),
});
