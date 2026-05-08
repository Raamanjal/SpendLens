// eslint.config.mjs

import js         from '@eslint/js';
import tsPlugin   from '@typescript-eslint/eslint-plugin';
import tsParser   from '@typescript-eslint/parser';

export default [

  // ── Base JS rules ───────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript rules for src files ──────────────────────
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars':  ['warn'],
      '@typescript-eslint/no-explicit-any': ['warn'],
      '@typescript-eslint/no-empty-object-type': ['warn'],
    },
  },

  // ── Test files ───────────────────────────────────────────
  {
    files: ['__tests__/**/*.ts'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      globals: {
        describe:   'readonly',
        it:         'readonly',
        test:       'readonly',
        expect:     'readonly',
        beforeAll:  'readonly',
        afterAll:   'readonly',
        beforeEach: 'readonly',
        afterEach:  'readonly',
        jest:       'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any':    'off',
      '@typescript-eslint/no-unused-vars':     'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // ── Ignored paths ────────────────────────────────────────
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'public/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
    ],
  },

];