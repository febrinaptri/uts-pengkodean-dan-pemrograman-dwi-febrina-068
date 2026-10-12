# 📚 Sistem Informasi Akuntansi
### Dokumentasi Tugas UTS — Perancangan Database, Otomatisasi Stok, dan Purwarupa Voucher Kas Keluar

Repository ini berisi dokumentasi pengerjaan tugas **Sistem Informasi Akuntansi (SIA)** yang mencakup perancangan database akuntansi, otomatisasi pencatatan mutasi persediaan menggunakan PostgreSQL Trigger, serta pengembangan purwarupa antarmuka Voucher Entri Transaksi Kas Keluar.

Proyek ini disusun untuk mendokumentasikan penerapan konsep akuntansi dan teknologi informasi dalam perancangan sistem yang terstruktur, memiliki validasi transaksi, serta memperhatikan integritas dan keterlacakan data.

---

## 📌 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Tujuan](#-tujuan)
- [Ruang Lingkup Pengerjaan](#-ruang-lingkup-pengerjaan)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Repository](#-struktur-repository)
- [Dokumentasi dan Bukti Pengerjaan](#-dokumentasi-dan-bukti-pengerjaan)
- [Validasi dan Pengendalian](#-validasi-dan-pengendalian)
- [Status Implementasi](#-status-implementasi)
- [Penutup](#-penutup)

## 📝 Tentang Proyek

Sistem Informasi Akuntansi merupakan sistem yang mendukung proses pencatatan, pengolahan, dan pengendalian informasi keuangan. Dalam tugas ini, konsep tersebut diterapkan melalui tiga bagian pengerjaan yang saling melengkapi, mulai dari desain struktur database hingga perancangan antarmuka transaksi akuntansi.

Repository ini berfungsi sebagai dokumentasi teknis dan akademik yang mencakup kode SQL, analisis database, purwarupa aplikasi, serta bukti dan hasil verifikasi yang relevan.

## 🎯 Tujuan

1. Merancang struktur database akuntansi dengan relasi antartabel dan batasan integritas data.
2. Menerapkan otomatisasi perubahan stok menggunakan database trigger.
3. Merancang purwarupa Voucher Entri Transaksi Kas Keluar untuk membantu pencatatan transaksi pengeluaran kas.
4. Mendokumentasikan validasi transaksi dan rekomendasi pengendalian sistem.
5. Menyediakan bukti pengerjaan yang terstruktur dan mudah ditinjau.

## 📂 Ruang Lingkup Pengerjaan

### Soal 1 — Perancangan Database Akuntansi

Bagian ini membahas perancangan struktur database untuk pencatatan jurnal akuntansi.

**Komponen utama:**
- `chart_of_accounts` — menyimpan daftar akun akuntansi.
- `journal_headers` — menyimpan informasi utama transaksi jurnal.
- `journal_lines` — menyimpan rincian baris jurnal, termasuk akun dan nilai debit atau kredit.

**Fokus pengerjaan:**
- Primary key dan foreign key.
- Relasi antartabel.
- Constraint untuk menjaga validitas nilai debit dan kredit.
- Analisis normalisasi hingga Third Normal Form (3NF).
- Dokumentasi Entity Relationship Diagram (ERD).

### Soal 2 — Otomatisasi Mutasi Persediaan

Bagian ini membahas penggunaan PostgreSQL Trigger untuk memperbarui stok secara otomatis ketika transaksi persediaan dicatat.

**Jenis transaksi yang ditangani:**
- `PURCHASE` — menambah stok.
- `SALE` — mengurangi stok.
- `ADJUSTMENT` — menyesuaikan stok berdasarkan kuantitas transaksi.

**Fokus pengendalian:**
- Validasi jenis dan kuantitas transaksi.
- Penolakan penjualan ketika stok tidak mencukupi.
- Pencegahan stok negatif.
- Penggunaan `SELECT ... FOR UPDATE` untuk membantu mengendalikan akses bersamaan terhadap baris barang.
- Pengujian perubahan stok dan penanganan transaksi yang ditolak.

### Soal 3 — Purwarupa Voucher Entri Transaksi Kas Keluar

Bagian ini berfokus pada rancangan antarmuka untuk pencatatan transaksi pengeluaran kas dalam sistem informasi akuntansi.

Purwarupa dirancang menggunakan React dan Tailwind CSS dengan fokus pada kemudahan pengisian voucher, pencatatan jurnal, validasi debit dan kredit, serta informasi status transaksi.

**Cakupan rancangan:**
- Formulir voucher kas keluar.
- Pemilihan akun dan pengisian baris jurnal.
- Perhitungan total debit dan kredit.
- Indikator keseimbangan jurnal.
- Rancangan status transaksi, seperti `DRAFT` dan `POSTED`.
- Riwayat transaksi dan informasi audit trail.
- Verifikasi materi akuntansi menggunakan NotebookLM.
- Dokumentasi prompt dan hasil pengerjaan.

Fitur yang ditampilkan pada purwarupa merupakan bagian dari rancangan antarmuka. Implementasi backend, penyimpanan persisten, dan integrasi database perlu diverifikasi secara terpisah.

## 🛠️ Teknologi yang Digunakan

| Teknologi | Kegunaan |
|---|---|
| PostgreSQL | Perancangan database, constraint, dan trigger |
| Supabase | Lingkungan database PostgreSQL yang digunakan atau direncanakan dalam pengerjaan, sesuai konfigurasi aktual |
| React | Perancangan antarmuka purwarupa |
| Tailwind CSS | Pengaturan tampilan dan tata letak antarmuka |
| TypeScript / TSX | Penulisan kode purwarupa React |
| GitHub | Penyimpanan kode dan dokumentasi proyek |
| Visual Studio Code | Lingkungan pengembangan dan penyuntingan kode |
| Gemini Canvas | Pembuatan atau eksplorasi purwarupa antarmuka |
| NotebookLM | Verifikasi materi berdasarkan sumber yang diunggah |

## 🗂️ Struktur Repository

Struktur berikut menggambarkan pengelompokan dokumen yang digunakan dalam proyek. Nama file dapat disesuaikan dengan file aktual di repository.

```text
uts-sistem-informasi-akuntansi/
│
├── README.md
│
├── Soal_1/
│   ├── database.sql
│   ├── ERD.png
│   └── analisis_3NF.md
│
├── Soal_2/
│   ├── inventory_trigger.sql
│   └── screenshot_pengujian/
│
└── Soal_3_Voucher_Kas_Keluar/
    ├── purwarupa_voucher_kas_keluar.tsx
    ├── prompt_gemini.md
    ├── prompt_notebooklm.md
    ├── verifikasi_notebooklm.md
    ├── spesifikasi_audit_trail.md
    └── screenshot/
```

> Catatan: struktur di atas merupakan gambaran dokumentasi. Pastikan nama folder dan file yang ditampilkan sesuai dengan isi repository sebenarnya. Jangan mencantumkan file atau folder yang belum dibuat seolah-olah sudah tersedia.

## 📑 Dokumentasi dan Bukti Pengerjaan

Dokumentasi dalam repository ini digunakan untuk membantu peninjauan setiap bagian tugas.

| Dokumen | Keterangan |
|---|---|
| `database.sql` | DDL dan constraint database akuntansi |
| `ERD.png` | Diagram relasi antartabel |
| `analisis_3NF.md` | Analisis normalisasi database |
| `inventory_trigger.sql` | Function dan trigger untuk mutasi stok |
| Screenshot pengujian Soal 2 | Bukti perubahan stok dan penolakan transaksi yang tidak valid |
| File `.tsx` | Kode purwarupa Voucher Kas Keluar |
| `prompt_gemini.md` | Dokumentasi prompt untuk Gemini Canvas |
| `prompt_notebooklm.md` | Dokumentasi prompt untuk NotebookLM |
| `verifikasi_notebooklm.md` | Ringkasan hasil verifikasi berdasarkan sumber yang diunggah |
| `spesifikasi_audit_trail.md` | Rancangan pengendalian dan keterlacakan transaksi |
| Screenshot Soal 3 | Bukti tampilan purwarupa dan proses verifikasi |

Daftar ini menunjukkan dokumen yang diharapkan tersedia; keberadaan setiap file perlu disesuaikan dengan unggahan aktual.

## 🔐 Validasi dan Pengendalian

Prinsip pengendalian yang menjadi fokus pengerjaan meliputi:

1. **Integritas referensial:** hubungan antartabel dijaga melalui primary key dan foreign key.
2. **Validasi jurnal:** nilai debit dan kredit tidak boleh negatif, dan baris jurnal harus memenuhi aturan validasi yang ditentukan.
3. **Keseimbangan jurnal:** total debit harus sama dengan total kredit sebelum transaksi dinyatakan seimbang.
4. **Validasi persediaan:** transaksi penjualan ditolak apabila stok tidak mencukupi.
5. **Pengendalian perubahan transaksi:** rancangan sistem membedakan transaksi yang masih dapat diedit dan transaksi yang telah diposting.
6. **Audit trail:** pencatatan identitas pengguna, waktu, dan aktivitas perubahan perlu didukung oleh implementasi yang sesuai.
7. **Koreksi transaksi:** rancangan pengendalian mempertimbangkan mekanisme koreksi tanpa mengubah catatan transaksi yang telah diposting secara langsung.

Keseimbangan debit dan kredit tidak dengan sendirinya menjamin seluruh informasi transaksi sudah benar. Pemilihan akun, nilai transaksi, dan bukti pendukung tetap perlu diperiksa.

## 🚧 Status Implementasi

Repository ini memuat kode, rancangan, dan dokumentasi dari tiga bagian tugas. Status setiap fitur perlu dinilai berdasarkan artefak dan pengujian yang tersedia.

- **Soal 1:** dokumentasi perancangan database dan normalisasi.
- **Soal 2:** implementasi trigger PostgreSQL beserta bukti skenario pengujian yang tersedia.
- **Soal 3:** dokumentasi kode purwarupa dan proses verifikasi materi akuntansi.

**Catatan penting:** keberadaan kode antarmuka tidak otomatis berarti aplikasi telah terhubung ke database atau menyimpan data secara persisten. Integrasi database, autentikasi, audit trail, dan validasi backend hanya dapat dinyatakan selesai setelah implementasi dan pengujiannya dikonfirmasi.

## 📖 Penutup

Proyek ini menjadi sarana penerapan konsep Sistem Informasi Akuntansi melalui perancangan database, otomatisasi proses persediaan, dan rancangan antarmuka transaksi keuangan.

Dokumentasi disusun agar proses pengerjaan dapat ditinjau secara sistematis, mulai dari desain data dan aturan validasi hingga rancangan pengendalian transaksi.

---

*Dokumentasi tugas Sistem Informasi Akuntansi — UTS.*
