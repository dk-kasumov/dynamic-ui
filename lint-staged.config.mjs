// Runs on `git commit` via .husky/pre-commit, only for staged files.
// ESLint finds the nearest eslint.config.mjs per file, so project configs apply without Nx.
export default {
  '*.{ts,mts,cts,js,mjs,cjs}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{html,scss,css,json,md,yml,yaml}': 'prettier --write'
}
