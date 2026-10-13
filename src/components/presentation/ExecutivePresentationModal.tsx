import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Sparkles,
  Download, 
  FileText, 
  Loader2, 
  Presentation,
  CheckCircle2,
  Clock,
  Briefcase,
  Users,
  Palette,
  HardHat,
  ShoppingCart,
  Landmark,
  ShieldCheck,
  Building2,
  Layers,
  ArrowRight,
  Package,
  FileCheck2,
  MessageSquare,
  Cloud,
  Check
} from 'lucide-react';
import { UserAccount, WorkAssignment, Lead, ReimbursementClaim, AttendanceRecord, CompanyProfile } from '../../types';
import { generateAndDownloadPptx, generateAndDownloadPdf } from '../../lib/pptExportUtils';

interface ExecutivePresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyProfile: CompanyProfile;
  users: UserAccount[];
  works: WorkAssignment[];
  leads: Lead[];
  reimbursements: ReimbursementClaim[];
  attendanceRecords: AttendanceRecord[];
}

export const ExecutivePresentationModal: React.FC<ExecutivePresentationModalProps> = ({
  isOpen,
  onClose,
  companyProfile,
  users,
  works,
  leads,
  reimbursements,
  attendanceRecords
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slide' | 'grid'>('slide');
  const [isDownloadingPpt, setIsDownloadingPpt] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isDownloadingBoth, setIsDownloadingBoth] = useState<boolean>(false);

  const totalSlides = 8;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, totalSlides, onClose]);

  if (!isOpen) return null;

  const handleDownloadPptx = async () => {
    try {
      setIsDownloadingPpt(true);
      await generateAndDownloadPptx({
        companyProfile,
        users,
        works,
        leads,
        reimbursements,
        attendanceRecords
      });
    } catch (err) {
      console.error('Failed to export PowerPoint PPTX:', err);
      alert('Unable to generate PowerPoint presentation. Please try downloading PDF.');
    } finally {
      setIsDownloadingPpt(false);
    }
  };

  const handleDownloadPdf = () => {
    try {
      setIsDownloadingPdf(true);
      generateAndDownloadPdf({
        companyProfile,
        users,
        works,
        leads,
        reimbursements,
        attendanceRecords
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Unable to generate PDF document. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadBoth = async () => {
    try {
      setIsDownloadingBoth(true);
      await generateAndDownloadPptx({
        companyProfile,
        users,
        works,
        leads,
        reimbursements,
        attendanceRecords
      });
      // Small pause before PDF to avoid browser popup collision
      setTimeout(() => {
        generateAndDownloadPdf({
          companyProfile,
          users,
          works,
          leads,
          reimbursements,
          attendanceRecords
        });
        setIsDownloadingBoth(false);
      }, 700);
    } catch (err) {
      console.error('Failed to download both files:', err);
      setIsDownloadingBoth(false);
      alert('Error exporting files. Please download PPT and PDF individually.');
    }
  };

  const activeStaffCount = users.filter((u) => u.active).length;
  const activeJobsCount = works.length;
  const totalLeadsCount = leads.length;
  const totalClaimsCount = reimbursements.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between overflow-hidden text-slate-900">
      {/* PPT Header Toolbar */}
      <div className="bg-slate-900 text-white px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800 flex items-center justify-between shrink-0 select-none gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
            {companyProfile.logoInitial || 'KD'}
          </div>
          <div className="truncate">
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 truncate">
              <span className="truncate">{companyProfile.shortName} Client Pitch & Portal Architecture Deck</span>
              <span className="hidden lg:inline-flex bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded text-[10px] font-semibold shrink-0">
                16:9 Presentation Deck (8 Slides)
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 hidden sm:block truncate">
              Master Admin 10 Roles · CRM WhatsApp Groups · 3-Action File Gate · Material Bucket · OneDrive Sync
            </p>
          </div>
        </div>

        {/* Presentation Controls & Direct Device Downloads */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('slide')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'slide' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Slide Mode
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Grid View
            </button>
          </div>

          {/* Download Both (PPT + PDF) Button */}
          <button
            type="button"
            onClick={handleDownloadBoth}
            disabled={isDownloadingBoth || isDownloadingPpt || isDownloadingPdf}
            className="px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Download both PowerPoint (.pptx) and PDF files in one click"
          >
            {isDownloadingBoth ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
            <span className="hidden sm:inline">Download Both (PPT + PDF)</span>
            <span className="sm:hidden">Both Files</span>
          </button>

          {/* Download PPTX Button */}
          <button
            type="button"
            onClick={handleDownloadPptx}
            disabled={isDownloadingPpt || isDownloadingBoth}
            className="px-2.5 sm:px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Download PowerPoint Presentation (.pptx) file directly to device"
          >
            {isDownloadingPpt ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Presentation className="w-3.5 h-3.5" />
            )}
            <span>{isDownloadingPpt ? 'Generating...' : 'PPT (.pptx)'}</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf || isDownloadingBoth}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            title="Download multi-page PDF presentation directly to device"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>{isDownloadingPdf ? 'Exporting...' : 'PDF (.pdf)'}</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs transition-colors cursor-pointer hidden sm:block"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer ml-1"
            title="Close Presentation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Presentation Viewport */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 flex items-center justify-center bg-slate-950">
        {viewMode === 'grid' ? (
          /* Grid Overview of all 8 Slides */
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
            {[
              { id: 0, title: '1. Executive Title & Portal Vision', desc: 'Overview of collaborative workspace architecture' },
              { id: 1, title: '2. Master Admin: 10 Operational Roles', desc: 'HR, CRM, Design, PM, Purchase, Billing, Accounts, Stocks, Site' },
              { id: 2, title: '3. CRM WhatsApp-Style Project Rooms', desc: 'Separate project groups, 3-action file gate & OneDrive sync' },
              { id: 3, title: '4. Designer & Structure Workspaces', desc: '2D Graphics, 3D Mockups & Engineering CAD spaces' },
              { id: 4, title: '5. Project Team & Site Supervisor Groups', desc: 'Field execution, OTP check-in & daily progress uploads' },
              { id: 5, title: '6. Purchase & Accounts Material Bucket', desc: 'Consolidated request bucket & 2-way sync to groups' },
              { id: 6, title: '7. Billing & Stocks Operations', desc: 'Warehouse stock deductions & milestone GST invoices' },
              { id: 7, title: '8. OneDrive Sync, Security & Client ROI', desc: 'Zero file loss, role access control & pitch ROI' }
            ].map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setCurrentSlide(s.id);
                  setViewMode('slide');
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer bg-slate-900 hover:bg-slate-850 flex flex-col justify-between ${
                  currentSlide === s.id ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                    <span className="bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded text-[10px]">Slide {s.id + 1} / {totalSlides}</span>
                    {currentSlide === s.id && <span className="text-emerald-400 font-semibold text-[11px]">Active</span>}
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{s.title}</h4>
                  <p className="text-xs text-slate-400">{s.desc}</p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-800 text-[11px] text-blue-400 font-semibold">
                  Click to open slide →
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single Slide View Container (16:9 feel) */
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden min-h-[580px] flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
            {/* Top Slide Badge & Title */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="bg-blue-600 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-md">
                  SLIDE {currentSlide + 1} / {totalSlides}
                </span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {companyProfile.companyName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                <span>Client Pitch & Architecture Deck</span>
              </div>
            </div>

            {/* Slide Body Content */}
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
              {/* SLIDE 1: Cover Slide & Executive Pitch */}
              {currentSlide === 0 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Enterprise Operations & Collaborative Workspaces Portal
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {companyProfile.companyName}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">
                      Multi-Role Master Portal · WhatsApp Group-Style Workspaces · 3-Action File Verification · Material Request Bucket · Auto OneDrive Cloud Sync
                    </p>
                  </div>

                  {/* Core Metrics Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
                      <span className="text-[11px] font-semibold text-slate-500 block">Admin Hierarchy</span>
                      <span className="text-2xl font-black text-blue-900">10 Roles</span>
                      <span className="text-[10px] text-blue-600 font-bold block mt-0.5">Unified Governance</span>
                    </div>
                    <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <span className="text-[11px] font-semibold text-slate-500 block">Project Groups</span>
                      <span className="text-2xl font-black text-emerald-800">Chat Rooms</span>
                      <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">WhatsApp Group Type</span>
                    </div>
                    <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100">
                      <span className="text-[11px] font-semibold text-slate-500 block">File Verification</span>
                      <span className="text-2xl font-black text-amber-800">3-Action Gate</span>
                      <span className="text-[10px] text-amber-700 font-bold block mt-0.5">Approve · Correction · Reject</span>
                    </div>
                    <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100">
                      <span className="text-[11px] font-semibold text-slate-500 block">Procurement Engine</span>
                      <span className="text-2xl font-black text-purple-900">Material Bucket</span>
                      <span className="text-[10px] text-purple-600 font-medium block mt-0.5">Accounts & Site Auto-Sync</span>
                    </div>
                  </div>

                  {/* Quick Value Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                      <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-900">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span>Isolated Project Groups</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Every project runs inside a dedicated chat group. CRM controls member access, updates reminders, and triggers OneDrive auto-sync on approval.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                      <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-900">
                        <ShoppingCart className="w-4 h-4 text-emerald-600" />
                        <span>Central Material Bucket</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Field site requests pipe into an Accounts consolidated bucket. Accounts replies with updates that sync back directly to the project group.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                      <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-900">
                        <Cloud className="w-4 h-4 text-sky-600" />
                        <span>OneDrive Cloud Archive</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        Zero lost files. Every approved drawing, PO, and invoice is automatically categorized into client OneDrive folders in real time.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 2: Master Admin Look: 10 Operational Roles Matrix */}
              {currentSlide === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-xl font-bold text-slate-900">Master Admin Look: 10 Operational Roles Matrix</h2>
                    <p className="text-xs text-slate-500">Centralized governance across all 10 specialized departments with dedicated work permissions</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {[
                      { role: '1. HR Role', icon: Clock, color: 'text-rose-600', desc: 'GPS mobile punch, selfie check-in, late attendance rules (>10:15 AM), staff KYC documents & leave audits.' },
                      { role: '2. CRM', icon: Briefcase, color: 'text-blue-600', desc: 'Lead qualification, separate project chat rooms, client communications, 3-action file reviews & status updates.' },
                      { role: '3. Designer', icon: Palette, color: 'text-purple-600', desc: 'Creative 2D graphic artworks, 3D realistic visual renderings, client brand adaptation & design iterations.' },
                      { role: '4. Structure Designer', icon: Layers, color: 'text-indigo-600', desc: 'Structural engineering CAD drawings, stability analysis, fabrication specifications & material load specs.' },
                      { role: '5. Project Team', icon: Users, color: 'text-amber-600', desc: 'Overall project execution, milestone scheduling, contractor management & cross-department coordination.' },
                      { role: '6. Purchase', icon: ShoppingCart, color: 'text-orange-600', desc: 'Vendor sourcing, 3-quote supplier matrix comparison, negotiation, and official Purchase Order (PO) creation.' },
                      { role: '7. Billing', icon: FileCheck2, color: 'text-teal-600', desc: 'Client milestone billing schedules (Advance, Fabrication, Dispatch, Handover), GST invoices & payment follow-up.' },
                      { role: '8. Accounts', icon: Landmark, color: 'text-emerald-600', desc: 'Centralized purchase request bucket, financial verification, staff reimbursement clearance & vendor payouts.' },
                      { role: '9. Stocks', icon: Package, color: 'text-cyan-600', desc: 'Warehouse inventory tracking, material reservations, low-stock threshold alerts & site dispatch logs.' },
                      { role: '10. Site Supervisor', icon: HardHat, color: 'text-slate-700', desc: 'OTP site check-in, contractor labor headcount logs, daily EOD progress photos & on-site material requests.' }
                    ].map((r, idx) => {
                      const Icon = r.icon;
                      return (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5 hover:border-blue-400 transition-colors">
                          <div className="flex items-center gap-1.5">
                            <Icon className={`w-4 h-4 ${r.color} shrink-0`} />
                            <h4 className="text-xs font-bold text-slate-900 truncate">{r.role}</h4>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{r.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SLIDE 3: CRM: Project Chat Rooms (WhatsApp Group Model) */}
              {currentSlide === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-xl font-bold text-slate-900">CRM: Project Chat Rooms (WhatsApp Group Model)</h2>
                    <p className="text-xs text-slate-500">Dedicated project group per client order · Dynamic member management · 3-Action File Verification</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-200 space-y-3">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-600 text-white uppercase tracking-wider">
                        WhatsApp Group Model
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">Separate Project Group Room</h3>
                      <ul className="text-xs text-slate-600 space-y-2">
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>A dedicated group is created for each project name automatically.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>CRM person has full authority to Add or Remove any team member (Designers, PM, Client).</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>Conversations, files, and updates are isolated only to that specific active group.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-3">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white uppercase tracking-wider">
                        Verification Gate
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">3-Action File Review System</h3>
                      <div className="space-y-2 text-xs">
                        <div className="p-2 bg-white rounded-lg border border-emerald-200">
                          <strong className="text-emerald-700 block">✅ APPROVE:</strong>
                          <span className="text-slate-600 text-[11px]">Design accepted; version locked & auto-saved to OneDrive.</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-amber-200">
                          <strong className="text-amber-700 block">✏️ CORRECTION:</strong>
                          <span className="text-slate-600 text-[11px]">Opens reply interface where CRM/Client types precise revision feedback.</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-rose-200">
                          <strong className="text-rose-700 block">❌ REJECT:</strong>
                          <span className="text-slate-600 text-[11px]">File discarded with reason logged for audit.</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200 space-y-3">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-600 text-white uppercase tracking-wider">
                        Automation Engine
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">Reminders & OneDrive Sync</h3>
                      <ul className="text-xs text-slate-600 space-y-2">
                        <li className="flex items-start gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span><strong>Action Reminders:</strong> CRM sets automated reminder alarms for update follow-ups.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span><strong>Order Confirmed:</strong> When client signs off, status updates to COMPLETED.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Cloud className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                          <span><strong>OneDrive Auto-Sync:</strong> All approved drawings & quotes automatically save to cloud.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 4: Designers & Structure Designers: Work Chat Spaces */}
              {currentSlide === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-xl font-bold text-slate-900">Designers & Structure Designers: Work Chat Spaces</h2>
                    <p className="text-xs text-slate-500">Transforming static assignment queues into collaborative live studio work chat spaces</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                        Creative Visual Concept Studio
                      </span>
                      <h3 className="text-base font-bold text-slate-900">Graphic & 3D Visual Designers</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Dedicated work chat space where visual designers receive site visit photos, client briefs, and dimension notes. Upload 2D graphics, branding layouts, and 3D realistic studio mockups.
                      </p>
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <Check className="w-3.5 h-3.5" /> Direct project chat thread for each job assignment
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <Check className="w-3.5 h-3.5" /> High-resolution render deliverables upload
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <Check className="w-3.5 h-3.5" /> Instant 3-Action feedback (Approve / Correction / Reject)
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                        Structural CAD & Stability Engineering
                      </span>
                      <h3 className="text-base font-bold text-slate-900">Structure Designers (Engineering)</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Specialized structural engineering space focusing on fabrication stability, steel/acrylic loads, wind pressure, and fabrication detailing blueprints.
                      </p>
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <Check className="w-3.5 h-3.5" /> Technical CAD file & PDF engineering drawing uploads
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <Check className="w-3.5 h-3.5" /> Material grade specifications and joint stress analysis
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <Check className="w-3.5 h-3.5" /> Revision versioning with correction markup reply integration
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 text-white rounded-xl text-center text-xs font-semibold">
                    <span className="text-amber-400 font-bold">COLLABORATIVE DESIGN LOOP: </span>
                    Client Brief ➔ Graphic 3D Concept ➔ Structure CAD ➔ 3-Action Review ➔ OneDrive Sync ➔ Project Team Handover
                  </div>
                </div>
              )}

              {/* SLIDE 5: Project Team & Site Supervisor Field Execution Groups */}
              {currentSlide === 4 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-xl font-bold text-slate-900">Project Team & Site Supervisor: Field Execution Groups</h2>
                    <p className="text-xs text-slate-500">Conducting further project execution through unified project group spaces & live field telemetry</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <h3 className="text-base font-bold text-slate-900">Project Team Execution Workspace</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Takes handover from CRM once order is confirmed. Uses project group to orchestrate site readiness, vendor scheduling, and client milestone delivery.
                      </p>
                      <div className="space-y-2 pt-2 text-xs">
                        <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                          <strong className="text-blue-900 block">Milestone Tracking:</strong>
                          <span className="text-slate-600 text-[11px]">Monitors active milestone timelines & site readiness dates.</span>
                        </div>
                        <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                          <strong className="text-blue-900 block">Material Verification Gate:</strong>
                          <span className="text-slate-600 text-[11px]">Reviews on-site material requests before routing to Accounts.</span>
                        </div>
                        <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                          <strong className="text-blue-900 block">OTP Security Handshakes:</strong>
                          <span className="text-slate-600 text-[11px]">Issues time-limited OTP tokens for site supervisor handovers.</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <h3 className="text-base font-bold text-slate-900">Site Supervisor On-Site Operations</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Field execution lead at client premises. Communicates in the project group room with live photos, progress logs, and manpower headcount.
                      </p>
                      <div className="space-y-2 pt-2 text-xs">
                        <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                          <strong className="text-emerald-900 block">OTP Geo-Verified Check-In:</strong>
                          <span className="text-slate-600 text-[11px]">Geo-verified OTP check-in upon arriving at client site.</span>
                        </div>
                        <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                          <strong className="text-emerald-900 block">Contractor Labor Headcounts:</strong>
                          <span className="text-slate-600 text-[11px]">Daily contractor headcount logs (carpenters, fabricators, painters, electricians).</span>
                        </div>
                        <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                          <strong className="text-emerald-900 block">Daily EOD Progress Hub:</strong>
                          <span className="text-slate-600 text-[11px]">Daily EOD progress photos & site inspection sign-offs.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 6: Purchase & Accounts Material Request Bucket Flow */}
              {currentSlide === 5 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-xl font-bold text-slate-900">Purchase & Accounts: Material Request Bucket Flow</h2>
                    <p className="text-xs text-slate-500">Consolidated bucket for all site material demands with instant 2-way sync back to project groups</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-2">
                      <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">STEP 1</span>
                      <h4 className="text-sm font-bold text-slate-900">Group Requisition</h4>
                      <div className="text-[11px] text-blue-700 font-semibold">By: Project Team / Site Supervisor</div>
                      <p className="text-xs text-slate-600">
                        Posts material requirement directly in their specific project group room (items, quantity, urgency, photos).
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-2">
                      <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">STEP 2</span>
                      <h4 className="text-sm font-bold text-slate-900">Consolidated Bucket</h4>
                      <div className="text-[11px] text-blue-700 font-semibold">By: Accounts & Purchase Team</div>
                      <p className="text-xs text-slate-600">
                        Accounts team sees a unified bucket of all material requests across every live project in one real-time dashboard.
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-2">
                      <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">STEP 3</span>
                      <h4 className="text-sm font-bold text-slate-900">Update & Response</h4>
                      <div className="text-[11px] text-blue-700 font-semibold">By: Accounts / Purchase Desk</div>
                      <p className="text-xs text-slate-600">
                        Accounts evaluates budget, approves PO / vendor dispatch, and types an update with ETA and order numbers.
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-2">
                      <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">STEP 4</span>
                      <h4 className="text-sm font-bold text-slate-900">Direct Group Sync</h4>
                      <div className="text-[11px] text-blue-700 font-semibold">To: Project Chat Room</div>
                      <p className="text-xs text-slate-600">
                        The update automatically pipes into the specific project group, giving the site team immediate real-time tracking.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center text-xs text-blue-950 font-bold">
                    🔄 Zero Communication Gaps: Field teams request in group ➔ Accounts manages in bucket ➔ Update auto-posts back into group with zero manual follow-ups.
                  </div>
                </div>
              )}

              {/* SLIDE 7: Billing & Stocks: Seamless Inventory & Invoice Operations */}
              {currentSlide === 6 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-xl font-bold text-slate-900">Billing & Stocks: Seamless Inventory & Invoice Operations</h2>
                    <p className="text-xs text-slate-500">Automating warehouse inventory deductions, milestone billing schedules & GST tax invoices</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider block">
                        Live Inventory Tracking
                      </span>
                      <h3 className="text-base font-bold text-slate-900">Warehouse Stocks Management</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Centralized stock management linking central factory stock directly with active site requisitions.
                      </p>
                      <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                          <span>Real-time deduction of materials when site supervisor requests are fulfilled.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                          <span>Automated threshold alerts when raw materials fall below minimum safety levels.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                          <span>Scrap, wastage, and returns tracking post-site handover.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                        Client Milestone Financials
                      </span>
                      <h3 className="text-base font-bold text-slate-900">Milestone Billing & GST Tax Invoicing</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Structured billing desk managing payment stages from advance booking to final client handover.
                      </p>
                      <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span>Milestone billing schedule: Advance ➔ Fabrication ➔ Delivery ➔ Handover.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span>1-click GST-compliant tax invoice generation with company bank details & QR code.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span>Real-time outstanding balance tracking and payment reminder notices.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 8: OneDrive Auto-Sync, Security & Client Value Proposition */}
              {currentSlide === 7 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h2 className="text-xl font-bold text-slate-900">OneDrive Auto-Sync, Security & Client Value Proposition</h2>
                    <p className="text-xs text-slate-500">Enterprise cloud backup, role-based security & measurable business return on investment</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">100% Zero File Loss</span>
                      <h4 className="text-sm font-bold text-slate-900">Automated OneDrive Cloud Backup</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        All approved files, 2D/3D artwork, quotations, POs, and completion certificates automatically sync to client-specific Microsoft OneDrive folders without manual uploads.
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Complete Security</span>
                      <h4 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC)</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        10 distinct roles with segmented access. Staff only see projects and channels they are invited to. Full audit trail of approvals, corrections, and payment authorizations.
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Intuitive & Fast</span>
                      <h4 className="text-sm font-bold text-slate-900">Blue & White Professional UI</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Clean corporate color palette, high-contrast readability, responsive touch controls for on-site supervisors, and zero training required for new staff.
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">35% Faster Delivery</span>
                      <h4 className="text-sm font-bold text-slate-900">Client Pitch Business ROI</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Eliminates WhatsApp message confusion, lost files, and procurement delays. Real-time bucket processing and automated reminders accelerate delivery by over 35%.
                      </p>
                    </div>
                  </div>

                  {/* Direct Export Action Card */}
                  <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between flex-wrap gap-3 mt-4">
                    <div>
                      <h4 className="text-sm font-bold text-amber-400">Download Presentation File to Device</h4>
                      <p className="text-xs text-slate-300">
                        Export the complete 8-slide deck as a Microsoft PowerPoint (.pptx) or PDF presentation file.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleDownloadBoth}
                        disabled={isDownloadingBoth || isDownloadingPpt || isDownloadingPdf}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isDownloadingBoth ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>Download Both (PPT + PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadPptx}
                        disabled={isDownloadingPpt || isDownloadingBoth}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isDownloadingPpt ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Presentation className="w-3.5 h-3.5" />
                        )}
                        <span>Download PPT (.pptx)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf || isDownloadingBoth}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isDownloadingPdf ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Slide Navigation Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSlides }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                    title={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentSlide === 0}
                  onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  disabled={currentSlide === totalSlides - 1}
                  onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1))}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span>Next Slide</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
