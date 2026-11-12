# DernekHub – Çalışma Akışı (Skill'ler Arası Süreç)

> Bu doküman, `CLAUDE.md`'deki rollerin (skill'lerin) **hangi sırayla çalıştığını, birbirine ne teslim ettiğini ve bir işin hangi kapılardan geçtiğini** tanımlar. `CLAUDE.md` ile birlikte bağlayıcıdır.

---

## 1. Roller ve sorumluluklar (RACI)

R = Yapar · A = Onaylar/Sahibi · C = Danışılır · I = Bilgilendirilir

| Aşama | PO/BA | UI/UX | Full-stack | QA Lead (+alt skill'ler) | Reviewer/Architect | DevOps |
|---|---|---|---|---|---|---|
| İstek değerlendirme | **A/R** | C | C | I | C | I |
| PRD / user story | **A/R** | C | C | C | C | I |
| Tasarım | C | **A/R** | C | C (a11y) | I | – |
| Test planı | C | I | C | **A/R** | I | I |
| Definition of Ready | **A** | R | C | R | C | – |
| Geliştirme | C | C | **A/R** | C | C | C |
| Testler | I | – | R (unit/int) | **A/R** (api/e2e/a11y/perf) | C | – |
| Kod inceleme | – | C (UI) | R (düzeltme) | C | **A/R** | C (infra) |
| Mimari karar / ADR | C | – | C | C | **A/R** | C |
| Deploy / altyapı | I | – | C | C | C | **A/R** |
| Sürüm onayı | **A** | I | I | R | C | R |
| UAT / pilot | **A/R** | R | I | C | – | I |
| Sürüm notları | **A/R** | C | C | I | – | I |

> **Küçük ekip notu:** Tek kişi birden fazla rolü üstlenebilir, hatta tek geliştirici + AI tüm rolleri yürütebilir. Ama **her aşama ilgili skill ile ayrı ayrı yürütülür** ve aşama çıktıları atlanmaz. Kendi kodunu inceleyen kişi `code-reviewer-architect` checklist'ini eksiksiz uygular.

---

## 2. Akış (bir işin yaşam döngüsü)

```
 ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
 │ 0. İSTEK   │──►│ 1. TANIM   │──►│ 2. TASARIM │──►│ 3. TEST    │
 │ PO/BA      │   │ PO/BA      │   │ UI/UX      │   │   PLANI    │
 │ intake     │   │ US + BR    │   │ akış+ekran │   │ QA Lead    │
 └────────────┘   └────────────┘   └────────────┘   └─────┬──────┘
                                                          ▼
                                             ╔═══════════════════════╗
                                             ║ KAPI 1: Def. of Ready ║
                                             ╚═══════════╤═══════════╝
                                                         ▼
 ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
 │ 7. YAYIN & │◄──│ 6. DEPLOY  │◄──│ 5. İNCELEME│◄──│ 4. GELİŞTİR│
 │   ÖLÇÜM    │   │ DevOps     │   │ Reviewer   │   │ Full-stack │
 │ PO/BA      │   │            │   │ + QA       │   │ + testler  │
 └────────────┘   └────────────┘   └────────────┘   └────────────┘
        ▲                ▲                ▲
  KAPI 4: Sürüm    KAPI 3: Merge    KAPI 2: Definition of Done
  onayı            (CI yeşil +
                   review onay)
```

### Aşama detayları ve teslimatlar

| # | Aşama | Skill | Girdi | Çıktı (teslimat) | Nereye |
|---|---|---|---|---|---|
| 0 | İstek değerlendirme | `product-owner-ba` | Dernek/ekip isteği | Intake kaydı + karar (kabul/beklet/red) | `docs/backlog/` veya issue |
| 1 | Tanım | `product-owner-ba` | Kabul edilen istek | US (kabul kriterleri), BR'ler, PRD güncellemesi (sürüm++) | PRD + issue |
| 1a | Mimari etki (gerekirse) | `code-reviewer-architect` | Yeni koleksiyon/servis/kişisel veri içeren US | Etki notu veya ADR taslağı | `docs/adr/` |
| 2 | Tasarım | `ui-ux-designer` | US | Akış, ekranlar (desktop + 375 px), durumlar, token kullanımı, i18n metin tablosu | Issue'ya link |
| 3 | Test planı | `senior-qa-lead` | US + tasarım | Test planı (kriter → seviye → test ID → etiket) | Issue |
| — | **KAPI 1** | PO/BA onaylar | | DoR ✓ | Issue etiketi `ready` |
| 4 | Geliştirme | `fullstack-developer` | Hazır story | Kod + migrasyon + unit/integration + izolasyon testleri | PR |
| 4a | Test otomasyonu | `playwright-api-testing`, `playwright-ui-e2e`, `accessibility-testing` | PR + test planı | API/E2E/a11y testleri (aynı PR veya eş PR) | PR |
| — | **KAPI 2** | QA Lead doğrular | | DoD raporu ✓ | PR yorumu |
| 5 | İnceleme | `code-reviewer-architect` | PR | İnceleme raporu (🔴/🟠/🟢) + karar | PR yorumu |
| — | **KAPI 3** | Reviewer onay + CI yeşil | | Merge | `main` |
| 6 | Deploy | `devops-platform-engineer` | `main` | Prod deploy + smoke + izleme | Release |
| 6a | Performans (sürüm öncesi) | `load-performance-testing` | Staging | Perf raporu | `perf/results/` |
| — | **KAPI 4** | PO/BA (QA + DevOps raporlarıyla) | | Sürüm onayı | Release notu |
| 7 | Yayın & ölçüm | `product-owner-ba` | Yayındaki özellik | Sürüm notu (TR/FR), feature flag ile kademeli açılış, KPI takibi, UAT | Panel "Yenilikler" + KPI raporu |

---

## 3. Kapı 1 – Definition of Ready (DoR)

Bir story ancak şu koşulların hepsi sağlandığında geliştirmeye alınır:

- [ ] US, PRD'de kayıtlı ve PRD sürümü güncellenmiş
- [ ] Kabul kriterleri Gherkin formatında: mutlu yol + ≥ 2 hata/sınır durumu + yetki + mobil + çoklu dil
- [ ] İlgili iş kuralları (BR-xx) yazılı ve ölçülebilir
- [ ] Kiracı izolasyonu ve gizlilik etkisi değerlendirilmiş (kişisel veri varsa saklama süresi belli)
- [ ] Tasarım hazır: akış, desktop + 375 px, tüm durumlar, i18n metin tablosu (TR/FR/EN)
- [ ] Test planı hazır (kriter → test eşlemesi)
- [ ] Mimari etki varsa ADR onaylanmış
- [ ] Bağımlı story'ler tamamlanmış veya planlanmış
- [ ] Boyut ≤ 3 geliştirme günü (değilse bölünür)
- [ ] Analitik olayı tanımlı (gerekiyorsa)

## 4. Kapı 2 – Definition of Done (DoD)

`CLAUDE.md` §11'deki liste aynen geçerlidir. Buna ek olarak:

- [ ] Tasarım kontrol listesi (`ui-ux-designer` §6) uygulandı ve ekran görüntüleri PR'da
- [ ] Test planındaki her kriterin karşılığı bir test olarak var
- [ ] QA Lead DoD raporu PR'a eklendi

## 5. Kapı 3 – Merge

- [ ] CI tamamen yeşil (lint, tip, unit, integration, **isolation**, api, e2e, a11y, visual, Lighthouse, docker build)
- [ ] `code-reviewer-architect` kararı: ONAY (🔴 bulgu yok)
- [ ] Migrasyon varsa expand/contract kuralına uygun ve DevOps'a not düşüldü

## 6. Kapı 4 – Sürüm onayı

- [ ] Staging'de tam gece paketi yeşil
- [ ] Sürüm öncesi k6 load testi eşikleri geçti
- [ ] Açık Blocker/Critical bug yok
- [ ] Sürüm notları (TR/FR) hazır
- [ ] Gerekiyorsa feature flag ile önce pilot dernekler (kademeli açılış planı)
- [ ] Geri alma adımı belli (DevOps)

---

## 7. Bug akışı

```
Bulgu (QA / dernek / izleme) → QA Lead: bug raporu + önem
   ├─ Blocker (izolasyon, veri kaybı, güvenlik, site çöktü)
   │     → Hemen: DevOps (gerekirse rollback / askı) + Full-stack hotfix
   │     → Hotfix kapıları kısaltılmaz: test + review zorunlu (yalnızca DoR atlanır)
   │     → Sonrasında: postmortem (docs/postmortems/) + regresyon testi
   ├─ Critical / Major → PO önceliklendirir → bir sonraki sprint
   └─ Minor → backlog
```
- **Her bug düzeltmesi, o bug'ı yakalayan bir test ile birlikte gelir.**
- İzolasyon ihlali veya kişisel veri sızıntısı şüphesinde `incident-response` runbook'u devreye girer (GDPR 72 saat bildirim değerlendirmesi).

## 8. Değişiklik (scope change) akışı

Geliştirme sırasında yeni bir ihtiyaç çıkarsa:
1. Geliştirici **kodu genişletmez**. Durumu PO/BA'ya iletir.
2. PO/BA karar verir: (a) mevcut story'ye ekle (kabul kriteri güncellenir, tasarım/test planı güncellenir), (b) yeni story aç, (c) reddet.
3. Mimari etki varsa Reviewer/Architect devreye girer.

## 9. Ritim (önerilen, 2 haftalık sprint)

| Ne zaman | Ne | Kim |
|---|---|---|
| Sprint başı | Planlama: DoR'u geçmiş story'lerden seçim | PO/BA + ekip |
| Her gün | Kısa durum: engeller, bekleyen kapılar | Ekip |
| Sprint ortası | Backlog refinement: sonraki sprintin story'leri DoR'a hazırlanır | PO/BA, UI/UX, QA Lead |
| Sprint sonu | Demo (staging) + retrospektif | Ekip (+ pilot dernek temsilcisi, opsiyonel) |
| Aylık | KPI raporu, stress/spike testi, maliyet raporu | PO/BA, QA, DevOps |
| Çeyreklik | DR tatbikatı, soak testi, a11y manuel denetimi, ADR gözden geçirme | DevOps, QA, Architect |

## 10. Doküman haritası

| Doküman | Sahibi | İçerik |
|---|---|---|
| `CLAUDE.md` | Architect | Bağlayıcı temel kurallar |
| `WORKFLOW.md` | PO/BA + Architect | Bu doküman |
| `docs/spec/dernek-platformu-spec.md` | PO/BA | PRD – ne yapılacak |
| `docs/spec/dernek-platformu-teknik-mimari.md` | Architect | SAD – nasıl yapılacak |
| `docs/adr/` | Architect | Mimari kararlar |
| `docs/ux/` | UI/UX | Araştırma, tasarım kararları |
| `docs/qa/` | QA Lead | Test planları, a11y denetimleri |
| `docs/runbooks/` | DevOps | Operasyon prosedürleri |
| `docs/postmortems/` | DevOps + Architect | Olay sonrası analizler |
| `perf/results/` | QA (perf) | Yük testi sonuçları |
| `.claude/skills/*/SKILL.md` | İlgili rol | Rol talimatları |
