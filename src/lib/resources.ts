import type { Database } from "@/integrations/supabase/types";

export type Resource = Database["public"]["Tables"]["resources"]["Row"];

/** Fields safe to show publicly. */
export const PUBLIC_RESOURCE_COLUMNS =
  "id,name,type,provider,description,pricing,price_text,official_url,country_code,education_levels,created_at,updated_at";

export type PublicResource = Pick<
  Resource,
  | "id" | "name" | "type" | "provider" | "description" | "pricing" | "price_text"
  | "official_url" | "country_code" | "education_levels" | "created_at" | "updated_at"
>;

export const RESOURCE_TYPE_LABEL: Record<Resource["type"], string> = {
  book: "Book",
  course: "Course",
};

export const PRICING_LABEL: Record<Resource["pricing"], string> = {
  free: "Free",
  paid: "Paid",
};
