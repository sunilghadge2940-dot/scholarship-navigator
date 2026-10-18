import { Link } from "@tanstack/react-router";
import { GraduationCap, Info, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/scholarships", label: "Scholarships" },
  { to: "/resources", label: "Books & Courses" },
  { to: "/about", label: "How we verify" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" aria-hidden />
          </span>
          StudentScheme<span className="text-primary">Hub</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="text-foreground/75 hover:text-primary" activeProps={{ className: "text-primary" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <button className="rounded-md p-2 md:hidden" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t bg-background md:hidden" aria-label="Mobile">
          <div className="container-page flex flex-col py-2">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-3 font-medium">
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export function OfficialDisclaimer({ compact }: { compact?: boolean }) {
  return (
    <div className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning-foreground">
      <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <p>
        <strong>Always confirm with the official provider.</strong>{" "}
        {compact
          ? "Eligibility, amounts and deadlines can change."
          : "StudentSchemeHub is an independent information service, not a government body. Eligibility rules, award amounts, documents and deadlines can change at any time — check the official website before applying. We never charge for scholarship information."}
      </p>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-ink-foreground">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-xl font-semibold">StudentSchemeHub</p>
          <p className="mt-2 max-w-sm text-sm opacity-75">
            Human-verified scholarships, grants and student welfare schemes for students from Class 8 to graduation in India, the United States and Canada.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-60">Explore</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/scholarships" search={{ country: "in" }} className="hover:underline">India 🇮🇳</Link></li>
            <li><Link to="/scholarships" search={{ country: "us" }} className="hover:underline">United States 🇺🇸</Link></li>
            <li><Link to="/scholarships" search={{ country: "ca" }} className="hover:underline">Canada 🇨🇦</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-60">About</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:underline">How we verify</Link></li>
            <li><Link to="/privacy" className="hover:underline">Privacy policy</Link></li>
            <li><Link to="/terms" className="hover:underline">Terms of use</Link></li>
            <li><Link to="/disclaimer" className="hover:underline">Disclaimer</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/15">
        <p className="container-page py-5 text-xs opacity-60">
          © {new Date().getFullYear()} StudentSchemeHub. Not affiliated with any government. Advertisements, when shown, are always clearly labelled.
        </p>
      </div>
    </footer>
  );
}

export function PageShell({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-4xl font-semibold">{title}</h1>
      {intro && <p className="mt-3 text-lg text-muted-foreground">{intro}</p>}
      <div className="mt-8 space-y-6 leading-7 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-6">{children}</div>
    </div>
  );
}
