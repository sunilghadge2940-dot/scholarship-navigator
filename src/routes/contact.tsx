import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | StudentSchemeHub" },
      { name: "description", content: "Report an error in a scholarship listing, suggest a scholarship or contact the StudentSchemeHub team." },
      { property: "og:title", content: "Contact StudentSchemeHub" },
      { property: "og:description", content: "Report a listing error or suggest a scholarship." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PageShell title="Contact us" intro="Spotted an error, or know an official scholarship we should list?">
      <p>Please include the scholarship name and a link to the <strong>official source</strong> so our reviewers can check it.</p>
      <p>For questions about your own application, eligibility or payments, contact the scholarship provider directly — we can't access or change applications.</p>
      <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">A contact email for the StudentSchemeHub team will be published here soon.</p>
    </PageShell>
  ),
});
