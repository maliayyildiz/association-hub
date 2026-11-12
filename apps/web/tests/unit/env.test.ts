import { describe, expect, it } from 'vitest'
import { envSchema } from '@/env'

const valid = {
  DATABASE_URL: 'postgres://u:p@localhost:5432/db',
  PAYLOAD_SECRET: 'x'.repeat(32),
  ROOT_DOMAIN: 'dernekhub.localhost',
}

describe('envSchema', () => {
  it('accepts a valid environment and applies defaults', () => {
    const env = envSchema.parse(valid)
    expect(env.LOG_LEVEL).toBe('info')
    expect(env.NODE_ENV).toBe('development')
  })

  it('rejects a PAYLOAD_SECRET shorter than 32 characters', () => {
    const result = envSchema.safeParse({ ...valid, PAYLOAD_SECRET: 'short' })
    expect(result.success).toBe(false)
  })

  it('rejects a non-postgres DATABASE_URL', () => {
    const result = envSchema.safeParse({ ...valid, DATABASE_URL: 'mysql://localhost/db' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing ROOT_DOMAIN', () => {
    const { ROOT_DOMAIN: _omitted, ...rest } = valid
    expect(envSchema.safeParse(rest).success).toBe(false)
  })
})
