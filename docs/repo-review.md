## Repository Review: Carbon ERP & MES

### Definitions
- **Concern**: A current issue or gap observed in the codebase/process that should be addressed. Typically actionable and evidenced.
- **Risk**: A potential negative outcome if a concern remains unresolved (impact x likelihood). Often requires mitigation, monitoring, or contingency.
- **To‑Do**: A concrete, actionable task to resolve a concern or mitigate a risk. Should be prioritized and assigned.

### Summary
- Monorepo with apps (`erp`, `mes`, `academy`, `starter`) and shared `packages/*` using Turborepo and npm workspaces.
- Remix + React + Tailwind for UI; Supabase (Postgres, Auth, Edge Functions) for backend; Trigger.dev for jobs; Upstash Redis; Posthog analytics; Stripe; Vercel edge runtime.
- Strong type-safety via generated DB types; RLS/ABAC enforced in SQL; shared auth/permissions utilities; robust domain migrations and seeds.

### Strengths
- **Modular architecture**: Clear separation between apps and shared packages; solid boundaries for UI, auth, data, jobs, and integrations.
- **Type-safe data layer**: Supabase type generation wired into both server and edge functions.
- **Security model**: RLS, ABAC, group- and role-based claims; centralized `requirePermissions` helper.
- **Operational primitives**: Jobs (Trigger.dev), notifications, documents (PDF), cache, and analytics integrated.
- **DX**: Helpful scripts for DB spin-up, typegen, Swagger generation, and environment linking.

### Concerns (current)
- **Environment template missing**: Root README references copying `.env.example`, but no root `.env.example` present.
- **Containerization gaps**:
  - Only `apps/erp/Dockerfile` exists; `apps/mes` lacks a Dockerfile.
  - ERP Dockerfile installs only app deps; monorepo local packages (`"*"` workspace versions) likely fail at build without a Turbo prune step or root-level build image.
- **CI/CD absent**: No GitHub Actions or equivalent detected to run lint, type-check, build, tests, or DB migration checks.
- **Sparse automated tests**: Only a couple of test files found; core services (auth/permissions, critical routes, DB functions) are untested.
- **Security enforcement surface**:
  - API-key path in `requirePermissions` bypasses interactive auth; needs consistent rate limiting and audit logging on all routes honoring `carbon-key`.
  - Ensure `getBrowserEnv` only exposes whitelisted public keys to the client.
- **Docs coverage**: Docs are in progress; architecture/deployment/permission model would benefit from deeper write-ups and diagrams.
- **Script correctness**:
  - Root script `dev:erp` has a trailing space in `--filter=./packages/ `.
  - `build:app` includes `--filter=!www` which appears stale.

### Risks (potential impact if unresolved)
- **Broken deploys from monorepo builds**: Without Turbo prune / workspace packaging, Docker builds may fail or include excessive context, increasing image size and build time.
- **Regression risk**: Missing CI and tests increase the chance of unnoticed breakage across apps/packages and DB migrations.
- **Abuse or misuse of API keys**: If rate limiting/auditing are inconsistent, API-key access could enable data exfiltration or RLS bypasses in unintended contexts.
- **Secrets handling drift**: Lack of a canonical `.env.example` can lead to inconsistent environments and accidental leakage or missing configuration.
- **Operational blind spots**: Limited structured logging/observability hinders troubleshooting in production.

### To‑Dos (prioritized)

#### Immediate (0–2 days)
- Add a root `docs/.env.example` (or repo-root `.env.example`) aligned with README and `getBrowserEnv()` for ERP/MES, Supabase, Upstash, Trigger.dev, Posthog, Stripe. Include comments and sane defaults.
- Fix root scripts:
  - Remove trailing space in `dev:erp` filter; audit all filters for accuracy.
  - Remove or correct `build:app` `--filter=!www` if unused.
- Introduce basic CI (e.g., GitHub Actions):
  - Jobs: install, turbo cache, lint, type-check, build all, run tests, and DB migration validation (use `ci:migrations`).

#### Short-term (3–10 days)
- Containerization
  - Adopt Turbo prune (or 
    `pnpm export` equivalent if switching) for production image builds.
  - Provide Dockerfile for `apps/mes` or unify via root Docker build that targets app via `--filter`.
  - Document container build/run for both apps, including env mounts and port mapping.
- Testing
  - Add unit tests for `@carbon/auth` session/claims/permission checks and utilities.
  - Add integration tests against local Supabase (seed + RLS checks for read/write paths in key tables).
  - Add smoke tests for critical ERP/MES routes.
- Security
  - Enforce rate limiting (Upstash) on API-key and high-traffic endpoints; ensure audit logging (userId/companyId, route, action).
  - Document the permission model (roles, groups, ABAC claims) and when `bypassRls` is permitted.

#### Medium-term (2–6 weeks)
- Documentation
  - Architecture overview (apps/packages/data flows), permission model, DB migration workflow, deployment targets (Vercel/Supabase vs self-hosted).
  - Add Mermaid diagrams for request flow and data boundaries.
- Observability
  - Structured logging with request IDs, user/company IDs; optional tracing (OpenTelemetry) for critical flows.
- Deployment
  - Provide environment matrix and self-hosting notes (Supabase local vs cloud), including Stripe webhook registration script usage.
  - Optionally add Terraform/IaC examples for standard deployments.

### Architecture & Stack Snapshot
- UI: Remix (Vite), React 18, Tailwind, Radix UI, TanStack Query.
- Data/Backend: Supabase (Postgres, Auth, Edge Functions in Deno), extensive SQL migrations and seeds, generated types.
- Jobs/Infra: Trigger.dev, Upstash Redis, Posthog, Stripe, Vercel edge runtime.
- Monorepo: npm workspaces + Turborepo; apps in `/apps`, shared modules in `/packages`.
- API: Auto-generated Swagger from Supabase Studio; first-class client usage via `@supabase/supabase-js` inside and outside the monorepo.

### References
- Onboarding and scripts: `README.md`, `package.json` scripts, `turbo.json`.
- DB: `packages/database/supabase/migrations/**`, `packages/database/supabase/functions/**`, seeds in `packages/database/supabase/functions/lib/seed.ts`.
- Auth/permissions: `packages/auth/src/services/auth.server.ts` (`requirePermissions`, API-key handling).
- ERP/MES app entry: `apps/erp/app/root.tsx`, `apps/mes/app/root.tsx`.
- Docker: `apps/erp/Dockerfile` (consider Turbo prune + root build or provide `apps/mes` Dockerfile).


