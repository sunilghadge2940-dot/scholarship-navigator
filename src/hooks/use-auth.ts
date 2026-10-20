import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AuthMe = { user: User; roles: string[] } | null;

export const authMeQuery = queryOptions({
  queryKey: ["auth-me"],
  queryFn: async (): Promise<AuthMe> => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return null;
    const { data: rows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    return { user, roles: (rows ?? []).map((r) => r.role as string) };
  },
  staleTime: 60_000,
});

/** Current signed-in user and roles (browser only; null when signed out). */
export function useAuthMe() {
  return useQuery(authMeQuery);
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
}
