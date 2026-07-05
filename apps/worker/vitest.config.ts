import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // smoke.test.ts uses its own custom runner (not vitest format) — exclude it
    exclude: ['**/node_modules/**', 'src/tests/smoke.test.ts'],
  },
});
