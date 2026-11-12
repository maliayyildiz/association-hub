---
name: load-performance-testing
description: DernekHub yük ve performans testlerini yapar; k6 ile smoke/load/stress/spike/soak senaryoları (çok kiracılı trafik dağılımı, yükleme ve arama yükü), k6 browser ile yük altında Web Vitals, Lighthouse CI ve Playwright ile tek kullanıcı performans bütçeleri.
---

# Load & Performance Testing – DernekHub

Sen DernekHub'ın performans mühendisisin. Platformun `CLAUDE.md §9` ve PRD §13 hedeflerini **gerçekçi çok kiracılı yük altında** karşıladığını kanıtlarsın.

> **Araç seçimi:** Playwright bir yük test aracı değildir; tarayıcı başına çok kaynak tüketir. Bu yüzden:
> - **Protokol seviyesi yük** → **k6** (HTTP, binlerce sanal kullanıcı)
> - **Yük altında gerçek tarayıcı metrikleri** → **k6 browser** modülü (Playwright uyumlu API, az sayıda VU)
> - **Tek kullanıcı sayfa performansı ve bütçeler** → **Lighthouse CI** + Playwright (Web Vitals ölçümü)
>
> k6 yeni bir runtime bağımlılığı değildir. CI/test aracı olarak `perf/` altında izole tutulur ve uygulama kodu ona bağımlı olmaz.

## Altın kurallar
- **MUST NOT:** Production'a yük testi yapılmaz. Hedef yalnızca **staging** (prod ile aynı plan/bölge) veya ayrı bir `perf` ortamıdır.
- **MUST:** Testten önce Vercel, Neon, Cloudflare ve Upstash'te yük testi penceresi bildirilir. Cloudflare WAF/rate-limit kuralları için test IP'lerine izin tanımlanır ya da test header'ı (`x-perf-run`) ile ayrı kural yazılır.
- **MUST:** Test verisi sentetiktir. Seed ile 50 kiracı (500'e ölçeklenebilir), kiracı başına ~200 içerik ve gerçekçi görsel boyutları kullanılır.
- **MUST:** Postmark, DeepL ve Turnstile perf ortamında sandbox/test anahtarlarıyla çalışır. Gerçek e-posta gönderilmez.
- **MUST:** Her koşu sonucu (özet JSON + HTML) `perf/results/<tarih>-<senaryo>` olarak saklanır ve önceki koşuyla karşılaştırılır.

## Klasör yapısı
```
perf/
├─ k6/
│  ├─ lib/
│  │  ├─ tenants.js        # 50 kiracı host listesi, ağırlıklı dağılım
│  │  ├─ paths.js          # gerçekçi sayfa karışımı
│  │  ├─ auth.js           # admin senaryoları için oturum
│  │  └─ thresholds.js     # ortak eşikler
│  ├─ scenarios/
│  │  ├─ smoke.js  load-public.js  load-admin.js  stress.js  spike.js  soak.js
│  │  ├─ upload.js  search.js  publish-propagation.js
│  │  └─ browser-vitals.js  # k6 browser
│  └─ data/ images/ (1–8 MB örnek görseller)
├─ lighthouse/lighthouserc.json
└─ results/
```

## 1. Trafik modeli (gerçekçi karışım)
**Kiracı dağılımı (Zipf benzeri):** En popüler 5 dernek trafiğin %40'ını, sonraki 15 dernek %35'ini, kalan 30 dernek %25'ini alır.

**Public sayfa karışımı:**
| Sayfa | Oran |
|---|---|
| Ana sayfa | %30 |
| Haber detayı | %20 |
| Etkinlik listesi / detay | %20 |
| Galeri / albüm (görseller dahil) | %15 |
| Belgeler / arama / iletişim GET | %10 |
| Diğer (hakkımızda, yönetim) | %5 |

**Admin karışımı:** Liste görüntüleme %50, düzenleme kaydetme %25, yayınlama %10, medya yükleme %10, arama %5.

```js
// k6/lib/tenants.js
export function pickTenant() {
  const r = Math.random()
  const pool = r < 0.40 ? TOP5 : r < 0.75 ? NEXT15 : REST30
  return pool[Math.floor(Math.random() * pool.length)]
}
export const get = (tenant, path) =>
  http.get(`https://${tenant}.staging.dernekhub.org${path}`, { tags: { tenant, page: pageTag(path) } })
```

## 2. Senaryolar
| Senaryo | Amaç | Profil | Ne zaman |
|---|---|---|---|
| `smoke` | Script ve ortam doğrulama | 2 VU, 1 dk | Her k6 değişikliği |
| `load-public` | Normal pik trafik | 0→200 VU (5 dk), 200 VU 20 dk, 5 dk iniş | Haftalık + sürüm öncesi |
| `load-admin` | Eşzamanlı editörler | 30 VU (50 kiracıya yayılmış), 15 dk | Haftalık + sürüm öncesi |
| `upload` | Eşzamanlı medya yükleme | 20 VU, her biri 5–10 görsel (presign → R2 PUT → complete) | Sürüm öncesi |
| `search` | Arama yükü | 50 RPS, 10 dk, Türkçe/Fransızca sorgu listesi | Sürüm öncesi |
| `publish-propagation` | Yayın → public görünürlük | 10 yayın/dk, public'te polling | Sürüm öncesi |
| `stress` | Kırılma noktası | 200 → 1000 VU, 50 VU adımlarla | Aylık |
| `spike` | Ani yoğunluk (ör. bayram etkinliği paylaşıldı) | 50 → 800 VU 30 sn içinde, 3 dk tut | Aylık |
| `soak` | Bellek sızıntısı, bağlantı tükenmesi, kuyruk birikmesi | 100 VU, 2–4 saat | Çeyrekte 1 |
| `browser-vitals` | Yük altında gerçek tarayıcı LCP/CLS/INP | `load-public` sürerken 5 browser VU | Sürüm öncesi |

```js
// k6/scenarios/load-public.js
import { thresholds } from '../lib/thresholds.js'
export const options = {
  scenarios: {
    visitors: { executor: 'ramping-vus', startVUs: 0,
      stages: [{ duration: '5m', target: 200 }, { duration: '20m', target: 200 }, { duration: '5m', target: 0 }] },
  },
  thresholds,
}
export default function () {
  const t = pickTenant()
  const res = get(t, pickPath())
  check(res, { 'status 200': r => r.status === 200, 'own tenant': r => r.body.includes(`data-tenant="${t}"`) })
  sleep(randomBetween(2, 8))   // düşünme süresi
}
```
> Not: `own tenant` kontrolü yük altında **cache karışması** (kiracı A'ya B'nin sayfası gelmesi) olup olmadığını yakalar. Bu bir Blocker'dır.

## 3. Eşikler (thresholds = geçme kriteri)
```js
// k6/lib/thresholds.js
export const thresholds = {
  'http_req_failed': ['rate<0.01'],                                  // hata < %1
  'http_req_duration{page:home}': ['p(95)<500', 'p(99)<1200'],
  'http_req_duration{page:news}': ['p(95)<500'],
  'http_req_duration{type:search}': ['p(95)<300'],                   // CLAUDE.md §9
  'http_req_duration{type:admin_save}': ['p(95)<800'],
  'http_req_duration{type:presign}': ['p(95)<400'],
  'checks{check:own tenant}': ['rate==1.0'],                         // izolasyon – sıfır tolerans
  'publish_to_visible_seconds': ['p(95)<60'],                        // özel Trend metriği
}
```
- `browser-vitals` eşikleri: `browser_web_vital_lcp p(75) < 2500`, `browser_web_vital_cls p(75) < 0.1`, `browser_web_vital_inp p(75) < 200`.
- Stress/spike testlerinde eşik "geçme" değil, **kırılma noktası ve toparlanma süresi** raporlanır. Spike sonrası 2 dk içinde p95 normale dönmelidir.

## 4. Yük sırasında izlenecekler
| Kaynak | Metrik | Uyarı eşiği |
|---|---|---|
| Vercel | Function süresi, cold start, hata, cache HIT oranı | Cache HIT < %85 (public) |
| Neon | CPU, aktif bağlantı, yavaş sorgular (`pg_stat_statements`) | Bağlantı > %80 havuz |
| Payload Jobs | Kuyruk uzunluğu, en eski iş yaşı | > 500 iş / > 15 dk |
| R2 / Cloudflare | İstek sayısı, cache HIT | – |
| Upstash | Komut/sn, gecikme | – |
| Sentry | Hata oranı, en yavaş transaction'lar | > %2 |
- Sonuçta en yavaş 10 sorgu, `EXPLAIN ANALYZE` ile ve eksik index önerileriyle rapora eklenir.

## 5. Tek kullanıcı performans bütçeleri (Lighthouse CI + Playwright)
- `lighthouserc.json`: ana sayfa, haber detayı, etkinlik listesi, albüm; mobil profil, 3 koşu medyanı.
```json
{ "ci": { "assert": { "assertions": {
  "categories:performance": ["error", { "minScore": 0.9 }],
  "categories:accessibility": ["error", { "minScore": 0.95 }],
  "categories:seo": ["error", { "minScore": 0.95 }],
  "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
  "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
  "total-byte-weight": ["warn", { "maxNumericValue": 1200000 }],
  "resource-summary:script:size": ["error", { "maxNumericValue": 122880 }]
}}}}
```
- Her PR'da preview URL'ye karşı çalışır. Bütçe aşımında PR kırmızı olur.
- Playwright ile ek ölçüm: `PerformanceObserver` üzerinden LCP/CLS ve route başı JS boyutu (`page.on('response')` toplamı), 4G throttling (CDP `Network.emulateNetworkConditions`).

## 6. Çok kiracılık ölçek testi
- 500 kiracı seed'iyle (perf ortamında) `load-public` tekrarlanır. Hedef: p95'in 50 kiracıya göre en fazla %20 artması.
- Middleware'de host → tenant çözümleme süresi < 5 ms (Edge Config). Server-Timing header'ı ile ölçülür.

## Rapor şablonu
```
Perf raporu – <senaryo> – <tarih> – commit <sha> – ortam: staging
Profil: <VU/RPS, süre>   Kiracı: 50 (dağılım Zipf)
Sonuç: GEÇTİ / KALDI
| Metrik | Sonuç | Eşik | Önceki koşu |
| p95 home | 320 ms | 500 | 340 |
| hata oranı | 0.2 % | 1 % | 0.3 % |
| own-tenant check | 100 % | 100 % | 100 % |
| publish→visible p95 | 22 s | 60 s | 25 s |
| LCP p75 (browser) | 1.9 s | 2.5 s | 2.0 s |
Darboğazlar: <yavaş sorgular, cold start, cache miss>
Öneriler: <index, cache tag, job ayrıştırma>
Kırılma noktası (stress): ~xxx VU – sebep: <DB bağlantısı / function eşzamanlılığı>
```
