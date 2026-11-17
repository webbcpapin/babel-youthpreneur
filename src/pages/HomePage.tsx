import Navigation from '../sections/Navigation'
import Footer from '../sections/Footer'
import './Home2026.css'

const agenda = [
  ['5 November', 'Technical Meeting', 'Pairing 10 tim mahasiswa dengan 10 UMKM binaan.'],
  ['18 November', 'Pelatihan', 'Pembekalan di Kanwil DJPb Bangka Belitung, pukul 07.30–16.00 WIB.'],
  ['9 Desember', 'Batas pengumpulan', 'Laporan strategi digital, katalog, dan analisis ide bisnis.'],
  ['15 Desember', 'Final Showcase', 'Presentasi hasil pendampingan dan penilaian akhir.'],
]
const speakers = [
  ['Finalia', 'Owner UMKM Tanahwari', 'Entrepreneurship'],
  ['Enti Hidayati', 'Konten kreator', 'Digital Marketing Media Sosial dan Monetisasi'],
  ['Cento Sadewa', 'Creative Director MNJD Creative', 'Product Catalog, Foto dan Video Promosi Produk'],
  ['Lereng Cahyo Handoko', 'Founder Gerai Digitals', 'Optimalisasi Artificial Intelligence (AI) untuk UMKM'],
]
const pairings = [
  ['Universitas Muhammadiyah Bangka Belitung', 'Batik Kampung Dul', 'Batik Deshanda'],
  ['IAIN Syaikh Abdurrahman Siddik', 'Batik Asdarya', 'Fiya Batik Tulis'],
  ['Universitas Pertiba', 'Shanti Tenun Bangka Kreatif', 'Batik Kemuning'],
  ['Universitas Anak Bangsa', 'My Botanical Eco Print Bangka', 'Shinta Cual'],
  ['Universitas Bangka Belitung', 'Sendi Cual', 'SBA Cual Bangka'],
]
export default function HomePage() {
  return <div className="home26"><Navigation /><main>
    <section className="home26-hero" id="hero"><div className="home26-inner">
      <img className="home26-logo" src="/images/byp-2026-logo-final.jpeg" alt="Logo resmi Babel Youthpreneur 2026" />
      <p className="home26-kicker">Babel Youthpreneur 2026</p>
      <h1>Digitalisasi UMKM dan Kolaborasi Generasi Muda untuk UMKM Berdaya Saing</h1>
      <p className="home26-lead">Mahasiswa dari lima perguruan tinggi mendampingi sepuluh UMKM binaan Kemenkeu Satu Babel. Bersama, mereka mengembangkan pemasaran digital, katalog produk, dan ide bisnis yang dapat diterapkan.</p>
      <div className="home26-actions"><a href="/monitoring/">Masuk Monitoring</a><a href="/kurasi/">Profiling UMKM</a></div>
      <div className="home26-facts"><span><strong>5</strong> kampus</span><span><strong>10</strong> UMKM</span><span><strong>10</strong> tim</span><span><strong>30</strong> mahasiswa</span></div>
    </div></section>
    <section className="home26-section" id="program"><div className="home26-inner"><p className="home26-kicker">Tentang program</p><h2>Pembelajaran yang langsung menjadi karya</h2>
      <p>UMKM berperan penting dalam ekonomi daerah, tetapi masih menghadapi tantangan dalam pemanfaatan teknologi digital. Babel Youthpreneur mempertemukan mahasiswa, pelaku usaha, praktisi, dan Kementerian Keuangan untuk mengubah pelatihan menjadi pendampingan nyata.</p>
      <div className="home26-columns"><div><h3>Untuk mahasiswa</h3><p>Belajar dari praktisi, menganalisis kebutuhan mitra, lalu menghasilkan karya bersama satu UMKM.</p></div><div><h3>Untuk UMKM</h3><p>Mendapat pendampingan digital branding, optimalisasi media sosial dan marketplace, katalog produk, serta rekomendasi pengembangan usaha.</p></div><div><h3>Untuk pendamping</h3><p>Memantau laporan, hasil kerja, dan kendala tiap tim melalui Monitoring System.</p></div></div>
    </div></section>
    <section className="home26-section home26-dark" id="timeline"><div className="home26-inner"><p className="home26-kicker">Agenda 2026</p><h2>Perjalanan program</h2><div className="home26-timeline">{agenda.map(([date,title,body]) => <article key={date}><time>{date} 2026</time><h3>{title}</h3><p>{body}</p></article>)}</div><p className="home26-note">Pelatihan: Rabu, 18 November 2026, Aula Lt. II Kanwil DJPb Bangka Belitung, Pangkalpinang.</p></div></section>
    <section className="home26-section" id="narasumber"><div className="home26-inner"><p className="home26-kicker">Pelatihan 18 November</p><h2>Narasumber dan materi</h2><div className="home26-grid">{speakers.map(([name,role,topic]) => <article key={name}><span>{topic}</span><h3>{name}</h3><p>{role}</p></article>)}</div><a className="home26-textlink" href="https://www.instagram.com/p/Df1uVbjExTl/" target="_blank" rel="noreferrer">Lihat publikasi kegiatan di Instagram</a></div></section>
    <section className="home26-section home26-soft" id="umkm"><div className="home26-inner"><p className="home26-kicker">Kolaborasi mahasiswa dan UMKM</p><h2>Pairing 10 tim</h2><div className="home26-pairings">{pairings.map(([campus,first,second]) => <article key={campus}><h3>{campus}</h3><p>Tim 1 · {first}</p><p>Tim 2 · {second}</p></article>)}</div></div></section>
    <section className="home26-section" id="challenge"><div className="home26-inner"><p className="home26-kicker">Hasil pendampingan</p><h2>Tiga challenge, satu tujuan nyata</h2><div className="home26-columns"><div><h3>Digital Marketing Strategy</h3><p>Analisis kanal digital, optimalisasi Instagram Business, WhatsApp Business, dan marketplace; minimal tiga konten promosi.</p></div><div><h3>Best Catalog Product</h3><p>Katalog produk UMKM dalam PDF siap cetak, sepanjang 3–10 halaman.</p></div><div><h3>Best Innovative Business Idea</h3><p>Analisis masalah, potensi, dan rekomendasi ide bisnis yang realistis dalam PDF 3–5 halaman.</p></div></div><p className="home26-note">Batas pengumpulan dan konfirmasi kepada panitia: 9 Desember 2026.</p></div></section>
  </main><Footer /></div>
}
