import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const moments = [
  { src: './images/doc-opening-1.jpg', title: 'Opening Program', note: 'Babel Youthpreneur' },
  { src: './images/doc-green-2.jpg', title: 'Green Economy', note: 'Sesi edukasi' },
  { src: './images/doc-kur-1.jpg', title: 'Pembiayaan KUR', note: 'Akses permodalan' },
  { src: './images/doc-closing-2.jpg', title: 'Closing Ceremony', note: 'Apresiasi karya' },
]

export default function DokumentasiPreview() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = sectionRef.current?.querySelectorAll('.moment-item')
      if (items) {
        gsap.from(items, {
          y: 36,
          opacity: 0,
          stagger: 0.1,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', toggleActions: 'play none none none' },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="dokumentasi-preview"
      ref={sectionRef}
      className="w-full"
      style={{ background: '#181614', padding: 'clamp(64px, 10vw, 140px) 0' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12 md:mb-16">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>
              DOKUMENTASI KEGIATAN
            </p>
            <h2 className="font-display font-normal tracking-[-0.025em]" style={{ color: '#f5f2ed', fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 1.1 }}>
              Momen Program
            </h2>
          </div>
          <a
            href="/dokumentasi"
            className="font-body text-xs font-semibold uppercase tracking-[0.12em] inline-flex items-center"
            style={{ color: '#c9a87c' }}
          >
            Lihat galeri lengkap
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
          {moments.map((moment, index) => (
            <a
              key={moment.src}
              href="/dokumentasi"
              className="moment-item group relative overflow-hidden rounded-sm"
              style={{ minHeight: index === 0 ? 420 : 260 }}
            >
              <img src={moment.src} alt={moment.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,11,10,0.82), rgba(13,11,10,0.08))' }} />
              <div className="absolute left-5 right-5 bottom-5">
                <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#c9a87c' }}>{moment.note}</p>
                <h3 className="font-body font-semibold" style={{ color: '#f5f2ed', fontSize: 20 }}>{moment.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

