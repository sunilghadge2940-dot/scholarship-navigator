import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getMeta, listResources, type ResourceFilters } from "@/lib/public.functions";
import { EmptyResources, ResourceCard } from "@/components/site/resource-card";
import { OfficialDisclaimer } from "@/components/site/layout";

const metaQ = queryOptions({ queryKey: ["meta"], queryFn: () => getMeta(), staleTime: 3600_000 });
const resourcesQ = (f: ResourceFilters) =>
  queryOptions({ queryKey: ["resources", f], queryFn: () => listResources({ data: f }) });

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Books & Courses — StudentSchemeHub" },
      { name: "description", content: "Hand-picked, human-reviewed books and courses for students from Class 8 to graduation in India, the US and Canada." },
      { property: "og:title", content: "Books & Courses — StudentSchemeHub" },
      { property: "og:description", content: "Hand-picked, human-reviewed books and courses for students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(metaQ), context.queryClient.ensureQueryData(resourcesQ({}))]),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { data: meta } = useSuspenseQuery(metaQ);
  const [type, setType] = useState<"" | "book" | "course">("");
  const [pricing, setPricing] = useState<"" | "free" | "paid">("");
  const [country, setCountry] = useState("");
  const [level, setLevel] = useState("");
  const [q, setQ] = useState("");

  const filters: ResourceFilters = {
    type: type || undefined,
    pricing: pricing || undefined,
    country: country || undefined,
    level: level || undefined,
    q: q.trim() || undefined,
  };
  const { data } = useSuspenseQuery(resourcesQ(filters));

  const selectCls = "h-11 rounded-lg border bg-background px-3 text-sm";

  return (
    <div className="container-page py-12">
      <h1 className="text-4xl font-semibold">Books &amp; Courses</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Learning resources our team has reviewed. Links go to the official page of the provider or author.
      </p>

      <div className="mt-8 grid gap-2 rounded-2xl border bg-card p-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={100}
          placeholder="Search by name or provider"
          aria-label="Search resources"
          className="h-11 rounded-lg border bg-background px-3 text-sm lg:col-span-1"
        />
        <select aria-label="Type" value={type} onChange={(e) => setType(e.target.value as any)} className={selectCls}>
          <option value="">All types</option>
          <option value="book">Books</option>
          <option value="course">Courses</option>
        </select>
        <select aria-label="Pricing" value={pricing} onChange={(e) => setPricing(e.target.value as any)} className={selectCls}>
          <option value="">Free &amp; paid</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
        <select aria-label="Country" value={country} onChange={(e) => setCountry(e.target.value)} className={selectCls}>
          <option value="">All countries</option>
          {meta.countries.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
        </select>
        <select aria-label="Education level" value={level} onChange={(e) => setLevel(e.target.value)} className={selectCls}>
          <option value="">All levels</option>
          {meta.levels.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>
      </div>

      <div className="mt-8">
        {data.error ? (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-sm">{data.error}</p>
        ) : data.rows.length ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">{data.count} resource{data.count === 1 ? "" : "s"}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.rows.map((r) => <ResourceCard key={r.id} r={r} />)}
            </div>
          </>
        ) : (
          <EmptyResources />
        )}
      </div>

      <div className="mt-12">
        <OfficialDisclaimer compact />
      </div>
    </div>
  );
}
