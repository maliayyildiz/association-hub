# ADR-020: Kiracı çözümleme önbelleği – Upstash Redis (Edge Config yerine)

| Alan | Değer |
|---|---|
| Durum | Önerildi |
| Tarih | 2026-11-12 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | ADR-008, ADR-018, SAD §6.2, §7, §12, CLAUDE.md §2 |

## Bağlam
SAD §6.2, §7, §12 ve ADR-008, `hostname → tenantId` eşlemesi ve tema özeti önbelleği için "Vercel Edge Config (veya Upstash Redis)" diyor. CLAUDE.md §2 kilitli yığınında KV için yalnızca **Upstash Redis** var, Edge Config listede yok. Bu nedenle Edge Config kullanmak §2'yi ihlal eder.

## Karar
Kiracı çözümleme ve tema özeti önbelleği **Upstash Redis (eu-central)** ile yapılır. Anahtarlar `tenant:host:{hostname}` → `{tenantId, status, defaultLocale, locales}` ve `tenant:{id}:theme-summary` biçimindedir. Domain, tema veya kiracı durumu değiştiğinde Payload hook'u ilgili anahtarı yazar ya da siler. Önbellekte kayıt yoksa middleware tek bir dahili çözümleme fonksiyonuna düşer ve sonucu kısa TTL ile önbelleğe yazar.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| Upstash Redis | Zaten yığında (rate limit), AB bölgesi, Vercel dışına taşınabilir | Edge'den ağ çağrısı (birkaç ms) | ✓ |
| Vercel Edge Config | En düşük gecikme | Yığın dışı, Vercel lock-in (ADR-012 ile çelişir), yazma limitleri | ✗ |
| Her istekte DB | Basit | Gecikme, Neon bağlantı yükü | ✗ |

## Sonuçlar
- Yeni bağımlılık eklenmez; CLAUDE.md §2 değişmez.
- SAD §1, §6.2, §7 ve §12'deki "Edge Config" ifadeleri bu ADR'ye referansla güncellenir.
