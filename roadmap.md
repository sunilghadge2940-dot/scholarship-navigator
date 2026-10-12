# StudentSchemeHub roadmap

Approved plan: .lovable/plan/studentschemehub-build-plan-2026-10-12.md

## Added requirements (apply to all phases)
- Super Admin is never auto-granted. First Super Admin is set by the project owner through controlled backend initialization; afterwards only Super Admins grant roles. Role changes are audited.
- AI: use only verified Lovable AI capabilities (structured extraction, PDF + image input/OCR). URL fetch and DOCX text extraction are done by our own code. Document limits.
- Deadlines: daily scheduled check marks expired, flags upcoming deadlines, notifies admins; UI never shows past-deadline listings as open. No deletion.
- Verification security enforced in database triggers + RLS (no self-approval, publisher-only publish, two-verifier approval for sensitive changes, full audit trail).
- Test each phase (DB access, RLS, auth, uploads, transitions, publish permissions, mobile) before moving on.
- Catalogue stays empty until real verified data is submitted. Never auto-publish AI content.

## Phases
- [x] Phase 1 DB: schema, RLS, workflow triggers, storage bucket, daily deadline job
- [ ] Phase 1 UI: design system, homepage, listing + filters, detail page, legal pages, sitemap/robots
- [ ] Phase 2: admin area, roles management, verification workflow UI, audit log, notifications
- [ ] Phase 3: Upload Scholarship (Lovable AI tab, built-in AI upload, manual), CSV, duplicates, history
- [ ] Phase 4: student accounts, saved, tracking, recommendations, reminders
- [ ] Phase 5: SEO landing pages, structured data, ad/partner slots

## Waiting on user
- Email address of the person who should become the first Super Admin (after they sign up).
