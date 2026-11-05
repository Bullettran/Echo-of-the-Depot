import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/Echo-of-the-Depot/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
