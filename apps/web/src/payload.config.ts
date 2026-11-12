import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import { tr } from '@payloadcms/translations/languages/tr'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Users } from '@/collections/users'
import { env } from '@/env'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  secret: env.PAYLOAD_SECRET,
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
  },
  collections: [Users],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: env.DATABASE_URL },
    // Schema changes only through committed migrations (CLAUDE.md §6).
    push: false,
    migrationDir: path.resolve(dirname, '../migrations'),
  }),
  // Content locales: FR default, TR and EN in MVP; DE/NL in phase 2 (PRD US-10.1).
  localization: {
    locales: ['fr', 'tr', 'en'],
    defaultLocale: 'fr',
    fallback: false,
  },
  i18n: {
    supportedLanguages: { fr, tr, en },
    fallbackLanguage: 'fr',
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  sharp,
})
