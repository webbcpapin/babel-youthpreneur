import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navigation from '../sections/Navigation'
import Footer from '../sections/Footer'

gsap.registerPlugin(ScrollTrigger)

const evaluasiInternal = [
  { title: 'Kegiatan Terlalu Singkat', desc: 'Durasi pelaksanaan yang terbatas (hanya 2 hari) membuat mahasiswa belum sepenuhnya siap memberikan dampak maksimal kepada UMKM mitra. Materi terlalu padat dan waktu praktik terbatas.' },
  { title: 'UMKM Belum Dipetakan Kebutuhannya', desc: 'Profiling kebutuhan UMKM belum dilakukan secara mendalam sebelum pendampingan. Pendekatan bersifat umum dan belum sepenuhnya sesuai dengan kondisi lapangan setiap UMKM.' },
  { title: 'Monitoring Belum Optimal', desc: 'Sistem monitoring dan evaluasi berkala selama program berlangsung belum berjalan secara konsisten dan terstruktur. Monitoring hanya dilakukan 1 kali di tengah program.' },
  { title: 'Output Belum Berkelanjutan', desc: 'Hasil kegiatan belum memiliki mekanisme keberlanjutan yang jelas setelah program selesai. Tidak ada sesi evaluasi pasca-challenge untuk memastikan UMKM terus berkembang.' },
  { title: 'Jejak Digital Masih Minim', desc: 'Dokumentasi dan jejak digital dari kegiatan masih terbatas. Kurangnya konten di media sosial mengurangi dampak pengenalan program kepada publik luas.' },
  { title: 'Terlalu Berorientasi Event', desc: 'Program masih berfokus pada penyelenggaraan event kompetisi (3 hari) dibandingkan pendampingan berkelanjutan yang berdampak nyata bagi UMKM.' },
  { title: 'Mahasiswa Belum Sepenuhnya Siap', desc: 'Keterbatasan waktu membuat mahasiswa belum mendapatkan pembekalan yang cukup mendalam sebelum mendampingi UMKM. Perlu bootcamp pendahuluan yang lebih terstruktur.' },
  { title: 'UMKM Belum Memiliki Jejak Digital', desc: 'Beberapa UMKM mitra belum memiliki presence digital yang memadai (website, media sosial aktif, katalog online) sebagai fondasi pendampingan digital.' },
]

const evaluasiEksternal = [
  { from: 'Akademisi', desc: 'Materi sangat bermanfaat namun perlu waktu lebih lama untuk implementasi. Mahasiswa butuh mentoring intensif dan konteks bisnis yang lebih mendalam.' },
  { from: 'UMKM', desc: 'Sangat terbantu dengan adanya program ini. Namun butuh pendampingan berkelanjutan, bukan hanya event singkat. Company profile dan katalog yang dibuat sangat membantu pemasaran.' },
  { from: 'Mahasiswa', desc: 'Pengalaman berharga dan menambah wawasan kewirausahaan. Namun perlu persiapan lebih matang sebelum pendampingan dan akses ke praktisi lebih banyak.' },
]


const ringkasanPeserta = [
  { label: 'Total Respons', value: '13' },
  { label: 'Mahasiswa', value: '7' },
  { label: 'UMKM', value: '6' },
]

const evaluasiPesertaPerTema = [
  {
    theme: 'Durasi dan Keberlanjutan Program',
    summary: 'Peserta berharap program tidak berhenti sebagai event singkat, tetapi dilanjutkan melalui pendampingan yang lebih panjang dan terukur.',
    responses: [
      { category: 'UMKM', quote: 'Waktu pelaksanaan perlu ditambahkan.' },
      { category: 'Mahasiswa', quote: 'Pendampingan UMKM oleh mahasiswa sebaiknya menjadi program berkelanjutan minimal 3-6 bulan dengan target yang lebih terukur, mulai dari perizinan, digitalisasi, hingga perluasan pasar.' },
      { category: 'Mahasiswa', quote: 'Setelah acara selesai, sebaiknya ada komunitas atau program pendampingan agar peserta tetap berkembang.' },
    ],
  },
  {
    theme: 'Ketepatan Waktu dan Alur Acara',
    summary: 'Beberapa peserta menilai pengaturan waktu masih perlu diperkuat agar sesi tidak menunggu terlalu lama atau terasa terburu-buru.',
    responses: [
      { category: 'Mahasiswa', quote: 'Beberapa sesi acara berjalan kurang tepat waktu sehingga peserta menunggu terlalu lama. Panitia dapat lebih memperhatikan ketepatan waktu agar seluruh rangkaian acara berjalan sesuai rundown.' },
      { category: 'Mahasiswa', quote: 'Pengaturan waktu acara perlu diperbaiki agar beberapa sesi tidak terasa terburu-buru.' },
      { category: 'Mahasiswa', quote: 'Pengaturan waktu masih perlu dimaksimalkan agar setiap peserta mendapat perhatian yang merata.' },
    ],
  },
  {
    theme: 'Promosi dan Perluasan Partisipasi',
    summary: 'Masukan peserta menekankan perlunya publikasi, promosi tenant, dan penyebaran informasi yang lebih luas.',
    responses: [
      { category: 'Mahasiswa', quote: 'Penyebaran informasi dan partisipasi dapat diperluas agar tidak hanya mahasiswa, tetapi juga siswa yang memiliki talenta muda dapat ikut serta.' },
      { category: 'Mahasiswa', quote: 'Promosi tenant UMKM perlu dimaksimalkan agar pengunjung lebih mengenal setiap produk yang dipamerkan.' },
      { category: 'Mahasiswa', quote: 'Ke depan, perlu fasilitas promosi yang lebih baik untuk mendukung perkembangan UMKM.' },
    ],
  },
  {
    theme: 'Kesesuaian Pendamping dan Kebutuhan UMKM',
    summary: 'Peserta mengusulkan pemetaan kebutuhan UMKM dan pemilihan mahasiswa pendamping yang sesuai dengan skill yang dibutuhkan.',
    responses: [
      { category: 'UMKM', quote: 'Kegiatan sebaiknya memilih mahasiswa yang memiliki bakat atau minat wirausaha agar lebih semangat belajar dan lebih siap berkolaborasi dengan UMKM.' },
      { category: 'UMKM', quote: 'Sebelum kegiatan, UMKM yang terpilih sebaiknya dikumpulkan untuk membahas permasalahan dan kebutuhan masing-masing.' },
      { category: 'UMKM', quote: 'Mahasiswa pendamping perlu memiliki skill yang sesuai dengan kebutuhan UMKM.' },
      { category: 'UMKM', quote: 'Sebaiknya ditetapkan jumlah minimal pertemuan antara mahasiswa dan pelaku UMKM sebelum presentasi untuk meminimalkan progres yang minim atau dadakan.' },
    ],
  },
  {
    theme: 'Materi, Mentoring, dan Manfaat Program',
    summary: 'Peserta mengapresiasi manfaat program sekaligus mengharapkan materi yang lebih praktis dan mentoring yang lebih interaktif.',
    responses: [
      { category: 'UMKM', quote: 'Kegiatan sangat menarik karena memberikan masukan dan ide yang baik tentang pengembangan usaha beserta perhitungannya.' },
      { category: 'Mahasiswa', quote: 'Perlu lebih banyak sesi mentoring bisnis dan digital marketing yang interaktif agar peserta memperoleh ilmu yang lebih mendalam.' },
      { category: 'Mahasiswa', quote: 'Materi seminar terkadang terlalu teoritis sehingga peserta kurang mendapat pengalaman praktik langsung.' },
      { category: 'Mahasiswa', quote: 'Pelaksanaan sudah sangat baik dan bermanfaat bagi UMKM muda.' },
    ],
  },
]
const strategi2026 = [
  { no: '01', title: 'Model Program Berkelanjutan', desc: 'Mengubah dari model "event kompetisi" menjadi "program pendampingan berbasis course dan implementasi" yang berlangsung Â±2 bulan per batch.' },
  { no: '02', title: 'Profiling Mendalam UMKM', desc: 'Melakukan profiling kebutuhan UMKM sebelum program: jenis usaha, kondisi media sosial, pemasaran, branding, kebutuhan utama, dan target usaha.' },
  { no: '03', title: 'Bootcamp Mahasiswa', desc: 'Memberikan bootcamp intensif sebelum pendampingan: digital marketing, branding UMKM, fotografi produk, videografi, copywriting, social media management.' },
  { no: '04', title: 'Monitoring Mingguan', desc: 'Monitoring dilakukan setiap minggu via WA Group, Google Classroom, dan dashboard. Laporan progres: konten, insight media sosial, kendala, rencana tindak lanjut.' },
  { no: '05', title: 'Pendampingan Hybrid', desc: 'Offline 1 kali setiap bulan + pendampingan online setiap minggu. Durasi total Â±2 bulan per batch untuk memastikan implementasi nyata.' },
  { no: '06', title: 'Challenge Berbasis Implementasi', desc: '5 kategori: Best Digital Branding, Best Social Media Growth, Best Product Campaign, Best Website/Landing Page, Best Content Strategy.' },
  { no: '07', title: 'Jejak Digital & Hashtag', desc: 'Seluruh peserta wajib menggunakan hashtag #BabelYouthpreneur2026 #UMKMBabelNaikKelas #KemenkeuUntukUMKM dan men-tag akun Kemenkeu serta UMKM.' },
  { no: '08', title: 'Kegiatan Rutin per Triwulan', desc: 'Program dilaksanakan secara rutin setiap triwulan untuk menjaga momentum dan keberlanjutan pembinaan UMKM dan mahasiswa.' },
]

const pesertaData = [
  { category: 'Universitas/Akademisi', count: '10', detail: '5 Perguruan Tinggi (2 orang per PT)' },
  { category: 'UMKM Binaan', count: '10', detail: 'Seluruh UMKM mitra tahun 2025' },
  { category: 'Mahasiswa', count: '9', detail: 'Pemenang lomba dari 3 universitas' },
  { category: 'Internal Kemenkeu', count: '18', detail: 'Kanwil DJPb, KPPBC, KPPN, PPNPN' },
]

export default function EvaluasiPage() {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    const ctx = gsap.context(() => {
      const items = pageRef.current?.querySelectorAll('.eval-card, .strat-card, .stat-card, .feedback-card')
      if (items && items.length > 0) {
        gsap.from(items, {
          y: 40, opacity: 0, stagger: 0.06, duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: items[0], start: 'top 85%', toggleActions: 'play none none none' },
        })
      }
    }, pageRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={pageRef} className="relative" style={{ background: '#0d0b0a' }}>
      <Navigation />

      {/* Hero */}
      <section className="relative w-full flex items-center justify-center" style={{ minHeight: 500, paddingTop: 140 }}>
        <div className="text-center px-6 max-w-[800px] mx-auto">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>REFLEKSI &amp; EVALUASI</p>
          <h1 className="font-display font-normal tracking-[-0.025em]" style={{ color: '#f5f2ed', fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 1.1 }}>
            Evaluasi Babel Youthpreneur 2025
          </h1>
          <p className="font-body font-light mx-auto mt-5" style={{ color: 'rgba(245,242,237,0.6)', fontSize: 18, maxWidth: 560, lineHeight: 1.7 }}>
            Mengidentifikasi keberhasilan, tantangan, dan peluang perbaikan untuk membangun program yang lebih berdampak dan berkelanjutan.
          </p>
        </div>
      </section>

      {/* Evaluasi Internal */}
      <section className="w-full" style={{ background: '#2a2421', padding: 'clamp(64px, 10vw, 140px) 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>EVALUASI INTERNAL</p>
          <h2 className="font-display font-normal tracking-[-0.02em] mb-12 md:mb-16" style={{ color: '#f5f2ed', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1 }}>
            Temuan Evaluasi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evaluasiInternal.map((item, i) => (
              <div key={i} className="eval-card rounded-sm p-8" style={{ background: '#181614' }}>
                <div className="font-display text-3xl mb-4" style={{ color: '#c9a87c', opacity: 0.5 }}>{String(i + 1).padStart(2, '0')}</div>
                <h3 className="font-body font-semibold text-lg mb-3" style={{ color: '#f5f2ed' }}>{item.title}</h3>
                <p className="font-body font-light" style={{ color: 'rgba(245,242,237,0.5)', fontSize: 15, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evaluasi Eksternal */}
      <section className="w-full" style={{ padding: 'clamp(64px, 10vw, 140px) 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>MASUKAN PESERTA</p>
          <h2 className="font-display font-normal tracking-[-0.02em] mb-12 md:mb-16" style={{ color: '#f5f2ed', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1 }}>
            Suara dari Lapangan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {evaluasiEksternal.map((item) => (
              <div key={item.from} className="eval-card rounded-sm p-8" style={{ background: '#181614', borderTop: '3px solid #c9a87c' }}>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: '#c9a87c' }}>{item.from}</p>
                <p className="font-body font-light italic" style={{ color: 'rgba(245,242,237,0.6)', fontSize: 16, lineHeight: 1.7 }}>&ldquo;{item.desc}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Evaluasi Peserta dari Excel */}
      <section className="w-full" style={{ background: '#181614', padding: 'clamp(64px, 10vw, 140px) 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12 md:mb-16">
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>HASIL FORM EVALUASI</p>
              <h2 className="font-display font-normal tracking-[-0.02em]" style={{ color: '#f5f2ed', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1 }}>
                Evaluasi dari Peserta
              </h2>
              <p className="font-body font-light mt-5" style={{ color: 'rgba(245,242,237,0.6)', fontSize: 17, maxWidth: 620, lineHeight: 1.7 }}>
                Masukan dari formulir evaluasi dikelompokkan per tema. Identitas nama peserta, UMKM, dan universitas dirahasiakan.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
              {ringkasanPeserta.map((item) => (
                <div key={item.label} className="feedback-card rounded-sm p-4 text-center" style={{ background: '#0d0b0a' }}>
                  <div className="font-display" style={{ color: '#c9a87c', fontSize: 36, lineHeight: 1 }}>{item.value}</div>
                  <p className="font-body font-semibold mt-2" style={{ color: '#f5f2ed', fontSize: 12 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {evaluasiPesertaPerTema.map((group, groupIndex) => (
              <div key={group.theme} className="feedback-card rounded-sm p-6 md:p-8" style={{ background: '#0d0b0a', borderLeft: '3px solid #c9a87c' }}>
                <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8">
                  <div>
                    <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: '#8b7355' }}>Tema {String(groupIndex + 1).padStart(2, '0')}</p>
                    <h3 className="font-body font-semibold" style={{ color: '#f5f2ed', fontSize: 22 }}>{group.theme}</h3>
                    <p className="font-body font-light mt-4" style={{ color: 'rgba(245,242,237,0.56)', fontSize: 14, lineHeight: 1.7 }}>{group.summary}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.responses.map((item, i) => (
                      <div key={`${group.theme}-${i}`} className="rounded-sm p-5" style={{ background: '#181614' }}>
                        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: item.category === 'UMKM' ? '#4a7c59' : '#c9a87c' }}>{item.category}</p>
                        <p className="font-body font-light" style={{ color: 'rgba(245,242,237,0.62)', fontSize: 14, lineHeight: 1.7 }}>&ldquo;{item.quote}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Strategi 2026 */}
      <section className="w-full" style={{ background: '#2a2421', padding: 'clamp(64px, 10vw, 140px) 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>STRATEGI PERBAIKAN</p>
          <h2 className="font-display font-normal tracking-[-0.02em] mb-12 md:mb-16" style={{ color: '#f5f2ed', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1 }}>
            8 Strategi Babel Youthpreneur 2026
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {strategi2026.map((s) => (
              <div key={s.no} className="strat-card rounded-sm p-6" style={{ background: '#181614' }}>
                <div className="font-display text-2xl mb-3" style={{ color: '#c9a87c' }}>{s.no}</div>
                <h3 className="font-body font-semibold mb-2" style={{ color: '#f5f2ed', fontSize: 15 }}>{s.title}</h3>
                <p className="font-body font-light" style={{ color: 'rgba(245,242,237,0.45)', fontSize: 13, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Forum Evaluasi */}
      <section className="w-full" style={{ padding: 'clamp(64px, 10vw, 140px) 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>FORUM EVALUASI</p>
              <h2 className="font-display font-normal tracking-[-0.02em] mb-6" style={{ color: '#f5f2ed', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1 }}>
                Rapat Evaluasi &amp; Kick Off 2026
              </h2>
              <p className="font-body font-light mb-8" style={{ color: 'rgba(245,242,237,0.6)', fontSize: 18, lineHeight: 1.7 }}>
                Forum sinergi dan kolaborasi lintas pihak untuk meninjau pelaksanaan Babel Youthpreneur 2025 dan merumuskan kerangka program yang lebih efektif di tahun 2026.
              </p>
              <div className="space-y-5">
                {[
                  { label: 'Tanggal', value: 'Kamis, 21 Mei 2026' },
                  { label: 'Waktu', value: '13.00 \u2013 15.40 WIB' },
                  { label: 'Tempat', value: 'Aula Kanwil DJPb Babel, Jl. Sungai Selan No.91, Pangkalpinang' },
                  { label: 'Tema', value: 'Program Pendampingan UMKM Berbasis Digital dan Kolaborasi Mahasiswa' },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col md:flex-row md:items-start gap-1">
                    <span className="font-body text-xs font-semibold uppercase tracking-[0.12em] w-28 flex-shrink-0" style={{ color: '#8b7355' }}>{row.label}</span>
                    <span className="font-body font-light" style={{ color: '#f5f2ed', fontSize: 15 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>KOMPOSISI PESERTA</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pesertaData.map((p) => (
                  <div key={p.category} className="stat-card rounded-sm p-6 text-center" style={{ background: '#181614' }}>
                    <div className="font-display" style={{ color: '#c9a87c', fontSize: 44, lineHeight: 1 }}>{p.count}</div>
                    <div className="font-body font-semibold text-sm mt-3" style={{ color: '#f5f2ed' }}>{p.category}</div>
                    <div className="font-body font-light mt-1" style={{ color: 'rgba(245,242,237,0.45)', fontSize: 12 }}>{p.detail}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-sm p-6" style={{ background: '#181614', borderLeft: '3px solid #c9a87c' }}>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#8b7355' }}>Total Peserta</p>
                <div className="font-display" style={{ color: '#f5f2ed', fontSize: 32 }}>47 Orang</div>
                <p className="font-body font-light mt-2" style={{ color: 'rgba(245,242,237,0.5)', fontSize: 13 }}>Termasuk stakeholder opsional</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agenda Forum */}
      <section className="w-full" style={{ background: '#2a2421', padding: 'clamp(64px, 10vw, 140px) 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>RUNDOWN KEGIATAN</p>
          <h2 className="font-display font-normal tracking-[-0.02em] mb-12 md:mb-16" style={{ color: '#f5f2ed', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1 }}>
            Agenda Forum Evaluasi
          </h2>
          <div className="space-y-0">
            {[
              { time: '13.00 \u2013 13.30', agenda: 'Registrasi Peserta', by: 'Panitia' },
              { time: '13.30 \u2013 13.35', agenda: 'Pembukaan', by: 'MC' },
              { time: '13.35 \u2013 13.45', agenda: 'Menyanyikan Lagu Indonesia Raya & Doa', by: 'Panitia' },
              { time: '13.45 \u2013 14.00', agenda: 'Sambutan Kemenkeu Satu Babel', by: 'Kepala Perwakilan Kemenkeu' },
              { time: '14.00 \u2013 14.05', agenda: 'Foto Bersama', by: 'Panitia' },
              { time: '14.05 \u2013 14.45', agenda: 'Pemaparan Hasil Kegiatan 2025: Review, Evaluasi, & Pelaksanaan 2026', by: 'Panitia' },
              { time: '14.45 \u2013 15.30', agenda: 'Sesi Diskusi', by: 'Moderator, Panitia, dan Peserta' },
              { time: '15.30 \u2013 15.35', agenda: 'Penutup', by: 'MC' },
              { time: '15.35 \u2013 15.40', agenda: 'Ramah Tamah', by: 'Panitia' },
            ].map((item, i) => (
              <div key={i} className="eval-card flex flex-col md:flex-row md:items-center gap-2 md:gap-8 py-5" style={{ borderBottom: '1px solid rgba(245,242,237,0.06)' }}>
                <span className="font-body font-semibold text-sm w-40 flex-shrink-0" style={{ color: '#c9a87c' }}>{item.time}</span>
                <span className="font-body font-light flex-1" style={{ color: '#f5f2ed', fontSize: 16 }}>{item.agenda}</span>
                <span className="font-body font-light text-sm flex-shrink-0" style={{ color: 'rgba(245,242,237,0.4)' }}>{item.by}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kontak */}
      <section className="w-full" style={{ padding: 'clamp(64px, 6vw, 80px) 0' }}>
        <div className="max-w-[600px] mx-auto text-center px-6">
          <p className="font-body font-light" style={{ color: 'rgba(245,242,237,0.5)', fontSize: 15 }}>Konfirmasi kehadiran dan informasi lebih lanjut dapat menghubungi</p>
          <a href="https://wa.me/6281368838372" target="_blank" rel="noopener noreferrer" className="font-body font-semibold mt-3 inline-block" style={{ color: '#c9a87c', fontSize: 18 }}>Bunga Putri Damara &middot; 0813-6883-8372</a>
        </div>
      </section>

      <Footer />
    </div>
  )
}




