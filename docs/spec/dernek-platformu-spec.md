# DernekHub – Çok Kiracılı Dernek Web Platformu
## Ürün Gereksinim Dokümanı (PRD) ve İş Analizi Spesifikasyonu

| Alan | Değer |
|---|---|
| Doküman sürümü | v1.0 (Taslak) |
| Tarih | 04.11.2026 |
| Hazırlayan | Product Owner / Business Analyst |
| Durum | Paydaş incelemesine açık |
| Çalışma adı | **DernekHub** (geçici; marka adı netleşince değiştirilecek) |

---

## İçindekiler

1. Yönetici Özeti
2. Problem Tanımı ve Fırsat
3. Ürün Vizyonu, Hedefler ve Başarı Metrikleri
4. Kapsam, Varsayımlar ve Kısıtlar
5. Paydaşlar ve Personalar
6. Roller ve Yetki Matrisi
7. Kavramsal Mimari ve Çok Kiracılık (Multi-Tenancy) Modeli
8. Epikler, Kullanıcı Hikâyeleri ve Kabul Kriterleri
9. Veri Modeli
10. İş Kuralları
11. İçerik Yaşam Döngüsü (Durum Makinesi)
12. Ekran Envanteri
13. Fonksiyonel Olmayan Gereksinimler
14. Gizlilik, KVKK / GDPR Uyumu
15. Bildirimler ve E-posta Şablonları
16. Kotalar, Limitler ve Paketler
17. Yol Haritası ve Fazlar (MVP tanımı)
18. Riskler ve Önlemler
19. Açık Sorular
20. Sözlük
21. Ek A – Önerilen Teknoloji Yığını
22. Ek B – İzlenebilirlik Matrisi

---

## 1. Yönetici Özeti

DernekHub, 50'den fazla derneğin **tek bir şablon üzerinden kendi kurumsal web sitelerini** oluşturup yönetebileceği bir SaaS platformudur. Her dernek:

- kendi **logosu, renkleri ve içeriğiyle** markalanmış bir web sitesine,
- kendi **admin paneline**,
- haber, etkinlik, galeri ve belgelerini **kolayca yükleyip arşivleyebileceği** bir içerik yönetim sistemine

sahip olur. Platform yöneticisi (Süper Admin) tüm dernekleri tek merkezden yönetir. Ek olarak, tüm derneklerin etkinlik ve haberlerini bir araya getiren bir **Merkezi Portal** bulunur.

Temel değer önerisi: *"Teknik bilgi gerektirmeden, 15 dakikada yayında olan, profesyonel görünümlü dernek sitesi."*

---

## 2. Problem Tanımı ve Fırsat

### 2.1 Mevcut Durum (As-Is)
| # | Problem | Etkisi |
|---|---|---|
| P1 | Derneklerin çoğunun web sitesi yok veya güncel değil | Görünürlük düşük, yeni üye kazanımı zor |
| P2 | Mevcut siteler farklı ajanslar/gönüllüler tarafından yapılmış, bakımı yapılmıyor | Güvenlik açıkları, kırık sayfalar |
| P3 | İçerik paylaşımı yalnızca sosyal medyada (Facebook, Instagram, WhatsApp) | Kurumsal hafıza kayboluyor, arşiv yok |
| P4 | Gönüllü yöneticiler teknik değil, sık değişiyor | Şifreler/erişimler kayboluyor, bilgi devri olmuyor |
| P5 | Her dernek ayrı hosting/domain ücreti ödüyor | Gereksiz maliyet |
| P6 | Derneklerin ortak etkinliklerini görebileceği tek yer yok | Topluluk içi iletişim zayıf |

### 2.2 Hedeflenen Durum (To-Be)
- Tüm dernekler tek platformda, standart kalitede, güvenli ve mobil uyumlu sitelere sahip.
- İçerik, telefondan dakikalar içinde yüklenebiliyor.
- Geçmiş tüm etkinlik, haber ve belgeler otomatik olarak aranabilir arşivde tutuluyor.
- Yönetim kurulu değiştiğinde erişim devri, kullanıcı ekleme/çıkarma ile saniyeler içinde yapılıyor.

---

## 3. Ürün Vizyonu, Hedefler ve Başarı Metrikleri

### 3.1 Vizyon
> Her derneğin dijital kimliğini ve kurumsal hafızasını koruyan, ortak bir topluluk platformu olmak.

### 3.2 İş Hedefleri (OKR biçiminde)

**O1 – Hızlı benimsenme**
- KR1.1: Lansmandan itibaren 3 ay içinde 50 derneğin aktif olması
- KR1.2: Yeni bir derneğin onboarding süresinin (davet → ilk yayın) < 1 gün olması
- KR1.3: Derneklerin %80'inin ilk 30 günde en az 5 içerik yayınlaması

**O2 – Kullanım kolaylığı**
- KR2.1: Bir haber yayınlama süresi ortalama < 3 dakika
- KR2.2: Destek talebi / aktif dernek / ay < 1
- KR2.3: Dernek admin memnuniyeti (CSAT) ≥ 4,3 / 5

**O3 – Güvenilirlik**
- KR3.1: Aylık erişilebilirlik ≥ %99,5
- KR3.2: Kiracılar arası veri sızıntısı = 0
- KR3.3: Sayfa yüklenme süresi (LCP) mobilde < 2,5 sn

### 3.3 Ürün KPI'ları (sürekli izlenecek)
| KPI | Tanım | Hedef |
|---|---|---|
| Aktif dernek oranı | Son 30 günde ≥1 içerik yayınlayan dernek / toplam | ≥ %70 |
| Aylık yayın sayısı | Tüm kiracılarda yayınlanan içerik adedi | Artış trendi |
| Ziyaretçi sayısı | Tekil ziyaretçi / dernek / ay | Raporlanır |
| Onboarding tamamlanma | Kurulum sihirbazını bitiren dernek oranı | ≥ %90 |
| Zaman-to-first-publish | Davetten ilk yayına kadar geçen süre | < 24 saat |

---

## 4. Kapsam, Varsayımlar ve Kısıtlar

### 4.1 Kapsam İçi (MVP + Faz 2)
- Çok kiracılı altyapı, alt alan adı ve özel domain desteği
- Dernek bazında marka/tema ayarları (logo, renk, font, kapak)
- Kurumsal sayfalar, haberler/duyurular, etkinlikler, galeri, belge arşivi
- Arşivleme, arama, etiket ve kategori yönetimi
- Rol tabanlı yetkilendirme ve kullanıcı yönetimi
- Çoklu dil (TR, FR; genişletilebilir)
- İletişim formu
- Merkezi portal (tüm derneklerin etkinlik/haber akışı)
- Süper admin paneli (kiracı yönetimi, kota, raporlama)
- Temel analitik (ziyaret, en çok okunan içerik)
- KVKK/GDPR uyumu (çerez onayı, aydınlatma metni, veri silme)

### 4.2 Kapsam Dışı (bu sürümde)
- Online bağış / ödeme alma (yalnızca harici bağış linki gösterilir) → Faz 3
- Üyelik aidatı takibi, üye CRM'i → Faz 3
- Etkinlik bilet satışı → Faz 3 (MVP'de yalnızca harici kayıt linki)
- Native mobil uygulama (web mobil uyumlu olacak; PWA Faz 3)
- Serbest sayfa tasarımcısı (sürükle-bırak page builder) → kapsam dışı, bilinçli olarak
- Forum, yorum, sosyal ağ özellikleri

### 4.3 Varsayımlar
| # | Varsayım |
|---|---|
| A1 | Dernekler Türkçe ve Fransızca içerik üretecek (Fransa'daki Türk dernekleri senaryosu); dil seti konfigüre edilebilir olacak |
| A2 | Her dernekte en az 1 kişi akıllı telefon ve e-posta kullanabiliyor |
| A3 | Dernekler başlangıçta ücretsiz kullanacak; finansman bir çatı kuruluş/federasyon veya platform sahibi tarafından sağlanacak |
| A4 | İlk aşamada dernek başına ortalama 3 admin kullanıcı, yılda ~200 içerik, ~5 GB medya |
| A5 | Veriler AB içinde barındırılacak (GDPR) |

### 4.4 Kısıtlar
- Bütçe: düşük işletme maliyeti hedefi (başlangıçta aylık < 150 €)
- Ekip: küçük geliştirme ekibi (1–3 geliştirici)
- Tüm kiracılar **aynı kod tabanını** kullanacak; dernek özelinde kod geliştirilmeyecek
- Hukuki: GDPR (AB) ve gerekiyorsa KVKK (TR) uyumu zorunlu

---

## 5. Paydaşlar ve Personalar

### 5.1 Paydaşlar
| Paydaş | İlgi alanı | Etki |
|---|---|---|
| Platform sahibi / Süper Admin | Sürdürülebilirlik, maliyet, kalite | Yüksek |
| Federasyon / çatı kuruluş (varsa) | Topluluğun görünürlüğü, ortak portal | Yüksek |
| Dernek yönetim kurulları | Kurumsal imaj, kolay kullanım | Yüksek |
| Dernek gönüllü editörleri | Hızlı içerik yükleme | Orta |
| Site ziyaretçileri (üyeler, halk, kurumlar) | Bilgiye kolay erişim | Orta |
| Belediyeler / resmi kurumlar | Derneğin faaliyetlerini doğrulama | Düşük |

### 5.2 Personalar

**Persona 1 – Ayşe, Dernek Başkanı (52)**
- Teknik bilgisi düşük, telefonu aktif kullanıyor (WhatsApp, Facebook).
- İhtiyaç: Derneğin profesyonel görünmesi, yönetim kurulu bilgilerinin güncel olması.
- Acı noktası: "Bilgisayardan anlamıyorum, birinin bana kurmasını beklemek zorunda kalıyorum."
- Başarı: Telefonla etkinlik fotoğraflarını yükleyip yayınlayabilmesi.

**Persona 2 – Emre, Gönüllü Editör (27)**
- Teknik bilgisi orta, haftada birkaç kez içerik giriyor.
- İhtiyaç: Toplu fotoğraf yükleme, taslak kaydetme, ileri tarihli yayın.
- Acı noktası: Her şeyi elle yeniden boyutlandırmak, aynı içeriği iki dile çevirmek.

**Persona 3 – Mali, Süper Admin / Platform Sahibi**
- Teknik bilgisi yüksek.
- İhtiyaç: Yeni derneği dakikalar içinde açmak, kotaları izlemek, sorunları tespit etmek, tüm siteleri tek seferde güncellemek.

**Persona 4 – Julie, Ziyaretçi (35, Fransız belediye çalışanı)**
- Derneğin faaliyetlerini, iletişim bilgilerini ve resmi belgelerini (tüzük, faaliyet raporu) arıyor.
- İhtiyaç: Fransızca içerik, hızlı ve net navigasyon.

**Persona 5 – Hakan, Dernek Üyesi (40)**
- Yaklaşan etkinlikleri takip etmek, geçmiş etkinlik fotoğraflarına bakmak istiyor.
- İhtiyaç: Takvim, "takvimime ekle", fotoğraf galerisi.

---

## 6. Roller ve Yetki Matrisi

### 6.1 Rol Tanımları
| Rol | Kapsam | Açıklama |
|---|---|---|
| **Süper Admin** | Platform geneli | Tüm kiracıları oluşturur, askıya alır, siler; global ayarlar; tüm verilere erişim (destek amaçlı, loglanır) |
| **Platform Destek** | Platform geneli (salt okunur + sınırlı) | Kiracı içeriklerini görüntüler, kullanıcıya şifre sıfırlama gönderir; içerik silemez |
| **Dernek Yöneticisi (Tenant Admin)** | Tek kiracı | Kiracının tüm içeriklerini, kullanıcılarını, marka ve site ayarlarını yönetir |
| **Editör** | Tek kiracı | İçerik oluşturur, düzenler, yayınlar (ayara bağlı); kullanıcı ve marka ayarlarına erişemez |
| **Yazar (Katkıcı)** | Tek kiracı | İçerik oluşturur, taslak kaydeder, onaya gönderir; yayınlayamaz |
| **Ziyaretçi** | Public | Yayınlanmış içerikleri görüntüler, iletişim formu gönderir |

> Bir kullanıcı **birden fazla derneğe farklı rollerle** üye olabilir (ör. iki derneğin editörü). Giriş sonrası dernek seçici gösterilir.

### 6.2 Yetki Matrisi (C=Oluştur, R=Oku, U=Güncelle, D=Sil, P=Yayınla)

| Kaynak | Süper Admin | Destek | Dernek Yön. | Editör | Yazar | Ziyaretçi |
|---|---|---|---|---|---|---|
| Kiracı (dernek) kaydı | CRUD | R | R, U (kısıtlı alanlar) | – | – | – |
| Marka/tema ayarları | CRUD | R | RU | R | – | – |
| Site ayarları (menü, sosyal linkler) | CRUD | R | RU | R | – | – |
| Kullanıcılar (kiracı içi) | CRUD | R + şifre sıfırlama | CRUD | – | – | – |
| Kurumsal sayfalar | CRUDP | R | CRUDP | CRUP | CRU (taslak) | R (yayında) |
| Haberler/duyurular | CRUDP | R | CRUDP | CRUDP | CRU (kendi taslakları) | R |
| Etkinlikler | CRUDP | R | CRUDP | CRUDP | CRU (kendi taslakları) | R |
| Galeri / albümler | CRUDP | R | CRUDP | CRUDP | CRU | R |
| Belgeler | CRUDP | R | CRUDP | CRUDP | CRU | R (public olanlar) |
| Medya kütüphanesi | CRUD | R | CRUD | CRUD | CR + kendi yüklediklerini D | – |
| Yönetim kurulu / ekip | CRUD | R | CRUD | CRU | – | R |
| İletişim mesajları | R | R | RD | R | – | C |
| Kategori/etiket | CRUD | R | CRUD | CRU | R | R |
| Analitik | R (tüm) | R | R (kendi) | R (kendi) | – | – |
| Denetim kaydı (audit log) | R (tüm) | R | R (kendi kiracısı) | – | – | – |
| Domain yönetimi | CRUD | R | Talep oluşturur | – | – | – |
| Kota / paket | CRUD | R | R | – | – | – |
| Merkezi portal öne çıkarma | CRUD | – | Talep/opt-in | – | – | R |

### 6.3 Yetki İş Kuralları
- **BR-AUTH-01:** Bir kiracıda en az 1 aktif Dernek Yöneticisi bulunmak zorundadır; son yönetici silinemez/rolü düşürülemez.
- **BR-AUTH-02:** "Editör yayınlayabilir mi?" ayarı kiracı bazında açılıp kapatılabilir (varsayılan: açık). Kapalıysa editör içerikleri onaya gönderir.
- **BR-AUTH-03:** Süper Admin'in bir kiracı içeriğine her erişimi denetim kaydına "impersonation/support access" olarak yazılır.
- **BR-AUTH-04:** Bir kullanıcı yalnızca üyesi olduğu kiracıların verisini görebilir; URL manipülasyonuyla başka kiracıya erişim denemesi 404 döner ve loglanır.

---

## 7. Kavramsal Mimari ve Çok Kiracılık Modeli

### 7.1 Genel Bakış

```
                    ┌──────────────────────────────┐
 Ziyaretçi ───────► │  Public Site (Next.js)       │ ◄── dernek-a.dernekhub.org
                    │  Host → Tenant çözümleme     │ ◄── www.dernek-a.fr (özel domain)
                    └──────────────┬───────────────┘
                                   │
 Dernek Admin ────► ┌──────────────▼───────────────┐
 Süper Admin  ────► │  Admin Paneli (Payload CMS)  │ ◄── admin.dernekhub.org
                    │  Tenant izolasyonu (RBAC)    │
                    └──────────────┬───────────────┘
                                   │
          ┌────────────────────────┼─────────────────────────┐
          ▼                        ▼                         ▼
   PostgreSQL (tek DB,      Nesne depolama (R2/S3)     E-posta servisi
   tenant_id + RLS)         /tenant-id/... klasörleri  (Postmark/Brevo)
                                   │
                                  CDN + görsel optimizasyon
```

### 7.2 Çok Kiracılık Kararları
| Karar | Seçim | Gerekçe |
|---|---|---|
| Veri izolasyonu | Tek veritabanı, her tabloda `tenant_id`, uygulama katmanı filtresi + PostgreSQL Row Level Security | 50–1000 kiracı için en düşük maliyet ve bakım yükü; RLS ikinci savunma hattı |
| Kod tabanı | Tek kod, tek deploy | Tüm siteler aynı anda güncellenir |
| Kiracı çözümleme | HTTP `Host` başlığı → `domains` tablosu → `tenant_id` | Alt alan adı ve özel domain aynı mekanizma |
| Medya | Tek bucket, `tenants/{tenant_id}/` önekleri | Kota hesaplama ve silme kolay |
| Tema | Tasarım token'ları (CSS değişkenleri) kiracı ayarlarından üretilir | Şablon tek, görünüm farklı |
| Önbellek | Kiracı bazlı cache tag'leri; içerik yayınlandığında ilgili sayfalar yeniden üretilir (ISR/on-demand revalidation) | Hızlı sayfa, anlık güncelleme |

### 7.3 URL Yapısı
| Sayfa | URL (varsayılan dil TR) | FR karşılığı |
|---|---|---|
| Ana sayfa | `/` | `/fr` |
| Hakkımızda | `/hakkimizda` | `/fr/a-propos` |
| Haberler listesi | `/haberler` | `/fr/actualites` |
| Haber detayı | `/haberler/{slug}` | `/fr/actualites/{slug}` |
| Etkinlikler | `/etkinlikler` | `/fr/evenements` |
| Etkinlik detayı | `/etkinlikler/{slug}` | `/fr/evenements/{slug}` |
| Geçmiş etkinlikler (arşiv) | `/etkinlikler/arsiv` | `/fr/evenements/archives` |
| Galeri | `/galeri`, `/galeri/{albüm-slug}` | `/fr/galerie/...` |
| Belgeler | `/belgeler` | `/fr/documents` |
| Yönetim kurulu | `/yonetim` | `/fr/equipe` |
| İletişim | `/iletisim` | `/fr/contact` |
| Arama | `/ara?q=` | `/fr/recherche?q=` |
| Arşiv (yıl bazlı) | `/arsiv/{yıl}` | `/fr/archives/{annee}` |

> Slug'lar dil bazında ayrı tutulur; sistem sayfa adları (`haberler`, `actualites`) dil dosyasından gelir.

---

## 8. Epikler, Kullanıcı Hikâyeleri ve Kabul Kriterleri

### 8.0 Epik Listesi ve Önceliklendirme (MoSCoW)

| ID | Epik | Öncelik | Faz |
|---|---|---|---|
| E01 | Kiracı (dernek) yönetimi ve onboarding | Must | MVP |
| E02 | Kimlik doğrulama ve kullanıcı yönetimi | Must | MVP |
| E03 | Marka ve tema özelleştirme | Must | MVP |
| E04 | Kurumsal sayfalar ve yönetim kurulu | Must | MVP |
| E05 | Haberler ve duyurular | Must | MVP |
| E06 | Etkinlikler ve takvim | Must | MVP |
| E07 | Medya kütüphanesi ve galeri | Must | MVP |
| E08 | Belge arşivi | Must | MVP |
| E09 | Arşivleme, kategori, etiket ve arama | Must | MVP |
| E10 | Çoklu dil | Should | MVP |
| E11 | İletişim formu | Must | MVP |
| E12 | Ana sayfa ve navigasyon yönetimi | Must | MVP |
| E13 | Alan adı (domain) yönetimi | Should | MVP (alt alan adı) / Faz 2 (özel domain) |
| E14 | SEO ve sosyal paylaşım | Should | MVP |
| E15 | İçerik iş akışı (taslak, onay, zamanlama, sürüm) | Should | MVP (taslak/yayın) / Faz 2 (onay, sürüm) |
| E16 | Merkezi portal | Should | Faz 2 |
| E17 | Analitik ve raporlama | Could | Faz 2 |
| E18 | Denetim kaydı (audit log) | Must | MVP |
| E19 | Bildirimler ve e-posta bülteni | Could | Faz 2 |
| E20 | Paket, kota ve faturalama | Could | Faz 2 / 3 |
| E21 | KVKK/GDPR araçları | Must | MVP |
| E22 | Süper admin operasyon araçları | Must | MVP |

Kabul kriterleri Gherkin (Given/When/Then – Diyelim ki/Eğer/O zaman) formatında yazılmıştır.

---

### E01 – Kiracı (Dernek) Yönetimi ve Onboarding

**US-01.1 – Yeni dernek oluşturma**
*Süper Admin olarak, yeni bir derneği platforma ekleyebilmek istiyorum, böylece derneğin sitesi hemen hazırlanabilsin.*

Alanlar: Dernek adı (zorunlu), kısa ad/slug (zorunlu, benzersiz, `a-z0-9-`, 3–40 karakter), resmi kayıt no (RNA / dernek sicil no, opsiyonel), şehir, ülke, varsayılan dil, desteklenen diller, ilk yönetici e-postası (zorunlu), paket (varsayılan: Ücretsiz).

Kabul kriterleri:
- Diyelim ki Süper Admin "Yeni Dernek" formunu doldurdu, eğer slug benzersizse ve "Oluştur"a basarsa, o zaman:
  - kiracı `aktif-kurulumda` durumunda oluşturulur,
  - `{slug}.dernekhub.org` alt alan adı otomatik tanımlanır,
  - varsayılan sayfalar (Ana sayfa, Hakkımızda, İletişim, Yönetim Kurulu) boş şablonla oluşturulur,
  - varsayılan tema (platform renkleri) atanır,
  - ilk yönetici e-postasına davet gönderilir (geçerlilik 7 gün).
- Eğer slug kullanımdaysa veya rezerve kelimelerden biriyse (`admin, www, api, app, mail, portal, static, cdn, help, destek`), form hata verir: "Bu kısa ad kullanılamaz."
- Slug oluşturulduktan sonra yalnızca Süper Admin değiştirebilir; değiştiğinde eski alt alan adı 90 gün 301 yönlendirmesi yapar.

**US-01.2 – Toplu dernek içe aktarma**
*Süper Admin olarak, 50 derneği CSV ile tek seferde ekleyebilmek istiyorum.*
- CSV kolonları: `ad, slug, sehir, ulke, dil, yonetici_email, yonetici_ad`.
- Sistem önce **ön izleme ve doğrulama** raporu gösterir (geçerli / hatalı satırlar).
- Hatalı satırlar atlanabilir; geçerliler oluşturulur; sonuç raporu indirilebilir.
- Davet e-postaları isteğe bağlı olarak hemen veya daha sonra toplu gönderilir.

**US-01.3 – Kurulum sihirbazı (onboarding wizard)**
*Dernek Yöneticisi olarak, ilk girişte adım adım rehberlik almak istiyorum, böylece sitemi kısa sürede yayına alabileyim.*

Adımlar:
1. Hoş geldiniz + şifre belirleme
2. Dernek bilgileri (ad, slogan, kuruluş yılı, kısa tanıtım ≤ 300 karakter)
3. Logo yükleme (+ otomatik renk önerisi: logodan baskın 2 renk çıkarılır)
4. Renk ve font seçimi (canlı önizleme)
5. İletişim bilgileri ve sosyal medya linkleri
6. Hakkımızda metni (hazır şablon metin ile, düzenlenebilir)
7. İlk haber veya etkinliği ekle (atlanabilir)
8. Önizleme → "Sitemi Yayına Al"

Kabul kriterleri:
- Her adım kaydedilir; kullanıcı yarıda bırakırsa kaldığı yerden devam eder.
- İlerleme çubuğu gösterilir (ör. 4/8).
- Zorunlu minimum (yayına alma şartı): dernek adı, logo **veya** metin logo, en az 1 iletişim kanalı, Hakkımızda metni.
- "Sitemi Yayına Al" ile kiracı durumu `aktif` olur; öncesinde public site "Yakında" sayfası gösterir.

**US-01.4 – Kiracı durum yönetimi**
Durumlar: `aktif-kurulumda`, `aktif`, `askida`, `arsivlenmis`, `silinmek-uzere`.

| Geçiş | Kim | Etki |
|---|---|---|
| aktif → askıda | Süper Admin | Public site "Bu site geçici olarak kapalıdır" gösterir; admin girişleri engellenir (yöneticiler hariç salt okunur) |
| askıda → aktif | Süper Admin | Her şey geri gelir |
| aktif → arşivlenmiş | Süper Admin (dernek talebiyle) | Site salt okunur arşiv olarak yayında kalır, düzenleme kapalı |
| herhangi → silinmek-üzere | Süper Admin | 30 günlük bekleme; bu sürede geri alınabilir; sonra tüm veriler ve medya kalıcı silinir |

- Her geçiş için gerekçe zorunludur ve audit log'a yazılır.
- Askıya alma ve silme öncesi Dernek Yöneticilerine e-posta bildirimi gider.

**US-01.5 – Dernek veri dışa aktarma**
*Dernek Yöneticisi olarak, tüm içerik ve medyamı indirebilmek istiyorum (veri taşınabilirliği).*
- Çıktı: ZIP (JSON içerik + medya klasörü + belgeler).
- İşlem arka planda yürür; hazır olunca e-posta ile 72 saat geçerli indirme linki gönderilir.
- Ayda en fazla 3 dışa aktarma.

---

### E02 – Kimlik Doğrulama ve Kullanıcı Yönetimi

**US-02.1 – Davet ile kullanıcı ekleme**
*Dernek Yöneticisi olarak, ekip arkadaşlarımı e-posta ile davet edip rol atamak istiyorum.*
- Alanlar: e-posta, ad soyad, rol (Yönetici/Editör/Yazar), görünen unvan (opsiyonel).
- Davet linki 7 gün geçerli; tekrar gönderilebilir; iptal edilebilir.
- E-posta zaten sistemde kayıtlıysa yeni hesap açılmaz; kullanıcıya "X derneğine eklendiniz" bildirimi gider.
- Kiracı başına kullanıcı limiti pakete göre (Ücretsiz: 5).

**US-02.2 – Giriş**
- E-posta + şifre ile giriş.
- **Sihirli link (magic link)** ile şifresiz giriş seçeneği (teknik olmayan kullanıcılar için önerilir).
- "Beni hatırla": 30 gün; aksi halde oturum 12 saat hareketsizlikte sona erer.
- 5 hatalı denemeden sonra hesap 15 dakika kilitlenir; kullanıcıya e-posta bildirimi gider.
- Faz 2: Google ile giriş (opsiyonel).

**US-02.3 – Şifre politikası ve sıfırlama**
- Min. 10 karakter; sızdırılmış şifre listesine karşı kontrol (HaveIBeenPwned k-anonymity).
- Şifre sıfırlama linki 1 saat geçerli, tek kullanımlık.

**US-02.4 – İki faktörlü doğrulama (2FA)**
- Süper Admin ve Destek rolleri için **zorunlu** (TOTP).
- Dernek rolleri için opsiyonel; Dernek Yöneticisi kendi kiracısında zorunlu hale getirebilir.

**US-02.5 – Kullanıcıyı çıkarma / rol değiştirme**
- Kullanıcı kiracıdan çıkarıldığında oturumları anında sonlandırılır.
- Kullanıcının oluşturduğu içerikler silinmez; "yazar" alanı korunur, görünen ad "Eski üye" olarak anonimleştirilebilir (ayar).
- Yönetim kurulu değişimi senaryosu: "Yetki devri" butonu ile yeni yönetici davet edilir, kabul ettiğinde eski yöneticinin rolü seçime göre düşürülür/çıkarılır.

**US-02.6 – Çoklu dernek üyeliği**
- Birden fazla kiracıya üye kullanıcı, girişten sonra dernek seçici görür; panel üst barında dernek değiştirme menüsü bulunur.
- Aktif kiracı her ekranda net biçimde (logo + ad) gösterilir.

**US-02.7 – Profil**
- Ad, profil fotoğrafı, arayüz dili (TR/FR/EN), bildirim tercihleri.

---

### E03 – Marka ve Tema Özelleştirme

**US-03.1 – Logo yönetimi**
- Ana logo (SVG/PNG/JPG/WebP, max 5 MB, min 200 px yükseklik önerilir)
- Koyu zemin için alternatif logo (opsiyonel)
- Favicon (otomatik olarak logodan üretilir, ayrıca yüklenebilir)
- Sosyal paylaşım varsayılan görseli (1200×630; yoksa logodan otomatik üretilir)
- Logo yoksa "metin logo": dernek adı seçilen fontla gösterilir.

**US-03.2 – Renkler**
- Ana renk (primary), ikincil renk (secondary), vurgu rengi (accent) – renk seçici + HEX girişi.
- Sistem otomatik olarak açık/koyu tonları ve metin rengini üretir.
- **Erişilebilirlik kontrolü:** Buton/metin kontrastı WCAG AA (4,5:1) altındaysa uyarı gösterilir ve otomatik düzeltilmiş ton önerilir. Kaydetmeye engel değildir ama public sitede metin rengi otomatik okunabilir tona çekilir.
- "Logodan renk öner" butonu.
- Hazır 8 renk paleti (tek tıkla).

**US-03.3 – Tipografi**
- Başlık fontu ve gövde fontu: önceden seçilmiş ~10 font arasından (Türkçe ve Fransızca karakterleri tam destekleyen: Inter, Poppins, Montserrat, Lora, Merriweather, Playfair Display, Nunito, Source Sans 3, Roboto Slab, Work Sans).
- Fontlar platform üzerinden self-host edilir (GDPR – Google sunucusuna istek atılmaz).

**US-03.4 – Düzen seçenekleri**
- Ana sayfa düzeni: 3 hazır varyant (A: Büyük kapak görseli, B: Haber odaklı, C: Etkinlik odaklı).
- Header stili: ortalanmış logo / sol logo + sağ menü.
- Köşe yuvarlaklığı: keskin / yumuşak / yuvarlak.
- Açık/koyu mod desteği: Faz 2.

**US-03.5 – Canlı önizleme**
- Tüm tema değişiklikleri kaydetmeden önce masaüstü/mobil önizlemede görülebilir.
- "Yayınla" ile aktif olur; "Önceki temaya dön" (son 5 tema sürümü saklanır).

**US-03.6 – Özel CSS**
- Yalnızca Süper Admin tarafından, kiracı bazında açılabilen gelişmiş ayar (kapsam: Faz 2, güvenlik nedeniyle sanitize edilir).

---

### E04 – Kurumsal Sayfalar ve Yönetim Kurulu

**US-04.1 – Sabit kurumsal sayfalar**
Varsayılan sayfalar: Hakkımızda, Misyon & Vizyon, Tarihçe, Yönetim Kurulu, Tüzük (belgeye link), İletişim, KVKK/Gizlilik, Çerez Politikası.
- Her sayfa: başlık, kapak görseli (opsiyonel), zengin metin içeriği, SEO alanları.
- Sayfalar menüde gösterilip gizlenebilir; sıra değiştirilebilir.

**US-04.2 – Özel sayfa oluşturma**
- Dernek, en fazla 20 ek sayfa oluşturabilir (ör. "Kurslarımız", "Gençlik Kolu").
- İçerik **blok tabanlı** düzenleyici ile: Metin, Başlık, Görsel, Görsel+Metin, Galeri, Video (YouTube/Vimeo embed – çerez onayına bağlı), Buton, Alıntı, Sık Sorulan Sorular (akordiyon), Belge listesi, Etkinlik listesi, Haber listesi, Harita, Ayırıcı.
- Serbest piksel yerleşimi yoktur (tasarım tutarlılığı).
- Alt sayfa (1 seviye) desteklenir.

**US-04.3 – Yönetim kurulu / ekip**
- Kişi kartı: ad soyad, unvan (Başkan, Başkan Yrd., Sekreter, Sayman, Üye, …), fotoğraf, kısa biyografi (≤ 500 karakter), e-posta (gösterilsin mi? – varsayılan hayır), sıra.
- **Dönem** kavramı: Yönetim kurulu dönemleri (ör. 2024–2026). Yeni dönem başlatıldığında eski dönem otomatik arşivlenir ve "Geçmiş Yönetim Kurulları" sayfasında görüntülenir.
- KVKK: Kişi fotoğrafı/biyografisi yüklenirken "Bu kişinin açık rızası alınmıştır" onay kutusu zorunlu.

**US-04.4 – İletişim bilgileri**
- Adres, telefon, e-posta, çalışma saatleri, harita konumu (OpenStreetMap; Google Maps opsiyonel ve çerez onayına bağlı), sosyal medya (Facebook, Instagram, X, YouTube, TikTok, LinkedIn, WhatsApp kanalı/grup linki), bağış linki (harici).

---

### E05 – Haberler ve Duyurular

**US-05.1 – Haber oluşturma**
*Editör olarak, telefonumdan hızlıca haber yayınlamak istiyorum.*

| Alan | Tip | Kural |
|---|---|---|
| Başlık | Metin | Zorunlu, 5–150 karakter |
| Slug | Metin | Başlıktan otomatik; Türkçe karakter dönüşümü (ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u); düzenlenebilir; kiracı + dil içinde benzersiz |
| Özet | Metin | Opsiyonel, ≤ 300 karakter; boşsa içerikten ilk 160 karakter |
| Kapak görseli | Medya | Opsiyonel (önerilir); alt metin zorunlu |
| İçerik | Blok editör | Zorunlu |
| Kategori | Seçim (1) | Zorunlu; varsayılan "Genel" |
| Etiketler | Çoklu | Opsiyonel, max 10 |
| Tür | Seçim | Haber / Duyuru / Basın Bülteni |
| Öne çıkar | Bool | Ana sayfada üstte gösterilir (aynı anda max 3) |
| Sabitle | Bool | Liste başında kalır (Duyurular için) |
| Yayın tarihi | Tarih-saat | Varsayılan: şimdi; gelecek tarih → zamanlanmış yayın |
| Bitiş tarihi | Tarih-saat | Opsiyonel; duyurular için – sonra otomatik arşive geçer |
| Galeri bağlantısı | İlişki | Opsiyonel albüm bağlantısı |
| Dil | Seçim | Varsayılan kiracı dili; çeviri bağlantısı |
| SEO | Grup | Meta başlık, açıklama, sosyal görsel (opsiyonel, otomatik doldurulur) |

Kabul kriterleri:
- Eğer kullanıcı içerik yazarken sayfadan çıkarsa, o zaman "Kaydedilmemiş değişiklikler" uyarısı çıkar; ayrıca her 30 sn'de otomatik taslak kaydı yapılır.
- Eğer yayın tarihi gelecekteyse, durum `zamanlanmis` olur ve zamanı geldiğinde (±1 dk) otomatik yayınlanır.
- Yayınlanan haber 60 saniye içinde public sitede görünür (önbellek yenilenir).
- Mobilde: "Hızlı Haber" modu – başlık + fotoğraflar + kısa metin tek ekranda; kamera/galeri erişimi.

**US-05.2 – Haber listesi (public)**
- Sayfa başı 12 haber, sayfalama (veya "Daha fazla yükle").
- Filtre: kategori, etiket, yıl, tür.
- Sıralama: sabitlenenler → yayın tarihi azalan.

**US-05.3 – Haber detayı (public)**
- Kapak, başlık, tarih, kategori, okuma süresi, içerik, etiketler, paylaşım butonları (WhatsApp, Facebook, X, e-posta, link kopyala – izleyici çerezi olmadan basit link), ilgili haberler (aynı kategori, 3 adet), önceki/sonraki.

**US-05.4 – Duyuru bandı**
- Dernek, site genelinde üstte gösterilecek tek satırlık duyuru bandı tanımlayabilir (metin + link + başlangıç/bitiş tarihi + renk: bilgi/uyarı/acil).

---

### E06 – Etkinlikler ve Takvim

**US-06.1 – Etkinlik oluşturma**

| Alan | Tip | Kural |
|---|---|---|
| Başlık | Metin | Zorunlu |
| Slug | Metin | Otomatik, benzersiz |
| Kapak görseli / afiş | Medya | Opsiyonel; afiş dikey (A4 oranı) desteklenir |
| Açıklama | Blok editör | Zorunlu |
| Başlangıç tarih-saat | Tarih-saat | Zorunlu; kiracı saat dilimi (varsayılan Europe/Paris) |
| Bitiş tarih-saat | Tarih-saat | Opsiyonel; başlangıçtan sonra olmalı |
| Tüm gün | Bool | Saat alanlarını gizler |
| Çok günlü | Türetilmiş | Bitiş farklı günse otomatik |
| Tekrarlayan | Kural | Haftalık / aylık / özel (ör. "her cumartesi 14:00 Türkçe kursu"); bitiş tarihi veya tekrar sayısı zorunlu |
| Mekân tipi | Seçim | Fiziksel / Online / Hibrit |
| Mekân adı, adres | Metin | Fiziksel ise zorunlu |
| Harita | Konum | Adresten otomatik (geocoding) |
| Online link | URL | Online ise; "etkinlikten 1 saat önce göster" seçeneği |
| Kategori | Seçim | Kültür, Eğitim, Spor, Gençlik, Kadın, Dini, Sosyal, Toplantı/Genel Kurul, Diğer (kiracı düzenleyebilir) |
| Hedef kitle | Çoklu | Herkes, Üyeler, Çocuk, Genç, Kadın, Aile, Yaşlı |
| Ücret | Metin/Seçim | Ücretsiz / Ücretli (tutar metni) |
| Kayıt | Seçim | Gerek yok / Harici link / (Faz 3: dahili kayıt formu) |
| Kontenjan | Sayı | Opsiyonel, bilgi amaçlı |
| Organizatör / ortak dernekler | İlişki | Platformdaki diğer derneklerle ortak etkinlik (Faz 2) |
| Durum etiketi | Seçim | Planlandı / Ertelendi / İptal edildi / Doldu |
| Portalda göster | Bool | Merkezi portalda listelensin mi (varsayılan: evet) |

Kabul kriterleri:
- Eğer etkinlik "İptal edildi" olarak işaretlenirse, o zaman public sitede başlık yanında kırmızı "İPTAL" rozeti görünür, etkinlik silinmez.
- Etkinlik bitiş zamanı (yoksa başlangıç + 1 gün) geçtiğinde etkinlik otomatik olarak **Geçmiş Etkinlikler**'e taşınır (BR-ARCH-01).
- Geçmiş bir etkinliğe "Etkinlik sonrası rapor" eklenebilir: özet metin, fotoğraf albümü, katılımcı sayısı. Bu, arşivin en değerli parçasıdır.
- Tekrarlayan etkinliklerde tek bir tekrar (occurrence) iptal edilebilir/düzenlenebilir.

**US-06.2 – Takvim görünümü (public)**
- Liste görünümü (varsayılan), Ay görünümü, Hafta görünümü (masaüstü).
- Filtre: kategori, hedef kitle, ay.
- Her etkinlikte **"Takvimime ekle"** (.ics indir, Google Calendar linki).
- Derneğin tüm etkinlikleri için abone olunabilir **iCal feed** (`/etkinlikler.ics`).

**US-06.3 – Etkinliği kopyala**
- Mevcut etkinlikten kopya oluşturma (tarih hariç tüm alanlar).

---

### E07 – Medya Kütüphanesi ve Galeri

**US-07.1 – Medya yükleme**
- Sürükle-bırak, çoklu seçim (tek seferde max 50 dosya), mobilde kamera/galeri.
- Desteklenen: JPG, PNG, WebP, HEIC (iPhone – otomatik JPG/WebP'ye çevrilir), GIF, SVG (sadece logo alanı, sanitize edilir), MP4 (max 200 MB – Ücretsiz pakette kapalı; video için YouTube embed önerilir).
- Yükleme ilerleme çubuğu; ağ kesilirse kaldığı yerden devam (resumable upload).
- Görseller otomatik:
  - EXIF GPS verisi **silinir** (gizlilik),
  - yön (orientation) düzeltilir,
  - max 2560 px'e küçültülür, orijinal saklanmaz (kota tasarrufu) – ayar ile değiştirilebilir,
  - WebP/AVIF varyantları ve 5 boyut (thumb 200, sm 640, md 1024, lg 1600, xl 2560) üretilir.
- Kota aşımı yaklaşırken (%80, %95) uyarı; %100'de yükleme engellenir.

**US-07.2 – Medya kütüphanesi**
- Izgara ve liste görünümü, arama (dosya adı, alt metin, etiket), filtre (tür, tarih, yükleyen, kullanılmayan).
- Her medya: alt metin (erişilebilirlik – zorunlu öneri), başlık, açıklama, fotoğrafçı/telif bilgisi, odak noktası (crop için).
- "Nerede kullanılıyor?" bilgisi; kullanılan medya silinmeye çalışılırsa uyarı.
- Çöp kutusu: silinen medya 30 gün saklanır.

**US-07.3 – Albüm / galeri**
- Albüm: başlık, tarih, açıklama, kapak, fotoğraflar (sürükleyerek sıralama), bağlı etkinlik (opsiyonel), kategori.
- Albüm oluştururken doğrudan toplu yükleme.
- Public: albüm listesi (yıl filtresi), albüm detayı ızgara + lightbox (kaydırma, klavye, mobil swipe), indirme butonu (dernek ayarına bağlı – varsayılan kapalı).
- KVKK: Albüm ayarında "Bu albümdeki kişilerin görüntü paylaşımına izin alınmıştır" onayı; çocuk içeren fotoğraflar için hatırlatma metni.

**US-07.4 – Video**
- YouTube/Vimeo link yapıştırma → otomatik önizleme; "privacy-enhanced" (youtube-nocookie) mod.
- Video galeri albümü.

---

### E08 – Belge Arşivi

**US-08.1 – Belge yükleme**
- Desteklenen: PDF, DOCX, XLSX, PPTX, ODT, JPG/PNG (taranmış belge). Max 25 MB/dosya.
- Alanlar: başlık (zorunlu), açıklama, belge türü (Tüzük, Faaliyet Raporu, Mali Rapor, Genel Kurul Tutanağı, Basın Bülteni, Form, Broşür, Diğer – kiracı genişletebilir), yıl/dönem, dil, görünürlük, etiketler.
- **Görünürlük:** Herkese açık / Yalnızca panel kullanıcıları (iç arşiv) / Link ile (tahmin edilemez URL).
- PDF'ler için ilk sayfa önizleme görseli otomatik üretilir; metin içeriği indekslenir (arama için).

**US-08.2 – Belge sürümleri**
- Aynı belgenin yeni sürümü yüklenebilir (ör. tüzük güncellemesi); public sitede son sürüm gösterilir, önceki sürümler "Geçmiş sürümler" altında (ayara bağlı).

**US-08.3 – Belgeler sayfası (public)**
- Türe göre gruplanmış liste, yıl filtresi, arama, dosya tipi/boyut bilgisi, indirme ve tarayıcıda görüntüleme.

**US-08.4 – İç arşiv**
- Panel kullanıcıları için yalnızca içeride görünen belge alanı (ör. yönetim kurulu kararları). Public siteye asla sızmaz; doğrudan URL ile erişim imzalı ve 10 dk geçerli linkle yapılır.

---

### E09 – Arşivleme, Kategori, Etiket ve Arama

**US-09.1 – Otomatik arşiv**
- Haberler: yayın tarihinden itibaren yıl/ay bazında arşivde; listede her zaman erişilebilir.
- Duyurular: bitiş tarihi geçince "aktif duyurular"dan düşer, arşivde kalır.
- Etkinlikler: bittikten sonra "Geçmiş Etkinlikler".
- Yönetim kurulu: dönem bitince "Geçmiş dönemler".

**US-09.2 – Arşiv sayfası (public)**
- `/arsiv`: yıllara göre zaman çizelgesi; her yıl için haber, etkinlik, albüm ve belge sayısı; tıklanınca o yılın tüm içerikleri.
- "Bu dernek X yılından beri Y etkinlik düzenledi" gibi otomatik istatistik kartı (kurumsal hafıza vurgusu).

**US-09.3 – Manuel arşivleme / yayından kaldırma**
- Editör bir içeriği "Arşivle" (yayında kalır, ana sayfa/listelerden düşer, arşivde ve aramada bulunur) veya "Yayından kaldır" (public'te 410 döner, panelde kalır) yapabilir.

**US-09.4 – Geçmiş içerik girişi (geriye dönük arşiv)**
- Editör, geçmiş tarihli içerik ekleyebilir (ör. 2015 etkinliği). Yayın tarihi geçmişe ayarlanabilir; içerik doğrudan arşive düşer, ana sayfada "yeni" olarak gösterilmez.
- Toplu geçmiş fotoğraf yükleme: klasör seçilir → yıl bazlı albümler (EXIF tarihine göre gruplama önerisi).

**US-09.5 – Kategori ve etiket yönetimi**
- Kategoriler içerik türü bazında (haber, etkinlik, belge, albüm); kiracı ekleyip düzenleyebilir; sıra, renk, ikon.
- Etiketler serbest; benzer etiket önerisi (yazım hatası birleştirme); etiket birleştirme aracı.

**US-09.6 – Arama (public)**
- Tek arama kutusu; haber, etkinlik, sayfa, albüm, belge (PDF metni dahil) içinde arar.
- Türkçe ve Fransızca dil-farkındalıklı arama (aksan/ı-i normalizasyonu: "dernek" = "Dernek", "cocuk" = "çocuk", "evenement" = "événement").
- Yazım toleransı (typo tolerance), sonuçlarda tür filtresi, vurgulanmış eşleşme.
- Sonuçlar < 300 ms.

**US-09.7 – Arama (panel)**
- Admin panelinde global arama (içerik, medya, belge), durum filtresi (taslak, zamanlanmış, yayında, arşiv).

---

### E10 – Çoklu Dil

**US-10.1 – Dil ayarları**
- Platformun desteklediği diller: TR, FR, EN, DE, NL (genişletilebilir).
- Kiracı: 1 varsayılan dil + en fazla 3 ek dil seçer.
- Arayüz metinleri (menü, butonlar, "Daha fazla oku", tarih formatı) platform çeviri dosyalarından gelir.

**US-10.2 – İçerik çevirisi**
- Her içerik için "Çeviri ekle" → aynı içeriğin başka dildeki sürümü (bağlı kayıt).
- Medya, tarih, konum gibi dil bağımsız alanlar çeviriler arasında paylaşılır.
- **Otomatik çeviri önerisi** (Faz 2): Tek tıkla makine çevirisi ile taslak oluşturma (DeepL API), kullanıcı kontrol edip yayınlar; "Otomatik çevrilmiştir" rozeti opsiyonel.
- Bir içeriğin ilgili dilde çevirisi yoksa: dil ayarına göre (a) gizle veya (b) varsayılan dildeki sürümü "Bu içerik yalnızca Türkçe mevcuttur" notuyla göster.

**US-10.3 – Dil değiştirici**
- Header'da dil seçici; aynı içeriğin karşılığına gider; yoksa o dilin ana sayfasına.
- `hreflang` etiketleri otomatik.
- Tarayıcı diline göre ilk ziyarette öneri bandı (zorla yönlendirme yok).

---

### E11 – İletişim Formu

**US-11.1 – Form**
- Alanlar: ad soyad, e-posta, telefon (opsiyonel), konu (seçim: Genel, Üyelik, Etkinlik, Basın, Gönüllülük, Diğer – kiracı düzenleyebilir), mesaj, KVKK onay kutusu (zorunlu, aydınlatma metni linki).
- Spam koruması: görünmez honeypot + oran sınırlama + gizlilik dostu CAPTCHA (Cloudflare Turnstile / Friendly Captcha). Google reCAPTCHA kullanılmaz.
- Gönderimde ziyaretçiye teşekkür mesajı + otomatik onay e-postası (opsiyonel).

**US-11.2 – Gelen kutusu (panel)**
- Mesaj listesi: okunmamış/okunmuş/yanıtlandı/arşiv, konu filtresi.
- Seçili kullanıcılara yeni mesaj e-posta bildirimi.
- "Yanıtla" → kullanıcının e-posta istemcisini açar (mailto) – MVP; panel içi yanıt Faz 2.
- Mesajlar 24 ay sonra otomatik silinir (KVKK – saklama süresi, kiracı 6–36 ay arası ayarlayabilir).

---

### E12 – Ana Sayfa ve Navigasyon Yönetimi

**US-12.1 – Ana sayfa bölümleri**
Dernek, ana sayfada hangi bölümlerin hangi sırada görüneceğini seçer (sürükle-bırak sıralama, aç/kapa):
1. Hero / kapak (görsel veya slayt – max 5 slayt; başlık, alt başlık, buton)
2. Kısa tanıtım (Hakkımızda özeti + "Devamı")
3. Öne çıkan haberler
4. Yaklaşan etkinlikler (max 6)
5. Son albümler
6. Rakamlarla dernek (üye sayısı, kuruluş yılı, etkinlik sayısı – manuel veya otomatik)
7. Faaliyet alanları (ikon + başlık + kısa metin, max 8)
8. Destekçiler / partnerler (logo şeridi)
9. Bağış / üye ol çağrısı (CTA bandı)
10. İletişim + harita
11. Sosyal medya akışı – **kapsam dışı** (gizlilik ve API kısıtları); bunun yerine sosyal medya butonları.

**US-12.2 – Menü yönetimi**
- Ana menü: max 7 üst öğe, 1 seviye alt menü.
- Öğe tipi: sistem sayfası, özel sayfa, kategori, harici link.
- Footer: 3 kolon (otomatik iletişim bilgileri + link grupları + sosyal medya), alt satır: telif, KVKK, çerez linkleri, "DernekHub ile oluşturuldu" ibaresi (Ücretsiz pakette zorunlu).

---

### E13 – Alan Adı (Domain) Yönetimi

**US-13.1 – Alt alan adı**
- Her kiracıya otomatik `{slug}.dernekhub.org`; otomatik SSL.

**US-13.2 – Özel domain bağlama (Faz 2)**
- Dernek Yöneticisi panelden domain girer → sistem DNS talimatlarını gösterir (CNAME veya A kaydı).
- Sistem her 10 dk'da doğrular (72 saat boyunca); doğrulanınca SSL otomatik (Let's Encrypt) ve domain "birincil" yapılabilir.
- Birincil domain değişince diğerleri 301 ile yönlendirilir.
- `www` ↔ kök domain yönlendirmesi seçilebilir.
- Domain süresi dolarsa/DNS bozulursa Süper Admin'e ve dernek yöneticisine uyarı; site alt alan adından yayında kalır.

---

### E14 – SEO ve Sosyal Paylaşım

- Her sayfa için otomatik: `<title>`, meta description, canonical, Open Graph, Twitter Card, `hreflang`.
- Yapısal veri (JSON-LD): `Organization`/`NGO` (ana sayfa), `NewsArticle` (haber), `Event` (etkinlik – tarih, konum, durum dahil), `BreadcrumbList`.
- Otomatik `sitemap.xml` (dil bazında) ve `robots.txt`; kiracı askıdayken `noindex`.
- Otomatik OG görseli: kapak yoksa başlık + logo + renklerle dinamik görsel üretimi.
- 301 yönlendirme yöneticisi: slug değişince otomatik; eski siteden taşınan URL'ler için manuel yönlendirme listesi (CSV içe aktarma).
- RSS feed: haberler ve etkinlikler.

---

### E15 – İçerik İş Akışı

**US-15.1 – Durumlar** (detay: Bölüm 11)
`taslak → (onay-bekliyor) → zamanlanmis/yayinda → arsivlendi | yayindan-kaldirildi → cop-kutusu`

**US-15.2 – Onay akışı (Faz 2)**
- Kiracı ayarı açıksa Yazar/Editör içerikleri "Onaya gönder" ile yöneticiye iletir.
- Onaylayan yorum ekleyebilir, reddedebilir (gerekçe zorunlu) → içerik taslağa döner, yazara bildirim.

**US-15.3 – Önizleme**
- Taslak içerik için paylaşılabilir önizleme linki (7 gün geçerli, `noindex`).

**US-15.4 – Sürüm geçmişi (Faz 2)**
- Her kayıtta son 20 sürüm; farkları gör, eski sürüme dön.

**US-15.5 – Çöp kutusu**
- Silinen içerikler 30 gün çöp kutusunda; geri yüklenebilir; sonra kalıcı silinir.
- Kalıcı silmeyi yalnızca Dernek Yöneticisi yapabilir.

**US-15.6 – Eşzamanlı düzenleme**
- Bir içerik başka kullanıcı tarafından açıkken "X şu anda düzenliyor" uyarısı ve kilit (devralma seçeneğiyle).

---

### E16 – Merkezi Portal (Faz 2)

**US-16.1 – Portal ana sayfası** (`dernekhub.org` veya federasyonun domaini)
- Tüm aktif derneklerin dizini (logo, ad, şehir, faaliyet alanları) – harita görünümü ve liste.
- Birleşik etkinlik takvimi (yalnızca "Portalda göster" işaretli etkinlikler); filtre: şehir, kategori, dernek, tarih, hedef kitle.
- Son haberler akışı (dernek opt-in).
- Arama: dernek, etkinlik, haber.

**US-16.2 – Öne çıkarma**
- Süper Admin portal ana sayfasında etkinlik/haber öne çıkarabilir.
- Dernekler "Portalda öne çıkarma talebi" gönderebilir.

**US-16.3 – Ortak etkinlik**
- Bir etkinlik birden fazla dernek tarafından düzenleniyorsa, ana dernek ortak dernekleri ekler; ortak dernek onayladığında etkinlik onların sitesinde de görünür (tek kayıt, çoklu gösterim).

---

### E17 – Analitik ve Raporlama (Faz 2)

- Gizlilik dostu, çerezsiz analitik (Plausible/Umami tipi) – çerez onayı gerektirmez.
- Dernek paneli kontrol tablosu: son 30 gün ziyaretçi, sayfa görüntüleme, en çok okunan 10 içerik, trafik kaynakları, cihaz türü, ülke, en çok indirilen belgeler.
- Panel ana ekranı (dashboard): son içerikler, yaklaşan etkinlikler, okunmamış mesaj sayısı, depolama kullanımı, "Bu ay 0 içerik yayınladınız" gibi teşvik mesajları.
- Süper Admin raporu: kiracı bazında aktiflik, içerik sayısı, depolama, son giriş tarihi; "30 gündür aktif olmayan dernekler" listesi; CSV dışa aktarma.
- **Yıllık faaliyet raporu üretici (Faz 3):** Seçilen yılın etkinlik, haber ve fotoğraflarından otomatik PDF rapor (genel kurul ve belediye başvuruları için çok değerli).

---

### E18 – Denetim Kaydı (Audit Log)

- Kaydedilen olaylar: giriş/çıkış, başarısız giriş, kullanıcı ekleme/çıkarma/rol değişikliği, içerik oluşturma/yayınlama/silme, tema değişikliği, domain değişikliği, kiracı durum değişikliği, Süper Admin destek erişimi, veri dışa aktarma.
- Alanlar: zaman, kiracı, kullanıcı, eylem, hedef kayıt, önceki/yeni değer özeti, IP (kısaltılmış), user agent.
- Saklama: 13 ay. Değiştirilemez (append-only).
- Dernek Yöneticisi kendi kiracısının kaydını görüntüler ve filtreler.

---

### E19 – Bildirimler ve E-posta Bülteni (Faz 2)

- Panel içi bildirimler (zil ikonu) + e-posta.
- Ziyaretçi e-posta aboneliği (double opt-in): yeni etkinlik/haber özetleri (haftalık özet veya anlık).
- Abonelikten tek tıkla çıkış; abone listesi dışa aktarma.
- Gelişmiş bülten tasarımı kapsam dışı; dernekler isterse Brevo/Mailchimp entegrasyonu (Faz 3).

---

### E20 – Paket, Kota ve Faturalama (Faz 2/3)

- Paketler ve limitler: Bölüm 16.
- Süper Admin kiracıya paket atar, kota istisnası tanımlar.
- Faz 3: Stripe ile otomatik abonelik ödemesi, fatura üretimi.

---

### E21 – KVKK / GDPR Araçları
Detay: Bölüm 14.

### E22 – Süper Admin Operasyon Araçları

- Kiracı listesi: arama, filtre (durum, paket, şehir, son aktivite), sütunlar (ad, slug, durum, kullanıcı sayısı, içerik sayısı, depolama, son giriş, oluşturulma tarihi).
- Kiracı detay: özet, kullanıcılar, kota kullanımı, domainler, audit log, notlar (iç).
- **Destek modu ("kiracı olarak görüntüle"):** Gerekçe girilerek, zaman sınırlı (60 dk) erişim; kiracı yöneticisine bilgi e-postası; audit log.
- Global duyuru: tüm dernek panellerinde banner (ör. "Yeni özellik: Takvim feed'i").
- Platform ayarları: desteklenen diller, font listesi, rezerve slug'lar, varsayılan sayfa şablonları, e-posta şablonları, yasal metin şablonları.
- Sağlık ekranı: hata oranları, kuyruk durumu (görsel işleme, e-posta), domain/SSL durumları.
- Şablon güncellemeleri: Yeni sayfa şablonu/bölüm eklendiğinde tüm kiracılara "yeni özellik" olarak sunulur; mevcut içeriği bozmaz.

---

## 9. Veri Modeli

> Tüm kiracıya ait tablolarda `tenant_id` (FK, zorunlu, indeksli) bulunur. Ortak alanlar: `id (UUID)`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` (soft delete).

### 9.1 Varlık İlişki Özeti

```
Tenant 1──* Domain
Tenant 1──1 Theme (+ ThemeVersion *)
Tenant 1──1 SiteSettings
Tenant 1──* Membership *──1 User
Tenant 1──* Page / Post / Event / Album / Document / Media / Category / Tag
Tenant 1──* BoardTerm 1──* BoardMember
Tenant 1──* ContactMessage
Tenant 1──* Subscriber (Faz 2)
Tenant 1──* AuditLog
Post/Event/Page *──* Tag ; *──1 Category
Album *──* Media ; Event 0..1──* Album
Event 1──* EventOccurrence (tekrarlayan)
Document 1──* DocumentVersion
Her içerik: translation_group_id (aynı içeriğin dil sürümlerini bağlar)
```

### 9.2 Varlıklar

**Tenant (Dernek)**
| Alan | Tip | Not |
|---|---|---|
| id | UUID | PK |
| name | string(150) | Zorunlu |
| slug | string(40) | Benzersiz |
| legal_name | string(200) | Resmi unvan |
| registration_no | string(50) | RNA / sicil no |
| founded_year | int | |
| city, country | string | country: ISO-3166 |
| timezone | string | Varsayılan Europe/Paris |
| default_locale | string(5) | ör. tr |
| locales | string[] | ör. [tr, fr] |
| status | enum | aktif-kurulumda, aktif, askida, arsivlenmis, silinmek-uzere |
| plan_id | FK | |
| storage_used_bytes | bigint | Türetilmiş, periyodik |
| onboarding_step | int | |
| published_at | datetime | İlk yayına alma |
| settings_json | jsonb | Feature flag'ler (editor_can_publish, approval_flow, …) |

**Domain**: id, tenant_id, hostname (benzersiz), type (subdomain/custom), is_primary, verification_status (bekliyor/dogrulandi/hata), ssl_status, verified_at, last_checked_at.

**User**: id, email (benzersiz), name, avatar_media_id, ui_locale, password_hash, mfa_enabled, mfa_secret (şifreli), last_login_at, status (aktif/kilitli/pasif), is_super_admin, is_support.

**Membership**: id, user_id, tenant_id, role (admin/editor/author), title, invited_by, invited_at, accepted_at, status (davet-edildi/aktif/cikarildi). Benzersiz: (user_id, tenant_id).

**Invitation**: id, tenant_id, email, role, token_hash, expires_at, accepted_at, revoked_at.

**Theme**: tenant_id, logo_media_id, logo_dark_media_id, favicon_media_id, og_default_media_id, color_primary, color_secondary, color_accent, font_heading, font_body, homepage_layout (A/B/C), header_style, radius, custom_css (Faz 2), version.
**ThemeVersion**: theme snapshot (jsonb), created_at, created_by – son 5 sürüm.

**SiteSettings**: tenant_id, tagline (i18n), short_description (i18n), address, phone, email, opening_hours (i18n), geo_lat, geo_lng, socials (jsonb), donation_url, membership_url, homepage_sections (jsonb: sıra + açık/kapalı + ayarlar), menu (jsonb), footer (jsonb), announcement_bar (jsonb), contact_subjects (i18n list), contact_recipients (user_id[]), message_retention_months.

**Page**: id, tenant_id, locale, translation_group_id, title, slug, parent_id, type (system/custom), system_key (about/mission/history/board/contact/privacy/cookies), cover_media_id, blocks (jsonb), seo (jsonb), status, published_at, show_in_menu, sort_order.

**Post (Haber/Duyuru)**: id, tenant_id, locale, translation_group_id, type (news/announcement/press), title, slug, excerpt, cover_media_id, blocks, category_id, is_featured, is_pinned, status, published_at, expires_at, album_id, seo, reading_time (türetilmiş), view_count (türetilmiş).

**Event**: id, tenant_id, locale, translation_group_id, title, slug, cover_media_id, poster_media_id, blocks, starts_at, ends_at, all_day, recurrence_rule (RFC 5545 RRULE), location_type (physical/online/hybrid), venue_name, address, geo_lat, geo_lng, online_url, online_url_reveal_minutes, category_id, audiences (enum[]), price_type, price_text, registration_type (none/external/internal), registration_url, capacity, event_status (scheduled/postponed/cancelled/full), show_on_portal, co_organizer_tenant_ids (Faz 2), report_blocks (etkinlik sonrası rapor), attendee_count, album_id, status, published_at, seo.
**EventOccurrence**: event_id, starts_at, ends_at, is_cancelled, override_json.

**Album**: id, tenant_id, locale, translation_group_id, title, slug, description, date, cover_media_id, event_id, category_id, consent_confirmed (bool), allow_download, status, published_at.
**AlbumItem**: album_id, media_id, sort_order, caption (i18n).

**Media**: id, tenant_id, filename, mime_type, size_bytes, width, height, duration, alt_text (i18n), caption, credit, focal_x, focal_y, variants (jsonb), storage_key, uploaded_by, folder, usage_count (türetilmiş), exif_taken_at (GPS hariç).

**Document**: id, tenant_id, locale, title, description, doc_type, year, visibility (public/internal/unlisted), unlisted_token, current_version_id, category_id, status, published_at.
**DocumentVersion**: id, document_id, media_id, version_no, notes, extracted_text (arama için), preview_media_id, created_at.

**BoardTerm**: id, tenant_id, name (ör. "2024–2026 Dönemi"), starts_on, ends_on, is_current.
**BoardMember**: id, term_id, full_name, role_title (i18n), photo_media_id, bio (i18n), email, show_email, consent_confirmed, sort_order.

**Category**: id, tenant_id, scope (post/event/document/album), name (i18n), slug, color, icon, sort_order.
**Tag**: id, tenant_id, name, slug.

**ContactMessage**: id, tenant_id, name, email, phone, subject, message, consent_at, ip_hash, status (yeni/okundu/yanitlandi/arsiv), spam_score, delete_after.

**Subscriber (Faz 2)**: id, tenant_id, email, locale, preferences, confirmed_at, unsubscribed_at, token.

**Redirect**: id, tenant_id, from_path, to_path, code (301/302), hits.

**AuditLog**: id, tenant_id (nullable – platform olayları), actor_user_id, action, target_type, target_id, diff_summary (jsonb), ip_truncated, user_agent, created_at.

**Plan**: id, name, max_users, max_storage_gb, max_custom_pages, max_locales, custom_domain_allowed, video_upload_allowed, remove_branding, price_monthly.

**ExportJob**: id, tenant_id, requested_by, status, file_key, expires_at.

---

## 10. İş Kuralları

| ID | Kural |
|---|---|
| BR-TEN-01 | Slug benzersiz, küçük harf, `a-z0-9-`, 3–40 karakter, rezerve kelime olamaz |
| BR-TEN-02 | Kiracı `aktif` olmadan public site "Yakında" sayfası gösterir ve `noindex` |
| BR-TEN-03 | Askıdaki kiracının içerikleri public'te görünmez, veriler korunur |
| BR-TEN-04 | Silme talebinden 30 gün sonra kalıcı silme; yedeklerde 35 gün sonra tamamen temizlenir |
| BR-AUTH-01..04 | Bölüm 6.3 |
| BR-CNT-01 | Slug, kiracı + dil + içerik türü içinde benzersizdir; çakışmada otomatik `-2` eklenir |
| BR-CNT-02 | Yayınlanmış içeriğin slug'ı değişirse eski URL'den 301 yönlendirme otomatik oluşturulur |
| BR-CNT-03 | Ana sayfada aynı anda en fazla 3 "öne çıkan" haber; 4. işaretlenirse en eskisinin işareti kaldırılır (kullanıcıya bilgi verilir) |
| BR-CNT-04 | Kapak görseli eklenen her medya için alt metin istenir; boş bırakılırsa uyarı (engelleyici değil); public'te başlık alt metin olarak kullanılır |
| BR-CNT-05 | Zamanlanmış içerik, yayın zamanında kiracı saat dilimine göre yayınlanır |
| BR-CNT-06 | Çöp kutusundaki içerik public'te 404/410 döner |
| BR-EVT-01 | Etkinlik `ends_at` (yoksa `starts_at` günü 23:59) geçince "geçmiş" sayılır |
| BR-EVT-02 | `ends_at` ≥ `starts_at` olmalı |
| BR-EVT-03 | Tekrarlayan etkinliklerin en fazla 2 yıl ileri tekrarı üretilir |
| BR-EVT-04 | İptal edilen etkinlik silinmez, rozetle gösterilir, JSON-LD `eventStatus=EventCancelled` |
| BR-EVT-05 | Online link, `online_url_reveal_minutes` ayarı varsa etkinlikten X dk öncesine kadar gizlenir |
| BR-ARCH-01 | Arşive düşen içerikler aramada ve arşiv sayfasında her zaman erişilebilir kalır |
| BR-ARCH-02 | Geçmiş tarihli yeni içerik ana sayfa "son haberler" bölümünde gösterilmez (yalnızca son 90 gün) |
| BR-MED-01 | Kiracı kota dolarsa yeni yükleme engellenir; mevcut site etkilenmez |
| BR-MED-02 | Kullanımda olan medya silinemez (önce bağlantılar kaldırılmalı) veya "yine de sil" ile silinir ve içeriklerden kaldırılır (yalnızca yönetici) |
| BR-MED-03 | GPS EXIF verisi her zaman silinir |
| BR-DOC-01 | `internal` belgeler hiçbir public listede, aramada, sitemap'te yer almaz |
| BR-LNG-01 | Varsayılan dildeki sürümü olmayan içerik yayınlanamaz (önce varsayılan dil) – kiracı ayarıyla esnetilebilir |
| BR-MSG-01 | İletişim mesajları kiracı saklama süresi sonunda otomatik silinir |
| BR-MSG-02 | Aynı IP'den 10 dk içinde en fazla 3 form gönderimi |
| BR-PRT-01 | Yalnızca `aktif` kiracıların `show_on_portal=true` içerikleri portalda görünür |
| BR-BRD-01 | Aynı anda yalnızca bir `is_current` yönetim kurulu dönemi olabilir |

---

## 11. İçerik Yaşam Döngüsü (Durum Makinesi)

```
               ┌────────────┐  onaya gönder   ┌─────────────────┐
  oluştur ───► │   TASLAK   │ ──────────────► │ ONAY BEKLİYOR   │ (Faz 2)
               └─────┬──────┘ ◄────────────── └───────┬─────────┘
                     │         reddet (gerekçe)       │ onayla
          yayınla    │                                 │
   (tarih ≤ şimdi)   ▼          (tarih > şimdi)        ▼
               ┌────────────┐ ◄──────────────── ┌──────────────┐
               │  YAYINDA   │   zamanı gelince  │ ZAMANLANMIŞ  │
               └─────┬──────┘                   └──────────────┘
          arşivle    │    yayından kaldır
          ┌──────────┼───────────────┐
          ▼                          ▼
   ┌────────────┐            ┌────────────────────┐
   │ ARŞİVLENDİ │            │ YAYINDAN KALDIRILDI│
   │ (görünür,  │            │ (public'te 410)    │
   │ listelerde │            └─────────┬──────────┘
   │ değil)     │                      │
   └─────┬──────┘                      │  sil
         └──────────────┬──────────────┘
                        ▼
                ┌──────────────┐   30 gün   ┌──────────────┐
                │ ÇÖP KUTUSU   │ ─────────► │ KALICI SİLME │
                └──────────────┘            └──────────────┘
```

| Durum | Public görünürlük | Listeler | Arama | Arşiv | Düzenlenebilir |
|---|---|---|---|---|---|
| Taslak | ✗ (önizleme linki hariç) | ✗ | ✗ | ✗ | ✓ |
| Onay bekliyor | ✗ | ✗ | ✗ | ✗ | Onaylayan |
| Zamanlanmış | ✗ | ✗ | ✗ | ✗ | ✓ |
| Yayında | ✓ | ✓ | ✓ | ✓ | ✓ (değişiklik anında yayına yansır; Faz 2'de "değişiklik taslağı") |
| Arşivlendi | ✓ (doğrudan URL) | ✗ | ✓ | ✓ | ✓ |
| Yayından kaldırıldı | ✗ (410) | ✗ | ✗ | ✗ | ✓ |
| Çöp kutusu | ✗ (410) | ✗ | ✗ | ✗ | Yalnızca geri yükle |

> Not: Etkinlikler için "geçmiş" bir durum değil, tarihten türetilen bir görünüm özelliğidir; geçmiş etkinlik "Yayında" durumunda kalır ve Geçmiş Etkinlikler listesinde gösterilir.

---

## 12. Ekran Envanteri

### 12.1 Public Site (her kiracı)
| Kod | Ekran | Notlar |
|---|---|---|
| PUB-01 | Ana sayfa | Bölüm bazlı, 3 düzen varyantı |
| PUB-02 | Hakkımızda / kurumsal sayfa şablonu | |
| PUB-03 | Özel sayfa | Blok render |
| PUB-04 | Haber listesi | Filtre, sayfalama |
| PUB-05 | Haber detayı | Paylaşım, ilgili haberler |
| PUB-06 | Etkinlik listesi / takvim | Liste/ay/hafta |
| PUB-07 | Etkinlik detayı | Takvime ekle, harita, durum rozeti, rapor bölümü |
| PUB-08 | Geçmiş etkinlikler | Yıl filtresi |
| PUB-09 | Galeri (albüm listesi) | |
| PUB-10 | Albüm detayı + lightbox | |
| PUB-11 | Belgeler | Tür gruplu |
| PUB-12 | Yönetim kurulu (+ geçmiş dönemler) | |
| PUB-13 | İletişim | Form + harita |
| PUB-14 | Arşiv (yıl zaman çizelgesi) | |
| PUB-15 | Arama sonuçları | |
| PUB-16 | Yasal sayfalar (gizlilik, çerez, künye/mentions légales) | Şablondan otomatik |
| PUB-17 | "Yakında" / "Askıda" / 404 / 410 | Markalı |
| PUB-18 | Çerez onay bandı | Yalnızca gerekirse (embed kullanılırsa) |

### 12.2 Dernek Admin Paneli
| Kod | Ekran |
|---|---|
| ADM-01 | Giriş / sihirli link / şifre sıfırlama / 2FA |
| ADM-02 | Dernek seçici |
| ADM-03 | Kurulum sihirbazı (8 adım) |
| ADM-04 | Kontrol paneli (dashboard) |
| ADM-05 | Haberler: liste / oluştur-düzenle / hızlı haber (mobil) |
| ADM-06 | Etkinlikler: liste / takvim görünümü / oluştur-düzenle / etkinlik sonrası rapor |
| ADM-07 | Sayfalar: liste (ağaç) / düzenle (blok editör) |
| ADM-08 | Galeri: albümler / albüm düzenle (toplu yükleme, sıralama) |
| ADM-09 | Medya kütüphanesi / medya detayı |
| ADM-10 | Belgeler: liste / yükle / sürümler |
| ADM-11 | Yönetim kurulu: dönemler / üyeler |
| ADM-12 | Kategoriler & etiketler |
| ADM-13 | Gelen mesajlar |
| ADM-14 | Görünüm: logo, renk, font, düzen + canlı önizleme |
| ADM-15 | Site ayarları: genel, iletişim, sosyal, menü, footer, ana sayfa bölümleri, duyuru bandı, diller |
| ADM-16 | Kullanıcılar & davetler |
| ADM-17 | Domain ayarları |
| ADM-18 | Yönlendirmeler (redirect) |
| ADM-19 | Çöp kutusu |
| ADM-20 | Denetim kaydı |
| ADM-21 | Analitik (Faz 2) |
| ADM-22 | Veri dışa aktarma & gizlilik araçları |
| ADM-23 | Profilim |
| ADM-24 | Yardım merkezi (videolu kısa rehberler, SSS) |

### 12.3 Süper Admin Paneli
| Kod | Ekran |
|---|---|
| SA-01 | Kiracı listesi |
| SA-02 | Yeni kiracı / CSV içe aktarma |
| SA-03 | Kiracı detayı (özet, kullanıcılar, kota, domain, log, notlar, durum işlemleri) |
| SA-04 | Destek modu |
| SA-05 | Planlar & kotalar |
| SA-06 | Platform ayarları (diller, fontlar, rezerve slug, şablonlar, yasal metinler) |
| SA-07 | E-posta şablonları |
| SA-08 | Global duyurular |
| SA-09 | Platform raporları |
| SA-10 | Sistem sağlığı (kuyruklar, domain/SSL, hatalar) |
| SA-11 | Merkezi portal yönetimi (öne çıkarma, onaylar) – Faz 2 |
| SA-12 | Global audit log |

### 12.4 Merkezi Portal (Faz 2)
| Kod | Ekran |
|---|---|
| POR-01 | Portal ana sayfa |
| POR-02 | Dernek dizini (liste + harita) |
| POR-03 | Birleşik etkinlik takvimi |
| POR-04 | Haber akışı |
| POR-05 | Portal arama |

---

## 13. Fonksiyonel Olmayan Gereksinimler

### 13.1 Performans
| Metrik | Hedef |
|---|---|
| LCP (mobil, 4G) | < 2,5 sn (p75) |
| INP | < 200 ms |
| CLS | < 0,1 |
| Public sayfa TTFB (önbellekten) | < 200 ms |
| Admin panel ekran açılışı | < 1,5 sn |
| Arama yanıtı | < 300 ms |
| İçerik yayınından public görünürlüğe | < 60 sn |
| Görsel işleme (tek fotoğraf) | < 10 sn |
| Lighthouse skoru (public) | Performans ≥ 90, Erişilebilirlik ≥ 95, SEO ≥ 95 |

### 13.2 Ölçeklenebilirlik
- Hedef kapasite: 500 kiracı, 5.000 panel kullanıcısı, 1 M aylık sayfa görüntüleme, 2 TB medya – mimari değişikliği olmadan.
- Yatay ölçekleme: uygulama durumsuz (stateless); medya CDN üzerinden.

### 13.3 Erişilebilirlik ve Kullanılabilirlik
- WCAG 2.1 AA (public site ve admin panel).
- Klavye ile tam gezinme, ekran okuyucu etiketleri, odak göstergeleri, renk kontrastı otomatik kontrol.
- **Mobil öncelikli admin paneli:** Haber, etkinlik ve albüm oluşturma 375 px genişlikte sorunsuz.
- Admin arayüzü dilleri: TR, FR, EN.
- Her ekranda bağlamsal yardım (ℹ️ ipuçları) ve boş durum (empty state) rehberleri.
- Tarayıcı desteği: Chrome, Safari, Firefox, Edge – son 2 sürüm; iOS Safari 15+, Android Chrome.

### 13.4 Güvenlik
- OWASP ASVS Seviye 2 hedefi; OWASP Top 10'a karşı test.
- Kiracı izolasyonu: uygulama filtresi + PostgreSQL RLS; her sürümde otomatik **kiracılar arası erişim testleri** (CI'da zorunlu).
- Tüm trafik HTTPS (HSTS); güvenlik başlıkları (CSP, X-Frame-Options, Referrer-Policy).
- Zengin metin ve SVG sanitize (XSS).
- Yükleme güvenliği: MIME doğrulama (içerik bazlı), virüs taraması (ClamAV) belgeler için, boyut sınırları.
- Hassas verilerin şifrelenmesi: dinlenme halinde (DB ve depolama), 2FA sırları uygulama düzeyinde şifreli.
- Oran sınırlama: giriş, form, API.
- Bağımlılık taraması (Dependabot/Snyk), yılda 1 harici pentest (Faz 2 sonrası).

### 13.5 Erişilebilirlik (Availability), Yedekleme, Felaket Kurtarma
| Metrik | Hedef |
|---|---|
| Uptime | ≥ %99,5 aylık |
| RPO (veri kaybı toleransı) | ≤ 24 saat (günlük yedek) + PITR ile ≤ 5 dk (Faz 2) |
| RTO (kurtarma süresi) | ≤ 4 saat |
| Yedek saklama | Günlük 14 gün, haftalık 8 hafta, aylık 6 ay; AB içinde ayrı bölge |
| Yedekten geri dönüş testi | 3 ayda bir |
| Planlı bakım | Gece 02:00–05:00 (Europe/Paris), 48 saat önceden duyuru |

### 13.6 Gözlemlenebilirlik
- Merkezi loglama (kiracı ID'li), hata takibi (Sentry), uptime izleme, kuyruk metrikleri.
- Alarm: hata oranı > %2 (5 dk), SSL bitimine < 14 gün, depolama > %80.

### 13.7 Bakım ve Sürüm Yönetimi
- CI/CD; staging ortamı; özellik bayrakları (feature flags) ile kiracı bazlı kademeli açılış.
- Veritabanı migrasyonları geriye uyumlu; sıfır kesintili deploy.
- Sürüm notları dernek panelinde "Yenilikler" bölümünde.

---

## 14. Gizlilik, KVKK / GDPR Uyumu

### 14.1 Roller
- **Dernek** = Veri sorumlusu (controller) kendi sitesindeki kişisel veriler için (iletişim mesajları, yönetim kurulu bilgileri, fotoğraflardaki kişiler, aboneler).
- **Platform** = Veri işleyen (processor) → Her dernekle **Veri İşleme Sözleşmesi (DPA)** onboarding sırasında elektronik onayla kabul edilir.
- Platform, panel kullanıcılarının hesap verileri için veri sorumlusudur.

### 14.2 Gereksinimler
| ID | Gereksinim |
|---|---|
| PRV-01 | Tüm veriler AB'de barındırılır; AB dışı alt işleyenler listelenir ve SCC ile güvence altına alınır |
| PRV-02 | Varsayılan olarak çerezsiz public site: analitik çerezsiz, fontlar self-host, harita OSM; zorunlu çerez yalnızca panel oturumu |
| PRV-03 | YouTube/Vimeo/Google Maps embed'leri kullanılırsa çerez onay bandı otomatik devreye girer; onaya kadar "İçeriği yüklemek için tıklayın" yer tutucusu |
| PRV-04 | Yasal metin şablonları (Gizlilik Politikası, Çerez Politikası, Künye/Mentions légales, KVKK Aydınlatma Metni) dernek bilgileriyle otomatik doldurulur, düzenlenebilir |
| PRV-05 | İletişim formunda açık rıza onay kutusu ve aydınlatma metni linki; rıza zaman damgası saklanır |
| PRV-06 | İlgili kişi talepleri (erişim, silme): Dernek Yöneticisi e-posta adresine göre mesaj/abone kayıtlarını bulup dışa aktarabilir veya silebilir |
| PRV-07 | Fotoğraf/kişi yüklemelerinde rıza teyidi onay kutuları (yönetim kurulu, albüm); çocuk fotoğrafları için uyarı metni |
| PRV-08 | Saklama süreleri: iletişim mesajları (varsayılan 24 ay), audit log 13 ay, silinen kiracı 30 gün + yedek 35 gün |
| PRV-09 | IP adresleri kısaltılarak/hash'lenerek saklanır |
| PRV-10 | Veri ihlali durumunda 72 saat içinde ilgili dernek yöneticilerine bildirim süreci (operasyonel prosedür) |
| PRV-11 | Platform düzeyinde Kayıt Tutma (Records of Processing – Art. 30) dokümanı |

---

## 15. Bildirimler ve E-posta Şablonları

| Kod | Tetikleyici | Alıcı | Kanal |
|---|---|---|---|
| N-01 | Davet gönderildi | Davetli | E-posta |
| N-02 | Davet kabul edildi | Davet eden | Panel + e-posta |
| N-03 | Sihirli giriş linki | Kullanıcı | E-posta |
| N-04 | Şifre sıfırlama | Kullanıcı | E-posta |
| N-05 | Hesap kilitlendi / şüpheli giriş | Kullanıcı | E-posta |
| N-06 | Yeni iletişim mesajı | Seçili alıcılar | E-posta + panel |
| N-07 | İçerik onaya gönderildi (Faz 2) | Yöneticiler | Panel + e-posta |
| N-08 | İçerik onaylandı/reddedildi (Faz 2) | Yazar | Panel + e-posta |
| N-09 | Zamanlanmış içerik yayınlandı | Oluşturan | Panel |
| N-10 | Depolama %80 / %95 / %100 | Dernek Yöneticileri | Panel + e-posta |
| N-11 | Domain doğrulandı / hata / SSL yakında bitiyor | Dernek Yöneticileri + Süper Admin | E-posta |
| N-12 | Kiracı askıya alındı / silinecek | Dernek Yöneticileri | E-posta |
| N-13 | Destek erişimi başlatıldı | Dernek Yöneticileri | E-posta |
| N-14 | Veri dışa aktarma hazır | Talep eden | E-posta |
| N-15 | 30 gündür içerik yok (teşvik) | Dernek Yöneticileri | E-posta (aylık max 1) |
| N-16 | Abonelik onayı / bülten (Faz 2) | Abone | E-posta |

- Tüm e-postalar kullanıcının arayüz dilinde; dernek kaynaklı e-postalar (N-06, N-16) dernek logosu ve renkleriyle markalı.
- Gönderen: `bildirim@dernekhub.org`, Reply-To: ilgili dernek e-postası. SPF, DKIM, DMARC yapılandırılmış.

---

## 16. Kotalar, Limitler ve Paketler

| Özellik | Ücretsiz (Başlangıç) | Standart | Pro |
|---|---|---|---|
| Panel kullanıcısı | 5 | 15 | Sınırsız |
| Depolama | 5 GB | 25 GB | 100 GB |
| Özel sayfa | 10 | 20 | 50 |
| Dil sayısı | 2 | 3 | 4 |
| Alt alan adı | ✓ | ✓ | ✓ |
| Özel domain | ✗ | ✓ | ✓ |
| Video yükleme (MP4) | ✗ | ✓ (200 MB/dosya) | ✓ |
| "DernekHub ile oluşturuldu" ibaresi | Zorunlu | Kaldırılabilir | Kaldırılabilir |
| Onay akışı, sürüm geçmişi | ✗ | ✓ | ✓ |
| Analitik | Temel | Tam | Tam |
| Otomatik çeviri | ✗ | 50 bin karakter/ay | 250 bin karakter/ay |
| Destek | Yardım merkezi | E-posta (48 saat) | Öncelikli (24 saat) |

> Fiyatlar ve paket sınırları iş modeline göre belirlenecek (bkz. Açık Sorular). Federasyon modeli seçilirse tüm dernekler tek bir "Federasyon" paketinde olabilir.

Teknik limitler: tek dosya görsel 20 MB, belge 25 MB, video 200 MB; tek seferde 50 dosya; albüm başına 500 fotoğraf; içerik başına 100 blok.

---

## 17. Yol Haritası ve Fazlar

### 17.1 Faz 0 – Keşif & Tasarım (3–4 hafta)
- 5–8 dernekle görüşme, persona doğrulama
- Bilgi mimarisi, wireframe'ler, tasarım sistemi (tasarım token'ları), 3 ana sayfa varyantı
- Teknik spike: multi-tenant CMS, domain çözümleme, görsel işleme
- Çıktı: tıklanabilir prototip, onaylı MVP backlog

### 17.2 Faz 1 – MVP (10–12 hafta)
**Kapsam:** E01 (CSV hariç toplu işlem opsiyonel), E02 (2FA süper admin zorunlu), E03 (özel CSS hariç), E04, E05, E06 (tekrarlayan etkinlik dahil), E07, E08, E09, E10 (manuel çeviri), E11, E12, E13 (yalnızca alt alan adı), E14, E15 (taslak/yayın/zamanlama/çöp kutusu/önizleme), E18, E21, E22 (temel).

**MVP "Definition of Done":**
- Kabul kriterleri karşılandı, birim + entegrasyon testleri, kiracı izolasyon testleri geçti
- WCAG AA otomatik denetim (axe) hatasız
- TR/FR arayüz çevirileri tamam
- Yardım merkezi: her ana işlem için 1 kısa video/rehber

**Pilot:** 3 dernekle 2 haftalık pilot → geri bildirim → düzeltmeler.

### 17.3 Faz 1.5 – Yaygınlaştırma (4 hafta)
- CSV toplu onboarding, kalan derneklerin dalgalar halinde (her dalga 10 dernek) açılması
- Online eğitim oturumları (TR/FR), "dernek elçisi" programı

### 17.4 Faz 2 (8–10 hafta)
E13 özel domain, E15 onay akışı + sürüm geçmişi, E16 Merkezi Portal, E17 Analitik, E19 bülten, otomatik çeviri, ortak etkinlik, paketler ve kotalar.

### 17.5 Faz 3 (sonrası)
Online bağış (Stripe/HelloAsso), etkinlik kayıt formu ve bilet, üye yönetimi ve aidat, yıllık faaliyet raporu PDF üretici, PWA ve push bildirim, açık API ve webhooks.

### 17.6 Sürüm Planı Özeti
| Hafta | Kilometre taşı |
|---|---|
| H1–H4 | Keşif, prototip, teknik spike |
| H5–H8 | Altyapı, tenant, auth, tema, medya |
| H9–H12 | Haber, etkinlik, galeri, belgeler, sayfalar |
| H13–H14 | Arama, arşiv, çoklu dil, SEO, KVKK |
| H15–H16 | Stabilizasyon, pilot (3 dernek) |
| H17–H20 | Yaygınlaştırma (50 dernek) |
| H21–H30 | Faz 2 |

---

## 18. Riskler ve Önlemler

| # | Risk | Olasılık | Etki | Önlem |
|---|---|---|---|---|
| R1 | Dernekler içerik girmiyor, siteler boş kalıyor | Yüksek | Yüksek | Kurulum sihirbazı, hazır şablon metinler, mobil hızlı haber, teşvik e-postaları, dernek elçileri, eğitim |
| R2 | Kiracılar arası veri sızıntısı | Düşük | Çok yüksek | RLS + uygulama filtresi, CI'da izolasyon testleri, pentest |
| R3 | Teknik olmayan kullanıcılar paneli karmaşık buluyor | Orta | Yüksek | Kullanılabilirlik testleri (pilot), sade arayüz, rol bazlı menü gizleme |
| R4 | Medya depolama maliyeti hızla artıyor | Orta | Orta | Otomatik sıkıştırma, orijinal saklamama, kotalar, video için YouTube |
| R5 | KVKK/GDPR ihlali (izinsiz fotoğraf, çocuk görüntüsü) | Orta | Yüksek | Rıza onay kutuları, uyarı metinleri, DPA, şikâyet/kaldırma süreci |
| R6 | Her dernek "özel" talep ediyor, şablon dağılıyor | Yüksek | Orta | Net ürün ilkesi: konfigürasyon evet, özel kod hayır; talepleri backlog'da oylama |
| R7 | Yönetici değişiminde erişim kaybı | Orta | Orta | Yetki devri akışı, min. 2 yönetici önerisi, Süper Admin kurtarma süreci |
| R8 | Spam/kötüye kullanım (form, içerik) | Orta | Orta | Captcha, oran sınırı, içerik bildirme ve Süper Admin askıya alma |
| R9 | Küçük ekip – bakım yükü | Orta | Yüksek | Hazır CMS çatısı (Payload), yönetilen servisler, otomasyon |
| R10 | Finansman/iş modeli belirsizliği | Orta | Yüksek | Açık sorular bölümünde erken karar; federasyon sponsorluğu |

---

## 19. Açık Sorular

| # | Soru | Sahibi | Karar tarihi |
|---|---|---|---|
| Q1 | Platformun marka adı ve ana domain ne olacak? | Platform sahibi | Faz 0 |
| Q2 | İş modeli: tamamen ücretsiz (sponsorlu), freemium, yoksa federasyon ödemeli mi? | Platform sahibi | Faz 0 |
| Q3 | Dernekler hangi ülkelerde? (Yalnızca Fransa mı, Türkiye de var mı? → KVKK kapsamı, dil seti) | Platform sahibi | Faz 0 |
| Q4 | Bir çatı kuruluş/federasyon var mı, Merkezi Portal'ın sahibi kim? | Platform sahibi | Faz 0 |
| Q5 | Derneklerin mevcut sitelerinden içerik taşıma (migration) gerekecek mi? Hangi platformlardan? | BA | Faz 0 |
| Q6 | Editörün varsayılan olarak yayın yetkisi olsun mu, yoksa onay akışı MVP'de mi olmalı? | PO | Faz 0 |
| Q7 | Varsayılan dil seti TR+FR yeterli mi; Arapça (RTL) ihtiyacı var mı? | PO | Faz 0 |
| Q8 | Online bağış ve etkinlik kaydı ne kadar acil? (Faz 3 yeterli mi?) | Paydaşlar | Faz 1 sonu |
| Q9 | Sosyal medya (Instagram/Facebook) içeriğinin otomatik çekilmesi istenecek mi? (API ve gizlilik kısıtları) | Paydaşlar | Faz 1 |
| Q10 | Destek kim tarafından verilecek ve hangi saatlerde? | Platform sahibi | Faz 1 |

---

## 20. Sözlük

| Terim | Açıklama |
|---|---|
| Kiracı (Tenant) | Platformdaki her bir dernek ve ona ait veri alanı |
| Multi-tenant | Tek bir uygulamanın birden çok kiracıya izole biçimde hizmet vermesi |
| Süper Admin | Platformun tamamını yöneten kullanıcı |
| Slug | URL'de kullanılan kısa, okunabilir ad (ör. `bahar-senligi-2026`) |
| Blok editör | İçeriğin metin, görsel, galeri gibi bloklardan oluşturulduğu düzenleyici |
| RLS | Row Level Security – veritabanında satır düzeyinde erişim kısıtlaması |
| ISR / revalidation | Statik sayfaların içerik değiştiğinde yeniden üretilmesi |
| OG (Open Graph) | Sosyal medyada link paylaşıldığında görünen başlık/görsel bilgisi |
| JSON-LD | Arama motorları için yapısal veri formatı |
| DPA | Veri İşleme Sözleşmesi (Data Processing Agreement) |
| RPO / RTO | Kabul edilebilir veri kaybı süresi / sistemin geri gelme süresi |
| RRULE | Tekrarlayan etkinlik kuralı standardı (iCalendar) |
| RNA | Répertoire National des Associations – Fransa dernek sicil numarası |

---

## 21. Ek A – Önerilen Teknoloji Yığını

| Katman | Öneri | Alternatif |
|---|---|---|
| Frontend (public) | Next.js (App Router), Tailwind CSS, CSS değişkenleriyle tema | Astro |
| CMS / Admin | Payload CMS 3 + resmi multi-tenant eklentisi | Strapi, Directus |
| Veritabanı | PostgreSQL (Neon / Supabase / yönetilen Postgres – AB bölgesi) | – |
| Arama | PostgreSQL full-text (MVP) → Meilisearch (Faz 2, Türkçe/Fransızca desteği iyi) | Typesense |
| Medya depolama | Cloudflare R2 (çıkış ücreti yok) + Cloudflare Images / sharp ile işleme | AWS S3 + CloudFront |
| Hosting | Vercel (AB bölgesi) veya Hetzner + Coolify (daha ucuz, tam kontrol) | Railway, Render |
| Özel domain + SSL | Vercel Domains API veya Cloudflare for SaaS | Caddy on-demand TLS |
| E-posta | Brevo veya Postmark (AB) | Amazon SES |
| Analitik | Plausible / Umami (çerezsiz) | – |
| Hata takibi | Sentry | – |
| Kuyruk/arka plan işleri | Payload Jobs / BullMQ + Redis | Inngest |
| Captcha | Cloudflare Turnstile | Friendly Captcha |
| Çeviri (Faz 2) | DeepL API | – |
| Kimlik doğrulama | Payload Auth (+ magic link, TOTP) | Auth.js, Clerk |

**Tahmini aylık işletme maliyeti (50 dernek):** ~40–150 € (hosting, DB, depolama, e-posta) – kullanım arttıkça ölçeklenir.

---

## 22. Ek B – İzlenebilirlik Matrisi (Problem → Epik)

| Problem | Çözen Epikler |
|---|---|
| P1 Site yok/güncel değil | E01, E03, E04, E12 |
| P2 Bakımsız siteler | Tek kod tabanı (Bölüm 7), E22, NFR 13.4 |
| P3 Arşiv yok | E05, E06, E07, E08, E09 |
| P4 Teknik olmayan, değişken gönüllüler | E01.3, E02.5, E05 (mobil), NFR 13.3 |
| P5 Ayrı maliyetler | Paylaşımlı altyapı, E13, E20 |
| P6 Ortak etkinlik görünürlüğü yok | E16 |

---

*Doküman sonu – v1.0 taslak. Açık sorular (Bölüm 19) netleştikçe güncellenecektir.*

