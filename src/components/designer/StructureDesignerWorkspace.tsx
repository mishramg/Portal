import React, { useState, useRef, useEffect } from 'react';
import { WorkAssignment, UserAccount, ProjectGroup, ProjectGroupMessage, ProjectGroupFile } from '../../types';
import { 
  Building, 
  Search, 
  Send, 
  Paperclip, 
  Check, 
  X, 
  FileCode, 
  FileText, 
  Layers, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Cloud, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface StructureDesignerWorkspaceProps {
  works: WorkAssignment[];
  activeUser: UserAccount;
  onUpdateWork: (updatedWork: WorkAssignment) => void;
  groups?: ProjectGroup[];
  messages?: ProjectGroupMessage[];
  onSendMessage?: (message: ProjectGroupMessage) => void;
  onUpdateMessage?: (message: ProjectGroupMessage) => void;
}

export const StructureDesignerWorkspace: React.FC<StructureDesignerWorkspaceProps> = ({
  works,
  activeUser,
  onUpdateWork,
  groups = [],
  messages = [],
  onSendMessage,
  onUpdateMessage
}) => {
  const [selectedWorkId, setSelectedWorkId] = useState<string>(() => works[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'APPROVED'>('ALL');
  
  // Work Chat Message Input
  const [chatInput, setChatInput] = useState('');
  
  // Deliverable Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [drawingTitle, setDrawingTitle] = useState('');
  const [drawingType, setDrawingType] = useState<'CAD' | 'PDF' | 'IMAGE'>('CAD');
  const [drawingNotes, setDrawingNotes] = useState('');
  const [drawingUrl, setDrawingUrl] = useState('');

  // Inline correction reply state
  const [correctionTargetId, setCorrectionTargetId] = useState<string | null>(null);
  const [correctionText, setCorrectionText] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedWork = works.find((w) => w.id === selectedWorkId) || works[0];

  // Structural Drawings mock deliverables list (or from messages)
  const [structuralDrawings, setStructuralDrawings] = useState<Array<{
    id: string;
    title: string;
    fileType: 'CAD' | 'PDF' | 'IMAGE';
    fileUrl: string;
    uploadedBy: string;
    uploadedAt: string;
    status: 'PENDING_REVIEW' | 'APPROVED' | 'CORRECTION_REQUESTED' | 'REJECTED';
    correctionNotes?: string;
    oneDrivePath?: string;
  }>>([
    {
      id: 'dwg_1',
      title: 'Terrace Structural Frame & Load-Bearing Brackets (50x50 MS Pipe).dwg',
      fileType: 'CAD',
      fileUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
      uploadedBy: 'Amit Sharma (Structural CAD Lead)',
      uploadedAt: 'Today 10:15 AM',
      status: 'APPROVED',
      oneDrivePath: 'OneDrive/KDPL_Projects/Haldirams_Noida_Sec18/Approved_CAD/Terrace_MS_Frame.dwg'
    },
    {
      id: 'dwg_2',
      title: 'Wind Load Resistance Calculation & Foundation Anchor Details.pdf',
      fileType: 'PDF',
      fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80',
      uploadedBy: 'Amit Sharma (Structural CAD Lead)',
      uploadedAt: 'Yesterday 04:30 PM',
      status: 'PENDING_REVIEW'
    }
  ]);

  const filteredWorks = works.filter((w) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.workTitle.toLowerCase().includes(q) ||
      w.clientCompanyName.toLowerCase().includes(q) ||
      (w.brandName && w.brandName.toLowerCase().includes(q))
    );
  });

  const handleApproveDrawing = (id: string) => {
    setStructuralDrawings((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'APPROVED',
              oneDrivePath: `OneDrive/KDPL_Projects/${selectedWork?.workTitle.replace(/\s+/g, '_')}/Approved_CAD/${d.title}`
            }
          : d
      )
    );
  };

  const handleOpenCorrection = (id: string) => {
    setCorrectionTargetId(id);
    setCorrectionText('');
  };

  const handleSubmitCorrection = (id: string) => {
    if (!correctionText.trim()) return;
    setStructuralDrawings((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'CORRECTION_REQUESTED',
              correctionNotes: correctionText.trim()
            }
          : d
      )
    );
    setCorrectionTargetId(null);
    setCorrectionText('');
  };

  const handleRejectDrawing = (id: string) => {
    const reason = window.prompt('Enter reason for rejection:');
    if (reason === null) return;
    setStructuralDrawings((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'REJECTED',
              correctionNotes: reason || 'Rejected by Structural Engineer.'
            }
          : d
      )
    );
  };

  const handleUploadNewDrawing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawingTitle.trim()) return;

    const newDrawing = {
      id: `dwg_${Date.now()}`,
      title: drawingTitle.trim(),
      fileType: drawingType,
      fileUrl: drawingUrl || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
      uploadedBy: `${activeUser.name} (${activeUser.role.replace('_', ' ')})`,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING_REVIEW' as const
    };

    setStructuralDrawings((prev) => [newDrawing, ...prev]);
    setShowUploadModal(false);
    setDrawingTitle('');
    setDrawingNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner - Blue & White Professional UI */}
      <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Engineering & Structural Studio
            </span>
            <span className="text-xs text-blue-700 font-bold">Collaborative Work Chat Space</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-600" />
            Structure Designer Workspace
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            AutoCAD DWG drawings, structural engineering load calculations, steel framework diagrams, and wind-load stability files. Review deliverables with 3-action approval options and automated OneDrive cloud backup.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Upload Structural Drawing
          </button>
        </div>
      </div>

      {/* Main Workspace Split: Left Project List, Right Collaborative Work Chat */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col md:flex-row h-[680px]">
        {/* Left: Projects Selector */}
        <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/60 shrink-0">
          <div className="p-3.5 border-b border-slate-200 bg-white space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Assigned Projects
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredWorks.map((w) => {
              const isSelected = selectedWork?.id === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWorkId(w.id)}
                  className={`w-full text-left p-3.5 transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-4 border-blue-600 text-blue-900'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="font-extrabold text-xs text-slate-900 truncate">{w.workTitle}</div>
                  <div className="text-[11px] text-slate-500 truncate">{w.clientCompanyName}</div>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-blue-600 font-semibold font-mono">Assigned CRM: {w.assignedCrmName}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                      {w.adminStatus || 'ONGOING'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Work Chat & Deliverable Stream */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/40">
            <div className="space-y-0.5">
              <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>{selectedWork?.workTitle}</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Structural Work Space
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Client: {selectedWork?.clientCompanyName} • Brand: {selectedWork?.brandName || 'Corporate'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                Lead Engineer: Amit Sharma
              </span>
            </div>
          </div>

          {/* Deliverables Stream & Reviews */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Structural Design Brief & Constraints:</span>
              </div>
              <p className="text-[11px] text-blue-800">
                Building terrace facade requires high wind resistance stability (Zone III). Ensure 50x50 MS hollow pipe framework with 12mm expansion anchor brackets. All approved drawings automatically sync to OneDrive.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-600" />
                <span>Structural Engineering Drawings ({structuralDrawings.length})</span>
              </div>

              {structuralDrawings.map((dwg) => {
                const isApproved = dwg.status === 'APPROVED';
                const isCorrection = dwg.status === 'CORRECTION_REQUESTED';
                const isRejected = dwg.status === 'REJECTED';

                return (
                  <div
                    key={dwg.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black shrink-0">
                          {dwg.fileType === 'CAD' ? 'DWG' : dwg.fileType === 'PDF' ? 'PDF' : 'IMG'}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-slate-900">{dwg.title}</div>
                          <div className="text-[11px] text-slate-500">
                            Uploaded by {dwg.uploadedBy} • {dwg.uploadedAt}
                          </div>
                          {dwg.oneDrivePath && (
                            <div className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1 mt-1">
                              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Synced to OneDrive: {dwg.oneDrivePath}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> APPROVED
                          </span>
                        ) : isCorrection ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" /> CORRECTION
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                            REJECTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                            PENDING REVIEW
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Correction Notes */}
                    {dwg.correctionNotes && (
                      <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-amber-900 text-xs">
                        <span className="font-bold">Feedback / Remarks:</span> {dwg.correctionNotes}
                      </div>
                    )}

                    {/* 3 Action Buttons: Approve, Correction (with reply box), Reject */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <a
                        href={dwg.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Preview Drawing
                      </a>

                      <div className="flex items-center gap-2">
                        {isApproved ? (
                          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> File Approved & Locked
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleApproveDrawing(dwg.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1 rounded-md transition-all cursor-pointer shadow-xs flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>

                            <button
                              onClick={() => handleOpenCorrection(dwg.id)}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1"
                            >
                              Correction
                            </button>

                            <button
                              onClick={() => handleRejectDrawing(dwg.id)}
                              className="bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-[11px] px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Inline Correction Feedback Reply Input */}
                    {correctionTargetId === dwg.id && (
                      <div className="mt-2 bg-slate-50 border border-amber-200 p-3 rounded-xl space-y-2">
                        <label className="block text-[11px] font-bold text-slate-800">
                          Enter Structural Correction Feedback for Designer:
                        </label>
                        <textarea
                          rows={2}
                          value={correctionText}
                          onChange={(e) => setCorrectionText(e.target.value)}
                          placeholder="e.g. Please modify bracket thickness from 4mm to 6mm to withstand gale force winds on the 3rd floor terrace."
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setCorrectionTargetId(null)}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded text-xs font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmitCorrection(dwg.id)}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold cursor-pointer shadow-xs"
                          >
                            Submit Correction
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div ref={chatEndRef} />
          </div>

          {/* Quick Chat Input at Bottom */}
          <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              title="Attach CAD or Drawing"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Send message to Structure Designer team..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && chatInput.trim()) {
                  // Post simulated comment
                  setChatInput('');
                }
              }}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              onClick={() => {
                if (chatInput.trim()) setChatInput('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Drawing Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" /> Upload Structural Drawing
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadNewDrawing} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Drawing Title / Filename *</label>
                <input
                  type="text"
                  placeholder="e.g. Pylon_Foundation_Anchor_Detail_V2.dwg"
                  value={drawingTitle}
                  onChange={(e) => setDrawingTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Format Type</label>
                  <select
                    value={drawingType}
                    onChange={(e) => setDrawingType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                  >
                    <option value="CAD">AutoCAD (.dwg / .dxf)</option>
                    <option value="PDF">Engineering PDF</option>
                    <option value="IMAGE">Blueprint Image</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Project</label>
                  <input
                    type="text"
                    disabled
                    value={selectedWork?.workTitle || 'Project'}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-slate-600 truncate"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Technical Specification Notes</label>
                <textarea
                  rows={3}
                  value={drawingNotes}
                  onChange={(e) => setDrawingNotes(e.target.value)}
                  placeholder="e.g. Revised bracket dimensions according to site supervisor inspection notes."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Upload & Notify Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
