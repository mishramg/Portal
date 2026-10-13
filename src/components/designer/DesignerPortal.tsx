import React, { useState } from 'react';
import { WorkAssignment, UserAccount } from '../../types';
import { 
  Palette, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Send, 
  Eye, 
  Briefcase, 
  CheckSquare, 
  Inbox, 
  ChevronRight, 
  ArrowRight, 
  AlertCircle, 
  Check, 
  Download,
  FolderSync
} from 'lucide-react';
import { FileDownloadList } from '../common/FileDownloadList';
import { DesignRequestManager } from '../common/DesignRequestManager';

interface DesignerPortalProps {
  works: WorkAssignment[];
  activeUser: UserAccount;
  onUpdateWork: (updatedWork: WorkAssignment) => void;
  designers?: UserAccount[];
}

export const DesignerPortal: React.FC<DesignerPortalProps> = ({
  works,
  activeUser,
  onUpdateWork,
  designers = []
}) => {
  const isSeniorDesigner = 
    activeUser.role === 'SR_DESIGNER' || 
    activeUser.role === 'SENIOR_DESIGNER' || 
    activeUser.name.toLowerCase().includes('sr designer') || 
    activeUser.name.toLowerCase().includes('senior');

  // Filter assignments directed to this designer or senior designer
  const myWorks = isSeniorDesigner
    ? works.filter((w) => w.designerBrief || w.currentStep === 'STEP_E_DESIGN_STATUS' || w.assignedSeniorDesignerId === activeUser.id)
    : works.filter((w) => w.designerBrief && (w.designerBrief.assignedDesignerId === activeUser.id || w.assignedSubDesignerId === activeUser.id));

  // Form state maps for Senior Designer
  const [selectedAssigneeMap, setSelectedAssigneeMap] = useState<{ [workId: string]: string }>({});
  const [guidanceNotesMap, setGuidanceNotesMap] = useState<{ [workId: string]: string }>({});
  const [delegationSuccessMsg, setDelegationSuccessMsg] = useState<string | null>(null);

  const [selectedWorkId, setSelectedWorkId] = useState<string>('');

  // Set default selected work if empty
  const currentWork = myWorks.find((w) => w.id === selectedWorkId) || myWorks[0];

  const isAssignedToOther = !!(isSeniorDesigner && currentWork && (
    (currentWork.assignedSubDesignerId && currentWork.assignedSubDesignerId !== activeUser.id) ||
    (currentWork.designerBrief?.assignedDesignerId && currentWork.designerBrief.assignedDesignerId !== activeUser.id)
  ));

  const handleDelegateWork = (targetWork: WorkAssignment) => {
    const chosenDesignerId = selectedAssigneeMap[targetWork.id] || targetWork.assignedSubDesignerId || targetWork.designerBrief?.assignedDesignerId || designers[0]?.id || '';
    const targetDesigner = designers.find((d) => d.id === chosenDesignerId) || designers[0];
    const guidanceNote = guidanceNotesMap[targetWork.id] !== undefined ? guidanceNotesMap[targetWork.id] : (targetWork.seniorDesignerNotes || '');

    const updated: WorkAssignment = {
      ...targetWork,
      assignedSeniorDesignerId: activeUser.id,
      assignedSeniorDesignerName: activeUser.name,
      assignedSubDesignerId: targetDesigner ? targetDesigner.id : chosenDesignerId,
      assignedSubDesignerName: targetDesigner ? targetDesigner.name : 'Team Designer',
      seniorDesignerNotes: guidanceNote,
      seniorDesignerAssignedAt: new Date().toLocaleString(),
      designerBrief: targetWork.designerBrief ? {
        ...targetWork.designerBrief,
        assignedDesignerId: targetDesigner ? targetDesigner.id : chosenDesignerId,
        assignedDesignerName: targetDesigner ? targetDesigner.name : 'Team Designer',
      } : {
        briefText: 'Creative brief assigned from Senior Designer Desk',
        attachments: [],
        assignedDesignerId: targetDesigner ? targetDesigner.id : chosenDesignerId,
        assignedDesignerName: targetDesigner ? targetDesigner.name : 'Team Designer',
        assignedAt: new Date().toLocaleString(),
      },
      designerBriefStatus: targetWork.designerBriefStatus || 'SCHEDULED',
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onUpdateWork(updated);
    setDelegationSuccessMsg(`✅ Work assignment successfully delegated to ${targetDesigner ? targetDesigner.name : 'Designer'}`);
    setTimeout(() => setDelegationSuccessMsg(null), 4000);
  };

  // Form states for RECE PPT Upload
  const [recePptFile, setRecePptFile] = useState<File | null>(null);
  const [recePptComments, setRecePptComments] = useState('');
  const [recePptError, setRecePptError] = useState<string | null>(null);

  // Form states for Design PPT Upload
  const [designPptFile, setDesignPptFile] = useState<File | null>(null);
  const [designPptComments, setDesignPptComments] = useState('');
  const [designPptError, setDesignPptError] = useState<string | null>(null);

  // Handle setting work selection and pre-populating forms
  const handleSelectWork = (workId: string) => {
    setSelectedWorkId(workId);
    const w = myWorks.find((x) => x.id === workId);
    if (w) {
      setRecePptComments(w.designerRecePptComments || 'Created receipt report presentation slides.');
      setDesignPptComments(w.designerDesignPptComments || 'Finished 3D facade mockups and brand identity artwork.');
    }
  };

  // Helper to open media or doc fullscreen
  const handleViewMedia = (url: string, title: string) => {
    if (window.showGlobalImageViewer) {
      window.showGlobalImageViewer(url, title);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleDownload = () => {
    if (!currentWork) return;
    const fileContent = `--- Creative Asset Download for ${currentWork.brandName} ---\n\n` +
      `Project Title: ${currentWork.workTitle}\n` +
      `Client Company: ${currentWork.clientCompanyName}\n` +
      `Design Phase Report generated by: ${activeUser.name}\n\n` +
      `Approved measurements: Width: 32ft, Height: 12.5ft\n` +
      `Material requirements and safety layouts fully validated.`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentWork.brandName.toLowerCase()}_presentation_deck.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Step 1 Handler: Accept Brief and update status
  const handleAcceptBrief = (status: 'WORKING' | 'HOLD' | 'SCHEDULED') => {
    if (!currentWork) return;
    const updated: WorkAssignment = {
      ...currentWork,
      designerBriefStatus: status,
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateWork(updated);
  };

  // Step 2 Handler: Upload RECE PPT
  const handleSubmitRecePpt = () => {
    if (!currentWork) return;
    if (!recePptFile) {
      setRecePptError('⚠️ Upload Error: Please select a presentation PPT or document file to upload before submitting.');
      return;
    }

    setRecePptError(null);
    const pptUrl = URL.createObjectURL(recePptFile);
    const pptTitle = recePptFile.name;

    const updated: WorkAssignment = {
      ...currentWork,
      designerRecePptUrl: pptUrl,
      designerRecePptTitle: pptTitle,
      designerRecePptComments: recePptComments || 'Uploaded complete RECE PowerPoint slides.',
      designerRecePptSubmittedAt: new Date().toLocaleString(),
      designerRecePptApprovedByCrm: 'PENDING', // Reset to pending for CRM
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateWork(updated);
  };

  // Step 4 Handler: Update status working on designs
  const handleStartDesigns = (status: 'WORKING' | 'HOLD' | 'COMPLETED') => {
    if (!currentWork) return;
    const updated: WorkAssignment = {
      ...currentWork,
      designerDesignStatus: status,
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateWork(updated);
  };

  // Step 5 Handler: Upload Design PPT
  const handleSubmitDesignPpt = () => {
    if (!currentWork) return;
    if (!designPptFile) {
      setDesignPptError('⚠️ Upload Error: Please select an artwork design PPT or image file to upload before submitting.');
      return;
    }

    setDesignPptError(null);
    const pptUrl = URL.createObjectURL(designPptFile);
    const pptTitle = designPptFile.name;

    const updated: WorkAssignment = {
      ...currentWork,
      designerDesignPptUrl: pptUrl,
      designerDesignPptTitle: pptTitle,
      designerDesignPptComments: designPptComments || 'Finished final artwork rendering layouts and presentation material.',
      designerDesignPptSubmittedAt: new Date().toLocaleString(),
      designerDesignPptApprovedByCrm: 'PENDING',
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateWork(updated);
  };

  // Helper to figure out the active visual step of designer workflow
  const getDesignerActiveStep = (w: WorkAssignment): number => {
    if (!w.designerBriefStatus || w.designerBriefStatus === 'PENDING') return 1;
    if (!w.designerRecePptUrl) return 2;
    if (w.designerRecePptApprovedByCrm !== 'APPROVED') return 3;
    if (!w.designerDesignStatus || w.designerDesignStatus === 'NOT_STARTED') return 4;
    if (!w.designerDesignPptUrl || w.designerDesignPptApprovedByCrm === 'EDITS') return 5;
    if (w.designerDesignPptApprovedByCrm !== 'APPROVED') return 6;
    return 7; // Completed / Closed!
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Designer Creative Studio Portal</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200 font-mono">
                2D/3D STUDIO • PPT
              </span>
            </h2>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://1drv.ms/f/c/5B3D25D3EA1B900F/IgAJlltjpsdsSY1fD3GR0QVrAV9kNgpAmu6qZpI4wMFDwKk?e=7y5YOU"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer group shadow-2xs"
            title="Open OneDrive Designer Cloud Storage"
          >
            <FolderSync className="w-4 h-4 text-blue-600 group-hover:rotate-180 transition-transform duration-500" />
            <span>OneDrive Cloud Storage ↗</span>
          </a>
          <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            Role: <span className="font-bold text-purple-700">{activeUser.name} ({isSeniorDesigner ? 'Senior Designer Lead' : 'Designer Team Member'})</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Briefs List Box */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Inbox className="w-4 h-4 text-purple-600" />
                Assigned Briefs Inbox ({myWorks.length})
              </h3>
            </div>

            {myWorks.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <p>No creative design assignments found for your account.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {myWorks.map((work) => {
                  const isActive = work.id === selectedWorkId || (!selectedWorkId && myWorks[0].id === work.id);
                  const activeStepNum = getDesignerActiveStep(work);
                  const isClosed = work.designerDesignPptApprovedByCrm === 'APPROVED';

                  return (
                    <button
                      key={work.id}
                      onClick={() => handleSelectWork(work.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-purple-50/70 border-purple-400 shadow-xs text-purple-900'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-[10px] uppercase font-black tracking-wide text-purple-600 bg-purple-100/60 px-2 py-0.5 rounded">
                          {work.brandName}
                        </span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          isClosed 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {isClosed ? 'Task Closed' : `Step ${activeStepNum}/6`}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-extrabold text-xs truncate text-slate-900">{work.workTitle}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{work.clientCompanyName}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] border-t border-dashed border-slate-100 pt-2 mt-1">
                        <span className="font-bold">Brief Status: {work.designerBriefStatus || 'PENDING'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Task Sequential Wizard */}
        <div className="lg:col-span-2 space-y-4">
          {!currentWork ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-xs">
              <p className="font-semibold">Please select an assigned brief from your inbox to view your sequential pipeline.</p>
            </div>
          ) : (
            <>
              {/* Sequential Steps Navigation Header */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
                  <span className="uppercase tracking-wider text-purple-600">Sequential Execution Pipeline</span>
                  <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    Active Step: {getDesignerActiveStep(currentWork) === 7 ? 'COMPLETED' : `Step ${getDesignerActiveStep(currentWork)} of 6`}
                  </span>
                </div>
                
                <div className="grid grid-cols-6 gap-1 pb-1">
                  {[
                    { s: 1, label: 'Accept Brief' },
                    { s: 2, label: 'Upload RECE PPT' },
                    { s: 3, label: 'Wait RECE Appr.' },
                    { s: 4, label: 'Start Designs' },
                    { s: 5, label: 'Upload Design' },
                    { s: 6, label: 'Wait Appr. (Close)' }
                  ].map((step) => {
                    const activeStepNum = getDesignerActiveStep(currentWork);
                    const isCompleted = activeStepNum > step.s;
                    const isActive = activeStepNum === step.s;

                    return (
                      <div key={step.s} className="text-center space-y-1">
                        <div className={`h-1.5 rounded-full ${
                          isCompleted 
                            ? 'bg-emerald-500' 
                            : isActive 
                            ? 'bg-purple-600 animate-pulse' 
                            : 'bg-slate-200'
                        }`} />
                        <p className={`text-[8px] font-bold truncate ${
                          isActive ? 'text-purple-700 font-extrabold' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                        }`}>
                          {step.s}. {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Senior Designer Allocation Section (If active user is Senior Designer) */}
              {isSeniorDesigner && currentWork && (
                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                        <Palette className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold tracking-wide text-white flex items-center gap-2">
                          👑 Senior Designer Work Allocation & Delegation Desk
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Received from CRM ({currentWork.assignedCrmName || 'CRM Team'}). Select a designer from your team below to delegate this task.
                        </p>
                      </div>
                    </div>
                    {currentWork.assignedSubDesignerName || (currentWork.designerBrief?.assignedDesignerId && currentWork.designerBrief.assignedDesignerId !== activeUser.id) ? (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Currently Assigned to: {currentWork.assignedSubDesignerName || currentWork.designerBrief.assignedDesignerName}
                      </span>
                    ) : (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending Allocation to Team Member
                      </span>
                    )}
                  </div>

                  {delegationSuccessMsg && (
                    <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs p-3 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                      <span>{delegationSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Select Team Designer from Dropdown:
                      </label>
                      <select
                        value={selectedAssigneeMap[currentWork.id] || currentWork.assignedSubDesignerId || currentWork.designerBrief?.assignedDesignerId || (designers[0]?.id || '')}
                        onChange={(e) => setSelectedAssigneeMap({ ...selectedAssigneeMap, [currentWork.id]: e.target.value })}
                        className="w-full text-xs p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      >
                        {designers.map((d) => (
                          <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                            👤 {d.name} ({d.department || 'Creative Team'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Senior Designer Guidance & Technical Instructions:
                      </label>
                      <input
                        type="text"
                        value={guidanceNotesMap[currentWork.id] !== undefined ? guidanceNotesMap[currentWork.id] : (currentWork.seniorDesignerNotes || '')}
                        onChange={(e) => setGuidanceNotesMap({ ...guidanceNotesMap, [currentWork.id]: e.target.value })}
                        placeholder="e.g. Focus on LED neon channel letters, confirm client color specs..."
                        className="w-full text-xs p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleDelegateWork(currentWork)}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" /> Delegate & Assign Work to Designer
                    </button>
                  </div>
                </div>
              )}

              {/* Regular Designer Delegation Banner (If active user is Regular Designer) */}
              {!isSeniorDesigner && currentWork && (
                <div className="bg-purple-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm border border-purple-700">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30 font-bold text-xs">
                      👑
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                        Design Request Assigned By Senior Designer: {currentWork.assignedSeniorDesignerName || 'Krishna (Sr Designer)'}
                      </div>
                      {currentWork.seniorDesignerNotes ? (
                        <p className="text-[11px] text-purple-200 mt-0.5">
                          <strong>Senior Designer Instructions:</strong> {currentWork.seniorDesignerNotes}
                        </p>
                      ) : (
                        <p className="text-[10px] text-purple-300 mt-0.5">
                          Direct task assignment from Senior Designer Lead.
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] bg-purple-950 text-purple-200 px-3 py-1 rounded-full border border-purple-700 font-bold uppercase tracking-wider">
                    Verified Senior Designer Assignment
                  </span>
                </div>
              )}

              {/* Main Step Content Container */}
              {isAssignedToOther ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
                  {/* Read-only details / files header */}
                  <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] uppercase font-black text-purple-700 bg-purple-100/70 px-2.5 py-1 rounded tracking-wider font-mono">
                        DELEGATED WORKSPACE • MONITOR MODE
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">{currentWork.workTitle}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Assigned To: <span className="text-purple-700 font-bold">{currentWork.assignedSubDesignerName || currentWork.designerBrief?.assignedDesignerName || 'Team Designer'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider font-mono">Workflow Status</span>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg inline-block mt-1.5 font-mono uppercase border ${
                        currentWork.designerDesignPptApprovedByCrm === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-purple-100 text-purple-800 border-purple-200'
                      }`}>
                        {currentWork.designerDesignPptApprovedByCrm === 'APPROVED' ? 'Task Closed & Handover' : 'In Progress by Junior'}
                      </span>
                    </div>
                  </div>

                  <FileDownloadList files={[
                    { url: currentWork.designerRecePptUrl || '', title: currentWork.designerRecePptTitle || 'RECE PPT' },
                    { url: currentWork.designerDesignPptUrl || '', title: currentWork.designerDesignPptTitle || 'Design PPT' }
                  ]} />

                  {/* Elegant Step-by-Step Tracker */}
                  <div className="space-y-4 pt-2">
                    <div className="border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Clock className="w-4 h-4 text-purple-600 animate-pulse" />
                        Live Team Designer Progress Steps
                      </h4>
                    </div>

                    <div className="relative border-l-2 border-purple-100 pl-6 ml-3.5 space-y-6">
                      
                      {/* STEP 1: ACCEPT BRIEF */}
                      <div className="relative">
                        <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                          currentWork.designerBriefStatus && currentWork.designerBriefStatus !== 'PENDING'
                            ? 'bg-purple-600 border-purple-600'
                            : 'bg-white border-slate-300'
                        }`} />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 font-mono">STEP 1</span>
                            <span className="text-xs font-bold text-slate-800">Brief Assignment & Acceptance</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                              currentWork.designerBriefStatus === 'WORKING'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : currentWork.designerBriefStatus === 'HOLD'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : currentWork.designerBriefStatus === 'SCHEDULED'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                              {currentWork.designerBriefStatus || 'PENDING'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Delegated with guidelines: <span className="font-medium text-slate-700">"{currentWork.seniorDesignerNotes || 'N/A'}"</span>
                          </p>
                        </div>
                      </div>

                      {/* STEP 2: RECE PPT UPLOAD */}
                      <div className="relative">
                        <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                          currentWork.designerRecePptUrl
                            ? 'bg-purple-600 border-purple-600'
                            : 'bg-white border-slate-300'
                        }`} />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 font-mono">STEP 2</span>
                            <span className="text-xs font-bold text-slate-800">RECE Presentation PPT Compilation</span>
                          </div>
                          {currentWork.designerRecePptUrl ? (
                            <div className="mt-1 space-y-1 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 max-w-md">
                              <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Uploaded: {currentWork.designerRecePptTitle}
                              </span>
                              {currentWork.designerRecePptComments && (
                                <p className="text-[11px] text-slate-600 italic">Comments: "{currentWork.designerRecePptComments}"</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-1 font-medium">Awaiting RECE presentation upload from assigned designer.</p>
                          )}
                        </div>
                      </div>

                      {/* STEP 3: CRM RECE PPT APPROVAL */}
                      <div className="relative">
                        <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                          currentWork.designerRecePptApprovedByCrm === 'APPROVED'
                            ? 'bg-purple-600 border-purple-600'
                            : currentWork.designerRecePptApprovedByCrm === 'EDITS'
                            ? 'bg-rose-500 border-rose-500'
                            : 'bg-white border-slate-300'
                        }`} />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 font-mono">STEP 3</span>
                            <span className="text-xs font-bold text-slate-800">CRM RECE PPT Approval Status</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                              currentWork.designerRecePptApprovedByCrm === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-mono'
                                : currentWork.designerRecePptApprovedByCrm === 'EDITS'
                                ? 'bg-rose-50 text-rose-800 border-rose-200 font-mono'
                                : 'bg-amber-50 text-amber-800 border-amber-200 font-mono'
                            }`}>
                              {currentWork.designerRecePptApprovedByCrm || 'AWAITING_REVIEW'}
                            </span>
                          </div>
                          {currentWork.designerRecePptCrmComments && (
                            <div className="bg-slate-100 p-2.5 rounded-lg mt-1.5 border border-slate-200 max-w-lg text-[11px]">
                              <strong className="text-slate-800">CRM Audit Comments:</strong>
                              <p className="text-slate-600 italic mt-0.5">"{currentWork.designerRecePptCrmComments}"</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* STEP 4: DESIGN STATUS */}
                      <div className="relative">
                        <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                          currentWork.designerDesignStatus && currentWork.designerDesignStatus !== 'NOT_STARTED'
                            ? 'bg-purple-600 border-purple-600'
                            : 'bg-white border-slate-300'
                        }`} />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 font-mono">STEP 4</span>
                            <span className="text-xs font-bold text-slate-800">3D Visuals & Facade Artwork Status</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                              currentWork.designerDesignStatus === 'WORKING'
                                ? 'bg-purple-50 text-purple-800 border-purple-200 font-mono'
                                : currentWork.designerDesignStatus === 'HOLD'
                                ? 'bg-rose-50 text-rose-800 border-rose-200 font-mono'
                                : 'bg-slate-50 text-slate-600 border-slate-200 font-mono'
                            }`}>
                              {currentWork.designerDesignStatus || 'NOT_STARTED'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Concept status representing active 3D artwork files creation.
                          </p>
                        </div>
                      </div>

                      {/* STEP 5: DESIGN PRESENTATION UPLOAD */}
                      <div className="relative">
                        <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                          currentWork.designerDesignPptUrl
                            ? 'bg-purple-600 border-purple-600'
                            : 'bg-white border-slate-300'
                        }`} />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 font-mono">STEP 5</span>
                            <span className="text-xs font-bold text-slate-800">Artwork & Concept Presentation</span>
                          </div>
                          {currentWork.designerDesignPptUrl ? (
                            <div className="mt-1 space-y-1 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 max-w-md">
                              <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Uploaded: {currentWork.designerDesignPptTitle}
                              </span>
                              {currentWork.designerDesignPptComments && (
                                <p className="text-[11px] text-slate-600 italic">Comments: "{currentWork.designerDesignPptComments}"</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-1 font-medium">Awaiting creative design concepts & signage proposal file upload.</p>
                          )}
                        </div>
                      </div>

                      {/* STEP 6: CRM DESIGN APPROVAL */}
                      <div className="relative">
                        <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                          currentWork.designerDesignPptApprovedByCrm === 'APPROVED'
                            ? 'bg-purple-600 border-purple-600'
                            : currentWork.designerDesignPptApprovedByCrm === 'EDITS'
                            ? 'bg-rose-500 border-rose-500'
                            : 'bg-white border-slate-300'
                        }`} />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 font-mono">STEP 6</span>
                            <span className="text-xs font-bold text-slate-800">CRM Artwork Design Approval Status</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                              currentWork.designerDesignPptApprovedByCrm === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-mono'
                                : currentWork.designerDesignPptApprovedByCrm === 'EDITS'
                                ? 'bg-rose-50 text-rose-800 border-rose-200 font-mono'
                                : 'bg-slate-50 text-slate-600 border-slate-200 font-mono'
                            }`}>
                              {currentWork.designerDesignPptApprovedByCrm || 'AWAITING_REVIEW'}
                            </span>
                          </div>
                          {currentWork.designerDesignPptCrmComments && (
                            <div className="bg-slate-100 p-2.5 rounded-lg mt-1.5 border border-slate-200 max-w-lg text-[11px]">
                              <strong className="text-slate-800">CRM Artwork Audit Comments:</strong>
                              <p className="text-slate-600 italic mt-0.5">"{currentWork.designerDesignPptCrmComments}"</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* STEP 7: HANDOVER & CLOSED */}
                      <div className="relative">
                        <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                          currentWork.designerDesignPptApprovedByCrm === 'APPROVED'
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-white border-slate-300'
                        }`} />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 font-mono">STEP 7</span>
                            <span className="text-xs font-bold text-slate-800">Task Handover to Estimation Team</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Once both RECE PPT and Design concepts are accepted, the work assignment is ready for official estimation, billing, and fabrication layouts.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
                
                <FileDownloadList files={[
                  { url: currentWork.designerRecePptUrl || '', title: currentWork.designerRecePptTitle || 'RECE PPT' },
                  { url: currentWork.designerDesignPptUrl || '', title: currentWork.designerDesignPptTitle || 'Design PPT' }
                ]} />
                
                <DesignRequestManager 
                  work={currentWork} 
                  onUpdateWork={onUpdateWork} 
                  activeUser={activeUser}
                  role="DESIGNER"
                />

                {/* Visual Header of Work Assignment */}
                <div className="border-b border-slate-100 pb-3 flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                     {/* Previous Step Button */}
                     {getDesignerActiveStep(currentWork) > 1 && getDesignerActiveStep(currentWork) < 7 && (
                        <button
                          onClick={() => {
                            // Simple previous step logic: if it's a step with a status, set it back to PENDING or WORKING
                            const currentStep = getDesignerActiveStep(currentWork);
                            if (currentStep === 2) {
                                // Previous is step 1 - Accept Brief.
                                // Revert to STEP 1 state.
                                const updated: WorkAssignment = {
                                    ...currentWork,
                                    designerRecePptUrl: undefined,
                                    designerRecePptApprovedByCrm: 'PENDING',
                                };
                                onUpdateWork(updated);
                            }
                            // Add more logic for other steps if needed
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          ← Previous
                        </button>
                     )}
                     <div>
                        <span className="text-[10px] uppercase font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded tracking-wide">
                          Brand Design Workflow
                        </span>
                        <h3 className="text-lg font-black text-slate-900 mt-1">{currentWork.workTitle}</h3>
                        <p className="text-xs text-slate-500 font-medium">CRM Dispatch: {currentWork.assignedCrmName}</p>
                     </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Submission Status</span>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg inline-block mt-0.5 ${
                      currentWork.designerDesignPptApprovedByCrm === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}>
                      {currentWork.designerDesignPptApprovedByCrm === 'APPROVED' ? 'Task Closed & Handover' : 'In Progress'}
                    </span>
                  </div>
                </div>

                {/* STEP 1: ACCEPT BRIEF & SHOW ONLY THAT BRIEF */}
                {getDesignerActiveStep(currentWork) === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 space-y-2">
                      <h4 className="text-xs font-extrabold text-purple-950 uppercase tracking-wider">
                        📬 Design Brief Instructions from CRM
                      </h4>
                      <p className="text-xs text-purple-900 leading-relaxed italic">
                        "{currentWork.designerBrief?.briefText || 'Please audit the RECE photos and notes to compile an official RECE client pitch proposal PPT.'}"
                      </p>
                      {currentWork.designerBrief?.attachments && currentWork.designerBrief.attachments.length > 0 && (
                        <div className="pt-2 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-purple-950/80 block">Dispatched Assets & Reference Images:</span>
                          <div className="flex flex-wrap gap-2">
                            {currentWork.designerBrief.attachments.map((att, idx) => {
                              const isImage = att.startsWith('http://') || att.startsWith('https://') || att.startsWith('data:');
                              return (
                                <span 
                                  key={idx}
                                  onClick={() => {
                                    if (isImage && window.showGlobalImageViewer) {
                                      window.showGlobalImageViewer(att, `Reference Asset ${idx + 1}`);
                                    } else if (!isImage) {
                                      // If it is a generic file name, open mock download or view
                                      alert(`Opening document: ${att}`);
                                    }
                                  }}
                                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all shadow-2xs select-none ${
                                    isImage 
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer' 
                                      : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50 cursor-pointer'
                                  }`}
                                >
                                  {isImage ? (
                                    <>📸 View Reference Photo {idx + 1}</>
                                  ) : (
                                    <><FileText className="w-3.5 h-3.5 text-purple-600" /> {att}</>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ONLY SHOW THAT DETAILS OF RECE REPORT UPLOADED */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-purple-600" />
                        Attached Site RECE Report Details (Passed to you)
                      </h4>

                      {currentWork.receSubmission ? (
                        <div className="space-y-3.5">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400">RECE Staff Notes:</span>
                            <p className="text-xs text-slate-800 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                              "{currentWork.receSubmission.notes}"
                            </p>
                          </div>

                          {currentWork.receSubmission.imageUrls && currentWork.receSubmission.imageUrls.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400">RECE Site Photos:</span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {currentWork.receSubmission.imageUrls.map((img, idx) => (
                                  <div key={idx} className="relative group overflow-hidden rounded-xl border border-slate-300 shadow-xs">
                                    <img
                                      src={img}
                                      alt="RECE Photo"
                                      className="w-full h-24 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() => handleViewMedia(img, `RECE Photo ${idx + 1} - ${currentWork.brandName}`)}
                                        className="p-1.5 bg-white text-slate-900 hover:bg-blue-600 hover:text-white rounded-lg transition-colors cursor-pointer text-[10px] font-bold shadow-md"
                                      >
                                        🔍 View
                                      </button>
                                      <a
                                        href={img}
                                        download={`RECE_Photo_${idx+1}.jpg`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 bg-white text-slate-900 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors cursor-pointer text-[10px] font-bold shadow-md"
                                      >
                                        📥 Download
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {currentWork.receSubmission.documentNames && currentWork.receSubmission.documentNames.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Attached RECE Audit Files:</span>
                              <div className="flex flex-wrap gap-2">
                                {currentWork.receSubmission.documentNames.map((name, idx) => (
                                  <div key={idx} className="bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 flex items-center gap-2 shadow-xs">
                                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                                    <span>{name}</span>
                                    <button
                                      onClick={() => handleViewMedia('https://example.com/mock.pdf', name)}
                                      className="p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-[10px] font-bold ml-1"
                                    >
                                      View
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-xs text-slate-500">
                          No direct RECE submission records detected on this project.
                        </div>
                      )}
                    </div>

                    {/* Step Actions: Accept Brief */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-extrabold text-slate-850 block mb-2">Accept the Brief & Update Status to Begin:</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleAcceptBrief('WORKING')}
                          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Accept & Start Working
                        </button>
                        <button
                          onClick={() => handleAcceptBrief('SCHEDULED')}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
                        >
                          Schedule for Later
                        </button>
                        <button
                          onClick={() => handleAcceptBrief('HOLD')}
                          className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-300 transition-colors cursor-pointer"
                        >
                          Place on Hold (Request Clarification)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: UPLOAD RECE PPT */}
                {getDesignerActiveStep(currentWork) === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200">
                      <p className="text-xs text-blue-900 font-bold leading-relaxed">
                        ✅ Brief Accepted! Status is currently set to <strong>{currentWork.designerBriefStatus}</strong>.
                        <br />
                        Next, please compile the visit details into a presentation format and upload the RECE PPT below for CRM review.
                      </p>
                    </div>

                    <a
                      href="https://1drv.ms/f/c/5B3D25D3EA1B900F/IgAJlltjpsdsSY1fD3GR0QVrAV9kNgpAmu6qZpI4wMFDwKk?e=7y5YOU"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs text-purple-900 font-medium transition-all cursor-pointer group"
                      title="Open OneDrive Storage"
                    >
                      <div className="flex items-center gap-2 font-bold">
                        <FolderSync className="w-4 h-4 text-purple-600 group-hover:rotate-180 transition-transform duration-500" />
                        <span>OneDrive Sync Target Path:</span>
                      </div>
                      <span className="font-mono font-bold text-purple-950 underline">{`OneDrive / KAMLAWATI CRM PORTAL / ${activeUser.name.replace(/\s+/g, '_')} - ${new Date().toISOString().split('T')[0]} - ${currentWork.brandName.replace(/\s+/g, '_')}`} ↗</span>
                    </a>

                    <div className="space-y-4 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Upload RECE Presentation PPT:
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setRecePptFile(e.target.files[0]);
                            }
                          }}
                          className="w-full text-xs p-2 border border-slate-300 rounded-xl file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Note:
                        </label>
                        <textarea
                          value={recePptComments}
                          onChange={(e) => setRecePptComments(e.target.value)}
                          rows={3}
                          placeholder="Include highlights of measurements, key facade layouts, and material scope..."
                          className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {recePptError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>{recePptError}</span>
                        </div>
                      )}

                      <button
                        onClick={handleSubmitRecePpt}
                        className="text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all bg-purple-600 hover:bg-purple-500 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" /> Submit RECE PPT Presentation to CRM
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: WAIT FOR CRM PERSON APPROVAL */}
                {getDesignerActiveStep(currentWork) === 3 && (
                  <div className="space-y-4 text-center py-6 animate-in fade-in duration-300">
                    {currentWork.designerRecePptApprovedByCrm === 'EDITS' ? (
                        <>
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto shadow-xs">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <h4 className="font-extrabold text-sm text-red-900">Edits Requested by CRM</h4>
                        <p className="text-xs text-red-700 leading-relaxed">
                          CRM ({currentWork.assignedCrmName}) has requested changes to the RECE PPT.
                        </p>
                        {currentWork.designerRecePptCrmComments && (
                          <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-left max-w-lg mx-auto text-xs mt-3">
                            <strong className="text-red-950 block mb-1">💬 CRM Feedback / Edits requested:</strong>
                            <p className="text-red-900">{currentWork.designerRecePptCrmComments}</p>
                          </div>
                        )}
                        <div className="pt-4">
                          <label className="block text-xs font-bold text-slate-700 mb-1">Upload Revised RECE Presentation PPT:</label>
                          <input
                            type="file"
                            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                setRecePptFile(e.target.files[0]);
                              }
                            }}
                            className="w-full text-xs p-2 border border-slate-300 rounded-xl file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                          />
                          {recePptError && (
                            <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 font-medium my-2">
                              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                              <span>{recePptError}</span>
                            </div>
                          )}
                          <button
                            onClick={handleSubmitRecePpt}
                            className="mt-3 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all mx-auto bg-purple-600 hover:bg-purple-500 cursor-pointer"
                          >
                            <Upload className="w-4 h-4" /> Submit Revised RECE PPT
                          </button>
                        </div>
                        </>
                    ) : (
                        <>
                        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                          <Clock className="w-6 h-6 animate-spin" />
                        </div>
                        
                        <div className="space-y-1 max-w-md mx-auto">
                          <h4 className="font-extrabold text-sm text-slate-900">Awaiting CRM Person Approval</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            You have successfully uploaded the RECE PPT: <strong>{currentWork.designerRecePptTitle}</strong>. 
                            The CRM Exec ({currentWork.assignedCrmName}) is currently reviewing the slides for approval or edits.
                          </p>
                        </div>
                        </>
                    )}
                  </div>
                )}

                {/* STEP 4: UPDATE STATUS OF WORKING ON DESIGNS */}
                {getDesignerActiveStep(currentWork) === 4 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-1">
                      <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-1">
                        ✓ RECE PPT Approved by CRM!
                      </h4>
                      <p className="text-xs text-emerald-900 leading-relaxed">
                        Your RECE PowerPoint was approved by {currentWork.assignedCrmName}. 
                        Please begin working on the final 3D visual mockups, brand designs, and signage concepts.
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="text-xs font-extrabold text-slate-850 block mb-2">
                        Update Creative Design Working Status to proceed:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleStartDesigns('WORKING')}
                          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Palette className="w-4 h-4" /> Mark "Working on Designs"
                        </button>
                        <button
                          onClick={() => handleStartDesigns('HOLD')}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
                        >
                          Place Design on Hold
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: UPLOAD PRESENTATION OF DESIGN */}
                {getDesignerActiveStep(currentWork) === 5 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {currentWork.designerDesignPptApprovedByCrm === 'EDITS' ? (
                      <div className="space-y-4 text-center py-2">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto shadow-xs">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <h4 className="font-extrabold text-sm text-red-900">Edits Requested by CRM on Artwork</h4>
                        <p className="text-xs text-red-700 leading-relaxed max-w-md mx-auto">
                          CRM ({currentWork.assignedCrmName || 'Exec'}) has requested changes / revisions to the final artwork design.
                        </p>
                        {currentWork.designerDesignPptCrmComments && (
                          <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-left max-w-lg mx-auto text-xs mt-3">
                            <strong className="text-red-950 block mb-1">💬 CRM Feedback / Artwork Edits requested:</strong>
                            <p className="text-red-900">{currentWork.designerDesignPptCrmComments}</p>
                          </div>
                        )}

                        <div className="pt-4 text-left space-y-4 max-w-xl mx-auto">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Upload Revised Design Presentation PPT / Artwork File:
                            </label>
                            <input
                              type="file"
                              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  setDesignPptFile(e.target.files[0]);
                                }
                              }}
                              className="w-full text-xs p-2 border border-slate-300 rounded-xl file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Revision Notes & Technical Specs:
                            </label>
                            <textarea
                              value={designPptComments}
                              onChange={(e) => setDesignPptComments(e.target.value)}
                              rows={3}
                              placeholder="Describe changes made according to CRM feedback..."
                              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          {designPptError && (
                            <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 font-medium my-2">
                              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                              <span>{designPptError}</span>
                            </div>
                          )}

                          <button
                            onClick={handleSubmitDesignPpt}
                            className="mt-3 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all mx-auto bg-purple-600 hover:bg-purple-500 cursor-pointer"
                          >
                            <Upload className="w-4 h-4" /> Submit Revised Design Artwork to CRM
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                          <p className="text-xs text-blue-900 font-bold">
                            🎨 You are currently marked as: <strong>{currentWork.designerDesignStatus}</strong> on artwork.
                            <br />
                            Once the architectural views and layouts are complete, upload the final Design Artwork PPT below for final CRM approval.
                          </p>
                        </div>

                        <a
                          href="https://1drv.ms/f/c/5B3D25D3EA1B900F/IgAJlltjpsdsSY1fD3GR0QVrAV9kNgpAmu6qZpI4wMFDwKk?e=7y5YOU"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs text-purple-900 font-medium transition-all cursor-pointer group"
                          title="Open OneDrive Storage"
                        >
                          <div className="flex items-center gap-2 font-bold">
                            <FolderSync className="w-4 h-4 text-purple-600 group-hover:rotate-180 transition-transform duration-500" />
                            <span>OneDrive Sync Target Path:</span>
                          </div>
                          <span className="font-mono font-bold text-purple-950 underline">{`OneDrive / KAMLAWATI CRM PORTAL / ${activeUser.name.replace(/\s+/g, '_')} - ${new Date().toISOString().split('T')[0]} - ${currentWork.brandName.replace(/\s+/g, '_')}`} ↗</span>
                        </a>

                        <div className="space-y-4 pt-1">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Upload Design Presentation PPT:
                            </label>
                            <input
                              type="file"
                              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  setDesignPptFile(e.target.files[0]);
                                }
                              }}
                              className="w-full text-xs p-2 border border-slate-300 rounded-xl file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Artwork Notes & Technical Specs:
                            </label>
                            <textarea
                              value={designPptComments}
                              onChange={(e) => setDesignPptComments(e.target.value)}
                              rows={3}
                              placeholder="Include specifications for Neon, ACP, Samsung LED spacing, physical profile..."
                              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          {designPptError && (
                            <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium">
                              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                              <span>{designPptError}</span>
                            </div>
                          )}

                          <button
                            onClick={handleSubmitDesignPpt}
                            className="text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all bg-purple-600 hover:bg-purple-500 cursor-pointer"
                          >
                            <Upload className="w-4 h-4" /> Submit Final Design Artwork to CRM
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* STEP 6: WAIT FOR FINAL CRM APPROVAL */}
                {getDesignerActiveStep(currentWork) === 6 && (
                  <div className="space-y-4 text-center py-6 animate-in fade-in duration-300">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                      <Clock className="w-6 h-6 animate-spin" />
                    </div>

                    <div className="space-y-1 max-w-md mx-auto">
                      <h4 className="font-extrabold text-sm text-slate-900">Awaiting Final CRM Design Sign-Off</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        You have submitted your final design deck: <strong>{currentWork.designerDesignPptTitle}</strong>.
                        We are waiting for CRM to approve these designs. Once approved, your task closes automatically.
                      </p>
                    </div>

                    {currentWork.designerDesignPptCrmComments && (
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-left max-w-lg mx-auto text-xs mt-3">
                        <strong className="text-orange-950 block mb-1">💬 CRM Feedback / Changes requested:</strong>
                        <p className="text-orange-900">{currentWork.designerDesignPptCrmComments}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => handleViewMedia(currentWork.designerDesignPptUrl || '', currentWork.designerDesignPptTitle || 'Design PPT')}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" /> View Submitted Designs
                      </button>
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> Download Design PPT
                      </button>
                    </div>
                  </div>
                )}

                {/* STATE 7: CLOSED / COMPLETED! */}
                {getDesignerActiveStep(currentWork) === 7 && (
                  <div className="space-y-6 text-center py-8 animate-in zoom-in-95 duration-300">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-1.5 max-w-lg mx-auto">
                      <h4 className="font-black text-base text-slate-900">Task Successfully Approved & Closed!</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        Excellent job! Both your RECE PPT and final Design presentation decks have been approved and closed by CRM Exec {currentWork.assignedCrmName}.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-xl mx-auto space-y-3.5 text-left text-xs">
                      <div className="font-bold text-slate-800 border-b border-slate-200 pb-1.5">📁 Final Project Documents Vault</div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">RECE Presentation PPT:</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewMedia(currentWork.designerRecePptUrl || '', currentWork.designerRecePptTitle || 'RECE PPT')}
                            className="px-2.5 py-1 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          <button
                            onClick={handleDownload}
                            className="px-2.5 py-1 text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" /> Save
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Creative Concept Art Presentation:</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewMedia(currentWork.designerDesignPptUrl || '', currentWork.designerDesignPptTitle || 'Design PPT')}
                            className="px-2.5 py-1 text-[10px] font-bold bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          <button
                            onClick={handleDownload}
                            className="px-2.5 py-1 text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" /> Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
