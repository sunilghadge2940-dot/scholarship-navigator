import { describe, expect, it } from "vitest";
import { canManageResources, isStaff, isSuperAdmin } from "@/lib/roles";

describe("admin access rules", () => {
  it("a signed-in student with no role cannot open the admin panel", () => {
    expect(isStaff([])).toBe(false);
  });

  it("any admin-team role can open the admin panel", () => {
    expect(isStaff(["verifier"])).toBe(true);
  });

  it("only a Super Admin sees total user accounts", () => {
    expect(isSuperAdmin(["editor", "publisher", "verifier"])).toBe(false);
    expect(isSuperAdmin(["super_admin"])).toBe(true);
  });

  it("verifiers cannot add books and courses", () => {
    expect(canManageResources(["verifier"])).toBe(false);
    expect(canManageResources(["editor"])).toBe(true);
  });
});
