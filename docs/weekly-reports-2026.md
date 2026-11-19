# Laporan mingguan BYP 2026

## Data dan migrasi

Backend aktif adalah Google Apps Script + Google Sheets. Fungsi `setupWeeklyReports2026()` menambahkan kolom ke `WeeklyReports` dan `Outputs` tanpa menghapus kolom atau baris lama, serta membuat `WeeklyReportHistory`. Jalankan hanya setelah membuat cadangan spreadsheet. Jangan menjalankan seed ulang di produksi.

`WeeklyReports` menyimpan satu baris aktif per `team_id` dan `week` (1-3), status `draft/submitted/revision/verified`, `items_json`, `final_outputs_json`, persetujuan UMKM, pengirim, reviewer, waktu, dan nomor revisi. `WeeklyReportHistory` menyimpan snapshot untuk setiap simpan/review beserta `request_id` dan hash payload. `Outputs.source_report_id` menghubungkan tiga berkas final Minggu 3; jenisnya tetap terpisah. Baris 2025 tetap ada dan tidak diubah.

Progres per minggu = `round(70 * item selesai dengan tautan bukti / jumlah item + 30 jika terverifikasi)`. Progres keseluruhan = rata-rata tiga minggu. Tidak ada 100% sebelum semua item berbukti dan panitia memverifikasi. Kesiapan challenge juga menuntut tiga berkas final, tiga tautan konten, dan verifikasi Minggu 3. Nilai juri tidak dihitung dari progres ini.

## Alur

Mahasiswa yang telah ditetapkan tim dapat menyimpan draft dan mengirim laporan timnya sendiri. Dosen dapat meminta revisi laporan kampusnya. Akun UMKM dapat menyetujui atau meminta perbaikan laporan usahanya; jika belum ada akun, mahasiswa mengisi tautan bukti persetujuan/serah terima untuk diperiksa panitia. Admin memverifikasi laporan lengkap. Viewer hanya membaca. Semua keputusan diperiksa lagi oleh backend memakai sesi dan penugasan, bukan hanya tombol di browser.

Deadline pengiriman final: 9 Desember 2026 pukul 23.59 WIB. Draft tetap dapat disimpan sesudahnya, tetapi pengiriman ditolak backend. Perubahan setelah persetujuan UMKM membatalkan persetujuan tersebut. Laporan terverifikasi terkunci.

## Verifikasi dan rilis

1. Jalankan `npm test` dan `npm run build` di repository. Periksa akun uji mahasiswa, dosen, UMKM, admin, dan viewer; jangan menulis data dummy ke spreadsheet produksi.
2. Cadangkan Google Sheet. Salin `apps-script/monitoring-backend.gs` ke proyek Apps Script yang sama. Jalankan `setupWeeklyReports2026()` satu kali sebagai pemilik; konfirmasi kolom tambahan dan tab baru, serta jumlah baris lama tetap sama.
3. Deploy **New version** untuk web app Apps Script yang sudah dipakai website. Pastikan URL `/exec` tidak berubah; bila berubah, perbarui `public/monitoring/config.js` dan konfigurasi Vercel terkait.
4. Uji `getData` dan alur tulis/review pada lingkungan uji sebelum merilis frontend. Setelah backend baru aktif, deploy frontend ke Vercel lalu lakukan smoke test desktop dan ponsel.
5. Periksa pairing akun `AppUsers.team_id`, `campus_id`, dan `umkm_id`; UMKM yang belum punya akun memerlukan bukti persetujuan URL. Pastikan tautan Google Drive dapat dibaca reviewer.

Push GitHub/Vercel tidak memperbarui Apps Script secara otomatis. Jangan menerbitkan frontend sebelum backend baru dan migrasi siap karena kontrak API laporan berubah.
