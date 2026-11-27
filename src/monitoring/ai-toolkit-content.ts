import { reportingPeriods } from './monitoring-schedule'

type ToolkitPrompt = { title: string; outcome: string; body: string }
type ToolkitPhase = { title: string; dates: string; prompts: ToolkitPrompt[] }

export const aiToolkitPhases: ToolkitPhase[] = [
  {
    title: 'Minggu 1',
    dates: reportingPeriods[0].dates,
    prompts: [
      {
        title: 'Know Your UMKM',
        outcome: 'Profil UMKM satu halaman dan daftar informasi yang perlu dikonfirmasi.',
        body: `Anda adalah asisten pendampingan UMKM, analis bisnis, dan konsultan pemasaran digital untuk peserta Babel Youthpreneur 2026.

Saya mahasiswa yang mendampingi UMKM.

Nama tim: [isi]
Universitas: [isi]
Nama UMKM: [isi]

Saya akan mengunggah foto produk, katalog, hasil wawancara, tangkapan layar media sosial, dan informasi usaha yang tersedia. Gunakan hanya materi yang boleh dibagikan dan abaikan data pribadi yang tidak diperlukan.

Bangun Project Context untuk digunakan sepanjang percakapan ini:
1. Profil dan sejarah UMKM.
2. Produk, ciri khas dan keunggulannya.
3. Harga dan kapasitas produksi.
4. Pelanggan dan saluran pemasaran yang sudah ada.
5. Kondisi aset digital.
6. Permasalahan dan kebutuhan UMKM.
7. Potensi pengembangan usaha.
8. Informasi yang belum tersedia.

Jangan mengarang informasi. Bedakan FAKTA, INFERENSI, dan HIPOTESIS. Jika informasi penting belum tersedia, tanyakan maksimal tiga pertanyaan dalam satu tahap. Jangan meminta informasi yang sudah diberikan. Rekomendasi harus sesuai kemampuan UMKM dan dapat diterapkan setelah program berakhir.

Hasil akhir: Profil UMKM satu halaman dan daftar informasi yang masih perlu dikonfirmasi kepada pemilik usaha.`,
      },
      {
        title: 'Business Diagnosis & Digital Audit',
        outcome: 'SWOT, audit digital, dan tiga prioritas pendampingan.',
        body: `Gunakan Project Context UMKM. Saya akan memberikan hasil wawancara, dokumentasi kunjungan, dan akun media sosial UMKM jika tersedia.

Analisis SWOT, kualitas dan variasi produk, identitas merek, kemasan, foto dan video, Instagram, WhatsApp Business, marketplace jika tersedia, dan kemudahan pelanggan mendapatkan informasi serta memesan.

Jika saya memberi tautan, periksa informasi yang benar-benar dapat diakses. Jika tidak dapat memeriksa, minta tangkapan layar atau tandai sebagai belum diperiksa. Jangan mengarang jumlah pengikut, engagement, penjualan, atau performa akun.

Buat tabel: ASPEK | KONDISI SAAT INI | MASALAH | REKOMENDASI | PRIORITAS.

Tentukan tiga masalah paling realistis untuk diselesaikan selama BYP 2026 dan susun pertanyaan lanjutan untuk pemilik UMKM.

Hasil akhir: Dokumen SWOT, audit digital, dan tiga prioritas pendampingan.`,
      },
      {
        title: 'Hero Product & Target Customer',
        outcome: 'Satu produk unggulan, tiga persona, dan positioning produk.',
        body: `Gunakan konteks UMKM dan analisis sebelumnya. Tentukan maksimal tiga produk unggulan dengan mempertimbangkan daya tarik visual, keunikan, harga, kemudahan produksi dan pengiriman, potensi permintaan, ketersediaan, dan kesiapan memenuhi pesanan. Pilih satu hero product sebagai fokus promosi.

Riset web minimal lima produk pembanding yang benar-benar dipasarkan. Sertakan sumber dan tanggal pengecekan. Jika tidak dapat mengakses web, jelaskan batasannya dan jangan mengarang hasil.

Buat tiga persona calon pelanggan. Jelaskan kebutuhan, alasan membeli, pertimbangan harga, saluran pemasaran, dan jenis konten yang menarik. Tandai persona sebagai hipotesis jika belum dikonfirmasi. Susun positioning dan pesan pemasaran yang mempertahankan identitas UMKM.

Hasil akhir: Satu hero product, tiga persona pelanggan, dan positioning produk.`,
      },
      {
        title: 'Action Plan & Laporan Minggu 1',
        outcome: 'Rencana kerja challenge dan draf isian Minggu 1.',
        body: `Gunakan hasil analisis sebelumnya. Susun rencana pendampingan hingga 9 Desember 2026 untuk Digital Marketing Strategy, Best Catalog Product, dan Best Innovative Business Idea. Sesuaikan dengan kondisi, kebutuhan, waktu, dan kemampuan UMKM.

Bantu susun laporan Minggu 1 berdasarkan lima checklist:
1. Profil dan keunggulan produk UMKM.
2. Identifikasi masalah dan SWOT.
3. Audit Instagram, WhatsApp Business, dan marketplace.
4. Produk unggulan dan target pelanggan.
5. Konsep awal konten, katalog, dan ide bisnis.

Tampilkan: PEKERJAAN | STATUS | CATATAN SINGKAT | BUKTI YANG TERSEDIA | TINDAK LANJUT.

Pakai status Belum Dikerjakan, Proses, atau Selesai. Tandai Selesai hanya jika pekerjaan sudah dilakukan dan memiliki tautan bukti yang relevan. Bukti dapat berupa laporan kerja, catatan audit, atau dokumentasi lain; tidak harus foto. Catat tanggal kunjungan yang sebenarnya, kendala, dan rencana minggu berikutnya.

Hasil akhir: Draf laporan Minggu 1 yang siap dipindahkan ke website BYP.`,
      },
    ],
  },
  {
    title: 'Minggu 2',
    dates: reportingPeriods[1].dates,
    prompts: [
      {
        title: 'Digital Branding Optimization',
        outcome: 'Rancangan optimasi akun digital yang bisa dikelola UMKM.',
        body: `Gunakan hasil audit digital dan positioning. Saya akan mengunggah tangkapan layar akun media sosial UMKM.

Optimalkan akun yang sudah dimiliki. Jangan menyarankan akun baru jika akun lama masih dapat digunakan. Rekomendasikan nama profil dan username, bio Instagram, deskripsi WhatsApp Business, foto profil, struktur Highlight, informasi pemesanan, identitas visual (warna dan tipografi), call to action, serta katalog WhatsApp Business jika relevan.

Tampilkan BEFORE dan AFTER berdasarkan kondisi nyata dan rancangan perbaikan. Bedakan yang sudah diterapkan dengan yang masih berupa rekomendasi. Pastikan pemilik dapat mengelolanya secara mandiri setelah program selesai.

Hasil akhir: Panduan optimasi akun digital yang siap diterapkan.`,
      },
      {
        title: 'Product Photography & Content Creator',
        outcome: 'Panduan foto smartphone dan tiga konsep konten promosi.',
        body: `Gunakan konteks produk, hero product, dan target pelanggan. Saya akan mengunggah foto produk asli.

Analisis pencahayaan, latar belakang, komposisi, warna, ketajaman, dan daya tarik produk. Buat panduan fotografi dengan smartphone dan peralatan sederhana.

Buat minimal tiga konsep:
A. Product Awareness: memperkenalkan produk.
B. Product Story: menjelaskan proses, manfaat, atau cerita produk.
C. Product Selling: mengarahkan pelanggan melakukan pemesanan.

Untuk setiap konten, sertakan tujuan, target audiens, konsep visual, storyboard atau susunan slide, caption siap pakai, call to action, format Instagram Feed atau Reels, serta usulan waktu publikasi dan alasannya.

Jika fitur gambar tersedia, buat mockup dari foto asli. Pertahankan bentuk, motif, warna, dan identitas produk. Tandai mockup sebagai rancangan, bukan dokumentasi. Hindari klaim yang belum terbukti. Prioritaskan publikasi di akun UMKM.

Hasil akhir: Tiga paket konten promosi siap diproduksi dan dipublikasikan.`,
      },
      {
        title: 'Product Catalog Development',
        outcome: 'Draf katalog produk 3–10 halaman yang siap ditata.',
        body: `Gunakan konteks produk, merek, harga, dan foto asli UMKM. Buat draf katalog berisi cover, profil singkat, produk unggulan, daftar produk dan variasi, spesifikasi, harga atau informasi permintaan harga, keunggulan berdasarkan fakta, cara pemesanan, dan kontak usaha yang disetujui untuk dipublikasikan.

Per produk, buat nama, deskripsi, material, ukuran, fungsi, variasi, harga, dan rekomendasi penempatan foto. Tandai informasi yang belum tersedia dengan [PERLU KONFIRMASI].

Rekomendasikan struktur halaman, desain, warna, dan tipografi. Gunakan foto asli dan jangan mengubah karakteristik produk tanpa persetujuan UMKM. Susun dalam 3–10 halaman untuk Best Catalog Product.

Hasil akhir: Draf katalog siap ditata di Canva, Word, PowerPoint, atau aplikasi desain lain.`,
      },
      {
        title: 'Innovative Business Idea',
        outcome: 'Lima alternatif inovasi dan satu ide yang siap diuji.',
        body: `Gunakan konteks UMKM, SWOT, kondisi pasar, dan hasil wawancara. Cari lima peluang inovasi realistis: pengembangan produk, kemasan, personalisasi, pengalaman pelanggan, saluran pemasaran, kolaborasi, model penjualan, atau efisiensi proses.

Riset web minimal lima referensi bisnis atau produk yang relevan. Sertakan sumber; jangan mengarang hasil bila akses tidak tersedia. Bandingkan manfaat, kebutuhan pelanggan, biaya, kemudahan implementasi, risiko, dan kemampuan UMKM.

Pilih satu ide terbaik. Jelaskan masalah, solusi, target pelanggan, keunggulan, cara menghasilkan pendapatan, kebutuhan sumber daya, rencana uji coba, dan indikator keberhasilan. Jika berupa produk atau kemasan baru, buat konsep visual empat panel: produk saat ini, perubahan sederhana, pengembangan lanjutan, dan inovasi terbaik. Bedakan fakta, estimasi, dan hipotesis.

Hasil akhir: Draf karya Best Innovative Business Idea.`,
      },
      {
        title: 'AI Review & Laporan Minggu 2',
        outcome: 'Draf Minggu 2 dan prioritas pekerjaan sebelum challenge.',
        body: `Gunakan konteks, hasil pekerjaan, dan bukti yang saya berikan. Bertindak sebagai evaluator independen.

Periksa apakah rekomendasi AI dan hasil mahasiswa sesuai kebutuhan UMKM, akurat, dapat diterapkan pemilik, sesuai kemampuan biaya, tidak mengandung klaim yang belum terbukti, dan tidak menyalin karya pihak lain. Kelompokkan rekomendasi yang perlu dipertahankan, diperbaiki, atau dibatalkan.

Susun laporan Minggu 2:
1. Perbaikan profil atau akun digital UMKM.
2. Pembuatan foto dan video produk.
3. Publikasi atau penjadwalan konten promosi.
4. Draf katalog produk.
5. Draf analisis ide bisnis.
6. Pemeriksaan kesesuaian rekomendasi AI.

Untuk setiap poin, beri status Belum Dikerjakan, Proses, atau Selesai, serta catatan, tautan bukti, kendala, dan tindak lanjut. Tandai Selesai hanya jika pekerjaan benar-benar dilakukan dan ada bukti relevan. Catat tanggal kegiatan yang sebenarnya. Jangan mengarang kegiatan atau bukti.

Hasil akhir: Draf laporan Minggu 2 dan daftar pekerjaan sebelum challenge.`,
      },
    ],
  },
  {
    title: 'Minggu 3',
    dates: reportingPeriods[2].dates,
    prompts: [
      {
        title: 'Final Challenge: Digital Marketing Strategy',
        outcome: 'Naskah strategi pemasaran digital untuk PDF minimal 3 halaman.',
        body: `Anda adalah Senior Digital Marketing Strategist dan evaluator karya mahasiswa. Gunakan konteks UMKM, hasil audit, strategi, konten, dan dokumentasi pendampingan.

Susun dokumen final Digital Marketing Strategy untuk BYP 2026:
1. Cover dan identitas tim.
2. Executive summary.
3. Profil dan kondisi awal UMKM.
4. Masalah pemasaran.
5. SWOT.
6. Hero product dan target pelanggan.
7. Brand positioning.
8. Strategi pemasaran digital.
9. Content strategy.
10. Implementasi minimal tiga konten promosi.
11. Perbandingan before-after.
12. Evaluasi hasil pemasaran.
13. Rekomendasi pemasaran 30 hari berikutnya.

Gunakan engagement, reach, views, atau interaksi pelanggan jika tersedia. Jangan mengarang peningkatan penjualan atau keberhasilan. Jika belum ada data, usulkan cara mengukurnya. Rekomendasikan tabel, grafik, tangkapan layar, dan foto yang relevan.

Susun naskah profesional dan ringkas untuk PDF minimal 3 halaman. Pastikan strategi dapat dijalankan UMKM secara mandiri setelah program.`,
      },
      {
        title: 'Final Challenge: Best Catalog Product',
        outcome: 'Naskah dan tata letak katalog komersial untuk PDF 3–10 halaman.',
        body: `Anda adalah Product Catalog Designer, Brand Strategist, dan Commercial Copywriter. Gunakan konteks UMKM dan draf katalog. Saya akan mengunggah foto asli dan draf desain terakhir.

Evaluasi konsistensi merek, kualitas visual, keterbacaan, kelengkapan spesifikasi, daya tarik produk, kesesuaian dengan target pelanggan, kemudahan pemesanan, dan kepraktisan bagi UMKM.

Buat katalog final PDF 3–10 halaman. Per halaman, jelaskan judul, tujuan, foto, teks siap pakai, tata letak, informasi produk, dan call to action jika relevan.

Pertahankan ciri khas batik, cual, tenun, ecoprint, rajutan, atau produk kriya UMKM. Jangan mengarang harga, material, stok, ukuran, atau klaim kualitas. Hasil akhir harus siap digunakan sebagai katalog komersial, bukan sekadar dokumen perlombaan.`,
      },
      {
        title: 'Final Challenge: Best Innovative Business Idea',
        outcome: 'Naskah inovasi 3–5 halaman dan rencana implementasi 30/60/90 hari.',
        body: `Anda adalah Business Innovation Consultant dan analis kelayakan usaha. Gunakan konteks UMKM, riset pasar, alternatif inovasi, dan masukan pemilik.

Susun dokumen final Best Innovative Business Idea untuk PDF 3–5 halaman:
1. Judul dan ringkasan inovasi.
2. Profil UMKM.
3. Masalah atau peluang bisnis.
4. Bukti kebutuhan pelanggan atau pasar.
5. Konsep inovasi.
6. Keunggulan dan nilai tambah.
7. Target pelanggan.
8. Model bisnis.
9. Biaya dan sumber daya.
10. Rencana implementasi.
11. Risiko dan mitigasi.
12. Indikator keberhasilan.

Buat Business Model Canvas ringkas dan visual konsep jika relevan. Untuk biaya yang belum diketahui, gunakan placeholder atau simulasi dengan asumsi yang jelas. Buat rencana implementasi 30, 60, dan 90 hari setelah program. Prioritaskan ide yang benar-benar dapat diterapkan, bukan sekadar kecanggihan teknologi atau tampilan.

Hasil akhir: Naskah siap ditata menjadi PDF dan dipresentasikan kepada juri.`,
      },
      {
        title: 'Business Impact & Handover',
        outcome: 'Evaluasi perubahan, panduan pengelolaan, dan paket serah terima.',
        body: `Gunakan pekerjaan yang benar-benar kami lakukan. Buat tabel: ASPEK | KONDISI AWAL | KONDISI AKHIR | BUKTI | MANFAAT BAGI UMKM.

Evaluasi profil dan aset digital, foto dan video, konten pemasaran, katalog, ide bisnis, dan kemampuan UMKM mengelola pemasaran secara mandiri. Pisahkan yang sudah diterapkan, masih proses, dan baru berupa usulan.

Buat panduan penggunaan aset digital, kalender konten 30 hari, daftar file dan aset untuk diserahkan, panduan memperbarui katalog, format konfirmasi serah terima, dan lima pertanyaan evaluasi untuk pemilik UMKM.

Jangan membuat persetujuan palsu. Siapkan formatnya untuk diperiksa dan dikonfirmasi sendiri oleh pemilik.

Hasil akhir: Evaluasi perubahan dan paket serah terima kepada UMKM.`,
      },
      {
        title: 'Final Quality Control & Laporan Minggu 3',
        outcome: 'Pemeriksaan akhir berkas, daftar koreksi, dan draf Minggu 3.',
        body: `Anda adalah reviewer independen BYP 2026. Saya akan mengunggah dokumen challenge, tautan konten, bukti pekerjaan, dan konfirmasi UMKM. Periksa secara kritis.

A. Berkas challenge:
- Digital Marketing Strategy: PDF minimal 3 halaman.
- Best Catalog Product: PDF 3–10 halaman.
- Best Innovative Business Idea: PDF 3–5 halaman.
- Tiga tautan konten promosi yang sudah dipublikasikan.
- Bukti persetujuan atau serah terima kepada UMKM.

B. Checklist Minggu 3:
1. Tiga konten promosi telah dipublikasikan.
2. Strategi pemasaran dan evaluasi telah didokumentasikan.
3. Katalog final telah diperiksa UMKM.
4. Analisis ide bisnis telah diselesaikan.
5. Hasil AI telah diperiksa dan diperbaiki.
6. Hasil pekerjaan telah diserahkan kepada UMKM.
7. Seluruh berkas challenge telah disiapkan.

C. Kualitas: kesesuaian dengan kebutuhan UMKM, akurasi, konsistensi antar dokumen, orisinalitas, kelayakan implementasi, dan kelengkapan bukti.

Beri status SIAP, PERLU PERBAIKAN, atau BELUM TERSEDIA untuk setiap berkas. Susun daftar koreksi prioritas, draf laporan Minggu 3, dan checklist pengumpulan akhir. Jangan menyatakan tautan dapat diakses jika belum diperiksa.

Batas pengumpulan: 9 Desember 2026 pukul 23.59 WIB.`,
      },
    ],
  },
  {
    title: 'Final Showcase',
    dates: 'Menyesuaikan jadwal panitia',
    prompts: [
      {
        title: 'Final Showcase & Jury Simulation',
        outcome: 'Rancangan presentasi, pembagian peran, dan latihan tanya jawab juri.',
        body: `Anda adalah mentor presentasi bisnis dan simulasi juri kewirausahaan mahasiswa. Gunakan tiga karya final, hasil pendampingan, dan bukti perubahan UMKM.

Buat konsep presentasi:
1. Perkenalan tim dan UMKM.
2. Kondisi awal UMKM.
3. Masalah utama.
4. Strategi dan solusi.
5. Hasil digital marketing.
6. Katalog produk.
7. Inovasi bisnis.
8. Perbandingan before-after.
9. Manfaat bagi UMKM.
10. Rencana keberlanjutan.

Untuk tiap slide, rekomendasikan visual, siapkan naskah, dan bagi peran anggota tim. Ikuti durasi resmi panitia; jika belum tersedia gunakan simulasi lima menit.

Buat 20 pertanyaan kritis yang mungkin diajukan juri beserta rekomendasi jawaban berdasarkan data nyata. Lakukan simulasi satu per satu, evaluasi jawaban saya, dan beri masukan. Jangan mengarang angka keberhasilan atau klaim dampak yang belum bisa dibuktikan.`,
      },
    ],
  },
]
