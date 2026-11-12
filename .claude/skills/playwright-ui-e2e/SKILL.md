---
name: playwright-ui-e2e
description: DernekHub için Playwright ile UI/E2E testleri yazar; public dernek siteleri ve admin paneli kullanıcı akışları, mobil cihazlar, çoklu kiracı/tema/dil, dosya yükleme, e-posta akışları ve görsel regresyon testlerini kapsar.
---

# Playwright UI / E2E Testing – DernekHub

Sen DernekHub'ın UI otomasyon uzmanısın. Gerçek kullanıcı yolculuklarını, özellikle **teknik olmayan dernek gönüllülerinin telefondan yaptığı işleri**, uçtan uca test edersin. Yetki matrisinin detayları API testlerindedir. Sen kullanıcının gördüğünü ve yaşadığını doğrularsın.

## Page Object / Component Object yapısı
```
pages/
├─ admin/
│  ├─ login.page.ts           # e-posta+şifre, magic link
│  ├─ onboarding.page.ts      # 8 adımlı sihirbaz
│  ├─ posts.page.ts           # liste, editör, hızlı haber
│  ├─ events.page.ts
│  ├─ albums.page.ts
│  ├─ documents.page.ts
│  ├─ theme.page.ts           # renk/logo/font + canlı önizleme
│  └─ users.page.ts
├─ site/
│  ├─ home.page.ts  news.page.ts  events.page.ts  gallery.page.ts
│  ├─ documents.page.ts  contact.page.ts  search.page.ts
└─ components/
   ├─ lightbox.ts  language-switcher.ts  calendar.ts  block-editor.ts  media-uploader.ts
```
- Page object'ler **eylem ve sorgu** sağlar. Assertion'lar testin içinde kalır.
- Locator'lar yalnızca rol, label ve metin bazlıdır. Metinler `messages/*.json`'dan okunur ki çeviri değişince test kırılmasın:
```ts
import tr from '@/messages/tr.json'
await page.getByRole('button', { name: tr.admin.publish }).click()
```

## Zorunlu kritik akışlar (`@smoke`)
| # | Akış | Cihaz | Doğrulama |
|---|---|---|---|
| 1 | Davet → magic link (Mailpit) → şifre → sihirbaz 8 adım → "Sitemi yayına al" | desktop + iPhone | Public sitede "Yakında" kalkar, logo ve renkler görünür |
| 2 | **Mobil hızlı haber**: kameradan/galeriden 3 foto + başlık + metin → yayınla | iPhone, Pixel | Public haber ≤ 60 sn içinde görünür (`expect.poll`) |
| 3 | Zamanlanmış haber (now+2 dk) | desktop | Önce görünmez, zamanı gelince görünür |
| 4 | Tekrarlayan etkinlik (haftalık) + tek tekrarı iptal | desktop | Takvimde doğru günler, iptal rozeti, `.ics` indirilir |
| 5 | Geçmiş etkinliğe rapor + albüm bağla | desktop | Geçmiş Etkinlikler'de rapor ve albüm görünür |
| 6 | Albüm: 20 foto toplu yükleme (HEIC dahil), sürükle-bırak sıralama | desktop + iPhone | Lightbox'ta swipe/klavye, sıra korunur |
| 7 | Belge: public + internal yükle | desktop | Public listede yalnızca public olan görünür |
| 8 | Tema değiştir → canlı önizleme → yayınla → önceki temaya dön | desktop | Public site renk ve logoyu günceller, geri alma çalışır |
| 9 | TR ↔ FR dil değişimi | desktop + iPhone | Aynı içeriğin çevirisine gider, çeviri yoksa not gösterilir |
| 10 | İletişim formu → admin gelen kutusu → okundu | desktop | Mesaj görünür, bildirim e-postası Mailpit'te |
| 11 | Arama "cocuk" → "Çocuk Şenliği" | desktop | Sonuç bulunur, tür filtresi çalışır |
| 12 | Yazar rolü: taslak kaydeder, "Yayınla" butonu yok | desktop | UI kısıtı doğru |
| 13 | Yönetici değişimi (yetki devri) | desktop | Yeni yönetici kabul eder, eskisinin rolü düşer |
| 14 | Süper admin: dernek oluştur, askıya al | desktop | Public "askıda" sayfası, admin girişleri kısıtlı |
| 15 | Çöp kutusu: sil → geri yükle | desktop | İçerik geri gelir, public'te tekrar görünür |

## Regresyon akışları (`@regression`)
- Haber filtreleme (kategori/yıl/etiket), sayfalama, ilgili haberler
- Duyuru bandı (tarih aralığı), sabitleme, öne çıkan haberlerin 3 sınırı (BR-CNT-03)
- Yönetim kurulu dönemleri ve geçmiş dönemler sayfası
- Arşiv zaman çizelgesi (`/arsiv/2024`)
- Menü yönetimi → public menü
- Otomatik taslak kaydı + "kaydedilmemiş değişiklik" uyarısı
- Eşzamanlı düzenleme kilidi (iki `browser.newContext()`)
- Kota uyarısı (%80) bannerı
- 404 / 410 / askıda sayfalarının kiracı markasıyla gösterimi
- Çerez onayı: YouTube embed tıklanana kadar iframe yüklenmez (network isteği yok)

## Çoklu kiracı ve tema
```ts
test('same slug on two tenants renders own content @e2e @isolation', async ({ browser, data }) => {
  await data.post('A', { slug: 'bahar-senligi', title: 'A Şenlik' })
  await data.post('B', { slug: 'bahar-senligi', title: 'B Şenlik' })
  const a = await browser.newPage({ baseURL: tenantUrl('A') })
  const b = await browser.newPage({ baseURL: tenantUrl('B') })
  await a.goto('/haberler/bahar-senligi'); await b.goto('/haberler/bahar-senligi')
  await expect(a.getByRole('heading', { level: 1 })).toHaveText('A Şenlik')
  await expect(b.getByRole('heading', { level: 1 })).toHaveText('B Şenlik')
})
```
- Tema token'larının uygulandığı doğrulanır:
  `await expect(page.getByRole('banner')).toHaveCSS('background-color', 'rgb(…)')`

## Dosya yükleme ve e-posta
- Yükleme: `setInputFiles` ile `files/` fixture'ları (HEIC, EXIF-GPS'li JPG, 25 MB PDF, sahte `.jpg`). Mobilde `filechooser` olayı kullanılır.
- EXIF GPS silindiğini API ile doğrula (media varyantını indir → `exifr` ile GPS yok).
- E-posta akışları: Mailpit API (`GET /api/v1/messages`) → link çıkar → `page.goto(link)`. Doğrudan veritabanından token okumak yasaktır.

## Görsel regresyon (`@visual`)
- Kapsam: 3 ana sayfa düzeni × 3 örnek tema (açık, koyu primary, yüksek doygunluk), haber detayı, etkinlik detayı, albüm, mobil menü.
- Dinamik alanlar maskelenir: `mask: [page.getByTestId('date')]`, animasyonlar kapatılır (`animations: 'disabled'`), fontlar yüklenene kadar beklenir.
- Baseline'lar yalnızca Linux CI container'ında güncellenir (`--update-snapshots`, ayrı PR ile).

## Kurallar
- `waitForTimeout` yasaktır. Bunun yerine `expect(...).toBeVisible()` veya `expect.poll()` kullanılır.
- Her test `@smoke`/`@regression` + `@e2e` + `@US-xx` etiketleri taşır.
- UI ile veri hazırlanmaz. Ön koşul verisi API fixture'larıyla oluşturulur, UI yalnızca test edilen adımda kullanılır.
- Her akışın sonunda `expectNoA11yViolations(page)` çağrılır (`accessibility-testing` skill'i).
- Başarısızlıkta trace saklanır. Flaky test sessizce `retry` ile geçirilmez, raporlanır.
- Test süresi < 60 sn. Daha uzunsa akış bölünür.
