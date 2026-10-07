import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, CalendarClock, CheckCircle2, Clock, ArrowLeft, Search, ExternalLink } from 'lucide-react';
import { type Registrant, getRegistrantsData, saveRegistrantsData, TIME_SLOTS, formatPanelistLabel, getHierarchyData } from '../data/registrantsData';

export default function DailySchedules() {
  const { date } = useParams();
  const decodedDate = decodeURIComponent(date || '');

  const [data, setData] = useState<Registrant[]>(() => getRegistrantsData());
  const [hierarchy, setHierarchy] = useState(() => getHierarchyData());
  const [selectedSlot, setSelectedSlot] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const handleStorageChange = () => {
      setData([...getRegistrantsData()]);
      setHierarchy(getHierarchyData());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('registrants_updated', handleStorageChange);
    window.addEventListener('hierarchy_updated', handleStorageChange);
    window.addEventListener('sync_completed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('registrants_updated', handleStorageChange);
      window.removeEventListener('hierarchy_updated', handleStorageChange);
      window.removeEventListener('sync_completed', handleStorageChange);
    };
  }, []);

  const updateField = (id: number, field: keyof Registrant, value: string) => {
    const newData = data.map(item => item.id === id ? { ...item, [field]: value } : item);
    setData(newData);
    saveRegistrantsData(newData);
  };

  const badgeColor = (value: string) => {
    if (value === "Selesai") return "bg-emerald-50 text-emerald-700 border-emerald-300";
    if (value === "Belum") return "bg-amber-50 text-amber-700 border-amber-300";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  // Filter candidates plotted on this date
  const dateCandidates = useMemo(() => {
    return data.filter(d => d.tanggal === decodedDate);
  }, [data, decodedDate]);

  const filteredCandidates = useMemo(() => {
    return dateCandidates.filter(d => {
      const matchesSlot = selectedSlot === 'all' || d.waktu === selectedSlot;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        d.nama.toLowerCase().includes(query) ||
        d.panelis1.toLowerCase().includes(query) ||
        d.panelis2.toLowerCase().includes(query) ||
        d.pilihan1.toLowerCase().includes(query) ||
        d.ruangan.toLowerCase().includes(query);
      return matchesSlot && matchesSearch;
    }).sort((a, b) => a.waktu.localeCompare(b.waktu));
  }, [dateCandidates, selectedSlot, searchQuery]);

  const completedCount = dateCandidates.filter(d => d.statusInterview === 'Selesai').length;
  const pendingCount = dateCandidates.length - completedCount;

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* HEADER BANNER */}
      <div className="p-6 md:p-8 bg-white border-b border-slate-200/80 shrink-0 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/registrants"
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Kembali ke Semua Pendaftar"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Jadwal Screening Harian</h1>
              </div>
              <p className="text-sm font-semibold text-emerald-600 mt-1 flex items-center gap-1.5">
                <span>{decodedDate}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-normal">SGE FILKOM UB 2026</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="px-3.5 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{completedCount} Selesai</span>
            </div>
            <div className="px-3.5 py-2 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs border border-amber-200 flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{pendingCount} Menunggu</span>
            </div>
            <div className="px-3.5 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs shadow-2xs">
              {dateCandidates.length} Total Sesi
            </div>
          </div>
        </div>

        {/* TIME SLOT PILLS & SEARCH */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Time Slot Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedSlot('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedSlot === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Semua Jam ({dateCandidates.length})
            </button>
            {TIME_SLOTS.map(slot => {
              const countInSlot = dateCandidates.filter(d => d.waktu === slot).length;
              if (countInSlot === 0) return null;
              return (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    selectedSlot === slot
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>{slot}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedSlot === slot ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {countInSlot}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, panelis, ruang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl text-xs font-medium outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* SCHEDULE TABLE / CARDS */}
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden overflow-x-auto w-max min-w-full">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white">
                <th className="p-3.5 font-bold text-center border-b border-emerald-600/60 sticky top-0 bg-emerald-600 z-10 w-12">No</th>
                <th className="p-3.5 font-bold text-center border-b border-emerald-600/60 sticky top-0 bg-emerald-600 z-10 min-w-[130px]">Waktu</th>
                <th className="p-3.5 font-bold text-center border-b border-emerald-600/60 sticky top-0 bg-emerald-600 z-10 min-w-[190px]">Panelis</th>
                <th className="p-3.5 font-bold text-center border-b border-emerald-600/60 sticky top-0 bg-emerald-600 z-10 min-w-[90px]">Ruang</th>
                <th className="p-3.5 font-bold text-center border-b border-emerald-600/60 sticky top-0 bg-emerald-600 z-10 min-w-[220px]">Nama Pendaftar</th>
                <th className="p-3.5 font-bold text-center border-b border-emerald-600/60 sticky top-0 bg-emerald-600 z-10 min-w-[200px]">Pilihan 1</th>
                <th className="p-3.5 font-bold text-center border-b border-emerald-600/60 sticky top-0 bg-emerald-600 z-10 min-w-[160px]">Berkas Staff</th>
                <th className="p-3.5 font-bold text-center border-b border-emerald-600/60 sticky top-0 bg-emerald-600 z-10 min-w-[200px]">Form Penilaian</th>
                <th className="p-3.5 font-bold text-center border-b border-emerald-600/60 sticky top-0 bg-emerald-600 z-10 min-w-[150px]">Status Interview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.map((row, index) => (
                <tr key={row.id} className="hover:bg-emerald-50/20 group transition-colors">
                  <td className="p-4 text-center text-slate-400 font-bold">{index + 1}</td>

                  {/* Waktu */}
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
                      {row.waktu}
                    </span>
                  </td>

                  {/* Panelis */}
                  <td className="p-4 space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{formatPanelistLabel(row.panelis1, hierarchy) || "-"}</span>
                    </div>
                    {row.panelis2 && (
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{formatPanelistLabel(row.panelis2, hierarchy)}</span>
                      </div>
                    )}
                  </td>

                  {/* Ruang */}
                  <td className="p-4 text-center">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs">
                      {row.ruangan || "-"}
                    </span>
                  </td>

                  {/* Nama */}
                  <td className="p-4 font-extrabold text-slate-900 text-sm">
                    {row.nama}
                  </td>

                  {/* Pilihan 1 */}
                  <td className="p-4 text-center">
                    <div className="bg-orange-50/80 border border-orange-200 text-orange-950 rounded-lg px-2.5 py-1 text-xs font-semibold inline-block truncate max-w-[180px]">
                      {row.pilihan1 || "-"}
                    </div>
                  </td>

                  {/* Berkas Staff */}
                  <td className="p-4">
                    <div className="bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-200 flex items-center gap-2 text-xs text-slate-700 truncate cursor-pointer transition-colors shadow-2xs">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{row.berkas}</span>
                    </div>
                  </td>

                  {/* Form Penilaian */}
                  <td className="p-4">
                    <a
                      href={row.formPenilaian?.startsWith('http') ? row.formPenilaian : `https://docs.google.com/document/d/1MQWjCOveTuzNLvq-OD2b00UmE4Zn7cnc/copy?title=Form%20Penilaian%20-%20${encodeURIComponent(row.nama)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-blue-700 font-bold transition-all shadow-2xs group cursor-pointer"
                      title="Klik untuk Buka Form Penilaian di Google Docs"
                    >
                      <span className="truncate">Buka Form Penilaian GDocs</span>
                      <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-1.5 opacity-70 group-hover:opacity-100" />
                    </a>
                  </td>

                  {/* Status Interview */}
                  <td className="p-4 text-center">
                    <select
                      className={`w-full p-2 border rounded-lg outline-none font-bold text-xs text-center cursor-pointer appearance-none transition-all ${badgeColor(row.statusInterview || 'Belum')} shadow-2xs`}
                      value={row.statusInterview || 'Belum'}
                      onChange={(e) => updateField(row.id, 'statusInterview', e.target.value)}
                    >
                      <option value="Selesai">Selesai</option>
                      <option value="Belum">Belum</option>
                    </select>
                  </td>
                </tr>
              ))}

              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-500 font-medium">
                    Tidak ada jadwal interview yang di-plotting pada filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
