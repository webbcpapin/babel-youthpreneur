# Babel Youthpreneur

Website publik dan sistem monitoring Babel Youthpreneur.

## Stack yang aktif

- React 19, TypeScript, Vite, dan HashRouter di Vercel.
- Google Identity Services untuk membuktikan kepemilikan akun Google.
- Google Apps Script sebagai API.
- Google Sheets untuk akun, penugasan, sesi, dan data monitoring.
- Google Drive untuk penyimpanan foto dan export.

Direktori `supabase/` merupakan rancangan terdahulu dan tidak digunakan oleh
alur login aktif. Ikuti [panduan OAuth yang berlaku](docs/google-oauth-setup.md),
bukan instruksi Supabase atau login email-only pada dokumen audit lama.

## Menjalankan lokal

Gunakan Node.js 22 atau lebih baru.

```sh
npm ci
npm run dev
npm test
npm run build
```

Vite menggunakan port 3000. Konfigurasi browser dibaca dari
`public/monitoring/config.js`. OAuth Client ID bersifat publik; jangan menaruh
Client Secret, token administrator, atau kredensial server di frontend.

## Halaman

- `/#/`: situs program.
- `/#/login`: login Google.
- `/#/register/mahasiswa` dan `/#/register/umkm`: antrean verifikasi akun.
- `/#/monitoring`: dashboard yang memerlukan sesi aktif.
- `/monitoring/`: pengalihan kompatibilitas ke aplikasi monitoring.
- `/kurasi/`: form profiling UMKM yang memiliki konfigurasi endpoint tersendiri.

## Backend dan aktivasi akun

Gunakan `apps-script/monitoring-backend.gs` dengan satu `doGet` dan satu
`doPost` dalam project Apps Script. Atur Script Property
`GOOGLE_OAUTH_CLIENT_ID` dengan Client ID yang sama seperti frontend.

Jalankan `setupMonitoring` dari editor untuk menambahkan tab/kolom yang belum
ada. Setup mempertahankan data lama. Biarkan `ENABLE_DEMO_SEED` tidak terisi
pada produksi. Permintaan login dan monitoring tidak menjalankan setup otomatis.

Sesudah registrasi, admin meninjau `Registrations`, mengatur role dan
`team_id`/`campus_id`/`umkm_id` pada `AppUsers`, lalu menetapkan
`status=active`. Backend memverifikasi identitas Google dan penugasan; pengguna
tidak memilih role dari browser.

Deploy Apps Script lebih dahulu, lalu frontend. Panduan lengkap dan checklist
ada pada [Google OAuth setup](docs/google-oauth-setup.md). Perubahan ke GitHub
atau Vercel saja tidak memperbarui deployment Apps Script.

## Keandalan laporan

Laporan dan output ditampilkan sebagai tersimpan setelah server mengembalikan
ID record dan tim yang sesuai. Isian dipertahankan di halaman saat pengiriman
gagal. Percobaan ulang tanpa mengubah isian memakai `request_id` yang sama;
backend mengembalikan record semula sehingga tidak menggandakan data.

Form yang belum tersimpan belum menjadi draft permanen. Hindari memuat ulang
atau meninggalkan halaman sebelum konfirmasi berhasil. Counter laporan/output
dihitung dari record yang tersimpan, bukan angka manual pada tab Teams.

[Review dan batas verifikasi 17 Oktober 2026](docs/login-monitoring-review-2026-10-17.md)
menjelaskan cakupan patch tahap pertama dan pekerjaan yang masih terpisah.
