import Navigation from '../sections/Navigation'
import Hero from '../sections/Hero'
import Program from '../sections/Program'
import Timeline from '../sections/Timeline'
import DokumentasiPreview from '../sections/DokumentasiPreview'
import Narasumber from '../sections/Narasumber'
import DewanJuri from '../sections/DewanJuri'
import UMKM from '../sections/UMKM'
import Hasil from '../sections/Hasil'
import LogoSection from '../sections/LogoSection'
import CTA from '../sections/CTA'
import Footer from '../sections/Footer'

export default function HomePage() {
  return (
    <div className="relative" style={{ background: '#0d0b0a' }}>
      <Navigation />
      <Hero />
      <Program />
      <Timeline />
      <DokumentasiPreview />
      <Narasumber />
      <DewanJuri />
      <UMKM />
      <Hasil />
      <LogoSection />
      <CTA />
      <Footer />
    </div>
  )
}



