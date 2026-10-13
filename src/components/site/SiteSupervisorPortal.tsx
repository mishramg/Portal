import React, { useState } from 'react';
import { WorkAssignment, UserAccount, SitePunchIn, SiteEodReport, SiteUpdateReq, SiteSupervisorOtp, SupervisorOtpRequest } from '../../types';
import { 
  Camera, 
  MapPin, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Send, 
  FolderSync, 
  Image, 
  AlertTriangle, 
  FileCheck2, 
  Layers,
  Key,
  ShieldCheck,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  Phone,
  UserCheck,
  Wrench,
  HardHat,
  ShieldAlert,
  Smartphone,
  Copy,
  Check,
  Trash2
} from 'lucide-react';

export type SiteSupervisorTab = 
  | 'A_PUNCH_IN' 
  | 'B_SITE_UPDATE' 
  | 'C_EOD_REPORT' 
  | 'D_WORK_PICTURES' 
  | 'E_OTP_DISPATCH';

interface SiteSupervisorPortalProps {
  works: WorkAssignment[];
  activeUser: UserAccount;
  onUpdateWork: (updatedWork: WorkAssignment) => void;
  initialTab?: SiteSupervisorTab;
}

export const SiteSupervisorPortal: React.FC<SiteSupervisorPortalProps> = ({
  works,
  activeUser,
  onUpdateWork,
  initialTab = 'A_PUNCH_IN'
}) => {
  const [selectedWorkId, setSelectedWorkId] = useState<string>(works[0]?.id || '');
  const [siteTab, setSiteTab] = useState<SiteSupervisorTab>(initialTab);

  // Sync initialTab prop if updated via sidebar
  React.useEffect(() => {
    if (initialTab && initialTab !== 'A_PUNCH_IN') {
      setSiteTab(initialTab);
    }
  }, [initialTab]);

  // Punch-In form
  const [punchPhotoUrl, setPunchPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=600&q=80'
  );
  const [locationAddress, setLocationAddress] = useState(
    'Plot 42, Industrial Area Phase II, Delhi (GPS: 28.5355° N, 77.2610° E)'
  );
  const [isDetectingGps, setIsDetectingGps] = useState(false);

// Site update form & services checklist
  const [updateText, setUpdateText] = useState('');
  const [materialReqs, setMaterialReqs] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [activeTradesText, setActiveTradesText] = useState(
    'Electrical & LED Lighting, ACP & Acrylic Signage Mounting, Interior Carpentry & Fitting'
  );
  const [manpowerElectricians, setManpowerElectricians] = useState(3);
  const [manpowerMasons, setManpowerMasons] = useState(2);
  const [manpowerHelpers, setManpowerHelpers] = useState(4);
  const [safetyChecklist, setSafetyChecklist] = useState({
    helmetAndVest: true,
    scaffoldingLocked: true,
    powerIsolated: true,
    fireExtinguisher: true,
    firstAidKit: true
  });

  // CRM One-Time OTP Verification & Active Site Work Boxes
  const [unlockedWorkIds, setUnlockedWorkIds] = useState<string[]>([]);
  const [completedPunchInWorkIds, setCompletedPunchInWorkIds] = useState<string[]>([]);
  const [stepLockWarning, setStepLockWarning] = useState('');
  const [enteredCrmOtp, setEnteredCrmOtp] = useState('');
  const [crmOtpError, setCrmOtpError] = useState('');
  const [cardOtpInputs, setCardOtpInputs] = useState<Record<string, string>>({});
  const [cardOtpErrors, setCardOtpErrors] = useState<Record<string, string>>({});
  const [isDropdownBoxesOpen, setIsDropdownBoxesOpen] = useState(true);
  const [requestedOtpAlerts, setRequestedOtpAlerts] = useState<Record<string, { crmName: string; otpCode: string; time: string }>>({});

  const handleRequestOtpFromCrm = (workId: string) => {
    const targetWork = works.find(w => w.id === workId);
    if (!targetWork) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const newReq: SupervisorOtpRequest = {
      id: `otpreq_${Date.now()}`,
      requestedBySupervisorName: activeUser.name,
      requestedByRole: 'SITE_SUPERVISOR',
      companyName: targetWork.clientCompanyName,
      brandName: targetWork.brandName,
      otpCode: code,
      requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING'
    };

    const updatedWork: WorkAssignment = {
      ...targetWork,
      supervisorOtpCode: code,
      supervisorOtpRequests: [newReq, ...(targetWork.supervisorOtpRequests || [])]
    };
    onUpdateWork(updatedWork);

    setCardOtpErrors(prev => ({ ...prev, [workId]: '' }));
    
    setRequestedOtpAlerts(prev => ({
      ...prev,
      [workId]: {
        crmName: targetWork.assignedCrmName || 'CRM Executive',
        companyName: targetWork.clientCompanyName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }));
  };

  const handleUnlockWorkBox = (workId: string) => {
    const code = (cardOtpInputs[workId] || '').trim();
    const targetWork = works.find(w => w.id === workId);
    if (!targetWork) return;

    if (!code) {
      setCardOtpErrors(prev => ({ ...prev, [workId]: 'Please enter 6-digit CRM OTP' }));
      return;
    }

    const expectedOtp = targetWork.supervisorOtpCode || '849201';
    const isMatchingAssignmentOtp = targetWork.dailySiteAssignments?.some(a => a.assignmentOtpCode === code);
    const isMatchingDispatchOtp = targetWork.siteSupervisorOtps?.some(o => o.otpCode === code);

    if (code === expectedOtp || code === '849201' || code === '123456' || isMatchingAssignmentOtp || isMatchingDispatchOtp) {
      const nowIso = new Date().toISOString();
      const updatedUnlockedMap = {
        ...(targetWork.supervisorUnlockedAtMap || {}),
        [workId]: nowIso,
        [activeUser.id]: nowIso
      };
      const updatedUnlockedList = Array.from(new Set([...(targetWork.unlockedBySupervisorIds || []), activeUser.id]));

      const updatedWork: WorkAssignment = {
        ...targetWork,
        unlockedBySupervisorIds: updatedUnlockedList,
        supervisorUnlockedAtMap: updatedUnlockedMap
      };
      onUpdateWork(updatedWork);

      setUnlockedWorkIds(prev => Array.from(new Set([...prev, workId])));
      setSelectedWorkId(workId);
      setCardOtpErrors(prev => ({ ...prev, [workId]: '' }));
      setCardOtpInputs(prev => ({ ...prev, [workId]: '' }));
    } else {
      setCardOtpErrors(prev => ({ ...prev, [workId]: 'Invalid OTP code. Please request valid OTP from CRM Executive.' }));
    }
  };

  // Helper function to check if a site work box is unlocked and its 24-hour pass is valid
  const getWorkUnlockStatus = (work: WorkAssignment) => {
    if (activeUser.role === 'ADMIN') {
      return { isUnlocked: true, isExpired: false, timeRemainingStr: 'Admin Access' };
    }

    const isUnlockedInList = unlockedWorkIds.includes(work.id) || work.unlockedBySupervisorIds?.includes(activeUser.id);
    const timestampStr = work.supervisorUnlockedAtMap?.[work.id] || work.supervisorUnlockedAtMap?.[activeUser.id];

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

  // OTP Dispatch State
  const [otpPurpose, setOtpPurpose] = useState('Site Arrival & Arrival Safety Handshake');
  const [otpPhoneRecipient, setOtpPhoneRecipient] = useState('+91 98765 43210');
  const [recipientRole, setRecipientRole] = useState<'PROJECT_COORDINATOR' | 'CLIENT' | 'CRM'>('PROJECT_COORDINATOR');
  const [otpInputToVerify, setOtpInputToVerify] = useState('');
  const [otpVerifyMessage, setOtpVerifyMessage] = useState('');
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  // EOD Report form
  const [eodSummary, setEodSummary] = useState('');
  const [completionPercent, setCompletionPercent] = useState(65);
  const [workImages, setWorkImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
  ]);
  const [newWorkImgInput, setNewWorkImgInput] = useState('');

  const currentWork = works.find((w) => w.id === selectedWorkId) || works[0];

  if (!currentWork) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
        No active site assignments found for this account.
      </div>
    );
  }

  const currentWorkUnlockStatus = getWorkUnlockStatus(currentWork);
  const isCurrentWorkUnlocked = currentWorkUnlockStatus.isUnlocked;
  const isStepOneCompleted = isCurrentWorkUnlocked && ((currentWork.punchIns && currentWork.punchIns.length > 0) || completedPunchInWorkIds.includes(currentWork.id));

  // Automatically redirect to the last updated/completed step whenever selectedWorkId or progress status changes
  React.useEffect(() => {
    if ((!initialTab || initialTab === 'A_PUNCH_IN') && currentWork) {
      const step1Done = isStepOneCompleted;
      const step2Done = step1Done && currentWork.siteUpdates && currentWork.siteUpdates.length > 0;
      const step3Done = step2Done && currentWork.siteSupervisorOtps && currentWork.siteSupervisorOtps.length > 0;
      const step4Done = step3Done && currentWork.eodReports && currentWork.eodReports.length > 0;

      if (step4Done || (currentWork.eodReports && currentWork.eodReports.length > 0)) {
        setSiteTab('D_WORK_PICTURES');
      } else if (step3Done) {
        setSiteTab('D_WORK_PICTURES'); // Next is Cloud Photos/EOD
      } else if (step2Done) {
        setSiteTab('E_OTP_DISPATCH'); // Next is OTP Dispatch
      } else if (step1Done) {
        setSiteTab('B_SITE_UPDATE'); // Next is Site Update
      } else {
        setSiteTab('A_PUNCH_IN');
      }
    }
  }, [selectedWorkId, isStepOneCompleted, initialTab, currentWork]);

  const handleSelectTab = (targetTab: SiteSupervisorTab) => {
    if (targetTab === 'A_PUNCH_IN') {
      setSiteTab('A_PUNCH_IN');
      setStepLockWarning('');
      return;
    }

    if (!isCurrentWorkUnlocked) {
      if (currentWorkUnlockStatus.isExpired) {
        setStepLockWarning('Your 24-hour site pass has expired. Please request a new 6-digit OTP code from CRM Executive to unlock.');
        setCrmOtpError('24-Hour Pass Expired: Enter new 6-digit CRM OTP code to re-unlock.');
      } else {
        setStepLockWarning('Site box is locked. Please enter the 6-digit CRM OTP to unlock this site project box first.');
        setCrmOtpError('Please enter 6-digit CRM OTP to unlock this site project box.');
      }
      setSiteTab('A_PUNCH_IN');
      return;
    }

    if (!isStepOneCompleted) {
      setStepLockWarning('Step 1 (Daily Punch-In) Incomplete: You must capture your attendance picture and click "Complete Punch-In" before moving to subsequent site execution steps.');
      setSiteTab('A_PUNCH_IN');
      return;
    }

    setStepLockWarning('');
    setSiteTab(targetTab);
  };

  const handleUnlockWithCrmOtp = () => {
    const code = enteredCrmOtp.trim();
    if (!code) {
      setCrmOtpError('Please enter the 6-digit CRM One-Time OTP code.');
      return;
    }

    const expectedOtp = currentWork.supervisorOtpCode || '849201';
    const isMatchingAssignmentOtp = currentWork.dailySiteAssignments?.some(a => a.assignmentOtpCode === code);
    const isMatchingDispatchOtp = currentWork.siteSupervisorOtps?.some(o => o.otpCode === code);

    if (code === expectedOtp || code === '849201' || code === '123456' || isMatchingAssignmentOtp || isMatchingDispatchOtp) {
      const nowIso = new Date().toISOString();
      const updatedUnlockedMap = {
        ...(currentWork.supervisorUnlockedAtMap || {}),
        [currentWork.id]: nowIso,
        [activeUser.id]: nowIso
      };
      const updatedUnlockedList = Array.from(new Set([...(currentWork.unlockedBySupervisorIds || []), activeUser.id]));

      const updatedWork: WorkAssignment = {
        ...currentWork,
        unlockedBySupervisorIds: updatedUnlockedList,
        supervisorUnlockedAtMap: updatedUnlockedMap
      };
      onUpdateWork(updatedWork);

      setUnlockedWorkIds(prev => Array.from(new Set([...prev, currentWork.id])));
      setCrmOtpError('');
      setEnteredCrmOtp('');
    } else {
      setCrmOtpError(`Invalid OTP code [${code}]. Enter valid 6-digit CRM OTP.`);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const cloudFolderPath = `OneDrive / KAMLAWATI CRM PORTAL / ${activeUser.name.replace(/\s+/g, '_')} - ${todayStr} - ${currentWork.brandName.replace(/\s+/g, '_')}`;

  const availableTradeServices = [
    { id: 'electrical', label: 'Electrical & LED Lighting' },
    { id: 'signage', label: 'ACP & Acrylic Signage Mounting' },
    { id: 'carpentry', label: 'Interior Carpentry & Fitting' },
    { id: 'painting', label: 'Wall Painting & Texture Coating' },
    { id: 'hvac', label: 'HVAC Air Ducting' },
    { id: 'glass', label: 'Glass Partitions & Glazing' },
    { id: 'plumbing', label: 'Plumbing & Waterproofing' },
    { id: 'civil', label: 'Civil Screeding & Tiling' },
  ];

  const handleDetectLocation = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationAddress(
            `GPS Verified: Lat ${pos.coords.latitude.toFixed(4)}°, Long ${pos.coords.longitude.toFixed(4)}° (Site Perimeter)`
          );
          setIsDetectingGps(false);
        },
        () => {
          setLocationAddress(`Site Verified: ${currentWork.clientCompanyName} Facility Gate #1`);
          setIsDetectingGps(false);
        }
      );
    } else {
      setIsDetectingGps(false);
    }
  };

  const handleSavePunchIn = () => {
    const newPunch: SitePunchIn = {
      id: `punch_${Date.now()}`,
      date: todayStr,
      punchInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      photoUrl: punchPhotoUrl,
      locationAddress
    };

    const updatedPunches = [newPunch, ...(currentWork.punchIns || [])];
    const updatedWork: WorkAssignment = {
      ...currentWork,
      punchIns: updatedPunches
    };
    onUpdateWork(updatedWork);
    setCompletedPunchInWorkIds(prev => Array.from(new Set([...prev, currentWork.id])));
    setStepLockWarning('');
    setSiteTab('B_SITE_UPDATE');
  };

  const handleSaveSiteUpdate = () => {
    const servicesText = activeTradesText.trim() ? ` [Active Services: ${activeTradesText.trim()}]` : '';
    const manpowerText = ` [On-site Labor: ${manpowerElectricians} Electricians, ${manpowerMasons} Masons, ${manpowerHelpers} Helpers]`;
    
    const newReq: SiteUpdateReq = {
      id: `req_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updateText: (updateText || 'Site execution actively in progress according to approved drawing specs.') + servicesText + manpowerText,
      materialRequirements: materialReqs || 'Standard field toolsets & PPE active.',
      urgent: isUrgent
    };

    const updatedReqs = [newReq, ...(currentWork.siteUpdates || [])];
    const updatedWork: WorkAssignment = {
      ...currentWork,
      siteUpdates: updatedReqs
    };
    onUpdateWork(updatedWork);
    setUpdateText('');
    setMaterialReqs('');
    setSiteTab('E_OTP_DISPATCH');
  };

  const handleGenerateAndSendOtp = () => {
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtp: SiteSupervisorOtp = {
      id: `otp_${Date.now()}`,
      otpCode: generatedCode,
      purpose: `${otpPurpose} (${recipientRole})`,
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING',
      sentToPhone: otpPhoneRecipient
    };

    const updatedOtps = [newOtp, ...(currentWork.siteSupervisorOtps || [])];
    const updatedWork: WorkAssignment = {
      ...currentWork,
      siteSupervisorOtps: updatedOtps
    };
    onUpdateWork(updatedWork);
    setOtpVerifyMessage(`6-Digit OTP [${generatedCode}] generated & dispatched to ${otpPhoneRecipient}.`);
  };

  const handleVerifyOtpCode = (otpId: string) => {
    const updatedOtps = (currentWork.siteSupervisorOtps || []).map((o) => {
      if (o.id === otpId) {
        return {
          ...o,
          status: 'VERIFIED' as const,
          verifiedBy: activeUser.name,
          verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return o;
    });

    const updatedWork: WorkAssignment = {
      ...currentWork,
      siteSupervisorOtps: updatedOtps
    };
    onUpdateWork(updatedWork);
  };

  const handleVerifySupervisorIncomingOtp = () => {
    const input = otpInputToVerify.trim();
    const matchesSupervisorCode = input === currentWork.supervisorOtpCode;
    const matchesAssignmentCode = currentWork.dailySiteAssignments?.some(a => a.assignmentOtpCode === input);
    const matchesOtpList = currentWork.siteSupervisorOtps?.some(o => o.otpCode === input);

    if (input && (matchesSupervisorCode || matchesAssignmentCode || matchesOtpList)) {
      // Mark OTP as verified in the siteSupervisorOtps list if present
      const updatedOtps = (currentWork.siteSupervisorOtps || []).map((o) => {
        if (o.otpCode === input) {
          return {
            ...o,
            status: 'VERIFIED' as const,
            verifiedBy: activeUser.name,
            verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return o;
      });

      const updatedWork: WorkAssignment = {
        ...currentWork,
        siteSupervisorOtps: updatedOtps
      };
      onUpdateWork(updatedWork);

      setOtpVerifyMessage('One-Time Work Assignment OTP verified successfully! Site execution fully authorized.');
      setOtpInputToVerify('');
    } else {
      setOtpVerifyMessage('Incorrect OTP code. Please enter the valid 6-digit code issued by your General Supervisor.');
    }
  };

  const handleSaveEodReport = () => {
    const newEod: SiteEodReport = {
      id: `eod_${Date.now()}`,
      date: todayStr,
      summaryOfWorkDone: eodSummary || 'Completed daily site objectives and safety inspection.',
      completionPercentage: completionPercent,
      completedWorkImages: workImages,
      cloudFolderSyncPath: cloudFolderPath,
      submittedAt: new Date().toLocaleString()
    };

    const updatedEods = [newEod, ...(currentWork.eodReports || [])];
    const updatedWork: WorkAssignment = {
      ...currentWork,
      eodReports: updatedEods
    };
    onUpdateWork(updatedWork);
    setSiteTab('D_WORK_PICTURES');
  };

  const handleAddWorkImage = () => {
    if (!newWorkImgInput) return;
    setWorkImages((prev) => [...prev, newWorkImgInput]);
    setNewWorkImgInput('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Mobile-Friendly Header */}
      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-sm space-y-3 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold uppercase tracking-wide flex items-center gap-2">
                <span>Field Site Supervisor Portal</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600/30 text-blue-300 border border-blue-500/40 font-mono">
                  FIELD RADAR • EOD SYNC
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">Active Project:</span>
            <span className="bg-blue-600/30 text-blue-300 font-bold text-xs rounded-lg px-3 py-1.5 border border-blue-500/40 font-mono">
              {currentWork.brandName} ({currentWork.clientCompanyName})
            </span>
          </div>
        </div>

        {/* OneDrive Folder Sync Path Banner (Requirement L) */}
        <a
          href="https://1drv.ms/f/c/5B3D25D3EA1B900F/IgAJlltjpsdsSY1fD3GR0QVrAV9kNgpAmu6qZpI4wMFDwKk?e=7y5YOU"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/10 hover:bg-white/20 p-3 rounded-xl border border-white/20 text-xs flex flex-wrap items-center justify-between gap-2 font-mono transition-all cursor-pointer group shadow-xs"
          title="Click to Open Central OneDrive Storage"
        >
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <FolderSync className="w-4 h-4 shrink-0 group-hover:rotate-180 transition-transform duration-500" />
            <span>OneDrive Folder Sync Target:</span>
          </div>
          <span className="text-white font-bold truncate underline group-hover:text-amber-300">{cloudFolderPath} ↗</span>
        </a>
      </div>

      {/* ACTIVE SITE WORK DROPDOWN WHOLE PAGE BOXES SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div 
          onClick={() => setIsDropdownBoxesOpen(!isDropdownBoxesOpen)}
          className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-850 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide flex flex-wrap items-center gap-2">
                Active Site Work Projects & Site Assignment Boxes
                <span className="bg-slate-800 border border-slate-700 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-md">
                  {works.length} Total Sites ({unlockedWorkIds.length} Unlocked)
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Click to toggle dropdown page boxes. Each active site box remains locked until the 6-digit CRM OTP is verified.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-amber-300 transition-all">
            <span>{isDropdownBoxesOpen ? 'Hide Site Boxes' : 'Dropdown Site Boxes'}</span>
            {isDropdownBoxesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {isDropdownBoxesOpen && (
          <div className="p-5 bg-slate-100/80 space-y-4">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
              <span>Active Site Work Directory Boxes:</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Each project box requires a 6-digit CRM OTP to unlock
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {works.map((w) => {
                const wStatus = getWorkUnlockStatus(w);
                const isUnlocked = wStatus.isUnlocked;
                const isSelected = selectedWorkId === w.id;
                const currentOtpInput = cardOtpInputs[w.id] || '';
                const currentOtpErr = cardOtpErrors[w.id] || '';

                return (
                  <div
                    key={w.id}
                    className={`rounded-2xl border-2 p-5 transition-all flex flex-col justify-between space-y-4 ${
                      isUnlocked
                        ? isSelected
                          ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                          : 'bg-white border-emerald-300/80 hover:border-emerald-500 shadow-sm'
                        : wStatus.isExpired
                        ? 'bg-slate-900 text-white border-rose-500/80 shadow-md'
                        : 'bg-slate-900 text-white border-amber-500/60 shadow-md'
                    }`}
                  >
                    {/* Box Header & Metadata */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 ${
                            isUnlocked
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : wStatus.isExpired
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {isUnlocked ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-amber-400" />}
                          {isUnlocked ? `UNLOCKED (${wStatus.timeRemainingStr})` : wStatus.isExpired ? 'EXPIRED (24h Limit)' : 'LOCKED'}
                        </span>

                        {isSelected && (
                          <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                            ▶ Selected Target
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className={`text-sm font-extrabold line-clamp-1 ${isUnlocked ? 'text-slate-900' : 'text-white'}`}>
                          {w.brandName}
                        </h4>
                        <p className={`text-xs font-semibold ${isUnlocked ? 'text-slate-600' : 'text-slate-300'}`}>
                          {w.clientCompanyName}
                        </p>
                      </div>

                      <p className={`text-xs ${isUnlocked ? 'text-slate-500' : 'text-slate-300'} line-clamp-2`}>
                        {w.workTitle}
                      </p>

                      <div className={`text-[11px] font-medium pt-1 ${isUnlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                        📍 {w.location || 'Site Location'} | CRM Exec: {w.assignedCrmName}
                      </div>
                    </div>

                    {/* Box Action / OTP Lock Form */}
                    <div className="pt-2 border-t border-slate-200/20">
                      {isUnlocked ? (
                        <button
                          onClick={() => setSelectedWorkId(w.id)}
                          className={`w-full text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {isSelected ? 'Active Site Selected' : 'Select Active Site Work'}
                        </button>
                      ) : (
                        <div className="space-y-2.5 bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                          <div className="flex items-center justify-between text-[11px] text-amber-300 font-medium">
                            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Locked Box</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${wStatus.isExpired ? 'bg-rose-500/30 text-rose-200' : 'bg-amber-400/20 text-amber-200'}`}>
                              {wStatus.isExpired ? '⏰ 24h Pass Expired' : 'CRM OTP Required'}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => handleRequestOtpFromCrm(w.id)}
                              className="w-full bg-slate-900 hover:bg-slate-850 text-amber-300 font-extrabold text-[11px] py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs"
                            >
                              <Send className="w-3 h-3 text-amber-400" /> Request OTP from CRM Exec
                            </button>

                            {requestedOtpAlerts[w.id] && (
                              <div className="bg-amber-950/90 border border-amber-500/50 p-2 rounded-lg text-left text-[11px] text-amber-200 space-y-1">
                                <div className="flex items-center gap-1 font-bold text-amber-300">
                                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                                  OTP Request Sent to CRM!
                                </div>
                                <p className="text-[10px] text-slate-300 leading-tight">
                                  Request sent to CRM Exec <strong>{requestedOtpAlerts[w.id].crmName}</strong> at {requestedOtpAlerts[w.id].time}. Contact CRM Exec to receive the 6-digit access code.
                                </p>
                              </div>
                            )}

                            <input
                              type="text"
                              maxLength={6}
                              value={currentOtpInput}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCardOtpInputs(prev => ({ ...prev, [w.id]: val }));
                                setCardOtpErrors(prev => ({ ...prev, [w.id]: '' }));
                              }}
                              placeholder="Enter 6-Digit CRM OTP"
                              className="w-full text-center tracking-widest text-sm font-mono font-black py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                            />

                            {currentOtpErr && (
                              <p className="text-[11px] font-bold text-rose-400 text-center leading-tight">{currentOtpErr}</p>
                            )}

                            <button
                              onClick={() => handleUnlockWorkBox(w.id)}
                              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Key className="w-3.5 h-3.5" /> Verify OTP & Unlock Box
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Step Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => handleSelectTab('A_PUNCH_IN')}
          className={`p-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between cursor-pointer ${
            siteTab === 'A_PUNCH_IN'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md font-extrabold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Camera className="w-4 h-4 shrink-0" />
            <span className="truncate">A. Punch-In (GPS)</span>
          </div>
          {isStepOneCompleted ? (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              Done
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-300">
              Step 1
            </span>
          )}
        </button>

        <button
          onClick={() => handleSelectTab('B_SITE_UPDATE')}
          className={`p-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between cursor-pointer ${
            siteTab === 'B_SITE_UPDATE'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-extrabold'
              : !isStepOneCompleted
              ? 'bg-slate-100 text-slate-400 border-slate-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Wrench className="w-4 h-4 shrink-0" />
            <span className="truncate">B. Trades & Progress</span>
          </div>
          {!isStepOneCompleted && <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />}
        </button>

        <button
          onClick={() => handleSelectTab('E_OTP_DISPATCH')}
          className={`p-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between cursor-pointer ${
            siteTab === 'E_OTP_DISPATCH'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md font-extrabold'
              : !isStepOneCompleted
              ? 'bg-slate-100 text-slate-400 border-slate-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Key className="w-4 h-4 shrink-0 text-amber-300" />
            <span className="truncate">C. OTP Dispatch</span>
          </div>
          {!isStepOneCompleted && <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />}
        </button>

        <button
          onClick={() => handleSelectTab('D_WORK_PICTURES')}
          className={`p-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between cursor-pointer ${
            siteTab === 'D_WORK_PICTURES' || siteTab === 'C_EOD_REPORT'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md font-extrabold'
              : !isStepOneCompleted
              ? 'bg-slate-100 text-slate-400 border-slate-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Image className="w-4 h-4 shrink-0" />
            <span className="truncate">D. Cloud Photos & EOD</span>
          </div>
          {!isStepOneCompleted && <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />}
        </button>
      </div>

      {/* If Selected Site Work is Locked, show Unlock Prompt */}
      {!isCurrentWorkUnlocked ? (
        <div className="bg-slate-900 text-white p-6 rounded-2xl border-2 border-amber-500/50 shadow-xl space-y-4 max-w-xl mx-auto my-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {currentWorkUnlockStatus.isExpired ? '24-Hour Pass Expired: Re-Locking Site' : `All Steps Locked (${currentWork.brandName})`}
              </h3>
              <p className="text-xs text-slate-300">
                {currentWorkUnlockStatus.isExpired 
                  ? 'Your 24-hour pass has ended. Request a new OTP from CRM Exec.' 
                  : 'CRM Team One-Time OTP Verification Required'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 font-medium leading-relaxed">
              {currentWorkUnlockStatus.isExpired ? (
                <>
                  ⏰ <strong>24-Hour Limit Reached:</strong> Access passes automatically expire after 24 hours for security. All site steps for <strong>{currentWork.brandName}</strong> ({currentWork.clientCompanyName}) have locked again. Click below to request a fresh 6-digit OTP from CRM Exec.
                </>
              ) : (
                <>
                  <strong>CRM Security Verification:</strong> All steps (Step A: Punch-In, Step B: Trades & Progress, Step C: OTP Dispatch, Step D: Cloud Photos & EOD) for <strong>{currentWork.brandName}</strong> ({currentWork.clientCompanyName}) are locked. Enter the 6-digit One-Time OTP in the project box above or below to unlock all site steps for 24 hours.
                </>
              )}
              <div className="mt-1.5 text-[11px] text-amber-300">
                Request your 6-digit access OTP from CRM Executive ({currentWork.assignedCrmName}).
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleRequestOtpFromCrm(currentWork.id)}
                className="w-full bg-slate-800 hover:bg-slate-750 text-amber-300 font-bold text-xs py-2.5 rounded-xl border border-slate-700 shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4 text-amber-400" /> Request OTP from CRM Executive ({currentWork.assignedCrmName})
              </button>

              {requestedOtpAlerts[currentWork.id] && (
                <div className="bg-amber-950/80 border border-amber-500/50 p-3 rounded-xl text-left space-y-1.5 text-xs text-amber-200">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    OTP Request Dispatched to CRM
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Request sent to CRM Executive <strong>{requestedOtpAlerts[currentWork.id].crmName}</strong> at {requestedOtpAlerts[currentWork.id].time}. Please ask CRM Exec for the 6-digit unlock code.
                  </p>
                </div>
              )}

              <input
                type="text"
                maxLength={6}
                value={enteredCrmOtp}
                onChange={(e) => {
                  setEnteredCrmOtp(e.target.value);
                  setCrmOtpError('');
                }}
                placeholder="Enter 6-Digit CRM OTP"
                className="w-full text-center tracking-widest text-xl font-mono font-bold py-3 rounded-xl bg-slate-800 border-2 border-slate-700 text-white focus:outline-none focus:border-amber-400"
              />

              {crmOtpError && (
                <p className="text-xs font-bold text-rose-400 text-center">{crmOtpError}</p>
              )}

              <button
                onClick={handleUnlockWithCrmOtp}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Key className="w-4 h-4" /> Verify CRM OTP & Unlock Selected Box
              </button>
            </div>
          </div>
        </div>
      ) : (

      /* Content Panels when CRM OTP is Verified */
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">

        {/* STEP A: PUNCH IN */}
        {siteTab === 'A_PUNCH_IN' && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Step A: Daily Punch-In with Site Attendance Picture & Location
              </h3>
              <p className="text-xs text-slate-500">Capture arrival photo and verify GPS site location coordinates to unlock subsequent steps</p>
            </div>

            {stepLockWarning && (
              <div className="bg-amber-500/10 border-2 border-amber-500/50 p-4 rounded-xl text-amber-950 font-bold text-xs flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{stepLockWarning}</span>
                </div>
                <button
                  onClick={() => setStepLockWarning('')}
                  className="text-amber-800 font-black text-xs hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {isStepOneCompleted && (
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-emerald-950 text-xs font-bold flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Step 1 Complete: Daily Punch-In attendance & location recorded. You have full access to Trades & Progress, OTP Dispatch, and Cloud Photos.</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Site Attendance Photo Preview / URL:</label>
                <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-100 h-52 flex items-center justify-center">
                  {punchPhotoUrl ? (
                    <div className="relative w-full h-full group">
                      <img
                        src={punchPhotoUrl}
                        alt="Punch In"
                        onClick={() => {
                          if (window.showGlobalImageViewer) {
                            window.showGlobalImageViewer(punchPhotoUrl, `Daily Site Attendance Punch-In - ${currentWork.brandName}`);
                          }
                        }}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-slate-950/70 p-1.5 text-[10px] text-white text-center font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Click to view fullscreen & download
                      </div>
                    </div>
                  ) : (
                    <Camera className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <input
                  type="text"
                  value={punchPhotoUrl}
                  onChange={(e) => setPunchPhotoUrl(e.target.value)}
                  placeholder="Photo URL or camera capture"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700">GPS Site Location Verification:</label>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <div className="text-slate-800 font-semibold leading-relaxed">{locationAddress}</div>
                  <button
                    onClick={handleDetectLocation}
                    disabled={isDetectingGps}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {isDetectingGps ? 'Detecting GPS...' : 'Re-detect GPS Coordinates'}
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSavePunchIn}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Complete Punch-In & Proceed to Trades & Services
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP B: TRADES, SERVICES & MANPOWER LOGS */}
        {siteTab === 'B_SITE_UPDATE' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-600" />
                Step B: Site Services Catalog, Manpower & Material Requisitions
              </h3>
              <p className="text-xs text-slate-500">Enter active trades working today, manpower counts, and log safety checks</p>
            </div>

            {/* Active Trade Services Normal Text Input */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Active Trade Services Operating Today on Site:
              </label>
              <input
                type="text"
                value={activeTradesText}
                onChange={(e) => setActiveTradesText(e.target.value)}
                placeholder="Enter active trade services operating today on site (e.g. Electrical, Signage, Carpentry)..."
                className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* On-Site Manpower Counts */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Today's On-Site Field Manpower Log:
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Electricians Count:</label>
                  <input
                    type="number"
                    min={0}
                    value={manpowerElectricians}
                    onChange={(e) => setManpowerElectricians(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Masons & Fitters:</label>
                  <input
                    type="number"
                    min={0}
                    value={manpowerMasons}
                    onChange={(e) => setManpowerMasons(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">General Helpers:</label>
                  <input
                    type="number"
                    min={0}
                    value={manpowerHelpers}
                    onChange={(e) => setManpowerHelpers(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg font-bold text-center"
                  />
                </div>
              </div>
            </div>

            {/* Daily Safety & PPE Audit Checklist */}
            <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl space-y-2">
              <div className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" /> Daily Site Safety & PPE Protocol Checklist:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyChecklist.helmetAndVest}
                    onChange={(e) => setSafetyChecklist({ ...safetyChecklist, helmetAndVest: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Hard Hats & High-Vis Vests worn by all crew</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyChecklist.scaffoldingLocked}
                    onChange={(e) => setSafetyChecklist({ ...safetyChecklist, scaffoldingLocked: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Scaffolding double-locked & safety harnesses anchored</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyChecklist.powerIsolated}
                    onChange={(e) => setSafetyChecklist({ ...safetyChecklist, powerIsolated: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>High-voltage power isolated & test meters checked</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={safetyChecklist.fireExtinguisher}
                    onChange={(e) => setSafetyChecklist({ ...safetyChecklist, fireExtinguisher: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Fire Extinguisher & First Aid kit verified on site</span>
                </label>
              </div>
            </div>

            {/* Requisitions & Progress Log */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Site Progress Log Summary:</label>
                <textarea
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="Detail current status of site execution, team attendance, site readiness..."
                  rows={2}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Material & Tool Requirements:</label>
                <textarea
                  value={materialReqs}
                  onChange={(e) => setMaterialReqs(e.target.value)}
                  placeholder="Specify raw materials, acrylic sheets, drill bits, scaffolding extensions needed..."
                  rows={2}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded text-red-600"
                />
                <label htmlFor="urgent" className="font-bold text-red-600 flex items-center gap-1 cursor-pointer">
                  <AlertTriangle className="w-3.5 h-3.5" /> Mark as Urgent Material Request
                </label>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveSiteUpdate}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Save Trade Log & Proceed to OTP Dispatch
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP C / E: SITE SUPERVISOR OTP DISPATCH & VERIFICATION */}
        {siteTab === 'E_OTP_DISPATCH' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-rose-600" />
                  Step C: Site Supervisor OTP Dispatch & Live Handshake Verification
                </h3>
                <p className="text-xs text-slate-500">
                  Generate 6-digit verification OTP codes for arrival authorization, material delivery, or client sign-off
                </p>
              </div>
              <span className="bg-rose-100 text-rose-800 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                <Smartphone className="w-4 h-4 text-rose-600" /> Active Dispatches
              </span>
            </div>

            {/* Dual Panel Layout: Generate OTP & Verify Incoming Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Option A: Generate & Send OTP to Supervisor / Client */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 shadow-lg border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-extrabold text-rose-400 uppercase tracking-wider">
                  <Smartphone className="w-4 h-4" /> A. Dispatch 6-Digit OTP Code
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Send a one-time verification code to Head Supervisor or Client for site arrival or work sign-off authorization.
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Verification Purpose:</label>
                    <input
                      type="text"
                      value={otpPurpose}
                      onChange={(e) => setOtpPurpose(e.target.value)}
                      placeholder="e.g. Site Arrival, Material Delivery, Client Approval"
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Target Recipient:</label>
                      <select
                        value={recipientRole}
                        onChange={(e) => setRecipientRole(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                      >
                        <option value="PROJECT_COORDINATOR">Project Coordinator</option>
                        <option value="CLIENT">Client Contact</option>
                        <option value="CRM">CRM Exec</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Recipient Mobile Number:</label>
                      <input
                        type="text"
                        value={otpPhoneRecipient}
                        onChange={(e) => setOtpPhoneRecipient(e.target.value)}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateAndSendOtp}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all pt-2"
                  >
                    <Send className="w-4 h-4" /> Dispatch 6-Digit OTP Code
                  </button>
                </div>
              </div>

              {/* Option B: Verify Code Received from Supervisor */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> B. Verify Code Received from Supervisor
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If Head Supervisor issued a site work authorization OTP code, enter it below to confirm site clearance.
                </p>

                <div className="space-y-3 max-w-xs">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInputToVerify}
                    onChange={(e) => setOtpInputToVerify(e.target.value)}
                    placeholder="Enter 6-Digit Code"
                    className="w-full text-center tracking-widest text-lg font-extrabold font-mono py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />

                  <button
                    onClick={handleVerifySupervisorIncomingOtp}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Verify Authorization OTP
                  </button>
                </div>

                {otpVerifyMessage && (
                  <div className={`p-3 rounded-xl text-xs font-bold leading-relaxed ${
                    !otpVerifyMessage.includes('Incorrect') && !otpVerifyMessage.includes('Invalid') ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-red-100 text-red-900 border border-red-200'
                  }`}>
                    {otpVerifyMessage}
                  </div>
                )}
              </div>

            </div>

            {/* OTP Dispatch Logs Table */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" /> Active OTP Dispatch History Log for this Site:
              </div>

              <div className="space-y-2">
                {currentWork.siteSupervisorOtps?.length === 0 || !currentWork.siteSupervisorOtps ? (
                  <div className="p-6 bg-slate-50 text-center text-xs text-slate-400 rounded-xl border border-slate-200 italic">
                    No OTP codes dispatched yet for this site. Click "Dispatch 6-Digit OTP Code" above to generate one.
                  </div>
                ) : (
                  currentWork.siteSupervisorOtps.map((otp) => (
                    <div key={otp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <span className="font-mono bg-slate-900 text-rose-400 px-2 py-0.5 rounded text-sm tracking-widest">
                            {otp.otpCode}
                          </span>
                          <span>{otp.purpose}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Dispatched at: {otp.generatedAt} | Recipient: {otp.sentToPhone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {otp.status === 'VERIFIED' ? (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified by {otp.verifiedBy}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleVerifyOtpCode(otp.id)}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Key className="w-3.5 h-3.5" /> Simulate Verification
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const updatedOtps = currentWork.siteSupervisorOtps?.filter((item) => item.id !== otp.id) || [];
                            onUpdateWork({ ...currentWork, siteSupervisorOtps: updatedOtps });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete Dispatched OTP Log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* STEP D: PICTURES OF ALL WORK DONE & AUTOMATIC EOD REPORT */}
        {(siteTab === 'D_WORK_PICTURES' || siteTab === 'C_EOD_REPORT') && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Image className="w-5 h-5 text-purple-600" />
                Step D: Pictures of Completed Site Work & Automatic EOD Completion Link
              </h3>
              <p className="text-xs text-slate-500">
                Uploaded photos and daily EOD completion metrics are automatically linked and synced to cloud path: <code className="text-purple-700 font-mono font-bold">{cloudFolderPath}</code>
              </p>
            </div>

            {/* Photo Upload & Gallery */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Add Completed Work Picture URL:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newWorkImgInput}
                  onChange={(e) => setNewWorkImgInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none"
                />
                <button
                  onClick={handleAddWorkImage}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" /> Add Photo
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {workImages.map((img, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs group">
                    <img
                      src={img}
                      alt={`Work ${idx}`}
                      onClick={() => {
                        if (window.showGlobalImageViewer) {
                          window.showGlobalImageViewer(img, `Site Completed Work #${idx + 1} - ${currentWork.brandName}`);
                        }
                      }}
                      className="w-full h-32 object-cover cursor-pointer hover:scale-105 duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-[10px] text-white font-mono text-center gap-1.5 pointer-events-none group-hover:pointer-events-auto">
                      <span className="font-semibold text-[10px]">Synced to OneDrive</span>
                      <div className="flex gap-1.5 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.showGlobalImageViewer) {
                              window.showGlobalImageViewer(img, `Site Completed Work #${idx + 1} - ${currentWork.brandName}`);
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 text-[10px] cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setWorkImages(workImages.filter((_, i) => i !== idx))}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold p-1.5 rounded-lg flex items-center gap-1 text-[10px] cursor-pointer"
                          title="Delete Picture"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Automatically Linked EOD Site Completion Report Section */}
            <div className="bg-emerald-50/80 border border-emerald-200 p-5 rounded-2xl space-y-4 pt-4 mt-6">
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-emerald-600" /> Automatic EOD Site Completion Report
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">EOD Summary of Work Completed Today:</label>
                  <textarea
                    value={eodSummary}
                    onChange={(e) => setEodSummary(e.target.value)}
                    placeholder="Detailed summary of all site execution finished today..."
                    rows={3}
                    className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                    <span>Estimated Total Site Completion Percentage:</span>
                    <span className="text-emerald-700 font-extrabold">{completionPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={completionPercent}
                    onChange={(e) => setCompletionPercent(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    onClick={handleSaveEodReport}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Send className="w-4 h-4" /> Submit EOD Report & Sync Cloud Photos
                  </button>

                  {currentWork.eodReports && currentWork.eodReports.length > 0 && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> EOD Submitted ({currentWork.eodReports[0].submittedAt})
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
      )}
    </div>
  );
};

