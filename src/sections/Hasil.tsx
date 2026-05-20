import { useRef, useEffect } from 'react'
import { FileText } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const challenge1 = [
  { rank: 'Juara 1', university: 'IAIN SAS Bangka Belitung', umkm: 'RM Raja Lele' },
  { rank: 'Juara 2', university: 'Universitas Bangka Belitung', umkm: "Kamiz Choc's" },
  { rank: 'Juara 3', university: 'Universitas Pertiba', umkm: 'DnD Cake N Cookies By Desi' },
]

const challenge2 = [
  { rank: 'Juara 1', university: 'IAIN SAS Bangka Belitung', umkm: 'Raja Lele' },
  { rank: 'Juara 2', university: 'Universitas Pertiba', umkm: 'DnD Cake N Cookies By Desi' },
  { rank: 'Juara 3', university: 'Universitas Bangka Belitung', umkm: "Kamiz Choc's" },
]

const karyaPeserta = [
  { label: 'Kelompok 01 - Madu RR Arisi', cpkp: '/files/hasil/cpkp-01.pdf', ide: '/files/hasil/ide-01.pdf' },
  { label: 'Kelompok 02 - JJ Catering', cpkp: '/files/hasil/cpkp-02.pdf', ide: '/files/hasil/ide-02.pdf' },
  { label: 'Kelompok 03 - DnD Cake N Cookies', cpkp: '/files/hasil/cpkp-03.pdf', ide: '/files/hasil/ide-03.pdf' },
  { label: 'Kelompok 04 - Deshanda Craft', cpkp: '/files/hasil/cpkp-04.pdf', ide: '/files/hasil/ide-04.pdf' },
  { label: "Kelompok 05 - Kamiz Choc's", cpkp: '/files/hasil/cpkp-05.pdf', ide: '/files/hasil/ide-05.pdf' },
  { label: 'Kelompok 06 - Keripik Cumi Nina', cpkp: '/files/hasil/cpkp-06.pdf', ide: '/files/hasil/ide-06.pdf' },
  { label: 'Kelompok 07 - RM Raja Lele', cpkp: '/files/hasil/cpkp-07.pdf', ide: '/files/hasil/ide-07.pdf' },
  { label: 'Kelompok 08 - 3 Shesca Decoupage', cpkp: '/files/hasil/cpkp-08.pdf', ide: '/files/hasil/ide-08.pdf' },
  { label: 'Kelompok 09 - PT Central Charcoal Babelindo', cpkp: '/files/hasil/cpkp-09.pdf', ide: '/files/hasil/ide-09.pdf' },
  { label: 'Kelompok 10 - Deviz Indo Bangka', cpkp: '/files/hasil/cpkp-10.pdf', ide: '/files/hasil/ide-10.pdf' },
]

export default function Hasil() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const rows = sectionRef.current?.querySelectorAll('.winner-row, .file-row')
      if (rows) {
        gsap.from(rows, { y: 20, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none none' } })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const WinnerRow = ({ rank, university, umkm }: { rank: string; university: string; umkm: string }) => (
    <div className="winner-row py-6" style={{ borderBottom: '1px solid rgba(245,242,237,0.08)' }}>
      <p className="font-display" style={{ color: '#c9a87c', fontSize: 'clamp(32px, 3vw, 48px)', lineHeight: 1 }}>{rank}</p>
      <p className="font-body font-semibold mt-3" style={{ color: '#f5f2ed', fontSize: 20 }}>{university}</p>
      <p className="font-body mt-2" style={{ color: 'rgba(245,242,237,0.62)', fontSize: 14 }}>UMKM {umkm}</p>
    </div>
  )

  const FileRow = ({ href, label, color }: { href: string; label: string; color: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="file-row flex items-center gap-3 py-3 px-4 rounded-sm transition-colors duration-300 hover:bg-[#24201d]"
      style={{ background: '#181614' }}
    >
      <FileText size={16} strokeWidth={1.8} style={{ color }} className="flex-shrink-0" />
      <span className="font-body font-light flex-1" style={{ color: 'rgba(245,242,237,0.74)', fontSize: 14 }}>{label}</span>
      <span className="font-body text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color }}>PDF</span>
    </a>
  )

  return (
    <section id="hasil" ref={sectionRef} className="w-full" style={{ background: '#0d0b0a', padding: 'clamp(64px, 12vw, 160px) 0' }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="mb-16 md:mb-20">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>HASIL LOMBA</p>
          <h2 className="font-display font-normal tracking-[-0.025em]" style={{ color: '#f5f2ed', fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 1.1 }}>Daftar Pemenang</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-20 md:mb-28">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: '#c9a87c' }}>Kategori</p>
            <h3 className="font-display tracking-[-0.02em]" style={{ color: '#f5f2ed', fontSize: 'clamp(22px, 2.2vw, 32px)' }}>Company Profile dan Katalog Produk</h3>
            <div className="mt-8 md:mt-10">{challenge1.map((w) => <WinnerRow key={`${w.rank}-${w.university}`} {...w} />)}</div>
          </div>
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: '#c9a87c' }}>Kategori</p>
            <h3 className="font-display tracking-[-0.02em]" style={{ color: '#f5f2ed', fontSize: 'clamp(22px, 2.2vw, 32px)' }}>Pengembangan Ide Bisnis</h3>
            <div className="mt-8 md:mt-10">{challenge2.map((w) => <WinnerRow key={`${w.rank}-${w.university}`} {...w} />)}</div>
          </div>
        </div>

        <div className="pt-16 md:pt-20" style={{ borderTop: '1px solid rgba(245,242,237,0.08)' }}>
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>HASIL KARYA PESERTA</p>
          <h2 className="font-display font-normal tracking-[-0.02em] mb-12 md:mb-16" style={{ color: '#f5f2ed', fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1 }}>Katalog Produk &amp; Ide Bisnis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: '#c9a87c' }}>Katalog Produk &amp; Company Profile (10 Tim)</p>
              <div className="space-y-2">{karyaPeserta.map((t) => <FileRow key={t.cpkp} href={t.cpkp} label={t.label} color="#c9a87c" />)}</div>
            </div>
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: '#c9a87c' }}>Proposal Pengembangan Ide Bisnis (10 Tim)</p>
              <div className="space-y-2">{karyaPeserta.map((t) => <FileRow key={t.ide} href={t.ide} label={t.label} color="#4a7c59" />)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
