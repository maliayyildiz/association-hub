# ADR-011: Arama – MVP Postgres FTS, Faz 2 Meilisearch

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §9, CLAUDE.md §2 |

## Bağlam
Kiracı içi arama ≤ 300 ms olmalı; TR/FR aksan ve yazım toleransı gerekli. Ek servis MVP'de operasyon yükü getirir.

## Karar
MVP'de `search_documents` tablosu + `tsvector` (`turkish`/`french`) + `unaccent` + `pg_trgm` + GIN indeksleri kullanılır. Faz 2'de relevans veya portal araması ihtiyacı doğarsa Meilisearch'e (tek index, `tenant_id` filtresi + tenant token) geçilir.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| Postgres FTS | Ek servis yok | Sınırlı relevans | ✓ (MVP) |
| Meilisearch | Typo toleransı | Ek servis | ✓ (Faz 2) |
| Algolia/Elasticsearch | Güçlü | Maliyet, AB dışı/ağır | ✗ |

## Sonuçlar
- İndeksleme istek döngüsü dışında, `search.index` job'u ile yapılır.
