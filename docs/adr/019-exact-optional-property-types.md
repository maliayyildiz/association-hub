# ADR-019: exactOptionalPropertyTypes ayarı

| Alan | Değer |
|---|---|
| Durum | Önerildi (H1'de karara bağlanacak) |
| Tarih | 2026-11-12 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | CLAUDE.md §5.1 |

## Bağlam
CLAUDE.md §5.1 `exactOptionalPropertyTypes: true` ayarını önerir (SHOULD). Ayarın H1'de Payload'ın ürettiği tiplerle uyumunun denenmesini ve çakışma varsa kararın bu ADR'ye yazılmasını ister.

## Karar
H1 iskeletinde ayar **açık** başlatılır. `payload generate:types` çıktısı ve Payload/Next.js API'leri ile `tsc --noEmit` yeşil kalırsa ayar kalıcı olarak açık kalır. `payload-types.ts` kaynaklı, çözülemeyen hatalar çıkarsa kapatılır. Sonuç bu dosyaya yazılır ve sonrasında değiştirilmez.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| Açık | `undefined` ile eksik alan ayrımı, daha güvenli | Üretilen tiplerle çakışma riski | Varsayılan |
| Kapalı | Sorunsuz uyum | Daha gevşek tipler | Çakışma olursa |

## Durum notları
- 2026-11-12: Öneri olarak açıldı; H1 sonucu bekleniyor.
