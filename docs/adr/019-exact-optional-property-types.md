# ADR-019: exactOptionalPropertyTypes ayarı

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-12 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | CLAUDE.md §5.1 |

## Bağlam
CLAUDE.md §5.1 `exactOptionalPropertyTypes: true` ayarını önerir (SHOULD). Ayarın H1'de Payload'ın ürettiği tiplerle uyumunun denenmesini ve kararın bu ADR'ye yazılmasını ister.

## Karar
`exactOptionalPropertyTypes: true` **açık kalır** (`packages/config/tsconfig.base.json`). Bu karar sonradan değiştirilmez.

## Deneme sonucu (H1, 2026-11-12)
Ortam: Payload 3.93.0, Next.js 16.4.6, TypeScript 6.0.3, `@payloadcms/db-postgres` 3.93.0.

| Kontrol | Sonuç |
|---|---|
| `pnpm payload generate:types` → `payload-types.ts` | Üretildi |
| `tsc --noEmit` (uygulama + üretilen tipler + admin rotaları) | Hatasız |
| `next build` (TypeScript adımı dahil) | Başarılı |

Payload kaynaklı hiçbir çakışma çıkmadı. Tek düzeltme kendi test kodumuzda gerekti: test kullanıcısı nesnesine zorunlu alanlar eklendi.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| Açık | `undefined` ile eksik alan ayrımı, daha güvenli | Test nesnelerinde biraz daha yazım | ✓ |
| Kapalı | Daha az yazım | Daha gevşek tipler | ✗ |

## Durum notları
- 2026-11-12: Öneri olarak açıldı; aynı gün H1 denemesi sonrası kabul edildi.
