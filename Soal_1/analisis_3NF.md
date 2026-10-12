# Analisis Normalisasi 3NF pada Modul General Ledger

## 1. Pemisahan Tabel Header dan Line

Tabel `journal_headers` menyimpan informasi umum yang berlaku untuk satu transaksi jurnal, seperti ID jurnal, tanggal transaksi, nomor referensi atau bukti, deskripsi, dan status posting. Informasi ini dicatat satu kali untuk setiap jurnal.

Tabel `journal_lines` menyimpan rincian setiap jurnal, yaitu akun yang digunakan serta nilai debit dan kredit. Satu header dapat memiliki banyak baris jurnal, sedangkan setiap baris jurnal terkait ke satu header melalui `header_id`. Hubungan ini disebut **one-to-many**.

Contohnya, jurnal pembelian perlengkapan secara tunai dapat memiliki satu header dengan dua baris:

| Akun | Debit | Kredit |
|---|---:|---:|
| Perlengkapan | Rp500.000 | Rp0 |
| Kas | Rp0 | Rp500.000 |

Tanggal, nomor bukti, dan deskripsi transaksi disimpan pada header, bukan diulang pada kedua baris.

## 2. Keandalan Audit Trail

Pemisahan header dan line membantu penelusuran transaksi karena informasi umum transaksi tersimpan terpusat pada header dan terhubung dengan seluruh rinciannya. Pengguna dapat menelusuri jurnal berdasarkan tanggal atau nomor bukti, membaca deskripsi transaksi, lalu memeriksa akun beserta nominal debit dan kredit pada setiap baris.

Sebagai contoh, nomor bukti pembelian dapat digunakan untuk menemukan satu header, kemudian `header_id` menghubungkan header tersebut ke baris akun Perlengkapan dan Kas. Struktur ini membantu menjaga konteks transaksi tetap konsisten dan mengurangi risiko perbedaan tanggal, nomor bukti, atau deskripsi antarbaris dari transaksi yang sama.

Struktur tabel mendukung penelusuran data, tetapi dengan sendirinya tidak menjamin jurnal seimbang ataupun menjadikan catatan tidak dapat diubah. Keseimbangan total debit dan kredit perlu divalidasi pada tingkat keseluruhan jurnal.

## 3. Normalisasi Bentuk Ketiga (3NF)

Desain ini memisahkan tiga kelompok data berdasarkan fungsinya:

- `journal_headers` menyimpan fakta tentang transaksi jurnal.
- `journal_lines` menyimpan fakta tentang rincian akun dan nilai debit/kredit dalam transaksi.
- `chart_of_accounts` menyimpan data master akun, seperti kode, nama, saldo normal, dan klasifikasi laporan.

Dengan kunci yang sesuai, atribut header bergantung pada ID header, atribut master akun bergantung pada identitas akun, dan nilai debit/kredit bergantung pada baris jurnal. Baris mengacu pada header dan akun melalui foreign key; nama akun serta informasi header tidak perlu disalin ke setiap baris. Pemisahan ini membantu memenuhi prinsip 3NF dengan mengurangi ketergantungan data yang tidak langsung pada kunci baris dan redundansi.

Pemisahan tersebut juga membantu mencegah anomali:

- **Anomali penambahan:** akun baru dapat dimasukkan ke `chart_of_accounts` sebelum akun itu digunakan dalam jurnal.
- **Anomali perubahan:** perubahan nama akun dilakukan pada satu baris master, bukan pada banyak baris jurnal lama.
- **Anomali penghapusan:** menghapus suatu baris jurnal tidak menghapus informasi master akun. Sebaliknya, pembatasan foreign key `ON DELETE RESTRICT` dapat mencegah penghapusan akun atau header yang masih dirujuk.

## 4. Perbandingan dengan Flat Journal Table

Jika header, detail, dan informasi akun disimpan dalam satu tabel datar, data header harus diulang pada setiap baris jurnal. Contoh sederhananya:

| ID jurnal | Tanggal | Nomor bukti | Deskripsi | Akun | Debit | Kredit |
|---|---|---|---|---|---:|---:|
| J001 | 12-10-2026 | B-015 | Pembelian perlengkapan tunai | Perlengkapan | Rp500.000 | Rp0 |
| J001 | 12-10-2026 | B-015 | Pembelian perlengkapan tunai | Kas | Rp0 | Rp500.000 |

Deskripsi, tanggal, dan nomor bukti yang berulang dapat menjadi tidak konsisten jika hanya salah satu baris diperbarui. Data akun yang turut disalin, seperti nama akun, juga dapat berbeda antarbaris ketika ada perubahan. Pengulangan ini membuat penyimpanan lebih boros dan menimbulkan anomali perubahan, penambahan, serta penghapusan. Pada desain tiga tabel, informasi header dan akun disimpan pada tempatnya masing-masing lalu dihubungkan dengan kunci.

## 5. Kesimpulan

Pemisahan `journal_headers`, `journal_lines`, dan `chart_of_accounts` menempatkan informasi transaksi, rincian jurnal, dan data master akun pada tabel yang sesuai. Hubungan satu header dengan banyak baris memudahkan penelusuran transaksi, sedangkan penyimpanan terpusat mengurangi pengulangan dan risiko anomali. Desain ini mendukung normalisasi 3NF; validasi keseimbangan total debit dan kredit tetap harus dilakukan secara terpisah pada tingkat jurnal.
