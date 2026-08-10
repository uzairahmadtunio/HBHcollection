import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CatalogPage } from "@/components/site/CatalogPage";
import { categoriesQuery } from "@/lib/data";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const pretty = params.slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    return {
      meta: [
        { title: `${pretty} — HBH Collection Pakistan` },
        {
          name: "description",
          content: `Shop ${pretty} from HBH Collection with delivery all over Pakistan.`,
        },
        { property: "og:title", content: `${pretty} — HBH Collection` },
        { property: "og:description", content: `Shop ${pretty} with delivery all over Pakistan.` },
      ],
    };
  },
  component: CategoryRoute,
});

function CategoryRoute() {
  const { slug } = useParams({ from: "/category/$slug" });
  const { data: categories } = useQuery(categoriesQuery);
  const cat = (categories ?? []).find((c) => c.slug === slug);
  return (
    <CatalogPage
      title={(cat?.name ?? slug.replace(/-/g, " ")).toUpperCase()}
      categorySlug={slug}
      subtitle={cat ? `HBH Collection · ${cat.gender.toUpperCase()}` : undefined}
    />
  );
}
