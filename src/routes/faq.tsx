import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pageQuery, parseFaq } from "@/lib/pages";
import { PageHero } from "@/components/site/PageContent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { waLink } from "@/lib/shop";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQs — Orders, Delivery & Returns | HBH Collection" },
      {
        name: "description",
        content:
          "Answers about HBH Collection payment methods, delivery charges and times, returns, sizing and account questions.",
      },
      { property: "og:title", content: "HBH Collection FAQs" },
      {
        property: "og:description",
        content: "Everything about ordering, payment, delivery and returns in Pakistan.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { data: page } = useQuery(pageQuery("faq"));
  const sections = parseFaq(page?.content ?? "");

  return (
    <main>
      <PageHero
        eyebrow="HELP CENTRE"
        title="FREQUENTLY ASKED QUESTIONS"
        subtitle="Everything you need to know about ordering from HBH Collection."
      />

      <div className="mx-auto max-w-3xl px-4 py-16">
        {sections.map((sec) => (
          <section key={sec.title} className="mb-12">
            <h2 className="heading gold-rule mb-4 text-sm tracking-[0.25em] text-gold">
              {sec.title}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {sec.items.map((item, i) => (
                <AccordionItem key={i} value={`${sec.title}-${i}`} className="border-border">
                  <AccordionTrigger className="text-left text-sm hover:text-gold">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}

        <div className="border border-gold/50 bg-surface p-8 text-center">
          <p className="heading text-xs tracking-[0.2em]">STILL HAVE A QUESTION?</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a
              href={waLink("Hi HBH Collection! I have a question.")}
              target="_blank"
              rel="noreferrer"
              className="heading bg-success px-6 py-3 text-xs tracking-[0.2em] text-background"
            >
              WHATSAPP US
            </a>
            <Link
              to="/contact"
              className="heading border border-border px-6 py-3 text-xs tracking-[0.2em] hover:border-gold"
            >
              CONTACT FORM
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
