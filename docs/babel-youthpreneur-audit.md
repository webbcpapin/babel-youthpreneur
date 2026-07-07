# Audit Babel Youthpreneur

Tanggal audit: 2026-07-07

Ruang lingkup yang diperiksa:

- Website/deployment: `https://babelyouthpreneur.vercel.app/`
- Monitoring: `https://babelyouthpreneur.vercel.app/#/monitoring`
- Repository: `https://github.com/webbcpapin/babel-youthpreneur`
- Backend monitoring aktif: Google Sheet, Google Drive, Google Apps Script
- Backend produksi yang direkomendasikan: Supabase Auth + RLS atau Firebase Auth + security rules

## 1. Audit Kondisi Saat Ini

| Area | Kondisi Saat Ini | Masalah | Risiko | Rekomendasi | Prioritas |
|---|---|---|---|---|---|
| Framework | React 19, Vite, HashRouter | Bundle besar dan sebagian modul UI belum dipakai optimal | Performa mobile turun | Code splitting dashboard dan hapus aset/komponen tidak terpakai | P2 |
| Routing | Public route dan monitoring route di SPA | Sebelumnya `/monitoring` bisa dibuka tanpa login | Data monitoring terbuka | ProtectedRoute sudah ditambahkan untuk monitoring | P0 |
| Login | Sebelumnya role dipilih dari tombol demo | Role bisa dimanipulasi dari UI | Impersonasi pengguna | Login email AppUsers sudah dibuat sebagai MVP; produksi wajib Supabase/Firebase/Google OAuth | P0 |
| Role akses | Sebelumnya role hanya menyaring tampilan | Tidak ada guard route reusable | Akses tidak konsisten | RoleGuard dan matrix akses sudah dibuat | P0 |
| Data monitoring | Google Sheet + Apps Script | Endpoint lama `getData` bisa dipanggil publik | Data peserta/UMKM bocor | Apps Script repo sudah diperketat: email AppUsers wajib, data discoping | P0 |
| Upload bukti | Ada input/link Drive dan fungsi base64 foto presensi | Belum ada UI upload file penuh per minggu | Bukti tersebar/tidak standar | Tambah upload Drive per tim/minggu dengan validasi file | P1 |
| Export | CSV lokal tersedia | Export server-side belum lengkap | Laporan manual | Apps Script export perlu dipakai dari UI dan dibatasi role | P1 |
| UI/UX | Dashboard cukup modern dan responsif | Login demo membingungkan, beberapa form belum stateful | Pengguna salah alur | Login baru, empty/error/loading state bertahap | P1 |
| Deployment | Vercel Ready; domain baru masih propagasi DNS | `babelyouthpreneur.id` belum valid sampai DNS selesai | Domain belum bisa dipakai | Refresh Vercel setelah NS aktif | P1 |
| Lint | Build berhasil; lint gagal di komponen UI scaffold lama | Fast refresh rule dan `Math.random` di sidebar | Quality gate CI gagal | Rapikan komponen UI scaffold atau sesuaikan lint | P2 |

## 2. Audit Sistem Login

| Komponen Login | Temuan | Dampak | Perbaikan Teknis | Prioritas |
|---|---|---|---|---|
| Verifikasi pengguna | Sebelumnya tidak verifikasi, hanya pilih role | Semua orang bisa masuk sebagai admin | Login email ke `AppUsers` via Apps Script sudah dibuat | P0 |
| Credential hardcoded | Tidak ada password hardcoded, tetapi ada seed `admin@example.com` | Seed bisa disalahpahami sebagai akun nyata | Label MVP dan dokumentasi wajib ditambah saat go-live | P1 |
| Password storage | Tidak ada password | Baik | Jangan menambah password di frontend | P0 |
| Session storage | Sesi disimpan di `sessionStorage`, TTL 8 jam | Cukup untuk MVP, bukan auth kuat | Produksi pakai Supabase/Firebase session | P1 |
| Private route | Sebelumnya tidak ada | Dashboard bisa dibuka langsung | `ProtectedRoute` sudah diterapkan | P0 |
| Role manipulation | Sebelumnya role dari tombol | Mudah dimanipulasi | Role diambil dari backend/profile | P0 |
| Token/secret | Apps Script URL publik di config | Normal untuk Apps Script web app, bukan secret | Jangan taruh service key/token di frontend | P0 |
| Logout | Sebelumnya hanya clear state | Back/refresh rawan | Logout hapus `sessionStorage`; route redirect login | P0 |
| Error state | Sebelumnya tidak ada login error | User bingung | Login error dan backend timeout sudah ditambahkan | P1 |

Status akhir login: **Cukup untuk MVP internal, belum aman untuk produksi data nyata**.

Alasan: role sekarang berasal dari backend dan route sudah protected, tetapi login email whitelist Apps Script belum membuktikan kepemilikan email. Produksi wajib Google OAuth, Supabase Auth, atau Firebase Auth.

## 3. Risiko Utama

| Risiko | Dampak | Prioritas | Mitigasi |
|---|---|---|---|
| Apps Script lama belum dideploy ulang | Backend live masih bisa longgar | P0 | Salin `apps-script/monitoring-backend.gs` terbaru ke Apps Script dan deploy ulang |
| Email-only login | Orang bisa mengetik email terdaftar | P0 | Ganti ke Supabase/Firebase/Google OAuth |
| Data pribadi di dashboard | Nama peserta/UMKM dapat terlihat oleh role salah jika backend tidak scoped | P0 | Deploy Apps Script scoped + RLS saat migrasi Supabase |
| Upload bukti belum fully managed | Bukti tercecer di link manual | P1 | Drive folder per tim/minggu + metadata Evidence |
| Lint gagal pada scaffold UI | CI tidak siap | P2 | Refactor exports komponen UI dan deterministic skeleton width |

## 4. Rancangan Login Baru

Opsi produksi utama: Supabase Auth.

- `auth.users` untuk email/password atau Google login.
- `app_users/profiles` untuk role, campus_id, team_id, umkm_id.
- RLS untuk semua tabel.
- Password reset dan email verification aktif.
- Session dari Supabase SDK, bukan role di localStorage.

Opsi MVP internal saat ini:

- Login email whitelist ke tab `AppUsers`.
- Role dan scope data dari backend.
- `sessionStorage` TTL 8 jam.
- Tidak menyimpan password/token.
- Batasan: belum membuktikan pemilik email.

## 5. Rancangan Role Akses

| Role | Akses Utama |
|---|---|
| Super Admin | Semua data, user, role, export penuh |
| Admin Panitia | Pendaftaran, pairing, validasi bukti/progress, export operasional |
| Mahasiswa | Tim sendiri, UMKM dampingan, laporan mingguan, bukti, challenge |
| Ketua Tim | Akses mahasiswa + submit laporan tim + kelola anggota |
| Dosen Pendamping | Tim bimbingan, validasi progress, catatan, rekap kampus |
| UMKM | Profil usaha, progress pendampingan, feedback, output digital |
| Kampus/Viewer | Rekap kampus sendiri, read-only |
| Pimpinan/Viewer | Dashboard ringkasan/read-only |
| Juri | Challenge scoring dan output terkait penilaian |

## 6. Rekomendasi UI/UX

- Public menu: Beranda, Tentang Program, Alur Program, Kampus Mitra, UMKM, Challenge, Galeri, Daftar/Login.
- Dashboard admin: gunakan sidebar dense, tabel filterable, status badge, dan kartu metrik.
- Login page harus formal, satu form email/login provider, tanpa tombol role demo.
- Mobile: sidebar berubah jadi grid nav, form satu kolom, CTA tidak overflow.
- Dashboard harus punya loading, empty, error, success state.
- Hindari menampilkan data pribadi di halaman publik.

## 7. Modul Pendaftaran

Modul yang perlu dibuat:

- Pendaftaran mahasiswa.
- Pendaftaran tim.
- Pendaftaran dosen pendamping.
- Pendaftaran UMKM.
- Validasi panitia.

Semua field mengikuti brief pengguna dan harus masuk ke tabel `students`, `teams`, `lecturers`, `msmes`, serta `registrations` bila memakai workflow approval.

## 8. Modul Pairing

Fitur minimum:

- Daftar tim dan UMKM.
- Pairing manual admin.
- Rekomendasi berdasarkan kampus, lokasi, kategori, kebutuhan UMKM, dan skill mahasiswa.
- Status: belum dipasangkan, rekomendasi sistem, menunggu konfirmasi, aktif, selesai, dibatalkan.
- Audit log setiap perubahan.

## 9. Modul Monitoring

Form mingguan wajib memuat:

- minggu, tanggal, tim, UMKM, jenis kegiatan, deskripsi, output, kendala, rencana, link konten, link Drive, foto, status verifikasi, catatan dosen, catatan panitia.

Status verifikasi:

- draft, submitted, validated, revision, rejected.

## 10. Upload Bukti

Struktur Drive:

```text
Babel Youthpreneur 2026/
01_Peserta/
02_Tim/[Kampus]_[Nama Tim]/Minggu_01/
02_Tim/[Kampus]_[Nama Tim]/Challenge/
02_Tim/[Kampus]_[Nama Tim]/Final_Report/
03_UMKM/
04_Dokumentasi/
05_Laporan/
06_Sertifikat/
```

File harus punya metadata `Evidence`: progressId, teamId, fileName, fileType, fileUrl, driveFileId, uploadedBy, verificationStatus.

## 11. Dashboard

Admin:

- total mahasiswa, tim, UMKM, kampus;
- tim aktif/belum update/kritis;
- bukti pending;
- ranking challenge;
- progres per kampus dan UMKM.

Mahasiswa:

- status tim, UMKM dampingan, progress minggu ini, tugas belum selesai, skor tim.

Dosen:

- tim bimbingan, progress, bukti perlu dicek, catatan belum diberikan.

UMKM:

- profil, tim pendamping, progress, output, feedback.

## 12. Scoreboard Challenge

Challenge:

- Best Digital Branding.
- Best Social Media Growth.
- Best Product Campaign.
- Best Website/Landing Page.
- Best Content Strategy.

Rubrik:

- relevansi, kreativitas, kualitas eksekusi, dampak, konsistensi brand, kelengkapan bukti, keberlanjutan.

## 13. Export Laporan

Format:

- CSV untuk MVP.
- XLSX dari Apps Script.
- PDF ringkasan untuk pimpinan setelah format final disetujui.

Jenis export:

- peserta, tim, UMKM, pairing, progress, bukti, challenge, skor, per kampus, per UMKM.

## 14. Struktur Data

Gunakan model yang ada di brief sebagai target. Untuk Supabase, pisahkan:

- `profiles/app_users`
- `campuses`
- `students`
- `lecturers`
- `msmes`
- `teams`
- `team_members`
- `pairings`
- `weekly_reports`
- `evidence`
- `challenges`
- `challenge_submissions`
- `scores`
- `audit_logs`

## 15. Struktur Folder Kode

Target:

```text
src/
auth/
components/
features/
features/admin/
features/student/
features/lecturer/
features/msme/
monitoring/
services/
types/
routes/
pages/
```

Perubahan yang sudah dibuat:

- `src/auth/AuthProvider.tsx`
- `src/auth/ProtectedRoute.tsx`
- `src/auth/RoleGuard.tsx`
- `src/auth/LoginPage.tsx`
- `src/auth/roles.ts`
- `src/auth/authContext.ts`
- `src/auth/useAuth.ts`
- `src/monitoring/googleBackend.ts`
- `src/monitoring/types.ts`
- `src/pages/UnauthorizedPage.tsx`
- `src/pages/NotFoundPage.tsx`

## 16. Implementasi Kode yang Sudah Dilakukan

- Protected route untuk `/monitoring`.
- Login page berbasis email AppUsers.
- Session `sessionStorage` dengan TTL 8 jam.
- Logout menghapus session.
- Role guard dan view access matrix.
- Monitoring page memakai profile dari auth provider.
- Backend service dengan timeout fetch.
- Apps Script repo diperketat untuk `getData`, submit, export, dan scoping data.

## 17. Cara Menjalankan

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 3001
```

Buka:

```text
http://127.0.0.1:3001/#/monitoring
```

Untuk login MVP, email harus ada di tab `AppUsers`.

## 18. Cara Testing

| Test Case | Langkah | Hasil yang Diharapkan | Prioritas |
|---|---|---|---|
| Akses tanpa login | Buka `#/monitoring` | Redirect ke `#/monitoring/login` | P0 |
| Login admin | Masukkan email AppUsers admin | Dashboard admin terbuka | P0 |
| Logout | Klik Keluar | Session hilang dan kembali login | P0 |
| Back setelah logout | Akses `#/monitoring` lagi | Tetap redirect login | P0 |
| Role mahasiswa | Login user role mahasiswa | Hanya tim sendiri tampil | P0 |
| Role dosen | Login user role dosen | Hanya tim kampus/bimbingan tampil | P0 |
| Role UMKM | Login user role umkm | Hanya UMKM/tim terkait tampil | P0 |
| Export viewer | Coba export data sensitif | Ditolak backend | P0 |
| Build | `npm run build` | Sukses tanpa TypeScript error | P0 |
| Mobile | Cek lebar 390px | Nav/form satu kolom, tidak overlap | P1 |

## 19. Cara Deploy

```bash
npm run build
npx vercel --prod --yes
```

Setelah mengubah `apps-script/monitoring-backend.gs`, backend Google belum otomatis berubah. Salin isi file tersebut ke Apps Script, deploy web app versi baru, lalu update `public/monitoring/config.js` bila URL berubah.

## 20. Roadmap

P0:

- Deploy ulang Apps Script terbaru.
- Ganti email-only login ke Google OAuth/Supabase Auth.
- Pastikan semua user real masuk `AppUsers`.

P1:

- Modul pendaftaran real.
- Pairing admin.
- Upload Drive per tim/minggu.
- Verifikasi bukti/progress.
- Export XLSX server-side.

P2:

- Notifikasi email/WhatsApp.
- QR presensi dan geotag production-ready.
- Laporan PDF.
- Sertifikat otomatis.

P3:

- AI review progress.
- Dashboard pimpinan.
- Looker Studio.
- Multi-year archive.

