# ADR-004: Payload CMS 3 (Next.js içinde) admin ve backend olarak

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §5.3, §23, CLAUDE.md §2 |

## Bağlam
PRD admin gereksinimleri (rol/yetki, taslak/yayın/zamanlama, sürüm, blok editör, medya, i18n, auth) sıfırdan yazılırsa MVP aylarca gecikir.

## Karar
Payload CMS 3, Next.js uygulamasının içine gömülü olarak admin paneli, auth, medya, versiyonlama ve API katmanı olarak kullanılır. Çok kiracılık için `@payloadcms/plugin-multi-tenant`; SEO, redirects, nested-docs ve search eklentileri kullanılır. İş mantığı Payload'dan bağımsız servis fonksiyonlarında tutulur.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| Payload 3 | MIT, kendi DB'mizde, kod-öncelikli config, Next.js içinde | Görece genç ekosistem | ✓ |
| Strapi v5 | Olgun | Ayrı backend, resmi multi-tenancy yok | ✗ |
| Directus | Güçlü | BSL lisans, ayrı servis | ✗ |
| SaaS CMS | Bakım yok | Veri dışarıda, GDPR, kiracı başı maliyet | ✗ |
| WordPress Multisite | Hızlı başlangıç | PHP, eklenti/güvenlik yükü | ✗ |

## Sonuçlar
- Çıkış planı: veri Postgres'te, iş mantığı `modules/` içinde; eklenti yetersiz kalırsa kendi `tenant` alanı + access fonksiyonları ile değiştirilir.
