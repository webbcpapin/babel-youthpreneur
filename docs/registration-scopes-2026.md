# Penugasan akun dan akses tim BYP 2026

Pendaftar mahasiswa memilih salah satu dari 10 tim. Pendaftar UMKM memilih usahanya, sedangkan dosen dan perwakilan universitas memilih satu perguruan tinggi. Pilihan ini hanya **permintaan**, bukan hak akses. Login Google baru aktif setelah admin memeriksa identitas dan menyetujui penugasan di menu Persetujuan Akun.

Backend menyimpan `requested_team_id`, `requested_umkm_id`, atau `requested_campus_id` secara aditif di tab `Registrations`. Fungsi `setupRegistrationAssignments2026()` menyiapkan kolom tersebut tanpa menghapus pendaftaran lama. Fungsi `getRegistrationOptions` hanya mengembalikan ID/nama tim, kampus, dan UMKM 2026; nama mahasiswa, pemilik usaha, email, dan data laporan tidak dipublikasikan.

Saat persetujuan, admin memilih penugasan final. `AppUsers.team_id` untuk mahasiswa, `umkm_id` untuk UMKM, dan `campus_id` untuk dosen/perwakilan universitas hanya diisi oleh backend berdasarkan keputusan admin. `getData`, review, dan ekspor membatasi hasil memakai ID tersebut. Mahasiswa dan UMKM melihat satu tim; universitas/dosen melihat dua tim yang terkait dengan kampusnya. Akun viewer tidak dapat mengubah laporan.

## Urutan rilis

1. Cadangkan spreadsheet. Salin seluruh `apps-script/monitoring-backend.gs` ke `Code.gs` pada proyek Apps Script yang sudah dipakai.
2. Jalankan `setupRegistrationAssignments2026()` sekali dari editor sebagai pemilik. Pastikan tab `Registrations` memiliki tiga kolom baru dan baris lama tidak berubah.
3. Deploy versi baru dari web app yang sama. Uji `GET ?action=getRegistrationOptions` menampilkan 5 kampus, 10 tim, dan 10 UMKM; uji `getData` tanpa sesi tetap ditolak.
4. Baru setelah backend aktif, rilis frontend. Uji satu pendaftar mahasiswa, UMKM, dan universitas menggunakan akun uji yang sah, lalu setujui masing-masing dari admin. Pastikan daftar laporan dibatasi 1/1/2 tim dan request manual ke tim lain ditolak.

Jangan memberi akses aktif hanya berdasarkan pilihan pendaftar atau teks institusi. Admin wajib mencocokkan identitas, email Google, dan roster sebelum persetujuan.
