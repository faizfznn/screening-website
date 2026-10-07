import React, { useState } from 'react';
import { X, CheckCircle2, RotateCcw, RefreshCw, Check, Database, Settings, ArrowRight, Layers, Users, Calendar } from 'lucide-react';
import { getAppsScriptUrl, setAppsScriptUrl, resetAppsScriptUrl, isUsingCustomAppsScriptUrl, syncWithSpreadsheet } from '../services/apiService';
import { getRegistrantsData, getAvailabilityData } from '../data/registrantsData';

interface SyncSpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess?: () => void;
}

export const SyncSpreadsheetModal: React.FC<SyncSpreadsheetModalProps> = ({
  isOpen,
  onClose,
  onSyncSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'settings'>('sync');
  const [url, setUrl] = useState(getAppsScriptUrl());
  const [isCustom, setIsCustom] = useState(isUsingCustomAppsScriptUrl());
  const [isSyncing, setIsSyncing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const lastSync = localStorage.getItem('last_spreadsheet_sync');
  const registrantsCount = getRegistrantsData().length;
  const availabilityCount = Object.keys(getAvailabilityData()).length;

  if (!isOpen) return null;

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setAppsScriptUrl(url);
    setIsCustom(isUsingCustomAppsScriptUrl());
    setSaveSuccess(true);
    setSyncFeedback(null);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetToDefault = () => {
    const defaultUrl = resetAppsScriptUrl();
    setUrl(defaultUrl);
    setIsCustom(false);
    setSaveSuccess(true);
    setSyncFeedback(null);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncWithSpreadsheet();
      setIsSyncing(false);
      if (res.success) {
        setSyncFeedback({
          type: 'success',
          message: `Berhasil sinkronisasi! ${res.totalRegistrants || 0} pendaftar dan ${res.totalAvailability || 0} jadwal ketersediaan panelis diperbarui.`
        });
        if (onSyncSuccess) onSyncSuccess();
      } else {
        setSyncFeedback({
          type: 'error',
          message: res.message || 'Gagal sinkronisasi data dari Google Spreadsheet.'
        });
      }
    } catch (err: any) {
      setIsSyncing(false);
      setSyncFeedback({
        type: 'error',
        message: err.message || 'Terjadi kesalahan jaringan saat sinkronisasi.'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white flex justify-between items-center shrink-0 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">Sinkronisasi Spreadsheet</h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Google Apps Script
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-0.5">Tarik data pendaftar & ketersediaan panelis secara real-time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'sync'
                ? 'border-emerald-500 text-emerald-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" /> 1. Sinkronisasi Data
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'settings'
                ? 'border-orange-500 text-orange-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> 2. Pengaturan API URL
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'sync' && (
            <div className="space-y-4">
              {/* CURRENT STATS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold mb-1">
                    <Users className="w-3.5 h-3.5 text-orange-500" />
                    <span>Pendaftar</span>
                  </div>
                  <span className="text-xl font-extrabold text-slate-900">{registrantsCount}</span>
                  <span className="text-[10px] text-slate-400 block">data tersimpan</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold mb-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Slot Panelis</span>
                  </div>
                  <span className="text-xl font-extrabold text-slate-900">{availabilityCount}</span>
                  <span className="text-[10px] text-slate-400 block">slot terisi</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold mb-1">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    <span>Divisi / Bidang</span>
                  </div>
                  <span className="text-xl font-extrabold text-slate-900">21</span>
                  <span className="text-[10px] text-slate-400 block">kategori</span>
                </div>
              </div>

              {/* LAST SYNC TIME */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
                <span>Terakhir Disinkronkan:</span>
                <span className="font-bold text-slate-800">
                  {lastSync ? new Date(lastSync).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Belum pernah sync'}
                </span>
              </div>

              {/* FEEDBACK ALERT */}
              {syncFeedback && (
                <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
                  syncFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${syncFeedback.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`} />
                  <span>{syncFeedback.message}</span>
                </div>
              )}

              {/* SYNC ACTION BUTTON */}
              <button
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sedang Menghubungi Google Apps Script...' : 'Tarik Data dari Spreadsheet Sekarang'}</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="text-orange-600 hover:text-orange-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Atur atau ganti URL Apps Script</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <form onSubmit={handleSaveUrl} className="space-y-4">
              {/* SOURCE STATUS BANNER */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isCustom 
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {isCustom ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>
                      {isCustom 
                        ? 'Mode Kustom Aktif (Input User)' 
                        : 'Menggunakan Script dari ENV (Bawaan Sistem)'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    isCustom
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {isCustom ? 'User Override' : 'VITE_APPS_SCRIPT_URL'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {isCustom
                    ? 'Aplikasi saat ini mengambil data pendaftar & jadwal dari URL kustom yang Anda simpan di browser ini.'
                    : 'Aplikasi saat ini otomatis membaca data dari URL Google Apps Script yang terkonfigurasi di .env. Anda dapat menggantinya kapan saja lewat input di bawah.'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Google Apps Script Fetch URL
                  </label>
                  {isCustom && (
                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      className="text-orange-600 hover:text-orange-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" /> Kembalikan ke URL ENV (.env)
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs font-medium text-slate-800 font-mono transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  💡 <em>Pastikan Web App di Google Apps Script dideploy dengan hak akses: <strong>Who has access: Anyone</strong>.</em>
                </p>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> 
                  <span>{isCustom ? 'URL Kustom berhasil disimpan!' : 'URL berhasil dikembalikan ke default (.env)!'}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                {!isCustom && (
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="px-3 py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Refresh dari ENV
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Simpan Perubahan URL
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
