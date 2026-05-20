export default function Footer() {
  return (
    <footer
      className="w-full"
      style={{
        background: '#0d0b0a',
        borderTop: '1px solid rgba(245,242,237,0.08)',
        padding: '64px 0',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Column 1 */}
          <div>
            <p
              className="font-display text-lg"
              style={{ color: '#f5f2ed' }}
            >
              Babel Youthpreneur
            </p>
            <p
              className="font-body font-light mt-4 leading-relaxed"
              style={{ color: 'rgba(245,242,237,0.45)', fontSize: 13, lineHeight: 1.7 }}
            >
              Sebuah inisiatif Perwakilan Kementerian Keuangan Prov. Kep. Bangka Belitung untuk membangun
              ekosistem wirausaha muda di Bangka Belitung.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <p
              className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-6"
              style={{ color: '#8b7355' }}
            >
              Informasi
            </p>
            <div className="flex flex-col gap-3">
              {['Tentang Program', 'UMKM Mitra', 'Dokumentasi'].map((link) => (
                <span
                  key={link}
                  className="font-body transition-colors duration-300 hover:text-[#f5f2ed] cursor-default"
                  style={{ color: 'rgba(245,242,237,0.6)', fontSize: 14 }}
                >
                  {link}
                </span>
              ))}
            </div>
          </div>

          {/* Column 3 */}
          <div>
            <p
              className="font-body text-xs font-semibold uppercase tracking-[0.18em] mb-6"
              style={{ color: '#8b7355' }}
            >
              Kontak
            </p>
            <div className="flex flex-col gap-3">
              <span
                className="font-body"
                style={{ color: 'rgba(245,242,237,0.6)', fontSize: 14 }}
              >
                Perwakilan Kementerian Keuangan Prov. Kep. Bangka Belitung
              </span>
              <span
                className="font-body"
                style={{ color: 'rgba(245,242,237,0.6)', fontSize: 14 }}
              >
                Babel Youthpreneur 2025
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(245,242,237,0.08)' }}
        >
          <p
            className="font-body"
            style={{ color: 'rgba(245,242,237,0.45)', fontSize: 13 }}
          >
            &copy; 2025 Kementerian Keuangan Republik Indonesia
          </p>
          <p
            className="font-body"
            style={{ color: 'rgba(245,242,237,0.45)', fontSize: 13 }}
          >
            Dibangun dengan semangat pemberdayaan
          </p>
        </div>
      </div>
    </footer>
  )
}



