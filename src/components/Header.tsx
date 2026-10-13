import React, { useState, useRef, useEffect } from 'react';
import { UserAccount, SystemNotification, CompanyProfile, UserRole } from '../types';
import { 
  Building2, 
  Bell, 
  Search, 
  UserCircle, 
  LogOut, 
  CheckCheck, 
  X,
  Database,
  Clock,
  MapPin,
  ExternalLink,
  Settings,
  Menu,
  Download,
  Home,
  ChevronDown,
  Check,
  Users,
  Shield,
  Briefcase,
  Palette,
  HardHat,
  Landmark,
  Key,
  Sparkles,
  Calendar,
  Presentation
} from 'lucide-react';

interface HeaderProps {
  activeUser: UserAccount;
  companyProfile: CompanyProfile;
  notifications: SystemNotification[];
  onMarkNotificationsRead: () => void;
  onNotificationClick?: (notif: SystemNotification) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOpenAttendancePunch?: () => void;
  onOpenSiteVisit?: () => void;
  onOpenCompanySettings?: () => void;
  onLogout?: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  onNavigateHome?: () => void;
  users?: UserAccount[];
  onSelectUser?: (user: UserAccount) => void;
  onOpenBirthdayModal?: () => void;
  onOpenPresentation?: () => void;
  todaysBirthdayCount?: number;
  currentMonthBirthdayCount?: number;
  currentMonthName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeUser,
  companyProfile,
  notifications,
  onMarkNotificationsRead,
  onNotificationClick,
  searchTerm,
  onSearchChange,
  onOpenAttendancePunch,
  onOpenSiteVisit,
  onOpenCompanySettings,
  onLogout,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
  onNavigateHome,
  users = [],
  onSelectUser,
  onOpenBirthdayModal,
  onOpenPresentation,
  todaysBirthdayCount = 0,
  currentMonthBirthdayCount = 0,
  currentMonthName = ''
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [accountSearchTerm, setAccountSearchTerm] = useState('');
  const [systemTime, setSystemTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifDropdown(false);
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'Owner / Admin';
      case 'SUB_ADMIN': return 'Sub-Admin (Ops)';
      case 'CRM_EMPLOYEE': return 'CRM Manager';
      case 'PROJECT_MANAGER': return 'Project Manager';
      case 'DESIGNER': return 'Graphic / 3D Designer';
      case 'SR_DESIGNER':
      case 'SENIOR_DESIGNER': return 'Senior Designer Lead';
      case 'PROJECT_COORDINATOR': return 'Project Coordinator';
      case 'SITE_SUPERVISOR': return 'Site Supervisor';
      case 'HR': return 'HR & Attendance Lead';
      case 'ACCOUNTS': return 'Accounts & Finance';
      case 'PURCHASE': return 'Purchase Manager';
      case 'FACILITY_MANAGER': return 'Facility Manager';
      case 'VENDOR_MANAGER': return 'Vendor Manager';
      case 'IT_PERSON': return 'IT Person (Systems)';
      default: return String(role).replace(/_/g, ' ');
    }
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'SUB_ADMIN': return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'CRM_EMPLOYEE': return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'PROJECT_MANAGER': return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'DESIGNER':
      case 'SR_DESIGNER':
      case 'SENIOR_DESIGNER': return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'PROJECT_COORDINATOR': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'SITE_SUPERVISOR': return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'HR': return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'ACCOUNTS': return 'bg-teal-100 text-teal-900 border-teal-300';
      case 'IT_PERSON': return 'bg-sky-100 text-sky-900 border-sky-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getRoleAvatarBg = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'bg-amber-600 text-white';
      case 'SUB_ADMIN': return 'bg-orange-600 text-white';
      case 'CRM_EMPLOYEE': return 'bg-blue-600 text-white';
      case 'PROJECT_MANAGER': return 'bg-yellow-600 text-white';
      case 'DESIGNER':
      case 'SR_DESIGNER':
      case 'SENIOR_DESIGNER': return 'bg-purple-600 text-white';
      case 'PROJECT_COORDINATOR': return 'bg-emerald-600 text-white';
      case 'SITE_SUPERVISOR': return 'bg-indigo-600 text-white';
      case 'HR': return 'bg-rose-600 text-white';
      case 'ACCOUNTS': return 'bg-teal-600 text-white';
      case 'IT_PERSON': return 'bg-slate-800 text-sky-300';
      default: return 'bg-slate-800 text-white';
    }
  };

  // Filter accounts in dropdown search safely without crashing
  const filteredUsers = users.filter(u => {
    if (!accountSearchTerm.trim()) return true;
    const term = accountSearchTerm.toLowerCase().trim();
    const nameMatch = (u.name || '').toLowerCase().includes(term);
    const emailMatch = (u.email || '').toLowerCase().includes(term);
    const codeMatch = (u.employeeCode || '').toLowerCase().includes(term);
    const roleMatch = (u.role || '').toLowerCase().includes(term);
    const roleLabelMatch = getRoleLabel(u.role).toLowerCase().includes(term);
    const deptMatch = (u.department || '').toLowerCase().includes(term);
    const phoneMatch = (u.phone || '').toLowerCase().includes(term);
    const desigMatch = (u.designation || '').toLowerCase().includes(term);
    return Boolean(nameMatch || emailMatch || codeMatch || roleMatch || roleLabelMatch || deptMatch || phoneMatch || desigMatch);
  });

  // Filter notifications strictly for the active user's role/function
  const userNotifications = notifications.filter((n) => {
    // 1. Target specific user ID takes precedence
    if (n.targetUserId) {
      return n.targetUserId === activeUser.id;
    }

    // 2. Admins see everything except messages specifically targeted to another user ID
    if (activeUser.role === 'ADMIN' || activeUser.role === 'SUB_ADMIN') {
      return true;
    }

    // 3. ADMIN_ONLY notifications are hidden from all non-admin users
    if (n.targetRole === 'ADMIN_ONLY') {
      return false;
    }

    // 4. Target ALL is visible to everyone
    if (n.targetRole === 'ALL') {
      return true;
    }

    // 5. Target specific role
    if (n.targetRole) {
      return n.targetRole === activeUser.role;
    }

    // 6. Type-based default fallback
    if (n.type === 'LEAD' || n.type === 'QUOTE') {
      return activeUser.role === 'CRM_EMPLOYEE';
    }
    if (n.type === 'REIMBURSEMENT' || n.type === 'MATERIAL_REQUISITION') {
      return activeUser.role === 'ACCOUNTS';
    }
    if (n.type === 'SITE_PUNCH') {
      return activeUser.role === 'HR';
    }
    if (n.type === 'OTP') {
      return activeUser.role === 'SITE_SUPERVISOR' || activeUser.role === 'PROJECT_COORDINATOR';
    }
    if (n.type === 'DESIGN') {
      return activeUser.role === 'DESIGNER';
    }

    return false;
  });

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs px-3 sm:px-4 lg:px-8 flex items-center justify-between">
      {/* Brand, CRM Title & Home Trigger */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2 sm:gap-3 text-left hover:opacity-90 transition-opacity cursor-pointer group"
          title="Go to Home Workspace"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-sm rounded-lg flex items-center justify-center shadow-xs overflow-hidden group-hover:ring-2 group-hover:ring-blue-500 transition-all">
            {companyProfile.logoUrl ? (
              <img src={companyProfile.logoUrl} alt={companyProfile.shortName} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            ) : (
              companyProfile.logoInitial || 'CO'
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide truncate max-w-[120px] sm:max-w-none group-hover:text-blue-600 transition-colors">
                {companyProfile.shortName} CRM Portal
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded uppercase items-center gap-1">
                <Database className="w-3 h-3 text-emerald-700" /> Live DB
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden md:block">
              {companyProfile.companyName} • {companyProfile.subtitle}
            </p>
          </div>
        </button>

        {onOpenCompanySettings && (activeUser.role === 'ADMIN' || activeUser.role === 'SUB_ADMIN') && (
          <button
            type="button"
            onClick={onOpenCompanySettings}
            className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-[10px] font-bold transition-colors cursor-pointer"
            title="Edit Company Profile & Details (GSTIN, Address, PAN, etc.)"
          >
            <Settings className="w-3 h-3 text-amber-700" />
            <span className="hidden sm:inline">Edit Company</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="flex-1 max-w-sm mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search clients, work orders, leads, site records..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Actions & Session Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live System Date & Time Clock Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse shrink-0" />
          <div className="flex flex-col text-left leading-none">
            <span className="text-[10.5px] font-black text-slate-800">
              {systemTime.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-500 mt-0.5">
              {systemTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </span>
          </div>
        </div>

        {/* Birthday Celebrations Button */}
        {onOpenBirthdayModal && (
          <button
            onClick={onOpenBirthdayModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 border ${
              todaysBirthdayCount > 0
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700 shadow-2xs'
                : currentMonthBirthdayCount > 0
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
            }`}
            title={`Employee Recognition (${currentMonthName || 'Current Month'})`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">
              {todaysBirthdayCount > 0 
                ? `Birthday Today (${todaysBirthdayCount})` 
                : currentMonthBirthdayCount > 0 
                  ? `${currentMonthName ? currentMonthName.slice(0, 3) : 'Month'} (${currentMonthBirthdayCount})` 
                  : 'Birthdays'}
            </span>
          </button>
        )}

        {/* Quick Punch In / Out Button */}
        {onOpenAttendancePunch && (
          <button
            onClick={onOpenAttendancePunch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-black transition-all cursor-pointer shadow-2xs shrink-0"
            title="Open Daily Attendance Punch In/Out Desk"
          >
            <Clock className="w-3.5 h-3.5 text-rose-600 animate-pulse shrink-0" />
            <span className="font-extrabold text-[11px] sm:text-xs">Attendance</span>
          </button>
        )}

        {/* Quick Site Log Button in Header */}
        {onOpenSiteVisit && (
          <button
            onClick={onOpenSiteVisit}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
            title="Open Site Visit & GPS Field Log"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">Site Log</span>
          </button>
        )}

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          {showNotifDropdown && (
            <div 
              className="fixed inset-0 z-40 bg-black/5 sm:bg-transparent" 
              onClick={() => setShowNotifDropdown(false)} 
            />
          )}
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-700" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    My Notifications ({userNotifications.length})
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkNotificationsRead}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark Read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {userNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No work notifications for your role.
                  </div>
                ) : (
                  userNotifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        if (onNotificationClick) {
                          onNotificationClick(n);
                        }
                        setShowNotifDropdown(false);
                      }}
                      className={`w-full text-left p-3 text-xs transition-all hover:bg-blue-50/80 cursor-pointer flex flex-col gap-1.5 ${
                        !n.read ? 'bg-blue-50/50 font-medium' : 'bg-white text-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 animate-pulse" />}
                          <span className="font-bold text-slate-900">{n.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          {n.timestamp}
                        </span>
                      </div>

                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-end gap-1 text-[10px] font-extrabold text-blue-600 pt-0.5">
                        <span>Click to open section</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* Profile Avatar Button & Dropdown on the Right */}
        <div className="relative" ref={profileRef}>
          {showProfileDropdown && (
            <div 
              className="fixed inset-0 z-40 bg-black/5 sm:bg-transparent" 
              onClick={() => setShowProfileDropdown(false)} 
            />
          )}
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer group shadow-2xs"
            title="Profile & Switch Account"
          >
            <div className={`w-8 h-8 rounded-full ${getRoleAvatarBg(activeUser.role)} font-black text-xs flex items-center justify-center uppercase shadow-2xs group-hover:scale-105 transition-transform`}>
              {activeUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-extrabold text-slate-800 leading-tight flex items-center gap-1">
                <span className="truncate max-w-[110px]">{activeUser.name}</span>
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                {getRoleLabel(activeUser.role).split(' ')[0]}
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform ${showProfileDropdown ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {/* Profile & Switch Account Dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {/* Active User Card Header */}
              <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${getRoleAvatarBg(activeUser.role)} font-black text-sm flex items-center justify-center uppercase shadow-md ring-2 ring-white/20`}>
                      {activeUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        <span>{activeUser.name}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Active Session" />
                      </div>
                      <div className="text-xs text-slate-300 font-mono flex items-center gap-1.5 flex-wrap">
                        {activeUser.employeeCode && (
                          <span className="bg-slate-800 text-blue-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {activeUser.employeeCode}
                          </span>
                        )}
                        <span className="text-slate-400">{activeUser.email}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getRoleBadgeStyle(activeUser.role)}`}>
                    {getRoleLabel(activeUser.role)}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                  <span>Dept: <strong className="text-white">{activeUser.department || 'General Operations'}</strong></span>
                  <span className="text-emerald-400 font-bold">● Active Session</span>
                </div>
              </div>

              {/* Switch Account Section */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Switch Account ({users.length})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">1-Click Switch</span>
                </div>

                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search employee by name, code, role..."
                    value={accountSearchTerm}
                    onChange={(e) => setAccountSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-2xs"
                  />
                  {accountSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setAccountSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 divide-y divide-slate-100/50 pr-0.5">
                  {filteredUsers.length === 0 ? (
                    <div className="py-6 px-3 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1.5">
                      <Users className="w-5 h-5 text-slate-300" />
                      <p className="font-bold text-slate-600">No matching employees</p>
                      <p className="text-[11px] text-slate-400">
                        No results for "{accountSearchTerm}". Try name, role, or ID code.
                      </p>
                    </div>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelected = u.id === activeUser.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            if (onSelectUser) {
                              onSelectUser(u);
                            }
                            setShowProfileDropdown(false);
                            setAccountSearchTerm('');
                          }}
                          className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between gap-2.5 cursor-pointer pt-1.5 pb-1.5 ${
                            isSelected
                              ? 'bg-blue-50 border border-blue-200 text-blue-950 font-bold shadow-2xs'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg ${getRoleAvatarBg(u.role)} font-bold text-xs flex items-center justify-center shrink-0 uppercase`}>
                              {u.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate leading-snug text-slate-900 flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u.employeeCode && (
                                  <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1 py-0.2 rounded font-semibold shrink-0">
                                    {u.employeeCode}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate font-medium">
                                {getRoleLabel(u.role)} • {u.department || 'Operations'}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            {isSelected ? (
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                Switch
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-2 space-y-0.5 bg-white border-b border-slate-100">
                {onOpenPresentation && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onOpenPresentation();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Presentation className="w-4 h-4 text-blue-600" />
                    <span>Executive Portal Overview (PPT Deck)</span>
                  </button>
                )}

                {onOpenAttendancePunch && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onOpenAttendancePunch();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-rose-500" />
                    <span>Daily Attendance Punch In / Out</span>
                  </button>
                )}

                {onOpenCompanySettings && (activeUser.role === 'ADMIN' || activeUser.role === 'SUB_ADMIN') && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onOpenCompanySettings();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-amber-600" />
                    <span>Company Profile & Master Settings</span>
                  </button>
                )}
              </div>

              {/* Logout Footer */}
              {onLogout && (
                <div className="p-2 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-100/70 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of Session</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
