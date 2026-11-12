import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // Test-only values so modules importing '@/env' can load.
    env: {
      DATABASE_URL: 'postgres://dernekhub:dernekhub@localhost:5432/dernekhub_test',
      PAYLOAD_SECRET: 'test-only-secret-0000000000000000000000',
      ROOT_DOMAIN: 'dernekhub.localhost',
      LOG_LEVEL: 'fatal',
    },
    include: ['tests/unit/**/*.test.ts'],
  },
})
