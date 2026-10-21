import { afterEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn(() => ({})) }));
vi.mock("@supabase/supabase-js", () => ({ createClient }));
import { connectedPublicClient as publicClient, offlinePublicClient } from "@/lib/public.server";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("Public database hosting configuration", () => {
  it("prefers runtime server settings over browser build settings", () => {
    vi.stubEnv("SUPABASE_URL", "https://runtime.example.test");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_runtime_test");
    vi.stubEnv("VITE_SUPABASE_URL", "https://browser.example.test");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_browser_test");
    publicClient();
    expect(createClient).toHaveBeenCalledWith("https://runtime.example.test", "sb_publishable_runtime_test", expect.any(Object));
  });

  it("supports external hosts with only public build settings", () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "");
    vi.stubEnv("VITE_SUPABASE_URL", "https://browser.example.test");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_browser_test");
    publicClient();
    expect(createClient).toHaveBeenCalledWith("https://browser.example.test", "sb_publishable_browser_test", expect.any(Object));
  });

  it("fails clearly before creating a client when configuration is missing", () => {
    for (const name of ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"]) vi.stubEnv(name, "");
    expect(() => publicClient()).toThrow("Database connection is not configured");
    expect(createClient).not.toHaveBeenCalled();
  });
});
describe("Disconnected database", () => {
  it("returns empty results without creating a connection", async () => {
    const sb = offlinePublicClient();
    const list = await sb.from("scholarships").select("*", { count: "exact" }).eq("status", "published").range(0, 23);
    expect(list).toEqual({ data: [], count: 0, error: null });
    const one = await sb.from("scholarships").select("*").eq("slug", "x").maybeSingle();
    expect(one.data).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });
});
