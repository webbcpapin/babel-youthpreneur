insert into campuses (id, name, pic, contact, address) values
('00000000-0000-0000-0000-000000000101','Universitas Bangka Belitung','PIC UBB','080000000001','Bangka Belitung'),
('00000000-0000-0000-0000-000000000102','Universitas Pertiba','PIC Pertiba','080000000002','Pangkalpinang'),
('00000000-0000-0000-0000-000000000103','Universitas Muhammadiyah Bangka Belitung','PIC Unmuh','080000000003','Bangka Belitung'),
('00000000-0000-0000-0000-000000000104','Universitas Anak Bangsa','PIC Unaba','080000000004','Pangkalpinang'),
('00000000-0000-0000-0000-000000000105','IAIN SAS Bangka Belitung','PIC IAIN','080000000005','Bangka Belitung')
on conflict (id) do update set name = excluded.name, pic = excluded.pic, contact = excluded.contact, address = excluded.address;

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
on conflict (id) do update set business_name = excluded.business_name, owner_name = excluded.owner_name, whatsapp = excluded.whatsapp, category = excluded.category, address = excluded.address, regency = excluded.regency, priority_need = excluded.priority_need, curation_status = excluded.curation_status;

insert into app_users (id, name, email, role, campus_id, umkm_id, team_id, status) values
('00000000-0000-0000-0000-000000000001','Admin Program','admin@example.com','admin',null,null,null,'active'),
('00000000-0000-0000-0000-000000000011','Juri 1','juri1@example.com','juri',null,null,null,'active'),
('00000000-0000-0000-0000-000000000012','Juri 2','juri2@example.com','juri',null,null,null,'active'),
('00000000-0000-0000-0000-000000000013','Juri 3','juri3@example.com','juri',null,null,null,'active'),
('00000000-0000-0000-0000-000000000301','Dosen A1','dosen.a1@example.com','dosen','00000000-0000-0000-0000-000000000101',null,null,'active'),
('00000000-0000-0000-0000-000000000302','Dosen A2','dosen.a2@example.com','dosen','00000000-0000-0000-0000-000000000101',null,null,'active'),
('00000000-0000-0000-0000-000000000303','Dosen B1','dosen.b1@example.com','dosen','00000000-0000-0000-0000-000000000102',null,null,'active'),
('00000000-0000-0000-0000-000000000304','Dosen B2','dosen.b2@example.com','dosen','00000000-0000-0000-0000-000000000102',null,null,'active'),
('00000000-0000-0000-0000-000000000305','Dosen C1','dosen.c1@example.com','dosen','00000000-0000-0000-0000-000000000103',null,null,'active'),
('00000000-0000-0000-0000-000000000306','Dosen C2','dosen.c2@example.com','dosen','00000000-0000-0000-0000-000000000103',null,null,'active'),
('00000000-0000-0000-0000-000000000307','Dosen D1','dosen.d1@example.com','dosen','00000000-0000-0000-0000-000000000104',null,null,'active'),
('00000000-0000-0000-0000-000000000308','Dosen D2','dosen.d2@example.com','dosen','00000000-0000-0000-0000-000000000104',null,null,'active'),
('00000000-0000-0000-0000-000000000309','Dosen E1','dosen.e1@example.com','dosen','00000000-0000-0000-0000-000000000105',null,null,'active'),
('00000000-0000-0000-0000-000000000310','Dosen E2','dosen.e2@example.com','dosen','00000000-0000-0000-0000-000000000105',null,null,'active')
on conflict (id) do update set name = excluded.name, email = excluded.email, role = excluded.role, campus_id = excluded.campus_id, umkm_id = excluded.umkm_id, team_id = excluded.team_id, status = excluded.status;

insert into teams (id, name, campus_id, umkm_id, lecturer_id, status, progress) values
('00000000-0000-0000-0000-000000000401','Tim A1','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000301','aman',75),
('00000000-0000-0000-0000-000000000402','Tim A2','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000302','aman',70),
('00000000-0000-0000-0000-000000000403','Tim B1','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000303','perlu_perhatian',55),
('00000000-0000-0000-0000-000000000404','Tim B2','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000204','00000000-0000-0000-0000-000000000304','aman',82),
('00000000-0000-0000-0000-000000000405','Tim C1','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000205','00000000-0000-0000-0000-000000000305','aman',78),
('00000000-0000-0000-0000-000000000406','Tim C2','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000206','00000000-0000-0000-0000-000000000306','aman',66),
('00000000-0000-0000-0000-000000000407','Tim D1','00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000207','00000000-0000-0000-0000-000000000307','aman',80),
('00000000-0000-0000-0000-000000000408','Tim D2','00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000208','00000000-0000-0000-0000-000000000308','kritis',25),
('00000000-0000-0000-0000-000000000409','Tim E1','00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000209','00000000-0000-0000-0000-000000000309','aman',72),
('00000000-0000-0000-0000-000000000410','Tim E2','00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000210','00000000-0000-0000-0000-000000000310','aman',74)
on conflict (id) do update set name = excluded.name, campus_id = excluded.campus_id, umkm_id = excluded.umkm_id, lecturer_id = excluded.lecturer_id, status = excluded.status, progress = excluded.progress;

insert into app_users (id, name, email, role, campus_id, umkm_id, team_id, status) values
('00000000-0000-0000-0000-000000000801','UMKM Dnd Cake n Cookie','umkm1@example.com','umkm',null,'00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000401','active'),
('00000000-0000-0000-0000-000000000802','UMKM Rumah Makan Rajalele','umkm2@example.com','umkm',null,'00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000402','active'),
('00000000-0000-0000-0000-000000000803','UMKM JJ Catering','umkm3@example.com','umkm',null,'00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000403','active'),
('00000000-0000-0000-0000-000000000804','UMKM Kamiz Chocs','umkm4@example.com','umkm',null,'00000000-0000-0000-0000-000000000204','00000000-0000-0000-0000-000000000404','active'),
('00000000-0000-0000-0000-000000000805','UMKM Central Charcoal','umkm5@example.com','umkm',null,'00000000-0000-0000-0000-000000000205','00000000-0000-0000-0000-000000000405','active'),
('00000000-0000-0000-0000-000000000806','UMKM Deshanda Craft','umkm6@example.com','umkm',null,'00000000-0000-0000-0000-000000000206','00000000-0000-0000-0000-000000000406','active'),
('00000000-0000-0000-0000-000000000807','UMKM 3 Shesca','umkm7@example.com','umkm',null,'00000000-0000-0000-0000-000000000207','00000000-0000-0000-0000-000000000407','active'),
('00000000-0000-0000-0000-000000000808','UMKM Madu RR Arisi','umkm8@example.com','umkm',null,'00000000-0000-0000-0000-000000000208','00000000-0000-0000-0000-000000000408','active'),
('00000000-0000-0000-0000-000000000809','UMKM Keripik Cumi Mina','umkm9@example.com','umkm',null,'00000000-0000-0000-0000-000000000209','00000000-0000-0000-0000-000000000409','active'),
('00000000-0000-0000-0000-000000000810','UMKM Bangka Ecoprint','umkm10@example.com','umkm',null,'00000000-0000-0000-0000-000000000210','00000000-0000-0000-0000-000000000410','active')
on conflict (id) do update set name = excluded.name, email = excluded.email, role = excluded.role, campus_id = excluded.campus_id, umkm_id = excluded.umkm_id, team_id = excluded.team_id, status = excluded.status;

insert into app_users (id, name, email, role, campus_id, team_id, status) values
('00000000-0000-0000-0000-000000000701','Mahasiswa A1-1','student.a1.1@example.com','mahasiswa','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000401','active'),
('00000000-0000-0000-0000-000000000702','Mahasiswa A1-2','student.a1.2@example.com','mahasiswa','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000401','active'),
('00000000-0000-0000-0000-000000000703','Mahasiswa A1-3','student.a1.3@example.com','mahasiswa','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000401','active'),
('00000000-0000-0000-0000-000000000704','Mahasiswa A2-1','student.a2.1@example.com','mahasiswa','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000402','active'),
('00000000-0000-0000-0000-000000000705','Mahasiswa A2-2','student.a2.2@example.com','mahasiswa','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000402','active'),
('00000000-0000-0000-0000-000000000706','Mahasiswa A2-3','student.a2.3@example.com','mahasiswa','00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000402','active'),
('00000000-0000-0000-0000-000000000707','Mahasiswa B1-1','student.b1.1@example.com','mahasiswa','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000403','active'),
('00000000-0000-0000-0000-000000000708','Mahasiswa B1-2','student.b1.2@example.com','mahasiswa','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000403','active'),
('00000000-0000-0000-0000-000000000709','Mahasiswa B1-3','student.b1.3@example.com','mahasiswa','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000403','active'),
('00000000-0000-0000-0000-000000000710','Mahasiswa B2-1','student.b2.1@example.com','mahasiswa','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000404','active'),
('00000000-0000-0000-0000-000000000711','Mahasiswa B2-2','student.b2.2@example.com','mahasiswa','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000404','active'),
('00000000-0000-0000-0000-000000000712','Mahasiswa B2-3','student.b2.3@example.com','mahasiswa','00000000-0000-0000-0000-000000000102','00000000-0000-0000-0000-000000000404','active'),
('00000000-0000-0000-0000-000000000713','Mahasiswa C1-1','student.c1.1@example.com','mahasiswa','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000405','active'),
('00000000-0000-0000-0000-000000000714','Mahasiswa C1-2','student.c1.2@example.com','mahasiswa','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000405','active'),
('00000000-0000-0000-0000-000000000715','Mahasiswa C1-3','student.c1.3@example.com','mahasiswa','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000405','active'),
('00000000-0000-0000-0000-000000000716','Mahasiswa C2-1','student.c2.1@example.com','mahasiswa','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000406','active'),
('00000000-0000-0000-0000-000000000717','Mahasiswa C2-2','student.c2.2@example.com','mahasiswa','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000406','active'),
('00000000-0000-0000-0000-000000000718','Mahasiswa C2-3','student.c2.3@example.com','mahasiswa','00000000-0000-0000-0000-000000000103','00000000-0000-0000-0000-000000000406','active'),
('00000000-0000-0000-0000-000000000719','Mahasiswa D1-1','student.d1.1@example.com','mahasiswa','00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000407','active'),
('00000000-0000-0000-0000-000000000720','Mahasiswa D1-2','student.d1.2@example.com','mahasiswa','00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000407','active'),
('00000000-0000-0000-0000-000000000721','Mahasiswa D1-3','student.d1.3@example.com','mahasiswa','00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000407','active'),
('00000000-0000-0000-0000-000000000722','Mahasiswa D2-1','student.d2.1@example.com','mahasiswa','00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000408','active'),
('00000000-0000-0000-0000-000000000723','Mahasiswa D2-2','student.d2.2@example.com','mahasiswa','00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000408','active'),
('00000000-0000-0000-0000-000000000724','Mahasiswa D2-3','student.d2.3@example.com','mahasiswa','00000000-0000-0000-0000-000000000104','00000000-0000-0000-0000-000000000408','active'),
('00000000-0000-0000-0000-000000000725','Mahasiswa E1-1','student.e1.1@example.com','mahasiswa','00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000409','active'),
('00000000-0000-0000-0000-000000000726','Mahasiswa E1-2','student.e1.2@example.com','mahasiswa','00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000409','active'),
('00000000-0000-0000-0000-000000000727','Mahasiswa E1-3','student.e1.3@example.com','mahasiswa','00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000409','active'),
('00000000-0000-0000-0000-000000000728','Mahasiswa E2-1','student.e2.1@example.com','mahasiswa','00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000410','active'),
('00000000-0000-0000-0000-000000000729','Mahasiswa E2-2','student.e2.2@example.com','mahasiswa','00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000410','active'),
('00000000-0000-0000-0000-000000000730','Mahasiswa E2-3','student.e2.3@example.com','mahasiswa','00000000-0000-0000-0000-000000000105','00000000-0000-0000-0000-000000000410','active')
on conflict (id) do update set name = excluded.name, email = excluded.email, role = excluded.role, campus_id = excluded.campus_id, team_id = excluded.team_id, status = excluded.status;

insert into team_members (team_id, user_id, member_role)
select team_id, id, 'member'
from app_users
where role = 'mahasiswa'
on conflict (team_id, user_id) do nothing;

insert into courses (id, title, description, start_date, end_date) values
('00000000-0000-0000-0000-000000000501','Pelatihan Babel Youthpreneur 2026','Course pelatihan Juli. Setiap minggu satu sesi setengah hari dengan minimal dua materi.','2026-07-01','2026-07-31')
on conflict (id) do update set title = excluded.title, description = excluded.description, start_date = excluded.start_date, end_date = excluded.end_date;

insert into sessions (id, course_id, title, session_date, start_time, end_time, location_name, latitude, longitude, radius_meters, qr_token, qr_active_from, qr_active_until) values
('00000000-0000-0000-0000-000000000601','00000000-0000-0000-0000-000000000501','Orientasi Program dan Etika Pendampingan UMKM','2026-07-07','08:00','12:00','Aula Program',-2.13160,106.11690,150,'demo-token-1','2026-07-07 07:30:00+07','2026-07-07 12:30:00+07'),
('00000000-0000-0000-0000-000000000602','00000000-0000-0000-0000-000000000501','Digital Branding dan Copywriting','2026-07-14','08:00','12:00','Aula Program',-2.13160,106.11690,150,'demo-token-2','2026-07-14 07:30:00+07','2026-07-14 12:30:00+07'),
('00000000-0000-0000-0000-000000000603','00000000-0000-0000-0000-000000000501','Foto Produk dan Video Pendek','2026-07-21','08:00','12:00','Aula Program',-2.13160,106.11690,150,'demo-token-3','2026-07-21 07:30:00+07','2026-07-21 12:30:00+07'),
('00000000-0000-0000-0000-000000000604','00000000-0000-0000-0000-000000000501','Landing Page/Katalog Digital dan Strategi Konten','2026-07-28','08:00','12:00','Aula Program',-2.13160,106.11690,150,'demo-token-4','2026-07-28 07:30:00+07','2026-07-28 12:30:00+07')
on conflict (id) do update set title = excluded.title, session_date = excluded.session_date, start_time = excluded.start_time, end_time = excluded.end_time, location_name = excluded.location_name, latitude = excluded.latitude, longitude = excluded.longitude, radius_meters = excluded.radius_meters, qr_token = excluded.qr_token, qr_active_from = excluded.qr_active_from, qr_active_until = excluded.qr_active_until;

insert into challenge_categories (id, name, max_score, sort_order) values
('00000000-0000-0000-0000-000000000901','Best Digital Branding',100,1),
('00000000-0000-0000-0000-000000000902','Best Social Media Growth',100,2),
('00000000-0000-0000-0000-000000000903','Best Product Campaign',100,3),
('00000000-0000-0000-0000-000000000904','Best Website/Landing Page',100,4),
('00000000-0000-0000-0000-000000000905','Best Content Strategy',100,5)
on conflict (id) do update set name = excluded.name, max_score = excluded.max_score, sort_order = excluded.sort_order;

insert into app_settings (key, value, description) values
('attendance.qr_ttl_seconds', '15'::jsonb, 'Masa berlaku token QR dinamis dalam detik'),
('attendance.offline_grace_seconds', '300'::jsonb, 'Grace period sinkronisasi presensi offline sebelum wajib review manual'),
('reports.export_mode', '"server"'::jsonb, 'Export produksi harus diproses server-side')
on conflict (key) do update set value = excluded.value, description = excluded.description;
