import { BadgeCheck, CalendarClock, CircleDot, CircleOff, HelpCircle } from "lucide-react";
import { availability, AVAILABILITY_LABEL, type Availability } from "@/lib/scholarships";
import { cn } from "@/lib/utils";

const STYLES: Record<Availability, string> = {
  open: "bg-success/12 text-success border-success/30",
  upcoming: "bg-info/10 text-info border-info/30",
  closed: "bg-muted text-muted-foreground border-border",
  unknown: "bg-warning/15 text-warning-foreground border-warning/40",
};
const ICONS = { open: CircleDot, upcoming: CalendarClock, closed: CircleOff, unknown: HelpCircle };

export function AvailabilityBadge({ s, className }: { s: { opens_on: string | null; closes_on: string | null; status: string }; className?: string }) {
  const a = availability(s as never);
  const Icon = ICONS[a];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", STYLES[a], className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden /> {AVAILABILITY_LABEL[a]}
    </span>
  );
}

export function VerifiedBadge({ verifiedAt, className }: { verifiedAt: string | null; className?: string }) {
  if (!verifiedAt) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground", className)}>
      <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Verified
    </span>
  );
}

export function ProviderBadge({ type }: { type: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
      type === "government" ? "bg-accent/25 text-accent-foreground" : "bg-secondary text-secondary-foreground")}>
      {type === "government" ? "Government" : "Private"}
    </span>
  );
}
