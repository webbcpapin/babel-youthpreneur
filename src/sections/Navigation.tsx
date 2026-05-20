import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'

const navLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Evaluasi 2025', href: '/evaluasi' },
  { label: 'Rencana 2026', href: '/rencana-2026' },
  { label: 'Dokumentasi', href: '/dokumentasi' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (href: string) => {
    setMobileOpen(false)
    if (href.startsWith('/')) {
      navigate(href)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
        style={{
          background: 'rgba(13,11,10,0.9)',
          backdropFilter: scrolled ? 'blur(12px)' : 'blur(8px)',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'blur(8px)',
          height: 64,
        }}
      >
        <div className="flex items-center justify-between h-full px-6 md:px-12 max-w-[1400px] mx-auto">
          <button
            onClick={() => handleNav('/')}
            className="font-display text-lg tracking-normal"
            style={{ color: '#f5f2ed' }}
          >
            Babel Youthpreneur
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href
              return (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className="text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-300 hover:text-[#f5f2ed]"
                  style={{
                    color: isActive ? '#c9a87c' : 'rgba(245,242,237,0.6)',
                  }}
                >
                  {link.label}
                </button>
              )
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span
              className="block w-5 h-0.5 transition-all duration-300"
              style={{
                background: '#f5f2ed',
                transform: mobileOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-300"
              style={{
                background: '#f5f2ed',
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-300"
              style={{
                background: '#f5f2ed',
                transform: mobileOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
          style={{ background: '#0d0b0a' }}
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href
            return (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="text-2xl font-display transition-opacity duration-300"
                style={{
                  color: isActive ? '#c9a87c' : '#f5f2ed',
                }}
              >
                {link.label}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

