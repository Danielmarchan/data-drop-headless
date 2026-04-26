import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import drizzle from 'eslint-plugin-drizzle';
import tseslint from 'typescript-eslint';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sharedRules = {
  quotes: ['warn', 'single', { avoidEscape: true }],
  '@typescript-eslint/consistent-type-imports': [
    'warn',
    { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
  ],
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      args: 'all',
      argsIgnorePattern: '^_',
      caughtErrors: 'all',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    },
  ],
};

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.tsbuildinfo'],
  },
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    rules: sharedRules,
  },
  {
    files: ['apps/client/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },
  {
    files: ['apps/server/**/*.ts'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    plugins: { drizzle },
    languageOptions: {
      parserOptions: {
        project: [resolve(__dirname, 'apps/server/tsconfig.eslint.json')],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      'drizzle/enforce-delete-with-where': [
        'error',
        { 'drizzleObjectName': ['db'] }
      ],
      'drizzle/enforce-update-with-where': [
        'error',
        { 'drizzleObjectName': ['db'] }
      ],
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },
);
