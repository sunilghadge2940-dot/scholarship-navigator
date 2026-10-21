<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Scholarship workflow rules (status transitions, no self-review, publisher-only publish, two-verifier sensitive approval) live in DB triggers on `scholarships`; UI and server functions must not be the only guard. Why: authorization must hold regardless of client.
- Roles live only in `user_roles`; no signup path grants roles. First Super Admin is inserted manually by the owner. Why: prevent privilege escalation.
- Public pages read via server functions using the publishable client (RLS shows only published/expired). Why: SSR for SEO without privileged keys.
- Deadline expiry runs as a daily SQL-only pg_cron job (`system_deadline_check`); UI also derives "Expired" from `closes_on`. Why: listings never appear open after deadline.
- Countries and education levels are data rows, not code enums. Why: add countries without rebuilding.
- External Vercel builds use Nitro's Vercel preset while Lovable retains its managed target; public reads prefer runtime connection settings with publishable-only build-time fallback. Why: Git deployments need server output and do not inherit Lovable's environment settings.
- Signed-in-only pages live under `src/routes/_authenticated/` (client-only gate, redirects to `/auth`); the admin panel's data comes from server functions that re-check roles via `user_roles`. Why: route guards alone don't protect server endpoints.
- Database reads and sign-in are gated by one flag, `BACKEND_ENABLED` in `src/lib/backend-switch.ts`; when off, `publicClient()` returns an offline stub (empty results) and sign-in handlers no-op. Why: disconnect/reconnect without deleting data or changing pages.
