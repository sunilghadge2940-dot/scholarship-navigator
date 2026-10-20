import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, FileText, KeyRound, LogOut, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminOverview } from "@/lib/admin.functions";
import { useAuthMe, useSignOut } from "@/hooks/use-auth";
import { canManageResources, isStaff, ROLE_LABEL, type AppRole } from "@/lib/roles";
import { STATUS_LABEL } from "@/lib/scholarships";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin panel — StudentSchemeHub" },
      { name: "description", content: "StudentSchemeHub admin panel: user accounts, listings and settings." },
      { property: "og:title", content: "Admin panel — StudentSchemeHub" },
      { property: "og:description", content: "StudentSchemeHub admin panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden /> {label}
      </div>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}

function AdminPage() {
  const { data: me, isPending } = useAuthMe();
  const signOut = useSignOut();
  const staff = !!me && isStaff(me.roles);
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => getAdminOverview(),
    enabled: staff,
  });

  if (isPending) return <div className="container-page py-16 text-muted-foreground">Loading…</div>;

  if (!staff) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center py-12">
        <div className="max-w-md text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
          <h1 className="mt-3 text-2xl font-semibold">Admin access only</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your account doesn't have an admin role. A Super Admin can grant one.</p>
          <Button asChild className="mt-6"><Link to="/">Back to home</Link></Button>
        </div>
      </div>
    );
  }

  const o = overview.data;
  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Admin panel</p>
          <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {me.user.email} · {me.roles.map((r) => ROLE_LABEL[r as AppRole] ?? r).join(", ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageResources(me.roles) && (
            <Button asChild variant="outline"><Link to="/admin/resources/new"><BookOpen className="mr-1 h-4 w-4" /> Add book or course</Link></Button>
          )}
          <Button variant="ghost" onClick={signOut}><LogOut className="mr-1 h-4 w-4" /> Sign out</Button>
        </div>
      </div>

      {overview.isError && (
        <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Couldn't load the admin numbers. Please refresh the page.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {o?.users && <Stat icon={Users} label="Total user accounts" value={o.users.total} />}
        {o?.users && <Stat icon={ShieldCheck} label="Admin team members" value={o.users.staffTotal} />}
        <Stat icon={FileText} label="Scholarships (all statuses)" value={o ? o.scholarshipsTotal : "…"} />
        <Stat icon={BookOpen} label="Books & courses" value={o ? o.resourcesTotal : "…"} />
      </div>

      {o && (
        <section className="mt-8 rounded-xl border bg-card p-5">
          <h2 className="text-lg font-semibold">Scholarships by status</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <span key={key} className="rounded-full border bg-muted px-3 py-1 text-sm">
                {label}: <strong>{o.scholarshipsByStatus[key] ?? 0}</strong>
              </span>
            ))}
          </div>
        </section>
      )}

      {o?.users && (
        <section className="mt-8 rounded-xl border bg-card">
          <h2 className="p-5 pb-3 text-lg font-semibold">Recent user accounts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y bg-muted/50 text-left text-muted-foreground">
                <tr>
                  <th className="px-5 py-2 font-medium">Email</th>
                  <th className="px-5 py-2 font-medium">Name</th>
                  <th className="px-5 py-2 font-medium">Role</th>
                  <th className="px-5 py-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {o.users.recent.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="px-5 py-3">{u.email ?? "—"}</td>
                    <td className="px-5 py-3">{u.display_name ?? "—"}</td>
                    <td className="px-5 py-3">{u.roles.length ? u.roles.map((r) => ROLE_LABEL[r as AppRole] ?? r).join(", ") : "Student"}</td>
                    <td className="whitespace-nowrap px-5 py-3">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <ChangePassword hasPassword={(me.user.app_metadata?.providers as string[] | undefined)?.includes("email") ?? me.user.app_metadata?.provider === "email"} />
    </div>
  );
}

function ChangePassword({ hasPassword }: { hasPassword: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) { toast.error("New password must be at least 8 characters."); return; }
    if (next !== confirm) { toast.error("The new passwords don't match."); return; }
    if (next === current) { toast.error("Choose a password different from your current one."); return; }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const email = u.user?.email;
    // Confirm the current password before changing it.
    const check = email ? await supabase.auth.signInWithPassword({ email, password: current }) : { error: new Error("no email") };
    if (check.error) {
      setBusy(false);
      { toast.error("Your current password is wrong."); return; }
    }
    const { error } = await supabase.auth.updateUser({ password: next, current_password: current });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setCurrent("");
    setNext("");
    setConfirm("");
    toast.success("Password changed.");
  };

  return (
    <section className="mt-8 max-w-lg rounded-xl border bg-card p-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><KeyRound className="h-5 w-5" aria-hidden /> Change password</h2>
      {!hasPassword ? (
        <p className="mt-2 text-sm text-muted-foreground">You signed in with Google, so your password is managed by your Google account.</p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cp-current">Current password</Label>
            <Input id="cp-current" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cp-new">New password</Label>
            <Input id="cp-new" type="password" autoComplete="new-password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cp-confirm">Confirm new password</Label>
            <Input id="cp-confirm" type="password" autoComplete="new-password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Update password"}</Button>
        </form>
      )}
    </section>
  );
}
