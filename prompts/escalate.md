# prompts/escalate.md — Escalation Protocol

Weaker models are, ironically, worse at *noticing* when they're out of their depth —
that's the exact problem this file exists to work around. So the triggers below are
objective and countable, not "if you feel unsure." Countable conditions are far more
reliably detected than a self-confidence judgment.

## Stop and escalate when ANY of these are true

1. **Stuck loop:** you've attempted a fix for the same error/bug twice and it's still
   failing (or a different error appeared in its place both times).
2. **Irreversible architecture decision** not already locked in `edge.md` — e.g. a
   database schema change, switching an auth approach, changing a public API contract.
3. **Payments or auth, no exceptions.** Anything touching the payment integration or
   authentication/authorization logic always escalates for review, regardless of how
   simple it looks.
4. **AMBIGUOUS graph relationship feeding a hard-to-reverse action** — if Graphify
   tags something `AMBIGUOUS` and you're about to act on it destructively (delete,
   migrate, overwrite).
5. **Wide-blast-radius task** — a change that touches many files/modules at once and
   you can't confidently enumerate the side effects.

## What to do when a trigger fires

1. **Stop.** Don't guess, don't push forward "just to be safe."
2. Tell the user, briefly, which trigger fired and why.
3. Generate a **self-contained, copy-paste-ready prompt** for the user to paste into
   Claude's free tier — see template below. Keep it minimal on purpose: free-tier
   usage is limited, so don't dump whole files, only what's needed to decide.
4. Wait for the user to paste Claude's answer back before continuing. Don't proceed
   on your own guess in the meantime.

## Template for the escalation prompt (fill in, then show it to the user verbatim)

```
Context: [1-2 sentences — what the project is, what this part does]

Problem: [the specific decision or bug, stated precisely]

What I've already tried: [only if trigger #1 — the attempts and what happened]

Relevant code/structure: [the minimal snippet or graph node — not whole files]

Question: [the exact decision needed — phrased so a short, decisive answer is
possible, not "please implement this"]
```

Ask Claude for a **decision or diagnosis**, not a full implementation — that keeps
the exchange short enough for a free-tier message budget, and the actual
implementation still happens back in OpenCode once the decision comes back.
