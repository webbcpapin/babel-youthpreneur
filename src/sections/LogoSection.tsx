import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const logos = [
  { src: '/images/logo-kemenkeu-final.png', name: 'Kementerian Keuangan', type: 'instansi' },
  { src: '/images/logo-djpb-final.jpeg', name: 'DJPb', type: 'instansi' },
  { src: '/images/logo-beacukai-final.png', name: 'Bea Cukai', type: 'instansi' },
  { src: '/images/logo-ubb-final.png', name: 'UBB', type: 'universitas' },
  { src: '/images/logo-iain-final.png', name: 'IAIN SAS', type: 'universitas' },
  { src: '/images/logo-pertiba-final.png', name: 'Universitas Pertiba', type: 'universitas' },
  { src: '/images/logo-unmuh-final.png', name: 'Unmuh Babel', type: 'universitas' },
  { src: '/images/logo-unaba-final.png', name: 'Unaba', type: 'universitas' },
  { src: '/images/logo-eljohn-final.png', name: 'EL JOHN', type: 'mitra' },
  { src: '/images/logo-tungtau-final.jpeg', name: 'Waroeng Tung Tau', type: 'mitra' },
]

export default function LogoSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = sectionRef.current?.querySelectorAll('.logo-item')
      if (items) {
        gsap.from(items, {
          opacity: 0, scale: 0.9, stagger: 0.06, duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none none' },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="w-full"
      style={{ background: '#0d0b0a', padding: 'clamp(48px, 8vw, 120px) 0' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center">
        <p
          className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-8"
          style={{ color: '#8b7355' }}
        >
          DIDUKUNG OLEH
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 items-start gap-5 md:gap-6">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="logo-item flex flex-col items-center gap-2"
              title={logo.name}
            >
              <div
                className="flex items-center justify-center rounded-sm p-3"
                style={{
                  width: 72,
                  height: 72,
                  background: 'rgba(245,242,237,0.03)',
                }}
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain"
                  style={{ filter: 'brightness(0.9)' }}
                />
              </div>
              <span
                className="font-body font-light"
                style={{ color: 'rgba(245,242,237,0.4)', fontSize: 11 }}
              >
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


