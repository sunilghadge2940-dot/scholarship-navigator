import type { Database } from "@/integrations/supabase/types";

export type Scholarship = Database["public"]["Tables"]["scholarships"]["Row"];
export type ScholarshipInsert = Database["public"]["Tables"]["scholarships"]["Insert"];
export type ScholarshipStatus = Database["public"]["Enums"]["scholarship_status"];
export type AppRole = Database["public"]["Enums"]["app_role"];

/** Fields safe to show publicly (no internal reviewer data). */
export const PUBLIC_COLUMNS =
  "id,slug,name,provider,provider_type,country_code,education_levels,category,summary,benefits,award_amount,eligibility,eligibility_tags,required_documents,application_steps,opens_on,closes_on,official_url,source_url,contact_email,contact_phone,contact_info,status,verified_at,published_at,updated_at";

export type PublicScholarship = Pick<
  Scholarship,
  | "id" | "slug" | "name" | "provider" | "provider_type" | "country_code" | "education_levels" | "category"
  | "summary" | "benefits" | "award_amount" | "eligibility" | "eligibility_tags" | "required_documents"
  | "application_steps" | "opens_on" | "closes_on" | "official_url" | "source_url" | "contact_email"
  | "contact_phone" | "contact_info" | "status" | "verified_at" | "published_at" | "updated_at"
>;

export const CATEGORIES: { code: string; name: string }[] = [
  { code: "merit", name: "Merit-based" },
  { code: "need", name: "Need-based / Financial aid" },
  { code: "minority", name: "Minority & community" },
  { code: "women", name: "Women & girls" },
  { code: "disability", name: "Students with disabilities" },
  { code: "stem", name: "STEM" },
  { code: "arts", name: "Arts & humanities" },
  { code: "sports", name: "Sports" },
  { code: "research", name: "Research & fellowship" },
  { code: "grant", name: "Grants" },
  { code: "loan", name: "Loans & loan forgiveness" },
  { code: "welfare", name: "Student welfare scheme" },
];

export const ELIGIBILITY_TAGS = [
  "low-income", "first-generation", "sc-st", "obc", "minority", "women", "disability",
  "rural", "indigenous", "international-students", "domestic-only", "high-gpa",
];

export const STATUS_LABEL: Record<ScholarshipStatus, string> = {
  draft: "Draft",
  pending_verification: "Pending verification",
  changes_requested: "Changes requested",
  rejected: "Rejected",
  approved: "Approved",
  published: "Published",
  expired: "Expired",
  archived: "Archived",
};

export const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: "Super Admin",
  editor: "Editor",
  verifier: "Verifier",
  publisher: "Publisher",
};

export type Availability = "open" | "upcoming" | "closed" | "unknown";

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function availability(s: Pick<Scholarship, "opens_on" | "closes_on" | "status">): Availability {
  const t = todayISO();
  if (s.status === "expired") return "closed";
  if (s.closes_on && s.closes_on < t) return "closed";
  if (s.opens_on && s.opens_on > t) return "upcoming";
  if (s.closes_on || s.opens_on) return "open";
  return "unknown";
}

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  open: "Open now",
  upcoming: "Opening soon",
  closed: "Expired",
  unknown: "Dates not announced",
};

export function daysUntil(date: string | null) {
  if (!date) return null;
  const ms = new Date(date + "T23:59:59").getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}

export function formatDate(d: string | null | undefined) {
  if (!d) return "Not announced";
  return new Date(d.length === 10 ? d + "T00:00:00" : d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100)
    .replace(/^-|-$/g, "");
}

export function isValidUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function categoryName(code: string) {
  return CATEGORIES.find((c) => c.code === code)?.name ?? code;
}
