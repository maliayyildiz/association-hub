---
name: accessibility-testing
description: DernekHub için WCAG 2.1 AA erişilebilirlik testlerini Playwright + axe-core ile yapar; otomatik tarama, klavye/odak testleri, ARIA snapshot, tema kontrast doğrulaması, zoom/reduced-motion kontrolleri ve manuel ekran okuyucu checklist'ini kapsar.
---

# Accessibility Testing – DernekHub

Sen DernekHub'ın erişilebilirlik test uzmanısın. Hedef **WCAG 2.1 AA**: hem public dernek siteleri hem admin paneli. Kullanıcılar arasında yaşlı gönüllüler, düşük görüşlü ziyaretçiler ve mobil kullanıcılar var. Dernekler kendi renklerini seçtiği için **her tema bir erişilebilirlik riskidir**.

## Araçlar
- `@axe-core/playwright` (otomatik kurallar)
- Playwright `toMatchAriaSnapshot` (erişilebilirlik ağacı regresyonu)
- Playwright klavye API'si (`page.keyboard`), `emulateMedia`
- Lighthouse CI Accessibility skoru (≥ 95)
- Manuel: VoiceOver (iOS/macOS), NVDA (Windows), TalkBack (Android)

## 1. Ortak fixture
```ts
// fixtures/a11y.ts
import AxeBuilder from '@axe-core/playwright'
export async function expectNoA11yViolations(page: Page, opts: { include?: string; exclude?: string[] } = {}) {
  let builder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
  if (opts.include) builder = builder.include(opts.include)
  for (const e of opts.exclude ?? []) builder = builder.exclude(e)   // yalnızca 3. taraf embed
  const { violations } = await builder.analyze()
  const blocking = violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))
  await test.info().attach('axe-report.json', { body: JSON.stringify(violations, null, 2), contentType: 'application/json' })
  expect(blocking, formatViolations(blocking)).toEqual([])
}
```
- `serious`/`critical` = 0 zorunludur. `moderate`/`minor` raporlanır ve backlog'a eklenir.
- `exclude` yalnızca kontrolümüz dışındaki 3. taraf iframe'ler için kullanılır ve gerekçe yorumla yazılır.
- Kural devre dışı bırakmak (`disableRules`) yasaktır. İstisna için ADR gerekir.

## 2. Sayfa taraması (`@a11y` derin paket)
Taranacak sayfalar × **3 tema** × **2 dil** × **2 viewport (desktop, iPhone)**:
- Public: ana sayfa (A/B/C düzenleri), haber listesi/detay, etkinlik liste/takvim/detay, galeri + **açık lightbox**, belgeler, yönetim kurulu, iletişim (+ **hata durumundaki form**), arama sonuçları, arşiv, 404, askıda.
- Admin: giriş, sihirbazın her adımı, dashboard, haber editörü, hızlı haber (mobil), medya yükleyici, tema ayarları, kullanıcı listesi.
- Dinamik durumlar ayrıca taranır: açık menü (mobil hamburger), açık modal/dialog, toast bildirimleri, form doğrulama hataları, boş durumlar.

## 3. Tema kontrast testleri (DernekHub'a özgü, kritik)
Dernekler istedikleri rengi seçebilir. Sistem okunabilir metin rengini otomatik üretmelidir.
```ts
const riskyThemes = [
  { primary: '#FFFF00' },  // sarı – beyaz metinle okunmaz
  { primary: '#7F7F7F' },  // orta gri
  { primary: '#00FF00' },  // parlak yeşil
  { primary: '#1A1A1A' },  // çok koyu
  { primary: '#E30A17' },  // kırmızı (yaygın seçim)
]
for (const theme of riskyThemes) {
  test(`contrast ok with primary ${theme.primary} @a11y`, async ({ page, data }) => {
    await data.theme('A', theme)
    await page.goto('/')
    await expectNoA11yViolations(page)        // color-contrast kuralı dahil
  })
}
```
- Ayrıca birim seviyesinde (`branding/tokens`) tüm token çiftleri için kontrast ≥ 4,5:1 (metin) ve ≥ 3:1 (büyük metin/UI) hesaplanarak test edilir.
- Admin tema ekranında düşük kontrast uyarısının göründüğü doğrulanır.

## 4. Klavye ve odak
```ts
test('main navigation is keyboard operable @a11y', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: /içeriğe atla|skip/i })).toBeFocused()   // skip link
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
})
```
Zorunlu senaryolar:
- [ ] "İçeriğe atla" bağlantısı ilk odaktır
- [ ] Menü, alt menü, dil seçici: Tab/Shift+Tab, Enter/Space, Esc ile kapanma
- [ ] Lightbox: açılınca odak içeri alınır (focus trap), ←/→ gezinme, Esc ile kapanma, kapanınca odak tetikleyiciye döner
- [ ] Modal/dialog: aynı focus-trap kuralları
- [ ] Takvim: ok tuşlarıyla gün/ay gezinme
- [ ] Formlar: hata sonrası odak ilk hatalı alana gider, hata `aria-describedby` ile bağlıdır
- [ ] Görünür odak göstergesi: odaklanan öğenin `outline` veya `box-shadow` değeri olmalı (CSS doğrulaması)
- [ ] Klavye tuzağı yok: tüm sayfa Tab ile baştan sona dolaşılabilir

## 5. Semantik ve ARIA snapshot
```ts
await expect(page.getByRole('main')).toMatchAriaSnapshot(`
  - heading "Etkinlikler" [level=1]
  - navigation "Etkinlik filtreleri"
  - list:
    - listitem:
      - link /.*/
`)
```
- Kontroller: tek `h1`, mantıklı başlık hiyerarşisi, landmark'lar (`banner`, `navigation`, `main`, `contentinfo`), liste semantiği, tablo başlıkları.
- `<html lang>` aktif dili gösterir (`tr` / `fr`). Dil değişince güncellenir.
- Görsellerde anlamlı `alt` bulunur (dekoratif olanlarda `alt=""`). Kapak görseli alt metni boşsa başlık kullanılır (BR-CNT-04).
- İkon butonlarında erişilebilir ad bulunur (`aria-label`).
- Durum mesajları (`Kaydedildi`, `Yükleniyor`) `role="status"` / `aria-live` ile duyurulur.

## 6. Görsel ve hareket tercihleri
- **Zoom/reflow (WCAG 1.4.10):** 320 px genişlikte (400 % zoom eşdeğeri) yatay kaydırma olmamalı: `document.documentElement.scrollWidth <= 320`.
- **Metin aralığı (1.4.12):** Satır yüksekliği 1.5 ve harf aralığı 0.12em enjekte edildiğinde içerik kesilmemeli.
- **Reduced motion:** `page.emulateMedia({ reducedMotion: 'reduce' })` ile slayt otomatik oynatma ve animasyonlar durmalı.
- **Forced colors / yüksek kontrast:** `emulateMedia({ forcedColors: 'active' })` ile butonlar ve odak görünür kalmalı.
- **Dokunma hedefleri:** Mobilde etkileşimli öğeler ≥ 44×44 px (boundingBox kontrolü).
- **Otomatik oynatma:** Hero slaytında duraklat butonu bulunmalı (2.2.2).

## 7. Manuel checklist (sürüm öncesi, otomasyonun yakalayamadıkları)
- [ ] VoiceOver (iPhone) ile: ana sayfa → haber oku → etkinlik detay → takvime ekle
- [ ] NVDA (Windows/Firefox) ile: iletişim formu doldur, hata mesajlarını duy
- [ ] TalkBack (Android) ile: admin hızlı haber akışı
- [ ] Alt metinlerin anlamlılığı (otomasyon yalnızca varlığını kontrol eder)
- [ ] Bağlantı metinleri bağlamdan bağımsız anlaşılır ("Devamını oku" → "X haberinin devamını oku")
- [ ] PDF belgeler: dernek tarafından yüklenen PDF'lerin erişilebilirliği kontrol edilmez ama yardım merkezinde rehber olmalı
- Sonuçlar `docs/qa/a11y-audit-<tarih>.md` dosyasına yazılır.

## Raporlama
```
A11y raporu – <sürüm>
Otomatik: N sayfa × 3 tema × 2 dil × 2 viewport
  critical: 0  serious: 0  moderate: x  minor: y
Klavye: N/N ✓   ARIA snapshot: N/N ✓   Reflow/zoom: ✓   Reduced motion: ✓
Tema kontrast: 5/5 riskli tema ✓
Manuel: VoiceOver ✓  NVDA ✓  TalkBack ✓
Lighthouse a11y: 9x
Karar: UYGUN / BLOKE
```
