import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, ExternalLink, FileText, Mail, Phone, Wallet } from "lucide-react";
import { getScholarship } from "@/lib/public.functions";
import { availability, categoryName, daysUntil, formatDate } from "@/lib/scholarships";
import { AvailabilityBadge, ProviderBadge, VerifiedBadge } from "@/components/site/availability-badge";
import { ScholarshipCard } from "@/components/site/scholarship-card";
import { OfficialDisclaimer } from "@/components/site/layout";

const COUNTRY: Record<string, string> = { in: "India", us: "United States", ca: "Canada" };
const LEVEL: Record<string, string> = {
  "class-8-10": "Class 8–10", "class-11-12": "Class 11–12", diploma: "Diploma", undergraduate: "Undergraduate", postgraduate: "Postgraduate",
};
const q = (slug: string) => queryOptions({ queryKey: ["scholarship", slug], queryFn: () => getScholarship({ data: { slug } }) });

export const Route = createFileRoute("/scholarships/$slug")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(q(params.slug));
    if (!d.scholarship) throw notFound();
    return { name: d.scholarship.name, provider: d.scholarship.provider, summary: d.scholarship.summary, country: d.scholarship.country_code };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Scholarship not found | StudentSchemeHub" }] };
    const title = `${loaderData.name} — ${loaderData.provider} | StudentSchemeHub`;
    const desc = (loaderData.summary || `Eligibility, benefits, documents and deadlines for ${loaderData.name} in ${COUNTRY[loaderData.country] ?? ""}.`).slice(0, 158);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: `/scholarships/${params.slug}` }],
    };
  },
  component: Detail,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 text-foreground/85">{children}</div>
    </section>
  );
}

function Detail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(q(slug));
  const s = data.scholarship!;
  const a = availability(s);
  const d = daysUntil(s.closes_on);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MonetaryGrant",
    name: s.name,
    description: s.summary || undefined,
    funder: { "@type": "Organization", name: s.provider },
    url: s.official_url || undefined,
    areaServed: COUNTRY[s.country_code],
  };

  return (
    <article className="container-page py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/scholarships" className="hover:underline">Scholarships</Link> /{" "}
        <Link to="/scholarships" search={{ country: s.country_code }} className="hover:underline">{COUNTRY[s.country_code]}</Link>
      </nav>
      <div className="mt-4 flex flex-wrap gap-2">
        <AvailabilityBadge s={s} />
        <ProviderBadge type={s.provider_type} />
        <VerifiedBadge verifiedAt={s.verified_at} />
      </div>
      <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">{s.name}</h1>
      <p className="mt-2 text-lg text-muted-foreground">by {s.provider}</p>
      {a === "closed" && (
        <p className="mt-4 rounded-lg bg-muted p-3 text-sm font-medium">This scholarship's application period has ended. It's kept here for reference — check the official site for the next cycle.</p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {s.summary && <p className="text-lg leading-relaxed">{s.summary}</p>}
          <Section title="Benefits & award"><p className="prose-body">{s.benefits || "Not specified by the provider."}</p></Section>
          <Section title="Eligibility"><p className="prose-body">{s.eligibility || "Not specified by the provider."}</p></Section>
          <Section title="Required documents">
            {s.required_documents.length ? (
              <ul className="space-y-2">{s.required_documents.map((x, i) => <li key={i} className="flex gap-2"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{x}</li>)}</ul>
            ) : <p>Check the official website for the document list.</p>}
          </Section>
          <Section title="How to apply">
            {s.application_steps.length ? (
              <ol className="space-y-3">{s.application_steps.map((x, i) => (
                <li key={i} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span><span className="pt-0.5">{x}</span></li>
              ))}</ol>
            ) : <p>Follow the instructions on the official application page.</p>}
          </Section>
          {(s.contact_email || s.contact_phone || s.contact_info) && (
            <Section title="Official contact">
              <div className="space-y-2">
                {s.contact_email && <p className="flex items-center gap-2"><Mail className="h-4 w-4" /><a className="underline" href={`mailto:${s.contact_email}`}>{s.contact_email}</a></p>}
                {s.contact_phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{s.contact_phone}</p>}
                {s.contact_info && <p className="prose-body">{s.contact_info}</p>}
              </div>
            </Section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            {s.award_amount && <p className="flex items-center gap-2 text-lg font-semibold"><Wallet className="h-5 w-5 text-primary" />{s.award_amount}</p>}
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Opens</dt><dd className="font-medium">{formatDate(s.opens_on)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Closes</dt><dd className="font-medium">{formatDate(s.closes_on)}{a === "open" && d !== null && <span className="ml-1 text-destructive">({d}d left)</span>}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Country</dt><dd className="font-medium">{COUNTRY[s.country_code]}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Level</dt><dd className="text-right font-medium">{s.education_levels.map((l) => LEVEL[l] ?? l).join(", ") || "—"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Category</dt><dd className="font-medium">{categoryName(s.category)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Last verified</dt><dd className="font-medium">{s.verified_at ? formatDate(s.verified_at) : "Awaiting re-verification"}</dd></div>
            </dl>
            {s.official_url && (
              <a href={s.official_url} target="_blank" rel="noopener noreferrer nofollow"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90">
                Official application <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {s.source_url && (
              <a href={s.source_url} target="_blank" rel="noopener noreferrer nofollow" className="mt-3 block text-center text-sm text-primary underline">
                View official source
              </a>
            )}
            {s.verified_at && <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-success" />Checked against the official source on {formatDate(s.verified_at)}.</p>}
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="h-4 w-4" />Updated {formatDate(s.updated_at)}</p>
          </div>
          <OfficialDisclaimer compact />
        </aside>
      </div>

      {data.related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Related scholarships</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data.related.map((r) => <ScholarshipCard key={r.id} s={r} />)}</div>
        </section>
      )}
    </article>
  );
}
