# ADR-002: Modüler monolit, tek deploy

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §3, CLAUDE.md §0.3, §3.1 |

## Bağlam
50–500 dernek, küçük ekip. Mikroservislerin operasyon ve dağıtık hata ayıklama maliyeti ekip kapasitesini aşar.

## Karar
Uygulama tek bir Next.js + Payload uygulamasıdır (`apps/web`). İç sınırlar `src/modules/<modül>/` ile çizilir (`tenancy, identity, branding, content, media, search, engagement, portal, platform, compliance, notifications`). Modüller birbirine yalnızca `index.ts` üzerinden erişir; döngüsel bağımlılık `dependency-cruiser` ile CI'da engellenir.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| Mikroservisler | Bağımsız ölçekleme | Ağır operasyon, maliyet | ✗ |
| Headless CMS + ayrı frontend | Ayrık deploy | İki deploy, iki auth, API sözleşmesi | ✗ |
| Modüler monolit | Tek deploy, ortak tipler, Local API | Tek uygulama büyür → modül sınırları | ✓ |

## Sonuçlar
- Bir parçanın ayrılması ancak ölçülmüş yük (arama, görsel işleme, portal trafiği) ile ve yeni ADR ile mümkündür.
