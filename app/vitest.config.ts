import { defineConfig } from 'vitest/config'

// Tests target the pure data layer only — no plugins needed (avoids the
// vite/vitest bundled-vite type clash), node environment.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
