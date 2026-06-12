import type { DashboardData } from './types';

const campusNames = [
  'Universitas Bangka Belitung',
  'Universitas Pertiba',
  'Universitas Muhammadiyah Bangka Belitung',
  'Universitas Anak Bangsa',
  'IAIN SAS Bangka Belitung',
];

const umkmNames = [
  'Dnd Cake n Cookie',
  'Rumah Makan Rajalele',
  'JJ Catering',
  "Kamiz Choc's",
  'Central Charcoal Babelindo',
  'Deshanda Craft',
  '3 Shesca Decoupage Art',
  'Madu RR Arisi',
  'Keripik Cumi Mina',
  'Bangka Ecoprint',
];

export const mockData: DashboardData = (() => {
  const campuses = campusNames.map((name, idx) => ({
    id: `campus-${idx + 1}`,
    name,
    pic: `PIC ${idx + 1}`,
    contact: `08${idx + 1}00000000`,
    address: 'Pangkalpinang',
  }));

  const umkms = umkmNames.map((business_name, idx) => ({
    id: `umkm-${idx + 1}`,
    business_name,
    owner_name: `Owner ${idx + 1}`,
    whatsapp: `08${idx + 2}11111111`,
    category: idx % 3 === 0 ? 'Makanan/minuman' : idx % 3 === 1 ? 'Kerajinan' : 'Produk kreatif',
    address: 'Bangka Belitung',
    regency: idx % 2 === 0 ? 'Kota Pangkalpinang' : 'Kabupaten Bangka',
    priority_need: idx % 2 === 0 ? 'Branding dan konten' : 'Katalog digital',
    curation_status: 'lolos',
  }));

  const teams = Array.from({ length: 10 }).map((_, idx) => ({
    id: `team-${idx + 1}`,
    name: `Tim ${String.fromCharCode(65 + Math.floor(idx / 2))}${(idx % 2) + 1}`,
    campus_id: campuses[Math.floor(idx / 2)].id,
    umkm_id: umkms[idx].id,
    lecturer_id: `lecturer-${Math.floor(idx / 2) + 1}`,
    status: idx === 2 ? 'perlu_perhatian' as const : idx === 7 ? 'kritis' as const : 'aman' as const,
    progress: idx === 7 ? 25 : idx === 2 ? 55 : 78,
  }));

  const users = [
    { id: 'admin-1', name: 'Admin Program', email: 'admin@example.com', role: 'admin' as const, campus_id: null, team_id: null, umkm_id: null, status: 'active' },
    { id: 'judge-1', name: 'Juri Program', email: 'juri@example.com', role: 'juri' as const, campus_id: null, team_id: null, umkm_id: null, status: 'active' },
    ...campuses.map((campus, idx) => ({
      id: `lecturer-${idx + 1}`,
      name: `Dosen ${idx + 1}`,
      email: `dosen${idx + 1}@example.com`,
      role: 'dosen' as const,
      campus_id: campus.id,
      team_id: null,
      umkm_id: null,
      status: 'active',
    })),
    ...teams.flatMap((team, teamIdx) =>
      Array.from({ length: 3 }).map((_, mIdx) => ({
        id: `student-${teamIdx + 1}-${mIdx + 1}`,
        name: `Mahasiswa ${teamIdx + 1}.${mIdx + 1}`,
        email: `mhs${teamIdx + 1}${mIdx + 1}@example.com`,
        role: 'mahasiswa' as const,
        campus_id: team.campus_id,
        team_id: team.id,
        umkm_id: team.umkm_id,
        status: 'active',
      }))
    ),
    ...umkms.map((umkm, idx) => ({
      id: `umkm-user-${idx + 1}`,
      name: umkm.business_name,
      email: `umkm${idx + 1}@example.com`,
      role: 'umkm' as const,
      campus_id: null,
      team_id: teams[idx].id,
      umkm_id: umkm.id,
      status: 'active',
    })),
  ];

  const courses = [
    {
      id: 'course-1',
      title: 'Pelatihan Babel Youthpreneur 2026',
      description: 'Course pelatihan Juli untuk 30 mahasiswa dan 10 UMKM.',
      start_date: '2026-07-01',
      end_date: '2026-07-31',
    },
  ];

  const sessions = [1, 2, 3, 4].map((n) => ({
    id: `session-${n}`,
    course_id: 'course-1',
    title: ['Orientasi Program dan Etika Pendampingan UMKM', 'Digital Branding dan Copywriting', 'Foto Produk dan Video Pendek', 'Landing Page/Katalog Digital dan Strategi Konten'][n - 1],
    session_date: `2026-07-${String(n * 7).padStart(2, '0')}`,
    start_time: '08:00',
    end_time: '12:00',
    location_name: 'Aula Program',
    qr_token: `demo-token-${n}`,
    qr_active_from: `2026-07-${String(n * 7).padStart(2, '0')}T07:30:00+07:00`,
    qr_active_until: `2026-07-${String(n * 7).padStart(2, '0')}T12:30:00+07:00`,
  }));

  const attendance = users
    .filter((u) => u.role === 'mahasiswa')
    .slice(0, 24)
    .map((u, idx) => ({
      id: `attendance-${idx + 1}`,
      session_id: `session-${(idx % 4) + 1}`,
      user_id: u.id,
      scanned_at: new Date(2026, 6, (idx % 4) * 7 + 1, 8, idx % 50).toISOString(),
      latitude: -2.1291,
      longitude: 106.1138,
      photo_url: null,
      validation_status: 'valid',
      admin_note: null,
    }));

  const weeklyReports = teams.flatMap((team, idx) =>
    [1, 2, 3].map((week) => ({
      id: `report-${idx + 1}-${week}`,
      team_id: team.id,
      week_number: week,
      activity_date: `2026-08-${String(week * 7).padStart(2, '0')}`,
      activities: 'Koordinasi UMKM, pemetaan kebutuhan, dan produksi konten awal.',
      progress: week === 1 ? 'Profil UMKM selesai' : week === 2 ? 'Konten awal diproduksi' : 'Publikasi dan evaluasi awal',
      obstacles: idx === 7 ? 'Tim belum aktif menghubungi UMKM.' : null,
      next_plan: 'Finalisasi output minggu berikutnya.',
      drive_link: 'https://drive.google.com/drive/folders/example',
      publication_link: 'https://example.com/publikasi',
      lecturer_note: null,
      admin_note: null,
      lecturer_validation_status: idx === 7 ? 'pending' : 'validated',
      created_at: new Date().toISOString(),
    }))
  );

  const outputs = teams.flatMap((team, idx) => [
    { id: `output-${idx + 1}-1`, team_id: team.id, output_type: 'calendar' as const, title: 'Kalender Konten', google_drive_link: 'https://drive.google.com/drive/folders/example', publication_link: null, status: idx === 7 ? 'draft' : 'submitted', umkm_feedback: null, admin_note: null },
    { id: `output-${idx + 1}-2`, team_id: team.id, output_type: 'content' as const, title: 'Konten Media Sosial', google_drive_link: 'https://drive.google.com/drive/folders/example', publication_link: 'https://instagram.com/example', status: idx === 7 ? 'draft' : 'submitted', umkm_feedback: null, admin_note: null },
    { id: `output-${idx + 1}-3`, team_id: team.id, output_type: 'landing_page' as const, title: 'Katalog Digital', google_drive_link: 'https://drive.google.com/drive/folders/example', publication_link: 'https://example.com/landing', status: idx === 7 ? 'draft' : 'submitted', umkm_feedback: null, admin_note: null },
  ]);

  const scores = teams.flatMap((team, idx) => [
    { id: `score-${idx + 1}-1`, team_id: team.id, category: 'Best Digital Branding' as const, score: 70 + (idx % 5) * 4, judge_id: 'judge-1', note: null },
    { id: `score-${idx + 1}-2`, team_id: team.id, category: 'Best Social Media Growth' as const, score: 68 + (idx % 4) * 5, judge_id: 'judge-1', note: null },
  ]);

  return { users, campuses, umkms, teams, courses, sessions, attendance, weeklyReports, outputs, scores };
})();
