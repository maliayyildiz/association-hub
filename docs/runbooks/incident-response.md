# Runbook: Olay Müdahalesi (Incident Response)

| Alan | Değer |
|---|---|
| Durum | Taslak – platform sahibi onayı bekliyor |
| Sahibi | DevOps + Architect |
| İlgili | WORKFLOW.md §7, PRD §14 PRV-10, SAD §19–21, CLAUDE.md §4, §8 |

## 1. Ne zaman devreye girer
- **Blocker** önemindeki her olay: kiracı izolasyonu ihlali (şüphesi dahil), kişisel veri sızıntısı, veri kaybı, güvenlik açığı istismarı, platform genelinde kesinti.
- Kaynaklar: Sentry alarmı, Better Stack uptime/hata oranı alarmı (> %2), dernek bildirimi, QA bulgusu, dış güvenlik bildirimi.

## 2. Roller
| Rol | Sorumluluk |
|---|---|
| Olay sorumlusu (IC) | Koordinasyon, kararlar, zaman çizelgesi. İlk müdahale eden kişi, devredene kadar IC'dir. |
| Teknik müdahale | Teşhis, sınırlama, düzeltme (Full-stack + DevOps). |
| İletişim | Dernek yöneticileri ve gerekirse denetim otoritesiyle iletişim (Platform sahibi). |

Küçük ekipte tek kişi birden fazla rolü üstlenebilir; ancak zaman çizelgesi her durumda tutulur.

## 3. Akış

### 3.1 Tespit ve kayıt (T0)
1. Olay kaydı açılır: `docs/postmortems/YYYY-MM-DD-<kısa-ad>.md` (şablon: `docs/postmortems/000-template.md`). Zaman çizelgesi **T0 = farkına varılma anı** ile başlar.
2. Önem belirlenir (WORKFLOW.md §7): Blocker / Critical / Major / Minor.
3. Etkilenen kiracılar `tenantId` ile listelenir (Sentry/Better Stack log'ları `tenantId` taşır).

### 3.2 Sınırlama (hedef: T0 + 1 saat)
- Kod kaynaklıysa: Vercel **Instant Rollback** ile son sağlıklı sürüme dönülür (`rollback.md`).
- İzolasyon ihlalinde: ilgili endpoint/özellik feature flag ile kapatılır; gerekirse etkilenen kiracılar geçici olarak askıya alınır.
- Kimlik bilgisi sızıntısında: ilgili secret'lar hemen döndürülür (`secret-rotation.md`), oturumlar geçersiz kılınır.
- Kanıtlar korunur: log'lar, audit log kayıtları ve DB durumu (Neon branch anlık görüntüsü) silinmez.

### 3.3 Kişisel veri ihlali değerlendirmesi (hedef: T0 + 24 saat)
Platform, dernek verileri için **veri işleyen** (processor), panel hesapları için **veri sorumlusu**dur (PRD §14.1).

| Soru | Kayda yazılır |
|---|---|
| Hangi kişisel veri kategorileri etkilendi? (iletişim mesajları, aboneler, kullanıcı hesapları, fotoğraflar) | ✓ |
| Kaç kişi ve hangi kiracılar? | ✓ |
| Veri yetkisiz kişilerce görüldü/indirildi mi, yoksa yalnızca erişilebilir mi oldu? | ✓ |
| Kişilerin hak ve özgürlükleri için risk var mı? | ✓ |

### 3.4 Bildirim (en geç T0 + 72 saat)
- **Dernek verileri (processor rolü):** Etkilenen her derneğin yöneticisine **gecikmeksizin** bildirim yapılır. Denetim otoritesine bildirim kararı veri sorumlusu olan derneğindir; platform bu karar için gereken bilgiyi sağlar (PRV-10).
- **Panel hesapları (controller rolü):** Risk varsa platform, 72 saat içinde yetkili denetim otoritesine bildirir: Fransa için CNIL, Türkiye için KVKK Kurulu. Hangi otoritenin yetkili olduğu PRD Q3'ün cevabına bağlıdır.
- Yüksek risk varsa ilgili kişilere de bildirim yapılır.
- Bildirim metinleri TR/FR/EN hazırlanır; içerik: ne oldu, hangi veriler, alınan önlemler, kişilerin yapması önerilenler, iletişim noktası.

### 3.5 Düzeltme ve kapanış
1. Kalıcı düzeltme normal kapılardan geçer: test + review zorunlu, yalnızca DoR atlanır (WORKFLOW.md §7).
2. Olayı yakalayan **regresyon testi** eklenir. İzolasyon ihlaliyse `tests/isolation/` paketine eklenir.
3. Postmortem 5 iş günü içinde tamamlanır. Format suçlamasızdır (blameless): kök neden, neden yakalanmadı, aksiyonlar ve sahipleri.
4. Bu ihlal, PRV-11 kapsamındaki ihlal kaydına işlenir.

## 4. Açık noktalar
- Denetim otoritesi ve iletişim kişileri: PRD Q3 cevabına bağlı.
- Nöbet/erişilebilirlik saatleri: PRD Q10 cevabına bağlı.
- Alarm kanalları (e-posta/Slack/Telegram): Better Stack kurulumunda (H1) netleşir.
