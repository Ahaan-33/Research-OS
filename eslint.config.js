// Enforces ADR-0004: only transformation-engine/** may import persistent-research-state/writes.
// Everyone else gets only the read-only surface (persistent-research-state/reads).
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    files: ['packages/*/src/**/*.ts'],
    languageOptions: { parser: tsParser },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  },
  {
    // ADR-0004: write path is only reachable from transformation-engine/**
    files: ['packages/core/src/**/*.ts'],
    ignores: ['packages/core/src/transformation-engine/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/persistent-research-state/writes', '**/persistent-research-state/writes.js'],
          message: 'ADR-0004: only transformation-engine/ may import persistent-research-state/writes.'
        }]
      }]
    }
  }
];
