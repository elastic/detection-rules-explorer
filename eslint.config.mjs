import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat();

export default tseslint.config(
  {
    // Flat config replaces .eslintignore.
    ignores: [
      'node_modules/**',
      '.next/**',
      '.prebuild/**',
      'out/**',
      'src/data/**',
      'next-env.d.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // `next/core-web-vitals` still ships as eslintrc-style config, so it is
  // bridged with FlatCompat. This also supplies the react-hooks and jsx-a11y
  // plugins the rules below rely on.
  ...compat.extends('next/core-web-vitals'),

  // Must come after everything that could conflict: it turns off stylistic
  // rules and enables prettier/prettier.
  prettierRecommended,

  {
    rules: {
      // In an ideal world, we'd never have to use @ts-ignore, but that's not
      // possible right now.
      '@typescript-eslint/ban-ts-comment': 'off',
      // Again, in theory this is a good rule, but it can cause a bit of
      // unhelpful noise.
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Another theoretically good rule, but sometimes we know better than
      // the linter.
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Allow unused args that start with _ (e.g. in type definitions)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Accessibility is important to EUI. Enforce all a11y rules.
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/media-has-caption': 'error',
      'jsx-a11y/mouse-events-have-key-events': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-distracting-elements': 'error',
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',
      'jsx-a11y/label-has-associated-control': 'error',

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      'react/no-unknown-property': ['error', { ignore: ['css'] }],

      'prefer-object-spread': 'error',
      // Use template strings instead of string concatenation
      'prefer-template': 'error',
    },
  },

  {
    // next.config.js and the Node-only scripts are CommonJS.
    files: ['next.config.js'],
    languageOptions: { sourceType: 'script' },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
    },
  }
);
