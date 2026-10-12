# StudentSchemeHub — Build Plan

This is a large system, so it will be built in phases. Each phase leaves the site working.

## Phase 1 — Foundation (this turn after approval)
- Turn on Lovable Cloud (database, logins, file storage).
- Design system: warm, trustworthy editorial look (deep green + saffron accent, serif headings, readable sans body). No purple.
- Database: countries, education levels, scholarships, user roles, verification records, revisions, uploaded documents, saved scholarships, application tracking, notifications, audit logs. Row-level security so only Published listings are public.
- Countries (India, US, Canada) and education levels stored as data, so new countries need no rebuild.
- Public pages: homepage (search, country selector, level filters, latest / upcoming deadlines / recently verified / categories), scholarship listing with all filters, scholarship detail page (all required fields, Open / Upcoming / Expired badge, Verified badge only after verification, official-source disclaimer).
- Privacy, Terms, Contact, Disclaimer pages.

## Phase 2 — Admin & verification workflow
- Roles: Super Admin, Editor, Verifier, Publisher (separate roles table, server-checked).
- Workflow: Draft -> Pending Verification -> Changes Requested / Rejected / Approved -> Published -> Expired / Archived.
- Editors cannot approve their own work; sensitive field changes (amount, eligibility, deadlines, links) need a second independent approval.
- Revision history, verification notes, audit log of every admin action, in-app notifications for pending reviews and nearing deadlines.

## Phase 3 — Upload Scholarship (3 methods)
- Manual form: every field, URL validation, required-field checks, document upload (type/size limits), save draft, preview, submit.
- Built-in AI upload: paste URL, text, or upload PDF / DOCX / image. Server extracts fields with Lovable AI (handles scanned docs via vision OCR), returns per-field confidence, flags missing / uncertain / outdated items. Admin reviews every field; AI output always lands as Draft, never auto-approved.
- Lovable AI Integration tab: explains how admins can use the Lovable editor/agent to research official sources and paste results into the review form, plus what is and isn't automated.
- Duplicate detection, CSV import/export, upload history with admin identity, edit / archive / resubmit, automatic expiry detection.

## Phase 4 — Student accounts
- Optional sign-up (email + Google). Profile with country and level only.
- Save / favourite, mark Interested / Applied / Completed, personal dashboard, recommendations by profile, deadline reminders (in-app; email needs an email domain set up later).

## Phase 5 — SEO & monetization
- Unique titles/descriptions, canonical URLs, readable slugs, structured data, related-scholarship links, XML sitemap, robots.txt.
- Landing pages like /in/class-10, /ca/undergraduate, /us/undergraduate with helpful FAQs.
- Clearly labeled ad slots and partner areas (empty placeholders), never mixed into official listings.

## Accuracy rule
No scholarships will be invented. The site starts with an empty catalogue; you (or admins) add real listings through the upload tools. The first account you create becomes Super Admin.

## What needs setup from you
- Nothing for Phase 1–4 (Lovable Cloud and Lovable AI are built in; AI usage beyond the free allowance needs credits).
- Later, optional: an email domain for email reminders, and an ad network account for ads.

## Technical notes
- TanStack Start server functions for all admin actions and AI extraction; role checks via a has_role security-definer function; RLS on every table.
- Status transitions enforced in server functions plus DB check constraints; publish allowed only from Approved.
- File uploads to a private storage bucket with MIME/size validation; extracted content treated as untrusted.
