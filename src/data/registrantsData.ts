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
  notes?: string;
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
  "Senin, 05 Oktober 2026",
  "Selasa, 06 Oktober 2026",
  "Rabu, 07 Oktober 2026",
  "Kamis, 08 Oktober 2026",
  "Jumat, 09 Oktober 2026",
  "Sabtu, 10 Oktober 2026"
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

export const MAIN_CATEGORIES = ["BoD", "C-Level", "IRE", "Mentor", "Staff"] as const;

export const INITIAL_HIERARCHY: Record<string, Record<string, string[]>> = {
  "BoD": {
    "President": ["Kak Daffa"],
    "Vice President": ["Kak Agest"],
    "Cabinet’s Advisor": ["Kak Erza"],
    "Cabinet’s Secretary": ["Kak Ailsa"],
    "Director of Advocacy and Networks": ["Kak Maulidya"],
    "Director of Development": ["Kak Rizwan"],
    "Director of Sociopolitical Activism": ["Kak Zahra"],
    "Director of Internal Catalyst": ["Kak RARA"],
    "Head of Internal Resource Empowerment": ["Kak Vanes"],
    "Vice Head of Capacity Development": ["Kak Semi"],
    "Vice Head of Team Engagement": ["Kak Iky"]
  },
  "C-Level": {
    "Human Capital": ["Abdil", "Rafi", "Fara"],
    "Talent Growth": ["Dzakir", "Bimo", "Layla"],
    "Creative Enterprise": ["Azka", "Niken", "Ozza"],
    "Social Equity and Environment": ["Raihan", "Zanita", "Ninda"],
    "Inter-Agency Affairs": ["Jeqy", "Hessi", "Gangsar"],
    "Student Advocacy and Welfare": ["Syarief", "Nayla", "Juno"],
    "Studies and Strategic Action": ["Farel", "Bintang", "Dzikra"],
    "Administration and Finance": ["Nayla Shafa", "Cantika", "Fatih"],
    "Creative Media and Information": ["Ezra", "Awa", "Ifka"],
    "IT Solution": ["Naufal", "Novita", "Fernando"]
  },
  "IRE": {
    "Human Capital": ["Daffa"],
    "Talent Growth": ["Uma"],
    "Creative Enterprise": ["Alin"],
    "Social Equity and Environment": ["Andhika"],
    "Studies and Strategic Action": ["Syakila"],
    "Inter-Agency Affairs": ["Zea"],
    "Student Advocacy and Welfare": ["Ifaah"],
    "Administration and Finance": ["Afi"],
    "Creative Media and Information": ["Syauqi"],
    "IT Solution": ["Alushya"]
  },
  "Mentor": {
    "Human Capital": ["Umar", "Lana"],
    "Talent Growth": ["Aloy", "Nisa"],
    "Creative Enterprise": ["Michael", "Azra"],
    "Social Equity and Environment": ["Brian", "Andina"],
    "Inter-Agency Affairs": ["Jovant", "Mone"],
    "Student Advocacy and Welfare": ["Zaldi", "Rahmah"],
    "Studies and Strategic Action": ["Rouf", "Lulu"],
    "Administration and Finance": ["Alvin", "Reva"],
    "Creative Media and Information": ["Callysta", "Eksel"],
    "IT Solution": ["Rhyu", "Inas"]
  },
  "Staff": {
    "Human Capital": ["Luffi", "Zhafir", "Matthew", "Dinda", "Viona", "Queen", "Naura"],
    "Talent Growth": ["Bili", "Faiq", "Clau", "Ananda", "Ferren", "Refi", "Yenny", "Ais"],
    "Creative Enterprise": ["Qilla", "Putty", "Samuel", "Boy", "Zaki", "Alya", "Fairuz", "Rafi"],
    "Social Equity and Environment": ["Sharen", "Jaler", "Meyza", "Patrick", "Novel", "Aqil", "Nabilla", "Kalin"],
    "Inter-Agency Affairs": ["Ezy", "Rafly", "Rakdut", "Adhi", "Putra", "Intan", "Ilfa", "Devi"],
    "Student Advocacy and Welfare": ["Parjak", "Senja", "Inka", "Ryan", "Arfa", "Anggun", "Asya", "Aulia"],
    "Studies and Strategic Action": ["Alif", "Mei", "Varel", "Alya", "Lyan", "Luki", "Mujek", "Nauvaldo"],
    "Administration and Finance": ["Sassy", "Sam", "Nadilla", "Ghif", "Wirya", "Intan", "Jefry"],
    "Creative Media and Information": ["Wanda", "Akbar", "Yhayhan", "Damar", "Luvi", "Tabina", "Cicu"],
    "IT Solution": ["Rifky", "Zalfa", "Tsany", "Lintang", "Fadhil", "Nayla", "Rosy"]
  }
};

export const getHierarchyData = (): Record<string, Record<string, string[]>> => {
  try {
    const saved = localStorage.getItem('panelists_hierarchy_v4');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_HIERARCHY;
};

export const saveHierarchyData = (data: Record<string, Record<string, string[]>>) => {
  try {
    localStorage.setItem('panelists_hierarchy_v4', JSON.stringify(data));
    window.dispatchEvent(new Event('hierarchy_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error(e);
  }
};

export const ACRONYMS: Record<string, string> = {
  "Human Capital": "HC",
  "Talent Growth": "TG",
  "Creative Enterprise": "CE",
  "Social Equity and Environment": "SEE",
  "Social Equity & Environment": "SEE",
  "Studies and Strategic Action": "SSA",
  "Studies & Strategic Action": "SSA",
  "Inter-Agency Affairs": "IAA",
  "Student Advocacy and Welfare": "SAW",
  "Student Advocacy & Welfare": "SAW",
  "Administration and Finance": "AF",
  "Administration & Finance": "AF",
  "Creative Media and Information": "CMI",
  "Creative Media & Information": "CMI",
  "IT Solution": "ITS"
};

export const formatPanelistLabel = (panelistName: string, hierarchyData?: Record<string, Record<string, string[]>>): string => {
  if (!panelistName) return "";
  const info = getPanelistInfo(panelistName, hierarchyData);
  if (info.category !== "Other") {
    return `${info.name} - ${info.category} - ${info.shortMinbur}`;
  }
  return panelistName;
};

export const ROLE_PRIORITY: Record<string, number> = {
  "Mentor": 1,
  "Staff": 2,
  "C-Level": 3,
  "IRE": 4,
  "BoD": 5
};

export interface PanelistInfo {
  name: string;
  category: string;
  minbur: string;
  shortMinbur: string;
}

export const getPanelistInfo = (name: string, hierarchyData?: Record<string, Record<string, string[]>>): PanelistInfo => {
  const tree = hierarchyData || getHierarchyData();
  const cleanName = (name || "").trim().toLowerCase();

  for (const cat of Object.keys(tree)) {
    const minburs = tree[cat] || {};
    for (const mb of Object.keys(minburs)) {
      const names = minburs[mb] || [];
      if (names.some(n => n.trim().toLowerCase() === cleanName)) {
        return {
          name,
          category: cat,
          minbur: mb,
          shortMinbur: ACRONYMS[mb] || mb
        };
      }
    }
  }

  return {
    name,
    category: "Other",
    minbur: "General",
    shortMinbur: "GEN"
  };
};

export const sortPanelistsByPriority = (
  panelistNames: string[],
  pilihan1: string,
  pilihan2: string,
  hierarchyData?: Record<string, Record<string, string[]>>
): string[] => {
  const p1Lower = (pilihan1 || "").trim().toLowerCase();
  const p2Lower = (pilihan2 || "").trim().toLowerCase();

  return [...panelistNames].sort((a, b) => {
    const infoA = getPanelistInfo(a, hierarchyData);
    const infoB = getPanelistInfo(b, hierarchyData);

    const aMbLower = infoA.minbur.toLowerCase();
    const aShortMbLower = infoA.shortMinbur.toLowerCase();
    const bMbLower = infoB.minbur.toLowerCase();
    const bShortMbLower = infoB.shortMinbur.toLowerCase();

    // 1. Choice match: 1 for Pilihan 1, 2 for Pilihan 2, 3 for other
    const aChoiceScore = (p1Lower && (aMbLower === p1Lower || aShortMbLower === p1Lower || aMbLower.includes(p1Lower) || p1Lower.includes(aMbLower))) ? 1
      : (p2Lower && (aMbLower === p2Lower || aShortMbLower === p2Lower || aMbLower.includes(p2Lower) || p2Lower.includes(aMbLower))) ? 2
      : 3;

    const bChoiceScore = (p1Lower && (bMbLower === p1Lower || bShortMbLower === p1Lower || bMbLower.includes(p1Lower) || p1Lower.includes(bMbLower))) ? 1
      : (p2Lower && (bMbLower === p2Lower || bShortMbLower === p2Lower || bMbLower.includes(p2Lower) || p2Lower.includes(bMbLower))) ? 2
      : 3;

    if (aChoiceScore !== bChoiceScore) {
      return aChoiceScore - bChoiceScore;
    }

    // 2. Role hierarchy: Mentor (1) > Staff (2) > C-Level (3) > IRE (4) > BoD (5)
    const aRoleScore = ROLE_PRIORITY[infoA.category] || 99;
    const bRoleScore = ROLE_PRIORITY[infoB.category] || 99;

    if (aRoleScore !== bRoleScore) {
      return aRoleScore - bRoleScore;
    }

    // 3. Alphabetical fallback
    return a.localeCompare(b);
  });
};

export const INITIAL_PANELISTS: Record<string, string[]> = {};

export const DEFAULT_AVAILABILITY: Record<string, boolean> = {};

export const INITIAL_REGISTRANTS: Registrant[] = [];

export const getAvailabilityData = (): Record<string, boolean> => {
  try {
    const saved = localStorage.getItem('schedule_availability_v4');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_AVAILABILITY;
};

export const saveAvailabilityData = (data: Record<string, boolean>) => {
  try {
    localStorage.setItem('schedule_availability_v4', JSON.stringify(data));
    window.dispatchEvent(new Event('availability_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error(e);
  }
};

export const getRegistrantsData = (): Registrant[] => {
  try {
    const saved = localStorage.getItem('registrants_data_v4');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_REGISTRANTS;
};

export const mergeRegistrants = (incoming: Registrant[], existing: Registrant[]): Registrant[] => {
  if (!existing || existing.length === 0) return incoming;

  const existingMap = new Map<number, Registrant>();
  existing.forEach(r => existingMap.set(r.id, r));

  return incoming.map(inc => {
    const prev = existingMap.get(inc.id);
    if (!prev) return inc;

    return {
      ...inc,
      // Core spreadsheet info
      nama: inc.nama || prev.nama,
      pilihan1: inc.pilihan1 || prev.pilihan1,
      pilihan2: inc.pilihan2 || prev.pilihan2,
      berkas: inc.berkas || prev.berkas,
      idLine: inc.idLine || prev.idLine,
      
      // Preserve operational plotting & interview fields if already filled locally
      tanggal: prev.tanggal || inc.tanggal || "",
      waktu: prev.waktu || inc.waktu || "",
      panelis1: prev.panelis1 || inc.panelis1 || "",
      panelis2: prev.panelis2 || inc.panelis2 || "",
      ruangan: prev.ruangan || inc.ruangan || "",
      notes: prev.notes || inc.notes || "",
      lembagaLain: prev.lembagaLain || inc.lembagaLain || "",
      formPenilaian: prev.formPenilaian || inc.formPenilaian || "",
      transparansi: prev.transparansi || inc.transparansi || "",
      humas: prev.humas || inc.humas || "",
      udahChat: prev.udahChat !== 'Belum' ? prev.udahChat : (inc.udahChat || 'Belum'),
      bisaInterview: prev.bisaInterview !== 'Belum' ? prev.bisaInterview : (inc.bisaInterview || 'Belum'),
      lulusLkmm: prev.lulusLkmm || inc.lulusLkmm || 'Lulus',
      statusInterview: prev.statusInterview !== 'Belum' ? prev.statusInterview : (inc.statusInterview || 'Belum'),
      statusPlotting: prev.statusPlotting !== 'Belum' ? prev.statusPlotting : (inc.statusPlotting || 'Belum'),
      sudahResched: prev.sudahResched !== 'Belum' ? prev.sudahResched : (inc.sudahResched || 'Belum'),
    };
  });
};

export const saveRegistrantsData = (data: Registrant[]) => {
  try {
    localStorage.setItem('registrants_data_v4', JSON.stringify(data));
    window.dispatchEvent(new Event('registrants_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error(e);
  }
};
