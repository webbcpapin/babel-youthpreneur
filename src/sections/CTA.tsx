import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function CTA() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const els = contentRef.current?.querySelectorAll('.cta-animate')
      if (els) {
        gsap.from(els, {
          y: 30,
          opacity: 0,
          stagger: 0.2,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
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
      id="cta"
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        height: '70vh',
        minHeight: 500,
      }}
    >
      {/* Background image */}
      <img
        src="./images/cta-bg.jpg"
        alt="Bangka Belitung"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.25)' }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(13,11,10,0.7), rgba(13,11,10,0.9))',
        }}
      />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 md:px-12"
      >
        <p
          className="cta-animate font-body text-xs font-semibold uppercase tracking-[0.18em] mb-6"
          style={{ color: '#c9a87c' }}
        >
          BERSAMA MEMBANGUN EKONOMI
        </p>

        <h2
          className="cta-animate font-display font-normal tracking-[-0.02em] max-w-[700px]"
          style={{
            color: '#f5f2ed',
            fontSize: 'clamp(32px, 4vw, 64px)',
            lineHeight: 1.1,
          }}
        >
          Terus Menginspirasi, Terus Berkarya
        </h2>

        <p
          className="cta-animate font-body font-light leading-relaxed mt-6 max-w-[560px]"
          style={{ color: 'rgba(245,242,237,0.6)', fontSize: 16, lineHeight: 1.7 }}
        >
          Kolaborasi antara pemerintah, akademisi, pelaku usaha, dan generasi muda
          menjadi fondasi bagi lahirnya wirausaha-wirausaha muda yang tangguh,
          inovatif, dan berdaya saing di Bangka Belitung.
        </p>
      </div>
    </section>
  )
}


