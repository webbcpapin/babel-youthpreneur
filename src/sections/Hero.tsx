import DotField from './DotField'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden"
      style={{
        height: '100vh',
        minHeight: 700,
        maxHeight: 1200,
        background: '#0d0b0a',
      }}
    >
      <DotField />

      {/* Content overlay */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center"
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-center px-6" style={{ pointerEvents: 'auto' }}>
          <p
            className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-4"
            style={{ color: '#c9a87c' }}
          >
            BABEL YOUTHPRENEUR 2025
          </p>

          <h1
            className="font-display font-normal leading-[1.1] tracking-[-0.02em] mx-auto"
            style={{
              color: '#f5f2ed',
              fontSize: 'clamp(36px, 5vw, 64px)',
              maxWidth: 700,
            }}
          >
            Membangun Ekosistem Entrepreneur Muda sebagai Penggerak Ekonomi Daerah
          </h1>

          <p
            className="font-body font-light mx-auto mt-5"
            style={{
              color: 'rgba(245,242,237,0.6)',
              fontSize: 'clamp(15px, 1.5vw, 18px)',
              maxWidth: 520,
              lineHeight: 1.7,
            }}
          >
            Program pemberdayaan kewirausahaan oleh Perwakilan Kementerian Keuangan Prov. Kep. Bangka Belitung
          </p>

          <div className="mt-8 inline-block">
            <span
              className="font-body text-xs font-semibold uppercase tracking-[0.08em] inline-block"
              style={{
                color: '#f5f2ed',
                border: '1px solid rgba(245,242,237,0.2)',
                borderRadius: 100,
                padding: '10px 28px',
              }}
            >
              12 NOVEMBER &mdash; 17 DESEMBER 2025
            </span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <div
          className="w-px h-10 animate-fade-pulse"
          style={{ background: 'rgba(245,242,237,0.3)' }}
        />
        <span
          className="font-body text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: 'rgba(245,242,237,0.3)' }}
        >
          Scroll
        </span>
      </div>
    </section>
  )
}

