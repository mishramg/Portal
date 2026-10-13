import React, { useState } from 'react';
import { WorkAssignment, UserAccount, SiteSupervisorOtp, DailySiteAssignment } from '../../types';
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
  UserCheck,
  Calendar,
  MapPin,
  HardHat,
  PlusCircle,
  Briefcase
} from 'lucide-react';

interface ProjectManagerWorkspaceProps {
  works: WorkAssignment[];
  users: UserAccount[];
  onUpdateWork: (updatedWork: WorkAssignment) => void;
  activeUser: UserAccount;
}

export const ProjectManagerWorkspace: React.FC<ProjectManagerWorkspaceProps> = ({
  works,
  users,
  onUpdateWork,
  activeUser
}) => {
  const [activeTab, setActiveTab] = useState<'ASSIGNMENTS' | 'OTP_DESK'>('ASSIGNMENTS');
  
  // New Daily Assignment form state
  const [selectedWorkId, setSelectedWorkId] = useState<string>(works[0]?.id || '');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState<string>('');
  const [assignmentDate, setAssignmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP Desk states
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterMode, setFilterMode] = useState<'PENDING_ONLY' | 'ALL_COMPANIES'>('PENDING_ONLY');
  const [copiedWorkId, setCopiedWorkId] = useState<string | null>(null);

  const siteSupervisors = users.filter(u => u.role === 'SITE_SUPERVISOR' || u.role === 'PROJECT_COORDINATOR');

  // Filter works eligible for assignment (completed or active)
  const eligibleWorks = works;

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const work = works.find(w => w.id === selectedWorkId);
    if (!work) return;

    const supObj = users.find(u => u.id === selectedSupervisorId) || siteSupervisors[0];
    if (!supObj) {
      alert('Please select a site supervisor for this assignment.');
      return;
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const phoneNum = supObj.phone || '+91 98765 43210';

    const newAssignment: DailySiteAssignment = {
      id: `assign_${Date.now()}`,
      date: assignmentDate,
      siteSupervisorId: supObj.id,
      siteSupervisorName: supObj.name,
      assignedBySupervisorName: activeUser.name,
      notes: assignmentNotes || 'Execute site work, daily punch-in, and EOD progress report.',
      assignmentOtpCode: generatedOtp,
      sentToPhone: phoneNum
    };

    const newOtpRecord: SiteSupervisorOtp = {
      id: `otp_${Date.now()}`,
      otpCode: generatedOtp,
      purpose: `Shift Site Assignment (${supObj.name} - ${work.clientCompanyName})`,
      generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'DISPATCHED',
      sentToPhone: phoneNum
    };

    const updatedAssignments = [newAssignment, ...(work.dailySiteAssignments || [])];
    const updatedOtps = [newOtpRecord, ...(work.siteSupervisorOtps || [])];

    const updatedWork: WorkAssignment = {
      ...work,
      supervisorOtpCode: generatedOtp,
      assignedSupervisorId: supObj.id,
      assignedSupervisorName: supObj.name,
      dailySiteAssignments: updatedAssignments,
      siteSupervisorOtps: updatedOtps,
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onUpdateWork(updatedWork);
    setAssignmentNotes('');
    setSuccessMessage(`Successfully assigned site "${work.clientCompanyName}" to ${supObj.name}! Shift OTP: ${generatedOtp}`);
    setTimeout(() => setSuccessMessage(null), 6000);
  };

  // OTP Desk logic
  const worksWithOtp = works.filter(w => w.supervisorOtpCode || (w.supervisorOtpRequests && w.supervisorOtpRequests.length > 0));

  const totalPendingRequests = works.reduce((acc, w) => {
    const pending = (w.supervisorOtpRequests || []).filter(r => r.status === 'PENDING').length;
    return acc + pending;
  }, 0);

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
    <div className="space-y-6">
      {/* Sub-tab Navigation for Project Manager */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('ASSIGNMENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'ASSIGNMENTS'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> Daily Site & Work Assignments
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('OTP_DESK')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
            activeTab === 'OTP_DESK'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Key className="w-4 h-4" /> OTP Dispatch Desk
          {totalPendingRequests > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {totalPendingRequests}
            </span>
          )}
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm">
          <span>{successMessage}</span>
          <Check className="w-4 h-4 text-emerald-400" />
        </div>
      )}

      {activeTab === 'ASSIGNMENTS' && (
        <div className="space-y-6">
          {/* Assignment Creation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>Assign Site & Work for the Day</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    6-DIGIT OTP AUTHORIZATION
                  </span>
                </h3>
              </div>
            </div>

            <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Select Project / Company</label>
                <select
                  value={selectedWorkId}
                  onChange={(e) => setSelectedWorkId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {eligibleWorks.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.clientCompanyName} ({w.workTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Assign Site Supervisor</label>
                <select
                  value={selectedSupervisorId}
                  onChange={(e) => setSelectedSupervisorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Site Supervisor --</option>
                  {siteSupervisors.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Assignment Date</label>
                <input
                  type="date"
                  value={assignmentDate}
                  onChange={(e) => setAssignmentDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" /> Generate Shift & OTP
                </button>
              </div>

              <div className="col-span-full space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Shift Notes & Special Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Inspect electrical conduits on 2nd floor, coordinate with interior team..."
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </form>
          </div>

          {/* Active Assignments List */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" /> Active Daily Site Assignments & Generated Shift OTPs
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {works.filter(w => w.dailySiteAssignments && w.dailySiteAssignments.length > 0).map(work => (
                work.dailySiteAssignments?.map(assignment => (
                  <div key={assignment.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md">
                            {assignment.date}
                          </span>
                          <h5 className="text-sm font-extrabold text-white mt-1">{work.clientCompanyName}</h5>
                          <p className="text-xs text-slate-400">{work.workTitle}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-mono font-bold bg-slate-950 text-amber-400 px-2.5 py-1 rounded-lg border border-slate-800">
                            OTP: {assignment.assignmentOtpCode || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Assigned To: <strong className="text-white">{assignment.siteSupervisorName}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                          <span>Phone: {assignment.sentToPhone || '+91 98765 43210'}</span>
                        </div>
                        {assignment.notes && (
                          <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-900">
                            "{assignment.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400">Assigned by {assignment.assignedBySupervisorName}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyOtp(assignment.id, assignment.assignmentOtpCode || '')}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {copiedWorkId === assignment.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedWorkId === assignment.id ? 'Copied OTP' : 'Copy OTP'}
                      </button>
                    </div>
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'OTP_DESK' && (
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 text-white rounded-2xl border-2 border-amber-500/40 shadow-lg overflow-hidden">
          {/* Section Header */}
          <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 border border-amber-400/30 text-amber-400 rounded-xl">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white tracking-tight">
                    Project Manager OTP Dispatch Desk
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
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 space-y-4 bg-slate-950/60">
            {displayedWorks.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400 space-y-2">
                <ShieldCheck className="w-8 h-8 text-amber-400/60 mx-auto" />
                <p className="text-xs font-bold text-slate-300">
                  {filterMode === 'PENDING_ONLY'
                    ? 'No pending OTP requests from site supervisors at this moment.'
                    : 'No active company OTPs generated yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedWorks.map((work) => {
                  const activeOtp = work.supervisorOtpCode || '849201';
                  const requests = work.supervisorOtpRequests || [];

                  return (
                    <div key={work.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-md border border-blue-500/30">
                              {work.clientCompanyName}
                            </span>
                            <h4 className="text-sm font-extrabold text-white mt-1.5">{work.workTitle}</h4>
                            <p className="text-xs text-slate-400">Brand: <strong className="text-slate-200">{work.brandName}</strong></p>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner">
                              <Key className="w-4 h-4 text-amber-400" />
                              <span className="text-sm font-mono font-black text-amber-400 tracking-wider">{activeOtp}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyOtp(work.id, activeOtp)}
                              className="text-[11px] text-amber-300 hover:text-white font-bold flex items-center gap-1 mt-1 ml-auto cursor-pointer"
                            >
                              {copiedWorkId === work.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              {copiedWorkId === work.id ? 'Copied' : 'Copy Code'}
                            </button>
                          </div>
                        </div>

                        {/* Supervisor Requests list */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Site Access Requests ({requests.length})
                          </h5>
                          {requests.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">No supervisor requests logged for this work yet.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {requests.map(req => (
                                <div key={req.id} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white">{req.requestedBySupervisorName}</span>
                                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                                        {req.requestedByRole}
                                      </span>
                                      <span className="text-slate-400 text-[10px]">{req.requestedAt}</span>
                                    </div>
                                    <div className="text-[11px] text-amber-300 font-mono">OTP Requested: {req.otpCode}</div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {req.status === 'PENDING' ? (
                                      <button
                                        type="button"
                                        onClick={() => handleMarkRequestShared(work, req.id)}
                                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1 shadow-xs"
                                      >
                                        <Send className="w-3 h-3" /> Mark Shared
                                      </button>
                                    ) : (
                                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/30">
                                        <Check className="w-3 h-3" /> Shared
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[11px]">Assigned CRM: {work.assignedCrmName || 'Not Assigned'}</span>
                        <button
                          type="button"
                          onClick={() => handleRegenerateOtp(work)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Regenerate New OTP
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
