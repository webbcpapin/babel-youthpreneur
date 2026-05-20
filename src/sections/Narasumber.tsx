import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const speakers = [
  {
    name: 'Junanto Kurniawan',
    role: 'Ketua Pokja Teknis UMKM, Kepala Bea Cukai Pangkalpinang',
    topic: 'Sinergi Kemenkeu dalam Pemberdayaan UMKM \u2014 kolaborasi lintas unit Kemenkeu untuk mendukung pengembangan UMKM berkelanjutan.',
    image: './images/narsum-junanto.jpeg',
  },
  {
    name: 'Fahry Reza, S.E., M.Ak.',
    role: 'Dekan Fakultas Bisnis Unmuh',
    topic: 'Model Bisnis, Company Profile dan Strategi Pengembangan UMKM \u2014 penerapan model bisnis untuk meningkatkan daya saing UMKM.',
    image: './images/narsum-fahry.jpeg',
  },
  {
    name: 'Cento Sadewa',
    role: 'Creative Director, MNJD Creative',
    topic: 'Product Catalog, Foto dan Video Promosi \u2014 teknik fotografi dan videografi untuk konten promosi produk UMKM yang profesional.',
    image: './images/narsum-cento.jpeg',
  },
  {
    name: 'Mariany Bunawan',
    role: 'Owner Waroeng Tung Tau',
    topic: 'Pengembangan Ide Bisnis Kreatif \u2014 pengalaman membangun bisnis dari nol: Waroeng Tung Tau dan Sumo Suki, serta hosting podcast OTT.',
    image: './images/narsum-mariany.jpeg',
  },
  {
    name: 'Enti Hidayati',
    role: 'Content Creator',
    topic: 'Pengembangan Ide Bisnis Kreatif dan Strategi Promosi \u2014 creative thinking dan inovasi untuk menghasilkan ide bisnis yang relevan dan bernilai tambah.',
    image: './images/narsum-enti.jpg',
  },
  {
    name: 'Dona Andrianto',
    role: 'Perwakilan BRI Cabang Pangkalpinang',
    topic: 'Peluang Pembiayaan KUR \u2014 panduan praktis akses Kredit Usaha Rakyat bagi mahasiswa dan UMKM.',
    image: './images/speaker-6.jpg',
  },
]

export default function Narasumber() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragState = useRef({ startX: 0, scrollLeft: 0 })

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = trackRef.current?.querySelectorAll('.speaker-card')
      if (cards) {
        gsap.from(cards, {
          x: 60, opacity: 0, stagger: 0.1, duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none none' },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!trackRef.current) return
    setIsDragging(true)
    dragState.current.startX = e.clientX
    dragState.current.scrollLeft = trackRef.current.scrollLeft
    trackRef.current.setPointerCapture(e.pointerId)
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !trackRef.current) return
    trackRef.current.scrollLeft = dragState.current.scrollLeft - (e.clientX - dragState.current.startX) * 1.5
  }
  const handlePointerUp = () => setIsDragging(false)

  return (
    <section
      id="narasumber"
      ref={sectionRef}
      className="w-full"
      style={{ background: '#0d0b0a', padding: 'clamp(64px, 12vw, 160px) 0' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 mb-12 md:mb-16">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>PEMBICARA</p>
        <h2 className="font-display font-normal tracking-[-0.025em]" style={{ color: '#f5f2ed', fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 1.1 }}>
          Narasumber Inspiratif
        </h2>
        <p className="font-body font-light leading-relaxed mt-5" style={{ color: 'rgba(245,242,237,0.6)', fontSize: 'clamp(16px, 1.5vw, 20px)', maxWidth: 560, lineHeight: 1.7 }}>
          Para praktisi, akademisi, dan profesional yang berbagi ilmu dan pengalaman dalam membangun dan mengembangkan usaha.
        </p>
      </div>

      <div
        ref={trackRef}
        className="flex gap-8 overflow-x-auto px-6 md:px-12 pb-4 select-none"
        style={{ cursor: isDragging ? 'grabbing' : 'grab', scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {speakers.map((speaker) => (
          <div key={speaker.name} className="speaker-card flex-shrink-0" style={{ width: 300, scrollSnapAlign: 'start' }}>
            <div className="rounded-sm overflow-hidden" style={{ width: 300, height: 360, background: '#181614' }}>
              <img src={speaker.image} alt={speaker.name} className="w-full h-full object-cover" draggable={false} />
            </div>
            <div className="pt-6">
              <h3 className="font-body font-semibold tracking-[-0.01em]" style={{ color: '#f5f2ed', fontSize: 22 }}>{speaker.name}</h3>
              <p className="font-body mt-2" style={{ color: '#c9a87c', fontSize: 14 }}>{speaker.role}</p>
              <p className="font-body font-light mt-3 leading-relaxed" style={{ color: 'rgba(245,242,237,0.45)', fontSize: 14, lineHeight: 1.6 }}>{speaker.topic}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}


