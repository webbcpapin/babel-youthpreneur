# Babel Youthpreneur Monitoring System

Aplikasi PWA untuk monitoring Babel Youthpreneur 2026. Fungsi utama: course pelatihan, presensi QR dengan foto dan geotag, monitoring tim, laporan mingguan, output Google Drive, penilaian challenge, export Excel, dan export PDF.

## Fitur MVP + Patch Foundation

- Login Google OAuth via Supabase.
- Multi-role: Admin/Panitia, Dosen, Mahasiswa, UMKM, Juri.
- Admin melihat seluruh data program.
- Dosen hanya melihat kampus sendiri.
- Mahasiswa hanya melihat tim dan UMKM dampingannya.
- UMKM hanya melihat tim pendamping dan output UMKM tersebut.
- Juri melihat output dan memberi nilai.
- Struktur program: 5 kampus, 10 tim, 30 mahasiswa, 10 UMKM.
- Course Juli berisi 4 sesi pelatihan.
- Presensi QR dengan foto kamera dan geolocation browser.
- Presensi aman via Edge Function: QR HMAC SHA-256, token 15 detik, validasi server-side, geofence, duplicate attempt, dan upload foto ke Supabase Storage.
- Migration produksi modular dengan RLS untuk tabel utama, attendance, tokens, audit log, report jobs, link checks, storage policy, dan seed lengkap.
- Redesign UI/UX monitoring: app shell desktop, bottom navigation mobile, executive dashboard panitia, dashboard role-based, team health, progress fase program, monitoring tim card-based, course module card, QR presentation view, report stepper, output kanban, challenge gallery, dan pusat laporan.
- Laporan mingguan per tim.
- Output berupa link Google Drive.
- Challenge: Best Digital Branding, Best Social Media Growth, Best Product Campaign, Best Website/Landing Page, Best Content Strategy.
- Export laporan Excel dan PDF.

## Jalankan secara lokal

```bash
npm install
npm run dev
```

Tanpa konfigurasi Supabase, aplikasi berjalan dalam mode demo. Pilih role pada halaman login.

## Konfigurasi Supabase

1. Buat project baru di Supabase.
2. Buka SQL Editor.
3. Jalankan migration produksi secara berurutan:

```text
supabase/migrations/001_init_schema.sql
supabase/migrations/002_helper_functions.sql
supabase/migrations/003_rls_policies.sql
supabase/migrations/004_storage_policies.sql
supabase/migrations/005_seed_data.sql
```

File `supabase/schema.sql` dan `supabase/seed.sql` lama tetap tersedia sebagai referensi MVP, tetapi jalur produksi memakai folder `supabase/migrations`.

4. Deploy Edge Functions:

```bash
supabase functions deploy attendance-token
supabase functions deploy submit-attendance
```

5. Set secrets untuk Edge Functions:

```bash
supabase secrets set QR_SIGNING_SECRET="isi-dengan-random-secret-panjang"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="service-role-key-project"
```

Jangan memasukkan `QR_SIGNING_SECRET` atau `SUPABASE_SERVICE_ROLE_KEY` ke variable `VITE_`, karena variable `VITE_` ikut dibundel ke browser.

6. Aktifkan Google OAuth di Supabase Authentication.
7. Buat file `.env` dari `.env.example`.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

8. Jalankan ulang aplikasi.

## Deployment Vercel

1. Upload source code ke GitHub.
2. Import repository ke Vercel.
3. Tambahkan environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy.
5. Tambahkan domain Vercel ke Redirect URL Google OAuth di Supabase.

## Deployment GitHub Pages

Repo ini juga siap dideploy ke GitHub Pages melalui workflow:

```text
.github/workflows/deploy.yml
```

Setiap push ke branch `main` akan menjalankan:

```bash
npm ci --strict-ssl=false --no-audit
npm run build
```

Artifact `dist` lalu dipublish ke GitHub Pages. Konfigurasi Vite memakai `base: './'` agar asset tetap aman saat aplikasi dibuka di subpath:

```text
https://webbcpapin.github.io/babel-youthpreneur/
```

Judul dan pengalaman aplikasi diarahkan sebagai **Babel Youthpreneur Monitoring System**.

## Catatan penting

Aplikasi ini tidak menyimpan file besar. Output peserta cukup menggunakan link Google Drive, Canva, Instagram, TikTok, atau landing page.

Jika Supabase belum dikonfigurasi, aplikasi tetap berjalan dalam mode demo dan memakai token presensi statis dari data dummy.

Jika Supabase aktif dan Edge Functions sudah deploy, presensi memakai token QR dinamis. Foto dikirim ke Edge Function, diunggah ke bucket private `attendance-photos`, dan database hanya menyimpan path/hash/metadata.

Halaman `Pusat Laporan` tidak memanggil generator Excel/PDF client-side. UI hanya menampilkan aksi dan status job sebagai fondasi untuk export server-side melalui API route atau Edge Function.
