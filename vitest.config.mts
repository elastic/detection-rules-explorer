import { defineConfig } from 'vitest/config';

export default defineConfig({
  // The app uses Emotion's `css` prop, so JSX must compile to Emotion's
  // runtime rather than React's. Mirrors `jsxImportSource` in tsconfig.json.
  // Vitest 4 transforms with oxc, not esbuild -- esbuild options are ignored.
  oxc: {
    jsx: {
      runtime: 'automatic',
      importSource: '@emotion/react',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.mts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
    // Globals are imported explicitly in each test file, so `tsc --noEmit`
    // needs no extra `types` entry.
    globals: false,
  },
});
