# ADR-007: Kiracı izolasyonu – access control + tek veri erişim modülü + CI testleri; RLS Faz 1.5

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §6.3, CLAUDE.md §0.1, §4, §11 |

## Bağlam
Pool modelde (ADR-006) bir kiracının diğerinin verisini görmesi en yüksek etkili risktir.

## Karar
Savunma derinliği uygulanır:
1. Payload access control (`plugin-multi-tenant` + merkezi `src/access/` yardımcıları).
2. Public okuma yalnızca `modules/*/queries.ts` üzerinden; ilk parametre `tenantId`; public kodda doğrudan `payload.find` lint ile yasak.
3. Postgres RLS: Faz 1.5'te public okuma yolu için ayrı DB rolü + `SET LOCAL app.tenant_id`.
4. Depolama anahtarları `tenants/{tenantId}/...`.
5. Önbellek etiketleri `tenant:{id}:...`.
6. CI'da zorunlu izolasyon test paketi (`tests/isolation/`): kırmızıysa merge yok.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| Yalnızca uygulama katmanı | Basit | Tek hata = sızıntı | ✗ |
| MVP'den itibaren tam RLS | En güçlü | Payload bağlantı yönetimiyle karmaşık | ✗ (Faz 1.5'e ertelendi) |
| Katmanlı + CI testleri, RLS Faz 1.5 | Dengeli | RLS gelene kadar test disiplini şart | ✓ |

## Sonuçlar
- Yeni koleksiyon/endpoint = izolasyon paketine ekleme zorunlu.
