import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, CalendarDays, Users, CalendarClock, ShieldCheck, LogIn, LogOut, User, Sparkles, ChevronRight } from 'lucide-react';
import FlowInterview from './pages/FlowInterview';
import CriteriaQuestions from './pages/CriteriaQuestions';
import ScheduleAvailability from './pages/ScheduleAvailability';
import AllRegistrants from './pages/AllRegistrants';
import DailySchedules from './pages/DailySchedules';
import { DATES } from './data/registrantsData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/LoginModal';

function Sidebar() {
  const location = useLocation();
  const { user, isAdmin, logout, setShowLoginModal } = useAuth();
  const [dates, setDates] = useState<string[]>(() => DATES);

  useEffect(() => {
    const fetchDates = () => {
      setDates(DATES);
    };
    
    fetchDates();
    window.addEventListener('storage', fetchDates);
    window.addEventListener('registrants_updated', fetchDates);
    window.addEventListener('sync_completed', fetchDates);
    return () => {
      window.removeEventListener('storage', fetchDates);
      window.removeEventListener('registrants_updated', fetchDates);
      window.removeEventListener('sync_completed', fetchDates);
    };
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard & SOP', icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: '/registrants', label: 'All Registrants', icon: <Users className="w-4 h-4" /> },
    { path: '/schedule', label: 'Ketersediaan Panelis', icon: <CalendarDays className="w-4 h-4" /> },
    { path: '/criteria', label: 'Kriteria & Pertanyaan', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="w-72 bg-white text-slate-700 flex flex-col min-h-screen border-r border-slate-200 shrink-0">
      {/* BRANDING HEADER */}
      <div className="p-6 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25 text-white font-black text-xl tracking-wider ring-4 ring-orange-50">
            F
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-slate-900 text-base tracking-tight">BEM FILKOM</h1>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">
                UB
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold tracking-wide">
              SGE RECRUITMENT 2026
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-1 p-4 overflow-y-auto space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Menu Utama
          </p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 ${
                    isActive 
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${isActive ? 'text-white' : 'text-slate-400'}`}>
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* DAILY SCHEDULES */}
        <div>
          <div className="px-3 flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Jadwal Harian
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {dates.length} Hari
            </span>
          </div>

          {dates.length > 0 ? (
            <div className="space-y-1">
              {dates.map((date) => {
                const path = `/daily/${encodeURIComponent(date)}`;
                const isActive = location.pathname === path;
                const shortDate = date.split(',')[1]?.trim() || date;
                
                return (
                  <Link
                    key={date}
                    to={path}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-xl font-semibold text-xs transition-all duration-150 ${
                      isActive 
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CalendarClock className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                      <span className="truncate">{shortDate}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
              Belum ada jadwal siap (Perlu status plotting 'Sudah' & bisa 'Ya').
            </div>
          )}
        </div>
      </nav>
      
      {/* USER & ROLE BADGE */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
              isAdmin 
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                  isAdmin ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isAdmin ? 'ADMIN IRE' : 'STAF BIASA'}
                </span>
              </div>
            </div>
          </div>
          {isAdmin ? (
            <button
              onClick={logout}
              title="Logout Admin"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              title="Login Admin IRE"
              className="px-2.5 py-1 text-[11px] font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all cursor-pointer shrink-0 shadow-xs"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MainLayout() {
  const { isAdmin, setShowLoginModal, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans selection:bg-orange-100 selection:text-orange-950">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col h-screen">
        {/* TOP WORKSPACE HEADER */}
        <header className="bg-white border-b border-slate-200 px-8 py-3.5 flex justify-between items-center sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>BEM FILKOM UB Screening Portal</span>
            </div>
            <span className="text-slate-300">•</span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
              isAdmin 
                ? 'bg-amber-50 text-amber-800 border-amber-300 flex items-center gap-1.5' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Mode Admin IRE (Akses Penuh)
                </>
              ) : (
                'Mode Staf Biasa (Edit Terbatas)'
              )}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <button
                onClick={logout}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout IRE
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" /> Login Admin (IRE)
              </button>
            )}
          </div>
        </header>

        {/* CONTENT VIEW */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<FlowInterview />} />
            <Route path="/criteria" element={<CriteriaQuestions />} />
            <Route path="/schedule" element={<ScheduleAvailability />} />
            <Route path="/registrants" element={<AllRegistrants />} />
            <Route path="/daily/:date" element={<DailySchedules />} />
            <Route path="*" element={<FlowInterview />} />
          </Routes>
        </div>
      </main>
      <LoginModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
