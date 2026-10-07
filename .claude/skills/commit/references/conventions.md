# Commit conventions — details

Supplement to [SKILL.md](../SKILL.md). Core rules (format, types, scopes, subject, body, breaking,
atomicity) live there; this file covers less frequent cases.

## Footers

- Format: `Token: value` or `Token #value` (git trailer style). Tokens use `-` instead of spaces.
- A value may span several lines; it ends where the next `Token: ` / `Token #` begins.
- Allowed tokens, in this order:

  | Token             | Example                                                |
  | ----------------- | ------------------------------------------------------ |
  | `BREAKING CHANGE` | `BREAKING CHANGE: Studio.addNode is removed. Use …`    |
  | `Refs`            | `Refs: #123`, `Refs: 676104e`                          |
  | `Closes`          | `Closes #123` — closes the issue when merged to `main` |
  | `Reviewed-by`     | `Reviewed-by: Name <email>`                            |
  | `Co-Authored-By`  | `Co-Authored-By: Name <email>` — humans only, last     |

- `BREAKING CHANGE` is uppercase, followed by `: ` and a description of what breaks and how to migrate.
  Do not use the `BREAKING-CHANGE` synonym.

Breaking change example:

```
refactor(tree)!: rename Studio.addNode to Studio.insertNode

BREAKING CHANGE: `Studio.addNode` is removed. Use `Studio.insertNode(parentId, node, index?)`.
```

## Revert

Run `git revert <sha>`, then rewrite the message to:

```
revert: <header of the reverted commit>

This reverts commit <full 40-char sha>.

<why it is reverted>
```

- Keep the `This reverts commit <sha>.` line exactly — `nx release` uses it to drop the reverted commit
  from the changelog.
- If the header exceeds 72 characters, shorten the original subject.

## Merge, fixup and squash commits

- Merge commits produced by git / GitHub (`Merge pull request #…`, `Merge branch …`) are exempt from
  these rules — commitlint ignores them, as well as `fixup!` / `squash!` commits.
- `fixup!` / `squash!` commits are allowed on feature branches only and must be autosquashed before
  merge (`git rebase -i --autosquash`).
- When a PR is squash-merged, the **PR title** becomes the commit header and must follow these rules.

## Versioning

`nx release` derives versions and changelogs from commits (default Conventional Commits mapping):

| Commit                                 | Version bump | In changelog |
| -------------------------------------- | ------------ | ------------ |
| any type with `!` / `BREAKING CHANGE`  | **major**    | yes          |
| `feat`                                 | **minor**    | yes          |
| `fix`                                  | **patch**    | yes          |
| `perf`, `refactor`, `docs`, `build`, … | none         | hidden       |
| `revert`                               | none         | hidden       |

Consequences:

- A user-visible fix typed as `refactor` or `chore` will **not** be released as a patch.
- A breaking change without `!` / footer ships as minor / patch and breaks consumers.
- `perf` does not trigger a release on its own — ship it together with a `feat` / `fix` if it matters.

## Deviations from the spec

[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) permits more than we do.
Our rules only narrow the spec — a valid project commit is always a valid Conventional Commit.

| Spec allows                               | We require                                                   | Why                                                           |
| ----------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| Breaking via `!` **or** footer (#11, #13) | **Both** `!` and `BREAKING CHANGE:` footer                   | `!` is visible in `git log --oneline`; footer holds migration |
| Any type besides `feat` / `fix` (#14)     | Only `types` from `commitlint.config.mjs`                    | Predictable changelog and version bumps                       |
| Any noun as scope (#4)                    | Only `scopes` from `commitlint.config.mjs`                   | Consistent grouping, no `canvas` vs `canvas-ui` drift         |
| Any case for type / scope (#15)           | Lowercase type, kebab-case scope                             | One spelling per value                                        |
| Any description length / style (#5)       | ≤ 72 chars header, imperative, lowercase, no period, English | Readable `git log`, no truncation in GitHub UI                |
| Free-form body and footers (#7, #8)       | Lines ≤ 100 chars, fixed set of footer tokens                | Readable in terminal and review tools                         |
| `BREAKING-CHANGE` as synonym (#16)        | Always `BREAKING CHANGE`                                     | One spelling to search for                                    |
