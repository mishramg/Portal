import { 
  UserAccount, 
  ClientCompany, 
  Lead, 
  WorkAssignment, 
  SystemNotification,
  ServiceAssignment,
  ReimbursementClaim,
  AttendanceRecord,
  MaterialRequest,
  CompanyProfile,
  Festival,
  SiteVisitRecord,
  EmployeeDocument,
  Tombstone
} from '../types';

export interface BackendDataPayload {
  users: UserAccount[];
  clients: ClientCompany[];
  leads: Lead[];
  works: WorkAssignment[];
  services: ServiceAssignment[];
  reimbursements: ReimbursementClaim[];
  attendance?: AttendanceRecord[];
  attendanceRecords?: AttendanceRecord[];
  siteVisits: SiteVisitRecord[];
  employeeDocuments: EmployeeDocument[];
  materialRequests: MaterialRequest[];
  companyProfile: CompanyProfile;
  festivals: Festival[];
  notifications: SystemNotification[];
  tombstones: Tombstone[];
  updatedAt: string;
}

const API_BASE = '/api';

export const ApiService = {
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async fetchAllData(): Promise<BackendDataPayload | null> {
    try {
      const res = await fetch(`${API_BASE}/sync`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('[API Sync] Backend fetch failed, using local offline store.', err);
      return null;
    }
  },

  async pullAllData(): Promise<BackendDataPayload | null> {
    return this.fetchAllData();
  },

  async syncAllData(payload: Partial<BackendDataPayload>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          updatedAt: new Date().toISOString()
        })
      });
      return res.ok;
    } catch (err) {
      console.warn('[API Sync] Backend push failed:', err);
      return false;
    }
  },

  async syncData(payload: Partial<BackendDataPayload>): Promise<boolean> {
    return this.syncAllData(payload);
  },

  async uploadMedia(fileDataUrl: string, fileName: string, category: 'ATTENDANCE' | 'SITE_VISIT' | 'DOCUMENT'): Promise<string> {
    try {
      const res = await fetch(`${API_BASE}/storage/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: fileDataUrl,
          fileName,
          category
        })
      });
      if (res.ok) {
        const json = await res.json();
        return json.url || fileDataUrl;
      }
    } catch (e) {
      console.warn('[Upload] Failed to upload to backend storage, using data URL fallback');
    }
    return fileDataUrl;
  }
};
