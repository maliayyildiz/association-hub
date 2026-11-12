# ADR-006: Paylaşımlı veritabanı, tenant sütunu (pool model)

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §6.1, §23, PRD §7.2, CLAUDE.md §4 |

## Bağlam
50–500 kiracı; her kiracının veri hacmi küçük. Kiracı başına DB/şema migrasyon, bağlantı ve maliyet yükü getirir.

## Karar
Tüm kiracılar tek veritabanı ve tek şemayı paylaşır; kiracıya ait her tablo zorunlu, indeksli bir `tenant` sütunu taşır. Platform koleksiyonları (`tenants`, `plans`, `users`, global ayarlar) açıkça "platform" olarak işaretlenir.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| Pool model (tenant sütunu) | Basit, ucuz, tek migrasyon | İzolasyon uygulama disiplinine bağlı | ✓ |
| Kiracı başına şema | Daha güçlü izolasyon | 500 şemada migrasyon yükü | ✗ |
| Kiracı başına DB | En güçlü izolasyon | Maliyet, bağlantı yönetimi | ✗ |

## Sonuçlar
- İzolasyon riski ADR-007'deki çok katmanlı önlemlerle yönetilir.
- Her koleksiyonda `tenant` + sık filtrelenen alanlar için bileşik index zorunludur.
