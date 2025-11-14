import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        // Enable single fork mode to improve jsdom 27.x compatibility in CI environments.
        // This prevents "Cannot read properties of undefined" errors when running tests
        // in GitHub Actions. See: https://github.com/vitest-dev/vitest/issues/4043
        singleFork: true,
      },
    },
  },
})
