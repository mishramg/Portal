import React from 'react';
import { WorkAssignment, ClientCompany, Lead, UserAccount } from '../../types';
import { 
  Building2, 
  Briefcase, 
  FileCheck2, 
  FileSpreadsheet, 
  HardHat, 
  Users, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  PlusCircle, 
  MapPin, 
  Key,
  Send
} from 'lucide-react';

interface AdminDashboardProps {
  works: WorkAssignment[];
  clients: ClientCompany[];
  leads: Lead[];
  users: UserAccount[];
  activeUser?: UserAccount;
  onNavigateTab: (tab: any) => void;
  onNewWorkClick: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  works,
  clients,
  leads,
  users,
  activeUser,
  onNavigateTab,
  onNewWorkClick
}) => {
  const isAdmin = activeUser?.role === 'ADMIN';
  const totalClients = clients.length;
  const pendingLeads = leads.filter((l) => l.status === 'PENDING_APPROVAL').length;
  const activeWorksCount = works.filter((w) => !w.crmCompleted).length;
  const completedWorksCount = works.filter((w) => w.crmCompleted).length;

  const totalQuoteVolume = works.reduce(
    (sum, w) => sum + (w.quotation?.totalAmount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
              Executive Control Portal
            </span>
            <span className="text-xs text-slate-400 font-mono">Unified Database Active</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight uppercase flex flex-wrap items-center gap-3">
            <span>Operations & Site Pipeline Overview</span>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-500/30 font-mono">
              EXECUTIVE CONTROL • DASHBOARD
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigateTab('USER_MANAGEMENT')}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 uppercase tracking-wide cursor-pointer transition-colors border border-slate-700"
          >
            <Users className="w-4 h-4 text-blue-400" /> Staff Credentials
          </button>

          <button
            onClick={onNewWorkClick}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 uppercase tracking-wide cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" /> Submit New Lead
          </button>
        </div>
      </div>

      {/* High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Clients</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{totalClients}</div>
          <p className="text-[11px] text-slate-400 font-medium">Stored in master client directory</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Assignments</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{activeWorksCount}</div>
          <p className="text-[11px] text-indigo-600 font-semibold uppercase tracking-wide">In CRM Steps A-I</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Leads</span>
            <FileCheck2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{pendingLeads}</div>
          <p className="text-[11px] text-amber-700 font-semibold uppercase tracking-wide">Awaiting Admin Approval</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Quote Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          {isAdmin ? (
            <>
              <div className="text-xl font-black text-emerald-800 tracking-tight">
                ₹{totalQuoteVolume.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wide">Real Estate Ad & Works Format</p>
            </>
          ) : (
            <>
              <div className="text-sm font-extrabold text-slate-400 py-1 flex items-center gap-1.5 font-mono">
                <span>🔒 Confidential</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Amount figures hidden (Admin Only)</p>
            </>
          )}
        </div>
      </div>

      {/* Role Pipeline Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Work Pipeline */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" /> Live Work Assignments Pipeline
            </h3>
            <button
              onClick={() => onNavigateTab('CRM_WORKFLOW')}
              className="text-[10px] text-blue-600 font-bold uppercase tracking-wider hover:underline"
            >
              View Full Pipeline →
            </button>
          </div>

          <div className="space-y-3">
            {works.map((w) => (
              <div
                key={w.id}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">{w.workTitle}</div>
                    <div className="text-slate-500 font-semibold uppercase text-[11px] mt-0.5">{w.clientCompanyName} ({w.brandName})</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      w.crmCompleted ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}
                  >
                    {w.crmCompleted ? 'Supervisor Phase' : w.currentStep.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-[11px] text-slate-600 border-t border-slate-200/80 pt-2 font-medium">
                  <span>CRM Exec: <strong className="text-slate-900">{w.assignedCrmName}</strong></span>
                  {w.supervisorOtpCode && (
                    <span className="text-amber-800 font-mono font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Supervisor OTP: {w.supervisorOtpCode}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Employee Accounts Sidebar Panel */}
        <div className="lg:col-span-4 bg-slate-900 text-white rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" /> Team Directory ({users.length})
              </h3>
              <button
                onClick={() => onNavigateTab('USER_MANAGEMENT')}
                className="text-[10px] text-blue-400 font-bold uppercase tracking-wider hover:underline"
              >
                Manage →
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {users.map((u) => (
                <div key={u.id} className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/80 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{u.name}</span>
                      <span className="text-[9px] font-mono text-blue-400 font-bold">{u.employeeCode || `EMP-2026`}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">{u.designation || u.department || u.email}</div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('USER_MANAGEMENT')}
                    className="bg-blue-600/90 hover:bg-blue-500 text-white font-bold px-2 py-1 rounded text-[9px] uppercase tracking-wider cursor-pointer transition-colors shrink-0"
                    title={`Inspect ${u.name}'s account and assigned works`}
                  >
                    Inspect Works
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400">
            <span className="font-bold text-slate-300 uppercase block mb-1">System Environment</span>
            <p className="leading-relaxed">Connected to Cloud Run container & One Drive folder storage sync.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
