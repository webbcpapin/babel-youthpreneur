import { useRef, useEffect } from 'react'
import { FileText, FolderOpen } from 'lucide-react'
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
  { label: 'Kelompok 01 - Madu RR Arisi', cpkp: 'https://drive.google.com/file/d/1y_g8r6KfpTUoAIhXAVyWUTMtbe7amxoc/view', ide: 'https://drive.google.com/file/d/1os1k1Z8NLpMW8TwWbjr1u8I7bigV8vMj/view' },
  { label: 'Kelompok 02 - JJ Catering', cpkp: 'https://drive.google.com/drive/folders/10Zjc2DfxRXMdeIS_ntsBSFTGiZnWcz6t', ide: 'https://drive.google.com/drive/folders/13d_dX9GJj8OBqIyIQkZpox3al9DA1kcT', folder: true },
  { label: 'Kelompok 03 - DnD Cake N Cookies', cpkp: 'https://drive.google.com/file/d/1AIamTEA8hFfxF5WtLXYtXJawLTf8ql9Z/view', ide: 'https://drive.google.com/file/d/1kHG7BCmSnsx16T_PIryy-5x219Xbb3J6/view' },
  { label: 'Kelompok 04 - Deshanda Craft', cpkp: 'https://drive.google.com/file/d/1FV9IsqafR9CIs_UkHZjqGRcTW9VxO5NZ/view', ide: 'https://drive.google.com/file/d/1ZZujbMC8ytQpqil_Irgxlcth9Psk_6Ez/view' },
  { label: "Kelompok 05 - Kamiz Choc's", cpkp: 'https://drive.google.com/file/d/1Gtliqq9RIRvH8fZwjzNgP7U2yhJsMG7g/view', ide: 'https://drive.google.com/file/d/1UP7N2-cl1jqXZ7r_TcHnnygX6GYWqk4X/view' },
  { label: 'Kelompok 06 - Keripik Cumi Nina', cpkp: 'https://drive.google.com/file/d/1-zO7quXZksTrikgiFRPkRgEULwi-4FiI/view', ide: 'https://drive.google.com/file/d/1dLQCOPDL3OYWxcr9uqojiHhEf0LrbfxS/view' },
  { label: 'Kelompok 07 - RM Raja Lele', cpkp: 'https://drive.google.com/file/d/1D5AIjoj3xGyMja0lyLnJRqqf5fpl2d2B/view', ide: 'https://drive.google.com/file/d/1Ff2ON03iEF6Wpt2Wh_mavE2FiLr58hi5/view' },
  { label: 'Kelompok 08 - 3 Shesca Decoupage', cpkp: 'https://drive.google.com/file/d/1Wu_58RNPfRuINz3s1kZa2tqsUlhJ__3P/view', ide: 'https://drive.google.com/file/d/1jTdEnbf7LvGxdUOdkeag9-yClLocsawz/view' },
  { label: 'Kelompok 09 - PT Central Charcoal Babelindo', cpkp: 'https://drive.google.com/file/d/1_ie0wXF8BQqFXuVf1O22aVqto3MzU4T5/view', ide: 'https://drive.google.com/file/d/1eUFDhVcOvBh-IE70O3f5SvzzwAQ-9-m0/view' },
  { label: 'Kelompok 10 - Deviz Indo Bangka', cpkp: 'https://drive.google.com/file/d/17QQISEikxrF3D8IBOEoAON47lvBR20aC/view', ide: 'https://drive.google.com/file/d/1C5W-A_Eqs0J2-ULIioGfkjfWm7pwImm4/view' },
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

  const FileRow = ({ href, label, color, folder = false }: { href: string; label: string; color: string; folder?: boolean }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="file-row flex items-center gap-3 py-3 px-4 rounded-sm transition-colors duration-300 hover:bg-[#24201d]"
      style={{ background: '#181614' }}
    >
      {folder ? <FolderOpen size={16} strokeWidth={1.8} style={{ color }} className="flex-shrink-0" /> : <FileText size={16} strokeWidth={1.8} style={{ color }} className="flex-shrink-0" />}
      <span className="font-body font-light flex-1" style={{ color: 'rgba(245,242,237,0.74)', fontSize: 14 }}>{label}</span>
      <span className="font-body text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color }}>{folder ? 'Folder' : 'PDF'}</span>
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
              <div className="space-y-2">{karyaPeserta.map((t) => <FileRow key={t.cpkp} href={t.cpkp} label={t.label} color="#c9a87c" folder={t.folder} />)}</div>
            </div>
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-4" style={{ color: '#c9a87c' }}>Proposal Pengembangan Ide Bisnis (10 Tim)</p>
              <div className="space-y-2">{karyaPeserta.map((t) => <FileRow key={t.ide} href={t.ide} label={t.label} color="#4a7c59" folder={t.folder} />)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

