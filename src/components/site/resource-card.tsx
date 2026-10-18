import { BookOpen, GraduationCap, ExternalLink } from "lucide-react";
import { PRICING_LABEL, RESOURCE_TYPE_LABEL, type PublicResource } from "@/lib/resources";

export function ResourceCard({ r }: { r: PublicResource }) {
  const TypeIcon = r.type === "book" ? BookOpen : GraduationCap;
  return (
    <a
      href={r.official_url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group flex flex-col rounded-xl border bg-card p-5 shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
          <TypeIcon className="h-3.5 w-3.5" aria-hidden />
          {RESOURCE_TYPE_LABEL[r.type]}
        </span>
        <span
          className={
            r.pricing === "free"
              ? "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
              : "rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent-foreground"
          }
        >
          {PRICING_LABEL[r.pricing]}
        </span>
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold leading-snug group-hover:text-primary">{r.name}</h3>
      {r.provider && <p className="mt-1 text-sm text-muted-foreground">{r.provider}</p>}
      {r.description && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{r.description}</p>}
      <p className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        {r.pricing === "paid" && r.price_text ? <span>{r.price_text} · </span> : null}
        Visit official page <ExternalLink className="h-4 w-4" aria-hidden />
      </p>
    </a>
  );
}

export function EmptyResources() {
  return (
    <div className="rounded-xl border border-dashed bg-card p-10 text-center">
      <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
      <p className="mt-3 font-semibold">No books or courses yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Our team is curating trustworthy learning resources. Check back soon — we only list items we've reviewed.
      </p>
    </div>
  );
}
