import React, { useState } from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Users2, 
  Briefcase, 
  FileCheck2, 
  Palette, 
  HardHat, 
  MapPin, 
  FileSpreadsheet, 
  UserPlus, 
  PlusCircle,
  Send,
  Wrench,
  CalendarCheck,
  Landmark,
  Receipt,
  Clock,
  ChevronRight,
  Menu,
  X,
  Boxes,
  Key,
  Home,
  Compass,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  ShoppingCart,
  Building2,
  Building,
  MessageSquare
} from 'lucide-react';

export type NavTab = 
  | 'HOME'
  | 'DASHBOARD'
  | 'CLIENTS'
  | 'LEADS'
  | 'CRM_WORKFLOW'
  | 'PROJECT_GROUP_WORKSPACE'
  | 'QUOTATION_ENGINE'
  | 'DESIGN_PORTAL'
  | 'STRUCTURE_DESIGNER_WORKSPACE'
  | 'DESIGN_REQUESTS'
  | 'SUPERVISOR_DESK'
  | 'SUPERVISOR_ALLOCATION'
  | 'SUPERVISOR_DOCS'
  | 'SUPERVISOR_AUDIT'
  | 'SITE_SUPERVISOR_PORTAL'
  | 'SITE_PROGRESS_REQS'
  | 'SITE_EOD_HUB'
  | 'SITE_ONEDRIVE_SYNC'
  | 'SITE_OTP_DISPATCH'
  | 'SITE_SUPERVISOR_MATERIAL_REQ'
  | 'SITE_VISIT'
  | 'ABOUT_EMPLOYEES'
  | 'SERVICE_CATALOG'
  | 'USER_MANAGEMENT'
  | 'HR_ATTENDANCE'
  | 'ACCOUNTS_REIMBURSEMENT'
  | 'ACCOUNTS_MATERIAL_REQUISITION'
  | 'PURCHASE_BUCKET'
  | 'BILLING_DESK'
  | 'STOCKS_INVENTORY'
  | 'MY_REIMBURSEMENTS'
  | 'MY_ATTENDANCE'
  | 'STAFF_RECE_WORKSPACE'
  | 'PROJECT_MANAGER_OTP'
  | 'PURCHASE_DESK'
  | 'VENDOR_DIRECTORY';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userRole: UserRole;
  onNewWorkClick: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  onNewWorkClick,
  mobileOpen: externalMobileOpen,
  setMobileOpen: externalSetMobileOpen
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const isAllowed = (tab: NavTab): boolean => {
    if (tab === 'HOME') return true;
    if (tab === 'MY_ATTENDANCE') return true;
    if (tab === 'SITE_VISIT') return true;
    if (userRole === 'ADMIN' || userRole === 'SUB_ADMIN') return true;

    switch (tab) {
      case 'DASHBOARD':
      case 'USER_MANAGEMENT':
        return userRole === 'ADMIN' || userRole === 'SUB_ADMIN';
      
      // HR Role (from old system)
      case 'HR_ATTENDANCE':
      case 'ABOUT_EMPLOYEES':
        return userRole === 'HR' || userRole === 'ADMIN' || userRole === 'SUB_ADMIN';

      // CRM: Lead Generation (from old)
      case 'LEADS':
        return userRole === 'CRM_EMPLOYEE' || userRole === 'ADMIN' || userRole === 'SUB_ADMIN';

      // WhatsApp Project Groups (accessible by CRM, Admin & collaborative project members)
      case 'PROJECT_GROUP_WORKSPACE':
        return [
          'CRM_EMPLOYEE', 'ADMIN', 'SUB_ADMIN', 
          'DESIGNER', 'SR_DESIGNER', 'SENIOR_DESIGNER', 'STRUCTURE_DESIGNER',
          'PROJECT_MANAGER', 'PROJECT_COORDINATOR', 
          'SITE_SUPERVISOR', 'PURCHASE', 'ACCOUNTS', 'BILLING', 'STOCKS', 'HR'
        ].includes(userRole);

      // Designer Studio (new)
      case 'DESIGN_PORTAL':
        return ['DESIGNER', 'SR_DESIGNER', 'SENIOR_DESIGNER', 'ADMIN', 'SUB_ADMIN'].includes(userRole);

      // Structure Designer (new)
      case 'STRUCTURE_DESIGNER_WORKSPACE':
        return ['STRUCTURE_DESIGNER', 'DESIGNER', 'ADMIN', 'SUB_ADMIN', 'PROJECT_MANAGER'].includes(userRole);

      // Project Team (new)
      case 'PROJECT_MANAGER_OTP':
        return ['PROJECT_MANAGER', 'PROJECT_COORDINATOR', 'ADMIN', 'SUB_ADMIN'].includes(userRole);

      // Purchase (new)
      case 'PURCHASE_BUCKET':
        return ['PURCHASE', 'ACCOUNTS', 'ADMIN', 'SUB_ADMIN', 'PROJECT_MANAGER'].includes(userRole);

      // Billing (new)
      case 'BILLING_DESK':
        return ['BILLING', 'ACCOUNTS', 'ADMIN', 'SUB_ADMIN'].includes(userRole);

      // Accounts (new)
      case 'ACCOUNTS_MATERIAL_REQUISITION':
        return ['ACCOUNTS', 'ADMIN', 'SUB_ADMIN', 'PURCHASE'].includes(userRole);

      // Stocks (new)
      case 'STOCKS_INVENTORY':
        return ['STOCKS', 'PURCHASE', 'ADMIN', 'SUB_ADMIN', 'SITE_SUPERVISOR'].includes(userRole);

      // Site Supervisor (new)
      case 'SITE_SUPERVISOR_PORTAL':
        return ['SITE_SUPERVISOR', 'PROJECT_COORDINATOR', 'ADMIN', 'SUB_ADMIN'].includes(userRole);

      default:
        return false;
    }
  };

  interface MenuItem {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    group: string;
  }

  const allNavItems: MenuItem[] = [
    // Main
    { id: 'HOME', label: 'Home Workspace', icon: <Home className="w-5 h-5" />, group: 'Main' },
    { id: 'DASHBOARD', label: 'Master Admin Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, group: 'Main' },
    
    // Daily Employee
    { id: 'MY_ATTENDANCE', label: 'Daily Attendance Punch', icon: <Clock className="w-5 h-5 text-rose-400" />, badge: 'GPS', group: 'Employee' },
    { id: 'SITE_VISIT', label: 'Site Visit & Field Log', icon: <MapPin className="w-5 h-5 text-blue-400" />, badge: 'Field Log', group: 'Employee' },

    // HR & Staff (from old system)
    { id: 'HR_ATTENDANCE', label: 'Staff Attendance Logs', icon: <CalendarCheck className="w-5 h-5 text-rose-400" />, badge: 'HR', group: 'HR' },
    { id: 'ABOUT_EMPLOYEES', label: 'About Employees & Vaults', icon: <Users className="w-5 h-5 text-cyan-400" />, badge: 'KYC', group: 'HR' },

    // CRM & Sales (Lead Gen from old + WhatsApp Group from new)
    { id: 'LEADS', label: 'Lead Management Desk', icon: <FileCheck2 className="w-5 h-5 text-amber-400" />, badge: 'Lead Gen', group: 'CRM' },
    { id: 'PROJECT_GROUP_WORKSPACE', label: 'Lead & Project WhatsApp Groups', icon: <MessageSquare className="w-5 h-5 text-emerald-400" />, badge: 'WhatsApp', group: 'CRM' },

    // Project & Design (new)
    { id: 'DESIGN_PORTAL', label: 'Designer Studio Desk (2D/3D)', icon: <Palette className="w-5 h-5 text-purple-400" />, group: 'Design' },
    { id: 'STRUCTURE_DESIGNER_WORKSPACE', label: 'Structure Designer Space', icon: <Building className="w-5 h-5 text-blue-400" />, badge: 'CAD', group: 'Design' },

    // Project Team (new)
    { id: 'PROJECT_MANAGER_OTP', label: 'Project Team & OTP Dispatch', icon: <Key className="w-5 h-5 text-amber-300" />, group: 'Project' },

    // Finance, Purchase, Billing & Stocks (new)
    { id: 'PURCHASE_BUCKET', label: 'Purchase Requisition Bucket', icon: <ShoppingCart className="w-5 h-5 text-amber-400" />, badge: 'Bucket', group: 'Finance' },
    { id: 'BILLING_DESK', label: 'Billing Desk & GST Invoices', icon: <Receipt className="w-5 h-5 text-emerald-400" />, badge: 'GST', group: 'Finance' },
    { id: 'ACCOUNTS_MATERIAL_REQUISITION', label: 'Material Requisitions Desk', icon: <Boxes className="w-5 h-5 text-amber-400" />, group: 'Finance' },
    { id: 'STOCKS_INVENTORY', label: 'Stocks & Materials Inventory', icon: <Boxes className="w-5 h-5 text-indigo-400" />, badge: 'Stocks', group: 'Finance' },

    // Site Supervision (new)
    { id: 'SITE_SUPERVISOR_PORTAL', label: 'Site Supervisor Field Portal', icon: <MapPin className="w-5 h-5 text-blue-400" />, group: 'Site' },

    // Admin
    { id: 'USER_MANAGEMENT', label: 'Staff Accounts & Passwords', icon: <UserPlus className="w-5 h-5 text-violet-400" />, group: 'Admin' },
  ];

  const visibleItems = allNavItems.filter((item) => isAllowed(item.id));

  const [localMobileOpen, localSetMobileOpen] = useState(false);
  const isMobileOpen = externalMobileOpen !== undefined ? externalMobileOpen : localMobileOpen;
  const toggleMobileOpen = externalSetMobileOpen !== undefined ? externalSetMobileOpen : localSetMobileOpen;

  return (
    <>
      {/* Mobile Slide-Over Drawer Modal */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex justify-start animate-in fade-in duration-200"
          onClick={() => toggleMobileOpen(false)}
        >
          <div 
            className="w-4/5 max-w-xs bg-slate-900 text-white h-full flex flex-col shadow-2xl border-r border-slate-800 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Menu className="w-4 h-4 text-blue-400" /> Navigation Menu
              </div>
              <button
                onClick={() => toggleMobileOpen(false)}
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(userRole === 'ADMIN' || userRole === 'SUB_ADMIN') && (
              <div className="p-3 border-b border-slate-800">
                <button
                  onClick={() => {
                    onNewWorkClick();
                    toggleMobileOpen(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-lg text-xs uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit New Lead</span>
                </button>
              </div>
            )}

            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {visibleItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      toggleMobileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/90'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                        isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 uppercase shrink-0">
                {userRole.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-white uppercase tracking-wide truncate">
                  {userRole.replace('_', ' ')}
                </p>
                <a
                  href="https://1drv.ms/f/c/5B3D25D3EA1B900F/IgAJlltjpsdsSY1fD3GR0QVrAV9kNgpAmu6qZpI4wMFDwKk?e=7y5YOU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>OneDrive Cloud Sync ↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Clean Icon Column Navigation (Streamlined) */}
      <aside className={`hidden md:flex ${collapsed ? 'w-16' : 'w-20 lg:w-56'} bg-slate-900 text-white border-r border-slate-800 flex-col shrink-0 min-h-[calc(100vh-6rem)] transition-all duration-200 select-none`}>
        {/* Top Action / Toggle */}
        <div className="p-2.5 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full py-1.5 px-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse into icon column"}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4 text-blue-400" /> : (
              <>
                <PanelLeftClose className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider hidden lg:inline">Collapse</span>
              </>
            )}
          </button>
        </div>

        {(userRole === 'ADMIN' || userRole === 'SUB_ADMIN') && (
          <div className="p-2 border-b border-slate-800">
            <button
              onClick={onNewWorkClick}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="Submit New Lead"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span className={`text-xs uppercase font-bold tracking-wider ${collapsed ? 'hidden' : 'hidden lg:inline'}`}>New Lead</span>
            </button>
          </div>
        )}

        {/* Clean Icon Buttons Column */}
        <nav className="flex-1 p-2 space-y-1.5 overflow-y-auto overflow-x-hidden no-scrollbar">
          {visibleItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full group relative flex items-center ${collapsed ? 'justify-center' : 'justify-center lg:justify-start'} p-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-sm ring-1 ring-blue-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`}>
                    {item.icon}
                  </span>
                  <span className={`text-xs font-semibold truncate ${collapsed ? 'hidden' : 'hidden lg:inline'}`}>
                    {item.label}
                  </span>
                </div>

                {/* Floating Tooltip for Icon-Only View on Hover */}
                {(collapsed || true) && (
                  <div className="hidden group-hover:flex lg:group-hover:hidden absolute left-full ml-3 px-2.5 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/40 font-mono font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile / Cloud Sync */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-center lg:justify-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 uppercase shrink-0">
            {userRole.charAt(0)}
          </div>
          <div className={`overflow-hidden ${collapsed ? 'hidden' : 'hidden lg:block'}`}>
            <p className="text-[11px] font-bold text-white uppercase tracking-wide truncate">
              {userRole.replace('_', ' ')}
            </p>
            <a
              href="https://1drv.ms/f/c/5B3D25D3EA1B900F/IgAJlltjpsdsSY1fD3GR0QVrAV9kNgpAmu6qZpI4wMFDwKk?e=7y5YOU"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 truncate"
              title="Central OneDrive Cloud"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="truncate">OneDrive Sync ↗</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
