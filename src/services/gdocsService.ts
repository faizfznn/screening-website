import { type Registrant } from '../data/registrantsData';

// Official Folder & Template IDs provided by user
export const FOLDER_PENILAIAN_ID = "1hvx57KYnx2CRxGGHX1-P2FTjSAzYmoPR";
export const FOLDER_TRANSPARANSI_ID = "1BH9WEmXdVkBEidLPVLIfb4bpV2eH9Eph";

export const TEMPLATE_PENILAIAN_ID = "1JwU79RHBfpqyqOOYs62wT5CHEUAZzb7nc4B-y1N2zlM";
export const TEMPLATE_TRANSPARANSI_ID = "1nToXP6VlGrSu3_2TT8S_B2joVKjOK6LGmbBnitZKNpQ";

// Official Default Webhook URL (BEM Apps Script from ENV or Fallback)
export const DEFAULT_WEBHOOK_URL =
  import.meta.env.VITE_GDOCS_WEBHOOK_URL ||
  "https://script.google.com/macros/s/AKfycbzhWMnBL6YD8RfdUN8_LR2ulN3EsK0ebrRIxxpew4lXImzffuEEVsMn0J7DxqEJgniq/exec";

export const getWebhookUrl = (): string => {
  return localStorage.getItem('gdocs_webhook_url') || DEFAULT_WEBHOOK_URL;
};

export const isUsingCustomWebhook = (): boolean => {
  const stored = localStorage.getItem('gdocs_webhook_url');
  return Boolean(stored && stored.trim() !== DEFAULT_WEBHOOK_URL);
};

export const setWebhookUrl = (url: string): void => {
  if (!url || url.trim() === DEFAULT_WEBHOOK_URL) {
    localStorage.removeItem('gdocs_webhook_url');
  } else {
    localStorage.setItem('gdocs_webhook_url', url.trim());
  }
};

export const resetWebhookUrl = (): string => {
  localStorage.removeItem('gdocs_webhook_url');
  return DEFAULT_WEBHOOK_URL;
};

export interface GenerateResult {
  success: boolean;
  url: string;
  docId?: string;
  error?: string;
}

/**
 * Generate Google Docs for a registrant into their respective folder.
 * If webhook is provided, calls Google Apps Script.
 * Otherwise creates a direct copy link pre-formatted with candidate information.
 */
export async function generateGDoc(
  registrant: Registrant,
  type: 'penilaian' | 'transparansi'
): Promise<GenerateResult> {
  const webhookUrl = getWebhookUrl();
  const templateId = type === 'penilaian' ? TEMPLATE_PENILAIAN_ID : TEMPLATE_TRANSPARANSI_ID;
  const folderId = type === 'penilaian' ? FOLDER_PENILAIAN_ID : FOLDER_TRANSPARANSI_ID;
  const docTitle = type === 'penilaian'
    ? `Form Penilaian - ${registrant.nama}`
    : `Form Transparansi - ${registrant.nama}`;

  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      const payload = {
        type,
        id: registrant.id,
        nama: registrant.nama,
        pilihan1: registrant.pilihan1,
        pilihan2: registrant.pilihan2,
        panelis1: registrant.panelis1 || "-",
        panelis2: registrant.panelis2 || "-",
        ruangan: registrant.ruangan || "-",
        tanggal: registrant.tanggal,
        waktu: registrant.waktu,
        folderId
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          return { success: true, url: data.url, docId: data.docId };
        }
      }
    } catch (e) {
      console.warn('Google Apps Script webhook call error, falling back to direct GDocs copy template', e);
    }
  }

  // Fallback: Direct Google Docs copy URL with pre-named title
  const copyUrl = `https://docs.google.com/document/d/${templateId}/copy?title=${encodeURIComponent(docTitle)}`;

  return {
    success: true,
    url: copyUrl,
    docId: templateId
  };
}
