import { useState, useEffect, useMemo } from 'react';
import { FileText, Lock, Search, CheckCircle2, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { type Registrant, getRegistrantsData, saveRegistrantsData, DATES, TIME_SLOTS } from '../data/registrantsData';
import { useAuth } from '../context/AuthContext';
import { GDocsIntegrationModal } from '../components/GDocsIntegrationModal';
import { generateGDoc } from '../services/gdocsService';

const INITIAL_PANELISTS = {
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

const ACRONYMS: Record<string, string> = {
  "Human Capital": "HC",
  "Talent Growth": "TG",
  "Creative Enterprise": "CE",
  "Inter-Agency Affairs": "IAA",
  "Student Advocacy & Welfare": "SAW",
  "Social Equity & Enviroment": "SEE",
  "Social Equity and Environment": "SEE",
  "Studies & Strategic Action": "SSA",
  "Administration & Finance": "AF",
  "IT Solution": "ITS",
  "Creative Media & Information": "CMI",
  "Creative Media and Information": "CMI"
};

export default function AllRegistrants() {
  const { isAdmin, setShowLoginModal } = useAuth();
  const [data, setData] = useState<Registrant[]>(() => getRegistrantsData());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'terkonfirmasi' | 'resched' | 'lulus' | 'belum_plot'>('all');
  const [showGDocsModal, setShowGDocsModal] = useState(false);
  const [generatingRowId, setGeneratingRowId] = useState<number | null>(null);

  const [availability, setAvailability] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('schedule_availability');
    return saved ? JSON.parse(saved) : {};
  });

  const [allPanelists, setAllPanelists] = useState<string[]>(() => {
    const saved = localStorage.getItem('panelists_data');
    const parsed = saved ? JSON.parse(saved) : INITIAL_PANELISTS;
    return Array.from(new Set(Object.values(parsed).flat())) as string[];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setData(getRegistrantsData());

      const savedAvail = localStorage.getItem('schedule_availability');
      if (savedAvail) setAvailability(JSON.parse(savedAvail));
      
      const savedPanelists = localStorage.getItem('panelists_data');
      if (savedPanelists) {
        setAllPanelists(Array.from(new Set(Object.values(JSON.parse(savedPanelists)).flat())) as string[]);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('panelists_updated', handleStorageChange);
    window.addEventListener('registrants_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('panelists_updated', handleStorageChange);
      window.removeEventListener('registrants_updated', handleStorageChange);
    };
  }, []);

  const updateField = (id: number, field: keyof Registrant, value: string) => {
    setData(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, [field]: value } : item);
      saveRegistrantsData(updated);
      return updated;
    });
  };

  const handleGenerateSingle = async (row: Registrant, type: 'penilaian' | 'transparansi') => {
    setGeneratingRowId(row.id);
    const res = await generateGDoc(row, type);
    if (res.success && res.url) {
      const field = type === 'penilaian' ? 'formPenilaian' : 'transparansi';
      updateField(row.id, field, res.url);
    }
    setGeneratingRowId(null);
  };

  const badgeColor = (value: string) => {
    if (value === "Sudah" || value === "Ya" || value === "Lulus" || value === "Selesai") 
      return "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold";
    if (value === "Belum" || value === "Belum Dikonfirmasi") 
      return "bg-slate-100 text-slate-600 border-slate-200 font-medium";
    if (value === "Tidak" || value === "Tidak Sesuai Jadwal") 
      return "bg-rose-50 text-rose-700 border-rose-300 font-bold";
    if (value === "Resched") 
      return "bg-amber-50 text-amber-700 border-amber-300 font-bold";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  // Filter & search logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        item.nama.toLowerCase().includes(query) ||
        item.pilihan1.toLowerCase().includes(query) ||
        item.pilihan2.toLowerCase().includes(query) ||
        item.idLine.toLowerCase().includes(query) ||
        item.panelis1.toLowerCase().includes(query) ||
        item.panelis2.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (filterTab === 'terkonfirmasi') return item.udahChat === 'Sudah' && item.bisaInterview === 'Ya';
      if (filterTab === 'resched') return item.bisaInterview === 'Tidak';
      if (filterTab === 'lulus') return item.lulusLkmm === 'Lulus';
      if (filterTab === 'belum_plot') return item.statusPlotting === 'Belum';
      return true;
    });
  }, [data, searchQuery, filterTab]);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* TOP HEADER BAR */}
      <div className="p-6 md:p-8 bg-white border-b border-slate-200 shrink-0 space-y-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Plotting & Status Pendaftar
              </h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
                isAdmin 
                  ? 'bg-amber-50 text-amber-800 border-amber-300' 
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {isAdmin ? 'Admin (IRE): Akses Edit Lengkap' : 'Staf Biasa: Edit Panelis, Ruangan, LKMM & Status'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Seleksi Staff SGE FILKOM UB 2026 • Kelola plotting ruangan, ketersediaan panelis, & auto generate form
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* GDocs Auto-Generator Button */}
            <button
              onClick={() => setShowGDocsModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-100" />
              <span>⚡ Generate GDocs</span>
            </button>

            {!isAdmin && (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" /> Login IRE
              </button>
            )}
            <div className="px-3.5 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{data.filter(d => d.udahChat === 'Sudah' && d.bisaInterview === 'Ya').length} Terkonfirmasi</span>
            </div>
            <div className="px-3.5 py-2 bg-orange-50 text-orange-700 rounded-xl font-bold text-xs border border-orange-200 shadow-2xs">
              {data.length} Total Pendaftar
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Semua', count: data.length },
              { id: 'terkonfirmasi', label: 'Terkonfirmasi', count: data.filter(d => d.udahChat === 'Sudah' && d.bisaInterview === 'Ya').length },
              { id: 'resched', label: 'Perlu Resched', count: data.filter(d => d.bisaInterview === 'Tidak').length },
              { id: 'lulus', label: 'Lulus LKMM', count: data.filter(d => d.lulusLkmm === 'Lulus').length },
              { id: 'belum_plot', label: 'Belum Di-Plot', count: data.filter(d => d.statusPlotting === 'Belum').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  filterTab === tab.id
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filterTab === tab.id ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, kementerian, ID Line..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl text-xs font-medium outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto w-max min-w-full">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white">
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 w-12">No</th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[190px]">
                  Tanggal {!isAdmin && <span className="text-[10px] text-orange-100 font-normal">(IRE)</span>}
                </th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[145px]">
                  Waktu {!isAdmin && <span className="text-[10px] text-orange-100 font-normal">(IRE)</span>}
                </th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[200px]">
                  Panelis 1 & 2 <span className="text-[10px] text-orange-100 font-normal">✎</span>
                </th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[90px]">
                  Ruang <span className="text-[10px] text-orange-100 font-normal">✎</span>
                </th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[210px]">Nama Pendaftar</th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[210px]">Pilihan 1</th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[210px]">Pilihan 2</th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[170px]">Berkas Staff</th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[170px]">
                  Daftar Lembaga Lain <span className="text-[10px] text-orange-100 font-normal">✎</span>
                </th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[210px]">Form Penilaian (GDocs)</th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[210px]">Transparansi (GDocs)</th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[150px]">ID Line</th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[140px]">
                  Humas {!isAdmin && <span className="text-[10px] text-orange-100 font-normal">(IRE)</span>}
                </th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[150px]">
                  Status Plotting {!isAdmin && <span className="text-[10px] text-orange-100 font-normal">(IRE)</span>}
                </th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[150px]">
                  Udah di-Chat? {!isAdmin && <span className="text-[10px] text-orange-100 font-normal">(IRE)</span>}
                </th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[170px]">
                  Bisa Sesuai Jadwal? {!isAdmin && <span className="text-[10px] text-orange-100 font-normal">(IRE)</span>}
                </th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[150px]">
                  Sudah Resched? {!isAdmin && <span className="text-[10px] text-orange-100 font-normal">(IRE)</span>}
                </th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[150px]">
                  Kelulusan LKMM-TD <span className="text-[10px] text-orange-100 font-normal">✎</span>
                </th>
                <th className="p-3.5 font-bold text-center border-b border-orange-600/60 sticky top-0 bg-orange-600 z-10 min-w-[150px]">
                  Status Interview <span className="text-[10px] text-orange-100 font-normal">✎</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row, index) => {
                const availablePanelists = allPanelists.filter(
                  p => availability[`${p}|${row.tanggal}|${row.waktu}`] === true
                );

                const p1Acronym = ACRONYMS[row.pilihan1] || row.pilihan1;
                const p2Acronym = ACRONYMS[row.pilihan2] || row.pilihan2;

                const sortedAllPanelists = [...allPanelists].sort((a, b) => {
                  const aAvail = availablePanelists.includes(a) ? 10 : 0;
                  const bAvail = availablePanelists.includes(b) ? 10 : 0;
                  const aMatches1 = p1Acronym && a.includes(p1Acronym) ? 2 : 0;
                  const aMatches2 = p2Acronym && a.includes(p2Acronym) ? 1 : 0;
                  const bMatches1 = p1Acronym && b.includes(p1Acronym) ? 2 : 0;
                  const bMatches2 = p2Acronym && b.includes(p2Acronym) ? 1 : 0;
                  
                  const scoreA = aAvail + aMatches1 + aMatches2;
                  const scoreB = bAvail + bMatches1 + bMatches2;
                  return scoreB - scoreA;
                });

                return (
                  <tr key={row.id} className="hover:bg-orange-50/20 group transition-colors">
                    <td className="p-3.5 text-center text-slate-400 font-bold">{index + 1}</td>

                    {/* Tanggal: Hanya Admin IRE */}
                    <td className="p-3.5">
                      {isAdmin ? (
                        <select
                          className="w-full bg-slate-50 border border-slate-200 hover:border-orange-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg p-2 outline-none transition-all font-semibold text-slate-800 cursor-pointer text-xs"
                          value={row.tanggal} onChange={(e) => updateField(row.id, 'tanggal', e.target.value)}
                        >
                          <option value="">-- Pilih Tanggal --</option>
                          {DATES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      ) : (
                        <div className="p-1.5 font-semibold text-slate-700 text-xs text-center">
                          {row.tanggal || "-"}
                        </div>
                      )}
                    </td>

                    {/* Waktu: Hanya Admin IRE */}
                    <td className="p-3.5">
                      {isAdmin ? (
                        <select
                          className="w-full bg-slate-50 border border-slate-200 hover:border-orange-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg p-2 outline-none transition-all font-semibold text-slate-800 cursor-pointer text-xs text-center"
                          value={row.waktu} onChange={(e) => updateField(row.id, 'waktu', e.target.value)}
                        >
                          <option value="">-- Pilih Jam --</option>
                          {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      ) : (
                        <div className="p-1.5 font-semibold text-slate-700 text-xs text-center">
                          {row.waktu || "-"}
                        </div>
                      )}
                    </td>

                    {/* Panelis: Staff & Admin IRE BISA EDIT */}
                    <td className="p-3.5 space-y-1.5">
                      <select
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-orange-500 rounded-lg p-1.5 outline-none font-bold text-slate-800 transition-all cursor-pointer text-xs shadow-2xs"
                        value={row.panelis1} onChange={(e) => updateField(row.id, 'panelis1', e.target.value)}
                      >
                        <option value="">-- Panelis 1 --</option>
                        {sortedAllPanelists.map(p => {
                          const isAvail = availablePanelists.includes(p);
                          return (
                            <option key={p} value={p}>
                              {p} {isAvail ? '✓ (Bisa)' : ''}
                            </option>
                          );
                        })}
                      </select>
                      <select
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-orange-500 rounded-lg p-1.5 outline-none font-bold text-slate-800 transition-all cursor-pointer text-xs shadow-2xs"
                        value={row.panelis2} onChange={(e) => updateField(row.id, 'panelis2', e.target.value)}
                      >
                        <option value="">-- Panelis 2 --</option>
                        {sortedAllPanelists.map(p => {
                          const isAvail = availablePanelists.includes(p);
                          return (
                            <option key={p} value={p}>
                              {p} {isAvail ? '✓ (Bisa)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </td>

                    {/* Ruangan: Staff & Admin IRE BISA EDIT */}
                    <td className="p-3.5">
                      <input
                        type="text"
                        placeholder="Ruang"
                        className="w-full text-center bg-white border border-slate-200 hover:border-slate-300 focus:border-orange-500 rounded-lg p-2 outline-none transition-all font-bold text-slate-800 shadow-2xs"
                        value={row.ruangan} onChange={(e) => updateField(row.id, 'ruangan', e.target.value)}
                      />
                    </td>

                    {/* Nama Pendaftar */}
                    <td className="p-3.5 font-bold text-slate-900 text-sm">
                      {row.nama}
                    </td>

                    {/* Pilihan 1 */}
                    <td className="p-3.5">
                      <div className="bg-orange-50/70 border border-orange-200/80 text-orange-950 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-center truncate">
                        {row.pilihan1 || "-"}
                      </div>
                    </td>

                    {/* Pilihan 2 */}
                    <td className="p-3.5">
                      {row.pilihan2 ? (
                        <div className="bg-slate-100 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-center truncate">
                          {row.pilihan2}
                        </div>
                      ) : (
                        <div className="text-center text-slate-400 font-medium">-</div>
                      )}
                    </td>

                    {/* Berkas Staff */}
                    <td className="p-3.5">
                      <div className="bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-200 flex items-center gap-2 text-xs text-slate-700 truncate cursor-pointer transition-colors shadow-2xs">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" /> <span className="truncate">{row.berkas}</span>
                      </div>
                    </td>

                    {/* Daftar Lembaga Lain: Staff & Admin IRE BISA EDIT */}
                    <td className="p-3.5">
                      <input 
                        type="text" 
                        placeholder="-" 
                        className="w-full text-center bg-white border border-slate-200 hover:border-slate-300 focus:border-orange-500 rounded-lg p-2 outline-none transition-all text-slate-700 font-medium text-xs shadow-2xs" 
                        value={row.lembagaLain} 
                        onChange={(e) => updateField(row.id, 'lembagaLain', e.target.value)} 
                      />
                    </td>

                    {/* Form Penilaian */}
                    <td className="p-3.5">
                      {row.formPenilaian ? (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={row.formPenilaian}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg border border-blue-200/80 flex items-center justify-between text-xs text-blue-700 truncate cursor-pointer transition-colors shadow-2xs group"
                            title="Buka Form Penilaian di Google Docs"
                          >
                            <span className="truncate font-semibold">{`Form Penilaian - ${row.nama}.docx`}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0 ml-1 opacity-70 group-hover:opacity-100" />
                          </a>
                          <button
                            onClick={() => handleGenerateSingle(row, 'penilaian')}
                            disabled={generatingRowId === row.id}
                            title="Generate Ulang Form Penilaian"
                            className="p-2 rounded-lg bg-slate-100 hover:bg-orange-100 hover:text-orange-600 text-slate-500 transition-colors cursor-pointer shrink-0 border border-slate-200"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${generatingRowId === row.id ? 'animate-spin text-orange-500' : ''}`} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateSingle(row, 'penilaian')}
                          disabled={generatingRowId === row.id}
                          className="w-full py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          <span>{generatingRowId === row.id ? 'Membuat...' : 'Generate Form'}</span>
                        </button>
                      )}
                    </td>

                    {/* Transparansi */}
                    <td className="p-3.5">
                      {row.transparansi ? (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={row.transparansi}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg border border-indigo-200/80 flex items-center justify-between text-xs text-indigo-700 truncate cursor-pointer transition-colors shadow-2xs group"
                            title="Buka Form Transparansi di Google Docs"
                          >
                            <span className="truncate font-semibold">{`Form Transparansi - ${row.nama}.docx`}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-indigo-500 shrink-0 ml-1 opacity-70 group-hover:opacity-100" />
                          </a>
                          <button
                            onClick={() => handleGenerateSingle(row, 'transparansi')}
                            disabled={generatingRowId === row.id}
                            title="Generate Ulang Form Transparansi"
                            className="p-2 rounded-lg bg-slate-100 hover:bg-orange-100 hover:text-orange-600 text-slate-500 transition-colors cursor-pointer shrink-0 border border-slate-200"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${generatingRowId === row.id ? 'animate-spin text-orange-500' : ''}`} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateSingle(row, 'transparansi')}
                          disabled={generatingRowId === row.id}
                          className="w-full py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          <span>{generatingRowId === row.id ? 'Membuat...' : 'Generate Form'}</span>
                        </button>
                      )}
                    </td>

                    {/* ID Line */}
                    <td className="p-3.5">
                      <input 
                        type="text" 
                        disabled={!isAdmin} 
                        placeholder="-" 
                        className={`w-full text-center bg-transparent border border-transparent ${isAdmin ? 'hover:border-slate-300 focus:border-orange-500 bg-slate-50' : 'opacity-80'} rounded-lg p-1.5 outline-none transition-all font-medium text-slate-700 text-xs`} 
                        value={row.idLine} 
                        onChange={(e) => updateField(row.id, 'idLine', e.target.value)} 
                      />
                    </td>

                    {/* Humas: Hanya Admin IRE */}
                    <td className="p-3.5">
                      {isAdmin ? (
                        <select
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-orange-500 rounded-lg p-1.5 outline-none transition-all font-semibold text-slate-800 text-center cursor-pointer text-xs"
                          value={row.humas} onChange={(e) => updateField(row.id, 'humas', e.target.value)}
                        >
                          <option value="">-</option>
                          <option value="Nada">Nada</option>
                          <option value="Irene">Irene</option>
                        </select>
                      ) : (
                        <div className="text-center font-semibold text-slate-700 text-xs">{row.humas || "-"}</div>
                      )}
                    </td>

                    {/* Status Plotting: Hanya Admin IRE */}
                    <td className="p-3.5 text-center">
                      {isAdmin ? (
                        <select
                          className={`w-full p-2 border rounded-lg outline-none font-bold text-xs text-center cursor-pointer appearance-none transition-all ${badgeColor(row.statusPlotting || 'Belum')} shadow-2xs`}
                          value={row.statusPlotting || 'Belum'} onChange={(e) => updateField(row.id, 'statusPlotting', e.target.value)}
                        >
                          <option value="Belum">Belum</option>
                          <option value="Sudah">Sudah</option>
                        </select>
                      ) : (
                        <div className={`p-1.5 rounded-lg font-bold text-xs text-center border ${badgeColor(row.statusPlotting || 'Belum')}`}>
                          {row.statusPlotting || 'Belum'}
                        </div>
                      )}
                    </td>

                    {/* Udah di chat?: Hanya Admin IRE */}
                    <td className="p-3.5 text-center">
                      {isAdmin ? (
                        <select
                          className={`w-full p-2 border rounded-lg outline-none font-bold text-xs text-center cursor-pointer appearance-none transition-all ${badgeColor(row.udahChat)} shadow-2xs`}
                          value={row.udahChat} onChange={(e) => updateField(row.id, 'udahChat', e.target.value)}
                        >
                          <option value="Belum">Belum</option>
                          <option value="Sudah">Sudah</option>
                        </select>
                      ) : (
                        <div className={`p-1.5 rounded-lg font-bold text-xs text-center border ${badgeColor(row.udahChat)}`}>
                          {row.udahChat}
                        </div>
                      )}
                    </td>

                    {/* Bisa interview sesuai jadwal?: Hanya Admin IRE */}
                    <td className="p-3.5 text-center">
                      {isAdmin ? (
                        <select
                          className={`w-full p-2 border rounded-lg outline-none font-bold text-xs text-center cursor-pointer appearance-none transition-all ${badgeColor(row.bisaInterview)} shadow-2xs`}
                          value={row.bisaInterview} onChange={(e) => updateField(row.id, 'bisaInterview', e.target.value)}
                        >
                          <option value="Belum">Belum</option>
                          <option value="Ya">Ya</option>
                          <option value="Tidak">Tidak</option>
                        </select>
                      ) : (
                        <div className={`p-1.5 rounded-lg font-bold text-xs text-center border ${badgeColor(row.bisaInterview)}`}>
                          {row.bisaInterview}
                        </div>
                      )}
                    </td>

                    {/* Sudah di-resched?: Hanya Admin IRE */}
                    <td className="p-3.5 text-center">
                      {row.bisaInterview === 'Tidak' ? (
                        isAdmin ? (
                          <select
                            className={`w-full p-2 border rounded-lg outline-none font-bold text-xs text-center cursor-pointer appearance-none transition-all ${badgeColor(row.sudahResched || 'Belum')} shadow-2xs`}
                            value={row.sudahResched || 'Belum'} onChange={(e) => updateField(row.id, 'sudahResched', e.target.value)}
                          >
                            <option value="Belum">Belum</option>
                            <option value="Sudah">Sudah</option>
                          </select>
                        ) : (
                          <div className={`p-1.5 rounded-lg font-bold text-xs text-center border ${badgeColor(row.sudahResched || 'Belum')}`}>
                            {row.sudahResched || 'Belum'}
                          </div>
                        )
                      ) : (
                        <span className="text-slate-400 font-bold">-</span>
                      )}
                    </td>

                    {/* Kelulusan LKMM-TD: Staff & Admin IRE BISA EDIT */}
                    <td className="p-3.5 text-center">
                      <select
                        className={`w-full p-2 border rounded-lg outline-none font-bold text-xs text-center cursor-pointer appearance-none transition-all ${badgeColor(row.lulusLkmm)} shadow-2xs`}
                        value={row.lulusLkmm} onChange={(e) => updateField(row.id, 'lulusLkmm', e.target.value)}
                      >
                        <option value="Lulus">Lulus</option>
                        <option value="Belum">Belum</option>
                      </select>
                    </td>

                    {/* Status Interview: Staff & Admin IRE BISA EDIT */}
                    <td className="p-3.5 text-center">
                      <select
                        className={`w-full p-2 border rounded-lg outline-none font-bold text-xs text-center cursor-pointer appearance-none transition-all ${badgeColor(row.statusInterview || 'Belum')} shadow-2xs`}
                        value={row.statusInterview || 'Belum'} onChange={(e) => updateField(row.id, 'statusInterview', e.target.value)}
                      >
                        <option value="Selesai">Selesai</option>
                        <option value="Belum">Belum</option>
                      </select>
                    </td>

                  </tr>
                );
              })}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={20} className="p-12 text-center text-slate-500 font-medium">
                    Tidak ada data pendaftar yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GDOCS GENERATOR MODAL */}
      <GDocsIntegrationModal
        isOpen={showGDocsModal}
        onClose={() => setShowGDocsModal(false)}
        registrants={data}
        onDataUpdated={(updated) => setData(updated)}
      />
    </div>
  );
}
