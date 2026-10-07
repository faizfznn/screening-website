import { useState } from 'react';
import { X, CheckCircle2, Copy, Check, ExternalLink, Play, Settings, Sparkles, FolderSync, AlertCircle, Folder, RotateCcw, ShieldCheck } from 'lucide-react';
import { type Registrant, saveRegistrantsData } from '../data/registrantsData';
import { getWebhookUrl, setWebhookUrl, generateGDoc, FOLDER_PENILAIAN_ID, FOLDER_TRANSPARANSI_ID, TEMPLATE_PENILAIAN_ID, TEMPLATE_TRANSPARANSI_ID, DEFAULT_WEBHOOK_URL } from '../services/gdocsService';

interface GDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrants: Registrant[];
  onDataUpdated: (updated: Registrant[]) => void;
}

export function GDocsIntegrationModal({ isOpen, onClose, registrants, onDataUpdated }: GDocsModalProps) {
  const [activeTab, setActiveTab] = useState<'batch' | 'settings' | 'script'>('batch');
  const [webhook, setWebhook] = useState(getWebhookUrl());
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [onlyMissing, setOnlyMissing] = useState(true);

  if (!isOpen) return null;

  // Calculate stats
  const hasBothDocs = (r: Registrant) => 
    Boolean(r.formPenilaian && r.transparansi && (r.formPenilaian.includes('docs.google.com') || r.formPenilaian.includes('http')));

  const alreadyGeneratedCount = registrants.filter(hasBothDocs).length;
  const pendingCount = registrants.length - alreadyGeneratedCount;
  const targetCount = onlyMissing ? pendingCount : registrants.length;

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setWebhookUrl(webhook);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleResetToDefault = () => {
    setWebhook(DEFAULT_WEBHOOK_URL);
    setWebhookUrl(DEFAULT_WEBHOOK_URL);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleBatchGenerate = async () => {
    setIsGenerating(true);
    setProgress({ current: 0, total: targetCount });

    const updated = [...registrants];
    let processedCount = 0;

    for (let i = 0; i < updated.length; i++) {
      const reg = updated[i];
      const isAlreadyDone = hasBothDocs(reg);

      if (onlyMissing && isAlreadyDone) {
        continue;
      }

      const resPenilaian = await generateGDoc(reg, 'penilaian');
      const resTransparansi = await generateGDoc(reg, 'transparansi');

      updated[i] = {
        ...reg,
        formPenilaian: resPenilaian.url,
        transparansi: resTransparansi.url,
      };

      processedCount++;
      setProgress({ current: processedCount, total: targetCount });
    }

    saveRegistrantsData(updated);
    onDataUpdated(updated);
    setIsGenerating(false);
  };

  const scriptCode = `// ================= ID FOLDER & TEMPLATE RESMI BEM =================
// 1. ID Folder Masing-Masing
const FOLDER_PENILAIAN_ID = "${FOLDER_PENILAIAN_ID}";
const FOLDER_TRANSPARANSI_ID = "${FOLDER_TRANSPARANSI_ID}";

// 2. ID Template Master GDocs
const TEMPLATE_PENILAIAN_ID = "${TEMPLATE_PENILAIAN_ID}";
const TEMPLATE_TRANSPARANSI_ID = "${TEMPLATE_TRANSPARANSI_ID}";
// ==================================================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { type, nama, pilihan1, pilihan2, panelis1, panelis2 } = data;
    
    const isPenilaian = type === 'penilaian';
    
    // Tentukan template, folder tujuan, dan prefix nama file
    const templateId = isPenilaian ? TEMPLATE_PENILAIAN_ID : TEMPLATE_TRANSPARANSI_ID;
    const targetFolderId = isPenilaian ? FOLDER_PENILAIAN_ID : FOLDER_TRANSPARANSI_ID;
    const fileName = (isPenilaian ? "Form Penilaian - " : "Form Transparansi - ") + (nama || "Pendaftar");
    
    const targetFolder = DriveApp.getFolderById(targetFolderId);

    // ANTI-DUPLIKASI: Cek apakah file sudah ada di folder tujuan
    const existingFiles = targetFolder.getFilesByName(fileName);
    if (existingFiles.hasNext()) {
      const existingFile = existingFiles.next();
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        url: existingFile.getUrl(),
        docId: existingFile.getId(),
        isExisting: true
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 1. Jika belum ada, buat duplikasi file baru
    const templateFile = DriveApp.getFileById(templateId);
    const newDocFile = templateFile.makeCopy(fileName, targetFolder);
    const newDocId = newDocFile.getId();
    
    // 2. Buka Dokumen dan Ganti Placeholder dengan Data Pendaftar
    const doc = DocumentApp.openById(newDocId);
    const body = doc.getBody();
    
    // Ganti Placeholder Teks
    body.replaceText("{{NAMA}}", nama || "-");
    body.replaceText("{{PILIHAN_1}}", pilihan1 || "-");
    body.replaceText("{{PILIHAN_2}}", pilihan2 || "-");
    body.replaceText("{{PANELIS_1}}", panelis1 || "-");
    body.replaceText("{{PANELIS_2}}", panelis2 || "-");
    
    // Support format kurung siku / kurung biasa di dokumen
    body.replaceText("\\[Nama\\]", nama || "-");
    body.replaceText("\\[nama\\]", nama || "-");
    body.replaceText("\\(Full Name\\)", nama || "-");
    
    doc.saveAndClose();
    
    // 3. Beri izin akses edit
    newDocFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      url: newDocFile.getUrl(),
      docId: newDocId
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-150">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">Auto Generate Google Docs</h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-2xs">
                  ✓ Anti-Duplikasi Aktif
                </span>
              </div>
              <p className="text-orange-100 text-xs mt-0.5">Penyimpanan Otomatis di Folder Shared Drive BEM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'batch'
                ? 'border-orange-500 text-orange-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Play className="w-3.5 h-3.5" /> 1. Generate Dokumen
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'settings'
                ? 'border-orange-500 text-orange-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> 2. Webhook Default
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-4 py-2.5 font-bold text-xs border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'script'
                ? 'border-orange-500 text-orange-600 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderSync className="w-3.5 h-3.5" /> 3. Kode Anti-Duplikasi
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: BATCH GENERATE */}
          {activeTab === 'batch' && (
            <div className="space-y-4">
              {/* FOLDER & TEMPLATE INFO */}
              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 text-orange-950 text-xs leading-relaxed space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-orange-800">
                    <Folder className="w-4 h-4 text-orange-600" />
                    <span>Target Folder Drive BEM:</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Webhook Aktif
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-white border border-orange-200/90 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 text-[11px]">1. Form Penilaian</span>
                      <a
                        href={`https://drive.google.com/drive/folders/${FOLDER_PENILAIAN_ID}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-600 hover:text-orange-700 flex items-center gap-0.5 text-[10px] font-bold"
                      >
                        Buka Folder <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium truncate">
                      Folder: <code>1. FORM PENILAIAN INTERVIEW</code>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-orange-200/90 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 text-[11px]">2. Form Transparansi</span>
                      <a
                        href={`https://drive.google.com/drive/folders/${FOLDER_TRANSPARANSI_ID}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-600 hover:text-orange-700 flex items-center gap-0.5 text-[10px] font-bold"
                      >
                        Buka Folder <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium truncate">
                      Folder: <code>2. FORM TRANSPARANSI INTERVIEW</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* STATS SUMMARY CARD */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Pendaftar</p>
                    <p className="text-base font-extrabold text-slate-800">{registrants.length}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Sudah Punya GDocs</p>
                    <p className="text-base font-extrabold text-emerald-800">{alreadyGeneratedCount}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200">
                    <p className="text-[10px] font-bold text-orange-600 uppercase">Belum Di-Generate</p>
                    <p className="text-base font-extrabold text-orange-800">{pendingCount}</p>
                  </div>
                </div>

                {/* GENERATION MODE SELECTOR */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-800 text-xs">Pilih Mode Pembuatan Dokumen:</p>
                  
                  <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-orange-50/50 cursor-pointer transition-colors border border-transparent has-checked:border-orange-300 has-checked:bg-orange-50/30">
                    <input
                      type="radio"
                      name="generate_mode"
                      checked={onlyMissing}
                      onChange={() => setOnlyMissing(true)}
                      className="mt-0.5 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                        <span>Hanya Pendaftar yang Belum Ada Dokumen ({pendingCount} orang)</span>
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Rekomendasi
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 inline mr-1" />
                        Pendaftar yang dokumennya sudah ada <strong>TIDAK akan dibuatkan file ganda / ditimpa</strong>.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-100/70 cursor-pointer transition-colors border border-transparent has-checked:border-orange-300 has-checked:bg-orange-50/30">
                    <input
                      type="radio"
                      name="generate_mode"
                      checked={!onlyMissing}
                      onChange={() => setOnlyMissing(false)}
                      className="mt-0.5 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">
                        Sinkronisasi Semua ({registrants.length} orang)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Memeriksa dan menautkan link file Google Drive untuk semua pendaftar.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {isGenerating ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
                  <p className="text-xs font-bold text-amber-800">
                    Sedang membuat dokumen ({progress.current} dari {progress.total})...
                  </p>
                  <div className="w-full h-2 rounded-full bg-amber-200 overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-200"
                      style={{ width: `${(progress.current / (progress.total || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ) : targetCount === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1 text-emerald-800">
                  <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Semua pendaftar ({registrants.length} orang) sudah memiliki Google Docs!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Jika ada pendaftar baru masuk, tombol generate akan otomatis aktif untuk pendaftar baru tersebut.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleBatchGenerate}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> 
                  {onlyMissing 
                    ? `Generate Dokumen untuk ${pendingCount} Pendaftar Baru` 
                    : `Generate / Sinkronkan Semua (${registrants.length} Orang)`
                  }
                </button>
              )}
            </div>
          )}

          {/* TAB 2: SETTINGS WEBHOOK DEFAULT */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveWebhook} className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Script Webhook BEM sudah aktif secara default dan siap langsung digunakan.</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Default Google Apps Script Webhook URL
                  </label>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-orange-600 hover:text-orange-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset ke BEM URL
                  </button>
                </div>
                <input
                  type="url"
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xs font-medium text-slate-800 font-mono"
                />
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Webhook URL tersimpan!
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Simpan URL
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SCRIPT CODE ANTI DUPLIKASI */}
          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700">
                  Kode Script Anti-Duplikasi (Update ke script.google.com):
                </p>
                <button
                  onClick={copyScriptToClipboard}
                  className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Tersalin!' : 'Copy Script'}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-64 border border-slate-800">
                <code>{scriptCode}</code>
              </pre>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Fitur Anti-Duplikasi:</strong> Jika file dengan nama pendaftar sudah ada di Google Drive, script tidak akan membuat file ganda, melainkan langsung menggunakan link file yang sudah ada.
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
