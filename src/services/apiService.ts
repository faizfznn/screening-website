import { saveRegistrantsData, saveAvailabilityData } from '../data/registrantsData';

export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxPbigiK814NsJmCimn8ddxt-SBG3LS2B3m_OsLbTAGLnXit7JOLsdbDXQb3filH70S/exec";

export interface SyncResult {
  success: boolean;
  message?: string;
  totalRegistrants?: number;
  totalAvailability?: number;
}

export const syncWithSpreadsheet = async (): Promise<SyncResult> => {
  try {
    const response = await fetch(APPS_SCRIPT_URL);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== "success") {
      throw new Error(data.message || "Gagal mengambil data dari Google Apps Script");
    }

    // Update Registrants Data
    if (Array.isArray(data.registrants) && data.registrants.length > 0) {
      saveRegistrantsData(data.registrants);
    }

    // Update Availability Data
    if (data.availability && typeof data.availability === 'object') {
      saveAvailabilityData(data.availability);
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
