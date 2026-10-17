import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { getMeta, listScholarships, type Filters } from "@/lib/public.functions";
import { CATEGORIES, ELIGIBILITY_TAGS } from "@/lib/scholarships";
import { EmptyCatalogue, ScholarshipCard } from "@/components/site/scholarship-card";
import { OfficialDisclaimer } from "@/components/site/layout";

const search = z.object({
  q: z.string().max(100).optional().catch(undefined),
  country: z.string().max(5).optional().catch(undefined),
  level: z.string().max(30).optional().catch(undefined),
  type: z.enum(["government", "private"]).optional().catch(undefined),
  category: z.string().max(30).optional().catch(undefined),
  tag: z.string().max(40).optional().catch(undefined),
  status: z.enum(["open", "upcoming", "closed"]).optional().catch(undefined),
  page: z.number().int().min(1).max(500).optional().catch(undefined),
});

const metaQ = queryOptions({ queryKey: ["meta"], queryFn: () => getMeta(), staleTime: 3600_000 });
const listQ = (f: Filters) => queryOptions({ queryKey: ["list", f], queryFn: () => listScholarships({ data: f }) });

export const Route = createFileRoute("/scholarships/")({
  validateSearch: search,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => Promise.all([context.queryClient.ensureQueryData(metaQ), context.queryClient.ensureQueryData(listQ(deps))]),
  head: () => ({
    meta: [
      { title: "Browse Scholarships, Grants & Student Schemes | StudentSchemeHub" },
      { name: "description", content: "Filter verified scholarships by country, education level, government or private provider, eligibility and application status." },
      { property: "og:title", content: "Browse verified scholarships | StudentSchemeHub" },
      { property: "og:description", content: "Filter scholarships for India, the US and Canada by level, provider and deadline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ListPage,
});

function ListPage() {
  const f = Route.useSearch();
  const navigate = useNavigate({ from: "/scholarships/" });
  const { data: meta } = useSuspenseQuery(metaQ);
  const { data } = useSuspenseQuery(listQ(f));
  const [q, setQ] = useState(f.q ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const set = (patch: Partial<Filters>) => navigate({ search: (prev) => ({ ...prev, ...patch, page: undefined }) });
  const active = Object.entries(f).filter(([k, v]) => v && k !== "page");
  const pages = Math.max(1, Math.ceil(data.count / data.pageSize));
  const page = f.page ?? 1;
  const countryName = meta.countries.find((c) => c.code === f.country)?.name;
  const levelName = meta.levels.find((l) => l.code === f.level)?.name;

  const Select = ({ label, value, onChange, options }: { label: string; value?: string | undefined; onChange: (v?: string) => void; options: { v: string; l: string }[] }) => (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold">{label}</span>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value || undefined)} className="h-10 w-full rounded-lg border bg-background px-3">
        <option value="">Any</option>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold sm:text-4xl">
        {levelName || countryName ? `${levelName ?? ""} scholarships${countryName ? ` in ${countryName}` : ""}`.trim() : "All scholarships"}
      </h1>
      <p className="mt-2 text-muted-foreground">{data.count} verified listing{data.count === 1 ? "" : "s"}</p>

      <form className="mt-6 flex gap-2" onSubmit={(e) => { e.preventDefault(); set({ q: q.trim() || undefined }); }} role="search">
        <label htmlFor="q" className="sr-only">Search</label>
        <input id="q" value={q} onChange={(e) => setQ(e.target.value)} maxLength={100} placeholder="Search scholarships…" className="h-11 flex-1 rounded-lg border bg-card px-4" />
        <button className="h-11 rounded-lg bg-primary px-5 font-semibold text-primary-foreground">Search</button>
        <button type="button" onClick={() => setShowFilters(!showFilters)} className="flex h-11 items-center gap-2 rounded-lg border bg-card px-3 lg:hidden" aria-expanded={showFilters}>
          <SlidersHorizontal className="h-4 w-4" /><span className="sr-only sm:not-sr-only">Filters</span>
        </button>
      </form>

      {active.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {active.map(([k, v]) => (
            <button key={k} onClick={() => set({ [k]: undefined } as Partial<Filters>)} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">
              {k}: {String(v)} <X className="h-3.5 w-3.5" />
            </button>
          ))}
          <Link to="/scholarships" className="text-sm font-semibold text-primary underline">Clear all</Link>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={`${showFilters ? "block" : "hidden"} space-y-4 rounded-xl border bg-card p-5 lg:block lg:self-start`} aria-label="Filters">
          <Select label="Country" value={f.country} onChange={(v) => set({ country: v })} options={meta.countries.map((c) => ({ v: c.code, l: `${c.flag} ${c.name}` }))} />
          <Select label="Education level" value={f.level} onChange={(v) => set({ level: v })} options={meta.levels.map((l) => ({ v: l.code, l: l.name }))} />
          <Select label="Provider type" value={f.type} onChange={(v) => set({ type: v as Filters["type"] })} options={[{ v: "government", l: "Government" }, { v: "private", l: "Private" }]} />
          <Select label="Application status" value={f.status} onChange={(v) => set({ status: v as Filters["status"] })} options={[{ v: "open", l: "Open now" }, { v: "upcoming", l: "Opening soon" }, { v: "closed", l: "Expired" }]} />
          <Select label="Benefit / category" value={f.category} onChange={(v) => set({ category: v })} options={CATEGORIES.map((c) => ({ v: c.code, l: c.name }))} />
          <Select label="Eligibility" value={f.tag} onChange={(v) => set({ tag: v })} options={ELIGIBILITY_TAGS.map((t) => ({ v: t, l: t.replace(/-/g, " ") }))} />
        </aside>
        <div>
          {data.error && <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{data.error}</p>}
          {data.rows.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{data.rows.map((s) => <ScholarshipCard key={s.id} s={s} />)}</div>
          ) : (
            <EmptyCatalogue message={active.length ? "No verified scholarships match these filters yet. Try removing a filter." : undefined} />
          )}
          {pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
              <button disabled={page <= 1} onClick={() => navigate({ search: (p) => ({ ...p, page: page - 1 }) })} className="rounded-lg border px-4 py-2 disabled:opacity-40">Previous</button>
              <span className="text-sm">Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => navigate({ search: (p) => ({ ...p, page: page + 1 }) })} className="rounded-lg border px-4 py-2 disabled:opacity-40">Next</button>
            </nav>
          )}
          <div className="mt-10"><OfficialDisclaimer compact /></div>
        </div>
      </div>
    </div>
  );
}
