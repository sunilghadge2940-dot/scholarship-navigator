import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, Search, ShieldCheck, FileSearch, Users } from "lucide-react";
import { useState } from "react";
import hero from "@/assets/hero-students.jpg";
import { getHome, getMeta } from "@/lib/public.functions";
import { CATEGORIES } from "@/lib/scholarships";
import { EmptyCatalogue, ScholarshipCard } from "@/components/site/scholarship-card";
import { OfficialDisclaimer } from "@/components/site/layout";
import type { PublicScholarship } from "@/lib/scholarships";

const metaQ = queryOptions({ queryKey: ["meta"], queryFn: () => getMeta(), staleTime: 3600_000 });
const homeQ = queryOptions({ queryKey: ["home"], queryFn: () => getHome() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudentSchemeHub — Verified Scholarships for India, US & Canada" },
      { name: "description", content: "Discover human-verified government and private scholarships, grants and student welfare schemes for Class 8 to postgraduate students in India, the US and Canada." },
      { property: "og:title", content: "StudentSchemeHub — Verified Scholarships" },
      { property: "og:description", content: "Human-verified scholarships, grants and welfare schemes for students from Class 8 to graduation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(metaQ), context.queryClient.ensureQueryData(homeQ)]),
  component: Index,
});

function Index() {
  const { data: meta } = useSuspenseQuery(metaQ);
  const { data: home } = useSuspenseQuery(homeQ);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [level, setLevel] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/scholarships", search: { q: q.trim() || undefined, country: country || undefined, level: level || undefined } });
  };

  return (
    <>
      <section className="bg-hero text-ink-foreground">
        <div className="container-page grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-ink-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <BadgeCheck className="h-4 w-4 text-accent" /> Every listing checked by a human
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              Find the scholarship <em className="text-accent not-italic">meant for you.</em>
            </h1>
            <p className="mt-5 max-w-xl text-lg opacity-85">
              Government and private scholarships, grants and welfare schemes for students from Class 8 to postgraduate — in India, the United States and Canada.
            </p>
            <form onSubmit={submit} className="mt-8 rounded-2xl bg-card p-2 text-card-foreground shadow-lift" role="search">
              <div className="flex items-center gap-2 px-3">
                <Search className="h-5 w-5 text-muted-foreground" aria-hidden />
                <label htmlFor="hero-q" className="sr-only">Search scholarships</label>
                <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} maxLength={100}
                  placeholder="Search by name, provider or keyword" className="h-12 w-full bg-transparent text-base outline-none" />
              </div>
              <div className="grid gap-2 border-t p-2 sm:grid-cols-[1fr_1fr_auto]">
                <select aria-label="Country" value={country} onChange={(e) => setCountry(e.target.value)} className="h-11 rounded-lg border bg-background px-3 text-sm">
                  <option value="">All countries</option>
                  {meta.countries.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
                <select aria-label="Education level" value={level} onChange={(e) => setLevel(e.target.value)} className="h-11 rounded-lg border bg-background px-3 text-sm">
                  <option value="">All education levels</option>
                  {meta.levels.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
                <button className="h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Search</button>
              </div>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">
              {meta.levels.map((l) => (
                <Link key={l.code} to="/scholarships" search={{ level: l.code }} className="rounded-full border border-ink-foreground/25 px-3 py-1.5 text-sm hover:bg-ink-foreground/10">
                  {l.name}
                </Link>
              ))}
            </div>
          </div>
          <img src={hero} alt="Students from India, the US and Canada studying together" width={1200} height={912}
            className="hidden w-full rounded-3xl object-cover shadow-lift lg:block" fetchPriority="high" />
        </div>
      </section>

      <section className="container-page -mt-6 grid gap-3 sm:grid-cols-3">
        {meta.countries.map((c) => (
          <Link key={c.code} to="/scholarships" search={{ country: c.code }}
            className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-card hover:shadow-lift">
            <span className="flex items-center gap-3 font-semibold"><span className="text-2xl" aria-hidden>{c.flag}</span>{c.name}</span>
            <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
        ))}
      </section>

      <div className="container-page mt-14 space-y-16">
        <Rail title="Upcoming deadlines" items={home.deadlines} link={{ status: "open" }} />
        <Rail title="Latest scholarships" items={home.latest} link={{}} />
        <Rail title="Recently verified" items={home.verified} link={{}} hideEmpty={home.total === 0} />

        <section>
          <h2 className="text-3xl font-semibold">Browse by category</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <Link key={c.code} to="/scholarships" search={{ category: c.code }}
                className="rounded-xl border bg-card px-4 py-4 text-sm font-semibold hover:border-primary hover:text-primary">
                {c.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl bg-secondary p-8 md:grid-cols-3">
          {[
            { icon: FileSearch, t: "Official sources first", d: "Listings are built from government, university and provider websites, with the source link preserved." },
            { icon: ShieldCheck, t: "Independent verification", d: "A reviewer who didn't write the listing checks it. Big changes need two approvals." },
            { icon: Users, t: "Free for students", d: "Eligibility and application information is always free — no paywalls, no hidden fees." },
          ].map(({ icon: I, t, d }) => (
            <div key={t}>
              <I className="h-7 w-7 text-primary" />
              <h3 className="mt-3 text-xl font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </section>

        <OfficialDisclaimer />
      </div>
    </>
  );
}

function Rail({ title, items, link, hideEmpty }: { title: string; items: PublicScholarship[]; link: Record<string, string>; hideEmpty?: boolean }) {
  if (!items.length && hideEmpty) return null;
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-3xl font-semibold">{title}</h2>
        <Link to="/scholarships" search={link} className="text-sm font-semibold text-primary hover:underline">View all</Link>
      </div>
      <div className="mt-6">
        {items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((s) => <ScholarshipCard key={s.id} s={s} />)}</div>
        ) : (
          <EmptyCatalogue />
        )}
      </div>
    </section>
  );
}
