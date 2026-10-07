import nx from '@nx/eslint-plugin'

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    // typescript-eslint cannot guess it once several eslint.config files are loaded in one run
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname }
    }
  },
  {
    ignores: [
      '**/dist',
      '**/tmp',
      '**/coverage',
      '**/out-tsc',
      '**/.angular',
      '**/storybook-static',
      'playwright-report',
      'test-results'
    ]
  },
  {
    files: ['**/*.ts', '**/*.cts', '**/*.mts', '**/*.js', '**/*.cjs', '**/*.mjs'],
    rules: {
      // `const { [key]: _omitted, ...rest } = obj` is the idiomatic immutable omit
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      // Encodes the layering from ARCHITECTURE.md: core has no UI and no framework, UI depends on core only.
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'type:core',
              onlyDependOnLibsWithTags: ['type:core'],
              bannedExternalImports: ['@angular/*', 'react', 'react-dom', 'react/*', 'vue', 'vue/*']
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:core', 'type:ui']
            }
          ]
        }
      ]
    }
  }
]
