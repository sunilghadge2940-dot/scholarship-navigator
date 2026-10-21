import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authMeQuery, useAuthMe } from "@/hooks/use-auth";
import { isStaff } from "@/lib/roles";
import { BACKEND_ENABLED } from "@/lib/backend-switch";

const SIGN_IN_OFF = "Sign-in and account creation are currently turned off.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create an account — StudentSchemeHub" },
      { name: "description", content: "Sign in to StudentSchemeHub with Google or email to save scholarships and track your applications." },
      { property: "og:title", content: "Sign in — StudentSchemeHub" },
      { property: "og:description", content: "Sign in with Google or email to StudentSchemeHub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: me } = useAuthMe();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const afterSignIn = async () => {
    await queryClient.invalidateQueries({ queryKey: authMeQuery.queryKey });
    const fresh = await queryClient.fetchQuery(authMeQuery);
    navigate({ to: fresh && isStaff(fresh.roles) ? "/admin" : "/" });
  };

  const google = async () => {
    if (!BACKEND_ENABLED) return toast.info(SIGN_IN_OFF);
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Google sign-in didn't complete. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    toast.success("Signed in with Google");
    await afterSignIn();
    setBusy(false);
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!BACKEND_ENABLED) return toast.info(SIGN_IN_OFF);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
      return;
    }
    toast.success("Welcome back!");
    await afterSignIn();
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!BACKEND_ENABLED) return toast.info(SIGN_IN_OFF);
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin, data: { display_name: name.trim() || undefined } },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      toast.success("Account created. Please sign in.");
      return;
    }
    toast.success("Account created — you're signed in!");
    await afterSignIn();
  };

  if (me) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">You're signed in as</p>
          <p className="mt-1 font-semibold">{me.user.email}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {isStaff(me.roles) && (
              <Button asChild><Link to="/admin">Open admin panel</Link></Button>
            )}
            <Button asChild variant="outline"><Link to="/scholarships">Browse scholarships</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-3 text-2xl font-semibold">Welcome to StudentSchemeHub</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browsing is always free — an account is optional.</p>
        </div>

        <Button type="button" variant="outline" className="w-full gap-2" onClick={google} disabled={busy}>
          <GoogleIcon /> Continue with Google
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or use email <span className="h-px flex-1 bg-border" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={signIn} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="si-email">Email</Label>
                <Input id="si-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="si-pass">Password</Label>
                <Input id="si-pass" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signUp} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="su-name">Name (optional)</Label>
                <Input id="su-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-email">Email</Label>
                <Input id="su-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-pass">Password</Label>
                <Input id="su-pass" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                <p className="text-xs text-muted-foreground">At least 8 characters.</p>
              </div>
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating…" : "Create account"}</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
