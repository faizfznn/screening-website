-- =========================================================================
-- DATABASE SCHEMA SUPABASE: SELEKSI STAFF SGE BEM FILKOM UB 2026
-- Jalankan skrip ini di: Supabase Dashboard > SQL Editor > New Query > Run
-- =========================================================================

-- 1. EXTENSIONS & CLEANUP
create extension if not exists "uuid-ossp";

-- Drop tables jika sudah ada (opsional jika ingin reset bersih)
-- drop table if exists panelist_availability cascade;
-- drop table if exists panelist_hierarchy cascade;
-- drop table if exists registrants cascade;

-- =========================================================================
-- 2. TABEL PENDAFTAR (REGISTRANTS)
-- =========================================================================
create table if not exists registrants (
  id integer primary key,
  nama text not null,
  pilihan1 text default '',
  pilihan2 text default '',
  berkas text default '',
  notes text default '',
  form_penilaian text default '',
  transparansi text default '',
  id_line text default '',
  tanggal text default '',
  waktu text default '',
  panelis1 text default '',
  panelis2 text default '',
  ruangan text default '',
  lembaga_lain text default '',
  humas text default '',
  udah_chat text default 'Belum',
  bisa_interview text default 'Belum',
  lulus_lkmm text default 'Lulus',
  status_interview text default 'Belum',
  status_plotting text default 'Belum',
  sudah_resched text default 'Belum',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================================
-- 3. TABEL HIRARKI PANELIS (BoD, C-Level, IRE, Mentor, Staff)
-- =========================================================================
create table if not exists panelist_hierarchy (
  id serial primary key,
  category text not null, -- 'BoD' | 'C-Level' | 'IRE' | 'Mentor' | 'Staff'
  minbur text not null,   -- 'Human Capital', 'Talent Growth', 'President', dll
  panelist_name text not null,
  created_at timestamptz default now(),
  unique (category, minbur, panelist_name)
);

-- =========================================================================
-- 4. TABEL KETERSEDIAAN JADWAL PANELIS (AVAILABILITY)
-- =========================================================================
create table if not exists panelist_availability (
  id serial primary key,
  panelist_name text not null,
  date_str text not null,  -- Contoh: 'Senin, 05 Oktober 2026'
  time_slot text not null, -- Contoh: '10:30 - 11:30'
  is_available boolean default true,
  updated_at timestamptz default now(),
  unique (panelist_name, date_str, time_slot)
);

-- =========================================================================
-- 5. INDEXES UNTUK PERFORMA TINGGI
-- =========================================================================
create index if not exists idx_registrants_nama on registrants(nama);
create index if not exists idx_registrants_tanggal on registrants(tanggal);
create index if not exists idx_registrants_waktu on registrants(waktu);
create index if not exists idx_availability_lookup on panelist_availability(panelist_name, date_str, time_slot);
create index if not exists idx_hierarchy_cat_minbur on panelist_hierarchy(category, minbur);

-- =========================================================================
-- 6. TRIGGER AUTO-UPDATE TIMESTAMP
-- =========================================================================
create or replace function update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

drop trigger if exists update_registrants_modtime on registrants;
create trigger update_registrants_modtime
before update on registrants
for each row execute function update_modified_column();

drop trigger if exists update_availability_modtime on panelist_availability;
create trigger update_availability_modtime
before update on panelist_availability
for each row execute function update_modified_column();

-- =========================================================================
-- 7. ROW LEVEL SECURITY (RLS) & POLICIES (Akses Publik / Anon)
-- =========================================================================
alter table registrants enable row level security;
alter table panelist_hierarchy enable row level security;
alter table panelist_availability enable row level security;

-- Policy Registrants: Baca & Tulis Publik
drop policy if exists "Allow all read on registrants" on registrants;
create policy "Allow all read on registrants" on registrants for select using (true);

drop policy if exists "Allow all insert on registrants" on registrants;
create policy "Allow all insert on registrants" on registrants for insert with check (true);

drop policy if exists "Allow all update on registrants" on registrants;
create policy "Allow all update on registrants" on registrants for update using (true);

drop policy if exists "Allow all delete on registrants" on registrants;
create policy "Allow all delete on registrants" on registrants for delete using (true);

-- Policy Hierarchy: Baca & Tulis Publik
drop policy if exists "Allow all read on hierarchy" on panelist_hierarchy;
create policy "Allow all read on hierarchy" on panelist_hierarchy for select using (true);

drop policy if exists "Allow all write on hierarchy" on panelist_hierarchy;
create policy "Allow all write on hierarchy" on panelist_hierarchy for all using (true);

-- Policy Availability: Baca & Tulis Publik
drop policy if exists "Allow all read on availability" on panelist_availability;
create policy "Allow all read on availability" on panelist_availability for select using (true);

drop policy if exists "Allow all write on availability" on panelist_availability;
create policy "Allow all write on availability" on panelist_availability for all using (true);

-- =========================================================================
-- 8. AKTIFKAN REALTIME REPLICATION (Untuk Kolaborasi Live)
-- =========================================================================
alter publication supabase_realtime add table registrants;
alter publication supabase_realtime add table panelist_availability;
alter publication supabase_realtime add table panelist_hierarchy;
