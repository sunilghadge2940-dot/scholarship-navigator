import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/layout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use | StudentSchemeHub" },
      { name: "description", content: "The terms for using StudentSchemeHub's scholarship information service." },
      { property: "og:title", content: "Terms of Use | StudentSchemeHub" },
      { property: "og:description", content: "Terms for using StudentSchemeHub." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PageShell title="Terms of use">
      <h2>Information only</h2>
      <p>StudentSchemeHub provides scholarship information to help you discover opportunities. We are not a scholarship provider, government body or agent, and we don't process applications.</p>
      <h2>No guarantees</h2>
      <p>We work hard to keep listings accurate, but providers can change rules, amounts and deadlines at any time. The official provider's information always takes priority. We don't guarantee eligibility, selection or award of any scholarship.</p>
      <h2>Free access</h2>
      <p>Scholarship eligibility and official application information will always be free. Be careful of anyone asking for payment to "guarantee" a scholarship.</p>
      <h2>Acceptable use</h2>
      <p>Don't misuse the service, attempt to access accounts or admin areas you're not authorised for, or scrape the site in a way that harms it.</p>
      <h2>Advertising and partnerships</h2>
      <p>Any advertisements or sponsored content will be clearly labelled and never presented as official government schemes.</p>
    </PageShell>
  ),
});
