import pino, { type Logger } from 'pino'
import { env } from '@/env'

// Structured JSON logs (SAD §19). Personal data must never be logged in clear
// text (CLAUDE.md §7); these paths are redacted as a safety net.
export const logger: Logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'web' },
  redact: {
    paths: ['email', '*.email', 'password', '*.password', 'token', '*.token', 'ip', '*.ip'],
    censor: '[redacted]',
  },
})

// Every log line carries tenantId when one is known (CLAUDE.md §4).
export function tenantLogger(tenantId: string | number): Logger {
  return logger.child({ tenantId: String(tenantId) })
}
