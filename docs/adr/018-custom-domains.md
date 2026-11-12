# ADR-018: Özel domain – Vercel Domains API (alternatif Cloudflare for SaaS)

| Alan | Değer |
|---|---|
| Durum | Önerildi (Faz 2) |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §12, PRD E13, ADR-020 |

## Bağlam
Faz 2'de dernekler kendi domainlerini (ör. `www.dernek-a.fr`) bağlamak istiyor; SSL otomatik olmalı.

## Karar (öneri)
Panelden girilen domain Vercel Domains API ile projeye eklenir ve kullanıcıya DNS talimatı gösterilir. `domains.verify` job'u durumu sorgular; domain doğrulanınca kiracı çözümleme önbelleği (ADR-020) güncellenir. SSL Vercel tarafından otomatik sağlanır. Çıkış alternatifi Cloudflare for SaaS veya Caddy on-demand TLS'tir.

## Durum notları
- Faz 2 başlamadan önce kabul edilmelidir. MVP'de yalnızca `*.dernekhub.org` wildcard alt alan adları kullanılır.
