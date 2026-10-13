import { 
  UserAccount, 
  ClientCompany, 
  Lead, 
  WorkAssignment, 
  SystemNotification, 
  Quotation, 
  UserRole, 
  ServiceAssignment, 
  ReimbursementClaim, 
  AttendanceRecord, 
  MaterialRequest, 
  CompanyProfile, 
  Festival, 
  SiteVisitRecord, 
  EmployeeDocument, 
  Vendor, 
  ProcurementRequirement, 
  AdminPurchaseApproval, 
  PurchaseOrder, 
  BirthdayWish,
  ProjectGroup,
  ProjectGroupMessage,
  MaterialStockItem,
  BillingInvoice
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_CLIENTS, 
  INITIAL_LEADS, 
  INITIAL_WORK_ASSIGNMENTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_SERVICES, 
  INITIAL_REIMBURSEMENTS, 
  INITIAL_ATTENDANCE, 
  INITIAL_MATERIAL_REQUESTS, 
  INITIAL_COMPANY_PROFILE, 
  INITIAL_FESTIVALS, 
  INITIAL_VENDORS, 
  INITIAL_PROCUREMENT_REQUIREMENTS, 
  INITIAL_ADMIN_PURCHASE_APPROVALS, 
  INITIAL_PURCHASE_ORDERS 
} from '../data/mockData';
import {
  INITIAL_PROJECT_GROUPS,
  INITIAL_PROJECT_MESSAGES,
  INITIAL_STOCKS_ITEMS,
  INITIAL_BILLING_INVOICES
} from '../data/workspaceData';

const KEYS = {
  USERS: 'company_crm_users_v4',
  CLIENTS: 'company_crm_clients_v3',
  LEADS: 'company_crm_leads_v3',
  WORKS: 'company_crm_works_v3',
  SERVICES: 'company_crm_services_v3',
  NOTIFS: 'company_crm_notifs_v3',
  REIMBURSEMENTS: 'company_crm_reimbursements_v3',
  ATTENDANCE: 'company_crm_attendance_v3',
  MATERIAL_REQUESTS: 'company_crm_material_reqs_v3',
  COMPANY_PROFILE: 'company_crm_company_profile_v3',
  FESTIVALS: 'company_crm_festivals_v3',
  SITE_VISITS: 'company_crm_site_visits_v3',
  EMPLOYEE_DOCUMENTS: 'company_crm_emp_docs_v3',
  VENDORS: 'company_crm_vendors_v3',
  PROCUREMENT_REQS: 'company_crm_procurement_reqs_v3',
  ADMIN_PURCHASE_APPROVALS: 'company_crm_admin_purchase_approvals_v3',
  PURCHASE_ORDERS: 'company_crm_purchase_orders_v3',
  ACTIVE_USER_ID: 'company_crm_active_user_id_v3',
  LAST_ACTIVE_TABS: 'company_crm_last_active_tabs_v3',
  AUTH_SESSION: 'company_crm_auth_session_v3',
  BIRTHDAY_WISHES: 'company_crm_birthday_wishes_v1',
  PROJECT_GROUPS: 'company_crm_project_groups_v1',
  PROJECT_MESSAGES: 'company_crm_project_messages_v1',
  STOCKS_INVENTORY: 'company_crm_stocks_inventory_v1',
  BILLING_INVOICES: 'company_crm_billing_invoices_v1'
};

const INITIAL_BIRTHDAY_WISHES: BirthdayWish[] = [
  {
    id: 'wish_1',
    targetEmployeeId: 'emp_22',
    targetEmployeeName: 'Mithilesh Yadav',
    senderId: 'user_admin',
    senderName: 'Shilpa Mam',
    senderRole: 'ADMIN',
    message: 'Wishing you a wonderful birthday month Mithilesh. Thank you for stellar operations leadership at KDPL Factory.',
    reaction: 'Best Wishes',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'wish_2',
    targetEmployeeId: 'emp_22',
    targetEmployeeName: 'Mithilesh Yadav',
    senderId: 'user_sub_admin',
    senderName: 'Rithu Nair',
    senderRole: 'SUB_ADMIN',
    message: 'Warmest birthday wishes Mithilesh. Proud of your continuous dedication leading factory and fabrication.',
    reaction: 'Appreciation',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'wish_3',
    targetEmployeeId: 'emp_22',
    targetEmployeeName: 'Mithilesh Yadav',
    senderId: 'user_pm_1',
    senderName: 'Sachin Pol',
    senderRole: 'PROJECT_MANAGER',
    reaction: 'Milestone',
    message: 'Congratulations on another successful year. Keep driving production excellence.',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return fallback;
  }
}

function stripLargeDataUrls(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (obj.startsWith('data:') && obj.length > 30000) {
      if (obj.startsWith('data:image/')) {
        return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80';
      }
      return obj.slice(0, 200) + '...[truncated data url]';
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => stripLargeDataUrls(item));
  }
  if (typeof obj === 'object') {
    const res: any = {};
    for (const k of Object.keys(obj)) {
      res[k] = stripLargeDataUrls(obj[k]);
    }
    return res;
  }
  return obj;
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err: any) {
    try {
      localStorage.removeItem('company_crm_notifs_v3');
      localStorage.removeItem('company_crm_last_active_tabs_v3');
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      try {
        const sanitized = stripLargeDataUrls(value);
        localStorage.setItem(key, JSON.stringify(sanitized));
      } catch {
        console.warn(`[Storage Warning] Storage quota limit reached for ${key}.`);
      }
    }
  }
}

export interface AuthSession {
  isLoggedIn: boolean;
  userId: string;
  userEmail: string;
  role: string;
  loginTimestamp: number;
}

export const Storage = {
  getUsers: (): UserAccount[] => {
    const list = getStored(KEYS.USERS, INITIAL_USERS);
    let changed = false;
    const healed = list.map(u => {
      // Meenakshi Pandey is strictly 07 September 2001 per details sheet
      if (u.id === 'user_crm_2' && u.dateOfBirth !== '07 September 2001') {
        changed = true;
        return { ...u, dateOfBirth: '07 September 2001' };
      }
      // Krishna Mishra is strictly 12 September 2002 per details sheet
      if (u.id === 'user_designer_1' && u.dateOfBirth !== '12 September 2002') {
        changed = true;
        return { ...u, dateOfBirth: '12 September 2002' };
      }
      return u;
    });
    if (changed) {
      setStored(KEYS.USERS, healed);
      return healed;
    }
    return list;
  },
  saveUsers: (users: UserAccount[]) => setStored(KEYS.USERS, users),

  getClients: (): ClientCompany[] => getStored(KEYS.CLIENTS, INITIAL_CLIENTS),
  saveClients: (clients: ClientCompany[]) => setStored(KEYS.CLIENTS, clients),

  getLeads: (): Lead[] => getStored(KEYS.LEADS, INITIAL_LEADS),
  saveLeads: (leads: Lead[]) => setStored(KEYS.LEADS, leads),

  getWorks: (): WorkAssignment[] => getStored(KEYS.WORKS, INITIAL_WORK_ASSIGNMENTS),
  saveWorks: (works: WorkAssignment[]) => setStored(KEYS.WORKS, works),

  getServices: (): ServiceAssignment[] => getStored(KEYS.SERVICES, INITIAL_SERVICES),
  saveServices: (services: ServiceAssignment[]) => setStored(KEYS.SERVICES, services),

  getReimbursements: (): ReimbursementClaim[] => getStored(KEYS.REIMBURSEMENTS, INITIAL_REIMBURSEMENTS),
  saveReimbursements: (reimbursements: ReimbursementClaim[]) => setStored(KEYS.REIMBURSEMENTS, reimbursements),

  getAttendance: (): AttendanceRecord[] => getStored(KEYS.ATTENDANCE, INITIAL_ATTENDANCE),
  saveAttendance: (records: AttendanceRecord[]) => setStored(KEYS.ATTENDANCE, records),

  getMaterialRequests: (): MaterialRequest[] => getStored(KEYS.MATERIAL_REQUESTS, INITIAL_MATERIAL_REQUESTS),
  saveMaterialRequests: (reqs: MaterialRequest[]) => setStored(KEYS.MATERIAL_REQUESTS, reqs),

  getCompanyProfile: (): CompanyProfile => getStored(KEYS.COMPANY_PROFILE, INITIAL_COMPANY_PROFILE),
  saveCompanyProfile: (profile: CompanyProfile) => setStored(KEYS.COMPANY_PROFILE, profile),

  getFestivals: (): Festival[] => getStored(KEYS.FESTIVALS, INITIAL_FESTIVALS),
  saveFestivals: (festivals: Festival[]) => setStored(KEYS.FESTIVALS, festivals),

  getSiteVisits: (): SiteVisitRecord[] => getStored(KEYS.SITE_VISITS, []),
  saveSiteVisits: (visits: SiteVisitRecord[]) => setStored(KEYS.SITE_VISITS, visits),

  getEmployeeDocuments: (): EmployeeDocument[] => getStored(KEYS.EMPLOYEE_DOCUMENTS, []),
  saveEmployeeDocuments: (docs: EmployeeDocument[]) => setStored(KEYS.EMPLOYEE_DOCUMENTS, docs),

  getVendors: (): Vendor[] => {
    const list = getStored(KEYS.VENDORS, INITIAL_VENDORS);
    return list.map(v => {
      if (!v.vendorFor) {
        if (v.category === 'ACP & Sheet Metal') v.vendorFor = 'ACP Sheets, Cladding Panels & Extrusions';
        else if (v.category === 'Acrylic & Vinyl') v.vendorFor = 'Cast Acrylic Sheets, 3M Vinyl & Diffuser Panels';
        else if (v.category === 'LED & Electricals') v.vendorFor = 'Signage LED Modules, Power Supplies & Drivers';
        else if (v.category === 'Hardware & Fasteners') v.vendorFor = 'SS Anchor Bolts, TEK Screws & Signage Fasteners';
        else if (v.category === 'Structural Steel & MS') v.vendorFor = 'MS Hollow Pipes, Structural Angles & Base Plates';
        else if (v.category === 'Paints & Coatings') v.vendorFor = 'PU Enamel, Zinc Primer & Powder Coating Powder';
        else v.vendorFor = `${v.category} Specialized Supply`;
      }
      return v;
    });
  },
  saveVendors: (vendors: Vendor[]) => setStored(KEYS.VENDORS, vendors),

  getProcurementRequirements: (): ProcurementRequirement[] => getStored(KEYS.PROCUREMENT_REQS, INITIAL_PROCUREMENT_REQUIREMENTS),
  saveProcurementRequirements: (reqs: ProcurementRequirement[]) => setStored(KEYS.PROCUREMENT_REQS, reqs),

  getAdminPurchaseApprovals: (): AdminPurchaseApproval[] => getStored(KEYS.ADMIN_PURCHASE_APPROVALS, INITIAL_ADMIN_PURCHASE_APPROVALS),
  saveAdminPurchaseApprovals: (approvals: AdminPurchaseApproval[]) => setStored(KEYS.ADMIN_PURCHASE_APPROVALS, approvals),

  getPurchaseOrders: (): PurchaseOrder[] => getStored(KEYS.PURCHASE_ORDERS, INITIAL_PURCHASE_ORDERS),
  savePurchaseOrders: (pos: PurchaseOrder[]) => setStored(KEYS.PURCHASE_ORDERS, pos),

  getNotifications: (): SystemNotification[] => getStored(KEYS.NOTIFS, INITIAL_NOTIFICATIONS),
  saveNotifications: (notifs: SystemNotification[]) => setStored(KEYS.NOTIFS, notifs),

  getActiveUserId: (): string => getStored(KEYS.ACTIVE_USER_ID, 'user_admin'),
  setActiveUserId: (id: string) => setStored(KEYS.ACTIVE_USER_ID, id),

  getAuthSession: (): AuthSession | null =>
    getStored<AuthSession | null>(KEYS.AUTH_SESSION, {
      isLoggedIn: true,
      userId: 'user_admin',
      userEmail: 'admin@companycrm.com',
      role: 'ADMIN',
      loginTimestamp: Date.now()
    }),
  saveAuthSession: (session: AuthSession) =>
    setStored(KEYS.AUTH_SESSION, session),
  clearAuthSession: () => localStorage.removeItem(KEYS.AUTH_SESSION),

  getLastActiveTabs: (): Record<string, string> => getStored(KEYS.LAST_ACTIVE_TABS, {}),
  saveLastActiveTabs: (tabs: Record<string, string>) => setStored(KEYS.LAST_ACTIVE_TABS, tabs),

  getBirthdayWishes: (): BirthdayWish[] => {
    const list = getStored(KEYS.BIRTHDAY_WISHES, INITIAL_BIRTHDAY_WISHES);
    if (list.length > 0 && list.some(w => w.targetEmployeeId === 'user_crm_2')) {
      const filtered = list.filter(w => w.targetEmployeeId !== 'user_crm_2');
      const merged = filtered.length > 0 ? filtered : INITIAL_BIRTHDAY_WISHES;
      setStored(KEYS.BIRTHDAY_WISHES, merged);
      return merged;
    }
    return list;
  },
  saveBirthdayWishes: (wishes: BirthdayWish[]) => setStored(KEYS.BIRTHDAY_WISHES, wishes),

  // Workspace Project Groups (WhatsApp group-style rooms)
  getProjectGroups: (): ProjectGroup[] => getStored(KEYS.PROJECT_GROUPS, INITIAL_PROJECT_GROUPS),
  saveProjectGroups: (groups: ProjectGroup[]) => setStored(KEYS.PROJECT_GROUPS, groups),

  // Project Group Messages (with 3-action file verification & accounts bucket updates)
  getProjectGroupMessages: (): ProjectGroupMessage[] => getStored(KEYS.PROJECT_MESSAGES, INITIAL_PROJECT_MESSAGES),
  saveProjectGroupMessages: (msgs: ProjectGroupMessage[]) => setStored(KEYS.PROJECT_MESSAGES, msgs),

  // Stocks & Inventory Catalog
  getStocksInventory: (): MaterialStockItem[] => getStored(KEYS.STOCKS_INVENTORY, INITIAL_STOCKS_ITEMS),
  saveStocksInventory: (items: MaterialStockItem[]) => setStored(KEYS.STOCKS_INVENTORY, items),

  // Billing Invoices
  getBillingInvoices: (): BillingInvoice[] => getStored(KEYS.BILLING_INVOICES, INITIAL_BILLING_INVOICES),
  saveBillingInvoices: (invoices: BillingInvoice[]) => setStored(KEYS.BILLING_INVOICES, invoices),

  resetToDefaults: () => {
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.CLIENTS);
    localStorage.removeItem(KEYS.LEADS);
    localStorage.removeItem(KEYS.WORKS);
    localStorage.removeItem(KEYS.SERVICES);
    localStorage.removeItem(KEYS.REIMBURSEMENTS);
    localStorage.removeItem(KEYS.ATTENDANCE);
    localStorage.removeItem(KEYS.MATERIAL_REQUESTS);
    localStorage.removeItem(KEYS.COMPANY_PROFILE);
    localStorage.removeItem(KEYS.NOTIFS);
    localStorage.removeItem(KEYS.ACTIVE_USER_ID);
    localStorage.removeItem(KEYS.LAST_ACTIVE_TABS);
  }
};
