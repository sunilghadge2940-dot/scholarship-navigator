export type AppRole = "super_admin" | "editor" | "verifier" | "publisher";

export const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: "Super Admin",
  editor: "Editor",
  verifier: "Verifier",
  publisher: "Publisher",
};

/** Any admin-team role may open the admin panel. */
export function isStaff(roles: readonly string[]): boolean {
  return roles.some((r) => r === "super_admin" || r === "editor" || r === "verifier" || r === "publisher");
}

/** Only Super Admins see user account totals and the user list. */
export function isSuperAdmin(roles: readonly string[]): boolean {
  return roles.includes("super_admin");
}

/** Editors and Super Admins may add books and courses. */
export function canManageResources(roles: readonly string[]): boolean {
  return roles.includes("super_admin") || roles.includes("editor");
}
