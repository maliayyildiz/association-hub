import type { CollectionConfig } from 'payload'
import { isSuperAdmin, isSuperAdminOrSelf } from '@/access'

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000

// Platform collection: not tenant-scoped (CLAUDE.md §4). Tenant roles live in
// `memberships` (H2).
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    // US-02.2: lock for 15 minutes after 5 failed attempts.
    maxLoginAttempts: 5,
    lockTime: FIFTEEN_MINUTES_MS,
  },
  access: {
    create: isSuperAdmin,
    read: isSuperAdminOrSelf,
    update: isSuperAdminOrSelf,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'isSuperAdmin',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      access: {
        create: isSuperAdmin,
        update: isSuperAdmin,
      },
    },
  ],
}
