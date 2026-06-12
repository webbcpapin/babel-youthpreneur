insert into campuses (id, name, pic, contact, address) values
('00000000-0000-0000-0000-000000000101','Universitas Bangka Belitung','PIC UBB','080000000001','Bangka Belitung'),
('00000000-0000-0000-0000-000000000102','Universitas Pertiba','PIC Pertiba','080000000002','Pangkalpinang'),
('00000000-0000-0000-0000-000000000103','Universitas Muhammadiyah Bangka Belitung','PIC Unmuh','080000000003','Bangka Belitung'),
('00000000-0000-0000-0000-000000000104','Universitas Anak Bangsa','PIC Unaba','080000000004','Pangkalpinang'),
('00000000-0000-0000-0000-000000000105','IAIN SAS Bangka Belitung','PIC IAIN','080000000005','Bangka Belitung')
on conflict (id) do nothing;

insert into umkms (id, business_name, owner_name, whatsapp, category, address, regency, priority_need, curation_status) values
('00000000-0000-0000-0000-000000000201','Dnd Cake n Cookie','Owner 1','081100000001','Makanan/minuman','Bangka Belitung','Kota Pangkalpinang','Branding dan konten','lolos'),
('00000000-0000-0000-0000-000000000202','Rumah Makan Rajalele','Owner 2','081100000002','Makanan/minuman','Bangka Belitung','Kabupaten Bangka','Katalog digital','lolos'),
('00000000-0000-0000-0000-000000000203','JJ Catering','Owner 3','081100000003','Makanan/minuman','Bangka Belitung','Kota Pangkalpinang','Foto produk','lolos'),
('00000000-0000-0000-0000-000000000204','Kamiz Choc''s','Owner 4','081100000004','Makanan/minuman','Bangka Belitung','Kabupaten Bangka','Copywriting','lolos'),
('00000000-0000-0000-0000-000000000205','Central Charcoal Babelindo','Owner 5','081100000005','Industri kecil menengah','Bangka Belitung','Kabupaten Bangka','Landing page','lolos'),
('00000000-0000-0000-0000-000000000206','Deshanda Craft','Owner 6','081100000006','Kerajinan','Bangka Belitung','Kota Pangkalpinang','Branding','lolos'),
('00000000-0000-0000-0000-000000000207','3 Shesca Decoupage Art','Owner 7','081100000007','Kerajinan','Bangka Belitung','Kabupaten Bangka','Social media growth','lolos'),
('00000000-0000-0000-0000-000000000208','Madu RR Arisi','Owner 8','081100000008','Pertanian/perkebunan','Bangka Belitung','Kabupaten Bangka','Katalog digital','lolos'),
('00000000-0000-0000-0000-000000000209','Keripik Cumi Mina','Owner 9','081100000009','Hasil laut/perikanan','Bangka Belitung','Kota Pangkalpinang','Video pendek','lolos'),
('00000000-0000-0000-0000-000000000210','Bangka Ecoprint','Owner 10','081100000010','Fashion','Bangka Belitung','Kabupaten Bangka','Product campaign','lolos')
on conflict (id) do nothing;

insert into app_users (id, name, email, role, campus_id, umkm_id, team_id, status) values
('00000000-0000-0000-0000-000000000001','Admin Program','admin@example.com','admin',null,null,null,'active'),
('00000000-0000-0000-0000-000000000002','Juri Program','juri@example.com','juri',null,null,null,'active'),
('00000000-0000-0000-0000-000000000301','Dosen 1','dosen1@example.com','dosen','00000000-0000-0000-0000-000000000101',null,null,'active'),
('00000000-0000-0000-0000-000000000302','Dosen 2','dosen2@example.com','dosen','00000000-0000-0000-0000-000000000102',null,null,'active'),
('00000000-0000-0000-0000-000000000303','Dosen 3','dosen3@example.com','dosen','00000000-0000-0000-0000-000000000103',null,null,'active'),
('00000000-0000-0000-0000-000000000304','Dosen 4','dosen4@example.com','dosen','00000000-0000-0000-0000-000000000104',null,null,'active'),
('00000000-0000-0000-0000-000000000305','Dosen 5','dosen5@example.com','dosen','00000000-0000-0000-0000-000000000105',null,null,'active')
on conflict (id) do nothing;

insert into teams (id, name, campus_id, umkm_id, lecturer_id, status, progress) values
('00000000-0000-0000-0000-000000000401','Tim A1','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000301','aman',75),
('00000000-0000-0000-0000-000000000402','Tim A2','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000301','aman',70),
('00000000-0000-0000-0000-000000000403','Tim B1','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000302','perlu_perhatian',55),
('00000000-0000-0000-0000-000000000404','Tim B2','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000204','00000000-0000-0000-0000-000000000302','aman',82),
('00000000-0000-0000-0000-000000000405','Tim C1','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000205','00000000-0000-0000-0000-000000000303','aman',78),
('00000000-0000-0000-0000-000000000406','Tim C2','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000206','00000000-0000-0000-0000-000000000303','aman',66),
('00000000-0000-0000-0000-000000000407','Tim D1','00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000207','00000000-0000-0000-0000-000000000304','aman',80),
('00000000-0000-0000-0000-000000000408','Tim D2','00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000208','00000000-0000-0000-0000-000000000304','kritis',25),
('00000000-0000-0000-0000-000000000409','Tim E1','00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000209','00000000-0000-0000-0000-000000000305','aman',72),
('00000000-0000-0000-0000-000000000410','Tim E2','00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000210','00000000-0000-0000-0000-000000000305','aman',74)
on conflict (id) do nothing;

insert into courses (id, title, description, start_date, end_date) values
('00000000-0000-0000-0000-000000000501','Pelatihan Babel Youthpreneur 2026','Course pelatihan Juli. Setiap minggu satu sesi setengah hari dengan minimal dua materi.','2026-07-01','2026-07-31')
on conflict (id) do nothing;

insert into sessions (id, course_id, title, session_date, start_time, end_time, location_name, qr_token, qr_active_from, qr_active_until) values
('00000000-0000-0000-0000-000000000601','00000000-0000-0000-0000-000000000501','Orientasi Program dan Etika Pendampingan UMKM','2026-07-07','08:00','12:00','Aula Program','demo-token-1','2026-07-07 07:30:00+07','2026-07-07 12:30:00+07'),
('00000000-0000-0000-0000-000000000602','00000000-0000-0000-0000-000000000501','Digital Branding dan Copywriting','2026-07-14','08:00','12:00','Aula Program','demo-token-2','2026-07-14 07:30:00+07','2026-07-14 12:30:00+07'),
('00000000-0000-0000-0000-000000000603','00000000-0000-0000-0000-000000000501','Foto Produk dan Video Pendek','2026-07-21','08:00','12:00','Aula Program','demo-token-3','2026-07-21 07:30:00+07','2026-07-21 12:30:00+07'),
('00000000-0000-0000-0000-000000000604','00000000-0000-0000-0000-000000000501','Landing Page/Katalog Digital dan Strategi Konten','2026-07-28','08:00','12:00','Aula Program','demo-token-4','2026-07-28 07:30:00+07','2026-07-28 12:30:00+07')
on conflict (id) do nothing;
