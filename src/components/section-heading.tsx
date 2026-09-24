export function SectionHeading({ eyebrow, title, copy }: { eyebrow?: string; title: string; copy?: string }) {
  return <div className="mb-7">
    {eyebrow && <p className="mb-2 font-mono text-xs uppercase text-primary">{eyebrow}</p>}
    <h2 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h2>
    {copy && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{copy}</p>}
  </div>;
}