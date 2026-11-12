# ADR-021: Faz 2/3 dış servisleri (Brevo, DeepL, Stripe, HelloAsso)

| Alan | Değer |
|---|---|
| Durum | Önerildi |
| Tarih | 2026-11-12 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §1, §5.7, §13, §22; PRD E19, E20; CLAUDE.md §2, §8 |

## Bağlam
SAD'de Faz 2/3 için Brevo (bülten), DeepL (makine çevirisi), Stripe (abonelik) ve HelloAsso (bağış) geçiyor. Bu servisler CLAUDE.md §2 kilitli yığınında yok. Ayrıca CLAUDE.md §8, kişisel veri işleyen her yeni servis için ADR ister.

## Karar
Bu servisler **aday** statüsündedir. MVP'de hiçbiri kod, bağımlılık veya env değişkeni olarak eklenmez. İlgili faz başlamadan önce her biri için ayrı bir ADR (DPA/SCC durumu, AB bölgesi, maliyet, adaptör arayüzü) yazılır. ADR onaylanınca servis CLAUDE.md §2'ye eklenir.

## Sonuçlar
- SAD'deki bu servis adları "aday (ADR bekliyor)" olarak işaretlenir.
- Entegrasyonlar ince adaptör arayüzleri arkasında tasarlanır (SAD AP-8).
