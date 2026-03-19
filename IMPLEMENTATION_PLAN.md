# IMPLEMENTATION_PLAN

## Objective
Build a mobile-first finance learning app that changes money behavior through short daily, transaction-aware challenges.

## Scope Boundaries
In scope (MVP):
- onboarding and auth
- bank-linking integration (Plaid sandbox)
- daily challenge engine and streaks
- behavior-change metrics dashboard
- subscription plan gating and billing test flow

Out of scope (MVP):
- enterprise HR admin suite beyond pilot hooks
- advanced adaptive ML recommendation engine
- insurer/real-estate data partnerships
- production-grade multi-region operations

## Current Baseline
Gap mode (implementation scaffold exists):
- Next.js + TypeScript + Bun project is present.
- `progress.txt` contains a 13-sprint / 62-work-item backlog.
- Plan needs alignment with newly extracted IdeaBrowser subpage evidence.

## IdeaBrowser Evidence (Updated 2026-03-18)
Source idea: `https://www.ideabrowser.com/idea/gamified-personal-finance-education-app`

### Confirmed Extracted Sections
- Main page: full concept, pricing anchors, scores, audience, competitor signal.
- `value-ladder`: extracted in full.
- `why-now`: extracted in full.
- `proof-signals`: extracted in full.
- `market-gap`: extracted in full.
- `execution-plan`: extracted in full.
- `value-equation`: extracted in full.
- `value-matrix`: extracted in full.
- `acp`: extracted in full.
- `keywords`: extracted in full.
- `feasibility-score`: extracted in full.
- `problem-score`: extracted in full.

### Value Ladder (Confirmed)
- Lead magnet: Finance Fundamentals Quiz (Free)
- Frontend offer: Premium Starter Pack ($5/month)
- Core offer: All-Access Finance Academy ($10/month)
- Continuity: Community Plus Membership ($15/month)
- Backend: Corporate Wellness Finance Program ($10,000/year)

### Why-Now (Confirmed)
- Overall rating: 8/10
- Market timing: 9/10
- Tech enablers: 8/10
- Regulatory/social catalysts: 6/10
- Risk reduction: 8/10
- Competitive window: 9/10
- Timing risks: 5/10

### Proof-Signals (Confirmed)
- Overall rating: 8/10
- Frustration signals: 8/10
- Time-sensitive needs: 9/10
- Systemic barriers: 7/10
- Community demand: 8/10

### Market Gap (Confirmed)
- Overall rating: 8/10
- Underserved segments: young adults new to finance, gig workers.
- Feature gaps: daily micro-lessons and real-time tailored lessons.
- Differentiation lever: education-first positioning with community learning.

### Execution Plan (Confirmed)
- Classification: B2C, timeline 2-4 weeks, budget $0-10K.
- Phase 1 (0-6 months): freemium entry with $5 premium, social-led acquisition.
- Phase 2 (6-18 months): bank-data integration, 100K user / 10K DAU milestone target.
- Initial channels: Reddit, Instagram, influencer partnerships.

### Framework / Score Pages (Confirmed)
- Value Equation overall: 8/10.
  - Dream Outcome 9/10, Perceived Likelihood 8/10, Time Delay 6/10, Effort/Sacrifice 9/10.
- Value Matrix indicates Category King positioning (score shown as 8/10).
- ACP page confirms target audience/community/product strategy and 90-day plan alignment.
- Feasibility score: 9/10 (market/validation 8/10; technical/resources 9.5/10).
- Problem score: 8/10 (market response 6.5/10; pain type marked acute).

### Keywords (Confirmed)
- Core keyword shown: personal finance app (201K volume, +507% growth on keywords page header).
- Fastest/Highest relevant terms include:
  - personal money management app (301K, +6741%)
  - apps for budgeting (246K, +397%)
  - personal finance app (201K, +4468%)

### Remaining Unknown
- `opportunity-score` route resolves to page-not-found for this idea slug in current run.

## Milestones

## Phase 1: Platform Foundation
### Goals
Stabilize core app foundation and delivery pipeline.

### Deliverables
- app shell, routing, env validation
- lint/typecheck/test/build CI
- Vercel preview deployment

### Dependencies
- GitHub + Vercel wiring

### Risks
- environment drift between local and CI

### Acceptance Criteria
- clean build in CI
- deterministic local bootstrap

## Phase 2: Auth + Profile Onboarding
### Goals
Ship secure account lifecycle and initial personalization.

### Deliverables
- signup/login/logout
- protected routes
- onboarding profile (goals, risk tolerance, age band)

### Dependencies
- Supabase auth and schema

### Risks
- RLS mistakes and session edge cases

### Acceptance Criteria
- auth flow works end-to-end
- profile persisted and retrievable

## Phase 3: Plaid Link + Transaction Pipeline
### Goals
Ingest and normalize transactions from linked accounts.

### Deliverables
- Plaid link token + public token exchange
- account linkage state UI
- normalized transaction storage and sync jobs

### Dependencies
- Plaid sandbox keys

### Risks
- category mapping quality
- sync idempotency and retries

### Acceptance Criteria
- linked account syncs transactions
- normalized records available for challenge engine

## Phase 4: Challenge System (Core Product)
### Goals
Deliver behavior-first daily challenge loop.

### Deliverables
- challenge template library (min 20)
- daily challenge assignment
- completion flow and streak logic
- challenge history and progression

### Dependencies
- transaction normalization

### Risks
- challenge novelty decay after week 2-4

### Acceptance Criteria
- daily challenge is assigned and completable
- streak updates reliably
- templates cover spending/saving/debt topics

## Phase 5: Analytics + Behavior Change Evidence
### Goals
Measure whether challenge completion changes real spending behavior.

### Deliverables
- baseline vs rolling 7/30-day metrics
- KPI dashboard (min 3 behavior KPIs)
- cohort comparison (e.g., streaked vs lapsed)

### Dependencies
- transaction and completion event quality

### Risks
- weak attribution signal

### Acceptance Criteria
- KPI outputs are consistent and reproducible
- cohort deltas are visible in UI

## Phase 6: Monetization Aligned to Value Ladder
### Goals
Implement pricing and entitlement gates mapped to IdeaBrowser ladder.

### Deliverables
- tiers aligned to extracted ladder ($5, $10, $15, B2B path)
- entitlement checks in app/API
- Stripe test-mode checkout + webhooks

### Dependencies
- Stripe product/price setup

### Risks
- plan complexity too early

### Acceptance Criteria
- upgrade path works in test mode
- features correctly gate by plan

## Phase 7: Beta Hardening and Launch
### Goals
Prepare a secure and supportable beta release.

### Deliverables
- input validation + rate limiting
- error monitoring/audit logs
- launch checklist and QA pass

### Dependencies
- observability setup

### Risks
- unnoticed PII/security gaps

### Acceptance Criteria
- no high-severity open security issues
- beta release checklist complete

## Deferred / Out of Scope
- enterprise admin workflows beyond initial backend offer pilot
- advanced recommendation ML and adaptive curriculum optimizer
- partner-data monetization channels

## Next Concrete Steps
1. Reconcile `progress.txt` items to this evidence-updated milestone wording.
2. Convert extracted score/page evidence into explicit acceptance thresholds in sprint issues (e.g., retention, CAC, churn KPI targets).
3. Begin execution from Sprint 1 work items and mark completed entries in `progress.txt`.
