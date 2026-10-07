import { createClient } from '@supabase/supabase-js';
import { type Registrant } from '../data/registrantsData';

// 1. Ambil Kredensial Supabase dari Environment Variables (.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.includes('supabase.co') && 
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// =========================================================================
// 2. FUNGSI SINKRONISASI REGISTRANTS
// =========================================================================

export const fetchRegistrantsFromSupabase = async (): Promise<Registrant[] | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('registrants')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabase fetch registrants error:', error);
      return null;
    }

    if (!data) return null;

    // Normalisasi field snake_case database ke camelCase aplikasi
    return data.map((item: any) => ({
      id: item.id,
      nama: item.nama || '',
      pilihan1: item.pilihan1 || '',
      pilihan2: item.pilihan2 || '',
      berkas: item.berkas || '',
      notes: item.notes || '',
      formPenilaian: item.form_penilaian || '',
      transparansi: item.transparansi || '',
      idLine: item.id_line || '',
      tanggal: item.tanggal || '',
      waktu: item.waktu || '',
      panelis1: item.panelis1 || '',
      panelis2: item.panelis2 || '',
      ruangan: item.ruangan || '',
      lembagaLain: item.lembaga_lain || '',
      humas: item.humas || '',
      udahChat: item.udah_chat || 'Belum',
      bisaInterview: item.bisa_interview || 'Belum',
      lulusLkmm: item.lulus_lkmm || 'Lulus',
      statusInterview: item.status_interview || 'Belum',
      statusPlotting: item.status_plotting || 'Belum',
      sudahResched: item.sudah_resched || 'Belum'
    }));
  } catch (err) {
    console.error('Supabase fetch exception:', err);
    return null;
  }
};

export const upsertRegistrantsToSupabase = async (registrants: Registrant[]): Promise<boolean> => {
  if (!supabase || registrants.length === 0) return false;

  try {
    const dbPayload = registrants.map(r => ({
      id: r.id,
      nama: r.nama,
      pilihan1: r.pilihan1,
      pilihan2: r.pilihan2,
      berkas: r.berkas,
      notes: r.notes || '',
      form_penilaian: r.formPenilaian || '',
      transparansi: r.transparansi || '',
      id_line: r.idLine || '',
      tanggal: r.tanggal || '',
      waktu: r.waktu || '',
      panelis1: r.panelis1 || '',
      panelis2: r.panelis2 || '',
      ruangan: r.ruangan || '',
      lembaga_lain: r.lembagaLain || '',
      humas: r.humas || '',
      udah_chat: r.udahChat || 'Belum',
      bisa_interview: r.bisaInterview || 'Belum',
      lulus_lkmm: r.lulusLkmm || 'Lulus',
      status_interview: r.statusInterview || 'Belum',
      status_plotting: r.statusPlotting || 'Belum',
      sudah_resched: r.sudahResched || 'Belum'
    }));

    const { error } = await supabase
      .from('registrants')
      .upsert(dbPayload, { onConflict: 'id' });

    if (error) {
      console.error('Supabase upsert registrants error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase upsert exception:', err);
    return false;
  }
};

export const updateSingleRegistrantInSupabase = async (
  id: number,
  updates: Partial<Registrant>
): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const dbUpdates: Record<string, any> = {};
    if (updates.nama !== undefined) dbUpdates.nama = updates.nama;
    if (updates.pilihan1 !== undefined) dbUpdates.pilihan1 = updates.pilihan1;
    if (updates.pilihan2 !== undefined) dbUpdates.pilihan2 = updates.pilihan2;
    if (updates.berkas !== undefined) dbUpdates.berkas = updates.berkas;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.formPenilaian !== undefined) dbUpdates.form_penilaian = updates.formPenilaian;
    if (updates.transparansi !== undefined) dbUpdates.transparansi = updates.transparansi;
    if (updates.idLine !== undefined) dbUpdates.id_line = updates.idLine;
    if (updates.tanggal !== undefined) dbUpdates.tanggal = updates.tanggal;
    if (updates.waktu !== undefined) dbUpdates.waktu = updates.waktu;
    if (updates.panelis1 !== undefined) dbUpdates.panelis1 = updates.panelis1;
    if (updates.panelis2 !== undefined) dbUpdates.panelis2 = updates.panelis2;
    if (updates.ruangan !== undefined) dbUpdates.ruangan = updates.ruangan;
    if (updates.lembagaLain !== undefined) dbUpdates.lembaga_lain = updates.lembagaLain;
    if (updates.humas !== undefined) dbUpdates.humas = updates.humas;
    if (updates.udahChat !== undefined) dbUpdates.udah_chat = updates.udahChat;
    if (updates.bisaInterview !== undefined) dbUpdates.bisa_interview = updates.bisaInterview;
    if (updates.lulusLkmm !== undefined) dbUpdates.lulus_lkmm = updates.lulusLkmm;
    if (updates.statusInterview !== undefined) dbUpdates.status_interview = updates.statusInterview;
    if (updates.statusPlotting !== undefined) dbUpdates.status_plotting = updates.statusPlotting;
    if (updates.sudahResched !== undefined) dbUpdates.sudah_resched = updates.sudahResched;

    const { error } = await supabase
      .from('registrants')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Supabase update single registrant error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase update exception:', err);
    return false;
  }
};

// =========================================================================
// 3. FUNGSI SINKRONISASI KETERSEDIAAN JADWAL (AVAILABILITY)
// =========================================================================

export const fetchAvailabilityFromSupabase = async (): Promise<Record<string, boolean> | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('panelist_availability')
      .select('panelist_name, date_str, time_slot, is_available')
      .eq('is_available', true);

    if (error) {
      console.error('Supabase fetch availability error:', error);
      return null;
    }

    if (!data) return null;

    const map: Record<string, boolean> = {};
    data.forEach(item => {
      const key = `${item.panelist_name}|${item.date_str}|${item.time_slot}`;
      map[key] = item.is_available;
    });

    return map;
  } catch (err) {
    console.error('Supabase fetch availability exception:', err);
    return null;
  }
};

export const upsertAvailabilityToSupabase = async (
  availabilityMap: Record<string, boolean>
): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const records: { panelist_name: string; date_str: string; time_slot: string; is_available: boolean }[] = [];

    for (const key in availabilityMap) {
      const parts = key.split('|');
      if (parts.length === 3) {
        records.push({
          panelist_name: parts[0],
          date_str: parts[1],
          time_slot: parts[2],
          is_available: availabilityMap[key] === true
        });
      }
    }

    if (records.length === 0) return true;

    // Batch upsert in chunks of 500 to avoid payload size limit
    const chunkSize = 500;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('panelist_availability')
        .upsert(chunk, { onConflict: 'panelist_name,date_str,time_slot' });

      if (error) {
        console.error('Supabase upsert availability chunk error:', error);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error('Supabase upsert availability exception:', err);
    return false;
  }
};

// =========================================================================
// 4. REALTIME LISTENER (LIVE COLLABORATION)
// =========================================================================

export const subscribeToRegistrantsRealtime = (
  onUpdate: (payload: any) => void
) => {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('realtime_registrants')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'registrants' },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
