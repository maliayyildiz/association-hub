# ADR-016: Monorepo – pnpm + Turborepo; lint/format – Biome

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §14, §15, CLAUDE.md §2 |

## Bağlam
Tek uygulama + paylaşılan paketler (`ui`, `email`, `theme`, `config`, `shared`); hızlı CI ve tek lint aracı isteniyor.

## Karar
pnpm workspace + Turborepo kullanılır; lint ve format tek araçla, Biome ile yapılır. Sürümler `pnpm-lock.yaml` ile sabitlenir, güncellemeler Renovate ile gelir. Conventional Commits + changesets kullanılır.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| pnpm + Turborepo + Biome | Hızlı, disk verimli, tek lint aracı | Biome'da tip-farkındalıklı kural az | ✓ |
| npm/yarn, Nx/Lerna | — | Daha yavaş / daha ağır | ✗ |
| ESLint + Prettier | Zengin kural seti | İki araç, yavaş | ✗ |
