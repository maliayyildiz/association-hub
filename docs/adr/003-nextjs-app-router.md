# ADR-003: Next.js App Router + React Server Components

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §5.2, CLAUDE.md §2, §3.3 |

## Bağlam
Public siteler hızlı (Lighthouse ≥ 90), önbelleklenebilir ve host bazlı çok kiracılı olmalı; Payload 3 Next.js içinde çalışır.

## Karar
Next.js App Router kullanılır. Public sayfalar RSC + ISR + `revalidateTag` ile sunulur; kiracı çözümleme `middleware.ts` ile yapılır. Taşınabilirlik için `output: 'standalone'` kullanılır. Pages Router ve ayrı Express/Fastify sunucusu kullanılmaz.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| Next.js App Router | Payload'ın yerlisi, RSC, middleware, ISR | Sık sürüm değişimi | ✓ |
| Remix / Astro | İyi performans | Payload entegrasyonu yok, ikinci uygulama | ✗ |

## Sonuçlar
- Varsayılan bileşen Server Component'tir; `'use client'` yalnızca yaprak bileşenlerde.
- Büyük Next.js sürümleri Renovate + E2E ile planlı sprintlerde alınır.
