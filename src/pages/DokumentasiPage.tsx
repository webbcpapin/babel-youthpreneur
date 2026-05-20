import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navigation from '../sections/Navigation'
import Footer from '../sections/Footer'

gsap.registerPlugin(ScrollTrigger)

const agendaGaleri = [
  {
    title: 'Babel Youthpreneur',
    subtitle: 'Rangkaian pembukaan dan pengenalan program',
    photos: [
      { src: '/images/doc-opening-1.jpg', alt: 'Dokumentasi Babel Youthpreneur 1', caption: 'Pembukaan rangkaian Babel Youthpreneur' },
      { src: '/images/doc-opening-2.jpg', alt: 'Dokumentasi Babel Youthpreneur 2', caption: 'Kolaborasi peserta, mitra, dan Kemenkeu Satu Babel' },
      { src: '/images/doc-opening-3.jpg', alt: 'Dokumentasi Babel Youthpreneur 3', caption: 'Antusiasme peserta dalam sesi awal program' },
    ],
  },
  {
    title: 'Green Economy',
    subtitle: 'Penguatan wawasan usaha berkelanjutan',
    photos: [
      { src: '/images/doc-green-1.jpg', alt: 'Dokumentasi Green Economy 1', caption: 'Sesi materi Green Economy' },
      { src: '/images/doc-green-2.jpg', alt: 'Dokumentasi Green Economy 2', caption: 'Diskusi pengembangan usaha berkelanjutan' },
      { src: '/images/doc-green-3.jpg', alt: 'Dokumentasi Green Economy 3', caption: 'Pendampingan ide bisnis ramah lingkungan' },
    ],
  },
  {
    title: 'Pembiayaan KUR',
    subtitle: 'Pembekalan akses permodalan untuk UMKM',
    photos: [
      { src: '/images/doc-kur-1.jpg', alt: 'Dokumentasi Pembiayaan KUR 1', caption: 'Pembekalan peluang pembiayaan KUR' },
      { src: '/images/doc-kur-2.jpg', alt: 'Dokumentasi Pembiayaan KUR 2', caption: 'Diskusi akses permodalan bagi UMKM' },
      { src: '/images/doc-kur-3.jpg', alt: 'Dokumentasi Pembiayaan KUR 3', caption: 'Interaksi peserta dalam sesi pembiayaan' },
    ],
  },
  {
    title: 'Closing Ceremony',
    subtitle: 'Apresiasi karya dan penutupan program',
    photos: [
      { src: '/images/doc-closing-1.jpg', alt: 'Dokumentasi Closing Ceremony 1', caption: 'Closing Ceremony Babel Youthpreneur 2025' },
      { src: '/images/doc-closing-2.jpg', alt: 'Dokumentasi Closing Ceremony 2', caption: 'Apresiasi karya dan prestasi peserta' },
      { src: '/images/doc-closing-3.jpg', alt: 'Dokumentasi Closing Ceremony 3', caption: 'Momen penutupan bersama mitra dan peserta' },
    ],
  },
]

export default function DokumentasiPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    const ctx = gsap.context(() => {
      const items = pageRef.current?.querySelectorAll('.doc-item')
      if (items && items.length > 0) {
        gsap.from(items, { y: 40, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: items[0], start: 'top 85%', toggleActions: 'play none none none' } })
      }
    }, pageRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={pageRef} className="relative" style={{ background: '#0d0b0a' }}>
      <Navigation />

      <section className="relative w-full flex items-center justify-center" style={{ minHeight: 450, paddingTop: 140 }}>
        <div className="text-center px-6 max-w-[800px] mx-auto">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>GALERI &amp; DOKUMENTASI</p>
          <h1 className="font-display font-normal tracking-[-0.025em]" style={{ color: '#f5f2ed', fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 1.1 }}>Dokumentasi Kegiatan</h1>
          <p className="font-body font-light mx-auto mt-5" style={{ color: 'rgba(245,242,237,0.6)', fontSize: 18, maxWidth: 600, lineHeight: 1.7 }}>
            Dokumentasi resmi dari folder kegiatan Babel Youthpreneur 2025, ditata per agenda agar alur program lebih mudah diikuti.
          </p>
        </div>
      </section>

      <section className="w-full" style={{ background: '#2a2421', padding: 'clamp(64px, 10vw, 140px) 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 space-y-20">
          {agendaGaleri.map((agenda, agendaIndex) => (
            <div key={agenda.title} className="doc-item">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: '#c9a87c' }}>Agenda {String(agendaIndex + 1).padStart(2, '0')}</p>
                  <h2 className="font-display font-normal tracking-[-0.02em]" style={{ color: '#f5f2ed', fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: 1.1 }}>{agenda.title}</h2>
                </div>
                <p className="font-body font-light" style={{ color: 'rgba(245,242,237,0.55)', fontSize: 15, maxWidth: 360, lineHeight: 1.7 }}>{agenda.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {agenda.photos.map((foto) => (
                  <button key={foto.src} type="button" className="doc-item text-left rounded-sm overflow-hidden cursor-pointer group relative" onClick={() => setLightbox(foto.src)}>
                    <div className="relative" style={{ aspectRatio: '4 / 3', background: '#181614' }}>
                      <img src={foto.src} alt={foto.alt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                      <p className="absolute left-5 right-5 bottom-5 font-body font-semibold text-sm" style={{ color: '#f5f2ed', lineHeight: 1.5 }}>{foto.caption}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer" style={{ background: 'rgba(13,11,10,0.95)', backdropFilter: 'blur(10px)' }} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Dokumentasi" className="max-w-[90vw] max-h-[90vh] object-contain rounded-sm" />
          <button className="absolute top-6 right-6 font-body text-2xl" style={{ color: '#f5f2ed' }} onClick={() => setLightbox(null)}>&times;</button>
        </div>
      )}
    </div>
  )
}
