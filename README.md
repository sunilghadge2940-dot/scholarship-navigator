# Scholarship Navigator

Build a complete, modern, professional, mobile-friendly website called StudentSchemeHub to help students from Class 8 to graduation discover government scholarships, private scholarships, financial aid, grants, and student welfare schemes.



1. Countries and Student Categories



Initially support India 🇮🇳, the United States 🇺🇸, and Canada 🇨🇦. Design the system so more countries can be added later without rebuilding the website. Support Class 8–10, Class 11–12, diploma, undergraduate, and postgraduate students.



2. Homepage and User Interface



Create an attractive homepage with a hero section, powerful search bar, country selector, education-level filters, latest scholarships, popular schemes, recently verified listings, upcoming deadlines, and scholarship categories. Use a clean design, responsive layouts, modern cards, accessible typography, and fast-loading pages.



3. Scholarship Information



Each scholarship must have its own page containing:



- Scholarship name and provider.

- Country and education level.

- Government or private classification.

- Scholarship benefits and award amount.

- Eligibility requirements.

- Required documents.

- Application opening and closing dates.

- Step-by-step application instructions.

- Official application link and source.

- Verification status and last-verified date.

- Contact information, if officially available.



Provide filters for country, education level, provider type, eligibility, benefits, and application status. Clearly identify expired, upcoming, and currently open scholarships.



4. Three Scholarship Upload Methods



Create an admin feature called Upload Scholarship, containing three options:



A. Lovable AI Integration

Allow administrators to use supported Lovable AI capabilities or integrations to assist with discovering, extracting, and organizing scholarship information. Do not assume Lovable AI is automatically available as an embedded service. Explain any required integration or external workflow.



B. Built-in AI Upload

Allow administrators to paste an official scholarship URL, enter text, or upload supported PDF, DOCX, and image files. Use an AI service through a secure backend to extract:



- Scholarship name and provider.

- Country and education level.

- Benefits and eligibility.

- Required documents.

- Application deadlines.

- Official application and source URLs.

- Contact details, when available.



Include OCR for scanned documents when needed. Let administrators review and edit every extracted field. Highlight missing, conflicting, outdated, or uncertain information. Never invent missing details.



C. Manual Upload

Provide a simple form for manually entering every scholarship field, adding official URLs, uploading supporting documents, selecting countries and education levels, setting deadlines, and entering reviewer notes.



5. Mini Upload Features



Include:



- Save as Draft.

- Submit for Verification.

- Preview before submission.

- Upload progress and error messages.

- File type and size validation.

- Duplicate scholarship detection.

- Required-field validation.

- URL validation.

- CSV bulk import and export.

- Upload history and administrator identification.

- Edit, update, archive, and resubmit options.

- AI extraction confidence indicators.

- Automatic detection of potentially expired listings.

- Clear success and failure notifications.



6. Admin Verification Workflow



Implement a secure, auditable verification system.



Scholarship workflow:

Draft → Pending Verification → Changes Requested / Rejected / Approved → Published → Expired or Archived.



Provide separate roles:



- Super Admin: Manage users, permissions, settings, and all content.

- Editor: Create and edit scholarship submissions but cannot approve their own submissions.

- Verifier: Review official sources, eligibility, benefits, required documents, deadlines, and application links.

- Publisher: Publish only approved scholarships.



Require additional independent approval for sensitive changes, such as award amounts, eligibility rules, deadlines, and official application links.



Record verification notes, source URLs, reviewer identity, timestamps, revision history, and every important administrative action. Allow rejected submissions to be corrected and resubmitted. Notify administrators about pending reviews and approaching deadlines.



Display a Verified badge and last-verified date only after successful verification. AI-generated content must never automatically receive approval or publication.



7. Student Accounts



Allow students to register and log in optionally. Provide:



- Saved scholarships and favourites.

- Personalized scholarship recommendations.

- A student profile with country and education level.

- Application deadline reminders.

- A personal scholarship tracking dashboard.

- The ability to mark scholarships as interested, applied, or completed.



Keep public scholarship browsing available without requiring registration.



8. Database and Backend



Use Supabase for PostgreSQL database storage, authentication, and appropriate backend functionality.



Create database tables for:



- Scholarships.

- Countries.

- Education levels.

- Users and roles.

- Verification records.

- Scholarship revision history.

- Uploaded documents.

- Saved scholarships.

- Student application tracking.

- Notifications.

- Administrative audit logs.



Use proper relationships, indexes, validation rules, and timestamps. Enforce Row Level Security and server-side authorization. Only authorized administrators may manage submissions, and only approved listings may become publicly visible.



Keep AI API keys and privileged credentials on the server. Never expose secret keys in frontend code.



9. Information Sources and Accuracy



Prioritize official government websites, education departments, universities, foundations, and scholarship-provider websites.



Whenever possible, retrieve information from official sources and preserve the source URL. Treat extracted website content and uploaded files as untrusted data. Require human verification before publication.



Never fabricate scholarships, award amounts, eligibility criteria, deadlines, official links, or verification results. Mark uncertain information for review. Clearly communicate that students must confirm final eligibility and application requirements with the official provider.



10. SEO and Google Traffic



Optimize every public scholarship page for search engines. Include:



- Unique SEO titles and meta descriptions.

- Readable, descriptive URLs.

- Proper heading structure.

- Internal links between related scholarships.

- XML sitemap and robots.txt.

- Canonical URLs.

- Appropriate structured data where eligible.

- Mobile-friendly layouts and fast loading.

- Helpful, original content answering common student questions.



Create useful country-specific and education-level pages, such as scholarships for Class 10 students in India, undergraduate scholarships in Canada, and financial aid for US college students.



Avoid duplicate pages, misleading claims, keyword stuffing, and automatically publishing unreviewed AI-generated content. Do not guarantee Google rankings.



11. Monetization



Prepare the website for future monetization through clearly labeled advertisements, relevant educational partnerships, and optional premium features. Keep scholarship eligibility and official application information accessible without payment. Never disguise advertisements as official government schemes.



12. Security and Privacy



Implement secure authentication, role-based permissions, server-side validation, file upload restrictions, protection against malicious files, rate limiting where appropriate, and audit logging. Add a privacy policy, terms of use, contact page, and appropriate disclaimers. Collect only necessary personal information.



13. Final Requirements



Build a genuinely functional website, not just a visual prototype. Implement the frontend, database, authentication, upload functionality, AI extraction integration, admin verification workflow, and publication controls.



Test the entire system on mobile and desktop. Verify that search, filters, uploads, database operations, permissions, deadline handling, notifications, and scholarship publication work correctly.



If an external API, Lovable AI integration, email service, or other credential is required, identify the exact setup needed instead of pretending the integration is working.



Build the project using clean, maintainable, scalable code. Start with the essential working features, then add advanced functionality without breaking existing features.

This project was built with [Lovable](https://lovable.dev).

## Deploying on Vercel

This is a full-stack TanStack Start application, not a static Vite website. The
Vite configuration selects Nitro's Vercel adapter for external builds while
Lovable keeps its managed deployment target.

1. Import the connected Git repository into Vercel.
2. Choose **Other** as the framework preset, use `bun run build` as the build
   command, and leave the Output Directory override disabled. Nitro produces
   Vercel's `.vercel/output` with both static assets and server functions.
3. In Vercel **Project Settings → Environment Variables**, configure the same
   public database connection used by this project for Production and Preview:
   - `SUPABASE_URL` — server-side database API URL.
   - `SUPABASE_PUBLISHABLE_KEY` — public/publishable API key, not an admin key.
   - `VITE_SUPABASE_URL` — browser-facing database API URL.
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — the same publishable key for the browser.
4. Redeploy after changing settings. Environment variables configured in Lovable
   do not automatically become Vercel environment variables through Git sync.
5. Check `/`, `/scholarships`, and `/resources`. If a page still fails, open
   Vercel **Logs**, filter for errors, and inspect the failed request. Do not
   share tokens, passwords, or secret values when reporting an error.

The public read client prefers server runtime values and can fall back to the
browser-safe values. Never use a privileged database key for public reads or
put private credentials in a `VITE_` variable. External-host Google login needs
separate redirect/integration verification; a successful page deployment alone
does not establish that OAuth works there.

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cbfe00d8-f3a2-486c-817f-c5e6a8cce3a4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
