import type { ChallengeCategory, OutputType } from './types';

export const challengeCategories: ChallengeCategory[] = [
  'Best Digital Branding',
  'Best Social Media Growth',
  'Best Product Campaign',
  'Best Website/Landing Page',
  'Best Content Strategy',
];

export const outputChecklist: Array<{ key: OutputType; label: string; target: number }> = [
  { key: 'calendar', label: 'Kalender konten', target: 1 },
  { key: 'content', label: 'Konten media sosial', target: 6 },
  { key: 'video', label: 'Video pendek', target: 2 },
  { key: 'landing_page', label: 'Katalog digital atau landing page', target: 1 },
  { key: 'report', label: 'Laporan pendampingan', target: 1 },
  { key: 'presentation', label: 'Presentasi final', target: 1 },
];

export const courseModules = [
  'Orientasi Program dan Etika Pendampingan UMKM',
  'Digital Branding dan Copywriting',
  'Foto Produk dan Video Pendek',
  'Landing Page/Katalog Digital dan Strategi Konten',
];
