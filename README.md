# Babel Youthpreneur

Website publik Babel Youthpreneur dengan tambahan:

- `/monitoring/` untuk Babel Youthpreneur Monitoring System.
- `/kurasi/` untuk form Profiling dan Kurasi UMKM Babel Youthpreneur 2026.

## Backend Google Sheet untuk Form Kurasi

Form `/kurasi/` disiapkan untuk menulis data ke Google Sheet:

`https://docs.google.com/spreadsheets/d/1PqRraw7Qt5nfpWECAemnTRH4edrKDZfti0gBImmgDbI/`

Aktivasi backend:

1. Buka Google Sheet tujuan.
2. Pilih Extensions -> Apps Script.
3. Salin isi `apps-script/kurasi-backend.gs` ke editor Apps Script.
4. Deploy sebagai Web App dengan akses "Anyone".
5. Salin URL Web App.
6. Isi URL tersebut ke `public/kurasi/config.js` pada `appsScriptUrl`.
7. Commit dan push ulang.

Data akan masuk ke sheet bernama `Kurasi UMKM 2026`.

## Backend Google untuk Monitoring

Monitoring `/monitoring` dapat berjalan dengan Google Sheet, Google Drive, dan Google Apps Script.

File backend:

`apps-script/monitoring-backend.gs`

Aktivasi backend monitoring:

1. Buka Google Sheet tujuan:
   `https://docs.google.com/spreadsheets/d/1PqRraw7Qt5nfpWECAemnTRH4edrKDZfti0gBImmgDbI/`
2. Pilih Extensions -> Apps Script.
3. Ganti atau satukan kode Apps Script lama dengan isi `apps-script/monitoring-backend.gs`.
   Jangan memasang dua fungsi `doGet()` / `doPost()` terpisah dalam project yang sama.
4. Jalankan fungsi `bootstrap_` sekali dari editor Apps Script untuk membuat tab database dan folder Drive.
   Saat pertama kali dijalankan, Google akan meminta otorisasi Spreadsheet dan Drive. Izinkan akses tersebut agar upload foto/export file bisa berjalan.
5. Deploy -> New deployment -> Web app.
6. Set `Execute as: Me` dan `Who has access: Anyone with the link` untuk MVP internal.
7. Salin Web App URL.
8. Isi URL tersebut ke `public/monitoring/config.js` pada `appsScriptUrl`.

Endpoint utama:

- `?action=test`
- `?action=bootstrap`
- `?action=getData`
- `?action=loginByEmail&email=...`
- POST `?action=registerAccount`
- POST `?action=submitWeeklyReport`
- POST `?action=submitOutput`
- POST `?action=submitScore`
- POST `?action=submitAttendance`
- `?action=exportCsv&sheet=Teams`

Google Sheet dipakai sebagai database, Google Drive sebagai storage file presensi/output/export, dan Apps Script sebagai API backend.
Jika endpoint `getData` sudah berjalan tetapi export/upload Drive gagal, buka editor Apps Script dan jalankan `bootstrap_` manual untuk memicu izin Drive.

## Login Google OAuth Supabase untuk Monitoring

Monitoring memakai Supabase Auth untuk memastikan user benar-benar login dengan akun Google miliknya. Google Sheet tetap dipakai untuk review akun, role, status, dan data monitoring.

Konfigurasi Supabase:

1. Buat project Supabase.
2. Authentication -> Providers -> aktifkan Google.
3. Isi Client ID dan Client Secret dari Google Cloud OAuth.
4. Authentication -> URL Configuration:
   - Site URL: `https://babelyouthpreneur.vercel.app`
   - Redirect URL: `https://babelyouthpreneur.vercel.app/monitoring/`
5. Di Vercel, isi Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy ulang Vercel.

Opsional pengamanan Apps Script:

1. Buka `apps-script/monitoring-backend.gs`.
2. Isi konstanta:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Deploy ulang Apps Script.

Jika konstanta Supabase di Apps Script sudah diisi, endpoint `loginByEmail` dan `getData` akan menolak request yang tidak membawa access token Supabase yang valid.

Alur register dan aktivasi akun:

1. Pengguna mengisi form register dengan email Google di halaman Monitoring.
2. Data masuk ke tab `Registrations` dengan status `pending_admin_review`.
3. Script juga membuat kandidat akun di tab `AppUsers` dengan status `pending`.
4. Admin mengisi `role`, `campus_id`, `team_id`, atau `umkm_id` sesuai kebutuhan, lalu mengubah `status` menjadi `active`.
5. Setelah aktif, pengguna klik `Masuk dengan Google`.
6. Supabase memverifikasi akun Google asli user.
7. Apps Script mencocokkan email Google terverifikasi dengan `AppUsers`.
8. Jika `status` adalah `active`, user masuk sesuai role.

Catatan integrasi kurasi:

- Sheet yang sama aman dipakai.
- Tab `Kurasi UMKM 2026` tetap dipertahankan untuk form kurasi lama.
- POST tanpa `action` tetap diproses sebagai submit kurasi, sehingga `public/kurasi/kurasi.js` lama tetap kompatibel.
- Monitoring memakai endpoint dengan parameter `action`, misalnya `?action=getData`.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
