import fs from 'fs';

const supabaseUrl = 'https://xcqfgecywhpfwjhvanse.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcWZnZWN5d2hwZndqaHZhbnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNjg5MzUsImV4cCI6MjEwNjk0NDkzNX0.FtekF9kTjf_f4IDxZ0TuXIipcUadevO0tVsS7gSAL6Q';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyDFPH9ykAWu1COFEiaI2dBrf36QF-4ZNnSQ7D4FbIQ6SCbGNkf6fr_q2iFQ-UO9MQ/exec';

async function uploadToSupabase() {
  console.log('1. Fetching data from Google Apps Script...');
  const res = await fetch(APPS_SCRIPT_URL);
  const data = await res.json();

  if (data.status !== 'success') {
    console.error('Failed to fetch from Apps Script:', data);
    return;
  }

  console.log(`Fetched ${data.registrants.length} registrants, availability, and hierarchy.`);

  // 1. Upload Registrants
  console.log('2. Uploading Registrants to Supabase...');
  const registrantsPayload = data.registrants.map(r => ({
    id: r.id,
    nama: r.nama,
    pilihan1: r.pilihan1 || '',
    pilihan2: r.pilihan2 || '',
    berkas: r.berkas || '',
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

  const regRes = await fetch(supabaseUrl + '/rest/v1/registrants', {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': 'Bearer ' + supabaseKey,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(registrantsPayload)
  });

  console.log('Registrants Upload Status:', regRes.status, regRes.statusText);

  // 2. Upload Panelist Availability
  console.log('3. Uploading Availability to Supabase...');
  const availabilityMap = data.availability || {};
  const availRecords = [];
  for (const key in availabilityMap) {
    const parts = key.split('|');
    if (parts.length === 3) {
      availRecords.push({
        panelist_name: parts[0],
        date_str: parts[1],
        time_slot: parts[2],
        is_available: availabilityMap[key] === true
      });
    }
  }

  // Batch in chunks of 500
  const chunkSize = 500;
  for (let i = 0; i < availRecords.length; i += chunkSize) {
    const chunk = availRecords.slice(i, i + chunkSize);
    const avRes = await fetch(supabaseUrl + '/rest/v1/panelist_availability', {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(chunk)
    });
    console.log(`Availability Chunk ${i / chunkSize + 1} Status:`, avRes.status, avRes.statusText);
  }

  // 3. Upload Panelist Hierarchy
  console.log('4. Uploading Hierarchy to Supabase...');
  const hierarchy = data.hierarchy || {};
  const hierarchyRecords = [];
  for (const mainCat in hierarchy) {
    for (const subCat in hierarchy[mainCat]) {
      const panelistNames = hierarchy[mainCat][subCat];
      for (const name of panelistNames) {
        hierarchyRecords.push({
          category_main: mainCat,
          category_sub: subCat,
          panelist_name: name
        });
      }
    }
  }

  if (hierarchyRecords.length > 0) {
    const hierRes = await fetch(supabaseUrl + '/rest/v1/panelist_hierarchy', {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(hierarchyRecords)
    });
    console.log('Hierarchy Upload Status:', hierRes.status, hierRes.statusText);
  }

  console.log('ALL 3 TABLES SEEDED SUCCESSFULLY INTO SUPABASE!');
}

uploadToSupabase().catch(console.error);
