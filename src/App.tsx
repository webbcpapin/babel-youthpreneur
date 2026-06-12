import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { AuthPanel } from './components/AuthPanel';
import { Layout } from './components/Layout';
import { challengeCategories, outputChecklist } from './lib/constants';
import { createAttendance, createOutput, createScore, createWeeklyReport, getCurrentProfile, getDashboardData } from './lib/data';
import { supabase, supabaseConfigured } from './lib/supabase';
import { getDeviceFingerprint, requestAttendanceToken, submitSecureAttendance } from './lib/attendanceSecurity';
import type { AppUser, ChallengeCategory, DashboardData, OutputItem, OutputType, SessionRow, Team } from './lib/types';
import './styles.css';

type Tone = 'blue' | 'teal' | 'yellow' | 'orange' | 'green' | 'red' | 'gray';

const roleTitle: Record<AppUser['role'], string> = {
  admin: 'Panitia',
  dosen: 'Dosen Pendamping',
  mahasiswa: 'Mahasiswa',
  umkm: 'Pelaku UMKM',
  juri: 'Juri Challenge',
};

const phases = ['Kurasi', 'Pelatihan', 'Pendampingan', 'Final Challenge', 'Evaluasi'];

export default function App() {
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        if (supabaseConfigured && supabase) {
          const { data: sessionData } = await supabase.auth.getSession();
          const email = sessionData.session?.user.email;
          if (email) {
            const userProfile = await getCurrentProfile(email);
            setProfile(userProfile);
          }
          supabase.auth.onAuthStateChange(async (_event, session) => {
            const userProfile = await getCurrentProfile(session?.user.email);
            setProfile(userProfile);
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat aplikasi.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!profile) return;
    getDashboardData(profile)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat data.'));
  }, [profile]);

  async function demoLogin(email: string) {
    const userProfile = await getCurrentProfile(email);
    setProfile(userProfile);
  }

  async function logout() {
    if (supabaseConfigured && supabase) await supabase.auth.signOut();
    setProfile(null);
    setData(null);
  }

  if (loading) return <LoadingSkeleton />;
  if (!profile) return <AuthPanel onDemoLogin={demoLogin} />;
  if (!data) return <LoadingSkeleton label="Memuat data monitoring..." />;

  const refresh = () => getDashboardData(profile).then(setData);

  return (
    <Layout profile={profile} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout}>
      {error && <Toast tone="red" message={error} />}
      {activeTab === 'Dashboard' && <Dashboard data={data} profile={profile} setActiveTab={setActiveTab} />}
      {activeTab === 'Course' && <CourseView data={data} profile={profile} />}
      {activeTab === 'Presensi' && <AttendanceView data={data} profile={profile} refresh={refresh} />}
      {activeTab === 'Laporan' && <ReportView data={data} profile={profile} refresh={refresh} />}
      {activeTab === 'Output' && <OutputView data={data} profile={profile} refresh={refresh} />}
      {activeTab === 'Nilai' && <ScoreView data={data} profile={profile} refresh={refresh} />}
      {activeTab === 'Export' && <ExportView data={data} profile={profile} />}
    </Layout>
  );
}

function Dashboard({ data, profile, setActiveTab }: { data: DashboardData; profile: AppUser; setActiveTab: (tab: string) => void }) {
  if (profile.role === 'dosen') return <LecturerDashboard data={data} profile={profile} setActiveTab={setActiveTab} />;
  if (profile.role === 'mahasiswa') return <StudentDashboard data={data} profile={profile} setActiveTab={setActiveTab} />;
  if (profile.role === 'umkm') return <UmkmDashboard data={data} profile={profile} setActiveTab={setActiveTab} />;
  if (profile.role === 'juri') return <JuryDashboard data={data} profile={profile} setActiveTab={setActiveTab} />;
  return <AdminDashboard data={data} setActiveTab={setActiveTab} />;
}

function AdminDashboard({ data, setActiveTab }: { data: DashboardData; setActiveTab: (tab: string) => void }) {
  const metrics = useMemo(() => getMetrics(data), [data]);
  const criticalTeams = data.teams.filter((team) => team.status !== 'aman');

  return (
    <div className="monitoring-page">
      <section className="hero-monitor">
        <div>
          <p className="eyebrow">Command Center</p>
          <h2>Babel Youthpreneur 2026</h2>
          <p>Monitoring program, course, presensi, pendampingan UMKM, dan challenge dalam satu layar yang siap dipakai rapat.</p>
        </div>
        <div className="hero-score">
          <span>Progress Program</span>
          <strong>{metrics.avgProgress}%</strong>
          <Progress value={metrics.avgProgress} />
        </div>
      </section>

      <section className="stat-grid executive">
        <MetricCard label="Total Kampus" value={data.campuses.length} hint="Mitra program" tone="blue" />
        <MetricCard label="Total Tim" value={data.teams.length} hint="2 tim per kampus" tone="teal" />
        <MetricCard label="Total Mahasiswa" value={metrics.students.length} hint="3 mahasiswa per tim" tone="green" />
        <MetricCard label="Total UMKM" value={data.umkms.length} hint="UMKM dampingan" tone="orange" />
        <MetricCard label="Presensi Valid" value={`${metrics.attendanceRate}%`} hint={`${data.attendance.length}/${metrics.attendanceTarget} rekaman`} tone="blue" />
        <MetricCard label="Laporan Masuk" value={`${metrics.reportRate}%`} hint={`${data.weeklyReports.length} laporan`} tone="teal" />
        <MetricCard label="Output Selesai" value={`${metrics.outputRate}%`} hint={`${data.outputs.length} output`} tone="yellow" />
        <MetricCard label="Link Bermasalah" value={metrics.linkProblems} hint="Perlu dicek panitia" tone={metrics.linkProblems ? 'red' : 'gray'} />
      </section>

      <div className="dashboard-grid">
        <ProgramPhaseCard progress={metrics.avgProgress} />
        <TeamHealth data={data} />
      </div>

      {criticalTeams.length > 0 && (
        <section className="insight-strip">
          <div>
            <strong>{criticalTeams.length} tim perlu perhatian panitia.</strong>
            <span>Prioritaskan validasi laporan, cek output, dan hubungi dosen pendamping.</span>
          </div>
          <button onClick={() => setActiveTab('Laporan')}>Buka Laporan</button>
        </section>
      )}

      <TeamMonitoringBoard data={data} title="Monitoring Tim Program" />
    </div>
  );
}

function LecturerDashboard({ data, profile, setActiveTab }: { data: DashboardData; profile: AppUser; setActiveTab: (tab: string) => void }) {
  const campus = data.campuses.find((item) => item.id === profile.campus_id);
  const metrics = getMetrics(data);

  return (
    <div className="monitoring-page">
      <section className="hero-monitor compact-hero">
        <div>
          <p className="eyebrow">Dashboard Dosen</p>
          <h2>{campus?.name ?? 'Kampus Pendamping'}</h2>
          <p>Fokus pada tim kampus sendiri: progres, presensi mahasiswa, laporan mingguan, dan output yang perlu divalidasi.</p>
        </div>
        <button className="primary" onClick={() => setActiveTab('Laporan')}>Beri Catatan</button>
      </section>

      <section className="stat-grid three">
        <MetricCard label="Tim Kampus" value={data.teams.length} hint="Dalam pendampingan" tone="blue" />
        <MetricCard label="Presensi" value={`${metrics.attendanceRate}%`} hint="Mahasiswa kampus ini" tone="green" />
        <MetricCard label="Laporan Mingguan" value={data.weeklyReports.length} hint="Perlu review berkala" tone="yellow" />
      </section>

      <div className="team-card-grid">
        {data.teams.map((team) => <TeamFocusCard key={team.id} data={data} team={team} />)}
      </div>
      <TeamMonitoringBoard data={data} title="Tim Binaan Kampus" />
    </div>
  );
}

function StudentDashboard({ data, profile, setActiveTab }: { data: DashboardData; profile: AppUser; setActiveTab: (tab: string) => void }) {
  const team = data.teams.find((item) => item.id === profile.team_id);
  const umkm = data.umkms.find((item) => item.id === team?.umkm_id);
  const nextSession = data.sessions[0];
  const outputs = data.outputs.filter((item) => item.team_id === team?.id);

  return (
    <div className="monitoring-page">
      <section className="hero-monitor compact-hero">
        <div>
          <p className="eyebrow">Ruang Tim Mahasiswa</p>
          <h2>{team?.name ?? 'Tim belum terhubung'}</h2>
          <p>{umkm ? `UMKM dampingan: ${umkm.business_name}.` : 'Lengkapi pairing tim untuk mulai monitoring output.'}</p>
        </div>
        <div className="hero-score">
          <span>Progress Tim</span>
          <strong>{team?.progress ?? 0}%</strong>
          <Progress value={team?.progress ?? 0} />
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-title"><h3>Tugas Minggu Ini</h3><span>Checklist output</span></div>
          <OutputChecklist outputs={outputs} />
        </section>
        <section className="panel">
          <div className="panel-title"><h3>Jadwal Berikutnya</h3><span>Course Juli</span></div>
          {nextSession ? (
            <CourseModuleCard session={nextSession} index={0} attendanceCount={data.attendance.filter((item) => item.session_id === nextSession.id).length} totalStudents={data.users.filter((user) => user.role === 'mahasiswa').length} />
          ) : <EmptyState title="Belum ada jadwal" body="Sesi pelatihan akan muncul setelah panitia mengaktifkan course." />}
          <button className="primary wide" onClick={() => setActiveTab('Presensi')}>Buka Presensi</button>
        </section>
      </div>
    </div>
  );
}

function UmkmDashboard({ data, profile, setActiveTab }: { data: DashboardData; profile: AppUser; setActiveTab: (tab: string) => void }) {
  const team = data.teams.find((item) => item.id === profile.team_id);
  const umkm = data.umkms.find((item) => item.id === profile.umkm_id || item.id === team?.umkm_id);
  const outputs = data.outputs.filter((item) => item.team_id === team?.id);

  return (
    <div className="monitoring-page">
      <section className="hero-monitor compact-hero">
        <div>
          <p className="eyebrow">Dashboard UMKM</p>
          <h2>{umkm?.business_name ?? profile.name}</h2>
          <p>{umkm?.priority_need ?? 'Pantau output pendampingan dan berikan feedback singkat untuk tim mahasiswa.'}</p>
        </div>
        <button className="primary" onClick={() => setActiveTab('Output')}>Beri Feedback</button>
      </section>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-title"><h3>Tim Pendamping</h3><span>{team?.name ?? '-'}</span></div>
          {team ? <TeamFocusCard data={data} team={team} /> : <EmptyState title="Tim belum dipasangkan" body="Data pairing UMKM akan muncul setelah panitia mengunci pembagian tim." />}
        </section>
        <section className="panel">
          <div className="panel-title"><h3>Output Terbaru</h3><span>{outputs.length} item</span></div>
          <OutputKanban outputs={outputs} />
        </section>
      </div>
    </div>
  );
}

function JuryDashboard({ data, profile, setActiveTab }: { data: DashboardData; profile: AppUser; setActiveTab: (tab: string) => void }) {
  const ranking = getRanking(data);
  const scoredCount = data.scores.filter((score) => score.judge_id === profile.id).length;

  return (
    <div className="monitoring-page">
      <section className="hero-monitor compact-hero">
        <div>
          <p className="eyebrow">Final Challenge</p>
          <h2>Gallery Output Tim</h2>
          <p>Lihat final output, cek status link, dan beri nilai berdasarkan rubrik challenge.</p>
        </div>
        <div className="hero-score">
          <span>Nilai Masuk</span>
          <strong>{scoredCount}</strong>
          <small>{challengeCategories.length} kategori rubrik</small>
        </div>
      </section>
      <section className="gallery-grid">
        {ranking.map(({ team, avg }) => <ChallengeTeamCard key={team.id} data={data} team={team} avg={avg} onScore={() => setActiveTab('Nilai')} />)}
      </section>
    </div>
  );
}

function CourseView({ data, profile }: { data: DashboardData; profile: AppUser }) {
  const totalStudents = Math.max(1, data.users.filter((u) => u.role === 'mahasiswa').length);

  return (
    <div className="monitoring-page">
      <section className="section-header">
        <div>
          <p className="eyebrow">Learning Path</p>
          <h2>Course Pelatihan Juli</h2>
          <p>Modul disusun sebagai alur belajar singkat untuk membantu tim mendampingi UMKM secara terstruktur.</p>
        </div>
        {profile.role === 'admin' && <span className="role-chip">Mode Panitia</span>}
      </section>
      <div className="course-list modern">
        {data.sessions.map((session, idx) => (
          <CourseModuleCard
            key={session.id}
            session={session}
            index={idx}
            attendanceCount={data.attendance.filter((item) => item.session_id === session.id).length}
            totalStudents={totalStudents}
          />
        ))}
      </div>
      {profile.role === 'admin' && <AdminSessionQr sessions={data.sessions} />}
    </div>
  );
}

function AttendanceView({ data, profile, refresh }: { data: DashboardData; profile: AppUser; refresh: () => void }) {
  const params = new URLSearchParams(window.location.search);
  const queryToken = params.get('attendanceToken') ?? params.get('attendance');
  const [token, setToken] = useState(queryToken ?? data.sessions[0]?.qr_token ?? '');
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const selectedSession = supabaseConfigured ? null : data.sessions.find((s) => s.qr_token === token);
  const attendanceStats = getAttendanceStats(data);

  async function capturePhoto() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach((track) => track.stop());
      setPhoto(canvas.toDataURL('image/jpeg', 0.85));
    } catch {
      setMessage('Kamera tidak dapat diakses. Pastikan browser memberi izin kamera.');
    }
  }

  async function getGeo() {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setMessage('Lokasi tidak dapat diakses. Pastikan GPS aktif.')
    );
  }

  async function submitAttendance() {
    if (!supabaseConfigured && !selectedSession) return setMessage('Token QR tidak valid.');
    if (supabaseConfigured && !token) return setMessage('Token QR dinamis wajib diisi dari hasil scan.');
    if (!photo) return setMessage('Foto wajib diambil.');
    if (!location) return setMessage('Geotag wajib diambil.');

    try {
      if (supabaseConfigured) {
        const result = await submitSecureAttendance({
          token,
          latitude: location.latitude,
          longitude: location.longitude,
          photoDataUrl: photo,
          scannedAt: new Date().toISOString(),
          deviceFingerprint: await getDeviceFingerprint(),
        });
        const distance = typeof result.distanceMeters === 'number' ? ` Jarak ${Math.round(result.distanceMeters)} meter.` : '';
        setMessage(`Presensi terkirim dengan status ${result.status}.${distance}`);
      } else if (selectedSession) {
        await createAttendance({
          session_id: selectedSession.id,
          user_id: profile.id,
          scanned_at: new Date().toISOString(),
          latitude: location.latitude,
          longitude: location.longitude,
          photo_url: photo,
          validation_status: 'pending_review',
          admin_note: null,
        });
        setMessage('Presensi demo terkirim. Menunggu validasi panitia.');
      }
      refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Gagal mengirim presensi.');
    }
  }

  return (
    <div className="monitoring-page">
      <section className="stat-grid attendance">
        <MetricCard label="Valid" value={attendanceStats.valid} hint="Sudah terverifikasi" tone="green" />
        <MetricCard label="Pending Review" value={attendanceStats.pending} hint="Butuh cek panitia" tone="yellow" />
        <MetricCard label="Flagged Location" value={attendanceStats.flagged} hint="Di luar radius" tone="orange" />
        <MetricCard label="Duplicate" value={attendanceStats.duplicate} hint="Percobaan ulang" tone="red" />
        <MetricCard label="Belum Hadir" value={attendanceStats.absent} hint="Estimasi target sesi" tone="gray" />
      </section>

      <div className="dashboard-grid">
        {profile.role === 'admin' ? <AdminSessionQr sessions={data.sessions} /> : (
          <section className="panel scan-card">
            <div className="panel-title">
              <h3>Scan Presensi</h3>
              <span>{supabaseConfigured ? 'QR dinamis' : 'Mode demo'}</span>
            </div>
            <ol className="step-list">
              <li><strong>Scan QR</strong><span>Token sesi akan terisi otomatis dari kamera atau URL.</span></li>
              <li><strong>Ambil foto</strong><span>Foto wajib dari kamera perangkat.</span></li>
              <li><strong>Aktifkan lokasi</strong><span>Lokasi divalidasi server terhadap radius kegiatan.</span></li>
            </ol>
            <label>{supabaseConfigured ? 'Token QR dinamis' : 'Token QR atau pilih sesi'}</label>
            {supabaseConfigured ? (
              <textarea value={token} onChange={(e) => setToken(e.target.value)} placeholder="Scan QR untuk mengisi token dinamis." />
            ) : (
              <select value={token} onChange={(e) => setToken(e.target.value)}>
                {data.sessions.map((s) => <option value={s.qr_token} key={s.id}>{s.title}</option>)}
              </select>
            )}
            <div className="button-row">
              <button onClick={capturePhoto}>Ambil Foto</button>
              <button onClick={getGeo}>Ambil Geotag</button>
              <button className="primary" onClick={submitAttendance}>Kirim Presensi</button>
            </div>
            {photo && <img className="photo-preview" src={photo} alt="Foto presensi" />}
            {location && <p className="muted">Lat {location.latitude.toFixed(5)}, Long {location.longitude.toFixed(5)}</p>}
            {message && <Toast tone="blue" message={message} />}
          </section>
        )}

        <section className="panel">
          <div className="panel-title"><h3>Rekap Presensi</h3><span>{data.attendance.length} data</span></div>
          <div className="record-list">
            {data.attendance.length === 0 ? <EmptyState title="Belum ada presensi" body="Data hadir akan muncul setelah peserta mengirim foto dan geotag." /> : data.attendance.slice(0, 12).map((a) => {
              const user = data.users.find((u) => u.id === a.user_id);
              const session = data.sessions.find((s) => s.id === a.session_id);
              return (
                <article className="record-card" key={a.id}>
                  <div className="avatar small">{initials(user?.name ?? 'BY')}</div>
                  <div>
                    <strong>{user?.name ?? '-'}</strong>
                    <span>{session?.title ?? '-'} · {new Date(a.scanned_at).toLocaleString('id-ID')}</span>
                  </div>
                  <StatusBadge value={a.validation_status} />
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminSessionQr({ sessions }: { sessions: SessionRow[] }) {
  const [selectedId, setSelectedId] = useState(sessions[0]?.id ?? '');
  const [qr, setQr] = useState('');
  const [token, setToken] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const selectedSession = sessions.find((session) => session.id === selectedId) ?? sessions[0];
  const secondsLeft = expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000)) : 15;

  useEffect(() => {
    if (!selectedSession) return;

    let cancelled = false;

    async function generateQr() {
      try {
        setMessage(null);
        const tokenResult = supabaseConfigured
          ? await requestAttendanceToken({
              sessionId: selectedSession.id,
              locationName: selectedSession.location_name,
              latitude: selectedSession.latitude,
              longitude: selectedSession.longitude,
              radiusMeters: selectedSession.radius_meters,
              ttlSeconds: 15,
            })
          : {
              token: selectedSession.qr_token,
              expiresAt: new Date(Date.now() + 15000).toISOString(),
            };

        const param = supabaseConfigured ? 'attendanceToken' : 'attendance';
        const url = `${window.location.origin}/?${param}=${encodeURIComponent(tokenResult.token)}`;
        const qrImage = await QRCode.toDataURL(url, { width: 360, margin: 1 });
        if (cancelled) return;

        setToken(tokenResult.token);
        setExpiresAt(tokenResult.expiresAt);
        setQr(qrImage);
        setMessage(supabaseConfigured ? 'QR diperbarui otomatis setiap 15 detik.' : 'Mode demo memakai token statis.');
      } catch (err) {
        if (!cancelled) setMessage(err instanceof Error ? err.message : 'Gagal membuat QR presensi.');
      }
    }

    generateQr();
    const intervalId = window.setInterval(generateQr, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [selectedSession]);

  async function enterFullscreen() {
    try {
      await panelRef.current?.requestFullscreen();
    } catch {
      setMessage('Mode layar penuh tidak tersedia di browser ini.');
    }
  }

  return (
    <section className="panel qr-panel" ref={panelRef}>
      <div className="panel-title">
        <div>
          <h3>Mode Presentasi QR</h3>
          <span>{selectedSession?.title ?? 'Pilih sesi presensi'}</span>
        </div>
        <button onClick={enterFullscreen}>Layar Penuh</button>
      </div>
      <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
        {sessions.map((s) => <option value={s.id} key={s.id}>{s.title}</option>)}
      </select>
      <div className="qr-stage">
        {qr && <img className="qr" src={qr} alt="QR Presensi" />}
        <div className="qr-meta">
          <span>Countdown</span>
          <strong>{secondsLeft}s</strong>
          <p>{selectedSession?.location_name ?? 'Lokasi kegiatan'} · {selectedSession?.start_time ?? '--:--'}-{selectedSession?.end_time ?? '--:--'}</p>
        </div>
      </div>
      {token && <p className="muted">Token aktif: {token.slice(0, 36)}...</p>}
      {message && <Toast tone="blue" message={message} />}
    </section>
  );
}

function ReportView({ data, profile, refresh }: { data: DashboardData; profile: AppUser; refresh: () => void }) {
  const [teamId, setTeamId] = useState(data.teams[0]?.id ?? '');
  const [week, setWeek] = useState(1);
  const [activities, setActivities] = useState('');
  const [progress, setProgress] = useState('');
  const [drive, setDrive] = useState('');
  const [toast, setToast] = useState('');

  async function submit() {
    await createWeeklyReport({
      team_id: teamId,
      week_number: week,
      activity_date: new Date().toISOString().slice(0, 10),
      activities,
      progress,
      obstacles: null,
      next_plan: null,
      drive_link: drive,
      publication_link: null,
      lecturer_note: null,
      admin_note: null,
      lecturer_validation_status: 'pending',
    });
    setActivities('');
    setProgress('');
    setDrive('');
    setToast('Laporan minggu ini berhasil dikirim.');
    refresh();
  }

  return (
    <div className="monitoring-page">
      {toast && <Toast tone="green" message={toast} />}
      {['admin', 'mahasiswa'].includes(profile.role) && (
        <section className="panel stepper-panel">
          <div className="panel-title"><h3>Input Laporan Mingguan</h3><span>6 langkah ringkas</span></div>
          <div className="stepper-grid">
            <FormStep number="1" title="Aktivitas minggu ini">
              <label>Tim</label><select value={teamId} onChange={(e) => setTeamId(e.target.value)}>{data.teams.map((t) => <option value={t.id} key={t.id}>{t.name}</option>)}</select>
              <label>Minggu</label><input type="number" min="1" max="12" value={week} onChange={(e) => setWeek(Number(e.target.value))} />
              <label>Aktivitas</label><textarea value={activities} onChange={(e) => setActivities(e.target.value)} />
            </FormStep>
            <FormStep number="2" title="Progress dan link">
              <label>Progress output</label><textarea value={progress} onChange={(e) => setProgress(e.target.value)} />
              <label>Link Google Drive</label><input value={drive} onChange={(e) => setDrive(e.target.value)} placeholder="https://drive.google.com/..." />
              <button className="primary wide" onClick={submit}>Review dan Kirim</button>
            </FormStep>
          </div>
        </section>
      )}
      <section className="panel">
        <div className="panel-title"><h3>Laporan Masuk</h3><span>{data.weeklyReports.length} laporan</span></div>
        <div className="report-list">
          {data.weeklyReports.length === 0 ? <EmptyState title="Laporan minggu ini belum dikirim" body="Laporan akan tampil sebagai kartu validasi setelah mahasiswa mengirimnya." /> : data.weeklyReports.slice(0, 12).map((report) => {
            const team = data.teams.find((t) => t.id === report.team_id);
            return (
              <article className="report-card" key={report.id}>
                <div>
                  <span>Minggu {report.week_number}</span>
                  <strong>{team?.name ?? '-'}</strong>
                  <p>{report.progress}</p>
                </div>
                <StatusBadge value={report.lecturer_validation_status ?? 'pending'} />
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function OutputView({ data, profile, refresh }: { data: DashboardData; profile: AppUser; refresh: () => void }) {
  const [teamId, setTeamId] = useState(data.teams[0]?.id ?? '');
  const [type, setType] = useState<OutputType>('calendar');
  const [title, setTitle] = useState('');
  const [drive, setDrive] = useState('');
  const [publication, setPublication] = useState('');
  const [toast, setToast] = useState('');

  async function submit() {
    await createOutput({
      team_id: teamId,
      output_type: type,
      title,
      google_drive_link: drive,
      publication_link: publication,
      status: 'submitted',
      umkm_feedback: null,
      admin_note: null,
    });
    setTitle('');
    setDrive('');
    setPublication('');
    setToast('Output berhasil dikirim untuk validasi.');
    refresh();
  }

  return (
    <div className="monitoring-page">
      {toast && <Toast tone="green" message={toast} />}
      {['admin', 'mahasiswa'].includes(profile.role) && (
        <section className="panel stepper-panel">
          <div className="panel-title"><h3>Input Output</h3><span>Checklist final challenge</span></div>
          <div className="form-grid">
            <label>Tim<select value={teamId} onChange={(e) => setTeamId(e.target.value)}>{data.teams.map((t) => <option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
            <label>Jenis Output<select value={type} onChange={(e) => setType(e.target.value as OutputType)}>{outputChecklist.map((o) => <option value={o.key} key={o.key}>{o.label}</option>)}</select></label>
            <label>Judul<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
            <label>Link Google Drive<input value={drive} onChange={(e) => setDrive(e.target.value)} /></label>
            <label>Link Publikasi<input value={publication} onChange={(e) => setPublication(e.target.value)} /></label>
            <button className="primary align-end" onClick={submit}>Simpan Output</button>
          </div>
        </section>
      )}
      <OutputKanban outputs={data.outputs} teams={data.teams} />
    </div>
  );
}

function ScoreView({ data, profile, refresh }: { data: DashboardData; profile: AppUser; refresh: () => void }) {
  const [teamId, setTeamId] = useState(data.teams[0]?.id ?? '');
  const [category, setCategory] = useState<ChallengeCategory>(challengeCategories[0]);
  const [score, setScore] = useState(80);
  const [toast, setToast] = useState('');
  const ranking = getRanking(data);

  async function submitScore() {
    await createScore({ team_id: teamId, category, score, judge_id: profile.id, note: null });
    setToast('Nilai challenge berhasil disimpan.');
    refresh();
  }

  return (
    <div className="monitoring-page">
      {toast && <Toast tone="green" message={toast} />}
      {['admin', 'juri'].includes(profile.role) && (
        <section className="panel score-panel">
          <div className="panel-title"><h3>Rubrik Penilaian Challenge</h3><span>Nilai 1 sampai 100</span></div>
          <div className="score-layout">
            <div className="rubric-list">
              {['Kesesuaian kebutuhan UMKM', 'Kualitas output', 'Keterpakaian', 'Kreativitas', 'Dampak awal', 'Konsistensi'].map((item) => <span key={item}>{item}</span>)}
            </div>
            <div className="score-form">
              <label>Tim<select value={teamId} onChange={(e) => setTeamId(e.target.value)}>{data.teams.map((t) => <option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
              <label>Kategori<select value={category} onChange={(e) => setCategory(e.target.value as ChallengeCategory)}>{challengeCategories.map((c) => <option key={c}>{c}</option>)}</select></label>
              <label>Nilai<input type="range" min="1" max="100" value={score} onChange={(e) => setScore(Number(e.target.value))} /></label>
              <div className="score-number">{score}</div>
              <button className="primary wide" onClick={submitScore}>Simpan Nilai</button>
            </div>
          </div>
        </section>
      )}
      <section className="gallery-grid">
        {ranking.map(({ team, avg }) => <ChallengeTeamCard key={team.id} data={data} team={team} avg={avg} onScore={submitScore} />)}
      </section>
    </div>
  );
}

function ExportView({ data, profile }: { data: DashboardData; profile: AppUser }) {
  if (!['admin', 'dosen'].includes(profile.role)) {
    return <section className="panel"><EmptyState title="Pusat laporan tidak tersedia" body="Export laporan hanya tersedia untuk panitia dan dosen pendamping." /></section>;
  }

  const jobs = [
    { type: 'Excel Monitoring', status: 'Queued', detail: `${data.teams.length} tim, ${data.weeklyReports.length} laporan` },
    { type: 'PDF Executive Summary', status: 'Processing', detail: `${data.campuses.length} kampus dan ${data.umkms.length} UMKM` },
    { type: 'Attendance Audit', status: 'Completed', detail: `${data.attendance.length} rekaman presensi` },
  ];

  return (
    <div className="monitoring-page">
      <section className="hero-monitor compact-hero">
        <div>
          <p className="eyebrow">Report Center</p>
          <h2>Pusat Laporan</h2>
          <p>UI ini menyiapkan antrean report server-side. File final akan tersedia setelah job selesai diproses backend.</p>
        </div>
        <div className="button-row">
          <button className="primary">Generate Excel</button>
          <button>Generate PDF</button>
        </div>
      </section>
      <section className="panel">
        <div className="panel-title"><h3>Riwayat Export</h3><span>Status job</span></div>
        <div className="job-table">
          {jobs.map((job) => (
            <article key={job.type} className="job-row">
              <div><strong>{job.type}</strong><span>{job.detail}</span></div>
              <StatusBadge value={job.status.toLowerCase()} />
              <button disabled={job.status !== 'Completed'}>Download</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, hint, tone }: { label: string; value: string | number; hint: string; tone: Tone }) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

function ProgramPhaseCard({ progress }: { progress: number }) {
  return (
    <section className="panel">
      <div className="panel-title"><h3>Progress Program</h3><span>{progress}% berjalan</span></div>
      <div className="phase-track">
        {phases.map((phase, index) => {
          const active = progress >= index * 25;
          return <div key={phase} className={active ? 'phase active' : 'phase'}><span>{index + 1}</span><strong>{phase}</strong></div>;
        })}
      </div>
    </section>
  );
}

function TeamHealth({ data }: { data: DashboardData }) {
  const health = {
    aman: data.teams.filter((team) => team.status === 'aman').length,
    perlu_perhatian: data.teams.filter((team) => team.status === 'perlu_perhatian').length,
    kritis: data.teams.filter((team) => team.status === 'kritis').length,
  };

  return (
    <section className="panel">
      <div className="panel-title"><h3>Team Health</h3><span>Status monitoring</span></div>
      <div className="health-grid">
        <HealthCard label="Aman" value={health.aman} tone="green" />
        <HealthCard label="Perlu Perhatian" value={health.perlu_perhatian} tone="yellow" />
        <HealthCard label="Kritis" value={health.kritis} tone="red" />
      </div>
    </section>
  );
}

function HealthCard({ label, value, tone }: { label: string; value: number; tone: Tone }) {
  return <article className={`health-card tone-${tone}`}><strong>{value}</strong><span>{label}</span></article>;
}

function TeamMonitoringBoard({ data, title }: { data: DashboardData; title: string }) {
  return (
    <section className="panel">
      <div className="panel-title"><h3>{title}</h3><span>{data.teams.length} tim</span></div>
      <div className="team-board">
        {data.teams.length === 0 ? <EmptyState title="Belum ada tim" body="Tim akan muncul setelah data kampus dan pairing UMKM dibuat." /> : data.teams.map((team) => <TeamRow key={team.id} data={data} team={team} />)}
      </div>
    </section>
  );
}

function TeamRow({ data, team }: { data: DashboardData; team: Team }) {
  const campus = data.campuses.find((c) => c.id === team.campus_id);
  const umkm = data.umkms.find((u) => u.id === team.umkm_id);
  const reports = data.weeklyReports.filter((r) => r.team_id === team.id);
  const outputs = data.outputs.filter((o) => o.team_id === team.id);
  const latestReport = reports[reports.length - 1];

  return (
    <article className="team-row-card">
      <div className="team-identity">
        <div className="avatar">{initials(team.name)}</div>
        <div>
          <strong>{team.name}</strong>
          <span>{campus?.name ?? '-'}</span>
        </div>
      </div>
      <div className="team-main">
        <span>UMKM Dampingan</span>
        <strong>{umkm?.business_name ?? '-'}</strong>
      </div>
      <div className="team-progress">
        <Progress value={team.progress ?? 0} />
      </div>
      <StatusBadge value={team.status} />
      <div className="team-main compact">
        <span>Laporan terakhir</span>
        <strong>{latestReport ? `Minggu ${latestReport.week_number}` : 'Belum ada'}</strong>
      </div>
      <div className="team-main compact">
        <span>Output</span>
        <strong>{outputs.length} item</strong>
      </div>
    </article>
  );
}

function TeamFocusCard({ data, team }: { data: DashboardData; team: Team }) {
  const umkm = data.umkms.find((item) => item.id === team.umkm_id);
  const students = data.users.filter((item) => item.team_id === team.id && item.role === 'mahasiswa');
  const reports = data.weeklyReports.filter((item) => item.team_id === team.id);
  return (
    <article className="team-focus-card">
      <div className="team-identity">
        <div className="avatar">{initials(team.name)}</div>
        <div><strong>{team.name}</strong><span>{umkm?.business_name ?? '-'}</span></div>
      </div>
      <Progress value={team.progress ?? 0} />
      <div className="mini-stats">
        <span>{students.length} mahasiswa</span>
        <span>{reports.length} laporan</span>
        <StatusBadge value={team.status} />
      </div>
    </article>
  );
}

function CourseModuleCard({ session, index, attendanceCount, totalStudents }: { session: SessionRow; index: number; attendanceCount: number; totalStudents: number }) {
  const attendanceRate = Math.round((attendanceCount / Math.max(1, totalStudents)) * 100);
  const status = index === 0 ? 'Selesai' : index === 1 ? 'Berjalan' : 'Belum Mulai';
  return (
    <article className="course-card modern-card">
      <div className="module-number">{String(index + 1).padStart(2, '0')}</div>
      <div>
        <span className="role-chip">{status}</span>
        <h4>{session.title}</h4>
        <p>{session.session_date} · {session.start_time}-{session.end_time} · {session.location_name ?? '-'}</p>
      </div>
      <Progress value={attendanceRate} />
      <div className="button-row">
        <button>Materi</button>
        <button>Tugas</button>
        <button>Presensi</button>
      </div>
    </article>
  );
}

function OutputChecklist({ outputs }: { outputs: OutputItem[] }) {
  return (
    <div className="checklist">
      {outputChecklist.map((item) => {
        const count = outputs.filter((output) => output.output_type === item.key).length;
        const done = count >= item.target;
        return (
          <div key={item.key} className={done ? 'check-row done' : 'check-row'}>
            <span>{done ? 'Selesai' : 'Proses'}</span>
            <strong>{item.label}</strong>
            <small>{count}/{item.target}</small>
          </div>
        );
      })}
    </div>
  );
}

function OutputKanban({ outputs, teams }: { outputs: OutputItem[]; teams?: Team[] }) {
  const columns = [
    { key: 'draft', label: 'Belum dikirim' },
    { key: 'submitted', label: 'Perlu validasi' },
    { key: 'approved', label: 'Valid' },
    { key: 'revision', label: 'Perlu revisi' },
  ];

  return (
    <section className="kanban-grid">
      {columns.map((column) => {
        const list = outputs.filter((output) => output.status === column.key);
        return (
          <div className="kanban-column" key={column.key}>
            <div className="kanban-title"><strong>{column.label}</strong><span>{list.length}</span></div>
            {list.length === 0 ? <EmptyState title="Kosong" body="Belum ada output pada status ini." compact /> : list.slice(0, 6).map((output) => {
              const team = teams?.find((item) => item.id === output.team_id);
              return (
                <article className="output-card" key={output.id}>
                  <span>{output.output_type.replace('_', ' ')}</span>
                  <strong>{output.title}</strong>
                  <small>{team?.name ?? 'Tim'} · Link Google Drive</small>
                </article>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}

function ChallengeTeamCard({ data, team, avg, onScore }: { data: DashboardData; team: Team; avg: number; onScore: () => void }) {
  const campus = data.campuses.find((item) => item.id === team.campus_id);
  const umkm = data.umkms.find((item) => item.id === team.umkm_id);
  const outputs = data.outputs.filter((item) => item.team_id === team.id);

  return (
    <article className="challenge-card">
      <div className="team-identity">
        <div className="avatar">{initials(team.name)}</div>
        <div><strong>{team.name}</strong><span>{campus?.name ?? '-'}</span></div>
      </div>
      <p>{umkm?.business_name ?? 'UMKM belum terhubung'}</p>
      <div className="mini-stats">
        <span>{outputs.length} output</span>
        <span>Nilai {avg}</span>
        <StatusBadge value={outputs.length ? 'accessible' : 'restricted'} />
      </div>
      <button className="primary wide" onClick={onScore}>Nilai Tim</button>
    </article>
  );
}

function FormStep({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <article className="form-step">
      <div className="step-heading"><span>{number}</span><strong>{title}</strong></div>
      {children}
    </article>
  );
}

function Progress({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return <div className="progress"><span style={{ width: `${safeValue}%` }} /><em>{safeValue}%</em></div>;
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value.replace(/\s+/g, '_').toLowerCase();
  const label = value.replace(/_/g, ' ');
  return <span className={`badge ${normalized}`}>{label}</span>;
}

function EmptyState({ title, body, compact = false }: { title: string; body: string; compact?: boolean }) {
  return (
    <div className={compact ? 'empty-state compact' : 'empty-state'}>
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

function Toast({ tone, message }: { tone: Tone; message: string }) {
  return <div className={`toast tone-${tone}`}>{message}</div>;
}

function LoadingSkeleton({ label = 'Memuat aplikasi...' }: { label?: string }) {
  return (
    <main className="loading-screen">
      <div className="skeleton-card" />
      <div className="skeleton-lines">
        <span />
        <span />
        <span />
      </div>
      <p>{label}</p>
    </main>
  );
}

function getMetrics(data: DashboardData) {
  const students = data.users.filter((u) => u.role === 'mahasiswa');
  const attendanceTarget = Math.max(1, students.length * data.sessions.length);
  const attendanceRate = Math.round((data.attendance.filter((item) => item.validation_status === 'valid').length / attendanceTarget) * 100);
  const reportTarget = Math.max(1, data.teams.length * 12);
  const reportRate = Math.round((data.weeklyReports.length / reportTarget) * 100);
  const outputTarget = Math.max(1, data.teams.length * outputChecklist.length);
  const outputRate = Math.round((data.outputs.filter((output) => output.status !== 'draft').length / outputTarget) * 100);
  const avgProgress = data.teams.length ? Math.round(data.teams.reduce((sum, t) => sum + (t.progress ?? 0), 0) / data.teams.length) : 0;
  const linkProblems = data.outputs.filter((output) => output.status === 'revision' || !output.google_drive_link).length;
  return { students, attendanceTarget, attendanceRate, reportRate, outputRate, avgProgress, linkProblems };
}

function getAttendanceStats(data: DashboardData) {
  const target = Math.max(1, data.users.filter((user) => user.role === 'mahasiswa').length * data.sessions.length);
  const valid = data.attendance.filter((item) => item.validation_status === 'valid').length;
  const pending = data.attendance.filter((item) => ['pending', 'pending_review', 'pending_sync'].includes(item.validation_status)).length;
  const flagged = data.attendance.filter((item) => item.validation_status === 'flagged_location').length;
  const duplicate = data.attendance.filter((item) => item.validation_status === 'duplicate_attempt').length;
  const rejected = data.attendance.filter((item) => item.validation_status === 'rejected').length;
  return { valid, pending, flagged, duplicate: duplicate + rejected, absent: Math.max(0, target - data.attendance.length) };
}

function getRanking(data: DashboardData) {
  return data.teams.map((team) => {
    const scores = data.scores.filter((s) => s.team_id === team.id);
    const avg = scores.length ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) : 0;
    return { team, avg };
  }).sort((a, b) => b.avg - a.avg);
}

function initials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
