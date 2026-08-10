import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { jobsQuery, pageQuery } from "@/lib/pages";
import { PageContent, PageHero } from "@/components/site/PageContent";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers at HBH Collection — Join Our Team" },
      {
        name: "description",
        content:
          "Open roles at HBH Collection: social media, customer support and delivery coordination. Remote and on-site in Pakistan.",
      },
      { property: "og:title", content: "Careers at HBH Collection" },
      {
        property: "og:description",
        content: "We're growing fast and always looking for talented people.",
      },
    ],
  }),
  component: CareersPage,
});

const WHY = [
  ["🚀", "Fast-Growing Brand", "Be part of something big"],
  ["💡", "Creative Freedom", "Your ideas matter here"],
  ["🤝", "Supportive Team", "Work with passionate people"],
  ["📈", "Growth Opportunities", "Grow as we grow"],
];

function CareersPage() {
  const { data: page } = useQuery(pageQuery("careers"));
  const { data: jobs } = useQuery(jobsQuery);

  return (
    <main>
      <PageHero
        eyebrow="CAREERS"
        title="JOIN THE HBH FAMILY"
        subtitle="We're growing fast and always looking for talented people."
      />

      <div className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="heading gold-rule mb-6 text-sm tracking-[0.25em] text-gold">
          WHY WORK WITH US
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map(([icon, title, text]) => (
            <div key={title} className="border border-border bg-surface p-6">
              <span className="text-2xl">{icon}</span>
              <h3 className="heading mt-3 text-xs tracking-[0.15em] text-gold">
                {title.toUpperCase()}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <h2 className="heading gold-rule mb-6 mt-16 text-sm tracking-[0.25em] text-gold">
          CURRENT OPENINGS
        </h2>
        {jobs?.length ? (
          <div className="space-y-4">
            {jobs.map((j) => (
              <article key={j.id} className="border border-border bg-surface p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="heading text-sm tracking-[0.12em]">{j.title.toUpperCase()}</h3>
                  <span className="heading border border-gold px-2 py-1 text-[10px] tracking-[0.15em] text-gold">
                    {j.type}
                  </span>
                  {j.location && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {j.location}
                    </span>
                  )}
                </div>
                {j.requirements && (
                  <ul className="mt-4 space-y-2">
                    {j.requirements
                      .split("\n")
                      .map((r) => r.replace(/^[•\-*]\s*/, "").trim())
                      .filter(Boolean)
                      .map((r) => (
                        <li key={r} className="flex gap-3 text-sm text-muted-foreground">
                          <span className="mt-2 h-1 w-1 shrink-0 bg-gold" /> {r}
                        </li>
                      ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No openings right now — check back soon or send us your CV anyway.
          </p>
        )}

        <div className="mt-16">
          <PageContent content={page?.content ?? ""} />
        </div>
      </div>
    </main>
  );
}
