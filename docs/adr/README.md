# Mimari Karar Kayıtları (ADR)

Süreç: CLAUDE.md §15. Yeni ADR için `000-template.md` kopyalanır, sıradaki numara verilir ve PR olarak sunulur.

| ADR | Karar | Durum |
|---|---|---|
| [001](001-typescript-end-to-end.md) | Uçtan uca TypeScript | Kabul |
| [002](002-modular-monolith.md) | Modüler monolit, tek deploy | Kabul |
| [003](003-nextjs-app-router.md) | Next.js App Router + RSC | Kabul |
| [004](004-payload-cms.md) | Payload CMS 3 (Next.js içinde) | Kabul |
| [005](005-postgresql.md) | PostgreSQL + Payload Postgres adaptörü | Kabul |
| [006](006-shared-db-tenant-column.md) | Paylaşımlı DB, `tenant` sütunu | Kabul |
| [007](007-tenant-isolation-layers.md) | Katmanlı izolasyon; RLS Faz 1.5 | Kabul |
| [008](008-host-based-tenant-resolution.md) | Host tabanlı kiracı çözümleme | Kabul (önbellek → ADR-020) |
| [009](009-tailwind-theme-tokens.md) | Tailwind v4 + tema token'ları | Kabul |
| [010](010-r2-direct-upload.md) | R2 + doğrudan istemci yükleme | Kabul |
| [011](011-search-postgres-fts.md) | Postgres FTS → Faz 2 Meilisearch | Kabul |
| [012](012-vercel-neon-docker-exit.md) | Vercel + Neon; Docker çıkış planı | Kabul |
| [013](013-payload-jobs-queue.md) | Payload Jobs Queue + cron | Kabul |
| [014](014-postmark-react-email.md) | Postmark + React Email | Kabul |
| [015](015-cookieless-public-site.md) | Çerezsiz public site | Kabul |
| [016](016-pnpm-turborepo-biome.md) | pnpm + Turborepo + Biome | Kabul |
| [017](017-testing-stack.md) | Vitest + Testcontainers + Playwright | Kabul |
| [018](018-custom-domains.md) | Özel domain: Vercel Domains API | Önerildi (Faz 2) |
| [019](019-exact-optional-property-types.md) | `exactOptionalPropertyTypes` açık | Kabul |
| [020](020-tenant-cache-upstash.md) | Kiracı önbelleği: Upstash Redis | Önerildi |
| [021](021-later-phase-services.md) | Faz 2/3 servisleri aday statüsünde | Önerildi |

> 001–017 SAD v1.0'da (04.11.2026) "Kabul" olarak listelenmiş kararların kayda geçirilmiş halidir. Platform sahibinin resmi onayı PRD/SAD onayıyla birlikte verilmelidir.
