## 1. Business Logic
A dedicated website for a life insurance sales manager, whose primary purpose
is attracting higher-quality agent applicants — not just an executive bio
page. Core flow: a prospective applicant (often arriving via an existing
agent's referral link) lands on the site, sees the manager's profile, the
team success wall, and the pre-interview FAQ, then completes a 3-step agent
application form. The system immediately computes an automatic score for
them and sends an instant Telegram message (including the score and
referrer name, if any) to the manager.

This project is a **reusable, sellable template**, not a one-off site: each
sales manager who orders it gets their own independent deployment and
database.

## 2. Architecture — Locked Decisions

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (React) | User's choice |
| Database | SQLite | Simple file, no separate database service needed — fits a project whose hosting varies per customer |
| Auth | Only admin access (the manager) requires authentication | The public form does not require applicant login |
| Payments | None | Business model is agent recruitment, not direct sales |
| Hosting | Variable / per-customer — each buyer provisions their own personal hosting | General-purpose template, not tied to one platform; only requirement: hosting must support Node.js |

## 3. Data Model Constraints
- ManagerProfile (single row): name, bio, achievements, current agent count, annual growth stat
- SuccessWallEntry: agent name, short success quote, publish-permission flag
- GrowthPathStage: static stages of the path from new agent to branch manager
- FAQItem: question, answer (pre-interview FAQ)
- Applicant: basic info, background, motivation, computed score, referralCode (nullable)
- ReferralLink: owning agent, unique code
- (optional) FitAssessmentResult: short behavioral questionnaire answers, linked to one Applicant
- All tables above live in a single SQLite file scoped to that one deployment.

## 4. Hard Boundaries
- Never turn this project into a shared/multi-tenant backend across customers; each sold copy has its own fully independent deployment and SQLite file.
- Never display an applicant's personal/contact info publicly without explicit consent (the success wall only has the agent's consent, not the applicant's).
- Never put the Telegram bot token or any API key in client-side code.
- Never change the automatic scoring logic without explicit confirmation — it directly affects which applicants the manager calls first.
- This project has no payment gateway; don't add anything payment-related unless explicitly requested later.

## 5. Out of Scope (for now)
- The formal, deeper version of the sales-fit assessment (full smart-screening framework + recruitment scorecard) — per the proposal, part of a separate, larger roadmap.
- A separate admin web panel beyond the Telegram notification — not mentioned in the proposal.
- Any shared multi-tenant/SaaS layer across customers.