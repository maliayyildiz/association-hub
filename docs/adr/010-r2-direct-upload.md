# ADR-010: Medya – Cloudflare R2 + doğrudan istemci yükleme

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §5.6, §8, CLAUDE.md §4, §7 |

## Bağlam
Galeri ağırlıklı platform; egress maliyeti ve serverless gövde limitleri (büyük yüklemeler) risk.

## Karar
Medya Cloudflare R2 (EU jurisdiction) üzerinde tutulur; `@payloadcms/storage-s3` + `clientUploads: true` ile tarayıcı presigned URL ile doğrudan R2'ye yükler. Anahtar şeması `tenants/{tenantId}/{media|documents|exports}/...` biçimindedir. Görsel varyantları, EXIF GPS temizliği ve HEIC dönüşümü `media.process` job'unda `sharp` ile yapılır. Yerelde MinIO kullanılır.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| R2 | Egress yok, S3 uyumlu, AB | — | ✓ |
| Vercel Blob | Kolay | Egress maliyeti, lock-in | ✗ |
| Cloudinary | Güçlü dönüşüm | Maliyet, veri dışarıda | ✗ |
| Yerel disk | — | Serverless'ta imkânsız | ✗ |

## Sonuçlar
- Internal belgeler yalnızca ≤ 10 dk geçerli imzalı URL ile servis edilir.
