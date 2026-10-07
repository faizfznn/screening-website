import { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, XCircle, Clock, Plus, Save, X, UserCircle, Briefcase, Sparkles, CheckCheck, XSquare, RefreshCw, Layers, Settings } from 'lucide-react';
import { DATES, TIME_SLOTS, MAIN_CATEGORIES, getHierarchyData, saveHierarchyData, getAvailabilityData, saveAvailabilityData } from '../data/registrantsData';
import { syncWithSpreadsheet } from '../services/apiService';
import { SyncSpreadsheetModal } from '../components/SyncSpreadsheetModal';

export default function ScheduleAvailability() {
  const [hierarchy, setHierarchy] = useState<Record<string, Record<string, string[]>>>(() => {
    return getHierarchyData();
  });

  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("BoD");
  
  const minbursForSelectedCat = useMemo(() => {
    return Object.keys(hierarchy[selectedMainCategory] || {});
  }, [hierarchy, selectedMainCategory]);

  const [selectedMinbur, setSelectedMinbur] = useState<string>(() => {
    const list = Object.keys(hierarchy["BoD"] || {});
    return list[0] || "President";
  });

  const peopleForSelectedMinbur = useMemo(() => {
    return hierarchy[selectedMainCategory]?.[selectedMinbur] || [];
  }, [hierarchy, selectedMainCategory, selectedMinbur]);

  const [selectedPerson, setSelectedPerson] = useState<string>(() => {
    const list = hierarchy["BoD"]?.["President"] || [];
    return list[0] || "Kak Daffa";
  });

  // When main category changes, update minbur and person
  useEffect(() => {
    const minburs = Object.keys(hierarchy[selectedMainCategory] || {});
    if (minburs.length > 0) {
      const nextMinbur = minburs.includes(selectedMinbur) ? selectedMinbur : minburs[0];
      setSelectedMinbur(nextMinbur);
      const people = hierarchy[selectedMainCategory]?.[nextMinbur] || [];
      setSelectedPerson(people[0] || "");
    } else {
      setSelectedMinbur("");
      setSelectedPerson("");
    }
  }, [selectedMainCategory, hierarchy]);

  // When minbur changes, update person
  useEffect(() => {
    const people = hierarchy[selectedMainCategory]?.[selectedMinbur] || [];
    if (people.length > 0 && !people.includes(selectedPerson)) {
      setSelectedPerson(people[0]);
    } else if (people.length === 0) {
      setSelectedPerson("");
    }
  }, [selectedMinbur, selectedMainCategory, hierarchy]);

  const [showModal, setShowModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [newPanelistName, setNewPanelistName] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const [availability, setAvailability] = useState<Record<string, boolean>>(() => {
    return getAvailabilityData();
  });

  const handleSyncSpreadsheet = async () => {
    setIsSyncing(true);
    try {
      const res = await syncWithSpreadsheet();
      setIsSyncing(false);
      if (res.success) {
        const freshAvail = getAvailabilityData();
        setAvailability({ ...freshAvail });
        setHierarchy(getHierarchyData());
        alert(`Sinkronisasi Berhasil!\nTotal ${res.totalRegistrants} pendaftar dan ${res.totalAvailability} slot ketersediaan panelis berhasil diperbarui.`);
      } else {
        alert("Gagal sinkronisasi: " + (res.message || "Error"));
      }
    } catch (e: any) {
      setIsSyncing(false);
      alert("Error saat sinkronisasi: " + e.message);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setAvailability({ ...getAvailabilityData() });
      setHierarchy(getHierarchyData());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('panelists_updated', handleStorageChange);
    window.addEventListener('hierarchy_updated', handleStorageChange);
    window.addEventListener('availability_updated', handleStorageChange);
    window.addEventListener('sync_completed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('panelists_updated', handleStorageChange);
      window.removeEventListener('hierarchy_updated', handleStorageChange);
      window.removeEventListener('availability_updated', handleStorageChange);
      window.removeEventListener('sync_completed', handleStorageChange);
    };
  }, []);

  const toggleAvailability = (date: string, time: string) => {
    if (!selectedPerson) return;
    const key = `${selectedPerson}|${date}|${time}`;
    setAvailability(prev => {
      const updated = {
        ...prev,
        [key]: !prev[key]
      };
      saveAvailabilityData(updated);
      return updated;
    });
  };

  const setDayAvailability = (date: string, value: boolean) => {
    if (!selectedPerson) return;
    setAvailability(prev => {
      const updated = { ...prev };
      TIME_SLOTS.forEach(time => {
        updated[`${selectedPerson}|${date}|${time}`] = value;
      });
      saveAvailabilityData(updated);
      return updated;
    });
  };

  const handleSaveNewPanelist = () => {
    if (newPanelistName.trim() !== '' && selectedMainCategory && selectedMinbur) {
      const name = newPanelistName.trim();
      const currentList = hierarchy[selectedMainCategory]?.[selectedMinbur] || [];
      const updatedHierarchy = {
        ...hierarchy,
        [selectedMainCategory]: {
          ...(hierarchy[selectedMainCategory] || {}),
          [selectedMinbur]: Array.from(new Set([...currentList, name]))
        }
      };
      setHierarchy(updatedHierarchy);
      saveHierarchyData(updatedHierarchy);
      setSelectedPerson(name);
      setNewPanelistName("");
      setShowModal(false);
    }
  };

  const handleSave = () => {
    saveAvailabilityData(availability);
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
            Periode Screening: <span className="font-bold text-orange-600">05 Oktober 2026 – 10 Oktober 2026</span>. Data tersinkronisasi langsung dengan Master Spreadsheet.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Sync Spreadsheet Button Group */}
          <div className="inline-flex rounded-xl shadow-md shadow-slate-900/10 overflow-hidden border border-slate-800 shrink-0">
            <button
              onClick={handleSyncSpreadsheet}
              disabled={isSyncing}
              title="Tarik data jadwal panelis terbaru langsung dari Google Spreadsheet"
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sync Spreadsheet'}</span>
            </button>
            <button
              onClick={() => setShowSyncModal(true)}
              title="Pengaturan URL API Spreadsheet"
              className="px-2.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-l border-slate-700/80 font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Jadwal
          </button>
        </div>
      </div>

      {/* 3-TIER SELECTION CONTROL PANEL */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 space-y-5">
        {/* LEVEL 1: TAB KATEGORI UTAMA (BoD, C-Level, IRE, Mentor, Staff) */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            <Layers className="w-3.5 h-3.5 text-orange-500" />
            1. Kategori Tingkatan
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {MAIN_CATEGORIES.map(cat => {
              const isSelected = selectedMainCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedMainCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {Object.values(hierarchy[cat] || {}).flat().length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LEVEL 2 & 3: MINBUR & NAMA PANELIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-2 border-t border-slate-100">
          {/* 2. Pilih Minbur / Biro / Divisi */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <Briefcase className="w-3.5 h-3.5 text-orange-500" />
              2. Minbur / Kementerian / Biro / Divisi
            </label>
            <select
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-bold text-slate-800 text-sm transition-all cursor-pointer"
              value={selectedMinbur}
              onChange={(e) => setSelectedMinbur(e.target.value)}
            >
              {minbursForSelectedCat.map(mb => (
                <option key={mb} value={mb}>
                  {mb} ({(hierarchy[selectedMainCategory]?.[mb] || []).length} orang)
                </option>
              ))}
            </select>
          </div>

          {/* 3. Pilih Nama Panelis */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <UserCircle className="w-3.5 h-3.5 text-orange-500" />
                3. Nama Panelis
              </label>
              <button
                onClick={() => setShowModal(true)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Tambah
              </button>
            </div>
            {peopleForSelectedMinbur.length > 0 ? (
              <select
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-bold text-slate-800 text-sm transition-all cursor-pointer"
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
              >
                {peopleForSelectedMinbur.map(p => (
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

          {/* Panelis Aktif Card */}
          <div>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-2.5 rounded-xl border border-orange-200/80 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold text-orange-600 uppercase truncate">
                  {selectedMainCategory} &bull; {selectedMinbur}
                </p>
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
                          className={`flex items-center justify-between p-2.5 rounded-xl transition-all duration-150 cursor-pointer border ${isAvailable
                            ? 'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100/70 shadow-2xs'
                            : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          onClick={() => toggleAvailability(date, time)}
                        >
                          <span className={`text-xs font-bold ${isAvailable ? 'text-emerald-900' : 'text-slate-700'}`}>
                            {time}
                          </span>

                          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-colors ${isAvailable
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kategori & Minbur</label>
                <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm">
                  {selectedMainCategory} &bull; {selectedMinbur}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Panelis</label>
                <input
                  type="text"
                  autoFocus
                  placeholder={`Contoh: Nama (${selectedMinbur})`}
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

      {/* SPREADSHEET SYNC MODAL */}
      <SyncSpreadsheetModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onSyncSuccess={() => {
          setAvailability({ ...getAvailabilityData() });
          setHierarchy(getHierarchyData());
        }}
      />
    </div>
  );
}
