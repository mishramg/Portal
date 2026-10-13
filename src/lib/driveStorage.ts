// Google Drive Storage Management Service
// Handles cloud storage links, folder structures, and Google Drive upload simulation

export interface GoogleDriveFolderConfig {
  rootFolderId: string;
  rootFolderName: string;
  rootFolderUrl: string;
  attendanceFolderUrl: string;
  reimbursementsFolderUrl: string;
  leadsFolderUrl: string;
}

export const DEFAULT_DRIVE_CONFIG: GoogleDriveFolderConfig = {
  rootFolderId: '1_Kamlawati_CRM_Enterprise_Root',
  rootFolderName: 'Kamlawati CRM Cloud Portal',
  rootFolderUrl: 'https://drive.google.com/drive/folders/1_Kamlawati_CRM_Enterprise_Root',
  attendanceFolderUrl: 'https://drive.google.com/drive/folders/1_Kamlawati_Attendance_Photos_2026',
  reimbursementsFolderUrl: 'https://drive.google.com/drive/folders/1_Kamlawati_Claims_Receipts_2026',
  leadsFolderUrl: 'https://drive.google.com/drive/folders/1_Kamlawati_Leads_Vault_2026'
};

export const getStoredDriveConfig = (): GoogleDriveFolderConfig => {
  try {
    const saved = localStorage.getItem('company_crm_google_drive_config');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Error reading Drive config:', e);
  }
  return DEFAULT_DRIVE_CONFIG;
};

export const saveStoredDriveConfig = (config: GoogleDriveFolderConfig): void => {
  try {
    localStorage.setItem('company_crm_google_drive_config', JSON.stringify(config));
  } catch (e) {
    console.warn('Error saving Drive config:', e);
  }
};

/**
 * Generates a Google Drive shareable file link representation
 */
export const generateGoogleDriveFileUrl = (
  fileType: 'ATTENDANCE_IN' | 'ATTENDANCE_OUT' | 'REIMBURSEMENT' | 'DOCUMENT',
  employeeName: string,
  dateStr: string
): string => {
  const config = getStoredDriveConfig();
  const sanitizedName = employeeName.replace(/\s+/g, '_');
  const uniqueHash = Math.random().toString(36).substring(2, 10);
  
  if (fileType === 'ATTENDANCE_IN' || fileType === 'ATTENDANCE_OUT') {
    return `${config.attendanceFolderUrl}?file=${sanitizedName}_${dateStr}_${fileType}_${uniqueHash}.jpg`;
  } else if (fileType === 'REIMBURSEMENT') {
    return `${config.reimbursementsFolderUrl}?file=${sanitizedName}_${dateStr}_Claim_${uniqueHash}.pdf`;
  }
  return `${config.rootFolderUrl}?file=${sanitizedName}_${dateStr}_${uniqueHash}`;
};
