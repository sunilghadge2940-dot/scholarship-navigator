import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How We Verify Scholarships | StudentSchemeHub" },
      { name: "description", content: "Our verification process: official sources, independent reviewers, two-person approval for sensitive changes, and daily deadline checks." },
      { property: "og:title", content: "How StudentSchemeHub verifies scholarships" },
      { property: "og:description", content: "Official sources, independent reviewers and daily deadline checks." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PageShell title="How we verify scholarships" intro="We'd rather show fewer listings than wrong ones.">
      <h2>1. Official sources first</h2>
      <p>Every listing starts from an official government website, education department, university, foundation or scholarship provider. The source link is saved with the listing.</p>
      <h2>2. Independent human review</h2>
      <p>An editor prepares the listing. A different person — a verifier — checks the eligibility rules, benefits, documents, deadlines and application link against the official source. Editors can never approve their own work.</p>
      <h2>3. Extra approval for sensitive changes</h2>
      <p>Changes to award amounts, eligibility, deadlines or official links need approval from two independent verifiers before they go live again.</p>
      <h2>4. AI never publishes</h2>
      <p>We may use AI to help read documents, but AI output is only ever a draft. It is never approved or published without human verification.</p>
      <h2>5. Deadlines checked daily</h2>
      <p>Every day, listings past their closing date are automatically marked as expired. Expired listings stay visible for reference but are never shown as open.</p>
      <h2>Your part</h2>
      <p>Rules can change without notice. Always confirm eligibility and requirements on the provider's official website before applying.</p>
    </PageShell>
  ),
});
