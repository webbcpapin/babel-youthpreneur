import type { PropsWithChildren } from 'react';
import type { AppUser } from '../lib/types';

interface Props {
  profile: AppUser;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const navItems = [
  { tab: 'Dashboard', label: 'Dashboard', icon: 'D' },
  { tab: 'Course', label: 'Course', icon: 'C' },
  { tab: 'Presensi', label: 'Presensi', icon: 'P' },
  { tab: 'Laporan', label: 'Laporan Mingguan', icon: 'L' },
  { tab: 'Output', label: 'Output', icon: 'O' },
  { tab: 'Nilai', label: 'Challenge', icon: 'N' },
  { tab: 'Export', label: 'Report Export', icon: 'R' },
];

const pageCopy: Record<string, string> = {
  Dashboard: 'Visual Monitoring',
  Course: 'Course Pelatihan',
  Presensi: 'Attendance Center',
  Laporan: 'Laporan Mingguan',
  Output: 'Output UMKM',
  Nilai: 'Challenge Scoring',
  Export: 'Pusat Laporan',
};

const roleLabel: Record<AppUser['role'], string> = {
  admin: 'Panitia',
  dosen: 'Dosen Pendamping',
  mahasiswa: 'Mahasiswa',
  umkm: 'UMKM',
  juri: 'Juri',
};

export function Layout({ profile, activeTab, setActiveTab, onLogout, children }: PropsWithChildren<Props>) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">BY</div>
          <div>
            <p className="eyebrow">Babel Youthpreneur</p>
            <h2>Monitoring System</h2>
          </div>
        </div>
        <nav className="side-nav" aria-label="Navigasi utama">
          {navItems.map((item) => (
            <button key={item.tab} className={activeTab === item.tab ? 'nav-active' : ''} onClick={() => setActiveTab(item.tab)}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="profile-box">
          <div className="avatar">{profile.name.slice(0, 2).toUpperCase()}</div>
          <strong>{profile.name}</strong>
          <span>{roleLabel[profile.role]}</span>
          <button onClick={onLogout}>Keluar</button>
        </div>
      </aside>
      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Workspace {roleLabel[profile.role]}</p>
            <h1>{pageCopy[activeTab] ?? activeTab}</h1>
          </div>
          <div className="topbar-actions">
            <label className="search-box" aria-label="Cari data monitoring">
              <span>Cari</span>
              <input placeholder="Tim, UMKM, kampus..." />
            </label>
            {profile.role === 'admin' && <button className="primary" onClick={() => setActiveTab('Presensi')}>Buat Presensi</button>}
            <button className="icon-button" aria-label="Notifikasi">N</button>
          </div>
        </header>
        {children}
      </section>
      <nav className="mobile-nav" aria-label="Navigasi mobile">
        {navItems.slice(0, 5).map((item) => (
          <button key={item.tab} className={activeTab === item.tab ? 'nav-active' : ''} onClick={() => setActiveTab(item.tab)}>
            <span>{item.icon}</span>
            {item.tab === 'Dashboard' ? 'Home' : item.tab}
          </button>
        ))}
      </nav>
    </div>
  );
}
