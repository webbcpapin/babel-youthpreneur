import Navigation from '../sections/Navigation'
import Program from '../sections/Program'
import Timeline from '../sections/Timeline'
import DokumentasiPreview from '../sections/DokumentasiPreview'
import Narasumber from '../sections/Narasumber'
import DewanJuri from '../sections/DewanJuri'
import UMKM from '../sections/UMKM'
import Hasil from '../sections/Hasil'
import Footer from '../sections/Footer'

export default function Kegiatan2025Page() {
  return <div style={{ background: '#0d0b0a' }}>
    <Navigation />
    <main>
      <header className="archive25-header">
        <div className="archive25-inner">
          <p>Arsip Program</p>
          <h1>Babel Youthpreneur 2025</h1>
          <span>Kegiatan, narasumber, UMKM mitra, serta hasil karya peserta edisi 2025.</span>
        </div>
      </header>
      <Program />
      <Timeline />
      <DokumentasiPreview />
      <Narasumber />
      <DewanJuri />
      <UMKM />
      <Hasil />
      <section className="archive25-links"><div className="archive25-inner">
        <a href="#/evaluasi">Baca Evaluasi 2025</a>
        <a href="#/dokumentasi">Lihat Dokumentasi 2025</a>
      </div></section>
    </main>
    <Footer />
  </div>
}
