import Navigation from '../sections/Navigation'
import Footer from '../sections/Footer'
import { Link } from 'react-router'
import { getTeamPhoto } from '../lib/team-photos'
import './Home2026.css'

const agenda = [
  ['5 November', 'Technical Meeting', 'Pairing 10 tim mahasiswa dengan 10 UMKM binaan.'],
  ['18 November', 'Pelatihan', 'Pembekalan di Kanwil DJPb Bangka Belitung, pukul 07.30–16.00 WIB.'],
  ['9 Desember', 'Batas pengumpulan', 'Laporan strategi digital, katalog, dan analisis ide bisnis.'],
  ['15 Desember', 'Final Showcase', 'Presentasi hasil pendampingan dan penilaian akhir.'],
]
const speakers = [
  { name: 'Yang Finalia', role: 'Owner Tanahwari', topic: 'Entrepreneurship', photo: 'finalia' },
  { name: 'Enti Hidayati', role: 'Content Creator', topic: 'Digital Marketing Medsos dan Monetisasi', photo: 'enti' },
  { name: 'Cento Sadewa', role: 'Creative Director', topic: 'Media Sosial dan Katalog Produk', photo: 'cento' },
  { name: 'Lereng Cahyo Handoko', role: 'Founder Gerai Digitals', topic: 'Artificial Intelligence untuk UMKM', photo: 'lereng' },
  { name: 'Aris Rochmad Sopyan', role: 'Kepala KPKNL Pangkalpinang', topic: 'Narasumber program', photo: 'aris' },
]
const pairings = [
  ['unmuh', 'Universitas Muhammadiyah Bangka Belitung', [['LOKALINK', 'Batik Kampung Dul'], ['TRUNTUM', 'Batik Deshanda']]],
  ['iain', 'IAIN Syaikh Abdurrahman Siddik', [['Hanrevel', 'Batik Asdarya'], ['SasFlo', 'Flo Ecoprint']]],
  ['pertiba', 'Universitas Pertiba', [['Go Green', "D'Bhori"], ['Benang Merah', 'Batik Kemuning']]],
  ['unaba', 'Universitas Anak Bangsa', [['FloraTrace', 'My Botanical Eco Print Bangka'], ['DigiScoral Squad', 'Shinta Cual']]],
  ['ubb', 'Universitas Bangka Belitung', [['Wastra Serumpun', 'Asti Rajutan dan Batik'], ['The Sandau', 'SBA Cual Bangka']]],
] as const
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
    <section className="home26-section" id="narasumber"><div className="home26-inner"><p className="home26-kicker">Pelatihan 18 November</p><h2>Narasumber dan materi</h2><div className="home26-speakers">{speakers.map(({ name, role, topic, photo }) => <article className="home26-speaker" key={name}><div className={`home26-speaker-photo home26-speaker-photo--${photo}`} role="img" aria-label={`Foto ${name}`} /><div className="home26-speaker-info"><span>{topic}</span><h3>{name}</h3><p>{role}</p></div></article>)}</div><a className="home26-textlink" href="https://www.instagram.com/p/Df1uVbjExTl/" target="_blank" rel="noreferrer">Lihat publikasi kegiatan di Instagram</a></div></section>
    <section className="home26-section home26-soft" id="umkm">
      <div className="home26-inner">
        <p className="home26-kicker">Kolaborasi mahasiswa dan UMKM</p>
        <h2>Pairing 10 tim</h2>
        <div className="home26-pairing-gallery">
          {pairings.map(([campusId, campus, teams]) => (
            <section className="home26-pairing-campus" key={campusId}>
              <h3>{campus}</h3>
              <div className="home26-pairing-teams">
                {teams.map(([name, umkm], index) => (
                  <figure className="home26-pairing-team" key={name}>
                    <img src={getTeamPhoto(`byp26-${campusId}-${index + 1}`)} alt={`Foto tim ${name}`} loading="lazy" decoding="async" />
                    <figcaption><strong>{name}</strong><span>{umkm}</span></figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
    <section className="home26-section" id="challenge"><div className="home26-inner"><p className="home26-kicker">Hasil pendampingan</p><h2>Tiga challenge, satu tujuan nyata</h2><div className="home26-columns"><div><h3>Digital Marketing Strategy</h3><p>Analisis kanal digital, optimalisasi Instagram Business, WhatsApp Business, dan marketplace; minimal tiga konten promosi.</p></div><div><h3>Best Catalog Product</h3><p>Katalog produk UMKM dalam PDF siap cetak, sepanjang 3–10 halaman.</p></div><div><h3>Best Innovative Business Idea</h3><p>Analisis masalah, potensi, dan rekomendasi ide bisnis yang realistis dalam PDF 3–5 halaman.</p></div></div><p className="home26-note">Batas pengumpulan dan konfirmasi kepada panitia: 9 Desember 2026.</p></div></section>
    <section className="home26-archive" id="kegiatan-2025"><div className="home26-inner home26-archive-inner"><div><p className="home26-kicker">Jejak program</p><h2>Babel Youthpreneur 2025</h2><p>Telusuri kegiatan, narasumber, UMKM mitra, hasil karya, evaluasi, dan dokumentasi edisi sebelumnya.</p><Link to="/kegiatan-2025">Lihat kegiatan 2025</Link></div><img src="/images/doc-opening-1.jpg" alt="Pembukaan Babel Youthpreneur 2025" loading="lazy" /></div></section>
  </main><Footer /></div>
}
