import tseslint from 'typescript-eslint'
import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname }
    }
  },
  // Type-aware rules: the core is small, framework-free and has strict tsconfig, so they are cheap and catch real bugs.
  ...tseslint.configs.recommendedTypeChecked.map(config => ({ ...config, files: ['**/*.ts'] })),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: true }
    },
    rules: {
      'no-console': 'error',
      // recommendedTypeChecked resets the options set in the root config
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }]
    }
  }
]
