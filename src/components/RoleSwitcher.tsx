import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types';
import { 
  Shield, 
  UserCheck, 
  Briefcase, 
  Palette, 
  HardHat, 
  MapPin, 
  Users, 
  Landmark, 
  Key, 
  ShoppingBag, 
  Building, 
  Truck,
  UserCircle2,
  ChevronDown,
  Laptop,
  Search,
  X
} from 'lucide-react';

interface RoleSwitcherProps {
  users: UserAccount[];
  activeUser: UserAccount;
  onSelectUser: (user: UserAccount) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ users, activeUser, onSelectUser }) => {
  const [quickSearch, setQuickSearch] = useState('');

  const displayUsers = users.filter(u => {
    if (!quickSearch.trim()) return true;
    const term = quickSearch.toLowerCase().trim();
    const nameMatch = (u.name || '').toLowerCase().includes(term);
    const codeMatch = (u.employeeCode || '').toLowerCase().includes(term);
    const roleMatch = (u.role || '').toLowerCase().includes(term);
    const roleLabelMatch = getRoleLabel(u.role).toLowerCase().includes(term);
    const deptMatch = (u.department || '').toLowerCase().includes(term);
    return Boolean(nameMatch || codeMatch || roleMatch || roleLabelMatch || deptMatch);
  });

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-3.5 h-3.5 text-amber-400" />;
      case 'SUB_ADMIN':
        return <UserCheck className="w-3.5 h-3.5 text-orange-400" />;
      case 'CRM_EMPLOYEE':
        return <Briefcase className="w-3.5 h-3.5 text-blue-400" />;
      case 'PROJECT_MANAGER':
        return <Key className="w-3.5 h-3.5 text-amber-300" />;
      case 'DESIGNER':
      case 'SR_DESIGNER':
      case 'SENIOR_DESIGNER':
        return <Palette className="w-3.5 h-3.5 text-purple-400" />;
      case 'STRUCTURE_DESIGNER':
        return <Building className="w-3.5 h-3.5 text-blue-400" />;
      case 'PROJECT_COORDINATOR':
        return <HardHat className="w-3.5 h-3.5 text-emerald-400" />;
      case 'SITE_SUPERVISOR':
        return <MapPin className="w-3.5 h-3.5 text-indigo-400" />;
      case 'HR':
        return <Users className="w-3.5 h-3.5 text-rose-400" />;
      case 'ACCOUNTS':
        return <Landmark className="w-3.5 h-3.5 text-cyan-400" />;
      case 'PURCHASE':
        return <ShoppingBag className="w-3.5 h-3.5 text-yellow-400" />;
      case 'BILLING':
        return <Landmark className="w-3.5 h-3.5 text-emerald-400" />;
      case 'STOCKS':
        return <Building className="w-3.5 h-3.5 text-amber-400" />;
      case 'FACILITY_MANAGER':
        return <Building className="w-3.5 h-3.5 text-sky-400" />;
      case 'VENDOR_MANAGER':
        return <Truck className="w-3.5 h-3.5 text-orange-400" />;
      case 'IT_PERSON':
        return <Laptop className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Briefcase className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'SUB_ADMIN':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'CRM_EMPLOYEE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'PROJECT_MANAGER':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'DESIGNER':
      case 'SR_DESIGNER':
      case 'SENIOR_DESIGNER':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'STRUCTURE_DESIGNER':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'PROJECT_COORDINATOR':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'SITE_SUPERVISOR':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'HR':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'ACCOUNTS':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'PURCHASE':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'BILLING':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'STOCKS':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'FACILITY_MANAGER':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'VENDOR_MANAGER':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'IT_PERSON':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'Owner / Admin';
      case 'SUB_ADMIN': return 'Sub-Admin (Ops)';
      case 'CRM_EMPLOYEE': return 'CRM Manager';
      case 'PROJECT_MANAGER': return 'Project Manager';
      case 'DESIGNER': return 'Graphic / 3D Designer';
      case 'SR_DESIGNER':
      case 'SENIOR_DESIGNER': return 'Senior Designer Lead';
      case 'STRUCTURE_DESIGNER': return 'Structure Designer';
      case 'PROJECT_COORDINATOR': return 'Project Coordinator';
      case 'SITE_SUPERVISOR': return 'Field Site Supervisor';
      case 'HR': return 'HR & Attendance Lead';
      case 'ACCOUNTS': return 'Accounts & Finance';
      case 'PURCHASE': return 'Purchase Manager';
      case 'BILLING': return 'Billing Lead';
      case 'STOCKS': return 'Stocks & Warehouse';
      case 'FACILITY_MANAGER': return 'Facility Manager';
      case 'VENDOR_MANAGER': return 'Vendor Manager';
      case 'IT_PERSON': return 'IT Person (Systems)';
      default: return role;
    }
  };

  return (
    <div className="bg-slate-950 text-white px-3 sm:px-4 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs select-none relative z-30">
      {/* Mobile Selector Dropdown */}
      <div className="flex md:hidden items-center justify-between w-full gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-extrabold text-slate-400 uppercase text-[9px] shrink-0">Switch Account:</span>
          <select
            value={activeUser.id}
            onChange={(e) => {
              const targetUser = users.find(u => u.id === e.target.value);
              if (targetUser) onSelectUser(targetUser);
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none max-w-[170px] truncate"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id} className="bg-slate-950 text-slate-200">
                {u.name} ({getRoleLabel(u.role)})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[10px] shrink-0">
          <span className="font-bold text-slate-200 truncate max-w-[90px]">{activeUser.name.split(' ')[0]}</span>
          <span className="text-blue-400 font-mono text-[8px] uppercase">{activeUser.role.split('_')[0]}</span>
        </div>
      </div>

      {/* Desktop Horizontal All Accounts Quick Switcher Bar */}
      <div className="hidden md:flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar touch-pan-x w-full md:w-auto">
        <div className="flex items-center gap-1.5 shrink-0 bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 rounded-md">
          <UserCircle2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-extrabold tracking-wider text-blue-200 uppercase text-[10px]">
            Switch Account:
          </span>
        </div>

        {/* Quick Search in Bar */}
        <div className="relative shrink-0 flex items-center">
          <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search employee..."
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-md pl-6 pr-5 py-0.5 text-[11px] text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-32 focus:w-44 transition-all"
          />
          {quickSearch && (
            <button
              type="button"
              onClick={() => setQuickSearch('')}
              className="absolute right-1 text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {displayUsers.length === 0 ? (
            <span className="text-[11px] text-slate-400 italic px-2">No employee matches "{quickSearch}"</span>
          ) : (
            displayUsers.map((u) => {
              const isActive = u.id === activeUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => onSelectUser(u)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all border text-xs cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold border-blue-400 shadow-sm ring-1 ring-blue-400/50'
                      : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-800'
                  }`}
                  title={`Switch active portal account to ${u.name} (${getRoleLabel(u.role)})`}
                >
                  {getRoleIcon(u.role)}
                  <span className="font-semibold text-[11px]">{u.name}</span>
                  <span className={`text-[8px] px-1 py-0.2 rounded border uppercase font-mono font-bold ${getRoleBadgeStyle(u.role)}`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active Session Indicator (Desktop) */}
      <div className="hidden md:flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0 text-[11px]">
        <span className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Logged In:</span>
        <span className="font-bold text-slate-100">{activeUser.name}</span>
        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getRoleBadgeStyle(activeUser.role)}`}>
          {getRoleLabel(activeUser.role)}
        </span>
      </div>
    </div>
  );
};

