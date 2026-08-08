# prompts/polish.md — Polish Phase

Use at the end of a feature/task, before it's considered done.

## Do

1. Run execution preconditions from `AGENTS.md` §4 (`tsc --noEmit`, `eslint .`, etc.)
   and fix everything they flag.
2. Run through `design.md` §6 verification checklist — confirm nothing visual drifted.
3. Update the graph if structure changed:
   ```
   graphify . --update
   ```
4. Re-check `edge.md` hard boundaries (§4) — nothing violated.
5. Write/update `# NOTE:` comments for anything non-obvious introduced in this task.

## Don't

- Don't use this phase to sneak in an unrelated refactor.
- Don't skip the visual checklist because "it's just a small change" — that's exactly
  how appearance drifts over many small tasks.

## Output

A short summary of: what changed, what was verified, and anything flagged for the
user's confirmation (new design token, architecture deviation, etc.).
