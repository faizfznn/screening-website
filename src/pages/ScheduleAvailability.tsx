import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Plus, Save, X, Building2, UserCircle, Briefcase, CheckCheck, XSquare, Sparkles } from 'lucide-react';
import { DATES, TIME_SLOTS } from '../data/registrantsData';

const JABATAN_LIST = ["BoD", "C-Level", "IRE"];

const MINBUR_LIST = [
  { code: "HC", name: "Human Capital" },
  { code: "TG", name: "Talent Growth" },
  { code: "CE", name: "Creative Enterprise" },
  { code: "IAA", name: "Inter-Agency Affairs" },
  { code: "SAW", name: "Student Advocacy & Welfare" },
  { code: "SEE", name: "Social Equity & Enviroment" },
  { code: "SSA", name: "Studies & Strategic Action" },
  { code: "AF", name: "Administration & Finance" },
  { code: "ITS", name: "IT Solution" },
  { code: "CMI", name: "Creative Media & Information" },
];

const INITIAL_PANELISTS: Record<string, string[]> = {
  "BoD": ["Presiden", "Wapres", "Sekjen"],
  "C-Level - HC": ["Diandra - HC", "Daffa - HC"],
  "C-Level - TG": [],
  "C-Level - CE": [],
  "C-Level - IAA": ["Zea - IAA", "Pras - IAA"],
  "C-Level - SAW": [],
  "C-Level - SEE": ["Rehan - SEE", "Rozan - SEE"],
  "C-Level - SSA": [],
  "C-Level - AF": [],
  "C-Level - ITS": [],
  "C-Level - CMI": ["Hessi - CMI"],
  "IRE - HC": [],
  "IRE - TG": [],
  "IRE - CE": [],
  "IRE - IAA": [],
  "IRE - SAW": [],
  "IRE - SEE": ["IRE 1", "IRE 2"],
  "IRE - SSA": [],
  "IRE - AF": [],
  "IRE - ITS": [],
  "IRE - CMI": [],
};

const normalizePanelistsData = (raw: any): Record<string, string[]> => {
  const result: Record<string, string[]> = { ...INITIAL_PANELISTS };
  if (!raw || typeof raw !== 'object') return result;

  Object.entries(raw).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      if (key.startsWith("Minbur - ")) {
        const code = key.replace("Minbur - ", "");
        const newKey = `C-Level - ${code}`;
        result[newKey] = Array.from(new Set([...(result[newKey] || []), ...val]));
      } else if (key === "IRE") {
        result["IRE - SEE"] = Array.from(new Set([...(result["IRE - SEE"] || []), ...val]));
      } else {
        result[key] = Array.from(new Set([...(result[key] || []), ...val]));
      }
    }
  });

  return result;
};

export default function ScheduleAvailability() {
  const [panelistsData, setPanelistsData] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('panelists_data');
    return saved ? normalizePanelistsData(JSON.parse(saved)) : INITIAL_PANELISTS;
  });

  const [selectedJabatan, setSelectedJabatan] = useState<string>("C-Level");
  const [selectedMinbur, setSelectedMinbur] = useState<string>("SEE");
  const [selectedPerson, setSelectedPerson] = useState<string>("Rehan - SEE");

  const [showModal, setShowModal] = useState(false);
  const [newPanelistName, setNewPanelistName] = useState("");

  const currentKey = selectedJabatan === "BoD" ? "BoD" : `${selectedJabatan} - ${selectedMinbur}`;
  const currentPeopleList = panelistsData[currentKey] || [];

  useEffect(() => {
    const key = selectedJabatan === "BoD" ? "BoD" : `${selectedJabatan} - ${selectedMinbur}`;
    const list = panelistsData[key] || [];
    if (list.length > 0 && !list.includes(selectedPerson)) {
      setSelectedPerson(list[0]);
    } else if (list.length === 0) {
      setSelectedPerson("");
    }
  }, [selectedJabatan, selectedMinbur, panelistsData]);

  const [availability, setAvailability] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('schedule_availability');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('schedule_availability', JSON.stringify(availability));
  }, [availability]);

  const toggleAvailability = (date: string, time: string) => {
    if (!selectedPerson) return;
    const key = `${selectedPerson}|${date}|${time}`;
    setAvailability(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const setDayAvailability = (date: string, value: boolean) => {
    if (!selectedPerson) return;
    setAvailability(prev => {
      const updated = { ...prev };
      TIME_SLOTS.forEach(time => {
        updated[`${selectedPerson}|${date}|${time}`] = value;
      });
      return updated;
    });
  };

  const handleSaveNewPanelist = () => {
    if (newPanelistName.trim() !== '') {
      const name = newPanelistName.trim();
      const key = selectedJabatan === "BoD" ? "BoD" : `${selectedJabatan} - ${selectedMinbur}`;
      const updated = {
        ...panelistsData,
        [key]: Array.from(new Set([...(panelistsData[key] || []), name]))
      };
      setPanelistsData(updated);
      setSelectedPerson(name);
      localStorage.setItem('panelists_data', JSON.stringify(updated));
      window.dispatchEvent(new Event('panelists_updated'));
      setNewPanelistName("");
      setShowModal(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('schedule_availability', JSON.stringify(availability));
    alert('Jadwal ketersediaan Anda berhasil disimpan!');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-[#f8fafc]">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Ketersediaan Panelis</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold text-xs">
              SGE 2026
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Periode Screening: <span className="font-bold text-orange-600">30 September 2026 – 09 Oktober 2026</span>. Tandai jam luang Anda untuk proses plotting.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Simpan Jadwal
        </button>
      </div>

      {/* SELECTION CONTROL PANEL */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 items-end">
          {/* 1. Pilih Jabatan */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <Briefcase className="w-3.5 h-3.5 text-orange-500" />
              Tingkat Jabatan
            </label>
            <select
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-bold text-slate-800 text-sm transition-all cursor-pointer"
              value={selectedJabatan}
              onChange={(e) => setSelectedJabatan(e.target.value)}
            >
              {JABATAN_LIST.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>

          {/* 2. Pilih Minbur */}
          {selectedJabatan !== "BoD" ? (
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <Building2 className="w-3.5 h-3.5 text-orange-500" />
                Kementerian / Biro
              </label>
              <select
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-bold text-slate-800 text-sm transition-all cursor-pointer"
                value={selectedMinbur}
                onChange={(e) => setSelectedMinbur(e.target.value)}
              >
                {MINBUR_LIST.map(m => (
                  <option key={m.code} value={m.code}>
                    {m.code} - {m.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="hidden md:block">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Kategori
              </label>
              <div className="p-2.5 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
                BoD (Tidak Memerlukan Minbur)
              </div>
            </div>
          )}

          {/* 3. Pilih Nama Panelis */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <UserCircle className="w-3.5 h-3.5 text-orange-500" />
                Nama Panelis
              </label>
              <button
                onClick={() => setShowModal(true)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Tambah
              </button>
            </div>
            {currentPeopleList.length > 0 ? (
              <select
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-bold text-slate-800 text-sm transition-all cursor-pointer"
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
              >
                {currentPeopleList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="w-full p-2.5 bg-orange-50 border border-dashed border-orange-300 rounded-xl text-orange-600 font-bold text-xs hover:bg-orange-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Nama Panelis
              </button>
            )}
          </div>

          {/* 4. Panelis Aktif Card */}
          <div>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-2.5 rounded-xl border border-orange-200/80 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold text-orange-600 uppercase">Panelis Terpilih</p>
                <p className="text-xs font-extrabold text-orange-950 truncate">
                  {selectedPerson || "Belum dipilih"}
                </p>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-orange-200 text-orange-800 rounded-md shrink-0">
                Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SCHEDULE GRID */}
      {selectedPerson ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5">
          {DATES.map(date => {
            const availableCount = TIME_SLOTS.filter(time => availability[`${selectedPerson}|${date}|${time}`] === true).length;
            const percentAvailable = Math.round((availableCount / TIME_SLOTS.length) * 100);

            return (
              <div key={date} className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden flex flex-col hover:border-orange-300 hover:shadow-md transition-all">
                {/* DATE CARD HEADER */}
                <div className="bg-slate-50/90 px-5 py-3.5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-800">{date}</h2>
                      <p className="text-[11px] font-semibold text-emerald-600">
                        {availableCount} dari {TIME_SLOTS.length} Slot Luang ({percentAvailable}%)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      onClick={() => setDayAvailability(date, true)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1 transition-all cursor-pointer"
                      title="Set Semua Bisa"
                    >
                      <CheckCheck className="w-3 h-3" /> Semua Bisa
                    </button>
                    <button
                      onClick={() => setDayAvailability(date, false)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold border border-rose-200 flex items-center gap-1 transition-all cursor-pointer"
                      title="Set Semua Full"
                    >
                      <XSquare className="w-3 h-3" /> Semua Full
                    </button>
                  </div>
                </div>

                {/* TIME SLOTS LIST */}
                <div className="p-3.5 flex-1">
                  <div className="space-y-1.5">
                    {TIME_SLOTS.map(time => {
                      const key = `${selectedPerson}|${date}|${time}`;
                      const isAvailable = availability[key] === true;

                      return (
                        <div
                          key={time}
                          className={`flex items-center justify-between p-2.5 rounded-xl transition-all duration-150 cursor-pointer border ${
                            isAvailable
                              ? 'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100/70 shadow-2xs'
                              : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                          onClick={() => toggleAvailability(date, time)}
                        >
                          <span className={`text-xs font-bold ${isAvailable ? 'text-emerald-900' : 'text-slate-700'}`}>
                            {time}
                          </span>

                          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-colors ${
                            isAvailable
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {isAvailable ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>BISA</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                <span>FULL</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium mb-4">Silakan pilih atau tambahkan nama panelis terlebih dahulu untuk mengatur jadwal.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" /> Tambah Panelis Baru
          </button>
        </div>
      )}

      {/* MODAL TAMBAH PANELIS */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150 border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <h3 className="font-extrabold text-slate-900 text-base">Tambah Panelis Baru</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jabatan</label>
                <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm">
                  {selectedJabatan}
                </div>
              </div>

              {selectedJabatan !== "BoD" && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Minbur</label>
                  <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm">
                    {selectedMinbur} - {MINBUR_LIST.find(m => m.code === selectedMinbur)?.name}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Panelis</label>
                <input
                  type="text"
                  autoFocus
                  placeholder={selectedJabatan === "BoD" ? "Contoh: Presiden" : `Contoh: Nama - ${selectedMinbur}`}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium text-slate-900 text-sm"
                  value={newPanelistName}
                  onChange={(e) => setNewPanelistName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveNewPanelist();
                  }}
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveNewPanelist}
                  disabled={!newPanelistName.trim()}
                  className="px-5 py-2 rounded-xl font-bold text-xs text-white bg-orange-500 hover:bg-orange-600 shadow-sm shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Simpan Panelis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
