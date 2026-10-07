import React, { useState } from 'react';
import { ShieldCheck, Lock, User as UserIcon, X, AlertCircle, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginModal: React.FC = () => {
  const { showLoginModal, setShowLoginModal, login, user, isAdmin, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!showLoginModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = login(username, password);
    if (!res.success) {
      setError(res.message || 'Login gagal!');
    } else {
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-6 text-white relative">
          <button 
            onClick={() => setShowLoginModal(false)}
            className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Login Akun Admin / IRE</h2>
          <p className="text-orange-100 text-xs mt-1">
            Admin IRE memiliki akses penuh edit seluruh data.
          </p>
        </div>

        <div className="p-6">
          {isAdmin ? (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-xs border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5" /> Anda Sedang Login sebagai {user.name} ({user.title})
              </div>
              <p className="text-gray-600 text-sm">
                Anda memiliki akses edit penuh ke seluruh kolom pendaftar & plotting.
              </p>
              <button
                onClick={() => {
                  logout();
                  setShowLoginModal(false);
                }}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl transition-all cursor-pointer"
              >
                Logout dari Akun IRE
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Username</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: ire hebat"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Masukkan password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/60 text-[11px] text-amber-800 leading-relaxed">
                <span className="font-bold">Info Hak Akses:</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-900">
                  <li><strong>Admin (IRE):</strong> Akses penuh semua kolom.</li>
                  <li><strong>Staf Biasa:</strong> Tanpa login, hanya bisa edit Panelis, Ruangan, Kelulusan LKMM-TD, Status Interview, dan Lembaga Lain.</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-md shadow-orange-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" /> Login IRE
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
