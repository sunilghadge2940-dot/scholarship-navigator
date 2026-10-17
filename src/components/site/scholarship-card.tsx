import { Link } from "@tanstack/react-router";
import { CalendarDays, Wallet } from "lucide-react";
import type { PublicScholarship } from "@/lib/scholarships";
import { daysUntil, formatDate, availability } from "@/lib/scholarships";
import { AvailabilityBadge, ProviderBadge, VerifiedBadge } from "./availability-badge";

const FLAGS: Record<string, string> = { in: "🇮🇳", us: "🇺🇸", ca: "🇨🇦" };

export function ScholarshipCard({ s }: { s: PublicScholarship }) {
  const d = daysUntil(s.closes_on);
  const open = availability(s) === "open";
  return (
    <Link
      to="/scholarships/$slug"
      params={{ slug: s.slug }}
      className="group flex h-full flex-col rounded-xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-ring"
    >
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <AvailabilityBadge s={s} />
        <ProviderBadge type={s.provider_type} />
        <VerifiedBadge verifiedAt={s.verified_at} />
      </div>
      <h3 className="text-lg font-semibold leading-snug text-foreground group-hover:text-primary">{s.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        <span aria-hidden>{FLAGS[s.country_code] ?? "🌐"}</span> {s.provider}
      </p>
      {s.summary && <p className="mt-3 line-clamp-2 text-sm text-foreground/80">{s.summary}</p>}
      <div className="mt-auto space-y-1.5 pt-4 text-sm">
        {s.award_amount && (
          <p className="flex items-center gap-2 font-medium"><Wallet className="h-4 w-4 text-primary" aria-hidden />{s.award_amount}</p>
        )}
        <p className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="h-4 w-4" aria-hidden />
          Closes {formatDate(s.closes_on)}
          {open && d !== null && d <= 14 && <span className="font-semibold text-destructive">· {d}d left</span>}
        </p>
      </div>
    </Link>
  );
}

export function EmptyCatalogue({ message }: { message?: string | undefined }) {
  return (
    <div className="rounded-xl border border-dashed bg-card/60 p-8 text-center">
      <p className="font-display text-lg">No verified listings here yet</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {message ?? "We only publish scholarships after a human reviewer checks them against the official source. New listings will appear here once verified."}
      </p>
    </div>
  );
}
