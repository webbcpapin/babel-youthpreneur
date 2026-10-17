# Pendaftaran Universitas, Juri, dan Kemenkeu

Halaman login menyediakan lima jalur: Mahasiswa, UMKM, Universitas, Juri,
dan Kemenkeu. Formulir memakai label instansi dan keterangan akses yang sesuai.
Universitas berarti akun perwakilan kampus, bukan otomatis membuat data kampus.

| Jalur | requested_role | Setelah persetujuan admin |
| --- | --- | --- |
| Universitas | kampus_viewer | Baca-saja, tim pada campus_id yang ditetapkan |
| Juri | juri | Akses juri sesuai kewenangan penilaian yang sudah ada |
| Kemenkeu | pimpinan_viewer | Pemantauan baca-saja lintas tim; bukan admin/juri |

Semua pengajuan masuk Registrations dengan status pending_admin_review.
AppUsers baru tetap role kosong dan status pending. Admin memverifikasi identitas
dan penugasan, lalu menetapkan role dan status active. Untuk Universitas,
campus_id harus cocok dengan id di Campuses; tanpa itu tidak ada tim yang terlihat.
Jangan memberikan role admin hanya karena pendaftar memilih Kemenkeu.

## Penerapan backend sebelum frontend

Backend produksi sebelumnya sudah menerima juri, tetapi belum menerima
kampus_viewer dan pimpinan_viewer sebagai requested_role. Satu-satunya perubahan
backend untuk pembaruan ini adalah penambahan kedua nilai pada allowlist di
registerAccount_. Tidak ada perubahan skema atau Script Properties.

1. Cadangkan kode aktif.
2. Di registerAccount_, cari baris validasi Role pendaftaran tidak valid.
3. Tambahkan 'kampus_viewer' dan 'pimpinan_viewer' ke array yang sudah ada,
   atau ganti seluruh kode dengan apps-script/monitoring-backend.gs terbaru.
4. Simpan, lalu Deploy > Manage deployments > Edit > New version > Deploy.
   Pertahankan deployment dan URL lama. Tidak perlu setupMonitoring ulang.
5. Setelah backend diperbarui, merge PR frontend agar Vercel menerapkannya.

## Pemeriksaan

- Login menampilkan kelima tautan pada desktop dan ponsel.
- Tiap tautan membuka formulir yang benar; Kemenkeu tidak meminta Nama UMKM.
- Semua pendaftaran memerlukan persetujuan pemrosesan data.
- Gunakan akun uji dengan sengaja jika menguji produksi: pengiriman menulis data.
- Sebelum persetujuan admin, pengguna tidak bisa login.
- Setelah aktivasi, Universitas hanya melihat kampusnya; Kemenkeu tidak bisa
  mengirim laporan/output atau memberi nilai; Juri mengikuti izin penilaian.
- Pengujian lokal memakai backend tiruan, tidak menulis ke spreadsheet produksi.
