# Grill PRD

Skill untuk Claude Code yang mewawancarai kamu secara mendalam (satu pertanyaan per giliran, selalu dengan rekomendasi jawaban) sampai pemahaman bersama tercapai, lalu menulis **PRD yang presisi**: stack, arsitektur, data model, dan feature map bertingkat (feature → sub-feature) yang sudah diurutkan per fase.

Cocok dipakai saat kamu ingin menulis, memperbaiki, atau memvalidasi PRD, atau merencanakan aplikasi/fitur baru.

> Diadaptasi dari skill `grill-me` ([mattpocock/skills](https://github.com/mattpocock/skills), lisensi MIT).

---

## Daftar isi

- [Fitur utama](#fitur-utama)
- [Instalasi](#instalasi)
- [Cara pakai](#cara-pakai)
- [Alur kerja](#alur-kerja)
- [Cabang desain (design tree)](#cabang-desain-design-tree)
- [Default stack & katalog layer](#default-stack--katalog-layer)
- [Aturan presisi](#aturan-presisi)
- [Output](#output)
- [Struktur repo](#struktur-repo)
- [FAQ](#faq)
- [Lisensi & kredit](#lisensi--kredit)  (MIT, lihat [LICENSE](./LICENSE))

---

## Fitur utama

- **Grilling bertahap** — pertanyaan diajukan satu per satu, mengikuti urutan dependensi (bukan urutan template).
- **Rekomendasi di setiap pertanyaan** — kamu cukup membalas `ok` untuk menerima.
- **Cek kompatibilitas stack otomatis** — mendeteksi kombinasi teknologi yang bertabrakan (mis. Laravel di Vercel) dan mengusulkan perbaikan.
- **Pemeriksaan dependensi fase** — memastikan fitur tidak ada di fase yang lebih awal daripada fitur yang dibutuhkannya.
- **Decision Log** dalam format ADR ringkas, sehingga setiap keputusan terdokumentasi beserta alasannya.
- **Dua output**: `PRD.md` (dokumen untuk manusia) dan `feature-map.json` (skema terstruktur untuk dirender, dijadikan tiket, atau dijadikan dasar scaffold).
- **Mode `AI pick`** — kalau belum punya stack, skill memilihkan default yang cocok dengan kebutuhan, lengkap dengan alasannya.

## Instalasi

Skill ini hanya berisi satu file: `SKILL.md`.

**Opsi 1 — level user (tersedia di semua project):**

```bash
mkdir -p ~/.claude/skills/grill-prd
cp SKILL.md ~/.claude/skills/grill-prd/SKILL.md
```

**Opsi 2 — level project (hanya di repo tertentu):**

```bash
mkdir -p .claude/skills/grill-prd
cp SKILL.md .claude/skills/grill-prd/SKILL.md
```

Setelah itu, mulai ulang Claude Code (atau buka sesi baru) agar skill terdeteksi.

Pastikan frontmatter di bagian atas `SKILL.md` tetap ada, karena Claude Code memakai `name` dan `description` untuk memutuskan kapan skill dipanggil:

```yaml
---
name: grill-prd
description: Grill the user relentlessly, ... Use when the user wants to write, refine, or validate a PRD or plan a new app/feature.
---
```

## Cara pakai

Panggil skill secara eksplisit, atau cukup sebutkan kebutuhanmu. Contoh pemicu:

```
/grill-prd
```

```
Saya mau bikin aplikasi katalog desain billboard untuk pemerintah desa. Tolong grill saya dan tulis PRD-nya.
```

```
Validasi PRD saya di docs/prd/toko-online/PRD.md
```

```
Plan fitur baru: sistem booking lapangan futsal.
```

Selama sesi, kamu akan melihat format pertanyaan seperti ini:

```
❓ [B3.2] Siapa yang mengisi katalog desain pertama kali?
Why it matters: Design Gallery (Fase 1) kosong tanpa sumber data.
➡️ Recommendation: Admin upload lewat panel Manage Designs, jadi Manage Designs + Admin Login pindah ke Fase 1.
Alternatives: (a) seed manual lewat script di Fase 1; (b) impor dari folder Google Drive.
```

Kode `[B3.2]` berarti cabang B3, pertanyaan ke-2. Setiap berpindah cabang, skill menampilkan progres, misalnya `Branches done: B1 ✅ TP ✅ B2 ✅ | Now: B3`.

Jika tersedia tool pilihan ganda interaktif (mis. `AskUserQuestion`), pertanyaan dengan opsi diskrit akan ditampilkan sebagai pilihan. Kamu tetap bisa mengetik jawaban sendiri.

### Perintah yang berguna selama sesi

| Yang kamu ketik | Efek |
|---|---|
| `ok` | Menerima rekomendasi |
| `batch mode` | Skill boleh mengajukan hingga 4 pertanyaan independen sekaligus |
| `skip` | Pertanyaan diisi rekomendasi, ditandai `[ASSUMPTION]`, dan masuk Open Questions |
| `enough, write the PRD` | Berhenti menggali dan langsung menulis PRD |
| `Let AI pick` | Menyerahkan satu layer stack ke skill |

## Alur kerja

```
TP (preferensi teknologi)
   │
   ▼
B1 Problem & users ─► B2 Aktor & akses ─► B3 Scope & feature map
                                              │
   ┌──────────────────────────────────────────┘
   ▼
B4 Flow & aturan bisnis ─► B5 Data model ─► B6 Stack & arsitektur
                                              │
                                              ▼
                       B7 NFR ─► B8 Fase rilis & validasi dependensi
                                              │
                                              ▼
                      Shared-understanding summary ─► konfirmasi user
                                              │
                                              ▼
                              Definition of Ready terpenuhi
                                              │
                                              ▼
                         Tulis PRD.md + feature-map.json
```

Skill tidak menulis PRD sebelum kamu mengonfirmasi ringkasan pemahaman bersama.

## Cabang desain (design tree)

Setiap cabang selesai ketika **exit criteria**-nya terpenuhi.

| Cabang | Yang digali | Exit criteria |
|---|---|---|
| **B1 — Problem & users** | Pengguna utama, apa yang dilakukan sekarang, satu core value, pemicu retensi, buyer vs user | Pernyataan masalah, 1 core value, 1 "first-session job", 1 pemicu retensi, metrik sukses |
| **TP — Tech preferences** | Mode `AI pick` atau pilih sendiri; lalu frontend, backend, database, deployment | Mode ditetapkan; tiap layer punya sumber (`user`, `ai`, atau `assumption`); tidak ada konflik kompatibilitas |
| **B2 — Aktor & akses** | Role (guest, user, admin, dst.), matriks role × kapabilitas, metode auth | Matriks role lengkap, auth dipilih, tidak ada fitur tanpa role |
| **B3 — Scope & feature map** | Fitur turunan dari job B1, MoSCoW, non-goals, sumber data tiap fitur | Setiap fitur punya tujuan, role, sub-fitur, prioritas; setiap data punya sumber |
| **B4 — Flow & aturan bisnis** | Happy path, edge case (kosong, gagal bayar, duplikat, pembatalan, kedaluwarsa), state machine, rumus harga | Setiap sub-fitur punya acceptance criteria Given/When/Then; setiap status punya transisi dan pemicunya |
| **B5 — Data model** | Entitas, relasi, kardinalitas, owner, soft/hard delete, audit trail, file & media, data pribadi | ERD final; setiap sub-fitur terpetakan ke entitas yang dibaca/ditulis |
| **B6 — Stack & arsitektur** | Layer yang belum dipilih, ORM, auth, storage, topologi, integrasi eksternal | Setiap komponen punya alasan yang terkait requirement; diagram arsitektur; struktur folder |
| **B7 — NFR** | Performa (p95), skala, ketersediaan, keamanan, observability, deployment, estimasi biaya | Setiap NFR punya angka atau aturan yang bisa diverifikasi |
| **B8 — Fase rilis** | Pengelompokan fitur per fase; Fase 1 harus berupa vertical slice end-to-end | Tidak ada pelanggaran dependensi; tiap fase punya tujuan dan definition of done |

## Default stack & katalog layer

### Default stack (rekomendasi awal)

| Layer | Default | Pilih alternatif jika |
|---|---|---|
| Runtime & monorepo | Bun + TypeScript, Nx monorepo | Project kecil satu aplikasi → single repo |
| API | Hono (Bun / Cloudflare Workers) | Hanya Bun + butuh end-to-end types → ElysiaJS; throughput sangat tinggi → Go Fiber; tim PHP / CRUD admin berat → Laravel |
| Public web | Next.js App Router (SSR/SSG untuk SEO) | Tidak butuh SEO → React + Vite / Vue |
| Admin dashboard | React + Vite atau Vue | Admin sangat sederhana → protected routes di aplikasi yang sama |
| UI | shadcn/ui + Tailwind CSS | — |
| Validasi & kontrak | Zod, package `contracts` bersama untuk FE & BE | — |
| Database | PostgreSQL + Drizzle atau Prisma | Full di Workers → Cloudflare D1 |
| Auth | better-auth | SSO institusi → OAuth/OIDC |
| File | Cloudflare R2 / storage kompatibel S3 | — |
| Notifikasi | WhatsApp / Telegram Bot / email | — |
| Deploy | Docker + VPS, atau Cloudflare | — |

### Katalog layer (opsi untuk TP)

| Layer | Opsi |
|---|---|
| Frontend | Next.js · React (Vite) · TanStack Start · React Router 7 / Remix · Astro · Vue.js · Nuxt · SvelteKit · Angular · None (API only) |
| Backend | Next.js Route Handlers / Server Actions · Nuxt server · Node.js (Express / Fastify / NestJS) · Hono · ElysiaJS (Bun) · Deno · Python (FastAPI / Django) · Go (Fiber / Echo) · Rust (Axum / Actix) · Laravel (PHP) · BaaS (Supabase / Firebase) |
| Database | PostgreSQL · Neon · Supabase · Prisma Postgres · MySQL · PlanetScale · SQLite / Turso · Cloudflare D1 · MongoDB · Firebase Firestore · Redis (cache/queue, bukan primary) |
| Deployment | Vercel · Netlify · Cloudflare (Workers / Pages) · Railway · Render · Fly.io · AWS · GCP (Cloud Run) · Azure (App Service) · Hetzner Cloud · DigitalOcean · VPS (manual) · Coolify · Docker / Kubernetes |

Katalog tidak lengkap. Kamu bebas mengetik teknologi lain; skill akan memverifikasi bahwa teknologi tersebut masih aktif dan dirawat sebelum merekomendasikannya.

### Compatibility check

Skill menjalankan pemeriksaan ini setelah TP dan lagi di B6. Contoh konflik yang dideteksi:

| Kombinasi | Yang diperiksa |
|---|---|
| Host serverless (Vercel, Netlify, Cloudflare) + backend jangka panjang (Laravel, Django, Go, Rust, NestJS) | Perlu host terpisah atau runtime yang kompatibel serverless |
| Cloudflare Workers + PostgreSQL / MySQL | Perlu driver/pooler yang kompatibel (Hyperdrive) atau pertimbangkan D1 |
| Serverless + realtime (chat, live update) | WebSocket persisten tidak cocok → layanan realtime terkelola atau server jangka panjang |
| Serverless + SQLite file | File lokal tidak persisten → Turso atau D1 |
| BaaS (Supabase / Firebase) + library auth terpisah | Dua sistem auth → tentukan satu pemilik user dan session |
| MongoDB / Firestore + data relasional (order, invoice, stok) | Tandai ketidakcocokan; rekomendasikan database relasional |
| ORM bahasa ≠ bahasa backend | Samakan: TS → Drizzle/Prisma; Go → GORM/sqlc; Rust → SeaORM/sqlx; PHP → Eloquent; Python → SQLAlchemy/Django ORM |
| Self-hosted (VPS, Coolify, Docker/K8s) | Tanyakan siapa yang mengurus backup, TLS, monitoring, update; K8s untuk app kecil ditandai over-engineering |
| Pengguna terkonsentrasi di satu wilayah | Pilih region host dan DB yang dekat, dan samakan region app dengan DB |
| Anggaran gratis/minimal | Cek batas free tier (instance tidur, limit koneksi, kapasitas storage) |

## Aturan presisi

Sebelum PRD ditulis, skill memeriksa aturan berikut:

**Phase Dependency Check**
- Fitur tidak boleh berada di fase lebih awal daripada fitur yang dibutuhkannya.
- Fitur yang **menampilkan** data harus berada di fase yang sama atau setelah fitur yang **membuat** data tersebut (atau ada seed yang direncanakan).
- Fitur yang membutuhkan login tidak boleh mendahului fitur auth.
- Core value dari B1 harus hadir di Fase 1.
- Pemicu retensi dari B1 harus punya fitur yang mengirimkannya.

**Spec quality**
- Setiap sub-fitur punya minimal satu acceptance criteria Given/When/Then.
- Setiap sub-fitur terhubung ke entitas (B5), endpoint (jika ada), dan role (B2).
- Kata sifat tanpa ukuran tidak diterima: "cepat" → `p95 < 500 ms`; "banyak" → `≤ 5.000 desain`.
- Setiap pilihan stack punya kolom "Reason" yang merujuk ke requirement, bukan selera.
- Fitur tanpa role, tanpa sumber data, atau tanpa keterkaitan dengan job B1 diusulkan untuk dihapus atau dipindah ke Non-goals.

## Output

Dua artifact dihasilkan:

1. **`PRD.md`** — dokumen lengkap (13 bagian: ringkasan, masalah & JTBD, tujuan & metrik, aktor & matriks role, feature map, spesifikasi fitur, data model, API surface, arsitektur & stack, NFR, fase, decision log, asumsi & pertanyaan terbuka).
2. **`feature-map.json`** — skema terstruktur untuk membuat feature map visual, memecah menjadi tiket, atau scaffolding.

Jika bekerja di dalam codebase, file disimpan di:

```
docs/prd/<slug>/PRD.md
docs/prd/<slug>/feature-map.json
```

Di luar codebase, keduanya dibuat sebagai dokumen di chat.

### Contoh `feature-map.json` (ringkas)

```json
{
  "project": { "name": "Billboard Design Portal", "slug": "billboard-design-portal", "status": "planning", "version": "0.1" },
  "phases": [
    { "id": 1, "name": "MVP Catalog & Pricing", "goal": "Pemerintah desa bisa melihat desain beserta harga dan menghubungi admin" }
  ],
  "stack": {
    "mode": "user",
    "frontend": { "choice": "Next.js", "source": "user" },
    "backend": { "choice": "Hono (Bun)", "source": "ai" },
    "database": { "choice": "PostgreSQL", "source": "ai" },
    "deployment": { "choice": "VPS (Coolify)", "source": "ai" }
  },
  "roles": ["guest", "admin"],
  "features": [
    {
      "id": "F-GAL",
      "name": "Design Gallery",
      "phase": 1,
      "status": "planned",
      "priority": "must",
      "roles": ["guest"],
      "dependsOn": ["F-MDS", "F-PRC"],
      "subFeatures": [
        {
          "id": "F-GAL-01",
          "name": "Design Catalog",
          "priority": "must",
          "acceptanceCriteria": [
            "Given active designs exist, When a guest opens /designs, Then a grid of designs is shown with thumbnail, name, and starting price"
          ],
          "entities": ["Design", "DesignPrice"],
          "endpoints": ["GET /api/designs"]
        }
      ]
    }
  ]
}
```

Aturan skema:
- `status`: `planned | in_progress | done | dropped`
- `priority`: `must | should | could | wont`
- `icon`: nama ikon lucide (mis. `layout-grid`, `search`, `shopping-cart`)
- ID stabil: `F-<KODE>` untuk fitur, `F-<KODE>-NN` untuk sub-fitur. ID yang sama dipakai di `PRD.md` dan JSON.
- `dependsOn` hanya berisi ID fitur yang ada.
- `stack.mode`: `ai | user`. Setiap layer punya `source`: `user | ai | assumption`.

## Struktur repo

```
grill-prd/
├── SKILL.md    # Definisi skill (frontmatter + instruksi lengkap)
├── README.md   # Dokumentasi ini
└── LICENSE     # Lisensi MIT
```

## FAQ

**Apakah saya harus menjawab semua pertanyaan?**
Tidak. Jawab `ok` untuk menerima rekomendasi, atau `skip` untuk ditandai sebagai asumsi. Skill berhenti menggali saat Definition of Ready terpenuhi atau kamu minta langsung ditulis.

**Bagaimana kalau saya belum punya stack?**
Pilih `Let AI pick`. Skill memilih default yang sesuai kebutuhan di B6 dan mencatat alasannya.

**Bagaimana kalau saya sudah punya stack tertentu?**
Sebutkan per layer di tahap TP. Pilihanmu dianggap sebagai constraint. Jika ada konflik, skill menanyakannya dulu sebelum mengubah apa pun.

**Apakah skill menulis kode?**
Tidak. Skill hanya menghasilkan dokumen PRD dan feature map. Implementasi dilakukan setelahnya.

**Bahasa apa yang digunakan?**
Instruksi di `SKILL.md` berbahasa Inggris, tetapi kamu bisa menjawab dalam bahasa apa pun, termasuk Bahasa Indonesia. Bahasa dokumen PRD tidak diatur secara eksplisit di `SKILL.md`, jadi sebutkan bahasa yang kamu mau di awal sesi.

## Lisensi & kredit

- Ide dan kerangka wawancara (grilling) diadaptasi dari skill `grill-me` di [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
- Lisensi untuk `grill-prd` itu sendiri: [MIT](./LICENSE) © 2026 rezkycodes.
- Bagian yang diadaptasi dari `grill-me` tetap tunduk pada lisensi MIT aslinya.
