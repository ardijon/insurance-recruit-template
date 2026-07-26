# prompts/scaffold.md — Scaffold Phase

Use when starting a new project or a new major feature area.

## Preconditions

- [ ] `edge.md` filled in (architecture decisions locked)
- [ ] `design.md` filled in (tokens + components defined, even minimally)
- [ ] `.graphifyignore` present

## Do

1. Create the folder/module structure implied by `edge.md` — nothing more.
2. Wire up the framework/database/auth choices exactly as locked in `edge.md`.
3. Leave clear `# NOTE:` / `# WHY:` comments on non-obvious decisions — Graphify
   extracts these as first-class nodes, so future sessions (and other agents) see
   the reasoning without re-deriving it.
4. Stop at structure. Do not build UI polish or edge-case handling yet — that's
   later phases.

## Don't

- Don't invent architecture not in `edge.md`.
- Don't add dependencies not already agreed — flag and ask instead.
- Don't write component styling yet (that reads `design.md`, in the Components phase).

## After this phase

Run:
```
/graphify .
```
This builds the first knowledge graph so later phases can query instead of re-reading
the whole scaffold.
