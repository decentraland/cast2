/* eslint-env node */
module.exports = {
  extends: ['@dcl/eslint-config/dapps'],
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.test.json']
  },
  ignorePatterns: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', 'src/tests/**'],
  rules: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'import',
        format: ['camelCase', 'PascalCase']
      }
    ]
  }
}
