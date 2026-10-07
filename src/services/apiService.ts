import { saveRegistrantsData, getRegistrantsData, mergeRegistrants, saveAvailabilityData } from '../data/registrantsData';
import { isSupabaseConfigured, upsertRegistrantsToSupabase, upsertAvailabilityToSupabase } from './supabaseClient';

export const DEFAULT_APPS_SCRIPT_URL =
  import.meta.env.VITE_APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbyDFPH9ykAWu1COFEiaI2dBrf36QF-4ZNnSQ7D4FbIQ6SCbGNkf6fr_q2iFQ-UO9MQ/exec";

export const getAppsScriptUrl = (): string => {
  return localStorage.getItem('apps_script_url') || DEFAULT_APPS_SCRIPT_URL;
};

export const setAppsScriptUrl = (url: string): void => {
  if (!url || url.trim() === DEFAULT_APPS_SCRIPT_URL) {
    localStorage.removeItem('apps_script_url');
  } else {
    localStorage.setItem('apps_script_url', url.trim());
  }
};

export const isUsingCustomAppsScriptUrl = (): boolean => {
  const stored = localStorage.getItem('apps_script_url');
  return Boolean(stored && stored.trim() !== DEFAULT_APPS_SCRIPT_URL);
};

export const resetAppsScriptUrl = (): string => {
  localStorage.removeItem('apps_script_url');
  return DEFAULT_APPS_SCRIPT_URL;
};

export const APPS_SCRIPT_URL = getAppsScriptUrl();

export interface SyncResult {
  success: boolean;
  message?: string;
  totalRegistrants?: number;
  totalAvailability?: number;
}

export const syncWithSpreadsheet = async (): Promise<SyncResult> => {
  try {
    const url = getAppsScriptUrl();
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== "success") {
      throw new Error(data.message || "Gagal mengambil data dari Google Apps Script");
    }

    // Update Registrants Data with Smart Merge (Preserves all user edits: panelis, waktu, ruangan, formPenilaian)
    if (Array.isArray(data.registrants) && data.registrants.length > 0) {
      const existing = getRegistrantsData();
      const mergedRegistrants = mergeRegistrants(data.registrants, existing);
      saveRegistrantsData(mergedRegistrants);
      if (isSupabaseConfigured) {
        upsertRegistrantsToSupabase(mergedRegistrants).catch(e => console.warn('Supabase registrants sync error:', e));
      }
    }

    // Update Availability Data
    if (data.availability && typeof data.availability === 'object') {
      saveAvailabilityData(data.availability);
      if (isSupabaseConfigured) {
        upsertAvailabilityToSupabase(data.availability).catch(e => console.warn('Supabase availability sync error:', e));
      }
    }

    // Update Panelists Hierarchy
    if (data.hierarchy && typeof data.hierarchy === 'object') {
      localStorage.setItem('panelists_hierarchy_v4', JSON.stringify(data.hierarchy));
      window.dispatchEvent(new Event('hierarchy_updated'));
    }

    // Update Panelists Directory
    if (data.panelists && typeof data.panelists === 'object') {
      localStorage.setItem('panelists_data_v4', JSON.stringify(data.panelists));
      window.dispatchEvent(new Event('panelists_updated'));
    }

    localStorage.setItem('last_spreadsheet_sync', new Date().toISOString());
    window.dispatchEvent(new Event('sync_completed'));

    return {
      success: true,
      totalRegistrants: data.registrants?.length || 0,
      totalAvailability: Object.keys(data.availability || {}).length
    };
  } catch (err: any) {
    console.error("Sync error:", err);
    return {
      success: false,
      message: err.message || "Gagal sinkronisasi data dengan Spreadsheet"
    };
  }
};
