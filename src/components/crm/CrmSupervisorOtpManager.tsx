import React, { useState } from 'react';
import { WorkAssignment, SupervisorOtpRequest } from '../../types';
import { 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  Smartphone, 
  Building2, 
  Bell, 
  Send,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  UserCheck
} from 'lucide-react';

interface CrmSupervisorOtpManagerProps {
  works: WorkAssignment[];
  onUpdateWork: (updatedWork: WorkAssignment) => void;
}

export const CrmSupervisorOtpManager: React.FC<CrmSupervisorOtpManagerProps> = ({
  works,
  onUpdateWork
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterMode, setFilterMode] = useState<'PENDING_ONLY' | 'ALL_COMPANIES'>('PENDING_ONLY');
  const [copiedWorkId, setCopiedWorkId] = useState<string | null>(null);

  // Get all works that have either supervisor requests or an active OTP code
  const worksWithOtp = works.filter(w => w.supervisorOtpCode || (w.supervisorOtpRequests && w.supervisorOtpRequests.length > 0));

  // Count total pending requests
  const totalPendingRequests = works.reduce((acc, w) => {
    const pending = (w.supervisorOtpRequests || []).filter(r => r.status === 'PENDING').length;
    return acc + pending;
  }, 0);

  // Filter works based on filterMode
  const displayedWorks = filterMode === 'PENDING_ONLY'
    ? worksWithOtp.filter(w => (w.supervisorOtpRequests || []).some(r => r.status === 'PENDING'))
    : worksWithOtp;

  const handleCopyOtp = (workId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedWorkId(workId);
    setTimeout(() => setCopiedWorkId(null), 2000);
  };

  const handleRegenerateOtp = (work: WorkAssignment) => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const updatedWork: WorkAssignment = {
      ...work,
      supervisorOtpCode: newCode
    };
    onUpdateWork(updatedWork);
  };

  const handleMarkRequestShared = (work: WorkAssignment, requestId: string) => {
    const updatedRequests = (work.supervisorOtpRequests || []).map(r => 
      r.id === requestId ? { ...r, status: 'SHARED' as const } : r
    );
    const updatedWork: WorkAssignment = {
      ...work,
      supervisorOtpRequests: updatedRequests
    };
    onUpdateWork(updatedWork);
  };

  return (
    <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 text-white rounded-2xl border-2 border-amber-500/40 shadow-lg overflow-hidden my-4">
      {/* Section Header */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 border border-amber-400/30 text-amber-400 rounded-xl">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Project Manager OTP Dispatch Portal
              </h3>
              {totalPendingRequests > 0 && (
                <span className="bg-rose-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1 shadow-sm">
                  <Bell className="w-3 h-3" /> {totalPendingRequests} Pending Request{totalPendingRequests > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs text-amber-200/80 font-medium">
              View & dispatch 6-digit site access OTP codes for specific company accounts requested by Site Supervisors
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700 flex items-center gap-1 text-xs w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={() => setFilterMode('PENDING_ONLY')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center text-xs ${
                filterMode === 'PENDING_ONLY'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Pending ({totalPendingRequests})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('ALL_COMPANIES')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-center text-xs ${
                filterMode === 'ALL_COMPANIES'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All OTPs ({worksWithOtp.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 rounded-xl border border-slate-700 cursor-pointer flex items-center justify-center"
            title={isExpanded ? 'Collapse section' : 'Expand section'}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Content View */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4 bg-slate-950/60">
          {displayedWorks.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400 space-y-2">
              <ShieldCheck className="w-8 h-8 text-amber-400/60 mx-auto" />
              <p className="text-xs font-bold text-slate-300">
                {filterMode === 'PENDING_ONLY'
                  ? 'No pending OTP requests from site supervisors at this moment.'
                  : 'No active company OTPs generated yet.'}
              </p>
              <p className="text-[11px] text-slate-500">
                When site supervisors or supervisors click "Request OTP from CRM Exec", their request and company details will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedWorks.map((work) => {
                const requests = work.supervisorOtpRequests || [];
                const pendingRequests = requests.filter(r => r.status === 'PENDING');
                const otpCode = work.supervisorOtpCode || '849201';
                const isCopied = copiedWorkId === work.id;

                return (
                  <div 
                    key={work.id}
                    className={`bg-slate-900/90 rounded-xl p-4 border transition-all space-y-3 ${
                      pendingRequests.length > 0 
                        ? 'border-amber-500/80 shadow-lg shadow-amber-500/10' 
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Company Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-extrabold uppercase tracking-wide">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{work.clientCompanyName}</span>
                        </div>
                        <h4 className="text-sm font-black text-white">{work.brandName}</h4>
                        <p className="text-[11px] text-slate-400 font-medium truncate">
                          Work Title: {work.workTitle} | CRM Exec: <strong className="text-slate-200">{work.assignedCrmName}</strong>
                        </p>
                      </div>

                      {pendingRequests.length > 0 && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                          {pendingRequests.length} Request{pendingRequests.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Supervisor Request Logs */}
                    {requests.length > 0 && (
                      <div className="space-y-1.5 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Supervisor Requests Log</span>
                          <span>Timestamp</span>
                        </div>
                        {requests.slice(0, 3).map((req) => (
                          <div key={req.id} className="flex items-center justify-between gap-2 text-[11px] py-1 border-t border-slate-900">
                            <div className="flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="font-bold text-slate-200">{req.requestedBySupervisorName}</span>
                              <span className="text-[10px] text-slate-400">({req.requestedByRole.replace(/_/g, ' ')})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono">{req.requestedAt}</span>
                              {req.status === 'PENDING' ? (
                                <button
                                  type="button"
                                  onClick={() => handleMarkRequestShared(work, req.id)}
                                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded cursor-pointer transition-colors"
                                >
                                  Mark Shared
                                </button>
                              ) : (
                                <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-0.5">
                                  <UserCheck className="w-3 h-3" /> Shared
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* OTP Display & Action Bar */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">6-Digit Company OTP</div>
                        <div className="text-xl font-black font-mono text-amber-400 tracking-widest">
                          {otpCode}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyOtp(work.id, otpCode)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isCopied 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {isCopied ? 'Copied!' : 'Copy OTP'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRegenerateOtp(work)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 rounded-lg border border-slate-700 cursor-pointer transition-colors"
                          title="Generate new 6-digit OTP code"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
