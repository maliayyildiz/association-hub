# ADR-005: PostgreSQL + Payload Postgres adaptörü (Drizzle)

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §5.4, CLAUDE.md §2, §6 |

## Bağlam
Model ilişkisel (kiracı → içerik → kategori/etiket); FTS, JSONB, RLS ve tablo tabanlı kuyruk ihtiyacı var.

## Karar
Tek veritabanı PostgreSQL'dir; `@payloadcms/db-postgres` kullanılır. Ham SQL gerekirse yalnızca parametreli Drizzle (`payload.db.drizzle`) ile yazılır. Şema değişiklikleri `payload migrate:create` ile üretilen, repoda versiyonlanan migrasyonlarla yapılır; prod'da `push: true` kapalıdır. Yönetilen sağlayıcı Neon (AB).

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| PostgreSQL (Neon) | RLS, FTS, JSONB, PITR, PR başı DB dalı | — | ✓ |
| MongoDB | Esnek şema | İlişkisel model ve RLS yok | ✗ |
| Prisma/TypeORM | Popüler | Payload adaptörüyle çakışır, ikinci ORM | ✗ |

## Sonuçlar
- Migrasyonlar expand → migrate → contract düzenini izler (CLAUDE.md §6).
