import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { publicClient } from "./public.server";
import { PUBLIC_RESOURCE_COLUMNS, type PublicResource } from "./resources";
import { isValidUrl } from "./scholarships";

export const resourceFilterSchema = z.object({
  type: z.enum(["book", "course"]).optional(),
  pricing: z.enum(["free", "paid"]).optional(),
  country: z.string().max(5).optional(),
  level: z.string().max(30).optional(),
  q: z.string().max(100).optional(),
  page: z.number().int().min(1).max(500).optional(),
});
export type ResourceFilters = z.infer<typeof resourceFilterSchema>;
const PAGE = 24;

function applyFilters(q: any, data: ResourceFilters) {
  if (data.type) q = q.eq("type", data.type);
  if (data.pricing) q = q.eq("pricing", data.pricing);
  if (data.country) q = q.eq("country_code", data.country);
  if (data.level) q = q.contains("education_levels", [data.level]);
  const term = data.q?.replace(/[^\p{L}\p{N}\s-]/gu, " ").trim();
  if (term) q = q.or(`name.ilike.%${term}%,provider.ilike.%${term}%,description.ilike.%${term}%`);
  return q;
}

export const listResources = createServerFn({ method: "GET" })
  .inputValidator((d: ResourceFilters) => resourceFilterSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb.from("resources").select(PUBLIC_RESOURCE_COLUMNS, { count: "exact" }).eq("is_active", true);
    q = applyFilters(q, data);
    const page = data.page ?? 1;
    const { data: rows, count, error } = await q
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE, page * PAGE - 1);
    if (error) {
      console.error(error);
      return { rows: [] as PublicResource[], count: 0, pageSize: PAGE, error: "Could not load resources." };
    }
    return { rows: (rows ?? []) as unknown as PublicResource[], count: count ?? 0, pageSize: PAGE, error: null };
  });

export const getHomeResources = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("resources")
    .select(PUBLIC_RESOURCE_COLUMNS)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6);
  return (data ?? []) as unknown as PublicResource[];
});

const resourceInputSchema = z.object({
  name: z.string().trim().min(2).max(200),
  type: z.enum(["book", "course"]),
  provider: z.string().trim().max(200).default(""),
  description: z.string().trim().max(2000).default(""),
  pricing: z.enum(["free", "paid"]),
  price_text: z.string().trim().max(100).default(""),
  official_url: z.string().trim().max(500).refine(isValidUrl, "Link must be a valid http(s) URL"),
  country_code: z.string().max(5).nullish(),
  education_levels: z.array(z.string().max(30)).max(20).default([]),
});

async function assertEditor(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("editor") && !roles.includes("super_admin")) {
    throw new Error("Only editors can manage books & courses.");
  }
}

export const createResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => resourceInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertEditor(supabase, userId);
    const { error } = await supabase.from("resources").insert({
      ...data,
      country_code: data.country_code || null,
      price_text: data.pricing === "paid" ? data.price_text : "",
      created_by: userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => resourceInputSchema.extend({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertEditor(supabase, userId);
    const { id, ...fields } = data;
    const { error } = await supabase
      .from("resources")
      .update({ ...fields, country_code: fields.country_code || null, price_text: fields.pricing === "paid" ? fields.price_text : "", updated_by: userId })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
