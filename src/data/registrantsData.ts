export type Registrant = {
  id: number;
  tanggal: string;
  waktu: string;
  panelis1: string;
  panelis2: string;
  ruangan: string;
  nama: string;
  pilihan1: string;
  pilihan2: string;
  berkas: string;
  lembagaLain: string;
  formPenilaian: string;
  transparansi: string;
  idLine: string;
  humas: string;
  udahChat: string;
  bisaInterview: string;
  lulusLkmm: string;
  statusInterview: string;
  statusPlotting: string;
  sudahResched: string;
};

export const DATES = [
  "Rabu, 07 Oktober 2026",
  "Kamis, 08 Oktober 2026",
  "Jumat, 09 Oktober 2026",
];

export const TIME_SLOTS = [
  "10:30 - 11:30",
  "12:00 - 13:00",
  "13:30 - 14:30",
  "15:00 - 16:00",
  "16:30 - 17:30",
  "18:00 - 19:00",
  "19:00 - 20:00"
];

// Data awal 10 pendaftar (hanya memuat ID, Nama, Pilihan 1 & 2, Berkas, dan ID Line)
export const INITIAL_REGISTRANTS: Registrant[] = [
  {
    id: 1,
    nama: "Salman Al Faritsi",
    pilihan1: "Social Equity & Enviroment",
    pilihan2: "",
    berkas: "Berkas_Salman.pdf",
    idLine: "salman_123",
    tanggal: "",
    waktu: "",
    panelis1: "",
    panelis2: "",
    ruangan: "",
    lembagaLain: "",
    formPenilaian: "",
    transparansi: "",
    humas: "",
    udahChat: "Belum",
    bisaInterview: "Belum",
    lulusLkmm: "Belum",
    statusInterview: "Belum",
    statusPlotting: "Belum",
    sudahResched: "Belum"
  },
  {
    id: 2,
    nama: "Dhikalaaffaiz Marisky",
    pilihan1: "Inter-Agency Affairs",
    pilihan2: "",
    berkas: "Berkas_Dhika.pdf",
    idLine: "dhika_m",
    tanggal: "",
    waktu: "",
    panelis1: "",
    panelis2: "",
    ruangan: "",
    lembagaLain: "",
    formPenilaian: "",
    transparansi: "",
    humas: "",
    udahChat: "Belum",
    bisaInterview: "Belum",
    lulusLkmm: "Belum",
    statusInterview: "Belum",
    statusPlotting: "Belum",
    sudahResched: "Belum"
  },
  {
    id: 3,
    nama: "Dennis Putra",
    pilihan1: "Creative Media & Information",
    pilihan2: "Inter-Agency Affairs",
    berkas: "Dennis_Berkas.pdf",
    idLine: "dennis_p",
    tanggal: "",
    waktu: "",
    panelis1: "",
    panelis2: "",
    ruangan: "",
    lembagaLain: "",
    formPenilaian: "",
    transparansi: "",
    humas: "",
    udahChat: "Belum",
    bisaInterview: "Belum",
    lulusLkmm: "Belum",
    statusInterview: "Belum",
    statusPlotting: "Belum",
    sudahResched: "Belum"
  },
];

export const getRegistrantsData = (): Registrant[] => {
  try {
    const saved = localStorage.getItem('registrants_data_v3');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_REGISTRANTS;
};

export const saveRegistrantsData = (data: Registrant[]) => {
  try {
    localStorage.setItem('registrants_data_v3', JSON.stringify(data));
    window.dispatchEvent(new Event('registrants_updated'));
  } catch (e) {
    console.error(e);
  }
};
