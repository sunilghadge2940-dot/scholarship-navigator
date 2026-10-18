import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyResources, ResourceCard } from "./resource-card";
import type { PublicResource } from "@/lib/resources";

type TypeTab = "all" | "book" | "course";
type PricingTab = "all" | "free" | "paid";

const TYPE_TABS: { key: TypeTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "book", label: "Books" },
  { key: "course", label: "Courses" },
];
const PRICING_TABS: { key: PricingTab; label: string }[] = [
  { key: "all", label: "Any price" },
  { key: "free", label: "Free" },
  { key: "paid", label: "Paid" },
];

export function filterResources(items: PublicResource[], type: TypeTab, pricing: PricingTab) {
  return items.filter(
    (r) => (type === "all" || r.type === type) && (pricing === "all" || r.pricing === pricing),
  );
}

export function ResourcesSection({ items }: { items: PublicResource[] }) {
  const [type, setType] = useState<TypeTab>("all");
  const [pricing, setPricing] = useState<PricingTab>("all");
  const shown = filterResources(items, type, pricing);

  return (
    <section aria-labelledby="resources-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="resources-heading" className="text-3xl font-semibold">Books &amp; Courses</h2>
          <p className="mt-1 text-sm text-muted-foreground">Hand-picked learning resources, reviewed by our team.</p>
        </div>
        <Link to="/resources" className="text-sm font-semibold text-primary hover:underline">View all</Link>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border bg-card p-1" role="tablist" aria-label="Resource type">
          {TYPE_TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={type === t.key}
              onClick={() => setType(t.key)}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold ${type === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-lg border bg-card p-1" role="tablist" aria-label="Pricing">
          {PRICING_TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={pricing === t.key}
              onClick={() => setPricing(t.key)}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold ${pricing === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {!items.length ? (
          <EmptyResources />
        ) : shown.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((r) => <ResourceCard key={r.id} r={r} />)}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
            Nothing matches these filters yet — try a different combination.
          </p>
        )}
      </div>
    </section>
  );
}
