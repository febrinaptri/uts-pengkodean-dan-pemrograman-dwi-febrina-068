# Dokumentasi Prompt Gemini Canvas
## Soal 3 — Purwarupa Web Voucher Entri Transaksi Kas Keluar

### 1. Tujuan

Prompt ini digunakan untuk mengarahkan Gemini Canvas dalam membuat purwarupa web Voucher Entri Transaksi Kas Keluar menggunakan React dan Tailwind CSS. Purwarupa dirancang untuk membantu staf akuntansi mencatat transaksi, mengelola rincian jurnal, memvalidasi keseimbangan debit dan kredit, serta menampilkan informasi audit.

### 2. Prompt yang Digunakan

Saya sedang mengerjakan tugas UTS Sistem Informasi Akuntansi yang terdiri dari tiga bagian, yaitu perancangan database dan normalisasi, pengendalian persediaan menggunakan trigger, serta pembuatan purwarupa web Voucher Entri Transaksi Kas Keluar. Buatlah purwarupa web menggunakan React dan Tailwind CSS dengan tampilan profesional, sederhana, dan mudah digunakan oleh staf akuntansi.

**Konteks Soal 1 – Perancangan Database dan Normalisasi**

Database menggunakan PostgreSQL dengan struktur yang telah dirancang, yaitu:
- `chart_of_accounts` untuk menyimpan daftar akun.
- `journal_headers` untuk menyimpan informasi utama jurnal.
- `journal_lines` untuk menyimpan rincian akun beserta nilai debit dan kredit.

Relasi antartabel menggunakan primary key dan foreign key. Data akun yang tersedia meliputi Kas Kecil, Bank BCA, Piutang Usaha, Persediaan, Utang Usaha, Utang Biaya Operasional, Beban Pembelian/HPP, dan Beban Operasional Lainnya.

Sesuaikan rancangan form voucher dengan struktur database tersebut. Pisahkan informasi utama transaksi dan rincian jurnal agar konsisten dengan konsep normalisasi database.

**Konteks Soal 2 – Pengendalian Persediaan**

Pada bagian sebelumnya telah dirancang trigger PostgreSQL untuk mencegah stok persediaan menjadi negatif, termasuk penggunaan penguncian data dengan `SELECT FOR UPDATE` untuk mengurangi risiko konflik transaksi bersamaan.

Pertahankan konsistensi dengan rancangan tersebut. Namun, jangan membuat seolah-olah trigger persediaan merupakan bagian langsung dari proses voucher kas keluar apabila tidak ada hubungan transaksi yang mendukungnya. Jelaskan bahwa trigger persediaan merupakan mekanisme pengendalian database pada bagian tugas yang berbeda.

**Konteks Soal 3 – Purwarupa Voucher Kas Keluar**

Buat form entri voucher kas keluar yang memiliki:
- Nomor referensi voucher dan tanggal transaksi.
- Nama penerima pembayaran, keterangan, dan metode pembayaran.
- Rincian jurnal yang dapat menambahkan atau menghapus baris akun.
- Pemilihan akun berdasarkan `chart_of_accounts`.
- Kolom debit dan kredit untuk setiap baris jurnal.
- Perhitungan total debit dan total kredit secara otomatis saat pengguna mengubah nominal.
- Indikator status jurnal: seimbang atau belum seimbang.
- Tombol Simpan Draft dan Submit/Post.
- Riwayat voucher serta status transaksi.
- Informasi audit berupa `created_by`, `created_at`, dan `hash_checksum`.

**Aturan Validasi Akuntansi**

- Tombol Submit/Post hanya dapat digunakan apabila seluruh input wajib valid, total debit sama dengan total kredit, dan tidak terdapat baris jurnal yang memiliki debit dan kredit positif sekaligus.
- Nominal debit dan kredit tidak boleh negatif.
- Setiap baris jurnal harus memiliki akun yang valid dan nominal debit atau kredit yang lebih besar dari nol.
- Transaksi yang sudah berstatus POSTED tidak boleh diubah atau dihapus secara langsung. Koreksi dilakukan melalui jurnal pembalik (*reversing entry/storno*).
- Status DRAFT dan POSTED harus ditampilkan secara jelas.

**Konsistensi Backend dan Database**

- Gunakan nama tabel dan kolom yang konsisten dengan struktur PostgreSQL yang telah dirancang pada Soal 1. Jika fitur koneksi database belum tersedia, jangan mengklaim bahwa data telah tersimpan secara permanen di Supabase. Bedakan fitur yang sudah berjalan pada antarmuka dengan fitur backend yang masih berupa rancangan.
- Untuk `hash_checksum`, jangan menggunakan nilai acak sebagai bukti integritas data. Jelaskan bahwa implementasi nyata membutuhkan mekanisme hash yang dihitung dari data transaksi menggunakan fungsi kriptografi yang sesuai.
- Buat antarmuka yang interaktif, rapi, dan mudah diuji. Pastikan perhitungan total dan validasi keseimbangan debit-kredit berjalan secara dinamis, serta berikan contoh skenario jurnal seimbang dan tidak seimbang untuk pengujian. Jangan mengklaim fitur berhasil apabila belum benar-benar diuji.

### 3. Keterangan Hasil

Prompt di atas merupakan instruksi yang digunakan untuk menghasilkan purwarupa melalui Gemini Canvas. Keberhasilan setiap fitur dinilai berdasarkan kode dan hasil pengujian yang tersedia. Penggunaan prompt ini tidak dengan sendirinya membuktikan bahwa seluruh fitur telah berjalan atau bahwa database Supabase sudah terhubung.

