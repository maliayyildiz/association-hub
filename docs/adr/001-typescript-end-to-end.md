# ADR-001: Uçtan uca TypeScript

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §5.1, CLAUDE.md §2, §5.1 |

## Bağlam
1–3 kişilik ekip; frontend, backend, script, test ve altyapı kodu yazılacak. Bağlam değiştirme ve tip uyumsuzlukları bakım maliyetini artırır.

## Karar
Tüm kod TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`) ile yazılır. `.js` yalnızca araçların zorunlu kıldığı config dosyalarında kabul edilir. Dış girdiler Zod ile doğrulanır; Payload tipleri `payload generate:types` ile üretilir.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| TypeScript her yerde | Tek dil, paylaşılan tipler, kolay işe alım | Derleme adımı | ✓ |
| TS frontend + Python/PHP backend | Olgun backend ekosistemleri | İki dil, tip senkronu yok | ✗ |

## Sonuçlar
- Payload şeması → tipler → frontend zinciri derleme zamanında kırılır, çalışma zamanında değil.
- `any`, `@ts-ignore`, `as unknown as` yasaktır (CLAUDE.md §5.1).
