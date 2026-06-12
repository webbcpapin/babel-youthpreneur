import { supabase, supabaseConfigured } from '../lib/supabase';

interface Props {
  onDemoLogin: (email: string) => void;
}

export function AuthPanel({ onDemoLogin }: Props) {
  async function handleGoogleLogin() {
    if (!supabaseConfigured || !supabase) {
      onDemoLogin('admin@example.com');
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div>
          <p className="eyebrow">Babel Youthpreneur 2026</p>
          <h1>Monitoring System</h1>
          <p className="muted">
            Pusat monitoring program untuk panitia, dosen, mahasiswa, UMKM, dan juri: course, presensi QR, laporan mingguan, output, serta challenge.
          </p>
          <div className="auth-actions">
            <button className="primary" onClick={handleGoogleLogin}>Masuk dengan Google</button>
            {!supabaseConfigured && <span className="role-chip">Mode demo aktif</span>}
          </div>
          {!supabaseConfigured && (
            <div className="demo-box">
              <p>Pilih role untuk melihat pengalaman dashboard yang berbeda.</p>
              <div className="demo-grid">
                <button onClick={() => onDemoLogin('admin@example.com')}>Panitia</button>
                <button onClick={() => onDemoLogin('dosen1@example.com')}>Dosen</button>
                <button onClick={() => onDemoLogin('mhs11@example.com')}>Mahasiswa</button>
                <button onClick={() => onDemoLogin('umkm1@example.com')}>UMKM</button>
                <button onClick={() => onDemoLogin('juri@example.com')}>Juri</button>
              </div>
            </div>
          )}
        </div>
        <aside className="auth-visual">
          <div>
            <span>Program Health</span>
            <strong>78%</strong>
          </div>
          <div className="checklist">
            <div className="check-row done"><span>Aktif</span><strong>10 Tim</strong><small>5 kampus</small></div>
            <div className="check-row done"><span>Valid</span><strong>Presensi QR</strong><small>foto + geotag</small></div>
            <div className="check-row"><span>Review</span><strong>Output UMKM</strong><small>challenge</small></div>
          </div>
        </aside>
      </section>
    </main>
  );
}
