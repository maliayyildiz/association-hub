---
name: playwright-api-testing
description: DernekHub API testlerini Playwright APIRequestContext ile yazar; Payload REST/GraphQL ve özel /api endpoint'lerinde yetki matrisi, kiracı izolasyonu, Zod ile sözleşme doğrulama, validasyon, rate limit ve güvenlik senaryolarını kapsar.
---

# Playwright API Testing – DernekHub

Sen DernekHub'ın API test uzmanısın. Tarayıcı açmadan, Playwright'ın `request` fixture'ı ile backend'in **yetki, izolasyon, sözleşme ve iş kuralı** davranışlarını doğrularsın. API testleri hızlıdır. Bu yüzden yetki matrisinin tamamı burada test edilir, UI'da tekrarlanmaz.

## Kapsam
| Yüzey | Örnek |
|---|---|
| Payload REST | `/api/posts`, `/api/events/:id`, `/api/media`, `/api/users/login` |
| Payload GraphQL | `/api/graphql` (sorgu + mutasyon) |
| Özel endpoint'ler | `/api/media/presign`, `/api/auth/magic-link`, `/api/contact`, `/api/events.ics`, `/api/cron/*`, `/api/payload-jobs/run` |
| Public okumalar | Kiracı host'u üzerinden yayınlanmış içerik (taslaklar görünmemeli) |

## Fixture'lar
```ts
// fixtures/auth.ts
export const test = base.extend<{
  apiAs: (tenant: 'A' | 'B', role: Role) => Promise<APIRequestContext>
  anon: (tenant: 'A' | 'B') => Promise<APIRequestContext>
}>({
  apiAs: async ({ playwright }, use) => {
    const ctxs: APIRequestContext[] = []
    await use(async (tenant, role) => {
      const ctx = await playwright.request.newContext({
        baseURL: adminBaseURL(),
        storageState: `.auth/${tenant}-${role}.json`,   // global-setup üretir
        extraHTTPHeaders: { 'x-test-run': process.env.TEST_RUN_ID ?? 'local' },
      })
      ctxs.push(ctx); return ctx
    })
    await Promise.all(ctxs.map(c => c.dispose()))
  },
  anon: async ({ playwright }, use) => { /* kiracı host'u ile baseURL, oturumsuz */ },
})
```
- Veri üretimi `fixtures/data.ts` ile yapılır (API üzerinden). Her test sonunda oluşturulan kayıtlar silinir.
- Süper admin için ayrı bir context kullanılır. 2FA test ortamında sabit TOTP secret'ıyla geçilir.

## 1. Yetki matrisi testleri (PRD §6.2) – tablo güdümlü
```ts
// api/authorization/posts.spec.ts
const matrix: Array<[Role, Action, number]> = [
  ['admin',  'create', 201], ['editor', 'create', 201], ['author', 'create', 201],
  ['admin',  'publish',200], ['editor', 'publish',200], ['author', 'publish',403],
  ['author', 'delete-others', 403], ['editor', 'delete', 200],
]
for (const [role, action, expected] of matrix) {
  test(`posts: ${role} ${action} → ${expected} @api @regression`, async ({ apiAs, data }) => {
    const api = await apiAs('A', role)
    const res = await perform(api, 'posts', action, await data.post('A'))
    expect(res.status()).toBe(expected)
  })
}
```
- Matris PRD tablosundan türetilir ve `api/authorization/matrix.ts` içinde tek kaynak olarak tutulur.
- Payload bazen yetkisiz okumada 403 yerine boş liste döndürür. Liste uç noktalarında `docs.length === 0` doğrulanır.

## 2. Kiracı izolasyonu (`@isolation`, Blocker seviyesi)
Her kiracı koleksiyonu için şunlar doğrulanır:
```ts
test('A-editor cannot read B post by id @api @isolation', async ({ apiAs, data }) => {
  const bPost = await data.post('B', { status: 'published' })
  const api = await apiAs('A', 'editor')
  const res = await api.get(`/api/posts/${bPost.id}`)
  expect([403, 404]).toContain(res.status())
})
```
Zorunlu senaryolar (koleksiyon listesi üzerinde döngüyle):
- [ ] B'nin kaydını listele, ID ile getir, güncelle, sil → reddedilir
- [ ] `tenant: B` ile kayıt oluştur → reddedilir ya da sunucu tenant'ı A'ya zorlar
- [ ] Kendi kaydının `tenant` alanını B'ye çevirme → reddedilir
- [ ] `where[tenant][equals]=B` query manipülasyonu → sonuç boş
- [ ] GraphQL'de aynı denemeler
- [ ] `depth=2` ile ilişki üzerinden B verisine sızma (ör. A'nın albümüne B medyası bağlama) → reddedilir
- [ ] `/api/media/presign` ile B'nin key önekine imza istemek → 403
- [ ] Host A'dan B slug'ına public istek → 404
- [ ] Üyelikten çıkarılan kullanıcının mevcut oturumu → anında 401/403

## 3. Sözleşme (contract) testleri
- Yanıt şemaları `schemas/*.ts` içinde Zod ile tanımlanır ve `payload-types.ts` ile uyumlu tutulur.
```ts
const res = await anon.get('/api/posts?where[_status][equals]=published&limit=5')
expect(res.ok()).toBeTruthy()
const body = PaginatedPosts.parse(await res.json())   // şema bozulursa test düşer
expect(body.docs.every(d => d.tenant === tenantA.id)).toBe(true)
```
- Public yanıtlarda **gizli alanlar bulunmamalıdır**: `email` (show_email=false olan yönetim kurulu üyesi), internal belgeler, `createdBy` detayları, kullanıcı hash'leri.

## 4. Validasyon ve iş kuralları
| Kural | Test |
|---|---|
| BR-CNT-01 slug benzersizliği | Aynı slug ile 2. kayıt → otomatik `-2` |
| BR-EVT-02 | `endsAt < startsAt` → 400 + i18n hata anahtarı |
| BR-CNT-03 | 4. öne çıkan haber → en eskisinin bayrağı kalkar |
| BR-MED-01 | Kota doluyken presign → 413/422 |
| BR-DOC-01 | Internal belge public listede, aramada ve sitemap'te yok |
| BR-AUTH-01 | Son yöneticinin rolünü düşürme → 400 |
| Alan sınırları | Başlık 4/151 karakter → 400; 5/150 → 201 |
- Hata yanıtlarında stack trace veya SQL bulunmamalıdır. Gövdede yalnızca i18n anahtarı ve alan adı olur.

## 5. Güvenlik senaryoları
- **Rate limit:** 6. hatalı login → 429/kilit, iletişim formunda aynı IP'den 4. gönderim → 429.
- **Turnstile:** Token yok veya geçersiz → 400.
- **Cron/job endpoint'leri:** `CRON_SECRET` olmadan → 401.
- **XSS payload'ları:** `<img src=x onerror=alert(1)>` içeren rich text kaydedilir. Public HTML yanıtında `onerror` bulunmamalıdır.
- **Upload:** HTML içerikli `.jpg` presign/complete adımında MIME kontrolüyle reddedilir. 26 MB PDF reddedilir.
- **IDOR:** Ardışık ID tahmini yerine UUID kullanıldığı doğrulanır.
- **Güvenlik başlıkları:** Public ve admin yanıtlarında `strict-transport-security`, `content-security-policy`, `x-content-type-options` bulunur.

## 6. Diğer endpoint'ler
- `.ics`: `content-type: text/calendar`, geçerli VEVENT, tekrarlayan etkinlikte RRULE, iptal edilen tekrar EXDATE.
- `sitemap.xml`: yalnızca yayınlanmış içerik, `hreflang` alternatifleri, askıdaki kiracıda 404/boş.
- Magic link: token tek kullanımlıktır (ikinci kullanım 400), 15 dk sonra geçersiz olur. E-posta Mailpit API'sinden okunur.

## Kurallar
- Her test bağımsızdır ve kendi verisini üretip siler.
- `expect(res.status()).toBe(...)` ile durum kodu, ardından gövde doğrulanır.
- Testler paralel çalışacak şekilde yazılır, paylaşılan değiştirilebilir durum kullanılmaz.
- Yeni endpoint = aynı PR'da yetki, izolasyon ve sözleşme testi.
- Test adı formatı: `<kaynak>: <rol> <eylem> → <beklenen> @api [@isolation] [@US-xx]`.
