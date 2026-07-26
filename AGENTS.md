# AGENTS.md — Master Instructions for AI Coding Agents

This file is the single entry point every agent (OpenCode, Claude Code, Gemini CLI, …)
reads first. `CLAUDE.md` and `GEMINI.md` are one-line pointers back to this file —
edit rules **here only**, never fork them per tool.

## 0. Context Read Order (do this before writing any code)

Check §1 → **Graphify** first — this decides whether steps 1 and the graph
commands below apply at all.

1. `graphify-out/GRAPH_REPORT.md` — **only if Graphify: yes** — read it first for the architecture overview.
2. `edge.md` — business logic, architecture constraints, non-negotiables.
3. `design.md` — visual/UI standards. **Binding.** Never deviate without an explicit user request.
4. `.agents/skills/<name>/SKILL.md` — reusable, modular skill files (agentskills.io standard).
5. `prompts/<phase>.md` — operational instructions for the current development phase.

**If Graphify: yes** and a graph exists (`graphify-out/graph.json`), prefer it over
re-reading files:

```
graphify query "<question>"
graphify path "<A>" "<B>"
graphify explain "<Symbol>"
```

Only fall back to `grep`/full-file reads when the graph doesn't cover what you need
(e.g. a file that changed since the last `--update`).

**If Graphify: no** — this project was scored SMALL in `prompts/setup-interview.md`
Step 0. Don't install or invoke any `graphify` command. Just read the specific
files a task needs, directly — the overhead of a graph isn't worth it at this size.

## 1. Project Identity

> Fill this in once per project — keep it short, this block is read on every turn.

- **Name:** Insurance Recruit Template
- **Domain:** Life insurance agent recruitment
- **Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, SQLite, Zod
- **Primary language(s) for UI/content:** Persian (Farsi) — RTL
- **Payment/3rd-party integrations:** Telegram Bot API
- **Graphify:** yes

## 2. Non-Negotiable Rules

- Never introduce a new visual style, color, font, spacing scale, or component pattern
  that isn't already in `design.md`. If one is genuinely needed, propose the addition to
  `design.md` first, get confirmation, then implement — see §4 of `design.md`.
- Never restructure the architecture described in `edge.md` without flagging it explicitly
  and waiting for confirmation.
- Never do a broad, unrequested refactor while completing a narrow task.
- Prefer small, targeted diffs over full-file rewrites.


## 3. Development Cycle

Follow this order, phase by phase. Before starting a phase, read its file in `prompts/`:

```
Interview   →  Scaffold  →  API Layer  →  Hooks / shared logic  →  Components (UI)  →  Polish
(setup-interview.md) (scaffold.md)  (edge.md)     (edge.md)               (design.md)        (polish.md)
```

If `edge.md` or `design.md` still contain unfilled placeholders, run
`prompts/setup-interview.md` first — interview the user, draft both files,
get explicit confirmation. Do not start the **Scaffold** phase until `edge.md`
and `design.md` are filled in and confirmed.
Do not start **Components** until the graph has been built at least once (`/graphify .`)
— **only if Graphify: yes**; skip this gate entirely for a project scored SMALL.

## 4. Execution Preconditions

Run these before starting a dev server, opening a PR, or ending a work session —
catch mistakes here, not after they've become bugs:

```
tsc --noEmit
eslint .
```

Add project-specific checks (migrations, type-gen, etc.) as they come up.

## 5. Token Discipline

**If Graphify: yes:**
- Use `graphify query` / `graphify path` / `graphify explain` instead of grepping or
  reading whole files for anything already in the graph.
- Batch related questions into a single query instead of several small ones.
- After a structural change (new file, moved module, renamed export), run:
  `graphify . --update`

**If Graphify: no:** read only the files a task actually touches — don't scan the
whole project "just in case." Batching still applies: gather everything a phase
needs in one read pass instead of many small ones.

- Don't paste large file contents into chat/history when a graph query (or a
  targeted read) already answers the question.

## 6. Confidence Tags (from Graphify — applies only if Graphify: yes)

When the graph reports a relationship, treat the tag as a trust level:

- `EXTRACTED` — read directly from source. Trust it.
- `INFERRED` — resolved by graphify's logic. Usually right; verify before relying on it
  for anything destructive (deletions, migrations, auth logic).
- `AMBIGUOUS` — needs a human or a closer look. Don't act on it silently.

## 7. Multi-tool Compatibility

This project is read by more than one agent:

- **OpenCode** → reads this file directly.
- **Claude Code** → reads `CLAUDE.md`, whose first line is `@AGENTS.md` —
  Claude Code's native import syntax, so it loads this file's full content
  rather than needing to be told to go read it. After installing Graphify,
  `graphify claude install` also adds a `PreToolUse` hook automatically.
- **Gemini CLI** → reads `GEMINI.md` (pointer → this file). If you use Gemini
  CLI regularly, `.gemini/settings.json` can be pointed at `AGENTS.md`
  directly instead — see `docs/README-fa.md` for the trade-offs.

## 8. Reasoning Discipline

These rules matter more the smaller/weaker the underlying model is — they trade
extra thinking steps for fewer mistakes:

- For non-trivial logic or design questions, think through the problem step by step
  *before* producing the final answer/code, not while writing it.
- Before an irreversible action (schema change, deleting code, rewriting auth logic),
  mentally compare at least two approaches instead of committing to the first idea.
- After generating non-trivial code, re-read it once as an independent reviewer would
  — specifically looking for mistakes — before presenting it as finished.

## 9. Escalation to a Stronger Model

Some tasks are genuinely past what a lightweight model should attempt alone. See
`prompts/escalate.md` for the exact trigger conditions and required behavior. In
short: when a trigger fires, stop, explain why, and hand the user a self-contained
prompt to run through a stronger model (e.g. Claude's free tier) — then wait for
that answer before continuing.

---

## <GRAPHIFY-MANAGED SECTION>
Do not hand-edit below this line. `graphify opencode install` regenerates this block.
Run it once after the graph exists: `graphify opencode install`
</GRAPHIFY-MANAGED SECTION>

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
