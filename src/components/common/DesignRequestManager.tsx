import React, { useState } from 'react';
import { WorkAssignment, DesignRequest, UserAccount, DesignRequestRevision } from '../../types';
import { downloadFile, compressImageFile } from '../../lib/fileUtils';
import { 
  Upload as UploadIcon, 
  Send as SendIcon, 
  FileText as FileTextIcon, 
  CheckCircle as CheckCircleIcon, 
  Clock as ClockIcon, 
  Download as DownloadIcon, 
  HardDrive as HardDriveIcon, 
  UserCheck as UserCheckIcon, 
  AlertTriangle as AlertTriangleIcon, 
  Edit3 as Edit3Icon, 
  History as HistoryIcon, 
  CheckCircle2 as CheckCircle2Icon, 
  MessageSquare as MessageSquareIcon,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';

interface Props {
  work: WorkAssignment;
  onUpdateWork: (work: WorkAssignment) => void;
  activeUser: any;
  role: string;
  designers?: UserAccount[];
}

export const DesignRequestManager: React.FC<Props> = ({ work, onUpdateWork, activeUser, role, designers = [] }) => {
  const [briefText, setBriefText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedDesignerId, setSelectedDesignerId] = useState<string>('ALL');
  const [requestError, setRequestError] = useState<string | null>(null);

  // Per-request local state for designer uploads and CRM edit requests
  const [responseFileMap, setResponseFileMap] = useState<{ [requestId: string]: File | null }>({});
  const [activeEditRequestId, setActiveEditRequestId] = useState<string | null>(null);
  const [editNoteMap, setEditNoteMap] = useState<{ [requestId: string]: string }>({});
  const [editRefFileMap, setEditRefFileMap] = useState<{ [requestId: string]: File | null }>({});
  const [showHistoryMap, setShowHistoryMap] = useState<{ [requestId: string]: boolean }>({});

  // Error message maps
  const [designerUploadErrorMap, setDesignerUploadErrorMap] = useState<{ [requestId: string]: string | null }>({});
  const [crmEditErrorMap, setCrmEditErrorMap] = useState<{ [requestId: string]: string | null }>({});

  const todayDateStr = new Date().toISOString().split('T')[0];
  const personNameStr = (activeUser?.name || 'Designer').replace(/\s+/g, '_');
  const projectNameStr = (work.brandName || work.clientCompanyName || 'General').replace(/\s+/g, '_');
  const oneDriveFolderPath = `OneDrive / KAMLAWATI CRM PORTAL / ${personNameStr} - ${todayDateStr} - ${projectNameStr}`;

  const userRoleUpper = (role || activeUser?.role || '').toUpperCase();
  const isRequesterRole = userRoleUpper.includes('CRM') || userRoleUpper.includes('ADMIN') || userRoleUpper.includes('SR_DESIGNER') || userRoleUpper.includes('SENIOR') || userRoleUpper.includes('MANAGER');
  const isDesignerRole = userRoleUpper.includes('DESIGNER');

  // Submit new design request
  const handleRequest = () => {
    if (!briefText.trim() && !file) {
      setRequestError('⚠️ Upload / Request Error: Please select an image/file or enter a brief description before submitting.');
      return;
    }

    setRequestError(null);
    const assignedDesignerObj = designers.find(d => d.id === selectedDesignerId);

    const createAndSave = (attachmentUrl?: string, attachmentName?: string) => {
      const newRequest: DesignRequest = {
        id: Date.now().toString(),
        requestedById: activeUser.id,
        requestedByName: activeUser.name,
        requestedByRole: activeUser.role,
        assignedDesignerId: assignedDesignerObj ? assignedDesignerObj.id : undefined,
        assignedDesignerName: assignedDesignerObj ? assignedDesignerObj.name : 'All Designers',
        briefText: briefText.trim(),
        attachmentUrl,
        attachmentName,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedWork = {
        ...work,
        designRequests: [...(work.designRequests || []), newRequest],
        lastUpdatedByName: activeUser.name,
        lastUpdatedByRole: activeUser.role,
        updatedAt: todayDateStr
      };
      onUpdateWork(updatedWork);
      setBriefText('');
      setFile(null);
    };

    if (file) {
      compressImageFile(file).then((dataUrl) => {
        createAndSave(dataUrl, file.name);
      });
    } else {
      createAndSave();
    }
  };

  // Designer starts work
  const handleStartWork = (requestId: string) => {
    const updatedRequests = (work.designRequests || []).map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'IN_PROGRESS' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    });

    onUpdateWork({ ...work, designRequests: updatedRequests });
  };

  // Designer submits / re-submits deliverable
  const handleDesignerSubmit = (requestId: string) => {
    const fileObj = responseFileMap[requestId];
    const currentReq = (work.designRequests || []).find(r => r.id === requestId);

    if (!fileObj && !currentReq?.responseFileUrl) {
      setDesignerUploadErrorMap(prev => ({
        ...prev,
        [requestId]: '⚠️ Upload Error: Please select an image or creative file to upload before clicking Submit.'
      }));
      return;
    }

    setDesignerUploadErrorMap(prev => ({ ...prev, [requestId]: null }));

    const applySubmit = (resUrl?: string, resName?: string) => {
      const updatedRequests = (work.designRequests || []).map(req => {
        if (req.id === requestId) {
          const isResubmission = req.status === 'REVISION_REQUESTED';
          const newSubmittedUrl = resUrl || req.responseFileUrl;
          const newSubmittedName = resName || req.responseFileName;

          const newHistoryItem: DesignRequestRevision | undefined = isResubmission ? {
            id: Date.now().toString(),
            note: 'Resubmitted updated creative file for review.',
            submittedFileUrl: newSubmittedUrl,
            submittedFileName: newSubmittedName,
            createdAt: new Date().toISOString(),
            createdByName: activeUser.name,
            createdByRole: activeUser.role,
          } : undefined;

          return {
            ...req,
            status: 'SUBMITTED_FOR_REVIEW' as const,
            responseFileUrl: newSubmittedUrl,
            responseFileName: newSubmittedName,
            updatedAt: new Date().toISOString(),
            revisionHistory: newHistoryItem 
              ? [...(req.revisionHistory || []), newHistoryItem]
              : req.revisionHistory
          };
        }
        return req;
      });

      onUpdateWork({ ...work, designRequests: updatedRequests });
      setResponseFileMap(prev => ({ ...prev, [requestId]: null }));
    };

    if (fileObj) {
      compressImageFile(fileObj).then((dataUrl) => {
        applySubmit(dataUrl, fileObj.name);
      });
    } else {
      applySubmit();
    }
  };

  // CRM confirms and approves the submitted creative -> CLOSES REQUEST
  const handleConfirmApprove = (requestId: string) => {
    const updatedRequests = (work.designRequests || []).map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'COMPLETED' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    });

    onUpdateWork({ ...work, designRequests: updatedRequests });
    setActiveEditRequestId(null);
  };

  // CRM submits edit request / revision instructions
  const handleRequestEdits = (requestId: string) => {
    const note = editNoteMap[requestId] || '';
    const refFile = editRefFileMap[requestId] || null;

    if (!note.trim() && !refFile) {
      setCrmEditErrorMap(prev => ({
        ...prev,
        [requestId]: '⚠️ Upload Error: Please write edit notes or select a reference image/markup file before sending.'
      }));
      return;
    }

    setCrmEditErrorMap(prev => ({ ...prev, [requestId]: null }));

    const applyEdits = (refUrl?: string, refName?: string) => {
      const updatedRequests = (work.designRequests || []).map(req => {
        if (req.id === requestId) {
          const newHistoryItem: DesignRequestRevision = {
            id: Date.now().toString(),
            note: note.trim() || 'Requested edits / changes.',
            attachmentUrl: refUrl,
            attachmentName: refName,
            createdAt: new Date().toISOString(),
            createdByName: activeUser.name,
            createdByRole: activeUser.role,
          };

          return {
            ...req,
            status: 'REVISION_REQUESTED' as const,
            revisionNotes: note.trim(),
            revisionAttachmentUrl: refUrl || req.revisionAttachmentUrl,
            revisionAttachmentName: refName || req.revisionAttachmentName,
            updatedAt: new Date().toISOString(),
            revisionHistory: [...(req.revisionHistory || []), newHistoryItem]
          };
        }
        return req;
      });

      onUpdateWork({ ...work, designRequests: updatedRequests });
      setActiveEditRequestId(null);
      setEditNoteMap(prev => ({ ...prev, [requestId]: '' }));
      setEditRefFileMap(prev => ({ ...prev, [requestId]: null }));
    };

    if (refFile) {
      compressImageFile(refFile).then((dataUrl) => {
        applyEdits(dataUrl, refFile.name);
      });
    } else {
      applyEdits();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
            🎨
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Design & File Requests Desk</h3>
            <p className="text-[11px] text-slate-500">Request creatives, review deliverables, confirm or request edits</p>
          </div>
        </div>

        {/* OneDrive Auto-Sync Target Folder Badge */}
        <a
          href="https://1drv.ms/f/c/5B3D25D3EA1B900F/IgAJlltjpsdsSY1fD3GR0QVrAV9kNgpAmu6qZpI4wMFDwKk?e=7y5YOU"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-[10px] text-blue-800 font-semibold transition-all cursor-pointer group"
          title="Click to Open OneDrive Folder"
        >
          <HardDriveIcon className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
          <span>Sync Target: <strong className="font-mono text-blue-900 underline">{oneDriveFolderPath}</strong> ↗</span>
          <span className="ml-1 px-1.5 py-0.2 bg-blue-200/60 rounded text-[9px] uppercase font-mono text-blue-900">Open OneDrive</span>
        </a>
      </div>
      
      {/* Requester New Request Submission Box */}
      {isRequesterRole && (
        <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <label className="block text-xs font-bold text-purple-950">
              Submit New Design / File Request to Designer:
            </label>
            {designers.length > 0 && (
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-purple-200">
                <UserCheckIcon className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[11px] font-semibold text-slate-700">Assign To:</span>
                <select
                  value={selectedDesignerId}
                  onChange={(e) => setSelectedDesignerId(e.target.value)}
                  className="text-xs font-bold text-purple-900 bg-transparent border-0 focus:ring-0 cursor-pointer"
                >
                  <option value="ALL">All Designers (Team)</option>
                  {designers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.department || 'Designer'})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <textarea
            value={briefText}
            onChange={(e) => {
              setBriefText(e.target.value);
              if (requestError) setRequestError(null);
            }}
            placeholder="Describe the design, dimensions, text content or file requested from designers..."
            rows={3}
            className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
          />

          {requestError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
              <span>{requestError}</span>
            </div>
          )}

          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Attach Reference File / Asset (Any Format):</span>
              <input 
                type="file" 
                accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx" 
                onChange={(e) => {
                  setFile(e.target.files ? e.target.files[0] : null);
                  if (requestError) setRequestError(null);
                }} 
                className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-800 hover:file:bg-purple-200 cursor-pointer" 
              />
            </div>
            <button
              onClick={handleRequest}
              className="px-5 py-2.5 text-white text-xs font-extrabold bg-purple-600 hover:bg-purple-500 active:bg-purple-700 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <SendIcon className="w-3.5 h-3.5" /> Submit Design Request
            </button>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {(!work.designRequests || work.designRequests.length === 0) ? (
          <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            No design requests submitted yet for this project.
          </div>
        ) : (
          work.designRequests.map((req, idx) => {
            const isEditingThisReq = activeEditRequestId === req.id;
            const currentRespFile = responseFileMap[req.id];
            const currentEditNote = editNoteMap[req.id] || '';
            const currentEditRefFile = editRefFileMap[req.id];
            const isHistoryShown = showHistoryMap[req.id] || false;
            const designerErr = designerUploadErrorMap[req.id];
            const crmEditErr = crmEditErrorMap[req.id];

            return (
              <div key={req.id || idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50/70 space-y-3 hover:border-purple-200 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-extrabold">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900">{req.requestedByName}</span>
                      <span className="text-[10px] text-slate-500 ml-1">({req.requestedByRole})</span>
                      {req.assignedDesignerName && (
                        <span className="ml-2 text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 inline-flex items-center gap-1">
                          <UserCheckIcon className="w-3 h-3 text-purple-600" />
                          Assigned To: {req.assignedDesignerName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                      req.status === 'COMPLETED' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : req.status === 'SUBMITTED_FOR_REVIEW'
                        ? 'bg-purple-100 text-purple-900 border border-purple-300 animate-pulse'
                        : req.status === 'REVISION_REQUESTED'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : req.status === 'IN_PROGRESS' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {req.status === 'COMPLETED' && '✓ Approved & Confirmed (Closed)'}
                      {req.status === 'SUBMITTED_FOR_REVIEW' && '📩 Submitted for Review'}
                      {req.status === 'REVISION_REQUESTED' && '✏️ Edits / Revisions Requested'}
                      {req.status === 'IN_PROGRESS' && '⏳ In Progress'}
                      {req.status === 'PENDING' && '🕒 Pending Pick-up'}
                    </span>
                  </div>
                </div>

                {/* Brief Content */}
                <p className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {req.briefText || 'No description provided.'}
                </p>

                {/* Reference Attachment from Requester */}
                {req.attachmentUrl && (
                  <div className="flex items-center justify-between bg-purple-50/60 p-2.5 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 truncate">
                      <FileTextIcon className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="truncate">Reference Attachment: <strong>{req.attachmentName || 'Attachment'}</strong></span>
                    </div>
                    <button
                      onClick={() => downloadFile(req.attachmentUrl!, req.attachmentName)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-md flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <DownloadIcon className="w-3 h-3" /> Download Reference
                    </button>
                  </div>
                )}

                {/* Latest Submitted Deliverable from Designer */}
                {req.responseFileUrl && (
                  <div className="flex flex-wrap items-center justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-200 gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-950 truncate">
                      <CheckCircleIcon className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Designer Deliverable: <strong>{req.responseFileName || 'Completed Creative'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadFile(req.responseFileUrl!, req.responseFileName)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-md flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                      >
                        <DownloadIcon className="w-3.5 h-3.5" /> Download Creative
                      </button>
                    </div>
                  </div>
                )}

                {/* REVISION REQUESTED BANNER (If edits requested by CRM) */}
                {req.status === 'REVISION_REQUESTED' && req.revisionNotes && (
                  <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wider">
                      <AlertTriangleIcon className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Edits / Changes Requested by CRM Person:</span>
                    </div>
                    <p className="text-xs text-amber-900 bg-white p-2.5 rounded-lg border border-amber-200 font-medium">
                      {req.revisionNotes}
                    </p>
                    {req.revisionAttachmentUrl && (
                      <div className="flex items-center justify-between bg-amber-100/70 p-2 rounded-lg border border-amber-200">
                        <span className="text-[11px] font-bold text-amber-950 truncate">
                          📎 Reference Markup / Attachment for Edits: {req.revisionAttachmentName || 'Markup File'}
                        </span>
                        <button
                          onClick={() => downloadFile(req.revisionAttachmentUrl!, req.revisionAttachmentName)}
                          className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white text-[10px] font-bold rounded-md flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <DownloadIcon className="w-3 h-3" /> Download Edits Ref
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* COMPLETED REQUEST BANNER (For Designer & Everyone) */}
                {req.status === 'COMPLETED' && (
                  <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                          <span>Request Completed & Approved by CRM</span>
                          <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[9px]">Closed</span>
                        </h4>
                        <p className="text-xs text-emerald-800 font-medium mt-0.5">
                          The creative output has been confirmed and approved. This design request is officially closed. No further changes required.
                        </p>
                      </div>
                    </div>
                    {req.responseFileUrl && (
                      <button
                        onClick={() => downloadFile(req.responseFileUrl!, req.responseFileName)}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                      >
                        <DownloadIcon className="w-3.5 h-3.5" /> Download Final Creative
                      </button>
                    )}
                  </div>
                )}

                {/* CRM / REQUESTER REVIEW CONTROLS (Confirm or Request Edits) - Only active if NOT COMPLETED or toggling approval */}
                {isRequesterRole && req.status === 'SUBMITTED_FOR_REVIEW' && (
                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-purple-50/70 p-3 rounded-xl border border-purple-200">
                      <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                        <MessageSquareIcon className="w-4 h-4 text-purple-600" />
                        CRM Review Controls for Submitted Deliverable:
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Option 1: Confirm & Approve */}
                        <button
                          onClick={() => handleConfirmApprove(req.id)}
                          className="px-3.5 py-1.5 text-xs font-extrabold rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2Icon className="w-3.5 h-3.5" /> Confirm & Approve Creative
                        </button>

                        {/* Option 2: Request Edits */}
                        <button
                          onClick={() => setActiveEditRequestId(isEditingThisReq ? null : req.id)}
                          className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            isEditingThisReq 
                              ? 'bg-amber-600 text-white ring-2 ring-amber-400' 
                              : 'bg-amber-500 hover:bg-amber-600 text-white'
                          }`}
                        >
                          <Edit3Icon className="w-3.5 h-3.5" /> Request Edits / Changes
                        </button>
                      </div>
                    </div>

                    {/* EDIT REQUEST FORM */}
                    {isEditingThisReq && (
                      <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl space-y-3 animate-fadeIn">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                            Describe Required Edits & Upload Reference:
                          </label>
                          <button
                            onClick={() => {
                              setActiveEditRequestId(null);
                              setCrmEditErrorMap(prev => ({ ...prev, [req.id]: null }));
                            }}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                        </div>

                        <textarea
                          value={currentEditNote}
                          onChange={(e) => {
                            setEditNoteMap(prev => ({ ...prev, [req.id]: e.target.value }));
                            if (crmEditErr) setCrmEditErrorMap(prev => ({ ...prev, [req.id]: null }));
                          }}
                          placeholder="Write down exact text, design layout, color or graphic edits needed from designer..."
                          rows={3}
                          className="w-full text-xs p-3 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium text-slate-800"
                        />

                        {crmEditErr && (
                          <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium">
                            <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
                            <span>{crmEditErr}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <div>
                            <span className="block text-[10px] font-bold text-amber-900 uppercase mb-1">
                              Upload Reference Markup / Edit File (Optional):
                            </span>
                            <input
                              type="file"
                              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt"
                              onChange={(e) => {
                                setEditRefFileMap(prev => ({ ...prev, [req.id]: e.target.files ? e.target.files[0] : null }));
                                if (crmEditErr) setCrmEditErrorMap(prev => ({ ...prev, [req.id]: null }));
                              }}
                              className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-200 file:text-amber-900 hover:file:bg-amber-300 cursor-pointer"
                            />
                          </div>

                          <button
                            onClick={() => handleRequestEdits(req.id)}
                            className="px-4 py-2 text-xs font-black rounded-xl text-white bg-amber-600 hover:bg-amber-500 flex items-center gap-2 shadow-md transition-all cursor-pointer"
                          >
                            <SendIcon className="w-3.5 h-3.5" /> Send Edit Request to Designer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* DESIGNER ACTIONS (Start work, Upload Deliverable, or Re-upload for Revision) - Hidden if COMPLETED */}
                {isDesignerRole && req.status !== 'COMPLETED' && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-3 bg-white p-3 rounded-xl border">
                    {req.status === 'PENDING' && (
                      <button
                        onClick={() => handleStartWork(req.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <ClockIcon className="w-3.5 h-3.5" /> Start Working (In Progress)
                      </button>
                    )}

                    {(req.status === 'IN_PROGRESS' || req.status === 'REVISION_REQUESTED' || req.status === 'SUBMITTED_FOR_REVIEW') && (
                      <div className="space-y-2.5">
                        <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>
                            {req.status === 'REVISION_REQUESTED' 
                              ? '✏️ Upload Revised Creative / Edited Output File:' 
                              : req.status === 'SUBMITTED_FOR_REVIEW'
                              ? 'Re-upload / Update Submitted File Output:'
                              : 'Upload Completed Creative / File Output:'}
                          </span>
                          {req.status === 'REVISION_REQUESTED' && (
                            <span className="text-[10px] text-amber-700 font-extrabold bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                              Revision Required
                            </span>
                          )}
                        </label>

                        {designerErr && (
                          <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium">
                            <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
                            <span>{designerErr}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <input 
                            type="file" 
                            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx" 
                            onChange={(e) => {
                              setResponseFileMap(prev => ({ ...prev, [req.id]: e.target.files ? e.target.files[0] : null }));
                              if (designerErr) setDesignerUploadErrorMap(prev => ({ ...prev, [req.id]: null }));
                            }} 
                            className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer" 
                          />

                          <button
                            onClick={() => handleDesignerSubmit(req.id)}
                            className="px-4 py-2 text-xs font-extrabold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 cursor-pointer flex items-center gap-2 transition-all shadow-xs"
                          >
                            <UploadIcon className="w-3.5 h-3.5" /> 
                            {req.status === 'REVISION_REQUESTED' ? 'Upload & Resubmit Revised Creative' : 'Submit Output for Review'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* REVISION HISTORY TRAIL */}
                {req.revisionHistory && req.revisionHistory.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setShowHistoryMap(prev => ({ ...prev, [req.id]: !isHistoryShown }))}
                      className="text-[11px] font-bold text-slate-600 hover:text-purple-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <HistoryIcon className="w-3.5 h-3.5 text-purple-600" />
                      <span>{isHistoryShown ? 'Hide Revision Trail' : `View Revision History (${req.revisionHistory.length} entries)`}</span>
                    </button>

                    {isHistoryShown && (
                      <div className="mt-2 space-y-2 bg-slate-100/70 p-3 rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block border-b pb-1">
                          Audit Trail & Revision Log
                        </span>
                        {req.revisionHistory.map((h, hIdx) => (
                          <div key={h.id || hIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                              <span>{h.createdByName} ({h.createdByRole})</span>
                              <span>{new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-800">{h.note}</p>
                            {h.attachmentUrl && (
                              <button
                                onClick={() => downloadFile(h.attachmentUrl!, h.attachmentName)}
                                className="text-[10px] font-bold text-purple-700 hover:underline flex items-center gap-1 pt-1"
                              >
                                <DownloadIcon className="w-3 h-3" /> Download Markup ({h.attachmentName || 'Reference'})
                              </button>
                            )}
                            {h.submittedFileUrl && (
                              <button
                                onClick={() => downloadFile(h.submittedFileUrl!, h.submittedFileName)}
                                className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1 pt-1"
                              >
                                <DownloadIcon className="w-3 h-3" /> Download Resubmitted Creative ({h.submittedFileName || 'Output'})
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
