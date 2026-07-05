import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      // smoke.test.ts is a standalone Node.js script, not a vitest suite
      '**/src/tests/smoke.test.ts',
    ],
  },
});
