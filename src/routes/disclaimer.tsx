import { createFileRoute } from "@tanstack/react-router";
import { OfficialDisclaimer, PageShell } from "@/components/site/layout";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer | StudentSchemeHub" },
      { name: "description", content: "StudentSchemeHub is an independent information service. Always confirm details with the official provider." },
      { property: "og:title", content: "Disclaimer | StudentSchemeHub" },
      { property: "og:description", content: "Independent information service — confirm with official providers." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PageShell title="Disclaimer">
      <OfficialDisclaimer />
      <p>StudentSchemeHub is not affiliated with, endorsed by, or acting on behalf of any government, ministry, university or scholarship provider unless explicitly stated on a listing.</p>
      <p>A "Verified" badge means our reviewers checked the listing against the official source on the date shown. It does not mean the provider has endorsed us or that the information cannot change afterwards.</p>
      <p>Links to external websites are provided for convenience; we are not responsible for their content.</p>
    </PageShell>
  ),
});
