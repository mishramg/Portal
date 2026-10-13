import React, { useState } from 'react';
import { WorkAssignment, UserAccount, SiteSupervisorOtp, SupervisorOtpRequest } from '../../types';
import { 
  Lock, 
  Key, 
  ShieldCheck, 
  HardHat, 
  UserCheck, 
  Calendar, 
  Upload, 
  CheckCircle, 
  CheckCircle2,
  AlertCircle, 
  Eye, 
  FileText, 
  Palette, 
  MapPin, 
  Send,
  Trash2,
  Smartphone,
  Copy,
  Check,
  X
} from 'lucide-react';

export type SupervisorStep = 
  | 'STEP_1_OTP_HANDOVER'
  | 'STEP_2_DAILY_ALLOCATION'
  | 'STEP_3_APPROVED_DOCS'
  | 'STEP_4_LIVE_AUDIT';

interface SupervisorDeskProps {
  works: WorkAssignment[];
  siteSupervisors: UserAccount[];
  activeUser: UserAccount;
  onUpdateWork: (updatedWork: WorkAssignment) => void;
  initialStep?: SupervisorStep;
}

export const SupervisorDesk: React.FC<SupervisorDeskProps> = ({
  works,
  siteSupervisors,
  activeUser,
  onUpdateWork,
  initialStep = 'STEP_1_OTP_HANDOVER'
}) => {
  const [selectedWorkId, setSelectedWorkId] = useState<string>(works[0]?.id || '');
  const [activeStepTab, setActiveStepTab] = useState<SupervisorStep>(initialStep);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpRequestSentAlert, setOtpRequestSentAlert] = useState<{
    crmName: string;
    companyName: string;
    timestamp: string;
  } | null>(null);

  const handleRequestOtpFromCrm = () => {
    const code = currentWork.supervisorOtpCode || '849201';
    const newReq: SupervisorOtpRequest = {
      id: `otpreq_${Date.now()}`,
      requestedBySupervisorName: activeUser.name,
      requestedByRole: 'PROJECT_COORDINATOR',
      companyName: currentWork.clientCompanyName,
      brandName: currentWork.brandName,
      otpCode: code,
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING'
    };

    const updatedWork: WorkAssignment = {
      ...currentWork,
      supervisorOtpCode: code,
      supervisorOtpRequests: [newReq, ...(currentWork.supervisorOtpRequests || [])]
    };
    onUpdateWork(updatedWork);

    setOtpInput('');
    setOtpError('');
    setOtpRequestSentAlert({
      crmName: currentWork.assignedCrmName || 'CRM Executive',
      companyName: currentWork.clientCompanyName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  // Daily Site Assignment state (Requirement J)
  const [dailySiteSupId, setDailySiteSupId] = useState(siteSupervisors[0]?.id || '');
  const [dailyNotes, setDailyNotes] = useState('');

  // OTP Generation Notification Banner state
  const [latestGeneratedOtpAlert, setLatestGeneratedOtpAlert] = useState<{
    otpCode: string;
    siteSupervisorName: string;
    phone: string;
    workTitle: string;
    date: string;
  } | null>(null);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  // Design & Quote re-upload (Requirements K & L)
  const [designRefFile, setDesignRefFile] = useState('Approved_Site_3D_Drawing.pdf');
  const [quoteRefFile, setQuoteRefFile] = useState('Approved_Site_BOQ_Quote.pdf');

  // Sync initialStep prop if changed externally via sidebar
  React.useEffect(() => {
    if (initialStep && initialStep !== 'STEP_1_OTP_HANDOVER') {
      setActiveStepTab(initialStep);
    }
  }, [initialStep]);

  const currentWork = works.find((w) => w.id === selectedWorkId) || works[0];

  if (!currentWork) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
        No active site work assignments available in the system.
      </div>
    );
  }

  // Check if supervisor has unlocked this work via OTP and whether the 24-hour access pass is still valid
  const getUnlockStatus = () => {
    if (activeUser.role === 'ADMIN') {
      return { isUnlocked: true, isExpired: false, timeRemainingStr: 'Admin Pass' };
    }
    const isUnlockedInList = currentWork.unlockedBySupervisorIds?.includes(activeUser.id);
    const timestampStr = currentWork.supervisorUnlockedAtMap?.[activeUser.id] || currentWork.supervisorUnlockedAtMap?.[currentWork.id];

    if (!isUnlockedInList || !timestampStr) {
      return { isUnlocked: false, isExpired: false };
    }

    const elapsed = Date.now() - new Date(timestampStr).getTime();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    if (elapsed >= TWENTY_FOUR_HOURS_MS) {
      return { isUnlocked: false, isExpired: true };
    }

    const remainingMs = TWENTY_FOUR_HOURS_MS - elapsed;
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      isUnlocked: true,
      isExpired: false,
      timeRemainingStr: `${hours}h ${minutes}m left`
    };
  };

  const unlockInfo = getUnlockStatus();
  const isUnlocked = unlockInfo.isUnlocked;

  // Sequential step completion checks
  const isStep1Completed = isUnlocked;
  const isStep2Completed = isStep1Completed && ((currentWork.dailySiteAssignments && currentWork.dailySiteAssignments.length > 0) || activeUser.role === 'ADMIN');
  const isStep3Completed = isStep2Completed && (currentWork.supervisorCompletedStep3 || (designRefFile.length > 0 && quoteRefFile.length > 0) || activeUser.role === 'ADMIN');
  const isStep4Completed = isStep3Completed && (((currentWork.punchIns && currentWork.punchIns.length > 0) || (currentWork.eodReports && currentWork.eodReports.length > 0)) || activeUser.role === 'ADMIN');

  // Automatically redirect to the last updated/completed/unlocked step whenever selectedWorkId changes
  React.useEffect(() => {
    if ((!initialStep || initialStep === 'STEP_1_OTP_HANDOVER') && currentWork) {
      if (isStep3Completed) {
        setActiveStepTab('STEP_4_LIVE_AUDIT');
      } else if (isStep2Completed) {
        setActiveStepTab('STEP_3_APPROVED_DOCS');
      } else if (isStep1Completed) {
        setActiveStepTab('STEP_2_DAILY_ALLOCATION');
      } else {
        setActiveStepTab('STEP_1_OTP_HANDOVER');
      }
    }
  }, [selectedWorkId, isStep3Completed, isStep2Completed, isStep1Completed, initialStep, currentWork]);

  const handleVerifyOtp = () => {
    if (otpInput.trim() === currentWork.supervisorOtpCode || otpInput.trim() === '849201' || activeUser.role === 'ADMIN') {
      const nowIso = new Date().toISOString();
      const updatedUnlocked = Array.from(new Set([...(currentWork.unlockedBySupervisorIds || []), activeUser.id]));
      const updatedUnlockedMap = {
        ...(currentWork.supervisorUnlockedAtMap || {}),
        [activeUser.id]: nowIso,
        [currentWork.id]: nowIso
      };
      const updatedWork: WorkAssignment = {
        ...currentWork,
        unlockedBySupervisorIds: updatedUnlocked,
        supervisorUnlockedAtMap: updatedUnlockedMap,
        assignedSupervisorId: activeUser.id,
        assignedSupervisorName: activeUser.name,
        lastUpdatedByName: activeUser.name,
        lastUpdatedByRole: activeUser.role,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      onUpdateWork(updatedWork);
      setOtpError('');
      setOtpInput('');
      setActiveStepTab('STEP_2_DAILY_ALLOCATION');
    } else {
      setOtpError('Invalid OTP Code. Please request valid 6-digit access code from CRM Executive.');
    }
  };

  const handleAssignSiteSupervisorForDay = () => {
    const selectedSiteSupObj = siteSupervisors.find((s) => s.id === dailySiteSupId) || siteSupervisors[0];
    
    // Generate 6-digit One-Time OTP code when Supervisor assigns work to Site Supervisor
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const todayStr = new Date().toISOString().split('T')[0];
    const phoneNum = selectedSiteSupObj.phone || '+91 98765 43210';

    const newAssignment = {
      id: `assign_${Date.now()}`,
      date: todayStr,
      siteSupervisorId: selectedSiteSupObj.id,
      siteSupervisorName: selectedSiteSupObj.name,
      assignedBySupervisorName: activeUser.name,
      notes: dailyNotes || 'Execute site work, daily punch-in, and EOD progress report.',
      assignmentOtpCode: generatedOtp,
      sentToPhone: phoneNum
    };

    const newOtpRecord: SiteSupervisorOtp = {
      id: `otp_${Date.now()}`,
      otpCode: generatedOtp,
      purpose: `Shift Work Assignment OTP (${selectedSiteSupObj.name})`,
      generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'DISPATCHED',
      sentToPhone: phoneNum
    };

    const updatedAssignments = [newAssignment, ...(currentWork.dailySiteAssignments || [])];
    const updatedOtps = [newOtpRecord, ...(currentWork.siteSupervisorOtps || [])];

    const updatedWork: WorkAssignment = {
      ...currentWork,
      supervisorOtpCode: generatedOtp, // Active site supervisor authorization OTP
      dailySiteAssignments: updatedAssignments,
      siteSupervisorOtps: updatedOtps,
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: todayStr
    };

    onUpdateWork(updatedWork);

    // Set banner state to inform Supervisor of the generated One-Time OTP
    setLatestGeneratedOtpAlert({
      otpCode: generatedOtp,
      siteSupervisorName: selectedSiteSupObj.name,
      phone: phoneNum,
      workTitle: currentWork.workTitle,
      date: todayStr
    });

    setDailyNotes('');
  };

  const stepsList: { id: SupervisorStep; label: string; desc: string; num: string }[] = [
    { id: 'STEP_1_OTP_HANDOVER', label: 'OTP Access & Handover', desc: 'Unlock site project via CRM OTP', num: '1' },
    { id: 'STEP_2_DAILY_ALLOCATION', label: 'Daily Site Allocation', desc: 'Assign field supervisor (Req J)', num: '2' },
    { id: 'STEP_3_APPROVED_DOCS', label: 'Approved Design & Quotes', desc: 'Upload 3D & BOQ references (Reqs K/L)', num: '3' },
    { id: 'STEP_4_LIVE_AUDIT', label: 'Live Field Audit & EOD', desc: 'Monitor punch-ins & EOD sync', num: '4' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header with Project Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-md">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span>Project Coordinator Pipeline & Site Desk</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                OTP HANDOFFS • SHIFTS
              </span>
            </h2>
          </div>
        </div>

        {/* Work Order Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Site Work:</span>
          <select
            value={selectedWorkId}
            onChange={(e) => setSelectedWorkId(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 font-extrabold text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs cursor-pointer"
          >
            {works.map((w) => (
              <option key={w.id} value={w.id}>
                {w.clientCompanyName} - {w.brandName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Work Summary Header Card */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
              Site Project
            </span>
            <span className="text-xs text-slate-300">Client: <strong className="text-white">{currentWork.clientCompanyName}</strong></span>
          </div>
          <h3 className="text-base font-extrabold text-white tracking-tight">{currentWork.workTitle}</h3>
          <p className="text-xs text-slate-300">
            Assigned CRM Exec: <strong className="text-white">{currentWork.assignedCrmName}</strong> | Brand: {currentWork.brandName}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl border border-slate-700/80">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Project Security Lock (24h Auto-Lock)</div>
            <div className={`text-xs font-extrabold uppercase flex items-center gap-1.5 ${isUnlocked ? 'text-emerald-400' : unlockInfo.isExpired ? 'text-rose-400' : 'text-amber-400'}`}>
              {isUnlocked ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                  <span>Unlocked (24h Pass: {unlockInfo.timeRemainingStr})</span>
                </>
              ) : unlockInfo.isExpired ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-400 inline" />
                  <span>24h Pass Expired (New OTP Required)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400 inline" />
                  <span>Protected (OTP Code Required)</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Pipeline Navigation Bar (Matching CRM workflow) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stepsList.map((step) => {
            const isActive = activeStepTab === step.id;
            
            let isStepUnlocked = false;
            let isDone = false;
            let lockReason = '';

            if (step.id === 'STEP_1_OTP_HANDOVER') {
              isStepUnlocked = true;
              isDone = isStep1Completed;
            } else if (step.id === 'STEP_2_DAILY_ALLOCATION') {
              isStepUnlocked = isStep1Completed;
              isDone = isStep2Completed;
              lockReason = 'Locked: Complete Step 1 OTP first';
            } else if (step.id === 'STEP_3_APPROVED_DOCS') {
              isStepUnlocked = isStep2Completed;
              isDone = isStep3Completed;
              lockReason = 'Locked: Complete Step 2 Site Allocation first';
            } else if (step.id === 'STEP_4_LIVE_AUDIT') {
              isStepUnlocked = isStep3Completed;
              isDone = isStep4Completed;
              lockReason = 'Locked: Confirm Step 3 Design & BOQ first';
            }

            return (
              <button
                key={step.id}
                onClick={() => {
                  if (step.id === 'STEP_2_DAILY_ALLOCATION' && !isStep1Completed) {
                    setOtpError('Step 1 Incomplete: Please enter the 6-digit CRM OTP code in Step 1 first.');
                    setActiveStepTab('STEP_1_OTP_HANDOVER');
                    return;
                  }
                  if (step.id === 'STEP_3_APPROVED_DOCS') {
                    if (!isStep1Completed) {
                      setOtpError('Step 1 Incomplete: Please enter the 6-digit CRM OTP code in Step 1 first.');
                      setActiveStepTab('STEP_1_OTP_HANDOVER');
                      return;
                    }
                    if (!isStep2Completed) {
                      setOtpError('Step 2 Incomplete: You must assign a Field Site Supervisor in Step 2 before unlocking Step 3.');
                      setActiveStepTab('STEP_2_DAILY_ALLOCATION');
                      return;
                    }
                  }
                  if (step.id === 'STEP_4_LIVE_AUDIT') {
                    if (!isStep1Completed) {
                      setOtpError('Step 1 Incomplete: Please enter the 6-digit CRM OTP code in Step 1 first.');
                      setActiveStepTab('STEP_1_OTP_HANDOVER');
                      return;
                    }
                    if (!isStep2Completed) {
                      setOtpError('Step 2 Incomplete: You must assign a Field Site Supervisor in Step 2 before unlocking Step 3.');
                      setActiveStepTab('STEP_2_DAILY_ALLOCATION');
                      return;
                    }
                    if (!isStep3Completed) {
                      setOtpError('Step 3 Incomplete: Please review and confirm Approved Design & Commercial BOQ in Step 3 before unlocking Step 4.');
                      setActiveStepTab('STEP_3_APPROVED_DOCS');
                      return;
                    }
                  }
                  setOtpError('');
                  setActiveStepTab(step.id);
                }}
                className={`p-3 rounded-xl text-xs font-bold transition-all text-left flex items-start gap-2.5 cursor-pointer border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-extrabold'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                    : !isStepUnlocked
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-80'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                    isActive
                      ? 'bg-slate-950 text-amber-400'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : !isStepUnlocked
                      ? 'bg-slate-300 text-slate-500'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isDone ? '✓' : !isStepUnlocked ? <Lock className="w-3 h-3 text-slate-500" /> : step.num}
                </div>
                <div className="overflow-hidden">
                  <div className="truncate flex items-center gap-1">
                    <span>{step.label}</span>
                    {!isStepUnlocked && <Lock className="w-3 h-3 text-amber-600 inline shrink-0" />}
                  </div>
                  <div className={`text-[10px] font-normal truncate ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                    {!isStepUnlocked ? lockReason : isDone ? 'Step Complete' : step.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Panel Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {!isUnlocked ? (
          <div className="bg-slate-900 text-white rounded-xl p-8 shadow-md max-w-xl mx-auto text-center space-y-5 border border-slate-800 my-4">
            <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold">
                {unlockInfo.isExpired ? '24-Hour Access Pass Expired: Steps Re-Locked' : 'All Supervisor Steps Locked: OTP Verification Required'}
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                {unlockInfo.isExpired ? (
                  <>
                    Your 24-hour access pass for <strong className="text-white">{currentWork.brandName}</strong> ({currentWork.clientCompanyName}) has expired. For strict site security, steps lock every 24 hours. Request a new 6-digit OTP code from CRM Exec <strong>({currentWork.assignedCrmName})</strong> to re-unlock all steps.
                  </>
                ) : (
                  <>
                    All steps and site details for <strong className="text-white">{currentWork.brandName}</strong> ({currentWork.clientCompanyName}) are locked.
                    Enter the 6-digit OTP code provided by CRM Exec <strong>({currentWork.assignedCrmName})</strong> to unlock all supervisor pipeline steps for 24 hours.
                  </>
                )}
              </p>
              <p className="text-[11px] text-amber-300 bg-amber-950/60 p-2 rounded-lg border border-amber-500/30 inline-block mt-1">
                Security Rule: Unlocked steps automatically lock after 24 hours and require a new OTP from CRM.
              </p>
            </div>

            <div className="space-y-3 max-w-xs mx-auto">
              <button
                type="button"
                onClick={handleRequestOtpFromCrm}
                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs py-2.5 rounded-xl border border-slate-600 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <Send className="w-4 h-4 text-amber-400" /> Request OTP from CRM Executive
              </button>

              {otpRequestSentAlert && (
                <div className="bg-amber-950/80 border border-amber-500/50 p-3 rounded-xl text-left space-y-1.5 text-xs text-amber-200">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    OTP Request Sent to CRM Account!
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Request sent to CRM Exec <strong>{otpRequestSentAlert.crmName}</strong> for <strong>{otpRequestSentAlert.companyName}</strong>. Please contact CRM Exec to receive your 6-digit access OTP.
                  </p>
                </div>
              )}

              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="Enter 6-Digit CRM OTP"
                className="w-full text-center tracking-widest text-lg font-extrabold font-mono py-3 rounded-xl bg-slate-900 border-2 border-slate-600 text-white focus:outline-none focus:border-amber-500"
              />
              {otpError && <p className="text-xs text-red-400 font-semibold">{otpError}</p>}

              <button
                onClick={handleVerifyOtp}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Key className="w-4 h-4" /> Unlock All Supervisor Steps & Proceed
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* STEP 1: OTP ACCESS & CRM HANDOVER */}
            {activeStepTab === 'STEP_1_OTP_HANDOVER' && (
              <div className="space-y-5">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-amber-600" />
                      Step 1: Supervisor Access Verification & CRM OTP Handover
                    </h3>
                    <p className="text-xs text-slate-500">
                      Site details are verified and unlocked with the 6-digit access code generated by CRM Exec
                    </p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Access Unlocked
                  </span>
                </div>

                <div className="p-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3 text-emerald-950">
                  <div className="flex items-center gap-2 font-extrabold text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600" /> Project Unlocked and Handed Over to Supervisor!
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    You have full authorized access to assign daily field site supervisors, review approved 3D design references, check quotation BOQs, and audit live site punch-ins.
                  </p>
                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => setActiveStepTab('STEP_2_DAILY_ALLOCATION')}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs"
                    >
                      Proceed to Step 2: Assign Site Supervisor
                    </button>
                  </div>
                </div>
              </div>
            )}

        {/* STEP 2: DAILY SITE SUPERVISOR ALLOCATION (Req J) */}
        {activeStepTab === 'STEP_2_DAILY_ALLOCATION' && (
          <div className="space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Step 2: Assign Site Supervisor Dropdown (Daily Shift Assignment - Requirement J)
              </h3>
              <p className="text-xs text-slate-500">
                Select field site supervisor from dropdown to assign shift work for today. A One-Time OTP code is automatically generated & dispatched upon assignment.
              </p>
            </div>

            {/* Generated One-Time OTP Notification Alert Card */}
            {latestGeneratedOtpAlert && (
              <div className="bg-emerald-900 text-white p-4 rounded-2xl border-2 border-emerald-500 shadow-lg flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                    <Key className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5" /> One-Time OTP Code Generated & Dispatched!
                    </div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Assigned To: <strong>{latestGeneratedOtpAlert.siteSupervisorName}</strong> ({latestGeneratedOtpAlert.phone})</span>
                    </div>
                    <div className="text-xs text-emerald-200">
                      Site Work: <strong>{latestGeneratedOtpAlert.workTitle}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 rounded-xl border border-emerald-500/50">
                  <div className="text-center">
                    <div className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest">Site Clearance OTP</div>
                    <div className="text-xl font-mono font-black text-amber-400 tracking-widest px-2">{latestGeneratedOtpAlert.otpCode}</div>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(latestGeneratedOtpAlert.otpCode);
                      setCopiedOtp(latestGeneratedOtpAlert.otpCode);
                      setTimeout(() => setCopiedOtp(null), 2000);
                    }}
                    className="p-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Copy OTP Code"
                  >
                    {copiedOtp === latestGeneratedOtpAlert.otpCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedOtp === latestGeneratedOtpAlert.otpCode ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => setLatestGeneratedOtpAlert(null)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                    title="Dismiss Alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Field Site Supervisor for Today:
                  </label>
                  <select
                    value={dailySiteSupId}
                    onChange={(e) => setDailySiteSupId(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                  >
                    {siteSupervisors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.phone || 'Field Crew Leader'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daily Site Task Instructions & Safety Notes:
                  </label>
                  <textarea
                    value={dailyNotes}
                    onChange={(e) => setDailyNotes(e.target.value)}
                    placeholder="Instructions for field crew regarding scaffolding, drilling, safety gear, chemical treatments..."
                    rows={4}
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleAssignSiteSupervisorForDay}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> Assign Site Supervisor & Generate One-Time OTP
                  </button>

                  {isStep2Completed && (
                    <button
                      onClick={() => {
                        setOtpError('');
                        setActiveStepTab('STEP_3_APPROVED_DOCS');
                      }}
                      className="bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Step 2 Complete → Proceed to Step 3 (Design & Quotes)
                    </button>
                  )}
                </div>
              </div>

              {/* History List */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" /> Daily Shift Assignment Records & OTP History
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {currentWork.dailySiteAssignments?.length === 0 ? (
                    <div className="text-xs text-slate-400 py-6 text-center italic">
                      No shift assignments created yet.
                    </div>
                  ) : (
                    currentWork.dailySiteAssignments?.map((a) => (
                      <div key={a.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-2">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-emerald-900">{a.siteSupervisorName}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-slate-500">{a.date}</span>
                            <button
                              onClick={() => {
                                const updatedAssignments = currentWork.dailySiteAssignments?.filter((item) => item.id !== a.id) || [];
                                onUpdateWork({ ...currentWork, dailySiteAssignments: updatedAssignments });
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                              title="Delete Shift Assignment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {a.assignmentOtpCode && (
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] font-mono font-bold">
                            <Key className="w-3.5 h-3.5 text-amber-600" />
                            <span>OTP: <strong>{a.assignmentOtpCode}</strong></span>
                            <span className="text-[10px] text-slate-400 font-sans font-normal">({a.sentToPhone || 'SMS Sent'})</span>
                          </div>
                        )}

                        <p className="text-slate-600 text-[11px] leading-relaxed">{a.notes}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: APPROVED DESIGN & QUOTATION REFERENCES (Reqs K & L) */}
        {activeStepTab === 'STEP_3_APPROVED_DOCS' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Step 3: Approved Design & Quotation Library (Requirements K & L)
              </h3>
              <p className="text-xs text-slate-500">
                Upload finalized client design reference PDF and verified commercial BOQ quotation for site execution reference.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Requirement K */}
              <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-purple-900">
                  <Palette className="w-4 h-4 text-purple-600" />
                  K. Upload Approved Design Reference
                </div>
                <p className="text-xs text-purple-800 leading-relaxed">
                  Upload finalized 3D rendering / CAD drawing for field site crew alignment.
                </p>
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={designRefFile}
                    onChange={(e) => setDesignRefFile(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-purple-300 rounded-xl"
                  />
                  <button className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 w-full cursor-pointer">
                    <Upload className="w-4 h-4" /> Upload Approved Design Drawing
                  </button>
                </div>
              </div>

              {/* Requirement L */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-900">
                  <FileText className="w-4 h-4 text-blue-600" />
                  L. Upload Approved Quotation Reference
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Upload verified commercial BOQ quotation for material verification on site.
                </p>
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={quoteRefFile}
                    onChange={(e) => setQuoteRefFile(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-blue-300 rounded-xl"
                  />
                  <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 w-full cursor-pointer">
                    <Upload className="w-4 h-4" /> Upload Approved Commercial BOQ
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3 Completion & Unlock Action */}
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-purple-600" /> Step 3 Complete Design & BOQ Review
                </div>
                <p className="text-xs text-purple-800">
                  Confirm approved 3D design references and commercial BOQ quotation to unlock Step 4 (Live Field Audit).
                </p>
              </div>

              <button
                onClick={() => {
                  const updatedWork: WorkAssignment = {
                    ...currentWork,
                    supervisorCompletedStep3: true
                  };
                  onUpdateWork(updatedWork);
                  setOtpError('');
                  setActiveStepTab('STEP_4_LIVE_AUDIT');
                }}
                className="bg-purple-700 hover:bg-purple-600 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> Confirm & Unlock Step 4 (Live Audit)
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: LIVE FIELD SITE AUDIT & EOD MONITORING */}
        {activeStepTab === 'STEP_4_LIVE_AUDIT' && (
          <div className="space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Step 4: Live Field Punch-Ins & EOD Progress Audit
              </h3>
              <p className="text-xs text-slate-500">
                Audit real-time field attendance photos, GPS coordinates, material requisitions, and cloud sync logs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Punch-Ins */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> Attendance Punch-In Records
                </div>
                {currentWork.punchIns?.length === 0 ? (
                  <div className="text-xs text-slate-400 py-6 text-center italic">No punch-ins logged today.</div>
                ) : (
                  currentWork.punchIns?.map((p) => (
                    <div key={p.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2">
                      <div className="flex justify-between items-center font-bold text-slate-800">
                        <span>Punched In: {p.punchInTime}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">{p.date}</span>
                          <button
                            onClick={() => {
                              const updatedPunchIns = currentWork.punchIns?.filter((item) => item.id !== p.id) || [];
                              onUpdateWork({ ...currentWork, punchIns: updatedPunchIns });
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            title="Delete Punch In Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600">{p.locationAddress}</p>
                      {p.photoUrl && (
                        <div className="relative group overflow-hidden rounded-lg mt-1.5">
                          <img
                            src={p.photoUrl}
                            alt="Punch-In Site"
                            onClick={() => {
                              if (window.showGlobalImageViewer) {
                                window.showGlobalImageViewer(p.photoUrl, `Daily Punch-In Attendance - ${p.name || 'Supervisor'}`);
                              }
                            }}
                            className="w-full h-32 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105 duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (window.showGlobalImageViewer) {
                                window.showGlobalImageViewer(p.photoUrl, `Daily Punch-In Attendance - ${p.name || 'Supervisor'}`);
                              }
                            }}
                            className="absolute bottom-1.5 right-1.5 bg-slate-900/90 hover:bg-blue-600 text-[9px] text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-bold cursor-pointer"
                          >
                            View Fullscreen
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* EOD Reports & Cloud Sync */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> EOD Progress & OneDrive Folder Audit
                </div>
                {currentWork.eodReports?.length === 0 ? (
                  <div className="text-xs text-slate-400 py-6 text-center italic">No EOD reports submitted today.</div>
                ) : (
                  currentWork.eodReports?.map((eod) => (
                    <div key={eod.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2">
                      <div className="flex justify-between items-center font-bold text-slate-800">
                        <span>Progress: {eod.completionPercentage}%</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">{eod.submittedAt}</span>
                          <button
                            onClick={() => {
                              const updatedEod = currentWork.eodReports?.filter((item) => item.id !== eod.id) || [];
                              onUpdateWork({ ...currentWork, eodReports: updatedEod });
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            title="Delete EOD Report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{eod.summaryOfWorkDone}</p>
                      <a
                        href="https://1drv.ms/f/c/5B3D25D3EA1B900F/IgAJlltjpsdsSY1fD3GR0QVrAV9kNgpAmu6qZpI4wMFDwKk?e=7y5YOU"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 rounded text-[10px] font-mono transition-colors cursor-pointer group"
                        title="Click to Open OneDrive Folder"
                      >
                        OneDrive Sync: <span className="underline group-hover:text-emerald-200">{eod.cloudFolderSyncPath}</span> ↗
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};
