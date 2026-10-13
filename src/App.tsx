import React, { useState, useEffect } from 'react';
import { 
  UserAccount, 
  ClientCompany, 
  Lead, 
  WorkAssignment, 
  SystemNotification,
  UserRole,
  ServiceAssignment,
  ReimbursementClaim,
  AttendanceRecord,
  MaterialRequest,
  CompanyProfile,
  Festival,
  SiteVisitRecord,
  EmployeeDocument,
  BirthdayWish,
  NavTab,
  ProjectGroup,
  ProjectGroupMessage,
  MaterialStockItem,
  BillingInvoice
} from './types';
import { Storage } from './lib/storage';
import { ApiService } from './lib/api';
import { INITIAL_USERS } from './data/mockData';
import { RoleSwitcher } from './components/RoleSwitcher';
import { Header } from './components/Header';
import { 
  BirthdayReminderModal, 
  getTodaysBirthdayEmployees, 
  getCurrentMonthBirthdayEmployees, 
  MONTH_NAMES 
} from './components/common/BirthdayReminderModal';
import { SectionHeaderBar } from './components/common/SectionHeaderBar';
import { HomeScreen } from './components/home/HomeScreen';
import { SiteVisitLog } from './components/site/SiteVisitLog';
import { AboutEmployees } from './components/employees/AboutEmployees';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ClientManager } from './components/clients/ClientManager';
import { LeadManager } from './components/crm/LeadManager';
import { CrmWorkflowPipeline } from './components/crm/CrmWorkflowPipeline';
import { ProjectManagerWorkspace } from './components/projectmanager/ProjectManagerWorkspace';
import { QuotationBuilder } from './components/quotations/QuotationBuilder';
import { DesignerPortal } from './components/designer/DesignerPortal';
import { StructureDesignerWorkspace } from './components/designer/StructureDesignerWorkspace';
import { DesignRequestGlobalDesk } from './components/common/DesignRequestGlobalDesk';
import { SupervisorDesk } from './components/supervisor/SupervisorDesk';
import { SiteSupervisorPortal } from './components/site/SiteSupervisorPortal';
import { UserManagement } from './components/users/UserManagement';
import { ServiceCatalog } from './components/services/ServiceCatalog';
import { HRAttendanceDesk } from './components/hr/HRAttendanceDesk';
import { ReimbursementClaimView } from './components/reimbursement/ReimbursementClaimView';
import { AccountsReimbursementDesk } from './components/accounts/AccountsReimbursementDesk';
import { MaterialRequisitionDesk } from './components/accounts/MaterialRequisitionDesk';
import { PurchaseBucketDesk } from './components/purchase/PurchaseBucketDesk';
import { BillingDesk } from './components/billing/BillingDesk';
import { StocksInventoryDesk } from './components/stocks/StocksInventoryDesk';
import { ProjectGroupChatWorkspace } from './components/workspace/ProjectGroupChatWorkspace';
import { MyAttendancePunch } from './components/attendance/MyAttendancePunch';
import { StaffReceSection } from './components/rece/StaffReceSection';
import { PurchaseDesk } from './components/purchase/PurchaseDesk';
import { CompanySettingsModal } from './components/admin/CompanySettingsModal';
import { GlobalImageViewer } from './components/common/GlobalImageViewer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { LoginModal } from './components/auth/LoginModal';
import { PlusCircle, Building2, X, ExternalLink, Bell, Send, Briefcase, FileCheck2 } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<UserAccount[]>(() => Storage.getUsers());
  const [clients, setClients] = useState<ClientCompany[]>(() => Storage.getClients());
  const [toastNotif, setToastNotif] = useState<SystemNotification | null>(null);
  const [leads, setLeads] = useState<Lead[]>(() => Storage.getLeads());
  const [works, setWorks] = useState<WorkAssignment[]>(() => Storage.getWorks());
  const [services, setServices] = useState<ServiceAssignment[]>(() => Storage.getServices());
  const [reimbursements, setReimbursements] = useState<ReimbursementClaim[]>(() => Storage.getReimbursements());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => Storage.getAttendance());
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(() => Storage.getMaterialRequests());
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => Storage.getNotifications());
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => Storage.getCompanyProfile());
  const [festivals, setFestivals] = useState<Festival[]>(() => Storage.getFestivals());
  const [siteVisits, setSiteVisits] = useState<SiteVisitRecord[]>(() => Storage.getSiteVisits());
  const [employeeDocuments, setEmployeeDocuments] = useState<EmployeeDocument[]>(() => Storage.getEmployeeDocuments());
  const [birthdayWishes, setBirthdayWishes] = useState<BirthdayWish[]>(() => Storage.getBirthdayWishes());
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState<boolean>(false);

  // Dedicated Workspace States: Project Groups (WhatsApp Rooms), Stocks & Billing
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>(() => Storage.getProjectGroups());
  const [projectGroupMessages, setProjectGroupMessages] = useState<ProjectGroupMessage[]>(() => Storage.getProjectGroupMessages());
  const [stocksItems, setStocksItems] = useState<MaterialStockItem[]>(() => Storage.getStocksInventory());
  const [billingInvoices, setBillingInvoices] = useState<BillingInvoice[]>(() => Storage.getBillingInvoices());

  // Restore authentic dates of birth from details sheet if previously altered in browser storage
  useEffect(() => {
    setUsers(prevUsers => {
      let isDifferent = false;
      const updated = prevUsers.map(u => {
        // Meenakshi Pandey: strictly 07 September 2001 from details sheet
        if (u.id === 'user_crm_2' && u.dateOfBirth !== '07 September 2001') {
          isDifferent = true;
          return { ...u, dateOfBirth: '07 September 2001' };
        }
        // Krishna Mishra: strictly 12 September 2002 from details sheet
        if (u.id === 'user_designer_1' && u.dateOfBirth !== '12 September 2002') {
          isDifferent = true;
          return { ...u, dateOfBirth: '12 September 2002' };
        }
        return u;
      });
      if (isDifferent) {
        Storage.saveUsers(updated);
        return updated;
      }
      return prevUsers;
    });
  }, []);

  // Auto-trigger Birthday Reminder Modal on session mount if any employee has a birthday today on system clock
  useEffect(() => {
    const todaysBdays = getTodaysBirthdayEmployees(users, new Date());
    if (todaysBdays.length > 0) {
      const now = new Date();
      const localTodayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const dismissedKey = `kdpl_birthday_popup_dismissed_${localTodayStr}`;
      if (!sessionStorage.getItem(dismissedKey)) {
        setIsBirthdayModalOpen(true);
      }
    }
  }, [users]);

  const handleSendBirthdayWish = (wishData: Omit<BirthdayWish, 'id' | 'createdAt'>) => {
    const newWish: BirthdayWish = {
      ...wishData,
      id: 'wish_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [newWish, ...birthdayWishes];
    setBirthdayWishes(updated);
    Storage.saveBirthdayWishes(updated);
  };

  const handleCloseBirthdayModal = () => {
    const now = new Date();
    const localTodayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    sessionStorage.setItem(`kdpl_birthday_popup_dismissed_${localTodayStr}`, 'true');
    setIsBirthdayModalOpen(false);
  };

  // Initial pull from backend Netlify functions / ApiService
  useEffect(() => {
    let isMounted = true;
    ApiService.pullAllData()
      .then((serverData) => {
        if (!isMounted || !serverData) return;
        if (serverData.users?.length) {
          // Merge server users with INITIAL_USERS to ensure all 43 staff members exist with updated fields
          const serverUsersMap = new Map(serverData.users.map((u: UserAccount) => [u.id, u]));
          const mergedUsers: UserAccount[] = INITIAL_USERS.map((initUser) => {
            const serverUser = serverUsersMap.get(initUser.id);
            if (!serverUser) return initUser;
            // Prefer server user fields if edited, but fill missing department/designation/reportingTo/emergencyRelation/salaryDetails from initUser
            return {
              ...initUser,
              ...serverUser,
              phone: initUser.phone || serverUser.phone || '',
              department: serverUser.department || initUser.department,
              designation: serverUser.designation || initUser.designation,
              reportingTo: serverUser.reportingTo || initUser.reportingTo,
              emergencyPhone: serverUser.emergencyPhone || initUser.emergencyPhone,
              emergencyRelation: serverUser.emergencyRelation || initUser.emergencyRelation,
              employeeCode: serverUser.employeeCode || initUser.employeeCode,
              joiningDate: serverUser.joiningDate || initUser.joiningDate,
              dateOfBirth: serverUser.dateOfBirth || initUser.dateOfBirth,
              salaryDetails: serverUser.salaryDetails || initUser.salaryDetails
            };
          });

          // Also include any newly added users from server that are not in INITIAL_USERS
          const initIds = new Set(INITIAL_USERS.map((u) => u.id));
          serverData.users.forEach((su: UserAccount) => {
            if (!initIds.has(su.id)) {
              mergedUsers.push(su);
            }
          });

          setUsers(mergedUsers);
          Storage.saveUsers(mergedUsers);
        }
        if (serverData.clients?.length) setClients(serverData.clients);
        if (serverData.leads?.length) setLeads(serverData.leads);
        if (serverData.works?.length) setWorks(serverData.works);
        if (serverData.services?.length) setServices(serverData.services);
        if (serverData.reimbursements?.length) setReimbursements(serverData.reimbursements);
        if (serverData.attendanceRecords?.length) setAttendanceRecords(serverData.attendanceRecords);
        if (serverData.materialRequests?.length) setMaterialRequests(serverData.materialRequests);
        if (serverData.companyProfile) setCompanyProfile(serverData.companyProfile);
        if (serverData.festivals?.length) setFestivals(serverData.festivals);
        if (serverData.siteVisits?.length) setSiteVisits(serverData.siteVisits);
        if (serverData.employeeDocuments?.length) setEmployeeDocuments(serverData.employeeDocuments);
      })
      .catch((err) => {
        console.warn('Backend sync initial pull:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const [authSession, setAuthSession] = useState(() => Storage.getAuthSession());
  const [activeUserId, setActiveUserId] = useState<string>(() => {
    const session = Storage.getAuthSession();
    return session?.userId || Storage.getActiveUserId();
  });
  const [lastActiveTabs, setLastActiveTabs] = useState<Record<string, string>>(() => Storage.getLastActiveTabs());

  // Verify authSession against user existence and password changes
  useEffect(() => {
    if (authSession) {
      const usr = users.find((u) => u.id === authSession.userId);
      if (!usr || !usr.active) {
        Storage.clearAuthSession();
        setAuthSession(null);
      } else if (usr.passwordLastChangedAt) {
        const passChangeTime = new Date(usr.passwordLastChangedAt).getTime();
        if (passChangeTime > authSession.loginTimestamp) {
          Storage.clearAuthSession();
          setAuthSession(null);
        }
      }
    }
  }, [users, authSession]);

  const handleLoginSuccess = (user: UserAccount) => {
    const newSession = {
      isLoggedIn: true,
      userId: user.id,
      userEmail: user.email,
      role: user.role,
      loginTimestamp: Date.now()
    };
    Storage.saveAuthSession(newSession);
    setAuthSession(newSession);
    setActiveUserId(user.id);
    setActiveTab('HOME');
  };

  const handleLogout = () => {
    Storage.clearAuthSession();
    setAuthSession(null);
  };

  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const activeId = Storage.getActiveUserId();
    const savedTabs = Storage.getLastActiveTabs();
    const lastTab = savedTabs[activeId] as NavTab;
    if (lastTab) return lastTab;
    return 'HOME';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal State for Quick Assign Work
  const [showGlobalAssignWorkModal, setShowGlobalAssignWorkModal] = useState(false);
  const [showCompanySettingsModal, setShowCompanySettingsModal] = useState(false);
  const [globalWorkTitle, setGlobalWorkTitle] = useState('');
  const [globalSelectedClientId, setGlobalSelectedClientId] = useState('');
  const [globalBrandName, setGlobalBrandName] = useState('');
  const [globalAssignedCrmId, setGlobalAssignedCrmId] = useState('');

  // Modal State for Quick Submit Lead
  const [showGlobalSubmitLeadModal, setShowGlobalSubmitLeadModal] = useState(false);
  const [globalLeadTitle, setGlobalLeadTitle] = useState('');
  const [globalLeadCompanyName, setGlobalLeadCompanyName] = useState('');
  const [globalLeadContactPerson, setGlobalLeadContactPerson] = useState('');
  const [globalLeadPhone, setGlobalLeadPhone] = useState('');
  const [globalLeadEmail, setGlobalLeadEmail] = useState('');
  const [globalLeadAddress, setGlobalLeadAddress] = useState('');
  const [globalLeadGst, setGlobalLeadGst] = useState('');
  const [globalLeadBudget, setGlobalLeadBudget] = useState(100000);
  const [globalLeadRequirements, setGlobalLeadRequirements] = useState('');
  const [globalLeadAssignedCrmId, setGlobalLeadAssignedCrmId] = useState('');
  const [globalLeadClientType, setGlobalLeadClientType] = useState<'NEW' | 'OLD'>('NEW');
  const [globalLeadSelectedClientId, setGlobalLeadSelectedClientId] = useState('');

  // Save to local storage whenever state updates
  useEffect(() => { Storage.saveUsers(users); }, [users]);
  useEffect(() => { Storage.saveClients(clients); }, [clients]);
  useEffect(() => { Storage.saveLeads(leads); }, [leads]);
  useEffect(() => { Storage.saveWorks(works); }, [works]);
  useEffect(() => { Storage.saveServices(services); }, [services]);
  useEffect(() => { Storage.saveReimbursements(reimbursements); }, [reimbursements]);
  useEffect(() => { Storage.saveAttendance(attendanceRecords); }, [attendanceRecords]);
  useEffect(() => { Storage.saveMaterialRequests(materialRequests); }, [materialRequests]);
  useEffect(() => { Storage.saveNotifications(notifications); }, [notifications]);
  useEffect(() => { Storage.saveCompanyProfile(companyProfile); }, [companyProfile]);
  useEffect(() => { Storage.saveFestivals(festivals); }, [festivals]);
  useEffect(() => { Storage.saveSiteVisits(siteVisits); }, [siteVisits]);
  useEffect(() => { Storage.saveEmployeeDocuments(employeeDocuments); }, [employeeDocuments]);
  useEffect(() => { Storage.setActiveUserId(activeUserId); }, [activeUserId]);
  useEffect(() => { Storage.saveLastActiveTabs(lastActiveTabs); }, [lastActiveTabs]);
  useEffect(() => { Storage.saveProjectGroups(projectGroups); }, [projectGroups]);
  useEffect(() => { Storage.saveProjectGroupMessages(projectGroupMessages); }, [projectGroupMessages]);
  useEffect(() => { Storage.saveStocksInventory(stocksItems); }, [stocksItems]);
  useEffect(() => { Storage.saveBillingInvoices(billingInvoices); }, [billingInvoices]);

  // Periodic and change-based sync to backend
  useEffect(() => {
    const payload = {
      users,
      clients,
      leads,
      works,
      services,
      reimbursements,
      attendanceRecords,
      materialRequests,
      companyProfile,
      festivals,
      siteVisits,
      employeeDocuments
    };
    ApiService.syncData(payload).catch((err) => {
      // Background sync logger
    });
  }, [
    users,
    clients,
    leads,
    works,
    services,
    reimbursements,
    attendanceRecords,
    materialRequests,
    companyProfile,
    festivals,
    siteVisits,
    employeeDocuments
  ]);

  // Handlers for site visits & employee documents
  const handleAddSiteVisit = (newVisit: SiteVisitRecord) => {
    setSiteVisits((prev) => [newVisit, ...prev]);
    addNotification('Site Visit Logged', `${newVisit.employeeName} logged visit at ${newVisit.siteLocation}`, 'WORK');
  };

  const handleUpdateSiteVisit = (updated: SiteVisitRecord) => {
    setSiteVisits((prev) => prev.map((v) => v.id === updated.id ? updated : v));
  };

  const handleAddEmployeeDocument = (doc: EmployeeDocument) => {
    setEmployeeDocuments((prev) => [doc, ...prev]);
    addNotification('Document Uploaded', `New document uploaded for ${doc.employeeName}`, 'WORK');
  };

  const handleDeleteEmployeeDocument = (docId: string) => {
    setEmployeeDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  // Track activeTab updates for the active user session
  useEffect(() => {
    if (activeUserId && activeTab) {
      setLastActiveTabs((prev) => {
        if (prev[activeUserId] === activeTab) return prev;
        return {
          ...prev,
          [activeUserId]: activeTab,
        };
      });
    }
  }, [activeTab, activeUserId]);

  const handleAddFestival = (fest: Festival) => {
    const updated = [fest, ...festivals];
    setFestivals(updated);
    addNotification('Festival Added', `Added corporate festival: ${fest.name}`, 'WORK');
  };

  const handleUpdateFestival = (updatedFest: Festival) => {
    setFestivals((prev) => prev.map((f) => f.id === updatedFest.id ? updatedFest : f));
  };

  const handleDeleteFestival = (festId: string) => {
    setFestivals((prev) => prev.filter((f) => f.id !== festId));
  };

  // Dedicated Workspace Handlers (WhatsApp Group Chat, File Reviews & Reminders)
  const handleUpdateGroup = (updatedGroup: ProjectGroup) => {
    setProjectGroups((prev) => prev.map((g) => g.id === updatedGroup.id ? updatedGroup : g));
  };

  const handleAddGroup = (newGroup: ProjectGroup) => {
    setProjectGroups((prev) => [newGroup, ...prev]);
    addNotification('Project Group Created', `Created WhatsApp chat room for "${newGroup.projectName}"`, 'WORK');
  };

  const handleSendMessage = (newMsg: ProjectGroupMessage) => {
    setProjectGroupMessages((prev) => [...prev, newMsg]);
  };

  const handleUpdateMessage = (updatedMsg: ProjectGroupMessage) => {
    setProjectGroupMessages((prev) => prev.map((m) => m.id === updatedMsg.id ? updatedMsg : m));
  };

  // Accounts Reply to Project Group: Updates requisition & posts ACCOUNTS_UPDATE message into that project's chat
  const handleAccountsReplyToGroup = (
    reqId: string, 
    replyText: string, 
    newStatus: 'SANCTIONED' | 'PAID' | 'REJECTED' | 'DISPATCHED'
  ) => {
    const targetReq = materialRequests.find((r) => r.id === reqId);
    const updatedStatus = newStatus === 'DISPATCHED' ? 'SANCTIONED' : newStatus;

    setMaterialRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: updatedStatus,
              accountsApprovedBy: activeUser.name,
              accountsApprovalDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              accountsNotes: replyText,
              updatedAt: new Date().toISOString()
            }
          : r
      )
    );

    const targetGroupId = targetReq?.workId || projectGroups[0]?.id || '';
    if (targetGroupId) {
      const accountsMsg: ProjectGroupMessage = {
        id: `msg_acc_${Date.now()}`,
        groupId: targetGroupId,
        senderId: activeUser.id,
        senderName: `${activeUser.name} (Accounts)`,
        senderRole: 'ACCOUNTS',
        type: 'ACCOUNTS_UPDATE',
        text: `💳 ACCOUNTS BUCKET UPDATE for [${targetReq?.itemName || 'Material Requisition'}]: ${replyText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setProjectGroupMessages((prev) => [...prev, accountsMsg]);

      setProjectGroups((prev) =>
        prev.map((g) =>
          g.id === targetGroupId ? { ...g, lastActivity: 'Accounts updated requisition' } : g
        )
      );
    }

    addNotification(
      'Accounts Reply Dispatched',
      `Posted update to project group for ${targetReq?.itemName || 'Material'}`,
      'MATERIAL_REQUISITION'
    );
  };

  // Stock Ledger Handlers
  const handleUpdateStock = (updatedItem: MaterialStockItem) => {
    setStocksItems((prev) => prev.map((s) => s.id === updatedItem.id ? updatedItem : s));
  };

  const handleAddStockItem = (newItem: MaterialStockItem) => {
    setStocksItems((prev) => [newItem, ...prev]);
    addNotification('Stock Item Added', `Added ${newItem.name} to warehouse inventory`, 'MATERIAL_REQUISITION');
  };

  const handleDeductStock = (itemId: string, quantity: number, projectName: string) => {
    addNotification('Stock Deducted', `Deducted ${quantity} units for ${projectName}`, 'MATERIAL_REQUISITION');
  };

  // Billing Invoice Handlers
  const handleUpdateInvoice = (updatedInvoice: BillingInvoice) => {
    setBillingInvoices((prev) => prev.map((i) => i.id === updatedInvoice.id ? updatedInvoice : i));
  };

  const handleAddInvoice = (newInvoice: BillingInvoice) => {
    setBillingInvoices((prev) => [newInvoice, ...prev]);
    addNotification('Invoice Generated', `Created ${newInvoice.invoiceNumber} for ${newInvoice.clientCompanyName}`, 'QUOTE');
  };

  const activeUser = users.find((u) => u.id === activeUserId) || users[0];

  // Enforce Executive Dashboard and role-specific tab restrictions
  useEffect(() => {
    if (activeTab === 'DASHBOARD' && activeUser.role !== 'ADMIN' && activeUser.role !== 'SUB_ADMIN') {
      if (activeUser.role === 'DESIGNER') setActiveTab('DESIGN_PORTAL');
      else if (activeUser.role === 'PROJECT_COORDINATOR') setActiveTab('SUPERVISOR_DESK');
      else if (activeUser.role === 'SITE_SUPERVISOR') setActiveTab('SITE_SUPERVISOR_PORTAL');
      else if (activeUser.role === 'CRM_EMPLOYEE') setActiveTab('CRM_WORKFLOW');
      else if (activeUser.role === 'PROJECT_MANAGER') setActiveTab('PROJECT_MANAGER_OTP');
      else if (activeUser.role === 'HR') setActiveTab('HR_ATTENDANCE');
      else if (activeUser.role === 'ACCOUNTS') setActiveTab('ACCOUNTS_REIMBURSEMENT');
      else if (activeUser.role === 'PURCHASE' || activeUser.role === 'VENDOR_MANAGER') setActiveTab('PURCHASE_DESK');
      else setActiveTab('MY_ATTENDANCE');
    }
    if ((activeTab === 'DESIGN_REQUESTS' || activeTab === 'DESIGN_PORTAL' || activeTab === 'SITE_VISIT') && (activeUser.role === 'PURCHASE' || activeUser.role === 'VENDOR_MANAGER' || activeUser.role === 'HR' || (activeTab === 'SITE_VISIT' && activeUser.role === 'FACTORY_STAFF'))) {
      if (activeUser.role === 'PURCHASE' || activeUser.role === 'VENDOR_MANAGER') {
        setActiveTab('PURCHASE_DESK');
      } else {
        setActiveTab('HOME');
      }
    }
  }, [activeUser.role, activeTab]);

  // Role filtered user lists
  const crmUsers = users.filter((u) => u.role === 'CRM_EMPLOYEE');
  const designers = users.filter((u) => u.role === 'DESIGNER' || u.role === 'SR_DESIGNER' || u.role === 'SENIOR_DESIGNER' || u.role.toLowerCase().includes('designer'));
  const supervisors = users.filter((u) => u.role === 'PROJECT_COORDINATOR');
  const siteSupervisors = users.filter((u) => u.role === 'SITE_SUPERVISOR');

  // Handle switching persona account
  const handleSelectUser = (selectedUser: UserAccount) => {
    setActiveUserId(selectedUser.id);
    const updatedSession = {
      isLoggedIn: true,
      userId: selectedUser.id,
      userEmail: selectedUser.email,
      role: selectedUser.role,
      loginTimestamp: Date.now()
    };
    Storage.saveAuthSession(updatedSession);
    setAuthSession(updatedSession);

    // Retrieve last active tab for this user, OR default to 'HOME'
    const savedTab = lastActiveTabs[selectedUser.id] as NavTab;
    if (savedTab) {
      setActiveTab(savedTab);
    } else {
      if (selectedUser.role === 'ADMIN' || selectedUser.role === 'SUB_ADMIN') {
        setActiveTab('HOME');
      } else {
        setActiveTab('HOME');
      }
    }
  };

  const handleAddClient = (newClient: ClientCompany) => {
    setClients((prev) => [newClient, ...prev]);
    addNotification(
      'New Client Added', 
      `${newClient.companyName} was added to the database.`, 
      'WORK',
      'CLIENTS',
      'ADMIN_ONLY'
    );
  };

  const handleCreateNewWork = (newWork: WorkAssignment) => {
    setWorks((prev) => [newWork, ...prev]);

    setClients((prev) =>
      prev.map((c) =>
        c.id === newWork.clientId
          ? { ...c, totalWorksCount: (c.totalWorksCount || 0) + 1 }
          : c
      )
    );

    // If the active user assigning the task is ADMIN or SUB_ADMIN, let's also create a Lead entry so it displays in Lead Management Desk
    if (activeUser && (activeUser.role === 'ADMIN' || activeUser.role === 'SUB_ADMIN')) {
      const associatedClient = clients.find((c) => c.id === newWork.clientId);
      const newLead: Lead = {
        id: `lead_assigned_${Date.now()}`,
        title: newWork.workTitle,
        companyName: newWork.clientCompanyName || associatedClient?.companyName || 'Unknown Client',
        contactPerson: associatedClient?.contactPerson || 'Assigned Client',
        phone: associatedClient?.phone || '-',
        email: associatedClient?.email || '-',
        estimatedBudget: 0,
        requirements: `Directly assigned work request: ${newWork.workTitle}`,
        submittedByCrmId: newWork.assignedCrmId,
        submittedByCrmName: newWork.assignedCrmName,
        status: 'APPROVED',
        assignedByAdminId: activeUser.id,
        assignedByAdminName: activeUser.name,
        assignedByAdminRole: activeUser.role,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setLeads((prev) => [newLead, ...prev]);
    }

    addNotification(
      'New Work Request Created', 
      `Assigned "${newWork.workTitle}" to ${newWork.assignedCrmName}.`, 
      'WORK',
      'CRM_WORKFLOW',
      'CRM_EMPLOYEE'
    );
  };

  const handleUpdateWork = (updatedWork: WorkAssignment) => {
    setWorks((prev) =>
      prev.map((w) => (w.id === updatedWork.id ? updatedWork : w))
    );

    if (updatedWork.supervisorOtpCode && !currentWorkHasOtp(updatedWork.id)) {
      addNotification(
        'Order Confirmed & OTP Active', 
        `OTP Code for ${updatedWork.brandName} is ${updatedWork.supervisorOtpCode}`, 
        'OTP',
        'SITE_OTP_DISPATCH',
        'SITE_SUPERVISOR'
      );
    }
  };

  const currentWorkHasOtp = (workId: string) => {
    const existing = works.find((w) => w.id === workId);
    return !!existing?.supervisorOtpCode;
  };

  const handleSubmitLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
    addNotification(
      'New Lead Submitted', 
      `${newLead.submittedByCrmName} submitted a lead for ${newLead.companyName}.`, 
      'LEAD',
      'LEADS',
      'CRM_EMPLOYEE'
    );
  };

  const handleApproveLead = (leadId: string, assignedCrmId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const assignedCrmObj = users.find((u) => u.id === assignedCrmId) || crmUsers[0];

    let clientObj = clients.find(
      (c) => c.companyName.toLowerCase() === lead.companyName.toLowerCase()
    );

    if (!clientObj) {
      clientObj = {
        id: `client_${Date.now()}`,
        companyName: lead.companyName,
        contactPerson: lead.contactPerson,
        email: lead.email,
        phone: lead.phone,
        address: lead.clientAddress || 'Corporate Location, Delhi',
        gstNumber: lead.gstNumber || '07AAAAA0000A1Z5',
        industry: 'Commercial Client',
        createdAt: new Date().toISOString().split('T')[0],
        totalWorksCount: 1
      };
      setClients((prev) => [clientObj!, ...prev]);
    }

    const newWorkObj: WorkAssignment = {
      id: `work_${Date.now()}`,
      workTitle: lead.title,
      clientId: clientObj.id,
      clientCompanyName: clientObj.companyName,
      brandName: lead.companyName,
      assignedCrmId: assignedCrmObj.id,
      assignedCrmName: assignedCrmObj.name,
      assignedPersonName: lead.contactPerson || clientObj.contactPerson,
      siteLocationAddress: lead.clientAddress || clientObj.address,
      clientAddress: lead.clientAddress || clientObj.address,
      clientPhone: lead.phone || clientObj.phone,
      clientEmail: lead.email || clientObj.email,
      clientGst: lead.gstNumber || clientObj.gstNumber,
      currentStep: 'STEP_A_VISIT_REPORT',
      crmCompleted: false,
      visitReport: lead.attachmentDocName ? {
        visitDate: lead.createdAt,
        notes: lead.requirements,
        images: lead.attachmentDocType === 'IMAGE' && lead.attachmentDocUrl ? [lead.attachmentDocUrl] : [],
        attachments: [{
          name: lead.attachmentDocName,
          url: lead.attachmentDocUrl,
          type: lead.attachmentDocType || 'DOCUMENT'
        }],
        submittedAt: new Date().toISOString()
      } : {
        visitDate: lead.createdAt,
        notes: lead.requirements,
        images: [],
        attachments: [],
        submittedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setWorks((prev) => [newWorkObj, ...prev]);

    // Automatically create dedicated WhatsApp Project Group for this approved lead
    const adminUser = users.find((u) => u.role === 'ADMIN') || {
      id: 'user_admin',
      name: 'Shailesh Pandey',
      role: 'ADMIN' as UserRole,
      designation: 'Founder / MD'
    };
    const subAdminUser = users.find((u) => u.role === 'SUB_ADMIN') || {
      id: 'user_sub_admin',
      name: 'Dolly Dubey',
      role: 'SUB_ADMIN' as UserRole,
      designation: 'Operations & Management Head'
    };

    const nowIso = new Date().toISOString();
    const newGroupId = `group_${newWorkObj.id}`;
    const newProjectGroup: ProjectGroup = {
      id: newGroupId,
      projectName: `${lead.companyName} - ${lead.title}`,
      clientCompanyName: clientObj.companyName,
      clientId: clientObj.id,
      brandName: lead.companyName,
      assignedCrmId: assignedCrmObj.id,
      assignedCrmName: assignedCrmObj.name,
      createdByUserId: assignedCrmObj.id,
      createdByName: assignedCrmObj.name,
      createdByRole: assignedCrmObj.role,
      status: 'ONGOING',
      oneDriveSyncedFolder: `OneDrive/KDPL_Projects/${lead.companyName.replace(/\s+/g, '_')}/`,
      createdAt: nowIso.split('T')[0],
      lastActivity: 'Just created',
      members: [
        { userId: assignedCrmObj.id, name: assignedCrmObj.name, role: assignedCrmObj.role, designation: assignedCrmObj.designation, joinedAt: nowIso }
      ],
      reminders: []
    };

    setProjectGroups((prev) => [newProjectGroup, ...prev]);

    const initialGroupMsg: ProjectGroupMessage = {
      id: `msg_init_${Date.now()}`,
      groupId: newGroupId,
      senderId: assignedCrmObj.id,
      senderName: assignedCrmObj.name,
      senderRole: assignedCrmObj.role,
      type: 'SYSTEM',
      text: `🚀 Project Group created for lead "${lead.title}" (${lead.companyName}). CRM Lead: ${assignedCrmObj.name}. Admin & Sub-Admin added by default. OneDrive cloud backup initialized.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: nowIso
    };
    setProjectGroupMessages((prev) => [...prev, initialGroupMsg]);

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { 
        ...l, 
        status: 'APPROVED',
        assignedByAdminId: activeUser.id,
        assignedByAdminName: activeUser.name,
        assignedByAdminRole: activeUser.role,
        submittedByCrmId: assignedCrmObj.id,
        submittedByCrmName: assignedCrmObj.name
      } : l))
    );

    addNotification(
      'Lead Approved & Chat Room Created', 
      `Lead for ${lead.companyName} converted to active project group for ${assignedCrmObj.name}.`, 
      'LEAD',
      'PROJECT_GROUP_WORKSPACE',
      'CRM_EMPLOYEE'
    );
  };

  const handleRejectLead = (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: 'REJECTED' } : l))
    );
  };

  const handleAddUser = (newUser: UserAccount) => {
    setUsers((prev) => [...prev, newUser]);
    addNotification(
      'New Account Created', 
      `Created account for ${newUser.name} as ${newUser.role}.`, 
      'WORK',
      'USER_MANAGEMENT',
      'ADMIN_ONLY'
    );
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    addNotification(
      'Staff Profile Updated', 
      `Updated account information for ${updatedUser.name}.`, 
      'WORK',
      'USER_MANAGEMENT',
      'ADMIN_ONLY'
    );
  };

  const handleToggleUserActive = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
    );
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addNotification(
      'Staff Account Deleted', 
      'The staff account was removed from the employee directory.', 
      'WORK',
      'USER_MANAGEMENT',
      'ADMIN_ONLY'
    );
  };

  const handleUpdateClient = (updatedClient: ClientCompany) => {
    setClients((prev) => prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
    addNotification(
      'Client Updated', 
      `Updated company profile for ${updatedClient.companyName}.`, 
      'WORK',
      'CLIENTS',
      'ADMIN_ONLY'
    );
  };

  const handleDeleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    setWorks((prev) => prev.filter((w) => w.clientId !== clientId));
    addNotification(
      'Client Record Deleted', 
      'Client profile and records were deleted.', 
      'WORK',
      'CLIENTS',
      'ADMIN_ONLY'
    );
  };

  const handleDeleteWork = (workId: string) => {
    setWorks((prev) => prev.filter((w) => w.id !== workId));
    addNotification(
      'Work Order Deleted', 
      'The work assignment was removed from system records.', 
      'WORK',
      'CRM_WORKFLOW',
      'ADMIN_ONLY'
    );
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    addNotification(
      'Lead Updated', 
      `Updated lead details for ${updatedLead.companyName}.`, 
      'LEAD',
      'LEADS',
      'CRM_EMPLOYEE'
    );
  };

  const handleDeleteLead = (leadId: string) => {
    const leadToDelete = leads.find((l) => l.id === leadId);
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    
    if (leadToDelete) {
      setWorks((prev) => prev.filter((w) => 
        !(w.clientCompanyName.toLowerCase() === leadToDelete.companyName.toLowerCase() && 
          w.workTitle.toLowerCase() === leadToDelete.title.toLowerCase())
      ));
    }

    addNotification(
      'Lead Deleted', 
      'Lead entry removed from CRM database.', 
      'LEAD',
      'LEADS',
      'CRM_EMPLOYEE'
    );
  };

  const handleAddService = (newService: ServiceAssignment) => {
    setServices((prev) => [newService, ...prev]);
    addNotification(
      'Service Trade Assigned', 
      `Assigned service "${newService.serviceName}" to ${newService.assignedPersonName}.`, 
      'WORK',
      'SERVICE_CATALOG',
      'ALL'
    );
  };

  const handleDeleteService = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    addNotification(
      'Service Assignment Removed', 
      'Deleted service assignment from roster.', 
      'WORK',
      'SERVICE_CATALOG',
      'ALL'
    );
  };

  const handleUpdateServiceStatus = (serviceId: string, status: ServiceAssignment['status']) => {
    setServices((prev) => prev.map((s) => (s.id === serviceId ? { ...s, status } : s)));
  };

  const handleUpdateService = (updatedService: ServiceAssignment) => {
    setServices((prev) => prev.map((s) => (s.id === updatedService.id ? updatedService : s)));
    addNotification(
      'Service Assignment Updated', 
      `Updated details for service "${updatedService.serviceName}".`, 
      'WORK',
      'SERVICE_CATALOG',
      'ALL'
    );
  };

  // Reimbursement Handlers
  const handleSubmitReimbursement = (newClaim: ReimbursementClaim) => {
    setReimbursements((prev) => [newClaim, ...prev]);
    // Notification for Accounts/Admin
    addNotification(
      'New Reimbursement Claim Filed',
      `${newClaim.applicantName} filed claim ${newClaim.claimNumber} of ₹${newClaim.amount.toLocaleString('en-IN')}`,
      'REIMBURSEMENT',
      'ACCOUNTS_REIMBURSEMENT',
      'ACCOUNTS'
    );
    // Notification for the Applicant
    addNotification(
      'Expense Claim Filed',
      `Your claim ${newClaim.claimNumber} of ₹${newClaim.amount.toLocaleString('en-IN')} has been submitted for Accounts verification.`,
      'REIMBURSEMENT',
      'MY_REIMBURSEMENTS',
      undefined,
      newClaim.applicantId
    );
  };

  const handleAccountsApproveClaim = (claimId: string, notes?: string) => {
    const claim = reimbursements.find((c) => c.id === claimId);
    setReimbursements((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: 'APPROVED_BY_ACCOUNTS',
              accountsApprovedBy: activeUser.name,
              accountsApprovalDate: new Date().toISOString().split('T')[0],
              accountsNotes: notes || 'Verified by Accounts Department'
            }
          : c
      )
    );
    // For Admin
    addNotification(
      'Reimbursement Level 1 Approved', 
      `Accounts verified claim ${claim?.claimNumber || ''}. Pending Admin final sanction.`, 
      'REIMBURSEMENT',
      'ACCOUNTS_REIMBURSEMENT',
      'ADMIN_ONLY'
    );
    // For Applicant
    if (claim) {
      addNotification(
        'Claim Verified by Accounts',
        `Your claim ${claim.claimNumber} was verified by Accounts. Pending Admin final sanction.`,
        'REIMBURSEMENT',
        'MY_REIMBURSEMENTS',
        undefined,
        claim.applicantId
      );
    }
  };

  const handleAdminApproveClaim = (claimId: string, notes?: string) => {
    const claim = reimbursements.find((c) => c.id === claimId);
    setReimbursements((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: 'APPROVED_BY_ADMIN',
              adminApprovedBy: activeUser.name,
              adminApprovalDate: new Date().toISOString().split('T')[0],
              adminNotes: notes || 'Approved for payment disbursement'
            }
          : c
      )
    );
    // For Accounts
    addNotification(
      'Reimbursement Level 2 Sanctioned', 
      `Admin sanctioned claim ${claim?.claimNumber || ''} for payout. Ready for payment clearance.`, 
      'REIMBURSEMENT',
      'ACCOUNTS_REIMBURSEMENT',
      'ACCOUNTS'
    );
    // For Applicant
    if (claim) {
      addNotification(
        'Claim Sanctioned by Admin',
        `Your claim ${claim.claimNumber} was sanctioned by Admin. Ready for payout clearance.`,
        'REIMBURSEMENT',
        'MY_REIMBURSEMENTS',
        undefined,
        claim.applicantId
      );
    }
  };

  const handleRejectClaim = (claimId: string, reason: string) => {
    const claim = reimbursements.find((c) => c.id === claimId);
    setReimbursements((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: 'REJECTED',
              rejectionReason: reason,
              rejectedByRole: activeUser.role
            }
          : c
      )
    );
    if (claim) {
      addNotification(
        'Reimbursement Claim Rejected', 
        `Your claim ${claim.claimNumber} was rejected by ${activeUser.name}. Reason: ${reason}`, 
        'REIMBURSEMENT',
        'MY_REIMBURSEMENTS',
        undefined,
        claim.applicantId
      );
    }
  };

  const handleDisbursePayment = (
    claimId: string,
    paymentMode: 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'COMPANY_CARD',
    refNo: string,
    screenshotUrl: string
  ) => {
    const claim = reimbursements.find((c) => c.id === claimId);
    setReimbursements((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: 'PAID',
              paymentMode,
              paymentRefNo: refNo,
              paymentScreenshotUrl: screenshotUrl,
              paymentDate: new Date().toISOString().split('T')[0],
              disbursedByName: activeUser.name
            }
          : c
      )
    );
    if (claim) {
      addNotification(
        'Reimbursement Payment Cleared', 
        `Payment of claim ${claim.claimNumber} was cleared via ${paymentMode}. Proof screenshot attached.`, 
        'REIMBURSEMENT',
        'MY_REIMBURSEMENTS',
        undefined,
        claim.applicantId
      );
    }
  };

  // Attendance Handlers
  const handleAddAttendance = (newRecord: AttendanceRecord) => {
    setAttendanceRecords((prev) => [newRecord, ...prev]);
    // For HR
    addNotification(
      'Attendance Recorded', 
      `Logged attendance for ${newRecord.employeeName} (${newRecord.status}) at ${newRecord.punchInTime}`, 
      'SITE_PUNCH',
      'HR_ATTENDANCE',
      'HR'
    );
    // For Employee
    addNotification(
      'Punch In Successful',
      `Your Punch In at ${newRecord.punchInTime} was recorded with GPS photo verification.`,
      'SITE_PUNCH',
      'MY_ATTENDANCE',
      undefined,
      newRecord.employeeId
    );
  };

  const handlePunchOutAttendance = (
    id: string, 
    punchOutTime: string, 
    locationAddress?: string, 
    notes?: string,
    punchOutPhotoUrl?: string
  ) => {
    const rec = attendanceRecords.find((a) => a.id === id);
    setAttendanceRecords((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updatedNotes = notes ? (a.notes ? `${a.notes} | Out Note: ${notes}` : `Out Note: ${notes}`) : a.notes;
          return { 
            ...a, 
            punchOutTime, 
            punchOutLocationAddress: locationAddress || a.locationAddress,
            notes: updatedNotes,
            punchOutPhotoUrl: punchOutPhotoUrl || a.punchOutPhotoUrl
          };
        }
        return a;
      })
    );
    // For HR
    addNotification(
      'Punch-Out Recorded with Photo', 
      `Punch-out logged for ${rec?.employeeName || 'staff'} at ${punchOutTime} with photo verification`, 
      'SITE_PUNCH',
      'HR_ATTENDANCE',
      'HR'
    );
    // For Employee
    if (rec) {
      addNotification(
        'Punch Out Successful',
        `Your Punch Out at ${punchOutTime} was recorded. Have a great evening!`,
        'SITE_PUNCH',
        'MY_ATTENDANCE',
        undefined,
        rec.employeeId
      );
    }
  };

  const handleUpdateAttendanceStatus = (id: string, status: AttendanceRecord['status'], notes?: string) => {
    setAttendanceRecords((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, notes: notes || a.notes } : a))
    );
  };

  // Material Requisition Handlers
  const handleCreateMaterialRequest = (newReq: MaterialRequest) => {
    setMaterialRequests((prev) => [newReq, ...prev]);
    // Notify Accounts
    addNotification(
      'New Material Requisition Filed',
      `${newReq.requestedByName} requested ${newReq.itemName} (${newReq.quantity}) for ${newReq.siteOrProjectName} — Est: ₹${newReq.estimatedCost.toLocaleString('en-IN')}`,
      'MATERIAL_REQUISITION',
      'ACCOUNTS_MATERIAL_REQUISITION',
      'ACCOUNTS'
    );
    // Notify Requester
    addNotification(
      'Material Requisition Submitted',
      `Requisition ${newReq.requestNumber} for ${newReq.itemName} submitted to Accounts for sanction.`,
      'MATERIAL_REQUISITION',
      'ACCOUNTS_MATERIAL_REQUISITION',
      undefined,
      newReq.requestedByUserId
    );
  };

  const handleAccountsApproveMaterialRequest = (reqId: string, notes?: string) => {
    const req = materialRequests.find((r) => r.id === reqId);
    setMaterialRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: 'SANCTIONED',
              accountsApprovedBy: activeUser.name,
              accountsApprovalDate: new Date().toISOString().split('T')[0],
              accountsNotes: notes || 'Sanctioned by Accounts'
            }
          : r
      )
    );

    if (req) {
      addNotification(
        'Material Budget Sanctioned',
        `Requisition ${req.requestNumber} (${req.itemName}) has been sanctioned by Accounts (${activeUser.name}).`,
        'MATERIAL_REQUISITION',
        'ACCOUNTS_MATERIAL_REQUISITION',
        undefined,
        req.requestedByUserId
      );
    }
  };

  const handleDisburseMaterialRequest = (
    reqId: string,
    paymentMode: 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'COMPANY_CARD',
    refNo: string,
    disbursedAmount: number
  ) => {
    const req = materialRequests.find((r) => r.id === reqId);
    setMaterialRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: 'PAID',
              paymentMode,
              paymentRefNo: refNo,
              disbursedAmount,
              paymentDate: new Date().toISOString().split('T')[0],
              disbursedByName: activeUser.name
            }
          : r
      )
    );

    if (req) {
      addNotification(
        'Material Purchase Funds Disbursed',
        `Payment of ₹${disbursedAmount.toLocaleString('en-IN')} for ${req.requestNumber} (${req.itemName}) released via ${paymentMode} (${refNo}).`,
        'MATERIAL_REQUISITION',
        'ACCOUNTS_MATERIAL_REQUISITION',
        undefined,
        req.requestedByUserId
      );
    }
  };

  const handleRejectMaterialRequest = (reqId: string, reason: string) => {
    const req = materialRequests.find((r) => r.id === reqId);
    setMaterialRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: 'REJECTED',
              rejectionReason: reason
            }
          : r
      )
    );

    if (req) {
      addNotification(
        'Material Requisition Rejected',
        `Requisition ${req.requestNumber} was rejected by ${activeUser.name}. Reason: ${reason}`,
        'MATERIAL_REQUISITION',
        'ACCOUNTS_MATERIAL_REQUISITION',
        undefined,
        req.requestedByUserId
      );
    }
  };

  const isNotifForUser = (n: SystemNotification, user: UserAccount) => {
    if (n.targetUserId) return n.targetUserId === user.id;
    if (user.role === 'ADMIN' || user.role === 'SUB_ADMIN') return true;
    if (n.targetRole === 'ADMIN_ONLY') return false;
    if (n.targetRole === 'ALL') return true;
    if (n.targetRole) return n.targetRole === user.role;

    if (n.type === 'LEAD' || n.type === 'QUOTE') return user.role === 'CRM_EMPLOYEE';
    if (n.type === 'REIMBURSEMENT' || n.type === 'MATERIAL_REQUISITION') return user.role === 'ACCOUNTS';
    if (n.type === 'SITE_PUNCH') return user.role === 'HR';
    if (n.type === 'OTP') return user.role === 'SITE_SUPERVISOR' || user.role === 'PROJECT_COORDINATOR' || user.role === 'PROJECT_MANAGER';
    if (n.type === 'DESIGN') return user.role === 'DESIGNER';
    return false;
  };

  const addNotification = (
    title: string, 
    message: string, 
    type: SystemNotification['type'],
    targetTab?: NavTab,
    targetRole?: UserRole | 'ALL' | 'ADMIN_ONLY',
    targetUserId?: string
  ) => {
    const notif: SystemNotification = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      timestamp: 'Just now',
      read: false,
      type,
      targetTab,
      targetRole,
      targetUserId
    };
    setNotifications((prev) => [notif, ...prev]);

    if (isNotifForUser(notif, activeUser)) {
      setToastNotif(notif);
      setTimeout(() => {
        setToastNotif((cur) => (cur?.id === notif.id ? null : cur));
      }, 6000);
    }
  };

  const handleNotificationClick = (notif: SystemNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );

    if (notif.targetTab) {
      setActiveTab(notif.targetTab as NavTab);
    } else {
      // Direct section redirect fallback based on notification type
      if (notif.type === 'LEAD') setActiveTab('LEADS');
      else if (notif.type === 'QUOTE') setActiveTab('QUOTATION_ENGINE');
      else if (notif.type === 'REIMBURSEMENT') {
        if (activeUser.role === 'ACCOUNTS' || activeUser.role === 'ADMIN') setActiveTab('ACCOUNTS_REIMBURSEMENT');
        else setActiveTab('MY_REIMBURSEMENTS');
      }
      else if (notif.type === 'MATERIAL_REQUISITION') setActiveTab('ACCOUNTS_MATERIAL_REQUISITION');
      else if (notif.type === 'SITE_PUNCH') {
        if (activeUser.role === 'HR' || activeUser.role === 'ADMIN') setActiveTab('HR_ATTENDANCE');
        else setActiveTab('MY_ATTENDANCE');
      }
      else if (notif.type === 'OTP') setActiveTab('SITE_OTP_DISPATCH');
      else if (notif.type === 'WORK') setActiveTab('CRM_WORKFLOW');
      else if (notif.type === 'DESIGN') setActiveTab('DESIGN_DESK');
    }
    setToastNotif(null);
  };

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSelectGlobalExistingClient = (clientId: string) => {
    setGlobalLeadSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setGlobalLeadCompanyName(client.companyName);
      setGlobalLeadContactPerson(client.contactPerson);
      setGlobalLeadPhone(client.phone);
      setGlobalLeadEmail(client.email);
      setGlobalLeadAddress(client.address || '');
      setGlobalLeadGst(client.gstNumber || '');
    }
  };

  const handleGlobalSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalLeadTitle || !globalLeadCompanyName || !globalLeadContactPerson) return;

    const assignedCrm = crmUsers.find((u) => u.id === globalLeadAssignedCrmId) || crmUsers[0];

    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      title: globalLeadTitle,
      companyName: globalLeadCompanyName,
      contactPerson: globalLeadContactPerson,
      phone: globalLeadPhone || '+91 98000 00000',
      email: globalLeadEmail || 'lead@client.com',
      clientAddress: globalLeadAddress || '',
      gstNumber: globalLeadGst || '',
      estimatedBudget: Number(globalLeadBudget) || 100000,
      requirements: globalLeadRequirements || 'Submitted from Admin Control Portal.',
      submittedByCrmId: assignedCrm.id,
      submittedByCrmName: assignedCrm.name,
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString().split('T')[0],
      assignedByAdminId: activeUser.id,
      assignedByAdminName: activeUser.name,
      assignedByAdminRole: activeUser.role,
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
    };

    handleSubmitLead(newLead);
    setShowGlobalSubmitLeadModal(false);

    // Reset fields
    setGlobalLeadTitle('');
    setGlobalLeadCompanyName('');
    setGlobalLeadContactPerson('');
    setGlobalLeadPhone('');
    setGlobalLeadEmail('');
    setGlobalLeadAddress('');
    setGlobalLeadGst('');
    setGlobalLeadBudget(100000);
    setGlobalLeadRequirements('');
    setGlobalLeadClientType('NEW');
    setGlobalLeadSelectedClientId('');
  };

  if (!authSession) {
    return <LoginModal users={users} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-[100dvh] bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white pb-20 md:pb-6">
      {/* Main App Navbar with Profile & Accounts Switcher Dropdown on right */}
      <Header
        activeUser={activeUser}
        companyProfile={companyProfile}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onNotificationClick={handleNotificationClick}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenAttendancePunch={() => setActiveTab('MY_ATTENDANCE')}
        onOpenSiteVisit={() => setActiveTab('SITE_VISIT')}
        onOpenCompanySettings={() => {
          if (activeUser.role === 'ADMIN' || activeUser.role === 'SUB_ADMIN') {
            setShowCompanySettingsModal(true);
          }
        }}
        onLogout={handleLogout}
        isMobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onNavigateHome={() => setActiveTab('HOME')}
        users={users}
        onSelectUser={handleSelectUser}
        onOpenBirthdayModal={() => setIsBirthdayModalOpen(true)}
        todaysBirthdayCount={getTodaysBirthdayEmployees(users).length}
        currentMonthBirthdayCount={getCurrentMonthBirthdayEmployees(users).length}
        currentMonthName={MONTH_NAMES[new Date().getMonth()]}
      />

      {/* Main Full-Width Content Container */}
      <main className="flex-1 p-2.5 sm:p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Universal Back Navigation Bar on all sub-sections */}
        {activeTab !== 'HOME' && (
          <SectionHeaderBar
            activeTab={activeTab}
            onBackToHome={() => setActiveTab('HOME')}
            userRole={activeUser.role}
            onNewLeadClick={() => {
              setGlobalLeadTitle('');
              setGlobalLeadCompanyName('');
              setGlobalLeadContactPerson('');
              setGlobalLeadPhone('');
              setGlobalLeadEmail('');
              setGlobalLeadBudget(100000);
              setGlobalLeadRequirements('');
              setGlobalLeadAssignedCrmId(crmUsers[0]?.id || '');
              setShowGlobalSubmitLeadModal(true);
            }}
          />
        )}

        {activeTab === 'HOME' && (
          <HomeScreen
            activeUser={activeUser}
            allUsers={users}
            attendanceRecords={attendanceRecords}
            festivals={festivals}
            works={works}
            leads={leads}
            reimbursements={reimbursements}
            siteVisits={siteVisits}
            onOpenBirthdayModal={() => setIsBirthdayModalOpen(true)}
            onNavigate={(tab) => {
              if (tab === 'SITE_VISITS') setActiveTab('SITE_VISIT');
              else if (tab === 'EMPLOYEES') setActiveTab('ABOUT_EMPLOYEES');
              else setActiveTab(tab as NavTab);
            }}
            onQuickPunchIn={() => setActiveTab('MY_ATTENDANCE')}
          />
        )}

          {(activeTab === 'SITE_VISIT' || (activeTab as any) === 'SITE_VISITS') && (
            <SiteVisitLog
              activeUser={activeUser}
              allUsers={users}
              siteVisits={siteVisits}
              onAddSiteVisit={handleAddSiteVisit}
              onUpdateSiteVisit={handleUpdateSiteVisit}
              onBackToHome={() => setActiveTab('HOME')}
            />
          )}

          {(activeTab === 'ABOUT_EMPLOYEES' || (activeTab as any) === 'EMPLOYEES') && (
            <AboutEmployees
              users={users}
              activeUser={activeUser}
              employeeDocuments={employeeDocuments}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onAddDocument={handleAddEmployeeDocument}
              onDeleteDocument={handleDeleteEmployeeDocument}
              onBackToHome={() => setActiveTab('HOME')}
            />
          )}

          {activeTab === 'DASHBOARD' && (activeUser.role === 'ADMIN' || activeUser.role === 'SUB_ADMIN') && (
            <AdminDashboard
              works={works}
              clients={clients}
              leads={leads}
              users={users}
              activeUser={activeUser}
              onNavigateTab={setActiveTab}
              onNewWorkClick={() => {
                setGlobalLeadTitle('');
                setGlobalLeadCompanyName('');
                setGlobalLeadContactPerson('');
                setGlobalLeadPhone('');
                setGlobalLeadEmail('');
                setGlobalLeadBudget(100000);
                setGlobalLeadRequirements('');
                setGlobalLeadAssignedCrmId(crmUsers[0]?.id || '');
                setShowGlobalSubmitLeadModal(true);
              }}
            />
          )}

          {activeTab === 'CLIENTS' && (
            <ClientManager
              clients={clients}
              works={works}
              crmUsers={crmUsers}
              activeUser={activeUser}
              onAddClient={handleAddClient}
              onCreateNewWork={handleCreateNewWork}
              onDeleteClient={handleDeleteClient}
              onDeleteWork={handleDeleteWork}
              onUpdateClient={handleUpdateClient}
              onUpdateWork={handleUpdateWork}
            />
          )}

          {activeTab === 'LEADS' && (
            <LeadManager
              leads={leads}
              crmUsers={crmUsers}
              clients={clients}
              activeUser={activeUser}
              onSubmitLead={handleSubmitLead}
              onApproveLead={handleApproveLead}
              onRejectLead={handleRejectLead}
              onDeleteLead={handleDeleteLead}
              onUpdateLead={handleUpdateLead}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onNewWorkClick={() => {
                setGlobalLeadTitle('');
                setGlobalLeadCompanyName('');
                setGlobalLeadContactPerson('');
                setGlobalLeadPhone('');
                setGlobalLeadEmail('');
                setGlobalLeadBudget(100000);
                setGlobalLeadRequirements('');
                setGlobalLeadAssignedCrmId(crmUsers[0]?.id || '');
                setShowGlobalSubmitLeadModal(true);
              }}
            />
          )}

          {activeTab === 'CRM_WORKFLOW' && (
            <CrmWorkflowPipeline
              works={works}
              designers={designers}
              users={users}
              activeUser={activeUser}
              onUpdateWork={handleUpdateWork}
              onDeleteWork={handleDeleteWork}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          )}

          {activeTab === 'SERVICE_CATALOG' && activeUser.role !== 'HR' && (
            <ServiceCatalog
              services={services}
              works={works}
              staffUsers={users}
              activeUser={activeUser}
              onAddService={handleAddService}
              onDeleteService={handleDeleteService}
              onUpdateServiceStatus={handleUpdateServiceStatus}
              onUpdateService={handleUpdateService}
            />
          )}

          {activeTab === 'QUOTATION_ENGINE' && (
            <QuotationBuilder
              companyProfile={companyProfile}
              works={works}
              services={services}
              onSaveQuotation={(quote, targetWorkId) => {
                const workToUpdate = (targetWorkId && works.find(w => w.id === targetWorkId))
                  || works.find(w => w.clientCompanyName === quote.clientCompanyName)
                  || works[0];

                if (workToUpdate) {
                  const updatedWork: WorkAssignment = {
                    ...workToUpdate,
                    quotation: quote,
                    quotationStatus: 'SENT',
                    currentStep: 'STEP_G_QUOTE_STATUS',
                    lastUpdatedByName: activeUser.name,
                    lastUpdatedByRole: activeUser.role,
                    updatedAt: new Date().toISOString().split('T')[0]
                  };
                  handleUpdateWork(updatedWork);
                }

                addNotification('Quotation Generated', `Created Quotation ${quote.quoteNumber} for ${quote.clientCompanyName}`, 'QUOTE');
                setActiveTab('CRM_WORKFLOW');
              }}
            />
          )}

          {activeTab === 'DESIGN_PORTAL' && (
            <DesignerPortal
              works={works}
              activeUser={activeUser}
              onUpdateWork={handleUpdateWork}
              designers={designers}
            />
          )}

          {activeTab === 'DESIGN_REQUESTS' && (
            <DesignRequestGlobalDesk
              works={works}
              onUpdateWork={handleUpdateWork}
              activeUser={activeUser}
              designers={designers}
            />
          )}

          {(activeTab === 'SUPERVISOR_DESK' ||
            activeTab === 'SUPERVISOR_ALLOCATION' ||
            activeTab === 'SUPERVISOR_DOCS' ||
            activeTab === 'SUPERVISOR_AUDIT') && (
            <SupervisorDesk
              works={works}
              siteSupervisors={siteSupervisors}
              activeUser={activeUser}
              onUpdateWork={handleUpdateWork}
              initialStep={
                activeTab === 'SUPERVISOR_ALLOCATION'
                  ? 'STEP_2_DAILY_ALLOCATION'
                  : activeTab === 'SUPERVISOR_DOCS'
                  ? 'STEP_3_APPROVED_DOCS'
                  : activeTab === 'SUPERVISOR_AUDIT'
                  ? 'STEP_4_LIVE_AUDIT'
                  : 'STEP_1_OTP_HANDOVER'
              }
            />
          )}

          {(activeTab === 'SITE_SUPERVISOR_PORTAL' ||
            activeTab === 'SITE_PROGRESS_REQS' ||
            activeTab === 'SITE_EOD_HUB' ||
            activeTab === 'SITE_ONEDRIVE_SYNC' ||
            activeTab === 'SITE_OTP_DISPATCH') && (
            <SiteSupervisorPortal
              works={works}
              activeUser={activeUser}
              onUpdateWork={handleUpdateWork}
              initialTab={
                activeTab === 'SITE_PROGRESS_REQS'
                  ? 'B_SITE_UPDATE'
                  : activeTab === 'SITE_OTP_DISPATCH'
                  ? 'E_OTP_DISPATCH'
                  : activeTab === 'SITE_EOD_HUB'
                  ? 'C_EOD_REPORT'
                  : activeTab === 'SITE_ONEDRIVE_SYNC'
                  ? 'D_WORK_PICTURES'
                  : 'A_PUNCH_IN'
              }
            />
          )}

          {activeTab === 'PROJECT_MANAGER_OTP' && (
            <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm space-y-2">
                <h2 className="text-xl font-extrabold text-white">Project Manager & Daily Site Assignment Desk</h2>
                <p className="text-xs text-slate-300">
                  Assign daily sites and work to site supervisors, generate shift verification OTPs, and manage site access requests.
                </p>
              </div>
              <ProjectManagerWorkspace works={works} users={users} onUpdateWork={handleUpdateWork} activeUser={activeUser} />
            </div>
          )}

          {activeTab === 'STAFF_RECE_WORKSPACE' && (
            <StaffReceSection
              works={works}
              clients={clients}
              activeUser={activeUser}
              onUpdateWork={handleUpdateWork}
            />
          )}

          {activeTab === 'USER_MANAGEMENT' && (
            <UserManagement
              users={users}
              works={works}
              leads={leads}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onToggleUserActive={handleToggleUserActive}
              onDeleteUser={handleDeleteUser}
              onSelectUser={handleSelectUser}
              onBackToHome={() => setActiveTab('HOME')}
            />
          )}

          {activeTab === 'HR_ATTENDANCE' && (
            <HRAttendanceDesk
              attendanceRecords={attendanceRecords}
              users={users}
              festivals={festivals}
              siteVisits={siteVisits}
              activeUser={activeUser}
              onAddAttendance={handleAddAttendance}
              onUpdateAttendanceStatus={handleUpdateAttendanceStatus}
              onAddFestival={handleAddFestival}
              onUpdateFestival={handleUpdateFestival}
              onDeleteFestival={handleDeleteFestival}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onBackToHome={() => setActiveTab('HOME')}
            />
          )}

          {activeTab === 'ACCOUNTS_REIMBURSEMENT' && (
            <AccountsReimbursementDesk
              claims={reimbursements}
              activeUser={activeUser}
              onAccountsApprove={handleAccountsApproveClaim}
              onAdminApprove={handleAdminApproveClaim}
              onRejectClaim={handleRejectClaim}
              onDisbursePayment={handleDisbursePayment}
            />
          )}

          {(activeTab === 'ACCOUNTS_MATERIAL_REQUISITION' || activeTab === 'SITE_SUPERVISOR_MATERIAL_REQ') && (
            <MaterialRequisitionDesk
              materialRequests={materialRequests}
              activeUser={activeUser}
              works={works}
              isSiteSupervisorView={activeTab === 'SITE_SUPERVISOR_MATERIAL_REQ'}
              onCreateRequest={handleCreateMaterialRequest}
              onApproveRequest={handleAccountsApproveMaterialRequest}
              onDisburseRequest={handleDisburseMaterialRequest}
              onRejectRequest={handleRejectMaterialRequest}
            />
          )}

          {(activeTab === 'PURCHASE_DESK' || (activeTab === 'VENDOR_DIRECTORY' && activeUser.role !== 'PROJECT_MANAGER')) && (
            <PurchaseDesk
              currentUser={activeUser}
              users={users}
              companyProfile={companyProfile}
              initialTab={activeTab === 'VENDOR_DIRECTORY' ? 'VENDORS' : 'REQUIREMENTS'}
              onSendNotification={(title, message, targetRole) => {
                addNotification(title, message, 'MATERIAL_REQUISITION', activeTab, targetRole);
              }}
            />
          )}

          {activeTab === 'MY_REIMBURSEMENTS' && (
            <ReimbursementClaimView
              claims={reimbursements}
              activeUser={activeUser}
              activeWorks={works}
              onSubmitClaim={handleSubmitReimbursement}
            />
          )}

          {activeTab === 'PROJECT_GROUP_WORKSPACE' && (
            <ProjectGroupChatWorkspace
              groups={projectGroups}
              messages={projectGroupMessages}
              users={users}
              activeUser={activeUser}
              onUpdateGroup={handleUpdateGroup}
              onAddGroup={handleAddGroup}
              onSendMessage={handleSendMessage}
              onUpdateMessage={handleUpdateMessage}
              onCreateMaterialRequest={(req) => {
                const fullReq: MaterialRequest = {
                  id: req.id || `mat_req_${Date.now()}`,
                  requestNumber: req.requestNumber || `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
                  requestedByUserId: activeUser.id,
                  requestedByName: activeUser.name,
                  requestedByRole: activeUser.role,
                  siteOrProjectName: req.siteOrProjectName || 'Project Site',
                  workId: req.workId,
                  category: req.category || 'RAW_MATERIALS',
                  itemName: req.itemName || 'Materials',
                  quantity: req.quantity || '10 Units',
                  estimatedCost: req.estimatedCost || 25000,
                  urgency: req.urgency || 'HIGH',
                  requiredByDate: req.requiredByDate || new Date().toISOString().split('T')[0],
                  notes: req.notes || '',
                  status: 'PENDING_ACCOUNTS',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                handleCreateMaterialRequest(fullReq);
              }}
            />
          )}

          {activeTab === 'STRUCTURE_DESIGNER_WORKSPACE' && (
            <StructureDesignerWorkspace
              works={works}
              activeUser={activeUser}
              onUpdateWork={handleUpdateWork}
              groups={projectGroups}
              messages={projectGroupMessages}
              onSendMessage={handleSendMessage}
              onUpdateMessage={handleUpdateMessage}
            />
          )}

          {activeTab === 'PURCHASE_BUCKET' && (
            <PurchaseBucketDesk
              materialRequests={materialRequests}
              activeUser={activeUser}
              works={works}
              onReplyToProjectGroup={handleAccountsReplyToGroup}
              onNavigateToGroup={(workId) => {
                setActiveTab('PROJECT_GROUP_WORKSPACE');
              }}
            />
          )}

          {activeTab === 'BILLING_DESK' && (
            <BillingDesk
              invoices={billingInvoices}
              activeUser={activeUser}
              works={works}
              onUpdateInvoice={handleUpdateInvoice}
              onAddInvoice={handleAddInvoice}
            />
          )}

          {activeTab === 'STOCKS_INVENTORY' && (
            <StocksInventoryDesk
              stocks={stocksItems}
              activeUser={activeUser}
              onUpdateStock={handleUpdateStock}
              onAddStockItem={handleAddStockItem}
              onDeductStock={handleDeductStock}
            />
          )}

          {activeTab === 'MY_ATTENDANCE' && (
            <MyAttendancePunch
              activeUser={activeUser}
              attendanceRecords={attendanceRecords}
              onAddAttendance={handleAddAttendance}
              onPunchOutAttendance={handlePunchOutAttendance}
              onBackToHome={() => setActiveTab('HOME')}
            />
          )}
        </main>

      {/* Global Submit New Lead Modal */}
      {showGlobalSubmitLeadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" /> Submit New Lead for Admin Approval
              </h3>
              <button onClick={() => setShowGlobalSubmitLeadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGlobalSubmitLead} className="space-y-3 text-xs">
              {/* Client Type Selector Toggle */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-800">Client Category *</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setGlobalLeadClientType('NEW');
                      setGlobalLeadSelectedClientId('');
                      setGlobalLeadCompanyName('');
                      setGlobalLeadContactPerson('');
                      setGlobalLeadPhone('');
                      setGlobalLeadEmail('');
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      globalLeadClientType === 'NEW'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ✨ New Client
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGlobalLeadClientType('OLD');
                      if (clients.length > 0) {
                        handleSelectGlobalExistingClient(clients[0].id);
                      }
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      globalLeadClientType === 'OLD'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🏢 Existing / Old Client
                  </button>
                </div>
              </div>

              {/* If Old Client selected -> Show Database Dropdown */}
              {globalLeadClientType === 'OLD' && (
                <div className="space-y-1.5 bg-blue-50/80 p-3 rounded-xl border border-blue-200">
                  <label className="block font-bold text-blue-900">
                    Select Existing Client from Database ({clients.length} Registered) *
                  </label>
                  <select
                    value={globalLeadSelectedClientId}
                    onChange={(e) => handleSelectGlobalExistingClient(e.target.value)}
                    className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="" disabled>-- Select Client from Database --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.contactPerson} - {c.phone})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lead / Requirement Title *</label>
                <input
                  type="text"
                  required
                  value={globalLeadTitle}
                  onChange={(e) => setGlobalLeadTitle(e.target.value)}
                  placeholder="e.g. Sales Experience Centre Interior & Outdoor Hoarding"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Brand Name *</label>
                  <input
                    type="text"
                    required
                    disabled={globalLeadClientType === 'OLD'}
                    value={globalLeadCompanyName}
                    onChange={(e) => setGlobalLeadCompanyName(e.target.value)}
                    placeholder="e.g. Oberoi Realty"
                    className="w-full p-2.5 border border-slate-300 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    disabled={globalLeadClientType === 'OLD'}
                    value={globalLeadContactPerson}
                    onChange={(e) => setGlobalLeadContactPerson(e.target.value)}
                    placeholder="e.g. Mr. Manoj Mukherjee"
                    className="w-full p-2.5 border border-slate-300 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    disabled={globalLeadClientType === 'OLD'}
                    value={globalLeadPhone}
                    onChange={(e) => setGlobalLeadPhone(e.target.value)}
                    placeholder="+91 99112 00000"
                    className="w-full p-2.5 border border-slate-300 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled={globalLeadClientType === 'OLD'}
                    value={globalLeadEmail}
                    onChange={(e) => setGlobalLeadEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full p-2.5 border border-slate-300 rounded-xl disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Address / Site Location *</label>
                <input
                  type="text"
                  required
                  disabled={globalLeadClientType === 'OLD'}
                  value={globalLeadAddress}
                  onChange={(e) => setGlobalLeadAddress(e.target.value)}
                  placeholder="Plot No. 42, Corporate Park, Sector 18, Gurgaon"
                  className="w-full p-2.5 border border-slate-300 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    disabled={globalLeadClientType === 'OLD'}
                    value={globalLeadGst}
                    onChange={(e) => setGlobalLeadGst(e.target.value)}
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    className="w-full p-2.5 border border-slate-300 rounded-xl disabled:bg-slate-100 disabled:text-slate-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    value={globalLeadBudget}
                    onChange={(e) => setGlobalLeadBudget(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-blue-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign to CRM Employee *</label>
                <select
                  value={globalLeadAssignedCrmId}
                  onChange={(e) => setGlobalLeadAssignedCrmId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-semibold text-slate-800"
                >
                  {crmUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Requirements & Technical Details</label>
                <textarea
                  rows={3}
                  value={globalLeadRequirements}
                  onChange={(e) => setGlobalLeadRequirements(e.target.value)}
                  placeholder="Describe details, sizes, specs, locations..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGlobalSubmitLeadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-blue-600 font-bold shadow-md shadow-blue-500/20"
                >
                  Submit Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Interactive Toast Notification Popup */}
      {toastNotif && isNotifForUser(toastNotif, activeUser) && (
        <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 left-3 sm:left-auto z-50 max-w-sm w-auto sm:w-full bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              <span className="font-extrabold text-xs text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <Bell className="w-3 h-3" /> Live Alert
              </span>
            </div>
            <button
              type="button"
              onClick={() => setToastNotif(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 space-y-1">
            <h4 className="font-bold text-sm text-white">{toastNotif.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{toastNotif.message}</p>
          </div>

          {toastNotif.targetTab && (
            <button
              type="button"
              onClick={() => handleNotificationClick(toastNotif)}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all uppercase tracking-wider"
            >
              <span>Click to view section</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Company Settings Modal */}
      <CompanySettingsModal
        companyProfile={companyProfile}
        isOpen={showCompanySettingsModal}
        onClose={() => setShowCompanySettingsModal(false)}
        onSave={(updated) => {
          setCompanyProfile(updated);
        }}
      />

      {/* Mobile Phone Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={activeUser.role}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Birthday Celebration & Wish Reminder Modal */}
      <BirthdayReminderModal
        isOpen={isBirthdayModalOpen}
        onClose={handleCloseBirthdayModal}
        currentUser={activeUser}
        allUsers={users}
        wishes={birthdayWishes}
        onSendWish={handleSendBirthdayWish}
      />

      {/* Global HD Fullscreen Media Lightbox Viewer */}
      <GlobalImageViewer />
    </div>
  );
}
