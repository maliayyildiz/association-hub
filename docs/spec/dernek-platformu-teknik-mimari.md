# DernekHub – Teknik Mimari ve Teknoloji Yığını Kararı

| Alan | Değer |
|---|---|
| Doküman | Software Architecture Document (SAD) + Teknoloji Kararları (ADR) |
| Sürüm | v1.0 (Taslak) |
| Tarih | 04.11.2026 |
| Hazırlayan | Software Architect |
| Dayandığı doküman | `dernek-platformu-spec.md` (PRD v1.0) |
| Durum | İnceleme için hazır |

> **Not:** Sürüm numaraları doküman yazıldığı tarihteki güncel kararlı (stable/LTS) sürümleri hedefler. Projeye başlarken her bağımlılığın en güncel kararlı sürümü kontrol edilmeli ve `package.json` içinde sabitlenmelidir.

---

## İçindekiler

1. Özet: Seçilen Yığın (Tek Bakışta)
2. Mimari İlkeler
3. Mimari Stil Kararı: Modüler Monolit
4. Yüksek Seviye Mimari
5. Teknoloji Seçimleri ve Gerekçeleri (katman katman)
6. Çok Kiracılık (Multi-Tenancy) Uygulama Detayı
7. Önbellekleme ve İçerik Yayınlama Akışı
8. Medya ve Dosya İşleme Hattı
9. Arama Mimarisi
10. Kimlik Doğrulama ve Yetkilendirme
11. Arka Plan İşleri ve Zamanlanmış Görevler
12. Özel Domain ve SSL
13. Çoklu Dil (i18n)
14. Kod Tabanı Yapısı (Monorepo)
15. Geliştirme Ortamı ve Araçlar
16. Test Stratejisi
17. CI/CD ve Ortamlar
18. Altyapı ve Barındırma
19. Gözlemlenebilirlik
20. Güvenlik Mimarisi
21. Yedekleme ve Felaket Kurtarma
22. Maliyet Tahmini
23. Değerlendirilen ve Reddedilen Alternatifler
24. Riskler, Bağımlılıklar ve Çıkış Planı (Lock-in)
25. Mimari Karar Kayıtları (ADR) Listesi
26. Uygulama Yol Haritası (Teknik)

---

## 1. Özet: Seçilen Yığın (Tek Bakışta)

| Katman | Seçim |
|---|---|
| **Dil** | **TypeScript** (uçtan uca – frontend, backend, scriptler, testler) |
| **Runtime** | Node.js (güncel LTS – 24.x) |
| **Web framework** | **Next.js** (App Router, React Server Components) |
| **CMS / Admin paneli / Backend** | **Payload CMS 3** (Next.js içine gömülü) + `@payloadcms/plugin-multi-tenant` |
| **Veritabanı** | **PostgreSQL** (17/18) – `@payloadcms/db-postgres` (Drizzle ORM tabanlı) |
| **Rich text editörü** | Lexical (Payload varsayılanı) |
| **UI / Stil** | Tailwind CSS v4 + shadcn/ui (Radix tabanlı) + CSS değişkenleriyle tema token'ları |
| **i18n** | Payload localization (içerik) + `next-intl` (arayüz metinleri) |
| **Medya depolama** | **Cloudflare R2** (S3 uyumlu) + `@payloadcms/storage-s3` |
| **Görsel işleme** | `sharp` (Payload içinde) + Cloudflare CDN önbelleği |
| **Arama** | MVP: PostgreSQL Full-Text Search (`unaccent` + `pg_trgm`) → Faz 2: **Meilisearch** |
| **Arka plan işleri** | Payload Jobs Queue (Postgres tabanlı) + cron tetikleyici |
| **E-posta** | **Postmark** (transactional) · Faz 2 bülten: Brevo *(aday – ADR-021)* |
| **Barındırma (app)** | **Vercel** (AB bölgesi – Frankfurt `fra1`) — çıkış planı: Docker + Hetzner |
| **Barındırma (DB)** | **Neon Postgres** (AB – Frankfurt), dal (branch) başına preview veritabanı |
| **DNS / CDN / WAF / Captcha** | **Cloudflare** (DNS, R2, Turnstile, WAF) |
| **Özel domain + SSL** | Vercel Domains API (otomatik SSL) |
| **Harita** | MapLibre GL + OpenStreetMap tabanlı vektör karolar (MapTiler/Protomaps – AB) |
| **Analitik** | **Plausible** (AB, çerezsiz) |
| **Hata takibi** | **Sentry** (AB veri bölgesi) |
| **Log / Uptime** | Better Stack (Logs + Uptime) |
| **Paket yöneticisi / Monorepo** | **pnpm** + **Turborepo** |
| **Lint / Format** | **Biome** (+ `typescript-eslint` yalnızca tip-farkındalıklı kurallar için, opsiyonel) |
| **Test** | **Vitest** (birim/entegrasyon) + **Playwright** (E2E) + Testcontainers (Postgres) |
| **CI/CD** | **GitHub Actions** + Vercel Git entegrasyonu |
| **Yerel geliştirme** | Docker Compose (Postgres, MinIO, Mailpit, Meilisearch) |
| **Gizli anahtarlar** | Vercel Environment Variables (+ ekip büyürse Infisical/Doppler) |
| **Bağımlılık güncelleme** | Renovate |
| **Makine çevirisi (Faz 2)** | DeepL API *(aday – ADR-021)* |
| **Ödeme (Faz 3)** | Stripe (abonelik) · HelloAsso (Fransa dernek bağışları) *(aday – ADR-021)* |

**Neden bu yığın – tek cümleyle:**
> Tek dil (TypeScript), tek uygulama (Next.js + Payload), tek veritabanı (Postgres) ve tamamen yönetilen servislerle; 1–3 kişilik bir ekibin 500 derneğe kadar ölçekleyebileceği, admin panelini sıfırdan yazmadan haftalar içinde MVP çıkarabileceği ve yıllarca bakımını rahatça yapabileceği en sade modern yığın.

---

## 2. Mimari İlkeler

| # | İlke | Pratikteki anlamı |
|---|---|---|
| AP-1 | **Sadelik > esneklik** | Mikroservis yok, tek deploy edilebilir birim. Yeni bir servis ancak ölçülmüş bir ihtiyaçla eklenir. |
| AP-2 | **Satın al / hazır kullan, sonra yaz** | Admin paneli, auth, medya, i18n, versiyonlama Payload'dan gelir. Kendi kodumuz yalnızca iş mantığı ve şablon. |
| AP-3 | **Tek dil, uçtan uca tip güvenliği** | Payload şemasından otomatik TypeScript tipleri üretilir; frontend aynı tipleri kullanır. |
| AP-4 | **Kiracı izolasyonu pazarlık konusu değildir** | Her sorgu tenant filtresinden geçer; CI'da otomatik izolasyon testleri zorunlu. |
| AP-5 | **Yönetilen servisler, AB'de** | Sunucu yönetmiyoruz; tüm kişisel veri AB bölgesinde (GDPR). |
| AP-6 | **Konfigürasyon, özel kod değil** | Dernekler arası farklar veri (tema token'ları, ayarlar, feature flag) ile yönetilir; dernek özelinde kod dalı yok. |
| AP-7 | **Önce statik, sonra dinamik** | Public sayfalar önbellekten servis edilir, içerik değişince etiket bazlı yenilenir. |
| AP-8 | **Taşınabilirlik** | Vendor'a özel API'ler ince bir adaptör katmanında; Next.js `standalone` çıktısı ile her zaman Docker'a taşınabilir. |
| AP-9 | **Gözlemlenebilir varsayılan** | Her log/hata `tenantId` ile etiketlenir. |
| AP-10 | **Kararlar yazılır** | Her önemli karar bir ADR olarak repoda tutulur (`/docs/adr`). |

---

## 3. Mimari Stil Kararı: Modüler Monolit

**Karar:** Uygulama, iç modüllere ayrılmış **tek bir Next.js + Payload uygulaması** (modüler monolit) olarak geliştirilir.

| Seçenek | Artı | Eksi | Sonuç |
|---|---|---|---|
| Mikroservisler | Bağımsız ölçekleme | 1–3 kişilik ekip için ağır operasyon, dağıtık hata ayıklama, maliyet | ✗ |
| Headless CMS + ayrı frontend (iki uygulama) | Ayrık deploy | İki deploy, iki auth, API sözleşmesi bakımı, tip senkronizasyonu | ✗ |
| **Modüler monolit (Payload Next.js içinde)** | Tek deploy, ortak tipler, Local API ile ağ çağrısı olmadan veri erişimi, düşük maliyet | Tek uygulamanın büyümesi → modül sınırlarıyla yönetilir | ✓ |

**Modül sınırları** (her biri `src/modules/<modül>` altında; modüller birbirine yalnızca açık `index.ts` üzerinden erişir):

```
tenancy      → kiracı, domain, plan, kota, kiracı çözümleme
identity     → kullanıcı, üyelik, davet, roller, 2FA, magic link
branding     → tema, token üretimi, kontrast kontrolü
content      → sayfa, haber, etkinlik, albüm, belge, kategori, etiket
media        → yükleme, görsel varyantları, kota hesabı
search       → indeksleme, sorgu
engagement   → iletişim mesajları, abonelik (Faz 2)
portal       → merkezi portal sorguları (Faz 2)
platform     → süper admin araçları, audit log, global duyurular
compliance   → çerez, yasal metinler, veri dışa aktarma/silme
notifications→ e-posta şablonları, panel bildirimleri
```

Mikroservise geçiş tetikleyicileri (ileride): arama yükü, görsel işleme kuyruğu veya portal trafiği ana uygulamayı ölçülebilir biçimde etkilerse yalnızca o parça ayrılır.

---

## 4. Yüksek Seviye Mimari

```
                          ┌───────────────────────── Cloudflare ─────────────────────────┐
                          │  DNS · WAF · Turnstile · R2 (medya) · CDN (media.dernekhub)   │
                          └──────────────┬───────────────────────────────┬───────────────┘
                                         │                               │
   Ziyaretçi                             ▼                               │
  dernek-a.dernekhub.org ──► ┌────────────────────────────────┐          │
  www.dernek-a.fr ─────────► │   Vercel (fra1) – Next.js app  │          │
  admin.dernekhub.org ─────► │ ┌────────────┐ ┌─────────────┐ │          │
  dernekhub.org (portal) ──► │ │ middleware │ │ Public site │ │          │
                             │ │ host→tenant│ │ (RSC + ISR) │ │          │
                             │ └────────────┘ └─────────────┘ │          │
                             │ ┌────────────────────────────┐ │          │
                             │ │ Payload Admin (/admin)     │ │          │
                             │ │ Payload REST/GraphQL/Local │ │          │
                             │ │ Access control + hooks     │ │          │
                             │ └────────────────────────────┘ │          │
                             │ Cron → /api/jobs/run           │          │
                             └───────┬───────────┬────────────┘          │
                                     │           │                       │
                     ┌───────────────┘           └──────────┐            │
                     ▼                                       ▼            ▼
          ┌────────────────────┐              ┌─────────────────────┐  ┌──────────────┐
          │ Neon Postgres (EU) │              │ Meilisearch (Faz 2) │  │ R2 bucket    │
          │ tenant_id + RLS    │              │ (Meilisearch Cloud  │  │ tenants/{id}/│
          │ jobs queue tabloları│             │  EU veya Hetzner)   │  └──────────────┘
          └────────────────────┘              └─────────────────────┘
                     │
          Yan servisler: Postmark (e-posta) · Sentry · Better Stack · Plausible · DeepL (Faz 2)
```

**İstek akışları:**

1. **Public sayfa:** Tarayıcı → Cloudflare → Vercel Edge → `middleware.ts` Host başlığını okur → `tenantId` + `locale` bulur → URL'yi dahili olarak `/_sites/[tenant]/[locale]/...` rotasına yeniden yazar → RSC sayfası Payload **Local API** ile veriyi çeker (ağ çağrısı yok) → sonuç `tenant:{id}` etiketleriyle önbelleğe alınır.
2. **Admin işlemi:** Editör `/admin`'de haber yayınlar → Payload `afterChange` hook'u → (a) `revalidateTag('tenant:{id}:posts')`, (b) arama indeksleme işi kuyruğa eklenir, (c) audit log yazılır.
3. **Medya yükleme:** Tarayıcı → Payload'dan imzalı (presigned) URL ister → dosyayı **doğrudan R2'ye** yükler (Vercel gövde limitine takılmadan) → Payload kaydı oluşturur → görsel varyantları arka plan işinde üretilir.

---

## 5. Teknoloji Seçimleri ve Gerekçeleri

### 5.1 Dil: TypeScript (strict)
- Frontend, backend, scriptler, altyapı-as-code ve testler tek dilde → bağlam değiştirme yok, işe alım kolay.
- `strict: true`, `noUncheckedIndexedAccess: true`.
- Payload koleksiyon şemalarından `payload generate:types` ile tipler otomatik üretilir; Zod ile dış girdiler (form, webhook, CSV) doğrulanır.

### 5.2 Framework: Next.js (App Router)
| Neden | Açıklama |
|---|---|
| Payload 3'ün yerlisi | Payload doğrudan Next.js uygulamasının içine kurulur; ayrı backend yok |
| React Server Components | Public sayfalar sunucuda render edilir, istemciye minimum JS gider → Lighthouse ≥ 90 hedefi |
| Middleware | Host tabanlı kiracı çözümleme için ideal (Vercel'in "Platforms" multi-tenant deseni) |
| ISR + `revalidateTag` | Sayfalar statik hız, içerik değişince saniyeler içinde güncel |
| Ekosistem | En büyük React ekosistemi, uzun vadeli destek, kolay geliştirici bulma |
| Taşınabilirlik | `output: 'standalone'` ile Docker imajı → Vercel dışına çıkış mümkün |

### 5.3 CMS ve Admin: Payload CMS 3
Spec'teki admin gereksinimlerinin büyük kısmı **kutudan çıkar**:

| PRD gereksinimi | Payload karşılığı |
|---|---|
| Admin paneli (E04–E09) | Otomatik üretilen, özelleştirilebilir React admin UI |
| Multi-tenant (E01) | Resmi `@payloadcms/plugin-multi-tenant`: tenant alanı, tenant seçici, tenant bazlı erişim |
| Rol/yetki matrisi (Bölüm 6) | Alan ve koleksiyon düzeyinde fonksiyon tabanlı `access` kontrolü |
| Taslak / yayın / zamanlama (E15) | `versions: { drafts: true, schedulePublish: true }` |
| Sürüm geçmişi (E15.4) | `versions.maxPerDoc` |
| Önizleme / canlı önizleme (E15.3) | Live Preview |
| Blok editör (E04.2) | `blocks` alan tipi + Lexical rich text |
| Çoklu dil (E10) | Alan bazlı `localized: true` + admin arayüzü çevirileri (TR/FR mevcut) |
| Medya (E07) | Upload koleksiyonu, `sharp` ile boyutlar, odak noktası (focal point) |
| Auth (E02) | Yerleşik auth, kilitleme (`maxLoginAttempts`), şifre sıfırlama, API key |
| SEO (E14) | `@payloadcms/plugin-seo` |
| Yönlendirmeler (E14) | `@payloadcms/plugin-redirects` |
| Form (E11) | `@payloadcms/plugin-form-builder` (veya özel koleksiyon) |
| Arka plan işleri (E-posta, indeksleme) | Payload Jobs Queue |
| İç içe sayfalar | `@payloadcms/plugin-nested-docs` |

Ek gerekçeler: MIT lisanslı açık kaynak, kendi veritabanımızda çalışır (veri bizde), Postgres desteği birinci sınıf, kod-öncelikli (config kod olarak versiyonlanır → review edilebilir, test edilebilir).

### 5.4 Veritabanı: PostgreSQL
- İlişkisel model spec'e birebir uyuyor (kiracı → içerik → kategori/etiket ilişkileri).
- Tek veritabanı içinde **Row Level Security** (ikinci savunma hattı), **JSONB** (bloklar, ayarlar), **full-text search** (`unaccent`, `pg_trgm`), **zamanlanmış işler** için tablo tabanlı kuyruk.
- Payload Postgres adaptörü Drizzle ORM kullanır → migrasyonlar SQL olarak üretilir ve repoda versiyonlanır (`payload migrate:create`).
- **Neon** seçim nedeni: AB bölgesi, sunucusuz ölçekleme, otomatik PITR, her PR için anlık **veritabanı dalı** (preview ortamları için çok değerli), bağlantı havuzu (PgBouncer) dahili.
- Alternatif: Supabase (AB) veya Hetzner üzerinde yönetilen Postgres (çıkış planında).

### 5.5 UI: Tailwind CSS v4 + shadcn/ui
- Tailwind v4 CSS-first yapılandırma ve **CSS değişkenleri** ile tema token'larını doğal destekler → her dernek için yalnızca değişken seti değişir, CSS yeniden derlenmez.
- shadcn/ui: bileşenler projeye kopyalanır (bağımlılık değil) → uzun vadede bakım kontrolü bizde; Radix tabanlı → erişilebilirlik (WCAG AA) hazır.
- İkonlar: `lucide-react`. Animasyon: CSS + gerekirse `motion`.
- Fontlar: `next/font/local` ile self-host (GDPR – Google'a istek yok).

### 5.6 Medya: Cloudflare R2
- S3 uyumlu, **çıkış (egress) ücreti yok** → galeri ağırlıklı bir platform için en büyük maliyet kalemini sıfırlar.
- AB yetki alanı (jurisdiction: EU) bucket.
- `@payloadcms/storage-s3` + `clientUploads: true` → büyük dosyalar doğrudan tarayıcıdan R2'ye.
- `media.dernekhub.org` özel domain + Cloudflare CDN önbelleği.

### 5.7 E-posta: Postmark (+ Brevo Faz 2)
- Postmark: transactional e-postada en yüksek teslim edilebilirlik, ayrı "message stream"ler (bildirim vs. dernek kaynaklı), webhook ile bounce takibi.
- Brevo (Fransız, AB): bülten/pazarlama e-postası için Faz 2 adayı; GDPR açısından avantajlı. *Kullanımı ADR-021 gereği ayrı ADR onayına bağlıdır.*
- Şablonlar: **React Email** ile kod içinde, TR/FR/EN, dernek markalı.

### 5.8 Diğer Seçimler (kısa gerekçe)
| Alan | Seçim | Gerekçe |
|---|---|---|
| Form & doğrulama | React Hook Form + Zod | Tip güvenli, sunucu ve istemcide aynı şema |
| Tarih/saat | `date-fns` + `date-fns-tz` | Ağaç-sarsılabilir, saat dilimi (Europe/Paris) desteği |
| Tekrarlayan etkinlik | `rrule` | RFC 5545 standardı |
| iCal üretimi | `ical-generator` | `.ics` ve takvim feed'i |
| Takvim UI | Özel bileşen (date-fns) veya `@schedule-x` | Hafif, erişilebilir |
| Lightbox | `yet-another-react-lightbox` | Mobil swipe, klavye, hafif |
| Harita | MapLibre GL + MapTiler (AB) | Google Maps çerezi yok, ücretsiz katman |
| Geocoding | Nominatim (kendi hız limitiyle) / MapTiler Geocoding | OSM tabanlı |
| Renk işleme | `culori` | Ton üretimi, kontrast (WCAG) hesabı |
| Logodan renk çıkarma | `node-vibrant` | Baskın renk paleti |
| HEIC → JPG | `sharp` (libheif) | iPhone fotoğrafları |
| PDF önizleme/metin | `pdfjs-dist` (metin) + `sharp`/`pdftoppm` (ilk sayfa) | Arama ve önizleme |
| Virüs taraması (belgeler) | ClamAV (Faz 2, küçük konteyner) veya Cloudflare/VirusTotal API | |
| Slug | `@sindresorhus/slugify` (Türkçe kurallarıyla) | ç,ğ,ı,ö,ş,ü dönüşümü |
| HTML sanitize | `isomorphic-dompurify` | XSS |
| Rate limiting | Upstash Redis Ratelimit (AB) | Serverless uyumlu |
| Captcha | Cloudflare Turnstile | Gizlilik dostu, ücretsiz |
| Çerez onayı | Kendi hafif bileşenimiz (yalnızca embed varsa) | Varsayılan çerezsiz site |
| Feature flags | Tenant `settings` JSONB + platform düzeyinde basit tablo | Ek servis gerekmez |

---

## 6. Çok Kiracılık (Multi-Tenancy) Uygulama Detayı

### 6.1 Model
**Paylaşımlı veritabanı, paylaşımlı şema, `tenant` sütunu** (pool model).

### 6.2 Kiracı Çözümleme
```ts
// middleware.ts (özet)
export async function middleware(req: NextRequest) {
  const host = req.headers.get('host')!.toLowerCase();
  if (host === 'admin.dernekhub.org') return NextResponse.next();
  if (host === 'dernekhub.org')      return rewrite('/_portal', req);

  const tenant = await resolveTenant(host);        // Upstash Redis cache → DB (ADR-020)
  if (!tenant) return rewrite('/_not-found', req);
  if (tenant.status === 'askida') return rewrite('/_suspended', req);

  const locale = detectLocaleFromPath(req, tenant); // /fr/... veya varsayılan
  return rewrite(`/_sites/${tenant.id}/${locale}${pathWithoutLocale}`, req);
}
```
- `domains` tablosu → `hostname → tenantId` eşlemesi **Upstash Redis** (ADR-020) içinde önbelleğe alınır; domain değiştiğinde Payload hook'u önbelleği günceller. Böylece middleware'de DB sorgusu olmaz (< 5 ms).

### 6.3 İzolasyon Katmanları (Defense in Depth)
| Katman | Mekanizma |
|---|---|
| 1. Uygulama – Payload access control | `plugin-multi-tenant` her sorguya `tenant = kullanıcının kiracıları` filtresi ekler; `create`'de tenant zorunlu ve kullanıcının kiracısıyla sınırlı |
| 2. Uygulama – Public okuma | Public sayfalar Local API'yi her zaman `where: { tenant: { equals: tenantId } }` ile çağıran **tek bir veri erişim modülü** (`content/queries.ts`) üzerinden çalışır; doğrudan `payload.find` public kodda lint kuralıyla yasak |
| 3. Veritabanı – RLS (Faz 1.5) | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + `USING (tenant_id = current_setting('app.tenant_id')::uuid)`; public okuma bağlantısı ayrı bir DB rolüyle ve işlem başında `SET LOCAL app.tenant_id` ile çalışır. Payload admin bağlantısı (süper admin dahil) `BYPASSRLS` rolüyle çalışır ve katman 1'e güvenir. |
| 4. Depolama | R2 anahtarları `tenants/{tenantId}/...`; internal belgeler yalnızca kısa ömürlü imzalı URL ile |
| 5. Önbellek | Tüm cache tag ve key'ler `tenant:{id}` önekli |
| 6. Test | CI'da **izolasyon test paketi**: iki kiracı oluşturulur, A kullanıcısıyla B'nin her koleksiyonuna REST/GraphQL/Local API üzerinden okuma/yazma denemesi → hepsi reddedilmeli |

> RLS'nin Payload ile tam entegrasyonu özel bağlantı yönetimi gerektirir; bu yüzden MVP'de katman 1–2–6 zorunlu, katman 3 Faz 1.5'te public okuma yolu için eklenir (ADR-007).

### 6.4 Tema Token'ları
```ts
// branding/tokens.ts – kiracı temasından CSS değişkenleri üretir
export function buildThemeCss(theme: Theme): string {
  const p = palette(theme.colorPrimary); // culori ile 50..950 tonları + okunabilir metin rengi
  return `:root{--primary:${p[600]};--primary-fg:${p.fg};--primary-50:${p[50]};...
          --font-heading:${theme.fontHeading};--radius:${radius(theme.radius)}}`;
}
```
- Layout'ta `<style>` olarak enjekte edilir; tema değişince `revalidateTag('tenant:{id}:theme')`.
- Şablon bileşenleri yalnızca token'ları kullanır (`bg-primary`, `text-primary-fg`) → her dernek farklı görünür, kod aynı.

---

## 7. Önbellekleme ve İçerik Yayınlama Akışı

| Katman | Ne önbelleğe alınır | Nasıl yenilenir |
|---|---|---|
| Cloudflare CDN | Medya dosyaları (immutable, 1 yıl) | Dosya adı içerik hash'li → yenilemeye gerek yok |
| Vercel Data/Full Route Cache | Public sayfalar ve veri sorguları | `revalidateTag` (Payload `afterChange`/`afterDelete` hook'ları) |
| Upstash Redis (ADR-020) | Host → tenant eşlemesi, tema özetleri | Domain/tema hook'ları |

**Etiket şeması:** `tenant:{id}`, `tenant:{id}:posts`, `tenant:{id}:post:{slug}`, `tenant:{id}:events`, `tenant:{id}:theme`, `tenant:{id}:settings`, `portal:events`.

**Zamanlanmış yayın:** Payload `schedulePublish` işi yayın zamanında çalışır → aynı hook'lar tetiklenir → < 60 sn hedefi sağlanır.

**Geçmiş etkinliğe geçiş:** "Yaklaşan etkinlikler" sorguları `revalidate: 3600` + saatlik cron ile ilgili kiracıların `events` etiketini yeniler.

---

## 8. Medya ve Dosya İşleme Hattı

```
Tarayıcı ──(1) presigned URL iste──► Payload API (kota + MIME + boyut kontrolü)
   │                                         │
   └──(2) PUT doğrudan R2 ◄──────────────────┘
   │
   └──(3) "yükleme tamam" ──► Payload Media kaydı (status: processing)
                                 │
                                 └──(4) Job: image.process
                                        · sharp: EXIF GPS sil, yön düzelt, HEIC→JPEG
                                        · 200/640/1024/1600/2560 px WebP + AVIF
                                        · blurhash/LQIP placeholder
                                        · tenant.storage_used_bytes güncelle
                                        → status: ready
```
- Belgeler (PDF): `document.process` işi → ilk sayfa önizleme + metin çıkarma → arama indeksi.
- Serverless süre sınırına takılmamak için ağır işlemler kuyrukta, iş başına tek dosya; gerekirse görsel işleme ayrı bir **Vercel Function (daha uzun timeout)** veya Faz 2'de Cloudflare Images'a devredilir.
- Görsellerin servis edilmesi: `next/image` + özel loader → hazır varyantları R2/CDN'den doğrudan sunar (Vercel görsel optimizasyon maliyeti yok).

---

## 9. Arama Mimarisi

**MVP – PostgreSQL FTS:**
- Her aranabilir koleksiyon için `search_documents` tablosu (Payload `plugin-search` ile senkron): `tenant_id, locale, type, title, body_text, tsv, published_at`.
- `tsvector` dil yapılandırması: `turkish` / `french` + `unaccent` (ç=c, é=e) + `pg_trgm` ile yazım toleransı.
- GIN indeksleri; 500 kiracı × binlerce kayıtta < 100 ms.

**Faz 2 – Meilisearch:**
- Tetikleyici: typo-tolerance/relevans ihtiyacı veya portal genelinde arama.
- Tenant izolasyonu: tek index + `tenant_id` filtrelenebilir alan + **tenant token** (her kiracıya imzalı arama anahtarı).
- Barındırma: Meilisearch Cloud (AB) veya Hetzner'da tek konteyner.
- Senkronizasyon: Payload hook → Job → Meilisearch (idempotent upsert).

---

## 10. Kimlik Doğrulama ve Yetkilendirme

| Gereksinim | Çözüm |
|---|---|
| E-posta + şifre | Payload auth (`users` koleksiyonu), Argon2/pbkdf2 hash |
| Hesap kilitleme | `auth.maxLoginAttempts: 5`, `lockTime: 15 dk` |
| Magic link | Özel endpoint: tek kullanımlık, 15 dk geçerli token (hash'li saklanır) → Payload oturumu oluşturur |
| 2FA (TOTP) | `otplib` ile özel uygulama; süper admin/destek için zorunlu; kurtarma kodları |
| Oturum | HTTP-only, Secure, SameSite=Lax çerez (JWT, kısa ömürlü + yenileme) |
| Sızdırılmış şifre kontrolü | HaveIBeenPwned k-anonymity API |
| Roller | `memberships` (kullanıcı ↔ kiracı ↔ rol) + global `isSuperAdmin` / `isSupport` |
| Yetki kontrolü | Merkezi `access/` modülü: `canPublish(user, tenant)`, `isTenantAdmin(...)` – tüm koleksiyonlar bunu kullanır; her fonksiyon birim testli |
| Destek modu | Zaman sınırlı "impersonation" token'ı + audit log + e-posta bildirimi |
| Faz 2: Google ile giriş | Payload OAuth eklentisi veya Auth.js köprüsü |

---

## 11. Arka Plan İşleri ve Zamanlanmış Görevler

**Seçim:** Payload Jobs Queue (Postgres tablolarında; ek altyapı yok). Tetikleyici: Vercel Cron → `/api/payload-jobs/run` (dakikada bir).

| İş | Tetikleyici | Not |
|---|---|---|
| `image.process` | Medya yüklemesi | Yeniden denenebilir (3x, üstel bekleme) |
| `document.process` | Belge yüklemesi | |
| `search.index` / `search.remove` | İçerik değişikliği | İdempotent |
| `email.send` | Bildirimler | Postmark |
| `content.schedulePublish` | Zamanlanmış içerik | Payload yerleşik |
| `events.rollover` | Saatlik | Geçmişe düşen etkinliklerin cache'ini yenile |
| `domains.verify` | 10 dakikada bir | Bekleyen domainler |
| `storage.recalculate` | Günlük | Kiracı depolama kullanımı |
| `retention.purge` | Günlük | Süresi dolan mesajlar, çöp kutusu (30 gün), silinecek kiracılar |
| `tenant.export` | Talep üzerine | ZIP → R2 → imzalı link e-posta |
| `digest.inactive` | Aylık | Pasif dernek teşvik e-postası |
| `backup.offsite` | Günlük | `pg_dump` → ayrı hesap/bölge (Bölüm 21) |

> Kuyruk yükü artarsa (ör. toplu geçmiş fotoğraf yükleme), işçi (worker) ayrı bir **Node süreci** olarak Railway/Fly.io/Hetzner'da çalıştırılabilir – kod aynı, yalnızca `payload jobs:run` komutu.

---

## 12. Özel Domain ve SSL

- **Alt alan adları:** `*.dernekhub.org` wildcard DNS (Cloudflare) → Vercel wildcard domain → otomatik SSL.
- **Özel domain (Faz 2):** Dernek panelden domain girer → backend **Vercel Domains API** ile projeye ekler → DNS talimatı (CNAME `cname.vercel-dns.com` veya A kaydı) gösterilir → `domains.verify` işi durumu sorgular → doğrulanınca kiracı önbelleği (Upstash Redis, ADR-020) güncellenir, SSL Vercel tarafından otomatik.
- Çıkış planı alternatifi: **Cloudflare for SaaS (Custom Hostnames)** veya Hetzner'da **Caddy on-demand TLS**.

---

## 13. Çoklu Dil (i18n)

| Katman | Çözüm |
|---|---|
| İçerik | Payload `localization: { locales: ['tr','fr','en','de','nl'], fallback: false }` + alan bazlı `localized: true`; kiracının aktif dilleri `tenant.locales`'tan |
| Slug | Dil bazında localized slug alanı |
| Arayüz metinleri (public) | `next-intl` mesaj dosyaları (`messages/tr.json`, `fr.json`…) |
| Admin arayüzü | Payload yerleşik TR/FR/EN çevirileri + özel alanlar için ek çeviriler |
| URL | Varsayılan dil öneksiz, diğerleri `/fr/...`; `hreflang` otomatik |
| Tarih/sayı formatı | `Intl` API + kiracı saat dilimi |
| Otomatik çeviri (Faz 2) | DeepL API → "çeviri taslağı oluştur" admin butonu (özel Payload bileşeni) |
| RTL (Arapça – gerekirse) | Tailwind `rtl:` varyantları + `dir` niteliği; MVP dışında |

---

## 14. Kod Tabanı Yapısı (Monorepo)

```
dernekhub/
├─ apps/
│  └─ web/                          # Next.js + Payload (tek deploy)
│     ├─ src/
│     │  ├─ app/
│     │  │  ├─ (payload)/admin/...  # Payload admin rotaları
│     │  │  ├─ (payload)/api/...    # Payload REST/GraphQL
│     │  │  ├─ _sites/[tenant]/[locale]/...   # Public dernek siteleri
│     │  │  ├─ _portal/...          # Merkezi portal (Faz 2)
│     │  │  └─ api/                 # Özel endpointler (upload, magic-link, ics, webhooks)
│     │  ├─ modules/                # Bölüm 3'teki modüller
│     │  │  ├─ tenancy/ identity/ branding/ content/ media/ search/
│     │  │  ├─ engagement/ portal/ platform/ compliance/ notifications/
│     │  ├─ collections/            # Payload koleksiyon config'leri (modüllerden re-export)
│     │  ├─ access/                 # Merkezi yetki fonksiyonları
│     │  ├─ jobs/                   # Payload job tanımları
│     │  ├─ components/site/        # Public şablon bileşenleri (token tabanlı)
│     │  ├─ components/admin/       # Özel admin bileşenleri (tema önizleme, sihirbaz)
│     │  ├─ i18n/
│     │  ├─ middleware.ts
│     │  └─ payload.config.ts
│     ├─ migrations/                # Drizzle/Payload SQL migrasyonları
│     └─ tests/ (unit, integration, e2e, isolation)
├─ packages/
│  ├─ ui/                           # shadcn/ui tabanlı paylaşılan bileşenler
│  ├─ email/                        # React Email şablonları
│  ├─ theme/                        # Token üretimi, kontrast hesapları
│  ├─ config/                       # tsconfig, biome, tailwind preset
│  └─ shared/                       # Zod şemaları, sabitler, yardımcılar
├─ infra/
│  ├─ docker-compose.yml            # Yerel: postgres, minio, mailpit, meilisearch
│  ├─ Dockerfile                    # Çıkış planı / self-host
│  └─ terraform/                    # Cloudflare, Neon, Vercel kaynakları (opsiyonel)
├─ docs/
│  ├─ adr/                          # Mimari karar kayıtları
│  ├─ runbooks/                     # Olay müdahale, yedekten dönme, kiracı silme
│  └─ spec/                         # PRD ve bu doküman
├─ .github/workflows/
├─ turbo.json · pnpm-workspace.yaml · biome.json · renovate.json
```

**Kod kuralları:**
- Modüller arası import yalnızca `modules/<x>/index.ts` üzerinden (Biome/eslint `no-restricted-imports` veya `dependency-cruiser`).
- Public kodda Payload'a doğrudan erişim yasak; yalnızca `content/queries.ts` (tenant zorunlu parametre).
- Conventional Commits + `changesets` (sürüm notları).

---

## 15. Geliştirme Ortamı ve Araçlar

| Araç | Amaç |
|---|---|
| Node.js LTS (`.nvmrc` / `volta`) | Sürüm sabitleme |
| pnpm | Hızlı, disk verimli paket yöneticisi; workspace |
| Turborepo | Görev önbellekleme (build/test/lint) |
| Docker Compose | Postgres, MinIO (R2 yerine), Mailpit (e-posta yakalama), Meilisearch |
| Biome | Lint + format (tek araç, çok hızlı) |
| TypeScript strict | Tip güvenliği |
| Husky + lint-staged | Commit öncesi kontrol |
| Renovate | Otomatik bağımlılık güncelleme PR'ları (haftalık gruplanmış) |
| VS Code + Dev Containers (opsiyonel) | Herkes için aynı ortam |
| Seed script | `pnpm seed` → 3 örnek dernek, kullanıcılar, içerik, medya |
| Storybook (opsiyonel) | Şablon bileşenlerini farklı temalarla görsel test |

**Yerel `.env` örneği:** `DATABASE_URL`, `PAYLOAD_SECRET`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `POSTMARK_TOKEN`, `TURNSTILE_SECRET`, `ROOT_DOMAIN=dernekhub.localhost`.
Yerelde kiracılar `dernek-a.dernekhub.localhost:3000` gibi adreslerle test edilir.

---

## 16. Test Stratejisi

| Seviye | Araç | Kapsam | Hedef |
|---|---|---|---|
| Birim | Vitest | Yetki fonksiyonları, tema/kontrast, slug, rrule, iş kuralları (BR-xx) | Kritik modüllerde ≥ %90 |
| Entegrasyon | Vitest + Testcontainers (gerçek Postgres) + Payload Local API | Koleksiyon hook'ları, iş akışları, joblar | Tüm koleksiyonlar |
| **Kiracı izolasyonu** | Vitest (özel paket) | Her koleksiyon × her endpoint türü × her rol için çapraz kiracı erişim denemeleri | %100 – kırmızıysa merge yok |
| E2E | Playwright | Onboarding sihirbazı, haber/etkinlik yayınlama, galeri yükleme, public site gezinme, mobil viewport | Kritik akışlar (≈ 20 senaryo) |
| Erişilebilirlik | `@axe-core/playwright` | Public şablon + admin kritik ekranlar | 0 ciddi ihlal |
| Performans | Lighthouse CI | Ana sayfa, haber detayı, etkinlik listesi | Perf ≥ 90 |
| Görsel regresyon (opsiyonel) | Playwright screenshot / Chromatic | 3 düzen × 3 örnek tema | |
| Yük testi (Faz 1.5) | k6 | 200 eşzamanlı ziyaretçi, 20 eşzamanlı yükleme | p95 < 500 ms |
| Güvenlik | Snyk/`pnpm audit`, OWASP ZAP baseline (CI), yıllık pentest | | |

---

## 17. CI/CD ve Ortamlar

### 17.1 Ortamlar
| Ortam | Uygulama | Veritabanı | Medya | Domain |
|---|---|---|---|---|
| Local | `pnpm dev` | Docker Postgres | MinIO | `*.dernekhub.localhost` |
| Preview (her PR) | Vercel Preview | **Neon branch** (staging'den kopya, anonimleştirilmiş) | R2 `preview` bucket | `pr-123.preview.dernekhub.org` |
| Staging | Vercel (staging branch) | Neon `staging` | R2 `staging` | `*.staging.dernekhub.org` |
| Production | Vercel (main) | Neon `main` | R2 `prod` (EU) | `*.dernekhub.org` + özel domainler |

### 17.2 Pipeline (GitHub Actions)
```
PR açıldı
 ├─ install (pnpm, cache) 
 ├─ biome check · tsc --noEmit
 ├─ vitest (unit + integration, Testcontainers)
 ├─ isolation test suite            ← zorunlu
 ├─ payload migrate:status (bekleyen migrasyon kontrolü)
 ├─ Vercel preview deploy + Neon branch + migrate + seed
 ├─ Playwright E2E + axe (preview URL'ye karşı)
 └─ Lighthouse CI
main'e merge
 ├─ migrate (prod, geriye uyumlu "expand → contract" kuralı)
 ├─ Vercel production deploy
 ├─ Sentry release + source maps
 └─ smoke test (3 örnek kiracı)
```
- Migrasyon kuralı: önce **genişlet** (yeni sütun, nullable), deploy, veri taşı, sonra **daralt** (eski sütunu sil) → sıfır kesinti.
- Geri alma: Vercel "Instant Rollback" + Neon PITR.
- Feature flag ile kiracı bazlı kademeli açılış (önce pilot dernekler).

---

## 18. Altyapı ve Barındırma

### 18.1 Önerilen (Yönetilen – "Seçenek A")
| Bileşen | Servis | Bölge |
|---|---|---|
| Uygulama | Vercel Pro | fra1 (Frankfurt) |
| Veritabanı | Neon (Launch/Scale) | aws-eu-central-1 |
| Medya | Cloudflare R2 | EU jurisdiction |
| DNS/WAF/CDN/Turnstile | Cloudflare (Free/Pro) | Global, AB veri |
| Rate limit / KV | Upstash Redis | eu-central |
| E-posta | Postmark | (ABD şirketi – SCC + DPA) / alternatif AB: Brevo, Scaleway TEM |
| Hata takibi | Sentry | EU (de.sentry.io) |
| Log & uptime | Better Stack | EU |
| Analitik | Plausible Cloud | EU |
| Arama (Faz 2) | Meilisearch Cloud | EU |

**Neden yönetilen:** 1–3 kişilik ekipte sunucu, yama, SSL, ölçekleme ile uğraşmamak; dikkat ürüne gitsin.

### 18.2 Alternatif (Bütçe/Egemenlik odaklı – "Seçenek B")
| Bileşen | Servis |
|---|---|
| Sunucu | Hetzner Cloud (Falkenstein/Nürnberg) – 2× CPX31 |
| PaaS katmanı | **Coolify** (self-host Heroku benzeri) veya Kamal |
| Uygulama | Next.js `standalone` Docker imajı |
| Veritabanı | Hetzner üzerinde Postgres + pgBackRest veya Ubicloud/Scaleway Managed Postgres |
| Reverse proxy + SSL | Caddy (on-demand TLS – özel domainler için ideal) |
| Medya | Cloudflare R2 (aynı) |
| Arama | Meilisearch konteyneri |

- %100 AB şirketleri, daha düşük maliyet; karşılığında operasyon yükü (yama, izleme, yedek) ekipte.
- **Karar:** MVP ve ilk yıl **Seçenek A**; aylık maliyet ~300 €'yu geçerse veya veri egemenliği şartı gelirse Seçenek B'ye geçiş (kod değişikliği gerektirmez – ADR-012).

### 18.3 Altyapı-as-Code
- Terraform (Cloudflare, Neon, Vercel provider'ları) – ortamlar yeniden üretilebilir.
- Küçük ekipte MVP için opsiyonel; en geç Faz 2'de zorunlu.

---

## 19. Gözlemlenebilirlik

| Sinyal | Araç | Detay |
|---|---|---|
| Hatalar | Sentry (`@sentry/nextjs`) | Her olaya `tenant.id`, `tenant.slug`, `user.role` etiketi; kişisel veri maskeleme |
| Performans/izleme | Sentry Tracing + Vercel Speed Insights | Web Vitals kiracı bazında |
| Loglar | Yapısal JSON (`pino`) → Better Stack | `tenantId`, `requestId`, `userId` alanları |
| Uptime | Better Stack Uptime | Ana domain, admin, 3 örnek kiracı, özel domain örnekleri, `/api/health` |
| İş kuyruğu | Özel admin ekranı (SA-10) + Sentry Crons | Başarısız iş alarmı |
| Analitik (ürün) | Plausible (public) + basit iç olay tablosu (admin kullanımı) | |
| Alarm | Better Stack → e-posta/Slack/Telegram | Hata oranı > %2, uptime düşüşü, SSL < 14 gün, R2 > %80 bütçe |

---

## 20. Güvenlik Mimarisi

| Alan | Uygulama |
|---|---|
| Taşıma | TLS 1.2+, HSTS (preload), Cloudflare WAF (OWASP kural seti) |
| Başlıklar | CSP (nonce tabanlı), `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, admin için `frame-ancestors 'none'` |
| Girdi doğrulama | Zod (tüm özel endpoint'ler), Payload alan validasyonları |
| XSS | React escape + rich text render'da sanitize; SVG yalnızca logo alanında ve DOMPurify ile |
| CSRF | SameSite çerez + Payload CSRF koruması (`csrf` whitelist) |
| Yükleme | MIME sniffing (`file-type`), uzantı whitelist, boyut sınırı, belgeler için virüs taraması (Faz 2) |
| Gizli anahtarlar | Vercel env (ortam bazlı), 90 günde rotasyon; repoda `gitleaks` taraması |
| Bağımlılıklar | Renovate + `pnpm audit` + Socket.dev/Snyk |
| Kimlik | Bölüm 10; süper admin 2FA zorunlu |
| Denetim | Append-only audit log tablosu (UPDATE/DELETE yetkisi olmayan DB rolü) |
| Şifreleme | Neon & R2 dinlenme halinde şifreli; TOTP sırları AES-256-GCM ile uygulama düzeyinde |
| Rate limiting | Upstash: giriş (5/15dk), form (3/10dk/IP), API (kiracı başına) |
| Bot koruması | Turnstile (form, giriş, magic link) |
| Penetrasyon testi | Faz 1 sonu ve yılda bir |

---

## 21. Yedekleme ve Felaket Kurtarma

| Varlık | Birincil | İkincil (off-site) |
|---|---|---|
| Postgres | Neon PITR (7–30 gün, plana göre) | Günlük `pg_dump` (şifreli, `age`) → **farklı sağlayıcı** (Backblaze B2 EU veya Hetzner Storage Box) – 14 günlük + 8 haftalık + 6 aylık |
| Medya (R2) | R2 dayanıklılığı (11×9) + bucket versioning | Haftalık `rclone sync` → Backblaze B2 EU |
| Kod & config | GitHub | Yerel ayna (opsiyonel) |

- **RPO:** ≤ 5 dk (PITR) / ≤ 24 saat (off-site)
- **RTO:** ≤ 4 saat — runbook: `docs/runbooks/disaster-recovery.md`
- Üç ayda bir **geri yükleme tatbikatı** (staging'e restore + smoke test).
- Kiracı bazlı geri yükleme: tek kiracının verisini `tenant_id` filtresiyle dump'tan geri getiren script.

---

## 22. Maliyet Tahmini (aylık, 50 dernek – Seçenek A)

| Kalem | Tahmini |
|---|---|
| Vercel Pro (1–2 koltuk) | 20–40 € |
| Neon (Launch) | 20–30 € |
| Cloudflare R2 (~250 GB, egress yok) | 4–6 € |
| Cloudflare (DNS/WAF Free) | 0 € |
| Upstash Redis | 0–10 € |
| Postmark (10–50 bin e-posta) | 15 € |
| Sentry (Team) | 0–26 € |
| Better Stack | 0–25 € |
| Plausible | 9–19 € |
| Domain (dernekhub.org) | ~1 € |
| **Toplam** | **≈ 70–170 € / ay** |

- 500 dernek ölçeğinde: ≈ 250–450 €/ay (DB ve Vercel kullanımı artar).
- Seçenek B (Hetzner + Coolify): 50 dernek için ≈ 40–70 €/ay (+ operasyon zamanı).
- Faz 2 ekleri: Meilisearch Cloud (~30 €), DeepL (~5–25 €), Brevo (kullanıma göre).

---

## 23. Değerlendirilen ve Reddedilen Alternatifler

| Alternatif | Neden seçilmedi |
|---|---|
| **WordPress Multisite** | Hızlı başlangıç ama: PHP + eklenti bağımlılığı, güvenlik yamaları, 50+ sitede tema/eklenti çakışmaları, modern tip güvenliği yok, özel admin deneyimi zor |
| **Strapi v5** | İyi bir headless CMS, ancak ayrı backend + ayrı frontend (iki deploy), resmi multi-tenancy yok, tip paylaşımı daha zayıf |
| **Directus** | Veritabanı-öncelikli güçlü yapı; ama lisans (BSL – gelir eşiği), ayrı servis, özel admin akışları (sihirbaz, tema önizleme) daha zahmetli |
| **Sanity / Contentful / Storyblok (SaaS CMS)** | Veri dışarıda, kiracı başına maliyet artar, 50+ "proje/space" yönetimi ve GDPR açısından dezavantaj |
| **Supabase + tamamen özel admin** | RLS mükemmel, ama admin panelini (medya, versiyon, blok editör, i18n) sıfırdan yazmak aylar sürer |
| **Laravel + Filament** | Olgun ve verimli; ancak frontend için ikinci dil/ekosistem (PHP + JS), Next.js kadar güçlü RSC/ISR yok. Ekip PHP biliyorsa ciddi alternatif |
| **Django + Wagtail** | Wagtail çok iyi bir CMS ve multi-site destekler; Python + ayrı frontend, modern React şablon deneyimi için ek katman gerekir |
| **Astro + headless CMS** | Public site için harika performans, ancak admin ve dinamik kısımlar için ikinci uygulama gerekir |
| **Kiracı başına ayrı veritabanı/şema** | Güçlü izolasyon ama 50–500 DB'de migrasyon, bağlantı ve maliyet yönetimi ağır; ihtiyaç yok |
| **Mikroservisler / Kubernetes** | Ekip ve ölçek için aşırı karmaşık |

---

## 24. Riskler, Bağımlılıklar ve Çıkış Planı (Lock-in)

| Risk | Olasılık | Etki | Önlem / Çıkış planı |
|---|---|---|---|
| Payload CMS'in yön değiştirmesi (Figma bünyesinde) | Düşük–Orta | Yüksek | MIT lisanslı, veri kendi Postgres'imizde; iş mantığı `modules/` içinde Payload'dan bağımsız servis fonksiyonlarında; gerekirse fork edilebilir |
| Payload multi-tenant eklentisinin eksik kalması | Orta | Orta | Eklenti ince bir katman; gerekirse kendi `tenant` alanı + access fonksiyonlarımızla değiştirilebilir (izolasyon testleri güvence) |
| Vercel maliyet artışı / lock-in | Orta | Orta | `standalone` Docker build CI'da her sürümde üretilir ve test edilir → Hetzner/Coolify'a 1–2 günde geçiş (ADR-012) |
| Serverless süre/gövde limitleri (büyük yüklemeler) | Orta | Orta | Doğrudan R2 yükleme, kuyruk tabanlı işleme, gerekirse ayrı worker süreci |
| Neon bağımlılığı | Düşük | Orta | Standart Postgres; `pg_dump`/restore ile herhangi bir Postgres'e taşınır |
| Next.js büyük sürüm değişiklikleri | Orta | Orta | Renovate + kapsamlı E2E; büyük sürümler planlı sprintlerde |
| Tek geliştiriciye bağımlılık (bus factor) | Yüksek | Yüksek | ADR'ler, runbook'lar, seed + tek komutla kurulum, yaygın teknolojiler (kolay işe alım) |
| Kiracı izolasyon hatası | Düşük | Çok yüksek | Bölüm 6.3 katmanları + zorunlu CI test paketi + pentest |

---

## 25. Mimari Karar Kayıtları (ADR) Listesi

| ADR | Karar | Durum |
|---|---|---|
| ADR-001 | Uçtan uca TypeScript | Kabul |
| ADR-002 | Modüler monolit, tek deploy | Kabul |
| ADR-003 | Next.js App Router + RSC | Kabul |
| ADR-004 | Payload CMS 3 (Next.js içinde) admin/backend olarak | Kabul |
| ADR-005 | PostgreSQL + Payload Postgres adaptörü (Drizzle) | Kabul |
| ADR-006 | Paylaşımlı DB, `tenant` sütunu (pool model) | Kabul |
| ADR-007 | İzolasyon: access control + tek veri erişim modülü + CI testleri; RLS Faz 1.5 public okuma yolunda | Kabul |
| ADR-008 | Host tabanlı kiracı çözümleme (önbellek: ADR-020) | Kabul |
| ADR-009 | Tailwind v4 + CSS değişkenleriyle tema token'ları | Kabul |
| ADR-010 | Medya: Cloudflare R2 + doğrudan istemci yükleme | Kabul |
| ADR-011 | Arama: MVP Postgres FTS, Faz 2 Meilisearch | Kabul |
| ADR-012 | Barındırma: Vercel + Neon; Docker çıkış planı her sürümde doğrulanır | Kabul |
| ADR-013 | Arka plan işleri: Payload Jobs Queue + cron | Kabul |
| ADR-014 | E-posta: Postmark + React Email | Kabul |
| ADR-015 | Çerezsiz public site (Plausible, self-host fontlar, OSM) | Kabul |
| ADR-016 | Monorepo: pnpm + Turborepo; lint/format: Biome | Kabul |
| ADR-017 | Test: Vitest + Testcontainers + Playwright; izolasyon testleri merge şartı | Kabul |
| ADR-018 | Özel domain: Vercel Domains API (alternatif Cloudflare for SaaS) | Önerildi (Faz 2) |
| ADR-019 | `exactOptionalPropertyTypes` – H1 uyumluluk denemesine göre karar | Önerildi (H1) |
| ADR-020 | Kiracı çözümleme önbelleği: Upstash Redis (Edge Config yerine, CLAUDE.md §2 uyumu) | Önerildi |
| ADR-021 | Faz 2/3 servisleri (Brevo, DeepL, Stripe, HelloAsso) ADR onayına kadar aday | Önerildi |

ADR dosyaları `docs/adr/` altındadır (dizin: `docs/adr/README.md`). ADR şablonu (`docs/adr/000-template.md`): *Bağlam → Karar → Değerlendirilen seçenekler → Sonuçlar → Durum*.

---

## 26. Uygulama Yol Haritası (Teknik)

| Hafta | Teknik çıktı |
|---|---|
| H1 | Monorepo iskeleti, CI, Docker Compose, Payload + Next.js kurulumu, Neon/Vercel/R2 hesapları, Sentry |
| H2 | `tenants`, `domains`, `users`, `memberships` koleksiyonları; multi-tenant plugin; middleware kiracı çözümleme; **izolasyon test paketi v1** |
| H3 | Auth: davet, magic link, kilitleme, süper admin 2FA; access modülü |
| H4 | Tema token sistemi, public layout, 3 ana sayfa varyantı iskeleti |
| H5–H6 | Media hattı (presigned upload, işleme job'u, varyantlar, kota) ; Sayfalar + blok editör |
| H7–H8 | Haberler, etkinlikler (rrule, ics), kategori/etiket, taslak/zamanlama, revalidation |
| H9 | Albümler + lightbox, belgeler (sürüm, internal, PDF işleme) |
| H10 | Arama (Postgres FTS), arşiv sayfaları, SEO eklentisi, sitemap, JSON-LD, redirects |
| H11 | i18n (TR/FR), iletişim formu + Turnstile + Postmark, yasal metin şablonları |
| H12 | Kurulum sihirbazı, dashboard, süper admin ekranları, audit log, CSV import |
| H13–H14 | E2E + axe + Lighthouse, yük testi, güvenlik taraması, Docker çıkış build'i, runbook'lar |
| H15–H16 | Pilot (3 dernek), hata düzeltme, yedekten dönme tatbikatı → **MVP canlı** |

---

*Doküman sonu – v1.0. Kararlar ADR'lere dönüştürülüp `docs/adr/` altında versiyonlanacaktır.*

