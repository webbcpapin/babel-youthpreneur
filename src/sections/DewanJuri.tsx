import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const juri = [
  {
    name: 'Agustinus Prasetyo',
    role: 'Kabid PPA I, Kanwil DJPb Babel',
    image: './images/juri-agustinus.jpg',
  },
  {
    name: 'Mariany Bunawan',
    role: 'Owner Waroeng Tung Tau',
    image: './images/narsum-mariany.jpeg',
  },
  {
    name: 'Rina Trisella',
    role: 'Dir. Aset dan Umum, EL JOHN INDONESIA',
    image: './images/juri-rina.jpeg',
  },
  {
    name: 'Elfirman Yusuf Sebayang',
    role: 'Kasubag Umum, KPP Bea Cukai Pangkalpinang',
    image: './images/juri-elfirman.jpg',
  },
]

const host = [
  { name: 'Imadella Tasya Eartam', image: './images/mc-imadelia.png' },
  { name: 'Andra Feronia Vandi', image: './images/mc-andra.png' },
]

export default function DewanJuri() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = sectionRef.current?.querySelectorAll('.juri-card')
      if (items) {
        gsap.from(items, {
          y: 40, opacity: 0, stagger: 0.1, duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none none' },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="juri"
      ref={sectionRef}
      className="w-full"
      style={{ background: '#2a2421', padding: 'clamp(64px, 12vw, 160px) 0' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#c9a87c' }}>
          CLOSING PROGRAM 17 DESEMBER 2025
        </p>
        <h2
          className="font-display font-normal tracking-[-0.025em] mb-4"
          style={{ color: '#f5f2ed', fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 1.1 }}
        >
          Dewan Juri
        </h2>
        <p
          className="font-body font-light mb-12 md:mb-16"
          style={{ color: 'rgba(245,242,237,0.6)', fontSize: 18, maxWidth: 560, lineHeight: 1.7 }}
        >
          Para profesional yang menilai hasil karya mahasiswa dalam kompetisi Babel Youthpreneur 2025.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {juri.map((person) => (
            <div key={person.name} className="juri-card text-center">
              <div
                className="rounded-full overflow-hidden mx-auto mb-5"
                style={{ width: 140, height: 140, background: '#181614' }}
              >
                <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-body font-semibold" style={{ color: '#f5f2ed', fontSize: 16 }}>{person.name}</h3>
              <p className="font-body font-light mt-1" style={{ color: 'rgba(245,242,237,0.45)', fontSize: 13 }}>{person.role}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-6" style={{ color: '#8b7355' }}>Host</p>
          <div className="flex justify-center gap-8">
            {host.map((h) => (
              <div key={h.name} className="juri-card text-center">
                <div className="rounded-full overflow-hidden mx-auto mb-3" style={{ width: 100, height: 100, background: '#181614' }}>
                  <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                </div>
                <p className="font-body font-medium" style={{ color: '#f5f2ed', fontSize: 14 }}>{h.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


