# ADR-013: Arka plan işleri – Payload Jobs Queue + cron

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §11, CLAUDE.md §2, §9 |

## Bağlam
Görsel/PDF işleme, e-posta, indeksleme, retention ve export istek döngüsünde yapılamaz; ek kuyruk altyapısı istenmiyor.

## Karar
Payload Jobs Queue (Postgres tabloları) kullanılır; Vercel Cron dakikada bir job runner endpoint'ini tetikler. Job adları `modül.eylem` biçimindedir. Yük artarsa aynı kod ayrı bir Node worker sürecinde (`payload jobs:run`) çalıştırılır.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| Payload Jobs | Ek altyapı yok, Postgres'te | Throughput sınırlı | ✓ |
| BullMQ | Güçlü | Redis + worker süreci | ✗ |
| Inngest/Temporal | Gelişmiş | Ek servis, maliyet | ✗ |

## Sonuçlar
- Job'lar idempotent ve yeniden denenebilir (3x, üstel bekleme) yazılır.
