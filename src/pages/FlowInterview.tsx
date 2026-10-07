import { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, ArrowRight, Sparkles, CheckCircle2, FileCheck2, Clock, Shield, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRegistrantsData } from '../data/registrantsData';

export default function FlowInterview() {
  const [stats, setStats] = useState(() => {
    const data = getRegistrantsData();
    const total = data.length;
    const plotted = data.filter((d: any) => d.statusPlotting === 'Sudah').length;
    const selesai = data.filter((d: any) => d.statusInterview === 'Selesai').length;
    const resched = data.filter((d: any) => d.bisaInterview === 'Tidak' && d.sudahResched !== 'Sudah').length;
    return { total, plotted, selesai, resched };
  });

  useEffect(() => {
    const updateStats = () => {
      const data = getRegistrantsData();
      const total = data.length;
      const plotted = data.filter((d: any) => d.statusPlotting === 'Sudah').length;
      const selesai = data.filter((d: any) => d.statusInterview === 'Selesai').length;
      const resched = data.filter((d: any) => d.bisaInterview === 'Tidak' && d.sudahResched !== 'Sudah').length;
      setStats({ total, plotted, selesai, resched });
    };

    updateStats();
    window.addEventListener('storage', updateStats);
    window.addEventListener('registrants_updated', updateStats);
    return () => {
      window.removeEventListener('storage', updateStats);
      window.removeEventListener('registrants_updated', updateStats);
    };
  }, []);

  const steps = [
    { 
      num: '01', 
      title: 'Plotting Jadwal Screening', 
      desc: 'Admin IRE / Tim Plotting menentukan tanggal, jam, ruangan, serta panelis yang sesuai dengan preferensi pendaftar.',
      icon: <Calendar className="w-5 h-5 text-orange-500" />,
      tag: 'Plotting'
    },
    { 
      num: '02', 
      title: 'Konfirmasi Chat oleh Humas', 
      desc: 'Pendaftar yang telah di-plotting dihubungi secara personal via LINE / WhatsApp oleh Humas untuk memastikan kehadiran.',
      icon: <Users className="w-5 h-5 text-blue-500" />,
      tag: 'Konfirmasi'
    },
    { 
      num: '03', 
      title: 'Pelaksanaan Sesi Interview', 
      desc: 'Interview dilakukan tepat waktu. Panelis 1 & 2 memberikan penilaian objektif pada Form Penilaian & Transparansi.',
      icon: <FileCheck2 className="w-5 h-5 text-emerald-500" />,
      tag: 'Penilaian'
    },
    { 
      num: '04', 
      title: 'Pakta Integritas & Komitmen', 
      desc: 'Di penghujung sesi, pendaftar membacakan surat pernyataan komitmen sebagai bagian dari seleksi akhir.',
      icon: <Award className="w-5 h-5 text-purple-500" />,
      tag: 'Komitmen'
    },
  ];

  const percentPlotted = stats.total > 0 ? Math.round((stats.plotted / stats.total) * 100) : 0;
  const percentDone = stats.total > 0 ? Math.round((stats.selesai / stats.total) * 100) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* HERO BANNER - BEM FILKOM UB BRANDING */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-8 md:p-10 text-white shadow-xl shadow-orange-500/20 border border-orange-400/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-300/20 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold tracking-wide uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            Student Government Executive • FILKOM UB 2026
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Recruitment & Screening <span className="text-amber-100 underline decoration-amber-300 decoration-wavy decoration-2">Staff SGE FILKOM</span>
          </h1>
          <p className="text-orange-50 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
            Sistem terintegrasi plotting, sinkronisasi ketersediaan jadwal panelis, dan tracking status pendaftar Open Recruitment BEM FILKOM UB secara real-time.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link 
              to="/registrants"
              className="px-5 py-2.5 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-extrabold text-sm shadow-lg shadow-black/5 transition-all flex items-center gap-2 cursor-pointer"
            >
              Lihat Plotting Pendaftar <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/schedule"
              className="px-5 py-2.5 rounded-xl bg-orange-700/40 hover:bg-orange-700/60 backdrop-blur-md text-white font-bold text-sm border border-white/20 transition-all cursor-pointer"
            >
              Atur Ketersediaan Panelis
            </Link>
          </div>
        </div>
      </div>

      {/* STATS METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pendaftar</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-2 font-medium">Terdata di database pendaftar</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sudah Di-Plot</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-slate-800">{stats.plotted}</p>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{percentPlotted}%</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Memiliki jadwal & panelis</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interview Selesai</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-slate-800">{stats.selesai}</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{percentDone}%</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Telah dinilai oleh panelis</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Butuh Reschedule</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800">{stats.resched}</p>
          <p className="text-xs text-slate-500 mt-2 font-medium">Perlu penjadwalan ulang</p>
        </div>
      </div>
      
      {/* FLOW & GUIDELINES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200/80 p-7 md:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Alur Standar Screening & Interview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pedoman pelaksanaan bagi panitia, humas, dan panelis</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-orange-50 text-orange-600 rounded-full border border-orange-100">
              SOP 2026
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step) => (
              <div 
                key={step.num}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-orange-50/30 hover:border-orange-200/80 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center shadow-xs group-hover:border-orange-300 group-hover:text-orange-600 transition-colors">
                      {step.num}
                    </span>
                    <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-xs">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1.5">{step.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">{step.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-end">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                    Tahap {step.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* JOBDESK PANELIS CARD */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-7 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Jobdesk Panelis</h2>
                <p className="text-xs text-slate-500">Kewajiban selama wawancara</p>
              </div>
            </div>

            <ul className="space-y-3.5">
              {[
                { title: "Review Form Penilaian", text: "Membaca & memahami kriteria penilaian kementerian terkait." },
                { title: "Update Ketersediaan", text: "Mengisi jadwal luang pada menu Schedule Availability." },
                { title: "Hadir Tepat Waktu", text: "Standby di ruangan minimal 10 menit sebelum sesi dimulai." },
                { title: "Prinsip 5S & Etika", text: "Menerapkan Senyum, Salam, Sapa, Sopan, dan Santun." },
                { title: "Input Nilai Real-Time", text: "Langsung mengisi form penilaian setelah sesi wawancara selesai." }
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 font-bold block">{item.title}</strong>
                    <span className="text-slate-500 leading-tight">{item.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60">
            <p className="text-[11px] font-bold text-orange-800">Butuh Bantuan Plotting?</p>
            <p className="text-[11px] text-orange-700 mt-0.5">Hubungi Biro Human Capital atau Admin IRE.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
