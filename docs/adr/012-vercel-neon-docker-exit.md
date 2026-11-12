# ADR-012: Barındırma – Vercel + Neon; Docker çıkış planı her sürümde doğrulanır

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §18, §24, CLAUDE.md §2 |

## Bağlam
Küçük ekip sunucu yönetmemeli; kişisel veri AB'de kalmalı; vendor lock-in riski yönetilmeli.

## Karar
MVP ve ilk yıl Vercel (fra1) + Neon (aws-eu-central-1) + Cloudflare kullanılır (Seçenek A). Next.js `standalone` Docker imajı CI'da her sürümde üretilir ve smoke test edilir. Aylık maliyet ~300 €'yu aşarsa veya veri egemenliği şartı gelirse Hetzner + Coolify/Caddy'ye (Seçenek B) geçilir.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| A: Vercel + Neon | Sıfır operasyon, PR başı preview + DB dalı | Maliyet artışı, lock-in | ✓ |
| B: Hetzner + Coolify | %100 AB, ucuz | Operasyon yükü ekipte | Çıkış planı |

## Sonuçlar
- Vendor'a özel API'ler ince adaptörlerde tutulur.
