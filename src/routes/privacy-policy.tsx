import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pageQuery } from "@/lib/pages";
import { PageContent, PageHero } from "@/components/site/PageContent";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — HBH Collection" },
      {
        name: "description",
        content:
          "How HBH Collection collects, uses, shares and protects your personal information when you shop with us.",
      },
      { property: "og:title", content: "Privacy Policy — HBH Collection" },
      {
        property: "og:description",
        content: "Your data, your rights — read how we handle your information.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { data: page } = useQuery(pageQuery("privacy-policy"));

  return (
    <main>
      <PageHero
        eyebrow="LEGAL"
        title="PRIVACY POLICY"
        subtitle="Your privacy matters to us. Here's exactly how we handle your information."
      />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <PageContent content={page?.content ?? ""} />
      </div>
    </main>
  );
}
