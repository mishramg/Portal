import React from 'react';
import { 
  UserAccount, 
  AttendanceRecord, 
  Festival, 
  WorkAssignment,
  Lead,
  ReimbursementClaim,
  SiteVisitRecord
} from '../../types';
import { Storage } from '../../lib/storage';
import { 
  getLatePunchesForWeek, 
  LATE_THRESHOLD_LABEL 
} from '../../lib/attendanceUtils';
import { 
  Clock, 
  MapPin, 
  Camera,
  Users, 
  UserCheck, 
  ShieldCheck, 
  Calculator, 
  Palette, 
  HardHat, 
  Receipt, 
  Briefcase, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  Send,
  FileCheck2,
  Compass,
  Landmark,
  Boxes,
  Key,
  LayoutDashboard,
  Users2,
  Wrench,
  ArrowUpRight,
  BellRing,
  ShoppingCart,
  Building2,
  Building,
  MessageSquare,
  Calendar,
  Presentation,
  Sparkles
} from 'lucide-react';
import { 
  getTodaysBirthdayEmployees, 
  getCurrentMonthBirthdayEmployees, 
  parseDateOfBirth, 
  MONTH_NAMES 
} from '../common/BirthdayReminderModal';

interface HomeScreenProps {
  activeUser: UserAccount;
  allUsers: UserAccount[];
  attendanceRecords: AttendanceRecord[];
  festivals: Festival[];
  works: WorkAssignment[];
  leads: Lead[];
  reimbursements: ReimbursementClaim[];
  siteVisits?: SiteVisitRecord[];
  onNavigate: (tab: string) => void;
  onQuickPunchIn: () => void;
  onOpenBirthdayModal?: () => void;
  onOpenPresentation?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  activeUser,
  allUsers,
  attendanceRecords,
  festivals,
  works,
  leads,
  reimbursements,
  siteVisits,
  onNavigate,
  onOpenBirthdayModal,
  onOpenPresentation
}) => {
  const role = activeUser.role;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Today's attendance for active user
  const todayRecord = attendanceRecords.find(
    (r) => r.employeeId === activeUser.id && r.date === todayStr
  );

  // Today's site visits for active user
  const effectiveSiteVisits = siteVisits || Storage.getSiteVisits();
  const userTodaySiteVisits = effectiveSiteVisits.filter(
    (v) => v.employeeId === activeUser.id && v.date === todayStr
  );
  const activeOngoingVisit = userTodaySiteVisits.find((v) => !v.endTime);
  const latestSiteVisit = userTodaySiteVisits[userTodaySiteVisits.length - 1];

  // Role permissions
  const isAdmin = role === 'ADMIN';
  const isAdminOrSub = role === 'ADMIN' || role === 'SUB_ADMIN';

  // Weekly Late Punch Calculation (> 10:15 AM)
  const latePunchesThisWeek = getLatePunchesForWeek(attendanceRecords, activeUser.id, todayStr);
  const hasLatePunchAlert = latePunchesThisWeek.length >= 3;
  const isHR = role === 'HR';
  const isAccounts = role === 'ACCOUNTS';
  const isSiteSupervisor = role === 'SITE_SUPERVISOR';
  const isProjectCoordinator = role === 'PROJECT_COORDINATOR';
  const isProjectManager = role === 'PROJECT_MANAGER';
  const isDesigner = role === 'DESIGNER' || role === 'SR_DESIGNER' || role === 'SENIOR_DESIGNER';
  const isCrm = role === 'CRM_EMPLOYEE';
  const isFactoryStaff = role === 'FACTORY_STAFF';

  const canAccessSiteVisits = !['FACTORY_STAFF', 'PURCHASE', 'VENDOR_MANAGER'].includes(role);
  const currentMonthName = MONTH_NAMES[now.getMonth()];
  const currentMonthBirthdays = getCurrentMonthBirthdayEmployees(allUsers, now);
  const todaysBirthdayEmps = getTodaysBirthdayEmployees(allUsers, now);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / User Profile & System Status */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#165EAA] font-bold text-lg shadow-inner">
            {activeUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">{activeUser.name}</h2>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-50 text-[#165EAA] border border-blue-200 uppercase">
                {activeUser.role.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {activeUser.department || 'Kamlawati Display Private Limited'} • ID: {activeUser.employeeCode || activeUser.id}
            </p>
            <p className="text-[11px] text-blue-700 font-semibold mt-0.5 flex items-center gap-1.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600 inline" />
                System Date: {now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">Month: {currentMonthName}</span>
            </p>
          </div>
        </div>

        {/* Quick Modal Triggers if available */}
        <div className="flex items-center gap-2 flex-wrap">
          {todaysBirthdayEmps.length > 0 && onOpenBirthdayModal && (
            <button
              onClick={onOpenBirthdayModal}
              className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span>Today's Birthday ({todaysBirthdayEmps.length})</span>
            </button>
          )}
          {onOpenPresentation && (
            <button
              onClick={onOpenPresentation}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Presentation className="w-3.5 h-3.5 text-slate-600" />
              <span>Company PPT</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Separate Two Boxes: Attendance and Site Punch In Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Box 1: Daily Attendance Punch Desk */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/60 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

          <div>
            <div className="flex items-start justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#165EAA] shadow-xs shrink-0">
                  <Clock className="w-5 h-5 text-[#165EAA]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    Attendance Section
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100/80 text-[#165EAA] border border-blue-200">
                      Office Punch
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Daily Biometric & Camera Punch Desk</p>
                </div>
              </div>

              {/* Status Badge */}
              {todayRecord?.punchOutTime ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Day Completed
                </span>
              ) : todayRecord?.punchInTime ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  Shift Active
                </span>
              ) : isAdmin ? (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                  Admin Optional
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shrink-0 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Punch Required
                </span>
              )}
            </div>

            {/* Attendance Snapshot Details */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 mb-4">
              {todayRecord ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Punch In</span>
                    <span className="font-bold text-emerald-700 text-sm flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {todayRecord.punchInTime}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Punch Out</span>
                    {todayRecord.punchOutTime ? (
                      <span className="font-bold text-slate-700 text-sm flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        {todayRecord.punchOutTime}
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-600 text-xs flex items-center gap-1 mt-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                        Shift in Progress
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Standard Shift:</span>
                    <span className="font-bold text-slate-800">09:30 AM – 06:30 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Grace Threshold:</span>
                    <span className="font-bold text-slate-800">10:15 AM (Grace Period)</span>
                  </div>
                  {!isAdmin ? (
                    <p className="text-[11px] text-rose-600 font-semibold pt-1 border-t border-slate-200/90 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      Daily attendance punch is mandatory for all team members.
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 font-normal pt-1 border-t border-slate-200/90 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      Admin role has optional punch tracking enabled.
                    </p>
                  )}
                </div>
              )}

              {hasLatePunchAlert && (
                <div className="mt-2 text-[11px] bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Late threshold notice: {latePunchesThisWeek.length} late punches logged this week.</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onNavigate('MY_ATTENDANCE')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 ${
                !todayRecord
                  ? (!isAdmin ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-[#165EAA] hover:bg-[#0f4b88]')
                  : (todayRecord.punchOutTime ? 'bg-slate-800 hover:bg-slate-900' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200')
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              {todayRecord 
                ? (todayRecord.punchOutTime ? 'View Punch Slip' : 'Punch Out (End Day)') 
                : (isAdmin ? 'Punch In (Optional)' : 'Punch In Now (Compulsory)')}
            </button>
            <button
              onClick={() => onNavigate('MY_ATTENDANCE')}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer whitespace-nowrap"
            >
              Attendance Desk
            </button>
          </div>
        </div>

        {/* Box 2: Site Punch In Section */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/60 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

          <div>
            <div className="flex items-start justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    Site Punch In Section
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                      Field Log
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">GPS Geo-Tagged & Photo Verified Site Visits</p>
                </div>
              </div>

              {/* Status Badge */}
              {activeOngoingVisit ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Site Active
                </span>
              ) : userTodaySiteVisits.length > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {userTodaySiteVisits.length} Visit{userTodaySiteVisits.length > 1 ? 's' : ''} Today
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                  Ready to Punch
                </span>
              )}
            </div>

            {/* Site Punch Details */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 mb-4">
              {activeOngoingVisit ? (
                <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-amber-900 font-bold">
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                      {activeOngoingVisit.siteLocation}
                    </span>
                    <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded-full text-amber-900 font-bold shrink-0">
                      Started: {activeOngoingVisit.startTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-amber-800">
                    <span className="truncate">Purpose: <strong className="font-semibold">{activeOngoingVisit.visitPurpose}</strong></span>
                    <span className="text-amber-700 font-semibold shrink-0">Exit Photo Required</span>
                  </div>
                </div>
              ) : latestSiteVisit ? (
                <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-800 font-bold">
                    <span className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      {latestSiteVisit.siteLocation}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal shrink-0">
                      {latestSiteVisit.startTime} – {latestSiteVisit.endTime || 'Ongoing'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate">Purpose: <strong className="text-slate-700 font-medium">{latestSiteVisit.visitPurpose}</strong></span>
                    <span className="text-emerald-700 font-semibold shrink-0">Logged</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Tracking Method:</span>
                    <span className="font-bold text-slate-800">Live GPS Coordinates + Photo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Visit Coverage:</span>
                    <span className="font-bold text-slate-800">Client Site, Recce, Installation</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal pt-1 border-t border-slate-200/90 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    Punch in when arriving at client or project site with instant photo capture.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onNavigate('SITE_VISIT')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 ${
                activeOngoingVisit
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                  : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-200'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              {activeOngoingVisit 
                ? 'Punch Out Site Visit (Exit Photo)' 
                : (userTodaySiteVisits.length > 0 ? 'Punch Another Site Visit' : 'Punch In Site Visit (Field Log)')}
            </button>
            <button
              onClick={() => onNavigate('SITE_VISIT')}
              className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer whitespace-nowrap"
            >
              All Site Logs
            </button>
          </div>
        </div>
      </div>

      {/* Master 10 Operational Roles Matrix - Exclusively Admin & Sub-Admin Look */}
      {isAdminOrSub && (
        <>
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                    Master Admin Look
                  </span>
                  <span className="text-xs text-blue-700 font-bold">10 Core Operational Roles Matrix</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>Enterprise Roles Directory & Workspaces</span>
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                1-Click Direct Access to all 10 Departments
              </span>
            </div>

            {/* 10 Roles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-3.5">
              {/* 1. HR Role (from old system) */}
              <div
                onClick={() => onNavigate('HR_ATTENDANCE')}
                className="group bg-blue-50/40 hover:bg-white border border-blue-200 hover:border-blue-400 p-3.5 rounded-xl shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 uppercase">
                      HR Role
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                    1. HR Role
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    Staff attendance logs, GPS selfies, leave audits & employee KYC vaults.
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[10px] font-bold text-blue-700">
                  <span>Attendance Roster</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* 2. CRM (Lead Gen from old + WhatsApp Group from new) */}
              <div
                onClick={() => onNavigate('PROJECT_GROUP_WORKSPACE')}
                className="group bg-blue-50/40 hover:bg-white border border-blue-200 hover:border-blue-400 p-3.5 rounded-xl shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase">
                      CRM
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    2. CRM & Sales
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    Inbound Lead desk & WhatsApp project groups, file review & OneDrive sync.
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[10px] font-bold text-emerald-700">
                  <span>Project Chat Rooms</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* 3. Designer (new) */}
              <div
                onClick={() => onNavigate('DESIGN_PORTAL')}
                className="group bg-blue-50/40 hover:bg-white border border-blue-200 hover:border-blue-400 p-3.5 rounded-xl shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Palette className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 uppercase">
                      Designer
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                    3. Designer
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    Graphic & 3D visualization studio, creative briefs & artwork review.
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[10px] font-bold text-purple-700">
                  <span>Designer Studio</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* 4. Structure Designer (new) */}
              <div
                onClick={() => onNavigate('STRUCTURE_DESIGNER_WORKSPACE')}
                className="group bg-blue-50/40 hover:bg-white border border-blue-200 hover:border-blue-400 p-3.5 rounded-xl shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Building className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 uppercase">
                      Structural
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                    4. Structure Designer
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    AutoCAD DWG drawings, load calculations, framework & OneDrive backup.
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[10px] font-bold text-blue-700">
                  <span>CAD Work Space</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* 5. Project Team (new) */}
              <div
                onClick={() => onNavigate('PROJECT_MANAGER_OTP')}
                className="group bg-blue-50/40 hover:bg-white border border-blue-200 hover:border-blue-400 p-3.5 rounded-xl shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <HardHat className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 uppercase">
                      Project Team
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                    5. Project Team
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    Daily site allocations, coordinator handoffs, security OTPs & execution.
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[10px] font-bold text-amber-700">
                  <span>Site Execution Desk</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* 6. Purchase (new) */}
              <div
                onClick={() => onNavigate('PURCHASE_BUCKET')}
                className="group bg-blue-50/40 hover:bg-white border border-blue-200 hover:border-blue-400 p-3.5 rounded-xl shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 uppercase">
                      Purchase
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                    6. Purchase
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    Purchase requisition bucket with fast status updates to project groups.
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[10px] font-bold text-amber-700">
                  <span>Purchase Bucket</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* 7. Billing (new) */}
              <div
                onClick={() => onNavigate('BILLING_DESK')}
                className="group bg-blue-50/40 hover:bg-white border border-blue-200 hover:border-blue-400 p-3.5 rounded-xl shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase">
                      Billing
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    7. Billing
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    Client milestone schedules, 18% GST tax invoices & payment receipts.
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[10px] font-bold text-emerald-700">
                  <span>GST Milestone Invoices</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* 8. Accounts (new) */}
              <div
                onClick={() => onNavigate('ACCOUNTS_MATERIAL_REQUISITION')}
                className="group bg-blue-50/40 hover:bg-white border border-blue-200 hover:border-blue-400 p-3.5 rounded-xl shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 uppercase">
                      Accounts
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-cyan-700 transition-colors">
                    8. Accounts
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    Material requisitions clearance with live WhatsApp chat replies.
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[10px] font-bold text-cyan-700">
                  <span>Clearance Desk</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* 9. Stocks (new) */}
              <div
                onClick={() => onNavigate('STOCKS_INVENTORY')}
                className="group bg-blue-50/40 hover:bg-white border border-blue-200 hover:border-blue-400 p-3.5 rounded-xl shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Boxes className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 uppercase">
                      Stocks
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                    9. Stocks
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    Warehouse raw materials inventory, auto-deduction on site requests.
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[10px] font-bold text-indigo-700">
                  <span>Warehouse Inventory</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* 10. Site Supervisor (new) */}
              <div
                onClick={() => onNavigate('SITE_SUPERVISOR_PORTAL')}
                className="group bg-blue-50/40 hover:bg-white border border-blue-200 hover:border-blue-400 p-3.5 rounded-xl shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 uppercase">
                      Supervisor
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-rose-700 transition-colors">
                    10. Site Supervisor
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    Daily GPS check-in, contractor logs, snag items & on-site material requests.
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[10px] font-bold text-rose-700">
                  <span>Field Supervisor Hub</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Executive Quick Launchers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div
              onClick={() => onNavigate('USER_MANAGEMENT')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm hover:border-violet-300 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Staff Accounts & Passwords Security</h4>
                  <p className="text-[11px] text-slate-500">Manage 43 employee passwords, PINs & system roles</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-violet-600" />
            </div>

            <div
              onClick={() => onNavigate('DASHBOARD')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Executive Master Dashboard</h4>
                  <p className="text-[11px] text-slate-500">Cross-department analytics, active sites & project health</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </>
      )}

      {/* Non-Admin Employee Dedicated Operational Workspace Hub */}
      {!isAdminOrSub && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>My Operational Workspace Hub</span>
              </h3>
              <p className="text-xs text-slate-500">
                Direct access to your department tools and active workflow streams.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg uppercase">
              {activeUser.role.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* If HR: Staff Attendance Logs (from old) & About Employees / KYC (from old) */}
            {isHR && (
              <>
                <div
                  onClick={() => onNavigate('HR_ATTENDANCE')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Staff Attendance Logs & Roster</h4>
                    <p className="text-xs text-slate-500">
                      Audit all employee punch times, GPS coordinates, leave requests and download monthly Excel XLSX roster.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-blue-600">
                    <span>Open Attendance Roster</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div
                  onClick={() => onNavigate('ABOUT_EMPLOYEES')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-cyan-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">About Employees & KYC Vaults</h4>
                    <p className="text-xs text-slate-500">
                      Access staff profiles, department designations, emergency contacts, salary details and secure Legal/Bank KYC vaults.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-cyan-600">
                    <span>Open Employee Vaults</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </>
            )}

            {/* If CRM: Lead Management Desk (from old CRM Lead Gen) & WhatsApp Project Groups (new) */}
            {isCrm && (
              <>
                <div
                  onClick={() => onNavigate('LEADS')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Lead Management Desk</h4>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">Lead Gen</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Capture inbound client inquiries, view assigned leads, submit client budget requirements, and submit for Admin sign-off.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-amber-700">
                    <span>Open Lead Desk ({leads.length} Leads)</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div
                  onClick={() => onNavigate('PROJECT_GROUP_WORKSPACE')}
                  className="bg-white p-5 rounded-2xl border-2 border-emerald-300 shadow-2xs hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Lead & Project WhatsApp Groups</h4>
                      <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded">WhatsApp</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Dedicated WhatsApp-style group chatroom for each lead. Review files with 3-options (Approve, Correction Reply, Reject), set action reminders, and auto-sync to OneDrive.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-emerald-700">
                    <span>Enter Project Rooms</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </>
            )}

            {/* If DESIGNER (2D / 3D) */}
            {isDesigner && (
              <>
                <div
                  onClick={() => onNavigate('DESIGN_PORTAL')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-purple-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Palette className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Designer Studio Desk (2D / 3D)</h4>
                    <p className="text-xs text-slate-500">
                      Review creative briefs from CRM, upload high-res renders and artwork deliverables with 3-action approval statuses.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-purple-700">
                    <span>Open Designer Studio</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div
                  onClick={() => onNavigate('PROJECT_GROUP_WORKSPACE')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Project WhatsApp Groups</h4>
                    <p className="text-xs text-slate-500">
                      Collaborate in active project chat rooms, post drawing revisions and check correction notes from CRM.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-emerald-700">
                    <span>Open Group Chats</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </>
            )}

            {/* If STRUCTURE_DESIGNER */}
            {role === 'STRUCTURE_DESIGNER' && (
              <>
                <div
                  onClick={() => onNavigate('STRUCTURE_DESIGNER_WORKSPACE')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Building className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Structure Designer CAD Space</h4>
                    <p className="text-xs text-slate-500">
                      Upload AutoCAD DWG drawings, load calculations, MS framework schematics, and view approval statuses.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-blue-700">
                    <span>Open CAD Workspace</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div
                  onClick={() => onNavigate('PROJECT_GROUP_WORKSPACE')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Project WhatsApp Groups</h4>
                    <p className="text-xs text-slate-500">
                      Real-time technical discussions with Site Supervisor and CRM. Automatic OneDrive drawings backup.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-emerald-700">
                    <span>Open Group Chats</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </>
            )}

            {/* If PROJECT_MANAGER / COORDINATOR */}
            {(isProjectManager || isProjectCoordinator) && (
              <>
                <div
                  onClick={() => onNavigate('PROJECT_MANAGER_OTP')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Key className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Project Team & OTP Dispatch</h4>
                    <p className="text-xs text-slate-500">
                      Assign daily sites to supervisors, generate digital shift verification OTPs, and monitor on-site execution.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-amber-700">
                    <span>Open Project Dispatch</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div
                  onClick={() => onNavigate('PROJECT_GROUP_WORKSPACE')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Project WhatsApp Groups</h4>
                    <p className="text-xs text-slate-500">
                      Coordinated chat groups with Client CRM, Designers, and Site Supervisors with instant material requisitions.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-emerald-700">
                    <span>Enter Group Chats</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </>
            )}

            {/* If PURCHASE */}
            {role === 'PURCHASE' && (
              <>
                <div
                  onClick={() => onNavigate('PURCHASE_BUCKET')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Purchase Requisitions Bucket</h4>
                    <p className="text-xs text-slate-500">
                      Central queue receiving on-site material requests with 1-click status replies posted directly to project chats.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-amber-700">
                    <span>Open Purchase Bucket</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div
                  onClick={() => onNavigate('STOCKS_INVENTORY')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Boxes className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Stocks & Materials Inventory</h4>
                    <p className="text-xs text-slate-500">
                      Warehouse stock thresholds, raw material replenishment alerts, and inventory deduction logs.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-indigo-700">
                    <span>Check Stock Levels</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </>
            )}

            {/* If BILLING */}
            {role === 'BILLING' && (
              <div
                onClick={() => onNavigate('BILLING_DESK')}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between space-y-3 sm:col-span-2"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Billing Desk & Milestone GST Invoices</h4>
                  <p className="text-xs text-slate-500">
                    Manage client payment stages (30% Advance, 40% Fabrication, 20% Delivery, 10% Handover) and generate 18% CGST/SGST official tax invoices.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-emerald-700">
                  <span>Open Billing Desk</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* If ACCOUNTS */}
            {isAccounts && (
              <>
                <div
                  onClick={() => onNavigate('ACCOUNTS_MATERIAL_REQUISITION')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-cyan-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Material Requisitions Clearance</h4>
                    <p className="text-xs text-slate-500">
                      Audit on-site material requests, budget sanctions, and supplier payment dispatches.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-cyan-700">
                    <span>Open Clearance Desk</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div
                  onClick={() => onNavigate('PURCHASE_BUCKET')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Purchase Requisitions Bucket</h4>
                    <p className="text-xs text-slate-500">
                      Reply directly to project WhatsApp groups with live procurement statuses and estimated dispatch dates.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-amber-700">
                    <span>Open Purchase Bucket</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </>
            )}

            {/* If STOCKS */}
            {role === 'STOCKS' && (
              <div
                onClick={() => onNavigate('STOCKS_INVENTORY')}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between space-y-3 sm:col-span-2"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Warehouse Stocks & Raw Materials Inventory</h4>
                  <p className="text-xs text-slate-500">
                    Real-time balances of Cast Acrylic, MS Pipes, LED Modules, ACP Sheets, and Vinyl. Automatic inventory deduction on project dispatches.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-indigo-700">
                  <span>Open Warehouse Inventory</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* If SITE_SUPERVISOR */}
            {isSiteSupervisor && (
              <>
                <div
                  onClick={() => onNavigate('SITE_SUPERVISOR_PORTAL')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Site Supervisor Execution Hub</h4>
                    <p className="text-xs text-slate-500">
                      Daily shift check-ins, contractor team headcount, snag list updates, and live site material requests.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-blue-700">
                    <span>Open Field Portal</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div
                  onClick={() => onNavigate('MY_ATTENDANCE')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-rose-400 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Daily Attendance Punch</h4>
                    <p className="text-xs text-slate-500">
                      Live camera GPS selfie attendance punch-in & punch-out for field shift verification.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-rose-700">
                    <span>Mark Daily Punch</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Executive Portal Overview & PPT Deck Quick Access Banner */}
      {onOpenPresentation && (
        <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Operations Audit & PPT Deck
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Complete Portal Explanation · Role Breakdown · Roadmap Gaps
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                Executive Portal Presentation & Role Performance Scorecard
              </h3>
              <p className="text-xs text-slate-400">
                Interactive slide deck explaining what is done per role, business benefits, and upcoming milestones.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenPresentation}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs"
          >
            <Presentation className="w-4 h-4" />
            <span>Open Presentation (PPT)</span>
          </button>
        </div>
      )}

      {/* Birthday Recognition Current Month Banner (Past months are strictly excluded) */}
      {todaysBirthdayEmps.length > 0 ? (
        <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Birthday Today
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {todaysBirthdayEmps.length} Employee{todaysBirthdayEmps.length > 1 ? 's' : ''} ({currentMonthName})
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                {todaysBirthdayEmps.map(e => e.name).join(', ')} has a birthday today
              </h3>
              <p className="text-xs text-slate-400">
                Send team greetings and best wishes to your colleague.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenBirthdayModal}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Send Best Wishes</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : currentMonthBirthdays.length > 0 ? (
        <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  {currentMonthName} Birthdays
                </span>
                <span className="text-xs text-slate-400">
                  {currentMonthBirthdays.length} Celebrant{currentMonthBirthdays.length > 1 ? 's' : ''} This Month
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                Upcoming: {currentMonthBirthdays.map(e => `${e.name} (${currentMonthName.slice(0, 3)} ${parseDateOfBirth(e.dateOfBirth)?.day})`).join(' · ')}
              </h3>
              <p className="text-xs text-slate-400">
                View colleagues celebrating birthdays in {currentMonthName}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenBirthdayModal}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>View {currentMonthName} Celebrations</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : null}

      {/* 3x Late Punch Reminder & Request Banner */}
      {hasLatePunchAlert && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-amber-950">
                  Punctuality Reminder: 3x Late Punch-Ins This Week
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-200 text-amber-900 border border-amber-300">
                  After {LATE_THRESHOLD_LABEL}
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-1 font-medium leading-relaxed">
                You have marked <strong>{latePunchesThisWeek.length} late punch-ins</strong> after {LATE_THRESHOLD_LABEL} this week. Please arrive and punch in on time to maintain required shift punctuality.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('MY_ATTENDANCE')}
            className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>View Attendance Log</span>
          </button>
        </div>
      )}
    </div>
  );
};

