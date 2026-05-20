import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GraduationCap, Users, Trophy } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { number: 5, label: 'Universitas' },
  { number: 10, label: 'UMKM Mitra' },
  { number: 10, label: 'Tim Mahasiswa' },
  { number: 3, label: 'Hari Kegiatan' },
]

const cards = [
  {
    icon: GraduationCap,
    title: 'Pelatihan Intensif',
    body: 'Materi dari praktisi bisnis, akademisi, dan perbankan mencakup model bisnis, company profile, fotografi produk, hingga akses pembiayaan KUR.',
  },
  {
    icon: Users,
    title: 'Pendampingan UMKM',
    body: 'Setiap tim mahasiswa mendampingi satu UMKM mitra untuk mengembangkan company profile, katalog produk, dan proposal pengembangan bisnis.',
  },
  {
    icon: Trophy,
    title: 'Kompetisi Bisnis',
    body: 'Dua kategori lomba: Company Profile & Katalog Produk serta Pengembangan Ide Bisnis UMKM dengan hadiah dan stimulus alat untuk pemenang.',
  },
]

export default function Program() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading
      gsap.from(headingRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })

      // Stats - count up
      const statEls = statsRef.current?.querySelectorAll('.stat-number')
      if (statEls) {
        statEls.forEach((el, i) => {
          const target = stats[i].number
          gsap.from(el, {
            textContent: 0,
            duration: 1.2,
            delay: i * 0.15,
            ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
            onUpdate: function () {
              el.textContent = Math.round(Number((el as HTMLElement).textContent || 0)).toString()
            },
          })
          // Set final value
          gsap.to(el, {
            textContent: target,
            duration: 1.2,
            delay: i * 0.15,
            ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          })
        })
      }

      // Cards
      const cardEls = cardsRef.current?.querySelectorAll('.program-card')
      if (cardEls) {
        gsap.from(cardEls, {
          y: 60,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="program"
      ref={sectionRef}
      className="w-full"
      style={{ background: '#2a2421', padding: 'clamp(64px, 12vw, 160px) 0 clamp(64px, 10vw, 120px)' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div ref={headingRef} className="mb-16 md:mb-20">
          <p
            className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4"
            style={{ color: '#c9a87c' }}
          >
            TENTANG PROGRAM
          </p>
          <h2
            className="font-display font-normal tracking-[-0.025em]"
            style={{
              color: '#f5f2ed',
              fontSize: 'clamp(40px, 5vw, 72px)',
              lineHeight: 1.1,
            }}
          >
            Babel Youthpreneur 2025
          </h2>
        </div>

        {/* Stats bar */}
        <div
          ref={statsRef}
          className="flex flex-wrap justify-between gap-6 py-8 mb-16 md:mb-20"
          style={{
            borderTop: '1px solid rgba(245,242,237,0.1)',
            borderBottom: '1px solid rgba(245,242,237,0.1)',
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <div
                className="stat-number font-display"
                style={{ color: '#f5f2ed', fontSize: 48, lineHeight: 1 }}
              >
                0
              </div>
              <div
                className="font-body text-sm font-medium mt-2 uppercase tracking-[0.1em]"
                style={{ color: 'rgba(245,242,237,0.45)' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <p
          className="font-body font-light leading-relaxed mb-16 md:mb-20"
          style={{
            color: 'rgba(245,242,237,0.6)',
            fontSize: 'clamp(18px, 1.8vw, 22px)',
            maxWidth: 640,
          }}
        >
          Program pemberdayaan kewirausahaan yang diinisiasi oleh Perwakilan Kementerian Keuangan Prov. Kep. Bangka Belitung
          untuk memperkuat ekosistem entrepreneur muda di Bangka Belitung
          melalui pelatihan, pendampingan, dan kompetisi bisnis.
        </p>

        {/* Cards */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {cards.map((card) => (
            <div
              key={card.title}
              className="program-card rounded-sm p-10 md:p-12"
              style={{ background: '#181614' }}
            >
              <card.icon
                size={48}
                strokeWidth={1.5}
                style={{ color: '#c9a87c' }}
              />
              <h3
                className="font-body font-semibold mt-8 mb-4 tracking-[-0.01em]"
                style={{ color: '#f5f2ed', fontSize: 24 }}
              >
                {card.title}
              </h3>
              <p
                className="font-body font-light leading-relaxed"
                style={{ color: 'rgba(245,242,237,0.6)', fontSize: 16, lineHeight: 1.7 }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

