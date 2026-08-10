import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pageQuery } from "@/lib/pages";
import { PageContent, PageHero } from "@/components/site/PageContent";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — HBH Collection" },
      {
        name: "description",
        content:
          "The terms that apply when you browse and order from HBH Collection — pricing, payment, delivery and returns.",
      },
      { property: "og:title", content: "Terms & Conditions — HBH Collection" },
      {
        property: "og:description",
        content: "Ordering, payment, delivery and liability terms for HBH Collection customers.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { data: page } = useQuery(pageQuery("terms"));

  return (
    <main>
      <PageHero
        eyebrow="LEGAL"
        title="TERMS & CONDITIONS"
        subtitle="By using our website and placing orders, you agree to the terms below."
      />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <PageContent content={page?.content ?? ""} />
      </div>
    </main>
  );
}
