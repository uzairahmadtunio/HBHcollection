import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pageQuery } from "@/lib/pages";
import { PageContent, PageHero } from "@/components/site/PageContent";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About HBH Collection — Premium Pakistani Fashion" },
      {
        name: "description",
        content:
          "Born in Pakistan, built for Pakistan. Learn the story, values and promise behind HBH Collection's premium clothing.",
      },
      { property: "og:title", content: "About HBH Collection" },
      {
        property: "og:description",
        content: "Premium quality clothing for every Pakistani at honest prices.",
      },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: "🔥",
    title: "Quality First",
    text: "We never compromise on fabric or finish. Every product passes our quality check before it reaches your door.",
  },
  {
    icon: "🇵🇰",
    title: "Made for Pakistan",
    text: "Our designs, sizes, and fabrics are chosen keeping Pakistani weather and style in mind.",
  },
  {
    icon: "💰",
    title: "Honest Pricing",
    text: "No overcharging, no hidden fees. Premium quality at prices that make sense.",
  },
  {
    icon: "🤝",
    title: "Customer First",
    text: "Your satisfaction is our priority. 7-day easy returns, no questions asked.",
  },
];

const NUMBERS = [
  ["1000+", "Happy Customers"],
  ["All Pakistan", "Delivery"],
  ["7-Day", "Easy Returns"],
  ["100%", "Genuine Products"],
];

function AboutPage() {
  const { data: page } = useQuery(pageQuery("about"));

  return (
    <main>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className="display text-6xl text-gold">HBH</span>
            <span className="heading text-[11px] tracking-[0.4em] text-primary">COLLECTION</span>
          </div>
          <h1 className="display mt-8 text-5xl md:text-7xl">WHO WE ARE</h1>
          <p className="heading mt-4 text-xs tracking-[0.3em] text-muted-foreground">
            BORN IN PAKISTAN. BUILT FOR PAKISTAN.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <PageContent content={page?.content ?? ""} />
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="display gold-rule mb-10 text-4xl">OUR VALUES</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="border border-border bg-background p-6 transition-colors hover:border-gold"
              >
                <span className="text-3xl">{v.icon}</span>
                <h3 className="heading mt-4 text-xs tracking-[0.2em] text-gold">
                  {v.title.toUpperCase()}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 border border-border bg-surface p-8 text-center sm:grid-cols-2 lg:grid-cols-4">
          {NUMBERS.map(([big, small]) => (
            <div key={small}>
              <p className="display text-4xl text-gold">{big}</p>
              <p className="heading mt-2 text-[10px] tracking-[0.25em] text-muted-foreground">
                {small.toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24 text-center">
        <h2 className="display text-4xl">READY TO UPGRADE YOUR WARDROBE?</h2>
        <Link
          to="/men"
          className="heading mt-6 inline-flex bg-primary px-8 py-4 text-xs tracking-[0.25em] text-primary-foreground hover:bg-primary-hover"
        >
          SHOP NOW
        </Link>
      </section>
    </main>
  );
}
