# Spesifikasi Audit Trail Voucher Kas Keluar

## 1. Tujuan audit trail

Audit trail adalah catatan berurutan tentang tindakan yang dilakukan terhadap voucher. Catatan ini membantu menelusuri siapa yang membuat atau mengubah transaksi, kapan tindakan dilakukan, tindakan apa yang terjadi, dan apa perubahan yang dibuat. Dengan demikian, riwayat transaksi dapat ditinjau untuk kebutuhan pengawasan, pemeriksaan, dan penelusuran kesalahan.

Audit trail yang andal sebaiknya disimpan terpisah dari data voucher yang sedang aktif. Pengguna aplikasi tidak boleh dapat mengubah atau menghapus catatan audit secara langsung.

## 2. Data yang dicatat

Untuk setiap tindakan yang relevan terhadap voucher, rancangan audit trail mencatat:

- **Nomor voucher** sebagai identitas transaksi yang terdampak.
- **Status transaksi** sebelum dan sesudah tindakan, bila status berubah.
- **Pengguna yang melakukan tindakan**, berdasarkan identitas yang telah diautentikasi.
- **Waktu tindakan**, dibuat oleh server atau database dengan zona waktu yang konsisten.
- **Jenis tindakan**, misalnya membuat, mengubah, mengajukan, mem-posting, membatalkan melalui koreksi, atau mencoba melakukan perubahan yang ditolak.
- **Ringkasan perubahan**, seperti nilai/kolom yang berubah dan nilai sebelum serta sesudahnya. Hindari mencatat kredensial atau data sensitif yang tidak diperlukan.

## 3. Aturan perubahan status

- Voucher **DRAFT** dapat diedit sesuai hak akses dan aturan validasi. Setiap perubahan yang berhasil harus menghasilkan catatan audit. Penghapusan DRAFT, jika diizinkan oleh kebijakan, juga harus dibatasi dan dicatat.
- Voucher **POSTED** tidak boleh diedit atau dihapus secara langsung. Perubahan status maupun data setelah posting harus ditolak di backend/database, bukan hanya disembunyikan atau dinonaktifkan pada antarmuka.
- Transisi status yang diizinkan perlu ditetapkan secara eksplisit. Setiap transisi harus mencatat status awal, status akhir, pengguna, waktu, dan alasan bila relevan.

## 4. Integritas data

- **`created_by`** menyatakan identitas pembuat voucher. Nilainya seharusnya diambil dari sesi/identitas pengguna yang telah diautentikasi oleh server, bukan dipercaya dari teks yang dikirim browser.
- **`created_at`** menyatakan waktu pembuatan. Sebaiknya dibuat oleh database atau server tepercaya, menggunakan zona waktu yang konsisten, bukan mengandalkan jam perangkat pengguna.
- **`hash_checksum`** dapat digunakan untuk membantu mendeteksi perubahan pada data transaksi. Jika benar-benar diimplementasikan, nilainya harus dihitung dari representasi data transaksi yang terdefinisi dan konsisten menggunakan fungsi hash kriptografis, misalnya SHA-256. Data yang dicakup, normalisasi/urutan field, dan waktu penghitungan perlu ditentukan agar hasilnya dapat diverifikasi. Nilai acak atau checksum yang tidak dihitung dari data transaksi tidak membuktikan integritas. Hash biasa juga tidak dengan sendirinya mencegah pihak berwenang mengubah data sekaligus menghitung ulang hash.

Nama-nama tersebut adalah nama atribut yang dibahas dalam spesifikasi, bukan pernyataan bahwa kolom dengan nama tersebut sudah tersedia pada tabel database.

## 5. Koreksi transaksi

Jika voucher POSTED keliru, catatan aslinya harus dipertahankan. Koreksi dilakukan melalui transaksi koreksi atau jurnal pembalik (reversing entry/storno), yang memiliki identitas sendiri dan merujuk ke nomor voucher asal. Catatan koreksi harus menyimpan alasan, pelaku, waktu, serta hubungan ke transaksi yang dikoreksi. Setelah itu, transaksi yang benar dicatat sesuai prosedur posting.

## 6. Validasi sisi backend/database

Validasi pada antarmuka berguna untuk membantu pengguna, tetapi bukan pengendalian yang cukup karena permintaan dapat dikirim tanpa melalui antarmuka tersebut. Backend atau database perlu menegakkan sekurang-kurangnya:

- autentikasi dan otorisasi untuk setiap tindakan;
- transisi status yang sah serta larangan mengubah atau menghapus voucher POSTED;
- keseimbangan debit dan kredit, nilai yang valid, serta kelengkapan field wajib;
- keunikan nomor voucher dan konsistensi hubungan antara header, baris jurnal, serta transaksi koreksi;
- pencatatan audit yang konsisten dengan perubahan transaksi, idealnya dalam transaksi database yang sama;
- perlindungan agar pengguna biasa tidak dapat mengubah atau menghapus catatan audit.

Penerapan dapat menggunakan constraint, trigger, kebijakan akses, atau logika backend sesuai arsitektur yang dipilih. Pengujian harus mencakup percobaan melewati antarmuka dan permintaan yang tidak sah.

## 7. Batasan implementasi dan status purwarupa

Dokumen ini adalah **spesifikasi desain**. Berdasarkan file purwarupa yang ditinjau, halaman riwayat menampilkan voucher dari state lokal dan beberapa objek contoh memuat `createdBy`, `createdAt`, serta `hashChecksum`. Pada data baru, identitas pembuat ditetapkan sebagai teks tetap, waktu dibuat di browser, dan nilai bernama `hashChecksum` dibuat secara acak; hal-hal tersebut belum memenuhi rancangan integritas di atas dan bukan bukti audit trail yang tervalidasi.

Purwarupa tersebut juga menampilkan rancangan skema database dan antarmuka status Supabase. Namun, dari implementasi yang ditinjau, tindakan “Hubungkan” hanya mengubah status tampilan; tidak ada bukti bahwa penyimpanan atau koneksi database benar-benar dilakukan. Karena itu, keberadaan kolom database, persistensi, autentikasi, penguncian transaksi di backend/database, serta hash kriptografis **belum dapat dipastikan dan belum dianggap terimplementasi atau teruji**. Pernyataan ini hanya menggambarkan file purwarupa yang ditinjau, bukan audit terhadap sistem lain.

| No. | Aktivitas | Data yang Dicatat | Aturan Pengendalian |
|---:|---|---|---|
| 1 | Membuat voucher | Nomor voucher, status awal, pengguna, waktu, jenis tindakan, ringkasan data awal | Identitas berasal dari pengguna terautentikasi; nomor unik; simpan transaksi dan audit secara konsisten. |
| 2 | Mengubah voucher DRAFT | Nomor voucher, status, pengguna, waktu, field yang berubah, nilai sebelum/sesudah | Hanya pengguna berwenang; jalankan validasi di backend/database; catat setiap perubahan berhasil. |
| 3 | Mem-posting voucher | Nomor voucher, status sebelum/sesudah, pengguna, waktu, ringkasan posting | Posting hanya jika valid; status dan data transaksi harus dikunci dari perubahan langsung setelah POSTED. |
| 4 | Mencoba mengubah/menghapus voucher POSTED | Nomor voucher, status, pengguna, waktu, tindakan yang ditolak, alasan penolakan | Tolak di backend/database; jangan mengubah catatan asli; pencatatan percobaan ditolak mengikuti kebijakan audit. |
| 5 | Mengoreksi transaksi POSTED | Nomor voucher asal dan koreksi, pengguna, waktu, alasan, referensi jurnal pembalik/koreksi | Pertahankan voucher asli; koreksi melalui transaksi baru yang tertaut dan tervalidasi. |
| 6 | Membuat atau memverifikasi hash integritas | Nomor voucher, algoritme/versi, cakupan data, nilai hash dan waktu perhitungan | Hanya jika diimplementasikan: hitung dari data transaksi yang dinormalisasi dengan hash kriptografis dan verifikasi terhadap data yang sama. |
