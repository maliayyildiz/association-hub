# ADR-009: Tailwind v4 + CSS değişkenleriyle tema token'ları

| Alan | Değer |
|---|---|
| Durum | Kabul |
| Tarih | 2026-11-04 |
| Karar veren | Platform sahibi / Mimar |
| İlgili | SAD §5.5, §6.4, CLAUDE.md §5.4 |

## Bağlam
Tek şablon, her derneğe kendi renk/font/köşe yarıçapı. CSS'i kiracı başına derlemek ölçeklenmez.

## Karar
Tailwind CSS v4 (CSS-first config) + shadcn/ui (`packages/ui`) + lucide-react kullanılır. Kiracı teması `branding` modülünde CSS değişkenlerine dönüştürülür ve layout'ta tek `<style>` olarak enjekte edilir. Şablon bileşenleri yalnızca token sınıflarını kullanır; sabit HEX ve inline style yasaktır (tek istisna: token enjeksiyonu yapılan layout). Fontlar `next/font/local` ile self-host edilir.

## Değerlendirilen seçenekler
| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| Tailwind v4 + CSS değişkenleri | Derleme yok, tek CSS | — | ✓ |
| CSS-in-JS (styled-components) | Dinamik tema | RSC uyumsuz, istemci JS | ✗ |
| MUI/Chakra | Hazır bileşen | Ağır, tema kısıtları | ✗ |

## Sonuçlar
- Tema değişince `revalidateTag('tenant:{id}:theme')`. WCAG AA kontrast kontrolü `branding` modülünde yapılır.
