# IMPLEMENTATION_PLAN

## Objective
Build an MVP mobile-first web app that helps young adults improve financial behavior using short daily challenges linked to real transaction data.

## Scope Boundaries
In scope (MVP):
- onboarding and auth
- account linking via Plaid sandbox/dev
- challenge engine with daily tasks
- streaks and progress tracking
- behavior metric dashboard
- basic subscription gating (stubbed or test mode)

Out of scope (MVP):
- employer/HR enterprise portal
- complex ML personalization
- insurer/credit/real-estate data sales integrations
- production-grade multi-region infrastructure

## Current Baseline
Greenfield mode (no implementation detected in this repo yet).

## Phase 1: Product Shell and Core Architecture
### Goals
Create the app foundation, environments, and deployable baseline.

### Deliverables
- React app scaffold with TypeScript
- routing and layout shell
- env management and config validation
- CI lint/type/test/build pipeline
- Vercel preview deploy

### Dependencies
- GitHub repo
- Vercel project
- Node/Bun toolchain

### Risks
- toolchain drift between local and CI
- unclear env contract early

### Acceptance Criteria
- app boots locally and on preview URL
- CI passes on pull request
- environment schema blocks invalid startup

## Phase 2: Auth and User Profiles
### Goals
Enable user signup/login and persistent profiles.

### Deliverables
- auth screens and session handling
- profile model (age band, goals, risk tolerance)
- protected routes

### Dependencies
- Supabase/Firebase/Auth provider decision

### Risks
- auth provider lock-in
- weak session invalidation

### Acceptance Criteria
- user can sign up/login/logout
- protected pages deny anonymous access

## Phase 3: Transaction Ingestion and Normalization
### Goals
Pull account/transaction data and normalize it for challenge generation.

### Deliverables
- Plaid Link integration (sandbox first)
- server endpoint for token exchange
- transaction sync job and normalization rules

### Dependencies
- Plaid API keys
- backend runtime (serverless/API route)

### Risks
- category mapping inconsistency
- sync latency and retry failures

### Acceptance Criteria
- connected test account ingests transactions
- normalized transactions visible in debug/admin view

## Phase 4: Challenge Engine and Daily Loop
### Goals
Generate daily challenges from real behavior patterns.

### Deliverables
- challenge templates (spending awareness, saving triggers, debt basics)
- daily challenge scheduler
- completion tracking
- streak logic and rewards primitives

### Dependencies
- normalized transaction data
- profile preferences

### Risks
- repetitive challenge quality
- shallow novelty after early days

### Acceptance Criteria
- user receives one daily challenge
- challenge completion updates streak and metrics
- 20+ challenge templates available

## Phase 5: Analytics and Behavior Change Metrics
### Goals
Measure if users change spending behavior after sustained challenge completion.

### Deliverables
- baseline spending snapshot
- rolling 7/30 day comparisons
- measurable behavior-change KPIs

### Dependencies
- transaction history and completion events

### Risks
- weak causal attribution
- noisy user-level financial data

### Acceptance Criteria
- dashboard shows at least 3 behavior metrics
- cohort view supports "3 consecutive days completed" comparison

## Phase 6: Monetization and Plan Gating
### Goals
Implement free/pro/premium access controls for features.

### Deliverables
- plan definitions (free, $5 starter, $10 all-access)
- feature gates and entitlement checks
- billing integration placeholder or Stripe test mode

### Dependencies
- payment provider setup

### Risks
- pricing friction during early retention stage

### Acceptance Criteria
- feature access correctly follows active plan
- upgrade flow works in test mode

## Phase 7: Quality, Security, and Launch Readiness
### Goals
Harden app for initial beta users.

### Deliverables
- privacy and security review checklist
- rate limiting and API safeguards
- error tracking and audit logs
- onboarding docs and support flows

### Dependencies
- baseline telemetry stack

### Risks
- financial-data handling gaps
- insufficient observability

### Acceptance Criteria
- no high-severity security findings open
- launch checklist complete
- beta-ready release tag created

## Deferred / Unknown
- full IdeaBrowser subpage details (value ladder deep text, ACP/value matrix details, feasibility/problem/opportunity rationale): unknown due access restrictions during crawl
- enterprise employer contract workflow: deferred
- advanced adaptive learning model: deferred

## Tech Stack (Locked In)
- **Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Route Handlers (replaces Supabase Edge Functions)
- **Database/Auth**: Supabase (Postgres + Auth + RLS)
- **Banking**: Plaid (sandbox only for MVP)
- **Payments**: Stripe (test mode)
- **Charts**: Recharts
- **Testing**: Vitest (unit/integration per sprint) + Playwright (E2E at milestones)
- **Package Manager**: Bun
- **Deploy**: Vercel
- **CI**: GitHub Actions

## Key Decisions
- Next.js App Router for both frontend and API routes (no separate backend)
- Incremental DB migrations per sprint (not one big upfront schema)
- Monetization split across 2 sprints to reduce risk
- Plaid stays in sandbox for entire MVP — real bank linking is post-beta
- Unit + integration tests required for each issue's core logic

## Sprint Structure
See progress.txt for the full 13-sprint, 62-issue breakdown (W-000001 through W-000062).
All issues tracked on GitHub with Gherkin acceptance criteria.
Project board: https://github.com/users/andysolomon/projects/5

## Next Concrete Steps
1. Begin Sprint 1: Initialize Next.js + TypeScript project (W-000001)
2. Set up app shell and routing (W-000002)
3. Configure CI pipeline and Vercel deploys (W-000005, W-000006)
