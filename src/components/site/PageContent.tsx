import { parseBlocks } from "@/lib/pages";

export function PageContent({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-6">
      {blocks.map((b, i) => {
        if (b.kind === "heading")
          return (
            <h2 key={i} className="heading gold-rule pt-4 text-sm tracking-[0.25em] text-gold">
              {b.text}
            </h2>
          );
        if (b.kind === "note")
          return (
            <p key={i} className="text-xs uppercase tracking-widest text-muted-foreground">
              {b.text}
            </p>
          );
        if (b.kind === "list")
          return (
            <ul key={i} className="space-y-2">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="mt-2 h-1 w-1 shrink-0 bg-gold" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          );
        return (
          <p key={i} className="text-sm leading-relaxed text-muted-foreground">
            {b.text}
          </p>
        );
      })}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        {eyebrow && (
          <p className="heading text-[10px] tracking-[0.4em] text-gold">{eyebrow}</p>
        )}
        <h1 className="display mt-3 text-5xl md:text-6xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
