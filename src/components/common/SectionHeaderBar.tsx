import React from 'react';
import { NavTab, UserRole } from '../../types';
import { 
  ArrowLeft, 
  Home, 
  Clock, 
  Compass, 
  Receipt, 
  MapPin, 
  Briefcase, 
  FileCheck2, 
  Calculator, 
  Users2, 
  Palette, 
  HardHat, 
  Key, 
  UserCheck, 
  Users, 
  Landmark, 
  Boxes, 
  LayoutDashboard, 
  ShieldCheck, 
  Wrench,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface SectionHeaderBarProps {
  activeTab: NavTab;
  onBackToHome: () => void;
  userRole?: UserRole;
  onNewLeadClick?: () => void;
}

export const SectionHeaderBar: React.FC<SectionHeaderBarProps> = ({
  activeTab,
  onBackToHome,
  userRole,
  onNewLeadClick
}) => {
  if (activeTab === 'HOME') {
    return null;
  }

  const getSectionMetadata = (tab: NavTab) => {
    switch (tab) {
      case 'DASHBOARD':
        return {
          title: 'Executive Analytics Dashboard',
          category: 'Executive Analytics',
          icon: <LayoutDashboard className="w-5 h-5 text-indigo-600" />,
          badge: 'KPI Analytics',
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
        };
      case 'MY_ATTENDANCE':
        return {
          title: 'Daily Attendance Punch Desk',
          category: 'Attendance & Punching',
          icon: <Clock className="w-5 h-5 text-rose-600" />,
          badge: 'Live GPS Selfie',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
        };
      case 'SITE_VISIT':
        return {
          title: 'Site Visit Log Desk',
          category: 'Attendance & Punching',
          icon: <Compass className="w-5 h-5 text-emerald-600" />,
          badge: 'Field Visits & GPS',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'MY_REIMBURSEMENTS':
        return {
          title: 'My Expense Claims & Vouchers',
          category: 'Employee Self-Service',
          icon: <Receipt className="w-5 h-5 text-teal-600" />,
          badge: 'Claim Submission',
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-200'
        };
      case 'STAFF_RECE_WORKSPACE':
        return {
          title: 'Client & Site RECE Blueprints Hub',
          category: 'Employee Self-Service',
          icon: <MapPin className="w-5 h-5 text-indigo-600" />,
          badge: 'RECE & Survey Files',
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
        };
      case 'LEADS':
        return {
          title: 'Lead Management & Inquiries Desk',
          category: 'CRM & Lead Pipeline',
          icon: <Briefcase className="w-5 h-5 text-blue-600" />,
          badge: 'Inbound Pipeline',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'CRM_WORKFLOW':
        return {
          title: 'CRM Work Assignment & Stages A-I',
          category: 'CRM & Lead Pipeline',
          icon: <FileCheck2 className="w-5 h-5 text-indigo-600" />,
          badge: 'Workflow Pipeline',
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
        };
      case 'CLIENTS':
        return {
          title: 'Corporate Clients & Past Project History',
          category: 'CRM & Lead Pipeline',
          icon: <Users2 className="w-5 h-5 text-cyan-600" />,
          badge: 'Corporate Master',
          badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200'
        };
      case 'QUOTATION_ENGINE':
        return {
          title: 'GST Quotation Generator Engine',
          category: 'GST Quotations & Estimation',
          icon: <Calculator className="w-5 h-5 text-emerald-600" />,
          badge: 'Official GST PDF',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'DESIGN_PORTAL':
        return {
          title: 'Designer Studio Workspace (2D / 3D)',
          category: 'Creative Design Studio',
          icon: <Palette className="w-5 h-5 text-purple-600" />,
          badge: 'Design Deliverables',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'DESIGN_REQUESTS':
        return {
          title: 'Design & File Requests Global Desk',
          category: 'Creative Design Studio',
          icon: <Palette className="w-5 h-5 text-pink-600" />,
          badge: 'Asset Requests',
          badgeColor: 'bg-pink-100 text-pink-800 border-pink-200'
        };
      case 'PROJECT_MANAGER_OTP':
        return {
          title: 'Project Manager OTP Dispatch & Verification',
          category: 'Project Management & Shifts',
          icon: <Key className="w-5 h-5 text-amber-600" />,
          badge: 'OTP Clearance',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'SUPERVISOR_DESK':
      case 'SUPERVISOR_ALLOCATION':
      case 'SUPERVISOR_DOCS':
      case 'SUPERVISOR_AUDIT':
        return {
          title: 'Project Coordinator Handoff & Site Shifts',
          category: 'Project Management & Shifts',
          icon: <HardHat className="w-5 h-5 text-amber-600" />,
          badge: 'Coordinator Desk',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'SITE_SUPERVISOR_PORTAL':
      case 'SITE_PROGRESS_REQS':
      case 'SITE_EOD_HUB':
      case 'SITE_ONEDRIVE_SYNC':
      case 'SITE_OTP_DISPATCH':
        return {
          title: 'Field Site Supervisor Execution Portal',
          category: 'On-Site Field Operations',
          icon: <MapPin className="w-5 h-5 text-blue-600" />,
          badge: 'Field Execution',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'HR_ATTENDANCE':
        return {
          title: 'All Staff Attendance Logs & Excel Export',
          category: 'Human Resources',
          icon: <UserCheck className="w-5 h-5 text-purple-600" />,
          badge: 'HR Audit & Reports',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'ABOUT_EMPLOYEES':
        return {
          title: 'About Employees & KYC Vaults',
          category: 'Human Resources',
          icon: <Users className="w-5 h-5 text-cyan-600" />,
          badge: 'Personnel Vaults',
          badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200'
        };
      case 'ACCOUNTS_REIMBURSEMENT':
        return {
          title: 'Expense Claims & Payment Clearances',
          category: 'Accounts & Finance',
          icon: <Landmark className="w-5 h-5 text-emerald-600" />,
          badge: '2-Step Approval',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'ACCOUNTS_MATERIAL_REQUISITION':
      case 'SITE_SUPERVISOR_MATERIAL_REQ':
        return {
          title: 'Material & Requirement Requisitions Desk',
          category: 'Accounts & Procurement',
          icon: <Boxes className="w-5 h-5 text-amber-600" />,
          badge: 'Purchase Desk',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'USER_MANAGEMENT':
        return {
          title: 'Staff Accounts & Passwords Security',
          category: 'System Administration & Security',
          icon: <ShieldCheck className="w-5 h-5 text-violet-600" />,
          badge: 'Security Vault',
          badgeColor: 'bg-violet-100 text-violet-800 border-violet-200'
        };
      case 'SERVICE_CATALOG':
        return {
          title: 'Service Trade Roster & Contractor Teams',
          category: 'System Administration & Security',
          icon: <Wrench className="w-5 h-5 text-cyan-600" />,
          badge: 'Execution Trades',
          badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200'
        };
      default:
        return {
          title: (activeTab as string).replace(/_/g, ' '),
          category: 'Section Workspace',
          icon: <Briefcase className="w-5 h-5 text-blue-600" />,
          badge: 'Active Module',
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-200'
        };
    }
  };

  const meta = getSectionMetadata(activeTab);

  return (
    <div className="mb-4 sm:mb-6 bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
      {/* Left: Back Button + Breadcrumb + Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onBackToHome}
          className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 active:scale-95"
          title="Return to Main Home Workspace"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-extrabold tracking-wide">Back to Home</span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block shrink-0" />

        <div className="min-w-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
            <button
              onClick={onBackToHome}
              className="hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Home className="w-3 h-3 text-slate-400" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <span className="text-slate-500 truncate">{meta.category}</span>
          </div>

          {/* Section Title & Badges */}
          <div className="flex items-center gap-2 mt-0.5 truncate">
            <div className="p-1 rounded-md bg-slate-100 shrink-0 hidden md:inline-flex">
              {meta.icon}
            </div>
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
              {meta.title}
            </h2>
            <span className={`hidden lg:inline-flex text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase font-mono tracking-wider shrink-0 ${meta.badgeColor}`}>
              {meta.badge}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quick actions (if any) + Direct Home Link */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {onNewLeadClick && (userRole === 'ADMIN' || userRole === 'SUB_ADMIN' || userRole === 'CRM_EMPLOYEE') && (
          <button
            onClick={onNewLeadClick}
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            + New Lead
          </button>
        )}

        <a
          href="https://1drv.ms/f/c/5B3D25D3EA1B900F/IgAJlltjpsdsSY1fD3GR0QVrAV9kNgpAmu6qZpI4wMFDwKk?e=7y5YOU"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-[11px] font-semibold transition-colors"
          title="Open Central OneDrive Cloud Storage in new tab"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>OneDrive Sync</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        <button
          onClick={onBackToHome}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Go to Home Workspace"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
