import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import type { DashboardData } from './types';

export function exportExcel(data: DashboardData) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.campuses), 'Kampus');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.users), 'Pengguna');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.umkms), 'UMKM');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.teams), 'Tim');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.sessions), 'Sesi Pelatihan');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.attendance), 'Presensi');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.weeklyReports), 'Laporan Mingguan');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.outputs), 'Output');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.scores), 'Nilai');
  XLSX.writeFile(workbook, 'Laporan_Babel_Youthpreneur_2026.xlsx');
}

export function exportPdf(data: DashboardData) {
  const doc = new jsPDF();
  const attendanceRate = data.users.filter((u) => u.role === 'mahasiswa').length
    ? Math.round((data.attendance.length / (data.users.filter((u) => u.role === 'mahasiswa').length * Math.max(1, data.sessions.length))) * 100)
    : 0;

  doc.setFontSize(16);
  doc.text('Laporan Babel Youthpreneur 2026', 14, 18);
  doc.setFontSize(10);
  doc.text('Ringkasan monitoring program pelatihan dan pendampingan UMKM.', 14, 27);
  doc.text(`Total kampus: ${data.campuses.length}`, 14, 42);
  doc.text(`Total tim: ${data.teams.length}`, 14, 50);
  doc.text(`Total mahasiswa: ${data.users.filter((u) => u.role === 'mahasiswa').length}`, 14, 58);
  doc.text(`Total UMKM: ${data.umkms.length}`, 14, 66);
  doc.text(`Total dosen: ${data.users.filter((u) => u.role === 'dosen').length}`, 14, 74);
  doc.text(`Tingkat presensi: ${attendanceRate}%`, 14, 82);
  doc.text(`Laporan mingguan terkumpul: ${data.weeklyReports.length}`, 14, 90);
  doc.text(`Output terkumpul: ${data.outputs.length}`, 14, 98);

  let y = 116;
  doc.setFontSize(12);
  doc.text('Progress Tim', 14, y);
  y += 8;
  doc.setFontSize(9);
  data.teams.slice(0, 20).forEach((team) => {
    doc.text(`${team.name} | Progress ${team.progress ?? 0}% | Status ${team.status}`, 14, y);
    y += 7;
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save('Laporan_Babel_Youthpreneur_2026.pdf');
}
