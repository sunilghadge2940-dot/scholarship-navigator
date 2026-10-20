import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isStaff, isSuperAdmin } from "@/lib/roles";

export type AdminOverview = {
  roles: string[];
  scholarshipsByStatus: Record<string, number>;
  scholarshipsTotal: number;
  resourcesTotal: number;
  users: null | {
    total: number;
    staffTotal: number;
    recent: { id: string; email: string | null; display_name: string | null; created_at: string; roles: string[] }[];
  };
};

/** Admin panel numbers. Runs as the signed-in user, so database rules still apply. */
export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    const { supabase, userId } = context;
    const { data: roleRows, error: roleErr } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (roleErr) throw new Error("Could not check your permissions.");
    const roles = (roleRows ?? []).map((r) => r.role as string);
    if (!isStaff(roles)) throw new Error("Forbidden: admin access only.");

    const [schRes, resRes] = await Promise.all([
      supabase.from("scholarships").select("status").range(0, 9999),
      supabase.from("resources").select("id", { count: "exact", head: true }),
    ]);
    const scholarshipsByStatus: Record<string, number> = {};
    for (const s of schRes.data ?? []) scholarshipsByStatus[s.status] = (scholarshipsByStatus[s.status] ?? 0) + 1;

    let users: AdminOverview["users"] = null;
    if (isSuperAdmin(roles)) {
      const [countRes, recentRes, allRoles] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id, email, display_name, created_at").order("created_at", { ascending: false }).limit(25),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      const roleMap = new Map<string, string[]>();
      for (const r of allRoles.data ?? []) roleMap.set(r.user_id, [...(roleMap.get(r.user_id) ?? []), r.role as string]);
      users = {
        total: countRes.count ?? 0,
        staffTotal: roleMap.size,
        recent: (recentRes.data ?? []).map((p) => ({ ...p, roles: roleMap.get(p.id) ?? [] })),
      };
    }

    return {
      roles,
      scholarshipsByStatus,
      scholarshipsTotal: (schRes.data ?? []).length,
      resourcesTotal: resRes.count ?? 0,
      users,
    };
  });
