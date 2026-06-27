# Babel Youthpreneur

Website publik Babel Youthpreneur dengan tambahan:

- `/monitoring/` untuk Babel Youthpreneur Monitoring System.
- `/kurasi/` untuk form Profiling dan Kurasi UMKM Babel Youthpreneur 2026.

## Backend Google Sheet untuk Monitoring System

Monitoring `/monitoring/` sekarang mendukung backend ringan Google Sheet + Apps Script. Supabase tetap bisa dipakai nanti, tetapi jalur operasional cepat yang disiapkan adalah Google Sheet.

Aktivasi backend monitoring:

1. Buat Google Sheet baru khusus monitoring.
2. Buat tab sesuai nama berikut, atau biarkan script membuat otomatis saat pertama kali jalan:
   `users`, `campuses`, `umkms`, `teams`, `courses`, `sessions`, `attendance`, `weekly_reports`, `outputs`, `scores`, `audit_logs`.
3. Pilih Extensions -> Apps Script.
4. Salin isi `apps-script/monitoring-backend.gs` ke editor Apps Script.
5. Jika script tidak dibuat dari Sheet aktif, isi `MONITORING_SPREADSHEET_ID` dengan ID Google Sheet monitoring.
6. Deploy sebagai Web App:
   - Execute as: Me
   - Who has access: Anyone
7. Salin URL Web App.
8. Isi URL tersebut ke `public/monitoring/monitoring-config.js`:

```js
window.MONITORING_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/DEPLOYMENT_ID/exec';
```

Sheet `users` menjadi kunci akses role. Kolom minimal:

```text
id, name, email, role, campus_id, umkm_id, team_id, status
```

Nilai `role` yang dipakai: `admin`, `dosen`, `mahasiswa`, `umkm`, `juri`. Jika backend monitoring belum dipasang, aplikasi tetap berjalan sebagai staging/demo tanpa menyimpan data permanen.

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
