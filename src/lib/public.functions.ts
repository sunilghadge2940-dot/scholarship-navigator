import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { publicClient } from "./public.server";
import { PUBLIC_COLUMNS, todayISO, type PublicScholarship } from "./scholarships";

export type Country = { code: string; name: string; flag: string; currency: string };
export type Level = { code: string; name: string; description: string };

export const getMeta = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [c, l] = await Promise.all([
    sb.from("countries").select("code,name,flag,currency").eq("is_active", true).order("sort_order"),
    sb.from("education_levels").select("code,name,description").order("sort_order"),
  ]);
  return { countries: (c.data ?? []) as Country[], levels: (l.data ?? []) as Level[] };
});

export const filterSchema = z.object({
  q: z.string().max(100).optional(),
  country: z.string().max(5).optional(),
  level: z.string().max(30).optional(),
  type: z.enum(["government", "private"]).optional(),
  category: z.string().max(30).optional(),
  tag: z.string().max(40).optional(),
  status: z.enum(["open", "upcoming", "closed"]).optional(),
  page: z.number().int().min(1).max(500).optional(),
});
export type Filters = z.infer<typeof filterSchema>;
const PAGE = 24;

export const listScholarships = createServerFn({ method: "GET" })
  .inputValidator((d: Filters) => filterSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const t = todayISO();
    let q = sb.from("scholarships").select(PUBLIC_COLUMNS, { count: "exact" }).in("status", ["published", "expired"]);
    if (data.country) q = q.eq("country_code", data.country);
    if (data.level) q = q.contains("education_levels", [data.level]);
    if (data.type) q = q.eq("provider_type", data.type);
    if (data.category) q = q.eq("category", data.category);
    if (data.tag) q = q.contains("eligibility_tags", [data.tag]);
    if (data.status === "open") q = q.eq("status", "published").or(`opens_on.is.null,opens_on.lte.${t}`).or(`closes_on.is.null,closes_on.gte.${t}`);
    if (data.status === "upcoming") q = q.eq("status", "published").gt("opens_on", t);
    if (data.status === "closed") q = q.or(`status.eq.expired,closes_on.lt.${t}`);
    const term = data.q?.replace(/[^\p{L}\p{N}\s-]/gu, " ").trim();
    if (term) q = q.or(`name.ilike.%${term}%,provider.ilike.%${term}%,summary.ilike.%${term}%`);
    const page = data.page ?? 1;
    const { data: rows, count, error } = await q
      .order("closes_on", { ascending: true, nullsFirst: false })
      .range((page - 1) * PAGE, page * PAGE - 1);
    if (error) {
      console.error(error);
      return { rows: [] as PublicScholarship[], count: 0, pageSize: PAGE, error: "Could not load scholarships." };
    }
    return { rows: (rows ?? []) as unknown as PublicScholarship[], count: count ?? 0, pageSize: PAGE, error: null };
  });

export const getHome = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const t = todayISO();
  const base = () => sb.from("scholarships").select(PUBLIC_COLUMNS).eq("status", "published");
  const [latest, deadlines, verified, total] = await Promise.all([
    base().order("published_at", { ascending: false }).limit(6),
    base().gte("closes_on", t).order("closes_on").limit(6),
    base().not("verified_at", "is", null).order("verified_at", { ascending: false }).limit(6),
    sb.from("scholarships").select("id", { count: "exact", head: true }).eq("status", "published"),
  ]);
  const cast = (r: { data: unknown }) => (r.data ?? []) as PublicScholarship[];
  return { latest: cast(latest), deadlines: cast(deadlines), verified: cast(verified), total: total.count ?? 0 };
});

export const getScholarship = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row } = await sb.from("scholarships").select(PUBLIC_COLUMNS).eq("slug", data.slug).in("status", ["published", "expired"]).maybeSingle();
    if (!row) return { scholarship: null, related: [] as PublicScholarship[] };
    const s = row as unknown as PublicScholarship;
    const { data: rel } = await sb
      .from("scholarships")
      .select(PUBLIC_COLUMNS)
      .eq("status", "published")
      .eq("country_code", s.country_code)
      .neq("id", s.id)
      .overlaps("education_levels", s.education_levels.length ? s.education_levels : ["none"])
      .limit(4);
    return { scholarship: s, related: (rel ?? []) as unknown as PublicScholarship[] };
  });

export const getSitemapEntries = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb.from("scholarships").select("slug,updated_at").in("status", ["published", "expired"]).limit(5000);
  return data ?? [];
});
