import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'
import { isSuperAdmin, isSuperAdminOrSelf } from '@/access'
import type { User } from '@/payload-types'

type TestUser = Pick<User, 'id' | 'isSuperAdmin'>

// Access helpers only read req.user, so a minimal request object is enough.
function requestFor(user: TestUser | null): PayloadRequest {
  const now = new Date().toISOString()
  const req: Pick<PayloadRequest, 'user'> = {
    user:
      user === null
        ? null
        : {
            ...user,
            collection: 'users',
            email: 'user@example.test',
            createdAt: now,
            updatedAt: now,
          },
  }
  return req as PayloadRequest
}

describe('isSuperAdmin', () => {
  it('allows a super admin', () => {
    expect(isSuperAdmin({ req: requestFor({ id: 1, isSuperAdmin: true }) })).toBe(true)
  })

  it('denies a regular user', () => {
    expect(isSuperAdmin({ req: requestFor({ id: 2, isSuperAdmin: false }) })).toBe(false)
  })

  it('denies an anonymous request', () => {
    expect(isSuperAdmin({ req: requestFor(null) })).toBe(false)
  })
})

describe('isSuperAdminOrSelf', () => {
  it('gives a super admin unrestricted access', () => {
    expect(isSuperAdminOrSelf({ req: requestFor({ id: 1, isSuperAdmin: true }) })).toBe(true)
  })

  it('restricts a regular user to their own record', () => {
    expect(isSuperAdminOrSelf({ req: requestFor({ id: 7, isSuperAdmin: false }) })).toEqual({
      id: { equals: 7 },
    })
  })

  it('denies an anonymous request', () => {
    expect(isSuperAdminOrSelf({ req: requestFor(null) })).toBe(false)
  })
})
