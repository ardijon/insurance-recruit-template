# prompts/setup-interview.md — Phase 0: Interview & Draft

Use this once, before Scaffold, when `edge.md` and/or `design.md` still contain
unfilled template placeholders.

## Step 0 — Project Size Check (do this FIRST, before anything else)

Score the project against these 5 objective criteria — count how many are true:

1. Expected to take more than a few hours / more than one sitting.
2. Has at least 3 distinct modules/areas (e.g. auth + catalog + cart = 3).
3. Will be worked on across multiple sessions (not finished in one sitting).
4. Has a real backend/database, not just static UI.
5. Expected to keep growing with new features over time, not a one-off deliverable.

- **3 or more true → LARGE.** Set `Graphify: yes` in `AGENTS.md` §1, and follow
  the install checklist in `docs/GRAPHIFY-CHECKLIST-fa.md` before continuing.
- **Fewer than 3 true → SMALL.** Set `Graphify: no` in `AGENTS.md` §1. Skip the
  Graphify install entirely — do not run `/graphify .` or any `graphify`
  command for this project. `edge.md`/`design.md` still apply as normal.

Write the result into `AGENTS.md` §1 before moving to Step 1 — every later
section of `AGENTS.md` reads that field to decide whether to use the graph.

## Step 1 — Interview & Draft

1. Read the current (mostly empty) `edge.md` and `design.md`.
2. Ask the user short, specific questions to fill the gaps — one topic at a time,
   not twenty questions at once. Cover, in order:
   - `edge.md`: business logic in one paragraph → locked architecture choices →
     data model → hard boundaries → out-of-scope.
   - `design.md`: direction/layout → typography → color tokens (ask for hex codes
     or a Tailwind config if one exists) → component patterns → do-not-change list.
3. If the project already has code, inspect it first (existing Tailwind config,
   package.json, folder layout) and propose draft answers from what you find,
   rather than asking the user to type out things already visible in the repo.
4. Write the answers directly into `edge.md` and `design.md`, replacing the
   placeholders.
5. Show the user a short diff/summary of what was filled in and ask for a
   go/no-go before moving to `prompts/scaffold.md`.

## Don't

- Don't guess architecture decisions the user hasn't stated or that aren't
  visible in existing code — ask instead.
- Don't proceed to Scaffold until the user confirms both files.
- Don't install or invoke Graphify for a project scored SMALL in Step 0.
