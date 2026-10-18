import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMeta } from "@/lib/public.functions";
import { createResource } from "@/lib/resources.functions";
import { isValidUrl } from "@/lib/scholarships";

const metaQ = queryOptions({ queryKey: ["meta"], queryFn: () => getMeta(), staleTime: 3600_000 });

export const Route = createFileRoute("/admin/resources/new")({
  head: () => ({ meta: [{ title: "Add a book or course — StudentSchemeHub" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(metaQ),
  component: NewResourcePage,
});

function NewResourcePage() {
  const { data: meta } = useSuspenseQuery(metaQ);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "book" as "book" | "course",
    provider: "",
    description: "",
    pricing: "free" as "free" | "paid",
    price_text: "",
    official_url: "",
    country_code: "",
    education_levels: [] as string[],
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleLevel = (code: string) =>
    setForm((f) => ({
      ...f,
      education_levels: f.education_levels.includes(code)
        ? f.education_levels.filter((c) => c !== code)
        : [...f.education_levels, code],
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUrl(form.official_url)) {
      toast.error("The link must be a valid http(s) URL.");
      return;
    }
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      toast.error("Please sign in first.");
      return;
    }
    setBusy(true);
    try {
      await createResource({
        data: {
          name: form.name,
          type: form.type,
          provider: form.provider,
          description: form.description,
          pricing: form.pricing,
          price_text: form.pricing === "paid" ? form.price_text : "",
          official_url: form.official_url,
          country_code: form.country_code || null,
          education_levels: form.education_levels,
        },
      });
      toast.success("Resource added.");
      navigate({ to: "/resources" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save. You need the editor role.");
    } finally {
      setBusy(false);
    }
  };

  const inputCls = "h-11 w-full rounded-lg border bg-background px-3 text-sm";
  const labelCls = "mb-1 block text-sm font-semibold";

  return (
    <div className="container-page max-w-2xl py-12">
      <h1 className="text-3xl font-semibold">Add a book or course</h1>
      <p className="mt-2 text-sm text-muted-foreground">Staff only — you need the editor role. The item becomes visible immediately after saving.</p>

      <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border bg-card p-6">
        <div>
          <label className={labelCls} htmlFor="r-name">Name *</label>
          <input id="r-name" required maxLength={200} value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="r-type">Type *</label>
            <select id="r-type" value={form.type} onChange={(e) => set("type", e.target.value)} className={inputCls}>
              <option value="book">Book</option>
              <option value="course">Course</option>
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="r-pricing">Pricing *</label>
            <select id="r-pricing" value={form.pricing} onChange={(e) => set("pricing", e.target.value)} className={inputCls}>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="r-provider">Provider / author</label>
          <input id="r-provider" maxLength={200} value={form.provider} onChange={(e) => set("provider", e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls} htmlFor="r-desc">Short description</label>
          <textarea id="r-desc" maxLength={2000} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
        </div>

        {form.pricing === "paid" && (
          <div>
            <label className={labelCls} htmlFor="r-price">Price text</label>
            <input id="r-price" maxLength={100} placeholder="e.g. ₹499 or $29/year" value={form.price_text} onChange={(e) => set("price_text", e.target.value)} className={inputCls} />
          </div>
        )}

        <div>
          <label className={labelCls} htmlFor="r-url">Official page link *</label>
          <input id="r-url" required type="url" maxLength={500} placeholder="https://…" value={form.official_url} onChange={(e) => set("official_url", e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls} htmlFor="r-country">Country (optional)</label>
          <select id="r-country" value={form.country_code} onChange={(e) => set("country_code", e.target.value)} className={inputCls}>
            <option value="">Not country-specific</option>
            {meta.countries.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
          </select>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Education levels (optional)</legend>
          <div className="flex flex-wrap gap-2">
            {meta.levels.map((l) => (
              <label key={l.code} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${form.education_levels.includes(l.code) ? "border-primary bg-primary/10 font-semibold" : ""}`}>
                <input type="checkbox" className="sr-only" checked={form.education_levels.includes(l.code)} onChange={() => toggleLevel(l.code)} />
                {l.name}
              </label>
            ))}
          </div>
        </fieldset>

        <button disabled={busy} className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {busy ? "Saving…" : "Save resource"}
        </button>
      </form>
    </div>
  );
}
