import type { PayloadRequest, Where } from 'payload'

type AccessArgs = { req: PayloadRequest }

export function isSuperAdmin({ req }: AccessArgs): boolean {
  return req.user?.isSuperAdmin === true
}

// Super admins see everything; other authenticated users only their own record.
export function isSuperAdminOrSelf({ req }: AccessArgs): boolean | Where {
  if (!req.user) return false
  if (req.user.isSuperAdmin === true) return true
  return { id: { equals: req.user.id } }
}
