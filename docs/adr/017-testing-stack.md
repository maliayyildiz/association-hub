# ADR-017: Test – Vitest + Testcontainers + Playwright; izolasyon testleri merge şartı

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §16, CLAUDE.md §11 |

## Bağlam
Kiracı izolasyonu ve iş kuralları otomatik olarak kanıtlanmalı; DB mock'lamak izolasyon hatalarını gizler.

## Karar
Birim/entegrasyon testleri Vitest ile yazılır; entegrasyon testleri Testcontainers ile gerçek Postgres'e karşı çalışır (DB mock'lanmaz). E2E/API/görsel testler Playwright, a11y testleri `@axe-core/playwright`, performans testleri Lighthouse CI + k6 (`perf/k6/`) ile yapılır. İzolasyon paketi (`tests/isolation/`) kırmızıysa hiçbir şey merge edilmez. Test araçları yalnızca devDependencies, Docker Compose veya `perf/` altında bulunur.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| Vitest + Playwright | Hızlı, TS yerli, tek E2E aracı | — | ✓ |
| Jest / Cypress | Yaygın | Yavaş / çoklu domain kısıtları | ✗ |
