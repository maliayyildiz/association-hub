# DernekHub – Proje Anayasası (Base Rules)

> Bu dosya projenin **bağlayıcı temel kurallarıdır**. İnsan veya AI, projede çalışan herkes bu kurallara uyar.
> Kaynak dokümanlar: `docs/spec/dernek-platformu-spec.md` (PRD) ve `docs/spec/dernek-platformu-teknik-mimari.md` (SAD).
> **Bu kuralların dışına çıkılmaz.** Bir kuralı değiştirmenin tek yolu Bölüm 15'teki ADR sürecidir.

Kural dili:
- **MUST / ZORUNLU**: İstisnasız uyulur. İhlal eden PR merge edilmez.
- **MUST NOT / YASAK**: Hiçbir koşulda yapılmaz.
- **SHOULD / ÖNERİLİR**: Varsayılan davranış. Sapma PR açıklamasında gerekçelendirilir.

---

## 0. Altın Kurallar (ezberle)

1. **Kiracı izolasyonu kutsaldır.** Hiçbir sorgu, cache key, dosya yolu veya log `tenantId` olmadan yazılmaz.
2. **Stack kilitlidir.** Bölüm 2'deki liste dışında runtime bağımlılığı ADR olmadan eklenmez.
3. **Tek uygulama, tek deploy.** Yeni servis, mikroservis veya ikinci backend açılmaz.
4. **Konfigürasyon evet, dernek özel kod hayır.** `if (tenant.slug === 'x')` gibi kod yasaktır.
5. **TypeScript strict, `any` yok.**
6. **Testsiz özellik yoktur.** İzolasyon testleri kırmızıysa hiçbir şey merge edilmez.
7. **Kişisel veri AB'de kalır, public site çerezsizdir.**
8. **Spec'te olmayan özellik yazılmaz.** Önce PRD güncellenir, sonra kod yazılır.

---

## 1. Proje Bağlamı

- 50+ derneğin tek şablon üzerinden kendi sitelerini yönettiği **çok kiracılı (multi-tenant) SaaS**.
- Her dernek kendi logosunu, renklerini ve içeriğini yönetir: haber, etkinlik, galeri, belge ve arşiv.
- Kullanıcılar teknik değildir. **Mobil öncelikli, sade admin deneyimi** zorunludur.
- Ekip küçüktür (1–3 geliştirici). Bu yüzden her karar **sadelik ve bakım kolaylığı** ölçütüyle verilir.

---

## 2. Kilitli Teknoloji Yığını

| Alan | Kullanılacak | Kullanılmayacak (örnekler) |
|---|---|---|
| Dil | TypeScript (strict) | JavaScript dosyası (`.js`) – yalnızca config istisnası; Python/PHP/Go servisleri |
| Runtime | Node.js LTS (`.nvmrc`) | Bun, Deno (prod'da) |
| Framework | Next.js App Router | Pages Router, Remix, Express/Fastify ayrı sunucu |
| CMS/Backend | Payload CMS 3 (Next.js içinde) + `@payloadcms/plugin-multi-tenant` | Strapi, Directus, ayrı REST/GraphQL backend |
| DB | PostgreSQL + `@payloadcms/db-postgres` | MongoDB, Prisma, TypeORM, ikinci bir DB |
| ORM / ham SQL | Payload Local API; gerekirse Drizzle (`payload.db.drizzle`) | Ad-hoc `pg` client, string birleştirerek SQL |
| UI | React Server Components, Tailwind CSS v4, shadcn/ui, lucide-react | MUI, Chakra, Bootstrap, styled-components, CSS-in-JS |
| Formlar | React Hook Form + Zod | Formik, Yup |
| i18n | Payload localization + `next-intl` | i18next, elle yazılmış çeviri objeleri |
| Medya | Cloudflare R2 + `@payloadcms/storage-s3` + `sharp` | Yerel diske yazma, Vercel Blob, Cloudinary |
| Arama | Postgres FTS (`unaccent`, `pg_trgm`) → Faz 2 Meilisearch | Algolia, Elasticsearch |
| İşler | Payload Jobs Queue + Vercel Cron | BullMQ, Inngest, Temporal (ADR olmadan) |
| E-posta | Postmark + React Email | Nodemailer + SMTP, SendGrid |
| Tarih | `date-fns`, `date-fns-tz`, `rrule`, `ical-generator` | moment, dayjs, luxon |
| Rate limit / KV | Upstash Redis | Bellek içi sayaç (serverless'ta çalışmaz) |
| Captcha | Cloudflare Turnstile | Google reCAPTCHA |
| Harita | MapLibre GL + OSM/MapTiler | Google Maps (varsayılan olarak) |
| Analitik | Plausible | Google Analytics, Meta Pixel, Hotjar |
| Hata/log | Sentry, `pino` → Better Stack | `console.log` (prod kodda) |
| Test (yalnızca test araçları*) | Vitest, Testcontainers, Playwright, `@axe-core/playwright`, k6 (+ k6 browser), Lighthouse CI, Mailpit, MinIO | Jest, Cypress, JMeter, Locust, Artillery |
| Lint/format | Biome | Prettier + ESLint ikilisi (ayrı ayrı) |
| Paket/monorepo | pnpm + Turborepo | npm, yarn, Nx, Lerna |
| Hosting | Vercel (fra1) + Neon (EU) + Cloudflare | AB dışı bölge |

\* **Test araçları kuralı:** Test araçları yalnızca `devDependencies`'de, Docker Compose'da veya `perf/` klasöründe bulunur. Uygulama kodu (`apps/web/src`) bu araçlara asla import yoluyla bağımlı olmaz. k6 scriptleri yalnızca `perf/k6/` altında yaşar ve uygulama build'ine dahil edilmez.

**Yeni bağımlılık eklerken (MUST):**
- Önce mevcut yığında çözüm var mı bak.
- Paket aktif bakımda olmalı (son 12 ayda sürüm), lisansı MIT/Apache-2.0/BSD/ISC olmalı ve tip desteği bulunmalı.
- `dependencies`'e eklenen her runtime paketi PR açıklamasında gerekçelendirilir. Ağır bir paket (> 50 KB gzip, istemci tarafı) için ADR gerekir.
- Sürümler `pnpm-lock.yaml` ile sabitlenir. Güncellemeler Renovate üzerinden yapılır.

---

## 3. Mimari Kurallar

### 3.1 Modüler Monolit
- Kod `apps/web/src/modules/<modül>/` altında. Modüller: `tenancy, identity, branding, content, media, search, engagement, portal, platform, compliance, notifications`.
- **MUST:** Bir modül başka bir modüle yalnızca `modules/<x>/index.ts` üzerinden erişir. Derin import yapılmaz (`modules/x/internal/...` yasak).
- **MUST:** İş mantığı saf TypeScript servis fonksiyonlarında (`modules/<x>/services/*.ts`) yazılır. Payload hook'ları ve route handler'lar yalnızca bu servisleri çağıran **ince katmanlardır**.
- **MUST NOT:** Modüller arasında döngüsel bağımlılık oluşmaz (`dependency-cruiser` CI kontrolü).

### 3.2 Katmanlar
```
app/ (route, page, layout)  →  modules/*/index.ts (servisler, sorgular)  →  Payload Local API / Drizzle
components/site (sunum)       ↑ yalnızca veri alır, veri çekmez (RSC page'ler çeker)
```
- **MUST:** Public sitede veri yalnızca `modules/content/queries.ts` (ve diğer modüllerin `queries.ts` dosyaları) üzerinden çekilir. Bu fonksiyonların **ilk parametresi her zaman `tenantId`'dir**.
- **MUST NOT:** `app/_sites/**` veya `components/site/**` içinde doğrudan `payload.find/findByID/...` çağrılmaz. Bu kural lint ile zorlanır.
- **SHOULD:** Varsayılan bileşen Server Component'tir. `'use client'` yalnızca etkileşim gerektiren yaprak (leaf) bileşenlerde kullanılır.

### 3.3 Rota Yapısı
- Public: `app/_sites/[tenant]/[locale]/...` (middleware rewrite ile). Portal: `app/_portal/...`. Admin: Payload `(payload)` grubu. Özel API: `app/api/<modül>/<eylem>/route.ts`.
- **MUST NOT:** Yeni üst seviye rota grubu ADR olmadan açılmaz.

---

## 4. Çok Kiracılık Kuralları

- **MUST:** Kiracıya ait her koleksiyon `tenant` alanına sahiptir ve `plugin-multi-tenant` kapsamına eklenir. Platform düzeyindeki koleksiyonlar (`tenants`, `plans`, `users`, global ayarlar) açıkça "platform" olarak işaretlenir.
- **MUST:** Her koleksiyonun `access` fonksiyonları `src/access/` içindeki merkezi yardımcılardan gelir: `isSuperAdmin`, `isTenantAdmin`, `isTenantEditor`, `canPublish`, `tenantScoped`. Koleksiyon dosyasında inline yetki mantığı yazılmaz.
- **MUST:** `create` işlemlerinde `tenant` değeri istemciden gelen değere güvenilerek değil, kullanıcının yetkili olduğu kiracılara göre sunucuda doğrulanır.
- **MUST:** Önbellek etiketleri `tenant:{id}:...` önekini taşır. Unstable cache key'lerinde `tenantId` bulunur.
- **MUST:** R2 dosya anahtarları `tenants/{tenantId}/{media|documents|exports}/...` biçimindedir.
- **MUST:** Her log satırı ve Sentry olayı `tenantId` taşır (varsa).
- **MUST:** Yeni bir koleksiyon veya endpoint eklendiğinde **izolasyon test paketi** de güncellenir (`tests/isolation/`).
- **MUST NOT:** Kiracı kimliği query string'den veya body'den okunmaz. Public tarafta kiracı yalnızca middleware'in çözdüğü Host → `tenantId` ile belirlenir, admin tarafta ise kullanıcının seçili kiracısıyla.
- **MUST NOT:** Dernek özelinde kod dalı yazılmaz. Farklılıklar `tenant.settings` (feature flag) veya tema token'larıyla çözülür.
- **MUST NOT:** Süper admin bypass'ı servis katmanında sessizce yapılmaz. Destek erişimi audit log'a yazılır.

---

## 5. Kod Standartları

### 5.1 TypeScript
- **MUST:** `strict: true`, `noUncheckedIndexedAccess: true`.
- **SHOULD:** `exactOptionalPropertyTypes: true`. Proje kurulumunda (H1) Payload'ın ürettiği tiplerle uyumu denenir. Çakışma çıkarsa kapatılır ve kararı ADR-019 olarak kaydedilir. Karar verildikten sonra değiştirilmez.
- **MUST NOT:** `any`, `@ts-ignore`, `as unknown as` kullanılmaz. Zorunlu bir istisnada `@ts-expect-error <gerekçe>` yazılır ve PR'da belirtilir.
- **MUST:** Payload tipleri `pnpm payload generate:types` ile üretilir (`payload-types.ts`) ve elle düzenlenmez.
- **MUST:** Dış girdiler (form, query param, webhook, CSV, env) **Zod** ile doğrulanır. Env değişkenleri `src/env.ts` içinde tek bir Zod şemasıyla okunur. `process.env.X` başka yerde kullanılmaz.

### 5.2 İsimlendirme
| Öğe | Kural | Örnek |
|---|---|---|
| Dosya/klasör | kebab-case | `event-card.tsx`, `build-theme-css.ts` |
| React bileşeni | PascalCase | `EventCard` |
| Fonksiyon/değişken | camelCase | `getUpcomingEvents` |
| Sabit | UPPER_SNAKE | `MAX_UPLOAD_MB` |
| Tip/arayüz | PascalCase, `I` öneki yok | `TenantTheme` |
| Payload koleksiyon slug | kebab-case, çoğul | `posts`, `board-members` |
| DB alan adı (Payload) | camelCase | `publishedAt` |
| Cache tag | `tenant:{id}:{kaynak}[:{slug}]` | `tenant:42:posts` |
| Job adı | `modül.eylem` | `media.process` |
| Env | UPPER_SNAKE, öneksiz sunucu, `NEXT_PUBLIC_` istemci | `POSTMARK_TOKEN` |

- **MUST:** Kod, tanımlayıcılar, commit mesajları ve kod yorumları **İngilizce**. Kullanıcıya görünen metinler i18n dosyalarında TR/FR/EN.

### 5.3 Fonksiyonlar ve Hatalar
- **SHOULD:** Fonksiyonlar < 50 satır, dosyalar < 300 satır. Aşılırsa bölünür.
- **MUST:** Servis fonksiyonları beklenen hataları tipli olarak döndürür (`Result<T, DomainError>` veya `DomainError` sınıfları). Kullanıcıya ham hata mesajı veya stack trace gösterilmez.
- **MUST:** Kullanıcıya görünen hata mesajları i18n anahtarıdır (`errors.slugTaken`).
- **MUST NOT:** Boş `catch {}` yazılmaz. Hata en azından loglanır veya yeniden fırlatılır.
- **MUST NOT:** Prod kodda `console.log` kullanılmaz. Logger: `import { logger } from '@/lib/logger'`.

### 5.4 Stil ve UI
- **MUST:** Public şablon bileşenleri **yalnızca tema token'larını** kullanır (`bg-primary`, `text-primary-fg`, `font-heading`, `rounded-[--radius]`). Sabit HEX renk yazılmaz.
- **MUST:** shadcn/ui bileşenleri `packages/ui` içinde tutulur. Aynı bileşenin ikinci bir kopyası açılmaz.
- **MUST:** Görseller `next/image` + proje loader'ı ile kullanılır. `alt` zorunludur.
- **MUST:** Her etkileşimli öğe klavye ile erişilebilir olur ve görünür bir odak durumu taşır.
- **MUST:** Admin özel bileşenleri 375 px genişlikte kullanılabilir olur.
- **MUST NOT:** Inline `style={{}}` kullanılmaz. Tek istisna, tema token'larının enjekte edildiği layout'tur.

---

## 6. Veri ve Migrasyon Kuralları

- **MUST:** Şema değişikliği yalnızca Payload config değişikliği + `pnpm payload migrate:create <isim>` ile yapılır. Migrasyon dosyaları repoya commit edilir.
- **MUST:** Migrasyonlar **expand → migrate → contract** düzenini izler. Bir sürümde sütun eklenir (nullable), sonraki sürümde eski sütun silinir. Yıkıcı değişiklik tek PR'da yapılmaz.
- **MUST NOT:** Prod'da `push: true` (otomatik şema senkronu) açılmaz.
- **MUST NOT:** Yayınlanmış bir migrasyon dosyası sonradan düzenlenmez. Yenisi yazılır.
- **MUST:** Silmeler varsayılan olarak **soft delete**'tir (çöp kutusu, 30 gün). Kalıcı silme yalnızca retention job'ları ve kiracı silme akışıyla yapılır.
- **MUST:** Aranan ve filtrelenen her alan için index tanımlanır (`index: true`). Tüm koleksiyonlarda `tenant` + sık filtrelenen alanlar için bileşik index bulunur.
- **MUST:** Yayın durumu, tarih ve slug benzersizliği PRD Bölüm 10'daki iş kurallarına (BR-xx) uyar. İlgili kodda kural ID'si yorum olarak yazılır: `// BR-CNT-01`.

---

## 7. Güvenlik Kuralları

- **MUST:** Tüm özel API route'larında sırasıyla şu kontroller yapılır: kimlik → kiracı yetkisi → Zod doğrulama → rate limit.
- **MUST:** Rich text ve SVG render'larında sanitize yapılır (DOMPurify). `dangerouslySetInnerHTML` yalnızca sanitize edilmiş içerikle ve `lib/safe-html.ts` üzerinden kullanılır.
- **MUST:** Dosya yüklemede MIME türü içerikten tespit edilir (`file-type`), uzantı whitelist'i ve boyut sınırları (PRD Bölüm 16) uygulanır.
- **MUST:** Internal belgeler yalnızca kısa ömürlü imzalı URL ile servis edilir (≤ 10 dk).
- **MUST:** Gizli değerler yalnızca env'de tutulur. Repoda secret bulunmaz (`gitleaks` CI'da çalışır).
- **MUST:** Giriş, magic link, iletişim formu ve davet endpoint'lerinde Turnstile ve rate limit bulunur.
- **MUST:** Süper admin ve destek rollerinde 2FA zorunludur.
- **MUST NOT:** Kişisel veri URL'de veya query string'de taşınmaz, log'a düz yazılmaz (e-posta maskelenir, IP kısaltılır).
- **MUST NOT:** Kullanıcı girdisiyle ham SQL birleştirilmez. Yalnızca parametreli Drizzle/Payload sorguları kullanılır.

---

## 8. Gizlilik (GDPR) Kuralları

- **MUST:** Public site varsayılan olarak **çerezsizdir**. Üçüncü taraf embed'ler (YouTube, Vimeo, Google Maps) yalnızca onay bileşeni (`<ConsentEmbed>`) arkasında yüklenir. YouTube için `youtube-nocookie.com` kullanılır.
- **MUST:** Fontlar self-host edilir. Google Fonts CDN'i çağrılmaz.
- **MUST:** Yüklenen görsellerden EXIF GPS verisi silinir.
- **MUST:** Yeni bir kişisel veri alanı ekleniyorsa saklama süresi ve silme job'u da eklenir, ayrıca PRD Bölüm 14 güncellenir.
- **MUST:** Tüm kişisel veri işleyen 3. taraf servisler AB bölgesinde çalışır veya DPA/SCC kapsamındadır. Yeni bir servis ADR gerektirir.
- **MUST NOT:** Google Analytics, Meta Pixel ve benzeri izleyiciler eklenmez.

---

## 9. Performans Bütçeleri

| Metrik | Bütçe (CI'da kontrol) |
|---|---|
| Lighthouse Performance (public, mobil) | ≥ 90 |
| Lighthouse Accessibility / SEO | ≥ 95 |
| LCP / INP / CLS | < 2,5 sn / < 200 ms / < 0,1 |
| Public sayfa istemci JS (route başı, gzip) | ≤ 120 KB |
| Yayın → public görünürlük | ≤ 60 sn |
| Arama yanıtı | ≤ 300 ms |

- **MUST:** Public sayfalar önbelleklenebilir olur (ISR + `revalidateTag`). Public sayfada `cache: 'no-store'` veya `dynamic = 'force-dynamic'` kullanmak ADR gerektirir.
- **MUST:** İçerik değiştiren her hook ilgili `tenant:{id}:...` etiketlerini yeniler.
- **MUST:** Ağır işler (görsel/PDF işleme, toplu e-posta, indeksleme, export) istek döngüsünde değil, **Payload Jobs** ile yapılır.
- **MUST NOT:** Liste sorgularında N+1 oluşmaz. `depth` açıkça belirtilir (varsayılan `depth: 1`) ve `select` ile yalnızca gereken alanlar çekilir.

---

## 10. Çoklu Dil Kuralları

- **MUST:** Kullanıcıya görünen hiçbir metin koda gömülmez. Public metinler `messages/{tr,fr,en}.json` içinde, admin metinleri Payload `i18n` çevirilerinde tutulur.
- **MUST:** Yeni bir çeviri anahtarı eklendiğinde TR, FR ve EN değerlerinin üçü birden eklenir (CI'da eksik anahtar kontrolü).
- **MUST:** İçerik alanlarında `localized: true` kullanılır. Dil bağımsız alanlar (tarih, medya, konum) localize edilmez.
- **MUST:** Tarih, sayı ve saat biçimlendirmesi `Intl` ve kiracının saat dilimiyle yapılır. Sabit format string'i kullanılmaz.

---

## 11. Test ve Definition of Done

Bir iş **ancak şu koşulların tamamı sağlandığında "bitti" sayılır:**

- [ ] PRD'deki ilgili user story'nin kabul kriterleri karşılandı (PR'da US ID'si yazılı: `US-05.1`).
- [ ] Servis fonksiyonları için **birim testleri** var (Vitest).
- [ ] Koleksiyon/hook/job değişikliği için **entegrasyon testi** var (Testcontainers Postgres).
- [ ] Yeni koleksiyon veya endpoint **izolasyon test paketine** eklendi ve paket yeşil.
- [ ] Kullanıcı akışı değiştiyse **Playwright E2E** senaryosu eklendi ya da güncellendi.
- [ ] axe erişilebilirlik kontrolünde ciddi ihlal yok.
- [ ] TR/FR/EN çevirileri tam.
- [ ] Migrasyon (varsa) oluşturuldu, geriye uyumlu ve preview ortamında çalıştı.
- [ ] `pnpm check` (Biome + tsc + test) yeşil.
- [ ] Gerekiyorsa dokümantasyon (ADR, runbook, PRD) güncellendi.

**Test kuralları:**
- **MUST:** Testler gerçek Postgres ile çalışır. DB mock'lanmaz. Dış servisler (Postmark, R2, DeepL) adaptör seviyesinde mock'lanır.
- **MUST:** Test verisi factory fonksiyonlarıyla üretilir (`tests/factories`). Testler sırayla değil bağımsız çalışabilir olmalıdır.
- **MUST NOT:** Flaky test `skip` edilip unutulmaz. Issue açılır ve 1 sprint içinde düzeltilir.

---

## 12. Git ve PR Akışı

- Ana dal: `main` (her zaman deploy edilebilir). Dal adları: `feat/US-05.1-quick-news`, `fix/...`, `chore/...`, `docs/...`.
- **MUST:** Commit'ler Conventional Commits biçiminde yazılır (`feat(content): add scheduled publish for posts`).
- **MUST:** `main`'e doğrudan push yapılmaz. Her değişiklik PR ile gelir ve tüm CI kontrollerinden geçer.
- **MUST:** PR'lar küçük tutulur (SHOULD: < 400 satır değişiklik, migrasyonlar ve üretilen tipler hariç).
- **MUST:** PR şablonu doldurulur: amaç, US/BR referansları, ekran görüntüsü (UI), test kanıtı, migrasyon notu, risk.
- **MUST:** En az 1 onay alınır. Tek geliştirici varsa `code-reviewer-architect` skill'i ile öz-inceleme yapılır ve checklist PR'a eklenir.
- **MUST:** Kullanıcıyı etkileyen değişikliklerde `changeset` eklenir.

---

## 13. Yeni Özellik Ekleme Tarifi (standart sıra)

1. PRD'de ilgili US ve BR'yi bul. Yoksa **dur** ve `product-owner-ba` ile önce PRD'yi güncelle. Story `WORKFLOW.md` §3'teki **Definition of Ready** koşullarını sağlamıyorsa geliştirmeye başlanmaz.
2. Modülü belirle (`modules/<x>`). Yeni modül gerekiyorsa ADR yaz.
3. Payload koleksiyonunu ya da alanlarını ekle: `tenant` kapsamı, merkezi `access` yardımcıları, `localized`, `index`, `versions`.
4. `pnpm payload generate:types` ve `pnpm payload migrate:create`.
5. Servis fonksiyonları ve birim testleri.
6. Hook'lar: revalidation, arama indeksleme job'u, audit log.
7. `queries.ts` içine public sorgu (ilk parametre `tenantId`).
8. Public UI (`components/site`, yalnızca token'lar) ve admin özel bileşenleri (gerekirse).
9. i18n anahtarları (TR/FR/EN).
10. İzolasyon, entegrasyon ve E2E testleri.
11. Definition of Done kontrol listesi → PR.

---

## 14. Yasaklar Listesi (özet)

- ❌ Tenant filtresi olmayan sorgu, cache, dosya yolu
- ❌ Dernek adına/slug'ına göre `if` blokları
- ❌ Bölüm 2 dışı framework, UI kütüphanesi, ORM, veritabanı
- ❌ Ayrı backend, mikroservis, ikinci deploy
- ❌ `any`, `@ts-ignore`, boş `catch`, prod `console.log`
- ❌ Sabit renkler, inline style, koda gömülü kullanıcı metni
- ❌ Google Analytics, Google Fonts CDN, reCAPTCHA, onaysız embed
- ❌ Prod'da `push: true`, yayınlanmış migrasyonu düzenlemek
- ❌ DB mock'layan test, testsiz merge
- ❌ Spec'te olmayan özellik, ADR'siz mimari değişiklik
- ❌ AB dışında kişisel veri saklama

---

## 15. Kural Değiştirme Süreci (ADR)

1. `docs/adr/NNN-baslik.md` dosyası açılır: **Bağlam → Karar → Seçenekler → Sonuçlar → Durum**.
2. ADR, PR olarak sunulur. Platform sahibi/mimar onaylar.
3. Onaylanınca bu dosya (`CLAUDE.md`) ve ilgili spec güncellenir.
4. ADR onaylanmadan kuralı ihlal eden kod merge edilmez.

---

## 16. Skill'ler (Roller)

Geliştirme işleri aşağıdaki rollerle yürütülür. Her rolün detaylı talimatı `.claude/skills/<rol>/SKILL.md` içindedir. Rollerin hangi sırayla çalıştığı ve birbirine ne teslim ettiği **`WORKFLOW.md`**'de tanımlıdır.

| Skill | Ne zaman |
|---|---|
| `product-owner-ba` | Yeni istek, PRD güncellemesi, user story ve kabul kriteri yazımı, önceliklendirme, UAT |
| `ui-ux-designer` | Ekran tasarımı, wireframe, tasarım token'ları, şablon düzenleri, UX metinleri, kullanılabilirlik testi |
| `fullstack-developer` | Her özellik geliştirme işi (koleksiyon → servis → UI → test) |
| `qa-test-engineer` | Vitest birim/entegrasyon testleri, izolasyon paketi |
| `senior-qa-lead` | Test stratejisi, Playwright altyapısı, kalite kapıları, sürüm onayı (aşağıdaki 4 skill'i yönetir) |
| `playwright-api-testing` | API: yetki matrisi, kiracı izolasyonu, sözleşme, güvenlik |
| `playwright-ui-e2e` | UI/E2E akışları, mobil, görsel regresyon |
| `accessibility-testing` | WCAG 2.1 AA: axe, klavye, ARIA, tema kontrastı |
| `load-performance-testing` | k6 yük/stres/spike/soak, k6 browser, Lighthouse CI |
| `devops-platform-engineer` | CI/CD, ortamlar, migrasyon yayını, gözlemlenebilirlik, yedekleme, domain/SSL |
| `code-reviewer-architect` | Her PR öncesi inceleme, kural/ADR uyumu, mimari kararlar |

---

## 17. Komutlar

```bash
pnpm i                       # bağımlılıklar
docker compose -f infra/docker-compose.yml up -d   # postgres, minio, mailpit, meilisearch
pnpm dev                     # http://dernek-a.dernekhub.localhost:3000 , /admin
pnpm seed                    # 3 örnek dernek + içerik
pnpm check                   # biome + tsc + vitest
pnpm test:isolation          # kiracı izolasyon paketi
pnpm test:e2e                # playwright
pnpm payload generate:types
pnpm payload migrate:create <name>
pnpm payload migrate
```
