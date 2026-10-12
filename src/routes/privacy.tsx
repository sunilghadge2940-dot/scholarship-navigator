import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | StudentSchemeHub" },
      { name: "description", content: "What personal information StudentSchemeHub collects, why, and how you can control it." },
      { property: "og:title", content: "Privacy Policy | StudentSchemeHub" },
      { property: "og:description", content: "We collect only what's needed to run optional student accounts." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PageShell title="Privacy policy" intro="We collect as little as possible.">
      <h2>Browsing without an account</h2>
      <p>You can search and read every scholarship without signing up. We don't ask for personal details to browse.</p>
      <h2>Optional student accounts</h2>
      <ul>
        <li>Email address and a display name — to sign you in.</li>
        <li>Country and education level — only to personalise recommendations.</li>
        <li>Your saved scholarships, application status and notes — so your dashboard works.</li>
      </ul>
      <p>We do not collect identity numbers, income details, caste/category certificates or other sensitive documents from students.</p>
      <h2>How we use it</h2>
      <p>Only to provide the service: sign-in, saved lists, reminders. We never sell your personal data.</p>
      <h2>Advertising</h2>
      <p>If advertising is added in the future, it will be clearly labelled, and this policy will be updated before any ad partner receives data.</p>
      <h2>Your choices</h2>
      <p>You can edit your profile at any time, or contact us to delete your account and data.</p>
      <h2>Security</h2>
      <p>Data is protected with access controls so each student can only see their own information. Administrator actions are logged.</p>
    </PageShell>
  ),
});
