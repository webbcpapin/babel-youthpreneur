import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const timelineData = [
  {
    date: '12 November 2025',
    label: 'Hari Pertama',
    location: 'CORDELA HOTEL, PANGKALPINANG',
    title: 'Pembukaan & Pembekalan',
    body: 'Registrasi peserta, sambutan Kepala Perwakilan Kemenkeu, pengenalan UMKM mitra dan pembagian tim. Materi: Sinergi Kemenkeu dalam Pemberdayaan UMKM, Model Bisnis & Company Profile, Fotografi Produk, dan Pengembangan Ide Bisnis.',
    left: '10%',
  },
  {
    date: '13 November 2025',
    label: 'Hari Kedua',
    location: 'AULA KANWIL DJPB BABEL',
    title: 'Green Economy & Akses Pembiayaan',
    body: 'Green Economy Summit dengan materi revitalisasi lada Bangka Belitung. Sesi pembiayaan: peluang KUR BRI untuk mahasiswa dan UMKM, panduan praktis persyaratan dan pengajuan.',
    left: '50%',
  },
  {
    date: '17 Desember 2025',
    label: 'Hari Ketiga',
    location: 'AULA KANWIL DJPB BABEL',
    title: 'Presentasi & Penutupan',
    body: 'Para tim mahasiswa mempresentasikan hasil pendampingan UMKM di hadapan dewan juri. Penyerahan hadiah pemenang lomba dan stimulus alat kepada UMKM binaan.',
    left: '90%',
  },
]

export default function Timeline() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Progress line
      if (progressRef.current) {
        gsap.fromTo(
          progressRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: timelineRef.current,
              start: 'top 60%',
              end: 'bottom 40%',
              scrub: true,
            },
          }
        )
      }

      // Cards
      const cards = timelineRef.current?.querySelectorAll('.timeline-card')
      if (cards) {
        gsap.from(cards, {
          y: 40,
          opacity: 0,
          stagger: 0.2,
          ease: 'none',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 60%',
            end: 'bottom 40%',
            scrub: true,
          },
        })
      }

      // Dots
      const dots = timelineRef.current?.querySelectorAll('.timeline-dot')
      if (dots) {
        dots.forEach((dot, i) => {
          const positions = [0.1, 0.5, 0.9]
          gsap.fromTo(
            dot,
            { scale: 1, background: '#0d0b0a' },
            {
              scale: 1.2,
              background: '#c9a87c',
              boxShadow: '0 0 20px rgba(201,168,124,0.4)',
              ease: 'none',
              scrollTrigger: {
                trigger: timelineRef.current,
                start: `top ${100 - positions[i] * 60}%`,
                end: `top ${100 - positions[i] * 60 + 10}%`,
                scrub: true,
              },
            }
          )
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="timeline"
      ref={sectionRef}
      className="w-full"
      style={{
        background: '#0d0b0a',
        padding: 'clamp(64px, 12vw, 160px) 0',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 mb-16 md:mb-20">
        <p
          className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4"
          style={{ color: '#c9a87c' }}
        >
          LINIMASA KEGIATAN
        </p>
        <h2
          className="font-display font-normal tracking-[-0.025em]"
          style={{
            color: '#f5f2ed',
            fontSize: 'clamp(40px, 5vw, 72px)',
            lineHeight: 1.1,
          }}
        >
          Tiga Hari yang Mengubah
        </h2>
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="relative mx-auto px-6 md:px-12"
        style={{ maxWidth: 1200, height: 500 }}
      >
        {/* Progress line background */}
        <div
          className="absolute left-0 right-0 h-0.5"
          style={{
            top: 52,
            background: 'rgba(245,242,237,0.08)',
          }}
        />

        {/* Active progress line */}
        <div
          ref={progressRef}
          className="absolute left-0 right-0 h-0.5 origin-left"
          style={{
            top: 52,
            background: 'linear-gradient(90deg, #c9a87c, #4a7c59)',
            transformOrigin: 'left center',
          }}
        />

        {/* Dots and labels */}
        {timelineData.map((item, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: item.left,
              top: 44,
              transform: 'translateX(-50%)',
            }}
          >
            <div
              className="timeline-dot w-4 h-4 rounded-full border-2 transition-colors"
              style={{
                borderColor: '#c9a87c',
                background: '#0d0b0a',
              }}
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 mt-4 text-center whitespace-nowrap"
            >
              <p
                className="font-body text-sm"
                style={{ color: '#c9a87c' }}
              >
                {item.date}
              </p>
              <p
                className="font-body text-xs uppercase tracking-[0.1em] mt-1"
                style={{ color: 'rgba(245,242,237,0.45)' }}
              >
                {item.label}
              </p>
            </div>
          </div>
        ))}

        {/* Content cards */}
        {timelineData.map((item, i) => (
          <div
            key={`card-${i}`}
            className="timeline-card absolute"
            style={{
              left: item.left,
              bottom: 0,
              transform: 'translateX(-50%)',
              width: 'clamp(280px, 30vw, 340px)',
            }}
          >
            <div
              className="p-8 md:p-10 rounded-sm"
              style={{
                background: '#181614',
                borderTop: '3px solid #c9a87c',
              }}
            >
              <p
                className="font-body text-xs font-semibold uppercase tracking-[0.12em] mb-3"
                style={{ color: 'rgba(245,242,237,0.45)' }}
              >
                {item.location}
              </p>
              <h3
                className="font-body font-semibold tracking-[-0.01em] mb-4"
                style={{ color: '#f5f2ed', fontSize: 22 }}
              >
                {item.title}
              </h3>
              <p
                className="font-body font-light leading-relaxed"
                style={{ color: 'rgba(245,242,237,0.6)', fontSize: 15, lineHeight: 1.7 }}
              >
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

