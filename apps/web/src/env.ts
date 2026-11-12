import { z } from 'zod'

// Single source of truth for environment variables (CLAUDE.md §5.1).
// Do not read process.env anywhere else.
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  PAYLOAD_SECRET: z.string().min(32),
  ROOT_DOMAIN: z.string().min(1),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
})

export type Env = z.infer<typeof envSchema>

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source)
  if (!result.success) {
    // Only variable names are reported, never values.
    const invalid = result.error.issues.map((issue) => issue.path.join('.')).join(', ')
    throw new Error(`Invalid environment variables: ${invalid}`)
  }
  return result.data
}

export const env: Env = parseEnv(process.env)
