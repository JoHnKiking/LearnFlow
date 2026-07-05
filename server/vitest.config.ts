import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: 'tests/coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/types/**', 'src/**/*.d.ts'],
      thresholds: {
        lines: 80,
        functions: 85,
        branches: 75,
        statements: 80,
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
