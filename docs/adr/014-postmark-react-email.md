# ADR-014: E-posta – Postmark + React Email

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §5.7, CLAUDE.md §2, ADR-021 |

## Bağlam
Davet, magic link, şifre sıfırlama ve bildirim e-postalarının teslim edilebilirliği kritik.

## Karar
Transactional e-posta Postmark ile (ayrı message stream'ler, bounce webhook'u) gönderilir. Şablonlar `packages/email` içinde React Email ile TR/FR/EN ve dernek markalı yazılır. Postmark ABD şirketi olduğundan DPA + SCC ile kullanılır. Yerelde Mailpit kullanılır. Bülten servisi (Brevo) bu ADR'nin kapsamında değildir (bkz. ADR-021).

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| Postmark | En iyi teslim edilebilirlik | ABD (SCC gerekli) | ✓ |
| SendGrid | Yaygın | Teslim edilebilirlik sorunları | ✗ |
| Nodemailer + SMTP | Ücretsiz | Teslim/itibar yönetimi bizde | ✗ |
