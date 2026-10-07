import nx from '@nx/eslint-plugin'
import baseConfig from '../../eslint.config.mjs'

export default [
  ...baseConfig,
  // Also lints inline `template:` strings: every component here keeps its template in the .ts file.
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'ds', style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'ds', style: 'camelCase' }],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error'
    }
  },
  {
    files: ['**/*.html'],
    rules: {
      // TODO: back to error once keyboard selection on the canvas is designed
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn'
    }
  }
]
