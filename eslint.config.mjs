import js from '@eslint/js'
import ts from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import next from '@next/eslint-plugin-next'
import unicorn from 'eslint-plugin-unicorn'
import sonarjs from 'eslint-plugin-sonarjs'
import perfectionist from 'eslint-plugin-perfectionist'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import promise from 'eslint-plugin-promise'
import security from 'eslint-plugin-security'
import boundaries from 'eslint-plugin-boundaries'
import checkFile from 'eslint-plugin-check-file'
import unusedImports from 'eslint-plugin-unused-imports'
import playwright from 'eslint-plugin-playwright'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default ts.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'public/**',
      'docs/**',
      'reports/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'blob-report/**',
      '*.config.mjs',
      '*.config.js',
      '*.mjs',
      '*.cjs',
      'scripts/**',
    ],
  },
  // --- BASE JS/TS ---
  js.configs.recommended,
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,

  // --- PLUGINS CONFIG ---
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@next/next': next,
      react: react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      unicorn: unicorn,
      sonarjs: sonarjs,
      perfectionist: perfectionist,
      'jsx-a11y': jsxA11y,
      promise: promise,
      security: security,
      boundaries: boundaries,
      'check-file': checkFile,
      'unused-imports': unusedImports,
      playwright: playwright,
      prettier: prettier,
    },
    settings: {
      react: { version: 'detect' },
      'boundaries/elements': [
        { type: 'app', pattern: 'app/**' },
        { type: 'features', pattern: 'features/**' },
        { type: 'shared', pattern: 'shared/**' },
        { type: 'core', pattern: 'core/**' },
      ],
    },
    rules: {
      // 2025-2026 Must-have
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': 'error',

      // Error Masking Prevention (NaN -> 0)
      'no-restricted-globals': ['error', 'isNaN', 'isFinite'],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      // Async/Promises
      'promise/always-return': 'error',
      'promise/no-return-wrap': 'error',
      'promise/catch-or-return': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],

      // Typescript Quality
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': 'off', // handled by unused-imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // Prettier Integration
      'prettier/prettier': 'error',

      // --- Playwright Rules (Golden Standards) ---
      'playwright/no-wait-for-timeout': 'error',
      'playwright/prefer-to-be': 'error',
      'playwright/prefer-to-have-count': 'error',
      'playwright/prefer-to-have-length': 'error',
      'playwright/valid-expect': 'error',
      'playwright/no-force-option': 'warn',
      'playwright/no-skipped-test': 'warn',
      'playwright/no-useless-not': 'error',
      'playwright/prefer-to-contain': 'error',
      'playwright/no-focused-test': 'error',

      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      // Perfectionist (Sortings)
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          groups: [
            'side-effect',
            ['builtin', 'external'],
            'internal',
            ['parent', 'sibling', 'index'],
            'unknown',
          ],
        },
      ],
      'perfectionist/sort-objects': ['error', { type: 'alphabetical', order: 'asc' }],

      // React / Next
      ...reactHooks.configs.recommended.rules,
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/jsx-no-target-blank': 'error',
      'react/no-unescaped-entities': 'error',
    },
  },

  // --- LAYER: CORE (The Strict One) ---
  {
    files: ['core/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'BinaryExpression[operator="||"][right.value=0]',
          message:
            'Error Masking: Do not use || 0 for numeric fallbacks in CORE. Use nullish coalescing or explicit validation.',
        },
        {
          selector: 'ConditionalExpression[test.callee.name="isNaN"]',
          message:
            'Error Masking: Avoid isNaN ? 0 : x. Use Number.isFinite() and handle errors at the source.',
        },
      ],
      '@typescript-eslint/no-magic-numbers': [
        'warn',
        { ignore: [0, 1, -1, 100, 0.5, 0.1, 2, 10], ignoreEnums: true },
      ],
      'sonarjs/cognitive-complexity': ['error', 15],
    },
  },

  // --- LAYER: SHARED (Strict) ---
  {
    files: ['shared/**'],
    rules: {
      'sonarjs/cognitive-complexity': ['warn', 20],
    },
  },

  // --- LAYER: FEATURES & APP (Softer) ---
  {
    files: ['features/**', 'app/**'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 25],
    },
  },

  // --- TESTS ---
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'security/detect-non-literal-fs-filename': 'off',
    },
  },

  // --- PRETTIER (Must be last) ---
  prettierConfig,
)
