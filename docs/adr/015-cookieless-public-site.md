# ADR-015: Çerezsiz public site (Plausible, self-host fontlar, OSM)

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §5.5, PRD §14 PRV-02/03, CLAUDE.md §8 |

## Bağlam
Dernek siteleri GDPR/KVKK kapsamında; çerez bandı hem UX hem uyum yükü getirir.

## Karar
Public site varsayılan olarak çerezsizdir: analitik Plausible (AB, çerezsiz), fontlar `next/font/local`, harita MapLibre + OSM/MapTiler. YouTube/Vimeo/Google Maps embed'leri yalnızca `<ConsentEmbed>` arkasında yüklenir (YouTube için `youtube-nocookie.com`). Google Analytics, Meta Pixel, Google Fonts CDN ve reCAPTCHA yasaktır; captcha olarak Cloudflare Turnstile kullanılır.

## Sonuçlar
- Zorunlu çerez yalnızca panel oturumudur.
