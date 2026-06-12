import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navigation from '../sections/Navigation'
import Footer from '../sections/Footer'
import { BookOpen, Users, Link2, Code2, Award } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const fases = [
  {
    no: '01',
    title: 'Profiling & Seleksi UMKM',
    desc: 'Memetakan kebutuhan UMKM secara nyata melalui pengisian form profiling, wawancara singkat, dan penilaian kesiapan. Data yang dipetakan: jenis usaha, kondisi media sosial, pemasaran, branding, kebutuhan utama, dan target usaha.',
    output: 'Database UMKM dan klasifikasi kebutuhan',
    icon: Users,
  },
  {
    no: '02',
    title: 'Bootcamp Mahasiswa',
    desc: 'Mempersiapkan mahasiswa sebelum pendampingan dengan materi: dasar digital marketing, branding UMKM, fotografi produk, videografi sederhana, copywriting, social media management, dan etika pendampingan.',
    output: 'Mahasiswa siap melakukan pendampingan',
    icon: BookOpen,
  },
  {
    no: '03',
    title: 'Pairing Mahasiswa & UMKM',
    desc: 'Setiap kelompok 2-3 mahasiswa mendampingi 1 UMKM. Konsep pairing ini bertujuan untuk membuat pendampingan lebih fokus dan terukur.',
    output: 'Tim pendamping terbentuk',
    icon: Link2,
  },
  {
    no: '04',
    title: 'Pendampingan & Implementasi',
    desc: 'Durasi 4-6 minggu dengan aktivitas: membuat kalender konten, desain promosi, video pendek, mengelola media sosial, membantu branding, membuat katalog digital, dan landing page sederhana.',
    output: 'Implementasi nyata di UMKM',
    icon: Code2,
  },
  {
    no: '05',
    title: 'Model Challenge & Evaluasi',
    desc: 'Challenge berbasis implementasi nyata dengan 5 kategori: Best Digital Branding, Best Social Media Growth, Best Product Campaign, Best Website/Landing Page, dan Best Content Strategy.',
    output: 'Pemenang & tindak lanjut',
    icon: Award,
  },
]

const challenges = [
  { name: 'Best Digital Branding', desc: 'Penilaian pada kualitas branding digital UMKM secara keseluruhan' },
  { name: 'Best Social Media Growth', desc: 'Peningkatan engagement dan pertumbuhan followers' },
  { name: 'Best Product Campaign', desc: 'Kreativitas dan dampak kampanye produk' },
  { name: 'Best Website/Landing Page', desc: 'Kualitas desain dan fungsionalitas halaman web' },
  { name: 'Best Content Strategy', desc: 'Konsistensi, kreativitas, dan strategi konten' },
]

const monitoring = [
  { week: 'Minggu 1', title: 'Perencanaan', desc: 'Kalender konten, strategi, dan target' },
  { week: 'Minggu 2', title: 'Produksi Konten', desc: 'Foto, video, desain, dan copywriting' },
  { week: 'Minggu 3', title: 'Publikasi & Evaluasi', desc: 'Upload, analisis, dan feedback' },
  { week: 'Minggu 4', title: 'Optimasi & Finalisasi', desc: 'Perbaikan dan persiapan presentasi' },
]

const hashtags = ['#BabelYouthpreneur2026', '#UMKMBabelNaikKelas', '#KemenkeuUntukUMKM']

export default function RencanaPage() {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    const ctx = gsap.context(() => {
      const items = pageRef.current?.querySelectorAll('.reveal-item')
      if (items) {
        gsap.from(items, {
          y: 50,
          opacity: 0,
          stagger: 0.08,
          duration: 0.7,
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
        <div className="text-center px-6 max-w-[900px] mx-auto">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>
            MELANGKAH LEBIH JAUH
          </p>
          <h1 className="font-display font-normal tracking-[-0.025em]" style={{ color: '#f5f2ed', fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 1.1 }}>
            Babel Youthpreneur 2026
          </h1>
          <p className="font-body font-semibold mt-4 uppercase tracking-[0.1em]" style={{ color: '#c9a87c', fontSize: 14 }}>
            Program Pendampingan UMKM Berbasis Digital dan Kolaborasi Mahasiswa
          </p>
          <p className="font-body font-light mx-auto mt-6" style={{ color: 'rgba(245,242,237,0.6)', fontSize: 18, maxWidth: 640, lineHeight: 1.7 }}>
            Dari model "event kompetisi" menjadi "program pendampingan berbasis course dan implementasi"
            yang lebih panjang, terukur, dan berbasis kebutuhan nyata UMKM.
          </p>
        </div>
      </section>

      {/* Perubahan Model */}
      <section className="w-full" style={{ background: '#2a2421', padding: 'clamp(64px, 10vw, 140px) 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>
                TRANSFORMASI MODEL
              </p>
              <h2 className="font-display font-normal tracking-[-0.02em] mb-8" style={{ color: '#f5f2ed', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1 }}>
                Mengapa Berubah?
              </h2>
              <p className="font-body font-light mb-8" style={{ color: 'rgba(245,242,237,0.6)', fontSize: 18, lineHeight: 1.7 }}>
                Evaluasi Babel Youthpreneur 2025 menunjukkan antusiasme yang tinggi namun terdapat
                kelemahan yang perlu diperbaiki agar program memiliki dampak yang lebih nyata dan berkelanjutan.
              </p>
              <div className="space-y-4">
                {[
                  { old: 'Event 1-2 hari', new: 'Program Â±2 bulan per batch' },
                  { old: 'Fokus kompetisi', new: 'Fokus pendampingan & implementasi' },
                  { old: 'Monitoring minimal', new: 'Monitoring mingguan' },
                  { old: 'Output terbatas', new: 'Output digital langsung digunakan UMKM' },
                  { old: 'Terlalu event-oriented', new: 'Ekosistem pembelajaran berkelanjutan' },
                ].map((row, i) => (
                  <div key={i} className="reveal-item flex items-center gap-4 py-3" style={{ borderBottom: '1px solid rgba(245,242,237,0.06)' }}>
                    <span className="font-body font-light flex-1" style={{ color: 'rgba(245,242,237,0.4)', fontSize: 14 }}>{row.old}</span>
                    <span className="font-body text-lg" style={{ color: '#c9a87c' }}>&rarr;</span>
                    <span className="font-body font-semibold flex-1" style={{ color: '#f5f2ed', fontSize: 14 }}>{row.new}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>
                KARAKTERISTIK PROGRAM
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Durasi', value: 'Â±2 bulan per batch' },
                  { label: 'Metode', value: 'Hybrid (Offline 1x/bulan + Online mingguan)' },
                  { label: 'Pendampingan', value: '2-3 mahasiswa per 1 UMKM' },
                  { label: 'UMKM', value: '10 pelaku usaha binaan' },
                  { label: 'Universitas', value: '5 perguruan tinggi mitra' },
                  { label: 'Monitoring', value: 'Setiap minggu via WA, Google Classroom, Dashboard' },
                ].map((item) => (
                  <div key={item.label} className="reveal-item rounded-sm p-5" style={{ background: '#181614' }}>
                    <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#8b7355' }}>{item.label}</p>
                    <p className="font-body font-semibold" style={{ color: '#f5f2ed', fontSize: 15 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Fase */}
      <section className="w-full" style={{ padding: 'clamp(64px, 10vw, 140px) 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>
            ALUR PROGRAM
          </p>
          <h2 className="font-display font-normal tracking-[-0.02em] mb-12 md:mb-16" style={{ color: '#f5f2ed', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1 }}>
            5 Fase Pendampingan
          </h2>
          <div className="space-y-8">
            {fases.map((fase) => (
              <div key={fase.no} className="reveal-item grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-1">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,124,0.1)', border: '1px solid rgba(201,168,124,0.3)' }}>
                    <fase.icon size={20} strokeWidth={1.5} style={{ color: '#c9a87c' }} />
                  </div>
                </div>
                <div className="md:col-span-7">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-display" style={{ color: '#c9a87c', fontSize: 14 }}>{fase.no}</span>
                    <h3 className="font-body font-semibold text-xl" style={{ color: '#f5f2ed' }}>{fase.title}</h3>
                  </div>
                  <p className="font-body font-light" style={{ color: 'rgba(245,242,237,0.6)', fontSize: 16, lineHeight: 1.7 }}>{fase.desc}</p>
                </div>
                <div className="md:col-span-4">
                  <div className="rounded-sm p-4" style={{ background: 'rgba(74,124,89,0.1)', borderLeft: '3px solid #4a7c59' }}>
                    <p className="font-body text-xs font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#4a7c59' }}>Output</p>
                    <p className="font-body font-medium" style={{ color: '#f5f2ed', fontSize: 14 }}>{fase.output}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge */}
      <section className="w-full" style={{ background: '#2a2421', padding: 'clamp(64px, 10vw, 140px) 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>
            KATEGORI CHALLENGE
          </p>
          <h2 className="font-display font-normal tracking-[-0.02em] mb-12 md:mb-16" style={{ color: '#f5f2ed', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1 }}>
            5 Challenge Digital 2026
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {challenges.map((c, i) => (
              <div key={c.name} className="reveal-item rounded-sm p-6 text-center" style={{ background: '#181614' }}>
                <div className="font-display mb-3" style={{ color: '#c9a87c', fontSize: 32 }}>{String(i + 1).padStart(2, '0')}</div>
                <h3 className="font-body font-semibold mb-2" style={{ color: '#f5f2ed', fontSize: 15 }}>{c.name}</h3>
                <p className="font-body font-light" style={{ color: 'rgba(245,242,237,0.45)', fontSize: 13, lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="font-body font-light" style={{ color: 'rgba(245,242,237,0.5)', fontSize: 14 }}>
              Penilaian berdasarkan: kualitas konten, konsistensi, engagement, kreativitas, dan dampak terhadap UMKM
            </p>
          </div>
        </div>
      </section>

      {/* Monitoring */}
      <section className="w-full" style={{ padding: 'clamp(64px, 10vw, 140px) 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>
            SISTEM MONITORING
          </p>
          <h2 className="font-display font-normal tracking-[-0.02em] mb-12 md:mb-16" style={{ color: '#f5f2ed', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1 }}>
            Monitoring Mingguan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {monitoring.map((m) => (
              <div key={m.week} className="reveal-item rounded-sm p-6" style={{ background: '#181614' }}>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#c9a87c' }}>{m.week}</p>
                <h3 className="font-body font-semibold text-lg mb-2" style={{ color: '#f5f2ed' }}>{m.title}</h3>
                <p className="font-body font-light" style={{ color: 'rgba(245,242,237,0.5)', fontSize: 14, lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-sm p-6" style={{ background: '#181614' }}>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: '#8b7355' }}>Laporan Wajib Setiap Tim</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                'Progres mingguan & jumlah konten',
                'Insight media sosial & engagement',
                'Kendala & rencana tindak lanjut',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#4a7c59' }} />
                  <span className="font-body font-light" style={{ color: 'rgba(245,242,237,0.6)', fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hashtag */}
      <section className="w-full" style={{ background: '#2a2421', padding: 'clamp(48px, 6vw, 80px) 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-6" style={{ color: '#c9a87c' }}>
            STRATEGI DIGITAL &amp; BRANDING
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {hashtags.map((tag) => (
              <span key={tag} className="font-body font-semibold text-sm rounded-full px-6 py-3" style={{ color: '#f5f2ed', border: '1px solid rgba(201,168,124,0.3)', background: 'rgba(201,168,124,0.05)' }}>
                {tag}
              </span>
            ))}
          </div>
          <p className="font-body font-light mt-6" style={{ color: 'rgba(245,242,237,0.45)', fontSize: 14 }}>
            Seluruh peserta wajib menggunakan hashtag resmi dan men-tag akun Kemenkeu serta UMKM
          </p>
        </div>
      </section>

      {/* Stakeholder */}
      <section className="w-full" style={{ padding: 'clamp(64px, 10vw, 140px) 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>
            STAKEHOLDER
          </p>
          <h2 className="font-display font-normal tracking-[-0.02em] mb-12 md:mb-16" style={{ color: '#f5f2ed', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1 }}>
            Pihak Terlibat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="reveal-item rounded-sm p-6" style={{ background: '#181614' }}>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: '#c9a87c' }}>Internal Kemenkeu</p>
              {['Kanwil DJPb Babel', 'Bea Cukai Pangkalpinang', 'KPPN Pangkalpinang', 'Unit Kemenkeu lainnya'].map((item) => (
                <div key={item} className="flex items-center gap-2 py-1.5">
                  <div className="w-1 h-1 rounded-full" style={{ background: '#c9a87c' }} />
                  <span className="font-body font-light" style={{ color: 'rgba(245,242,237,0.6)', fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>
            <div className="reveal-item rounded-sm p-6" style={{ background: '#181614' }}>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: '#c9a87c' }}>Perguruan Tinggi</p>
              {['Universitas Bangka Belitung', 'IAIN SAS Babel', 'Universitas Pertiba', 'Universitas Muhammadiyah Babel', 'Universitas Anak Bangsa'].map((item) => (
                <div key={item} className="flex items-center gap-2 py-1.5">
                  <div className="w-1 h-1 rounded-full" style={{ background: '#c9a87c' }} />
                  <span className="font-body font-light" style={{ color: 'rgba(245,242,237,0.6)', fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>
            <div className="reveal-item rounded-sm p-6" style={{ background: '#181614' }}>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: '#c9a87c' }}>Potensi Mitra</p>
              {['Disperindag', 'BPS', 'Perbankan (BRI)', 'Rumah Kemasan', 'Praktisi Digital Marketing', 'Influencer Lokal'].map((item) => (
                <div key={item} className="flex items-center gap-2 py-1.5">
                  <div className="w-1 h-1 rounded-full" style={{ background: '#c9a87c' }} />
                  <span className="font-body font-light" style={{ color: 'rgba(245,242,237,0.6)', fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

