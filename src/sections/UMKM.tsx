import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const umkmList = [
  { no: '01', name: 'DnD Cake \u0026 Cookies by Desi', category: 'Olahan Makanan', university: 'Universitas Pertiba' },
  { no: '02', name: 'Deviz Indo Bangka', category: 'Olahan Makanan', university: 'Universitas Anak Bangsa' },
  { no: '03', name: 'Rumah Makan Raja Lele', category: 'Olahan Makanan', university: 'IAIN Syaikh Abdurrahman Siddik' },
  { no: '04', name: 'JJ Catering', category: 'Olahan Makanan', university: 'Universitas Anak Bangsa' },
  { no: '05', name: "Kamiz Choc's", category: 'Olahan Cokelat', university: 'Universitas Bangka Belitung' },
  { no: '06', name: 'PT Central Charcoal Babelindo', category: 'Leaf Litter', university: 'Universitas Muhammadiyah' },
  { no: '07', name: 'Keripik Cumi Nina', category: 'Olahan Makanan', university: 'Universitas Muhammadiyah' },
  { no: '08', name: 'Deshanda Craft', category: 'Kerajinan', university: 'Universitas Pertiba' },
  { no: '09', name: '3 Shesca Decoupage Art', category: 'Kerajinan Decoupage', university: 'IAIN Syaikh Abdurrahman Siddik' },
  { no: '10', name: 'Madu RR Arisi', category: 'Madu', university: 'Universitas Bangka Belitung' },
]

export default function UMKM() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll('.umkm-card')
      if (cards) {
        gsap.from(cards, {
          opacity: 0,
          scale: 0.95,
          stagger: 0.06,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="umkm"
      ref={sectionRef}
      className="w-full"
      style={{
        background: '#2a2421',
        padding: 'clamp(64px, 12vw, 160px) 0',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <p
            className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4"
            style={{ color: '#c9a87c' }}
          >
            MITRA UMKM
          </p>
          <h2
            className="font-display font-normal tracking-[-0.025em]"
            style={{
              color: '#f5f2ed',
              fontSize: 'clamp(40px, 5vw, 72px)',
              lineHeight: 1.1,
            }}
          >
            10 UMKM Binaan
          </h2>
          <p
            className="font-body font-light leading-relaxed mt-5"
            style={{
              color: 'rgba(245,242,237,0.6)',
              fontSize: 'clamp(16px, 1.5vw, 20px)',
              maxWidth: 560,
              lineHeight: 1.7,
            }}
          >
            Para pelaku usaha mikro, kecil, dan menengah yang menjadi mitra mahasiswa
            dalam program pendampingan Babel Youthpreneur.
          </p>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-5 gap-px"
          style={{ background: 'rgba(245,242,237,0.06)' }}
        >
          {umkmList.map((umkm) => (
            <div
              key={umkm.no}
              className="umkm-card text-center transition-colors duration-300 cursor-default"
              style={{
                background: '#2a2421',
                padding: '40px 16px',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#3a332e'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#2a2421'
              }}
            >
              <p
                className="font-body font-semibold uppercase tracking-[0.1em] mb-5"
                style={{ color: '#8b7355', fontSize: 13 }}
              >
                {umkm.no}
              </p>
              <h3
                className="font-body font-semibold mb-3"
                style={{ color: '#f5f2ed', fontSize: 'clamp(16px, 1.4vw, 20px)' }}
              >
                {umkm.name}
              </h3>
              <p
                className="font-body uppercase tracking-[0.1em]"
                style={{ color: 'rgba(245,242,237,0.45)', fontSize: 11 }}
              >
                {umkm.category}
              </p>
              <p
                className="font-body mt-4"
                style={{ color: '#c9a87c', fontSize: 12 }}
              >
                {umkm.university}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


