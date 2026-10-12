module.exports = {
  displayName: 'ngx-studio',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testEnvironment: 'jsdom',
  coverageDirectory: '../../coverage/libs/ngx-studio',
  moduleNameMapper: {
    '^@dynamic-ui/studio$': '<rootDir>/../studio/src/index.ts'
  },
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$'
      }
    ]
  },
  moduleFileExtensions: ['ts', 'html', 'js', 'mjs', 'json']
}
