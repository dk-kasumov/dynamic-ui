---
name: commit
description: Create git commits that follow this repo's Conventional Commits rules (types, scopes, subject/body/footer requirements, atomic commits). Use whenever creating, splitting, rewording or reviewing a commit message in this repository, or when the user asks to commit changes.
argument-hint: '[optional hint: what to commit or intent of the change]'
allowed-tools: Bash(sed -n:*) Bash(git status:*) Bash(git diff:*) Bash(git log:*) Bash(git add:*) Bash(git restore --staged:*) Bash(git commit:*) Bash(git show:*)
---

# Commit

Create one or more commits for the current changes. Messages follow
[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) plus the stricter project
rules below.

## Context

- Branch: !`git branch --show-current`
- Status: !`git status --short`
- Staged: !`git diff --cached --stat`
- Unstaged: !`git diff --stat`
- Recent commits: !`git log --oneline -10`

User hint: $ARGUMENTS

## Rules

The `commit-msg` hook runs commitlint with `commitlint.config.mjs` — it rejects messages that break the
format, types, scopes, case, length or breaking-change rules. The rules below that the hook cannot check
(mood, "why" in body, atomicity) are on you.

### Format

```
<type>(<scope>)!: <subject>

<body>

<footers>
```

- Header is required, max **72** characters including `type(scope)!: `.
- `type` lowercase, `scope` kebab-case, exactly one space after `:`.
- Body and footers are optional, each separated by one blank line, lines wrapped at **100** characters.
- English only.

### Types and scopes

Allowed values (excerpt of `commitlint.config.mjs`, the source of truth):

!`sed -n '/^export const types/,/^}/p;/^export const scopes/,/^}/p' commitlint.config.mjs`

Choosing a type:

- Pick the type by **effect on consumers**, not by the kind of files touched — it decides the release
  version (`bump` above). Any type with a breaking change → **major**.
- Visual / SCSS / template changes users see → `feat` or `fix`, **not** `style`. `ui` is not a type.
- A change that fits several types → split it. If impossible, use the higher bump (`feat` > `fix` > rest).
- Dependency bumps → `build(deps)`; a bump that fixes a user-visible bug → `fix(deps)`.

Choosing a scope — the **feature area** of the change:

- Scope is optional but expected — the hook warns (does not block) when it is missing.
- One scope per commit — never `(canvas,inspector)`.
- A feature spanning core and UI (e.g. `relation`) uses its one feature scope.
- Several features touched → split per feature. If inseparable, omit the scope and list the areas in the body.
- Repo-wide changes (format all files, root configs not covered) → omit the scope.
- Storybook stories of a feature → that feature's scope (`docs(canvas): add story for empty canvas`).
- New feature area → add its scope to `scopes` in `commitlint.config.mjs` in the same commit that
  introduces it.

### Subject

- Imperative, present tense: `add`, `fix`, `remove` — not `added` / `adds`. Test: "If applied, this
  commit will _&lt;subject&gt;_".
- Starts with a lowercase verb; code identifiers go after it (`add Studio.relation`, not
  `Studio.relation added`).
- No trailing period. No vague subjects (`fix bug`, `update code`, `wip`, `part 1/2`).
- Says **what** changed at the level a reviewer cares about — not the file list.

### Body and footers

- Both are optional. Default is a header-only commit.
- Add a body only when the "why" is not obvious or the change is non-trivial. Explain **why** and what
  problem it solves; mention side effects, trade-offs, follow-ups. The diff shows **how** — do not
  repeat the subject or paste the diff. Bullet lists are fine.
- Add footers only when needed: `BREAKING CHANGE:` (required for breaking changes), issue references.
- Never add Claude attribution: no `Co-Authored-By: Claude …`, no "Generated with Claude Code" lines.

### Breaking changes

Breaking = incompatible change to the **public API** of `@dynamic-ui/studio` / `@dynamic-ui/ngx-studio`:
removed or renamed export, changed signature or return type, changed input / output of a public
component, changed DSL shape. Internal non-exported code is never breaking.

Mark it with **both** a bang in the header (`type(scope)!: …`) **and** a `BREAKING CHANGE:` footer
describing the migration.

### Atomicity

- One logical change per commit; each commit must build and pass tests on its own.
- Unrelated changes → separate commits, or leave them unstaged.
- Formatting of untouched code → separate `style` commit.
- Lock file goes with the `package.json` change that caused it.

### Never

- Commit secrets, `.env*`, `dist/`, `tmp/`, `test-results/`, `playwright-report/`, or personal IDE
  state (`.idea/workspace.xml` etc.). Shared IDE configs are fine — `.gitignore` decides what is shared.
- `git add -A` / `git add .` — stage explicitly by path.
- `--no-verify`; amending or rewriting commits that are already pushed.

## References

Read only when the case applies:

- [references/conventions.md](references/conventions.md) — footer tokens and order, revert format,
  merge / fixup / squash commits, how types map to releases, deliberate deviations from the spec.
  Read when: adding any footer, reverting, the commit is breaking, or a rule above seems to conflict
  with the spec.
- [references/examples.md](references/examples.md) — good messages and common mistakes. Read when
  unsure how a message should look.

## Workflow

1. **Inspect the changes.** Read the actual diff (`git diff --cached`, `git diff`, untracked files) — do
   not write a message from the file list alone. Recent commits are shown for context only; do not
   imitate them where they break the rules.

2. **Decide what goes in.**
   - Something already staged → commit only that; the user chose it.
   - Nothing staged → group changes into logical commits (see _Atomicity_) and stage by path.
   - Leave out anything from _Never_ and anything unrelated to the user hint.

3. **Confirm only when splitting.** One logical commit → commit right away. Several commits → show the
   plan (message + files for each) and wait for confirmation, unless the user already asked to commit
   everything.

4. **Write the message** and self-check:
   - [ ] type and scope are from `commitlint.config.mjs`
   - [ ] header ≤ 72 chars, imperative, lowercase, no trailing period
   - [ ] body explains why (if present), lines ≤ 100 chars
   - [ ] no Claude attribution lines
   - [ ] breaking change has both `type(scope)!:` and a `BREAKING CHANGE:` footer
   - [ ] exactly one logical change

5. **Commit** with a heredoc so formatting is preserved:

   ```bash
   git commit -F - <<'EOF'
   feat(canvas): add drag handle to node

   Body explaining why.
   EOF
   ```

   If the commitlint hook rejects the message, the commit was not created — read the reported rule, fix
   the message and run `git commit` again. Do not amend, do not use `--no-verify`.

6. **Report** with `git log --oneline -n <number of commits created>` and mention anything intentionally
   left uncommitted.
