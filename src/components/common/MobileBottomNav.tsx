import React from 'react';
import { NavTab, UserRole } from '../../types';
import { Clock, Briefcase, Receipt, LayoutDashboard, FileCheck2, MapPin, Home, ShoppingCart } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userRole: UserRole;
  onOpenMobileMenu?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  userRole
}) => {
  // Determine primary work tab based on role
  const getPrimaryWorkTab = (): { tab: NavTab; label: string; icon: React.ReactNode } => {
    switch (userRole) {
      case 'ADMIN':
      case 'SUB_ADMIN':
        return { tab: 'DASHBOARD', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> };
      case 'CRM_EMPLOYEE':
        return { tab: 'LEADS', label: 'Leads', icon: <FileCheck2 className="w-5 h-5" /> };
      case 'SITE_SUPERVISOR':
        return { tab: 'SITE_SUPERVISOR_PORTAL', label: 'Site Desk', icon: <MapPin className="w-5 h-5" /> };
      case 'PROJECT_COORDINATOR':
        return { tab: 'SUPERVISOR_DESK', label: 'Coordinator', icon: <Briefcase className="w-5 h-5" /> };
      case 'HR':
        return { tab: 'HR_ATTENDANCE', label: 'HR Logs', icon: <Clock className="w-5 h-5" /> };
      case 'ACCOUNTS':
        return { tab: 'ACCOUNTS_REIMBURSEMENT', label: 'Clearance', icon: <Receipt className="w-5 h-5" /> };
      case 'PURCHASE':
      case 'VENDOR_MANAGER':
        return { tab: 'PURCHASE_DESK', label: 'Purchase', icon: <ShoppingCart className="w-5 h-5" /> };
      case 'DESIGNER':
      case 'SR_DESIGNER':
      case 'SENIOR_DESIGNER':
        return { tab: 'DESIGN_PORTAL', label: 'Designs', icon: <Briefcase className="w-5 h-5" /> };
      default:
        return { tab: 'STAFF_RECE_WORKSPACE', label: 'My RECE', icon: <Briefcase className="w-5 h-5" /> };
    }
  };

  const primaryWork = getPrimaryWorkTab();

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 text-white shadow-2xl px-1.5 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around text-[10px] font-bold select-none"
    >
      {/* 1. Home Workspace */}
      <button
        onClick={() => onTabChange('HOME')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
          activeTab === 'HOME'
            ? 'text-blue-400 font-black bg-blue-500/10 ring-1 ring-blue-500/30'
            : 'text-slate-400 hover:text-slate-200 active:scale-95'
        }`}
      >
        <Home className={`w-5 h-5 transition-transform ${activeTab === 'HOME' ? 'text-blue-400 scale-110' : 'text-slate-400'}`} />
        <span className="mt-0.5 truncate text-[10px] tracking-tight">Home</span>
      </button>

      {/* 2. Punch In / Out (Attendance Desk) */}
      <button
        onClick={() => onTabChange('MY_ATTENDANCE')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
          activeTab === 'MY_ATTENDANCE'
            ? 'text-rose-400 font-black bg-rose-500/10 ring-1 ring-rose-500/30'
            : 'text-slate-400 hover:text-slate-200 active:scale-95'
        }`}
      >
        <Clock className={`w-5 h-5 transition-transform ${activeTab === 'MY_ATTENDANCE' ? 'text-rose-400 scale-110' : 'text-slate-400'}`} />
        <span className="mt-0.5 truncate text-[10px] tracking-tight">Punch In</span>
      </button>

      {/* 3. Role Primary Work Desk */}
      <button
        onClick={() => onTabChange(primaryWork.tab)}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
          activeTab === primaryWork.tab
            ? 'text-emerald-400 font-black bg-emerald-500/10 ring-1 ring-emerald-500/30'
            : 'text-slate-400 hover:text-slate-200 active:scale-95'
        }`}
      >
        <div className={`transition-transform ${activeTab === primaryWork.tab ? 'text-emerald-400 scale-110' : 'text-slate-400'}`}>
          {primaryWork.icon}
        </div>
        <span className="mt-0.5 truncate text-[10px] tracking-tight">{primaryWork.label}</span>
      </button>

      {/* 4. My Claims & Reimbursements */}
      <button
        onClick={() => onTabChange('MY_REIMBURSEMENTS')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] ${
          activeTab === 'MY_REIMBURSEMENTS'
            ? 'text-teal-400 font-black bg-teal-500/10 ring-1 ring-teal-500/30'
            : 'text-slate-400 hover:text-slate-200 active:scale-95'
        }`}
      >
        <Receipt className={`w-5 h-5 transition-transform ${activeTab === 'MY_REIMBURSEMENTS' ? 'text-teal-400 scale-110' : 'text-slate-400'}`} />
        <span className="mt-0.5 truncate text-[10px] tracking-tight">Claims</span>
      </button>
    </nav>
  );
};

