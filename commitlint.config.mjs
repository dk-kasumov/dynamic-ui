// Commit message rules — single source of allowed types and scopes.
// Human-readable guide: .claude/skills/commit/SKILL.md

/** Allowed types → when to use and the release bump `nx release` derives from it. */
export const types = {
  feat: 'New user-visible capability or public API (bump: minor)',
  fix: 'Bug fix — behaviour was wrong, now it is correct (bump: patch)',
  perf: 'Performance improvement with no behaviour change (bump: none)',
  refactor: 'Code change with no behaviour change (bump: none)',
  style: 'Formatting only — not CSS / visual changes (bump: none)',
  test: 'Adding or fixing unit / e2e tests only (bump: none)',
  docs: 'Documentation only: README, ARCHITECTURE.md, JSDoc, stories (bump: none)',
  build: 'Build system, Nx config, tsconfig, dependencies, scripts (bump: none)',
  ci: 'CI pipelines and workflow files (bump: none)',
  chore: 'Tooling and housekeeping that fits nothing above (bump: none)',
  revert: 'Reverting a previous commit (bump: none)'
}

/** Allowed scopes → feature area they cover. Add a new scope in the commit that introduces it. */
export const scopes = {
  // Core — libs/studio/src/lib
  core: 'studio.ts facade, error.ts, humanize.ts, public index.ts, cross-cutting core changes',
  tree: 'tree.ts, node.ts — DSL tree and node operations',
  registry: 'component.ts, primitives.ts — component registration, prop primitives',
  relation: 'relations.ts, relations-rules.ts and their UI (relation-field, relations-form)',

  // UI — libs/ngx-studio/src/lib
  canvas: 'canvas/ — canvas, nodes, sortable (except palette)',
  palette: 'canvas/palette/',
  inspector: 'inspector/ — fields, props form, meta fields (except relation parts)',
  'folders-sidebar': 'folders-sidebar/',
  header: 'header/',
  shell: 'ngx-studio.component, studio-facade.service, public index.ts — editor wiring',

  // Infra
  storybook: '.storybook/ config',
  e2e: 'e2e/**, playwright.config.ts',
  deps: 'dependency changes in package.json + package-lock.json',
  nx: 'nx.json, project.json, tsconfig*.json',
  release: 'versioning, publishing, .verdaccio/',
  tooling: 'prettier, editorconfig, git hooks, commitlint, .vscode/',
  claude: '.claude/**, CLAUDE.md'
}

const BREAKING_HEADER = /^[a-z]+(\([^)]*\))?!: /
const BREAKING_FOOTER = /^BREAKING CHANGE: \S/m
const BREAKING_SYNONYM = /^BREAKING-CHANGE:/m

/** A breaking change needs both `!` in the header and a `BREAKING CHANGE:` footer. */
const breakingChangeMarkers = ({ header, body, footer }) => {
  const text = [body, footer].filter(Boolean).join('\n')
  const hasBang = BREAKING_HEADER.test(header ?? '')
  const hasFooter = BREAKING_FOOTER.test(text)

  if (BREAKING_SYNONYM.test(text)) {
    return [false, 'use "BREAKING CHANGE:" instead of "BREAKING-CHANGE:"']
  }
  if (hasBang && !hasFooter) {
    return [false, 'breaking change marked with "!" needs a "BREAKING CHANGE: <migration>" footer']
  }
  if (hasFooter && !hasBang) {
    return [false, '"BREAKING CHANGE:" footer needs "!" before ":" in the header']
  }
  return [true]
}

/** One scope per commit: built-in `scope-enum` accepts `a,b` / `a/b` if each part is allowed. */
const scopeSingle = ({ scope }) =>
  !scope || !/[,/\\]/.test(scope) ? [true] : [false, 'use exactly one scope — split the commit or omit the scope']

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'breaking-change-markers': breakingChangeMarkers,
        'scope-single': scopeSingle
      }
    }
  ],
  rules: {
    'type-enum': [2, 'always', Object.keys(types)],
    'scope-enum': [2, 'always', Object.keys(scopes)],
    // not 'kebab-case': it splits digits and rejects `e2e`; scope-enum already pins the exact spelling
    'scope-case': [2, 'always', 'lower-case'],
    'scope-single': [2, 'always'],
    'scope-empty': [1, 'never'],
    'header-max-length': [2, 'always', 72],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
    'breaking-change-markers': [2, 'always']
  }
}
