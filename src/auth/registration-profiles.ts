export const REGISTRATION_PROFILES = {
  mahasiswa: {
    role: 'mahasiswa', label: 'Mahasiswa', title: 'Pendaftaran Mahasiswa',
    subtitle: 'Lengkapi data mahasiswa untuk masuk ke antrean verifikasi akses monitoring.',
    institutionLabel: 'Kampus', institutionPlaceholder: 'Contoh: Universitas Bangka Belitung',
    notePlaceholder: 'Program studi, tim, atau informasi relevan',
    accessNote: 'Akses monitoring tim diberikan setelah admin memverifikasi akun dan menetapkan tim.',
  },
  umkm: {
    role: 'umkm', label: 'UMKM', title: 'Pendaftaran UMKM',
    subtitle: 'Lengkapi data UMKM agar panitia dapat memetakan kebutuhan pendampingan dan memverifikasi akses.',
    institutionLabel: 'Nama UMKM', institutionPlaceholder: 'Contoh: DND Cake',
    notePlaceholder: 'Jenis usaha atau kebutuhan pendampingan',
    accessNote: 'Akses UMKM diberikan setelah admin memverifikasi akun dan menghubungkannya dengan usaha Anda.',
  },
  universitas: {
    role: 'kampus_viewer', label: 'Universitas', title: 'Pendaftaran Universitas',
    subtitle: 'Daftarkan perwakilan universitas atau perguruan tinggi untuk pemantauan program di kampus Anda.',
    institutionLabel: 'Nama universitas / perguruan tinggi', institutionPlaceholder: 'Nama lengkap perguruan tinggi',
    notePlaceholder: 'Jabatan, unit kerja, atau penugasan sebagai perwakilan kampus',
    accessNote: 'Setelah disetujui admin, akses baca-saja dibatasi pada tim di kampus yang ditetapkan. Pendaftaran ini tidak otomatis menambahkan kampus baru.',
  },
  juri: {
    role: 'juri', label: 'Juri', title: 'Pendaftaran Juri',
    subtitle: 'Ajukan akses sebagai juri Babel Youthpreneur. Panitia akan memverifikasi penugasan Anda.',
    institutionLabel: 'Instansi / afiliasi', institutionPlaceholder: 'Nama instansi atau afiliasi profesional',
    notePlaceholder: 'Bidang keahlian atau informasi penugasan juri',
    accessNote: 'Hak akses juri baru aktif setelah panitia memverifikasi penugasan dan menyetujui akun.',
  },
  kemenkeu: {
    role: 'pimpinan_viewer', label: 'Kemenkeu', title: 'Pendaftaran Kemenkeu',
    subtitle: 'Daftarkan perwakilan Kementerian Keuangan untuk pemantauan pelaksanaan program lintas tim.',
    institutionLabel: 'Unit kerja Kementerian Keuangan', institutionPlaceholder: 'Contoh: Kanwil DJPb Provinsi Bangka Belitung',
    notePlaceholder: 'Jabatan atau informasi penugasan pemantauan program',
    accessNote: 'Setelah disetujui admin, akun mendapat akses pemantauan baca-saja, bukan hak administrator atau penilaian juri.',
  },
} as const

export type RegistrationProfile = typeof REGISTRATION_PROFILES[keyof typeof REGISTRATION_PROFILES]
