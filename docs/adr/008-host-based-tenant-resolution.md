# ADR-008: Host tabanlı kiracı çözümleme

| Alan | Değer |
|---|---|
| Durum | Kabul (önbellek kısmı ADR-020 ile netleştirildi) |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §6.2, CLAUDE.md §4, ADR-020 |

## Bağlam
Her dernek kendi alt alan adı (`{slug}.dernekhub.org`) veya özel domaini ile erişilir. Kiracı kimliği istemciden alınamaz.

## Karar
`middleware.ts` Host başlığından `tenantId` ve `locale`'i çözer ve isteği `/_sites/[tenant]/[locale]/...` rotasına yeniden yazar. Kiracı kimliği asla query string veya body'den okunmaz. Middleware'de DB sorgusu yapılmaması için `hostname → tenantId` eşlemesi önbelleğe alınır.

Orijinal metinde önbellek "Vercel Edge Config (veya Upstash Redis)" olarak geçiyordu. Edge Config, CLAUDE.md §2 kilitli yığında yer almadığından önbellek **ADR-020** ile Upstash Redis olarak netleştirildi.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| Host tabanlı | Özel domainle uyumlu, SEO dostu | Middleware karmaşıklığı | ✓ |
| Path tabanlı (`/d/{slug}`) | Basit | Özel domain ve marka deneyimi zayıf | ✗ |

## Sonuçlar
- Askıdaki kiracı `/_suspended`, bilinmeyen host `/_not-found` rotasına yönlenir.
