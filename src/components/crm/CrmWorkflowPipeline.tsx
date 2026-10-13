import React, { useState, useEffect } from 'react';
import { 
  WorkAssignment, 
  CrmWorkStep, 
  ApprovalStatus, 
  Quotation, 
  UserAccount,
  WorkAdminStatus
} from '../../types';
import { QuotationBuilder } from '../quotations/QuotationBuilder';
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Image, 
  Upload, 
  Send, 
  UserPlus, 
  Sparkles, 
  ChevronDown, 
  ChevronRight, 
  CheckSquare, 
  ShieldCheck, 
  FileCheck, 
  Music, 
  ArrowRight,
  Eye,
  Key,
  Trash2,
  Pencil,
  X,
  Lock,
  Paperclip,
  AlertCircle,
  Check,
  Download,
  Palette,
  FolderSync,
  Edit3,
  Bell,
  RefreshCw,
  CheckCircle2,
  User,
  Search,
  Filter,
  PlayCircle,
  PauseCircle,
  CheckCheck
} from 'lucide-react';
import { FileDownloadList } from '../common/FileDownloadList';

interface CrmWorkflowPipelineProps {
  works: WorkAssignment[];
  designers: UserAccount[];
  users: UserAccount[];
  activeUser: UserAccount;
  onUpdateWork: (updatedWork: WorkAssignment) => void;
  onDeleteWork?: (workId: string) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const CrmWorkflowPipeline: React.FC<CrmWorkflowPipelineProps> = ({
  works,
  designers,
  users,
  activeUser,
  onUpdateWork,
  onDeleteWork,
  searchTerm: externalSearchTerm = '',
  onSearchChange: externalOnSearchChange
}) => {
  const displayedWorks = activeUser.role === 'CRM_EMPLOYEE'
    ? works.filter((w) => w.assignedCrmId === activeUser.id)
    : works;

  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONGOING' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'PENDING_APPROVAL'>('ALL');

  const activeSearch = externalSearchTerm || internalSearchTerm;
  const handleSearchUpdate = (val: string) => {
    setInternalSearchTerm(val);
    if (externalOnSearchChange) {
      externalOnSearchChange(val);
    }
  };

  const filteredWorks = displayedWorks.filter((w) => {
    // 1. Status Filter
    if (statusFilter !== 'ALL') {
      const currentAdminStatus: WorkAdminStatus = w.adminStatus || (w.crmCompleted || w.currentStep === 'COMPLETED' ? 'COMPLETED' : 'ONGOING');
      if (statusFilter === 'ONGOING' && currentAdminStatus !== 'ONGOING') return false;
      if (statusFilter === 'COMPLETED' && currentAdminStatus !== 'COMPLETED') return false;
      if (statusFilter === 'ON_HOLD' && currentAdminStatus !== 'ON_HOLD') return false;
      if (statusFilter === 'CANCELLED' && currentAdminStatus !== 'CANCELLED') return false;
      if (statusFilter === 'PENDING_APPROVAL' && currentAdminStatus !== 'PENDING_APPROVAL') return false;
    }

    // 2. Search Query Filter
    if (!activeSearch.trim()) return true;
    const q = activeSearch.toLowerCase().trim();
    const titleMatch = (w.workTitle || '').toLowerCase().includes(q);
    const companyMatch = (w.clientCompanyName || '').toLowerCase().includes(q);
    const brandMatch = (w.brandName || '').toLowerCase().includes(q);
    const crmMatch = (w.assignedCrmName || '').toLowerCase().includes(q);
    const designerMatch = (w.assignedSeniorDesignerName || w.designerBrief?.assignedDesignerName || '').toLowerCase().includes(q);
    const subDesignerMatch = (w.assignedSubDesignerName || '').toLowerCase().includes(q);
    const personMatch = (w.assignedPersonName || '').toLowerCase().includes(q);
    const locationMatch = (w.siteLocationAddress || w.clientAddress || '').toLowerCase().includes(q);
    const phoneMatch = (w.clientPhone || '').toLowerCase().includes(q);
    const stepMatch = (w.currentStep || '').toLowerCase().replace(/_/g, ' ').includes(q);
    const adminStatusMatch = (w.adminStatus || '').toLowerCase().replace(/_/g, ' ').includes(q);
    const quoteNumMatch = (w.quotation?.quoteNumber || '').toLowerCase().includes(q);
    const idMatch = (w.id || '').toLowerCase().includes(q);

    return Boolean(
      titleMatch ||
      companyMatch ||
      brandMatch ||
      crmMatch ||
      designerMatch ||
      subDesignerMatch ||
      personMatch ||
      locationMatch ||
      phoneMatch ||
      stepMatch ||
      adminStatusMatch ||
      quoteNumMatch ||
      idMatch
    );
  });

  const [selectedWorkId, setSelectedWorkId] = useState<string>('');

  useEffect(() => {
    if (filteredWorks.length > 0) {
      if (!selectedWorkId || !filteredWorks.some(w => w.id === selectedWorkId)) {
        setSelectedWorkId(filteredWorks[0].id);
      }
    } else {
      setSelectedWorkId('');
    }
  }, [filteredWorks, selectedWorkId]);

  const [activeStepTab, setActiveStepTab] = useState<CrmWorkStep>('STEP_ASSIGN_PERSON');
  const [showQuoteEngine, setShowQuoteEngine] = useState(false);
  const [editingWork, setEditingWork] = useState<WorkAssignment | null>(null);

  // Edit Work form fields
  const [editWorkTitle, setEditWorkTitle] = useState('');
  const [editBrandName, setEditBrandName] = useState('');
  const [editClientCompName, setEditClientCompName] = useState('');

  const openEditWork = (work: WorkAssignment) => {
    setEditingWork(work);
    setEditWorkTitle(work.workTitle);
    setEditBrandName(work.brandName);
    setEditClientCompName(work.clientCompanyName);
  };

  // Step 1: Assign Person State
  const [assignedPersonId, setAssignedPersonId] = useState(users[0]?.id || '');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  // Form State for CRM steps
  const [visitText, setVisitText] = useState('');
  const [visitImgUrl, setVisitImgUrl] = useState('https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80');
  const [step1UploadedFiles, setStep1UploadedFiles] = useState<{ name: string; url?: string; type: 'IMAGE' | 'AUDIO' | 'DOCUMENT' }[]>([]);

  const [lockedStepNotice, setLockedStepNotice] = useState<string>('');
  const [reminderNotice, setReminderNotice] = useState<string>('');

  const [designerId, setDesignerId] = useState(designers[0]?.id || '');
  const [designerBriefText, setDesignerBriefText] = useState('');
  const [briefAttachment, setBriefAttachment] = useState('Site_Measurements_Brief.pdf');

  const [boqNotes, setBoqNotes] = useState('');

  const [proofType, setProofType] = useState<'IMAGE' | 'AUDIO'>('IMAGE');
  const [proofFileName, setProofFileName] = useState('Client_Signed_Order_Proof.png');
  const [proofNotes, setProofNotes] = useState('Client confirmed order over WhatsApp voice note & signed PO.');

  // CRM side states for designer approvals
  const [crmReceFeedback, setCrmReceFeedback] = useState('RECE slides are looking good. Ready to proceed with final 3D artwork design.');
  const [crmDesignFeedback, setCrmDesignFeedback] = useState('Concept looks fantastic! Logo sizing and wind-load specs approved.');

  // Admin Action / Work Status management
  const [adminStatusNotes, setAdminStatusNotes] = useState('');

  const currentWork = filteredWorks.find((w) => w.id === selectedWorkId) || filteredWorks[0] || displayedWorks[0];

  useEffect(() => {
    if (currentWork?.adminStatusNotes) {
      setAdminStatusNotes(currentWork.adminStatusNotes);
    } else {
      setAdminStatusNotes('');
    }
  }, [currentWork]);

  const handleUpdateAdminStatus = (newStatus: WorkAdminStatus, notes?: string) => {
    if (!currentWork) return;
    const updated: WorkAssignment = {
      ...currentWork,
      adminStatus: newStatus,
      adminStatusNotes: notes !== undefined ? notes : (adminStatusNotes || currentWork.adminStatusNotes),
      adminStatusUpdatedAt: new Date().toISOString().split('T')[0],
      adminStatusUpdatedByName: activeUser.name,
      adminStatusUpdatedByRole: activeUser.role,
      crmCompleted: newStatus === 'COMPLETED' ? true : currentWork.crmCompleted,
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateWork(updated);
  };

  useEffect(() => {
    if (currentWork?.currentStep) {
      setActiveStepTab(currentWork.currentStep);
    }
  }, [selectedWorkId, currentWork]);

  useEffect(() => {
    if (currentWork) {
      if (currentWork.designerBrief?.attachments && currentWork.designerBrief.attachments.length > 0) {
        setBriefAttachment(currentWork.designerBrief.attachments[0]);
      } else if (currentWork.visitReport?.attachments && currentWork.visitReport.attachments.length > 0) {
        setBriefAttachment(currentWork.visitReport.attachments[0].name);
      } else if (currentWork.receSubmission?.documentNames && currentWork.receSubmission.documentNames.length > 0) {
        setBriefAttachment(currentWork.receSubmission.documentNames[0]);
      } else if (currentWork.receSubmission?.imageUrls && currentWork.receSubmission.imageUrls.length > 0) {
        const lastSlash = currentWork.receSubmission.imageUrls[0].lastIndexOf('/');
        setBriefAttachment(lastSlash !== -1 ? currentWork.receSubmission.imageUrls[0].substring(lastSlash + 1) : 'site_picture.jpg');
      } else if (currentWork.visitReport?.images && currentWork.visitReport.images.length > 0) {
        const lastSlash = currentWork.visitReport.images[0].lastIndexOf('/');
        setBriefAttachment(lastSlash !== -1 ? currentWork.visitReport.images[0].substring(lastSlash + 1) : 'site_picture.jpg');
      } else {
        setBriefAttachment('Site_Measurements_Brief.pdf');
      }

      if (currentWork.designerBrief?.briefText) {
        setDesignerBriefText(currentWork.designerBrief.briefText);
      } else {
        setDesignerBriefText('');
      }

      if (currentWork.designerBrief?.assignedDesignerId) {
        setDesignerId(currentWork.designerBrief.assignedDesignerId);
      }
    }
  }, [currentWork]);

  const handlePrevStep = () => {
    const stepOrder: CrmWorkStep[] = [
      'STEP_ASSIGN_PERSON',
      'STEP_A_VISIT_REPORT',
      'STEP_D_ASSIGN_DESIGNER',
      'STEP_E_DESIGN_STATUS',
      'STEP_F_QUOTE_PREPARED',
      'STEP_G_QUOTE_STATUS',
      'STEP_I_ORDER_CONFIRMED'
    ];
    const idx = stepOrder.indexOf(activeStepTab);
    if (idx > 0) {
      setActiveStepTab(stepOrder[idx - 1]);
      setLockedStepNotice('');
    }
  };

  if (!currentWork) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200 shadow-xs">
        No active work assignments found in the CRM database.
      </div>
    );
  }

  const stepsList: { id: CrmWorkStep; label: string; desc: string; num: string }[] = [
    { id: 'STEP_ASSIGN_PERSON', label: 'Assign Person & Receipt', desc: 'Assign to anyone including Admin', num: '1' },
    { id: 'STEP_A_VISIT_REPORT', label: 'Visit Report & Brief', desc: 'Text/Audio + Picture & PDF only', num: '2' },
    { id: 'STEP_D_ASSIGN_DESIGNER', label: 'Assign to Designer', desc: 'Send files & instructions', num: '3' },
    { id: 'STEP_E_DESIGN_STATUS', label: 'Designer PPT & Verify', desc: 'Verify PPT, Edits or Next', num: '4' },
    { id: 'STEP_F_QUOTE_PREPARED', label: 'Quote Prepared', desc: 'Real Estate Ad & Works Format', num: '5' },
    { id: 'STEP_G_QUOTE_STATUS', label: 'Quotation Status', desc: 'Sent / Edits / Approved', num: '6' },
    { id: 'STEP_I_ORDER_CONFIRMED', label: 'Order Confirmed', desc: 'Proof upload & OTP pass', num: '7' },
  ];

  // Helper: check if a specific step is completed for currentWork
  const isStepCompleted = (stepId: CrmWorkStep, work: WorkAssignment): boolean => {
    switch (stepId) {
      case 'STEP_ASSIGN_PERSON':
        return !!(work.assignedPersonId || work.assignedPersonName);
      case 'STEP_A_VISIT_REPORT':
        return !!(work.visitReport && (work.visitReport.notes || (work.visitReport.images && work.visitReport.images.length > 0) || (work.visitReport.attachments && work.visitReport.attachments.length > 0)));
      case 'STEP_D_ASSIGN_DESIGNER':
        return !!(work.designerBrief && work.designerBrief.assignedDesignerId);
      case 'STEP_E_DESIGN_STATUS':
        return work.designStatus === 'APPROVED';
      case 'STEP_F_QUOTE_PREPARED':
        return !!(work.quotation && work.quotation.items && work.quotation.items.length > 0);
      case 'STEP_G_QUOTE_STATUS':
        return work.quotationStatus === 'APPROVED';
      case 'STEP_I_ORDER_CONFIRMED':
        return !!(work.orderConfirmation && (work.orderConfirmation.confirmedAt || work.orderConfirmation.fileName)) || work.crmCompleted;
      default:
        return false;
    }
  };

  // Helper: check if a step is unlocked (all previous steps must be completed)
  const isStepUnlocked = (stepId: CrmWorkStep, work: WorkAssignment): boolean => {
    const stepOrder: CrmWorkStep[] = [
      'STEP_ASSIGN_PERSON',
      'STEP_A_VISIT_REPORT',
      'STEP_D_ASSIGN_DESIGNER',
      'STEP_E_DESIGN_STATUS',
      'STEP_F_QUOTE_PREPARED',
      'STEP_G_QUOTE_STATUS',
      'STEP_I_ORDER_CONFIRMED'
    ];
    const targetIdx = stepOrder.indexOf(stepId);
    if (targetIdx <= 0) return true;

    for (let i = 0; i < targetIdx; i++) {
      if (!isStepCompleted(stepOrder[i], work)) {
        return false;
      }
    }
    return true;
  };

  const isDocument = (url: string | undefined, title: string | undefined) => {
    if (!url) return false;
    const lUrl = url.toLowerCase();
    const lTitle = (title || '').toLowerCase();
    return lUrl.endsWith('.pdf') || lUrl.endsWith('.ppt') || lUrl.endsWith('.pptx') || lUrl.endsWith('.doc') || lUrl.endsWith('.docx') ||
           lTitle.endsWith('.pdf') || lTitle.endsWith('.ppt') || lTitle.endsWith('.pptx') || lTitle.endsWith('.doc') || lTitle.endsWith('.docx');
  };

  const handleStepTabClick = (stepId: CrmWorkStep) => {
    if (isStepUnlocked(stepId, currentWork)) {
      setActiveStepTab(stepId);
      setLockedStepNotice('');
    } else {
      const stepObj = stepsList.find((s) => s.id === stepId);
      const stepIdx = stepsList.findIndex((s) => s.id === stepId);
      const prevStepObj = stepsList[stepIdx - 1];
      setLockedStepNotice(`🔒 Step ${stepObj?.num} (${stepObj?.label}) is locked! Please complete Step ${prevStepObj?.num} (${prevStepObj?.label}) first before moving to Step ${stepObj?.num}.`);
    }
  };

  const handleSaveAssignedPerson = () => {
    const selectedUser = users.find((u) => u.id === assignedPersonId) || users[0];
    const updated: WorkAssignment = {
      ...currentWork,
      assignedPersonId: selectedUser?.id,
      assignedPersonName: selectedUser?.name,
      assignedPersonRole: selectedUser?.role,
      assignmentNotes: assignmentNotes || 'Assigned for receipt & processing.',
      assignmentAssignedAt: new Date().toLocaleString(),
      currentStep: 'STEP_A_VISIT_REPORT',
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateWork(updated);
    setActiveStepTab('STEP_A_VISIT_REPORT');
    setLockedStepNotice('');
  };

  const handleSaveVisitReport = () => {
    const updatedAttachments = [
      ...(currentWork.visitReport?.attachments || []),
      ...step1UploadedFiles
    ];
    
    if (currentWork.receSubmission?.documentNames) {
      currentWork.receSubmission.documentNames.forEach(docName => {
        if (!updatedAttachments.find(a => a.name === docName)) {
          updatedAttachments.push({ name: docName, type: 'DOCUMENT' });
        }
      });
    }

    if (updatedAttachments.length === 0) {
      updatedAttachments.push({ name: 'Site_Inspection_Document.pdf', type: 'DOCUMENT' });
    }

    const finalImages = (currentWork.receSubmission?.imageUrls && currentWork.receSubmission.imageUrls.length > 0)
      ? [...currentWork.receSubmission.imageUrls]
      : (visitImgUrl ? [visitImgUrl] : []);

    const updated: WorkAssignment = {
      ...currentWork,
      currentStep: 'STEP_D_ASSIGN_DESIGNER',
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0],
      visitReport: {
        visitDate: new Date().toISOString().split('T')[0],
        notes: visitText || 'Completed initial site visit and requirements audit.',
        images: finalImages,
        attachments: updatedAttachments,
        submittedAt: new Date().toLocaleString()
      }
    };
    onUpdateWork(updated);
    setActiveStepTab('STEP_D_ASSIGN_DESIGNER');
    setLockedStepNotice('');
  };

  const seniorDesignersList = designers.filter((d) => 
    d.role === 'SR_DESIGNER' || 
    d.role === 'SENIOR_DESIGNER' || 
    d.name.toLowerCase().includes('sr designer') || 
    d.name.toLowerCase().includes('senior')
  );
  const eligibleSeniorDesigners = seniorDesignersList.length > 0 ? seniorDesignersList : designers;

  const handleAssignDesigner = () => {
    const designerObj = eligibleSeniorDesigners.find((d) => d.id === designerId) || eligibleSeniorDesigners[0];
    
    // Automatically collect all supervisor-uploaded and CRM-confirmed files & pictures
    const mergedAttachments: string[] = [];
    if (briefAttachment && !mergedAttachments.includes(briefAttachment)) {
      mergedAttachments.push(briefAttachment);
    }

    // Include attachments confirmed in Visit Report
    if (currentWork.visitReport?.attachments) {
      currentWork.visitReport.attachments.forEach(att => {
        if (att.name && !mergedAttachments.includes(att.name)) {
          mergedAttachments.push(att.name);
        }
      });
    }

    // Include document names from supervisor RECE Submission
    if (currentWork.receSubmission?.documentNames) {
      currentWork.receSubmission.documentNames.forEach(docName => {
        if (docName && !mergedAttachments.includes(docName)) {
          mergedAttachments.push(docName);
        }
      });
    }

    // Include approved visit images
    if (currentWork.visitReport?.images) {
      currentWork.visitReport.images.forEach(img => {
        if (img && !img.includes('1581094794329') && !mergedAttachments.includes(img)) {
          mergedAttachments.push(img);
        }
      });
    }

    // Include supervisor uploaded images
    if (currentWork.receSubmission?.imageUrls) {
      currentWork.receSubmission.imageUrls.forEach(url => {
        if (url && !mergedAttachments.includes(url)) {
          mergedAttachments.push(url);
        }
      });
    }

    const updated: WorkAssignment = {
      ...currentWork,
      currentStep: 'STEP_E_DESIGN_STATUS',
      assignedSeniorDesignerId: designerObj.id,
      assignedSeniorDesignerName: designerObj.name,
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0],
      designerBrief: {
        briefText: designerBriefText || 'Please create facade design concepts and 3D mockup renderings.',
        attachments: mergedAttachments,
        assignedDesignerId: designerObj.id,
        assignedDesignerName: designerObj.name,
        assignedAt: new Date().toLocaleString()
      },
      designStatus: 'SENT'
    };
    onUpdateWork(updated);
    setActiveStepTab('STEP_E_DESIGN_STATUS');
  };

  const handleApproveRecePpt = (comments: string) => {
    const updated: WorkAssignment = {
      ...currentWork,
      designerRecePptApprovedByCrm: 'APPROVED',
      designerRecePptCrmComments: comments,
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateWork(updated);
  };

  const handleRequestRecePptEdits = (comments: string) => {
    const updated: WorkAssignment = {
      ...currentWork,
      designerRecePptApprovedByCrm: 'EDITS',
      designerRecePptCrmComments: comments || 'Please revise the RECE presentation slides with correct measurements.',
      receEditsCount: (currentWork.receEditsCount || 0) + 1,
      designStatus: 'EDITS',
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateWork(updated);
  };

  const handleApproveDesignPpt = (comments: string) => {
    const updated: WorkAssignment = {
      ...currentWork,
      designerDesignPptApprovedByCrm: 'APPROVED',
      designerDesignPptCrmComments: comments,
      designStatus: 'APPROVED',
      currentStep: 'STEP_F_QUOTE_PREPARED',
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateWork(updated);
    setActiveStepTab('STEP_F_QUOTE_PREPARED');
  };

  const handleRequestDesignPptEdits = (comments: string) => {
    const updated: WorkAssignment = {
      ...currentWork,
      designerDesignPptApprovedByCrm: 'EDITS',
      designerDesignPptCrmComments: comments || 'Please update designs to incorporate facade color adjustments.',
      designEditsCount: (currentWork.designEditsCount || 0) + 1,
      designStatus: 'EDITS',
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateWork(updated);
  };

  const handleQuotationSaveFromEngine = (quotePayload: Quotation, targetWorkId?: string) => {
    const workToUpdate = (targetWorkId && works.find((w) => w.id === targetWorkId)) || currentWork;
    const updated: WorkAssignment = {
      ...workToUpdate,
      quotation: quotePayload,
      quotationStatus: 'SENT',
      currentStep: 'STEP_G_QUOTE_STATUS',
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateWork(updated);
    if (workToUpdate.id !== selectedWorkId) {
      setSelectedWorkId(workToUpdate.id);
    }
    setShowQuoteEngine(false);
    setActiveStepTab('STEP_G_QUOTE_STATUS');
  };

  const handleUpdateQuotationStatus = (status: ApprovalStatus) => {
    const updated: WorkAssignment = {
      ...currentWork,
      quotationStatus: status,
      currentStep: status === 'APPROVED' ? 'STEP_I_ORDER_CONFIRMED' : 'STEP_G_QUOTE_STATUS',
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateWork(updated);
    if (status === 'APPROVED') {
      setActiveStepTab('STEP_I_ORDER_CONFIRMED');
    } else if (status === 'EDITS') {
      setShowQuoteEngine(true);
    }
  };

  const handleDispatchQuotationReminder = (customNote?: string) => {
    const now = new Date();
    const formattedTimestamp = now.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    const updated: WorkAssignment = {
      ...currentWork,
      quotationLastReminderAt: formattedTimestamp,
      quotationFollowUpNotes: customNote || currentWork.quotationFollowUpNotes || 'Automated daily follow-up dispatched via Email & WhatsApp.',
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: now.toISOString().split('T')[0]
    };
    onUpdateWork(updated);
    setReminderNotice(`Daily follow-up reminder sent to ${currentWork.clientCompanyName || 'client'} on ${formattedTimestamp}!`);
    setTimeout(() => setReminderNotice(''), 5000);
  };

  const handleBoqSubmit = (isFinal: boolean) => {
    const updated: WorkAssignment = {
      ...currentWork,
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0],
      boqApproval: {
        submittedForReview: true,
        finalSubmitted: isFinal,
        submittedAt: currentWork.boqApproval?.submittedAt || new Date().toLocaleString(),
        finalSubmittedAt: isFinal ? new Date().toLocaleString() : undefined,
        boqNotes: boqNotes || 'BOQ items reviewed against client floor plan.'
      },
      currentStep: isFinal ? 'STEP_I_ORDER_CONFIRMED' : 'STEP_H_BOQ_APPROVAL'
    };
    onUpdateWork(updated);
    if (isFinal) setActiveStepTab('STEP_I_ORDER_CONFIRMED');
  };

  const handleFinalOrderConfirm = () => {
    // Generate 6-digit Supervisor OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const updated: WorkAssignment = {
      ...currentWork,
      crmCompleted: true,
      currentStep: 'STEP_SUPERVISOR_PHASE',
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0],
      orderConfirmation: {
        proofType: proofType === 'IMAGE' ? 'IMAGE' : 'AUDIO',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
        fileName: proofFileName,
        notes: proofNotes,
        confirmedAt: new Date().toLocaleString()
      },
      supervisorOtpCode: otp
    };
    onUpdateWork(updated);
    setActiveStepTab('STEP_SUPERVISOR_PHASE' as any);
  };

  const handleRestartProcess = () => {
    const updated: WorkAssignment = {
      ...currentWork,
      crmCompleted: false,
      currentStep: 'STEP_A_VISIT_REPORT',
      visitReport: undefined,
      pptReport: undefined,
      reportStatus: 'PENDING',
      designerBrief: undefined,
      designStatus: 'PENDING',
      quotation: undefined,
      quotationStatus: 'PENDING',
      boqApproval: undefined,
      orderConfirmation: undefined,
      supervisorOtpCode: undefined,
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateWork(updated);
    setActiveStepTab('STEP_A_VISIT_REPORT');
  };

  if (showQuoteEngine) {
    return (
      <QuotationBuilder
        initialQuotation={currentWork.quotation}
        workAssignment={currentWork}
        works={works}
        onSaveQuotation={handleQuotationSaveFromEngine}
        onBack={() => setShowQuoteEngine(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Search, Status Filter & Work Selector Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        {/* Top Header & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
              CRM
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span>CRM Step-by-Step Dropdown Pipeline</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 font-mono">
                  A ➔ E ➔ G ➔ I
                </span>
              </h2>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search works by title, client, brand, CRM, designer, phone, step..."
              value={activeSearch}
              onChange={(e) => handleSearchUpdate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium transition-all"
            />
            {activeSearch && (
              <button
                type="button"
                onClick={() => handleSearchUpdate('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {[
              { id: 'ALL', label: `All (${displayedWorks.length})` },
              { id: 'ONGOING', label: `Ongoing (${displayedWorks.filter(w => (w.adminStatus === 'ONGOING' || (!w.adminStatus && !w.crmCompleted && w.currentStep !== 'COMPLETED'))).length})` },
              { id: 'ON_HOLD', label: `On Hold (${displayedWorks.filter(w => w.adminStatus === 'ON_HOLD').length})` },
              { id: 'COMPLETED', label: `Completed (${displayedWorks.filter(w => w.adminStatus === 'COMPLETED' || w.crmCompleted || w.currentStep === 'COMPLETED').length})` },
              { id: 'PENDING_APPROVAL', label: `Pending (${displayedWorks.filter(w => w.adminStatus === 'PENDING_APPROVAL').length})` },
              { id: 'CANCELLED', label: `Cancelled (${displayedWorks.filter(w => w.adminStatus === 'CANCELLED').length})` },
            ].map((tab) => {
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 border text-[11px] font-bold ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-semibold text-slate-500">
            Matching: <strong className="text-slate-900 font-extrabold">{filteredWorks.length}</strong> of {displayedWorks.length} works
          </div>
        </div>

        {/* Work Selection Dropdown & Action Controls */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider shrink-0">
              Active Client Work:
            </span>
            {filteredWorks.length === 0 ? (
              <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-lg flex-1">
                No matching works found. Try clearing filters.
              </div>
            ) : (
              <select
                value={selectedWorkId}
                onChange={(e) => setSelectedWorkId(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer truncate"
              >
                {filteredWorks.map((w) => {
                  const s = w.adminStatus || (w.crmCompleted ? 'COMPLETED' : 'ONGOING');
                  return (
                    <option key={w.id} value={w.id}>
                      [{s}] {w.clientCompanyName} - {w.brandName} ({w.crmCompleted ? 'CRM Completed' : w.currentStep.replace(/_/g, ' ')})
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentWork && (
              <button
                onClick={() => openEditWork(currentWork)}
                className="flex-1 sm:flex-initial px-3 py-2 text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold"
                title="Edit Active Work Assignment"
              >
                <Pencil className="w-3.5 h-3.5 text-amber-600" />
                <span>Edit Work</span>
              </button>
            )}

            {onDeleteWork && currentWork && (
              <button
                onClick={() => {
                  if (window.confirm(`Delete work assignment "${currentWork.workTitle}"?`)) {
                    onDeleteWork(currentWork.id);
                    const remaining = displayedWorks.filter((w) => w.id !== currentWork.id);
                    if (remaining.length > 0) setSelectedWorkId(remaining[0].id);
                  }
                }}
                className="flex-1 sm:flex-initial px-3 py-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold"
                title="Delete Active Work Assignment"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Selected Work Info Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-blue-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
              Client Assignment
            </span>

            {/* Admin Status Pill */}
            {(() => {
              const curStatus = currentWork.adminStatus || (currentWork.crmCompleted ? 'COMPLETED' : 'ONGOING');
              return (
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider border flex items-center gap-1 ${
                    curStatus === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : curStatus === 'ON_HOLD'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : curStatus === 'CANCELLED'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : curStatus === 'PENDING_APPROVAL'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${curStatus === 'ONGOING' ? 'bg-blue-400 animate-pulse' : curStatus === 'COMPLETED' ? 'bg-emerald-400' : curStatus === 'ON_HOLD' ? 'bg-amber-400' : 'bg-slate-400'}`} />
                  Status: {curStatus.replace(/_/g, ' ')}
                </span>
              );
            })()}

            <span className="text-xs text-slate-300 font-medium">CRM: {currentWork.assignedCrmName}</span>
            {(currentWork.assignedSeniorDesignerName || currentWork.designerBrief?.assignedDesignerName) && (
              <span className="bg-purple-900/90 text-purple-200 border border-purple-700/80 font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                👑 Head: {currentWork.assignedSeniorDesignerName || currentWork.designerBrief?.assignedDesignerName}
              </span>
            )}
            {currentWork.assignedSubDesignerName && (
              <span className="bg-emerald-900/90 text-emerald-200 border border-emerald-700/80 font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                👤 Junior: {currentWork.assignedSubDesignerName}
              </span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">{currentWork.workTitle}</h3>
          <p className="text-xs text-slate-300 font-normal">
            Company: <strong className="text-white font-bold">{currentWork.clientCompanyName}</strong> | Brand: {currentWork.brandName}
            {currentWork.siteLocationAddress && ` | Site: ${currentWork.siteLocationAddress}`}
          </p>

          {/* Designer Chain Status Line */}
          {(currentWork.assignedSeniorDesignerName || currentWork.designerBrief || currentWork.assignedSubDesignerName) && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="text-slate-400 font-medium">Designer Chain:</span>
              <span className="text-purple-300 font-bold">
                {currentWork.assignedSeniorDesignerName || 'Senior Designer Lead'}
              </span>
              <span className="text-slate-500">→</span>
              {currentWork.assignedSubDesignerName ? (
                <span className="text-emerald-300 font-extrabold bg-emerald-950/80 border border-emerald-700 px-2 py-0.5 rounded">
                  {currentWork.assignedSubDesignerName} (Assigned by Senior Designer)
                </span>
              ) : (
                <span className="text-amber-300 font-medium bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded italic text-[10px]">
                  Pending Senior Designer Sub-Delegation
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 bg-slate-800 p-2.5 sm:p-3 rounded-lg border border-slate-700/80 w-full md:w-auto justify-between md:justify-start">
          <div className="text-left md:text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Current Phase</div>
            <div className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
              {currentWork.crmCompleted ? 'Project Coordinator Handover (OTP Active)' : currentWork.currentStep.replace(/_/g, ' ')}
            </div>
          </div>
          {currentWork.crmCompleted && currentWork.supervisorOtpCode && (
            <div className="bg-emerald-500/20 border border-emerald-400/30 p-2 rounded text-center shrink-0">
              <div className="text-[9px] uppercase font-bold text-emerald-300">Project Coordinator OTP</div>
              <div className="text-sm font-black text-white font-mono tracking-widest">
                {currentWork.supervisorOtpCode}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADMIN ACTION & WORK STATUS CONTROLS CARD */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Admin Action & Project Status Controls
            </h4>
          </div>
          <div className="text-[11px] text-slate-500">
            {currentWork.adminStatusUpdatedAt && (
              <span>Last updated: <strong className="text-slate-800">{currentWork.adminStatusUpdatedAt}</strong> by {currentWork.adminStatusUpdatedByName || 'Admin'}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Status Dropdown */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">Set Work Status *</label>
            <select
              value={currentWork.adminStatus || (currentWork.crmCompleted ? 'COMPLETED' : 'ONGOING')}
              onChange={(e) => handleUpdateAdminStatus(e.target.value as WorkAdminStatus)}
              className={`w-full text-xs p-2.5 rounded-xl font-extrabold border cursor-pointer ${
                currentWork.adminStatus === 'COMPLETED' || currentWork.crmCompleted
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : currentWork.adminStatus === 'ON_HOLD'
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : currentWork.adminStatus === 'CANCELLED'
                  ? 'bg-rose-50 text-rose-900 border-rose-300'
                  : currentWork.adminStatus === 'PENDING_APPROVAL'
                  ? 'bg-purple-50 text-purple-900 border-purple-300'
                  : 'bg-blue-50 text-blue-900 border-blue-300'
              }`}
            >
              <option value="ONGOING" className="bg-white text-blue-900 font-bold">🚀 Ongoing / Active Execution</option>
              <option value="ON_HOLD" className="bg-white text-amber-900 font-bold">⏸️ On Hold / Paused</option>
              <option value="COMPLETED" className="bg-white text-emerald-900 font-bold">✅ Completed / Delivered</option>
              <option value="PENDING_APPROVAL" className="bg-white text-purple-900 font-bold">⏳ Pending Admin Review</option>
              <option value="CANCELLED" className="bg-white text-rose-900 font-bold">❌ Cancelled / Closed</option>
            </select>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">1-Click Quick Actions</label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleUpdateAdminStatus('ONGOING')}
                className={`flex-1 py-2 px-2 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  (currentWork.adminStatus === 'ONGOING' || (!currentWork.adminStatus && !currentWork.crmCompleted))
                    ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" /> Ongoing
              </button>
              <button
                type="button"
                onClick={() => handleUpdateAdminStatus('ON_HOLD')}
                className={`flex-1 py-2 px-2 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  currentWork.adminStatus === 'ON_HOLD'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                <PauseCircle className="w-3.5 h-3.5" /> Hold
              </button>
              <button
                type="button"
                onClick={() => handleUpdateAdminStatus('COMPLETED')}
                className={`flex-1 py-2 px-2 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  (currentWork.adminStatus === 'COMPLETED' || currentWork.crmCompleted)
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" /> Completed
              </button>
            </div>
          </div>

          {/* Admin Status Notes & Remarks */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-700">Admin Remarks / Notes</label>
              <button
                type="button"
                onClick={() => handleUpdateAdminStatus(currentWork.adminStatus || 'ONGOING', adminStatusNotes)}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Save Notes
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="e.g. Scope revised, material dispatched, etc."
                value={adminStatusNotes}
                onChange={(e) => setAdminStatusNotes(e.target.value)}
                onBlur={() => handleUpdateAdminStatus(currentWork.adminStatus || 'ONGOING', adminStatusNotes)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Steps Grid Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
          <span className="uppercase tracking-wider">Pipeline Steps (1 - 9)</span>
          <span className="text-blue-600 font-extrabold sm:hidden text-[10px]">Swipe horizontally →</span>
        </div>
        <div className="overflow-x-auto no-scrollbar touch-pan-x pb-1">
          <div className="flex items-center gap-2 min-w-max">
            {stepsList.map((step) => {
              const isActive = activeStepTab === step.id;
              const isUnlocked = isStepUnlocked(step.id, currentWork);
              const isFinished = isStepCompleted(step.id, currentWork);

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepTabClick(step.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : isFinished
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                      : isUnlocked
                      ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 font-semibold'
                      : 'bg-slate-100/70 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0 ${
                      isActive
                        ? 'bg-white text-blue-700'
                        : isFinished
                        ? 'bg-emerald-600 text-white'
                        : isUnlocked
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-slate-300 text-slate-500'
                    }`}
                  >
                    {isFinished ? '✓' : !isUnlocked ? <Lock className="w-2.5 h-2.5" /> : step.num}
                  </div>
                  <div className="text-left font-bold tracking-tight flex items-center gap-1">
                    <span>{step.label}</span>
                    {!isUnlocked && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Locked Step Warning Banner */}
      {lockedStepNotice && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3.5 rounded-xl text-xs font-extrabold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{lockedStepNotice}</span>
          </div>
          <button
            onClick={() => setLockedStepNotice('')}
            className="text-amber-700 hover:text-amber-900 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Active Step Panel View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">

        {activeStepTab !== 'STEP_ASSIGN_PERSON' && (
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <button
              onClick={handlePrevStep}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              ← Back to Previous Section / Edit
            </button>
            <span className="text-xs text-slate-500 italic">You can go back anytime to review or edit previous sections.</span>
          </div>
        )}

        {/* STEP ASSIGN PERSON */}
        {activeStepTab === 'STEP_ASSIGN_PERSON' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  Step 1: Assign Person & Receipt (Anyone including Admin)
                </h3>
                <p className="text-xs text-slate-500">
                  Assign this task, work, or receipt to any team member or Administrator.
                </p>
              </div>
              {currentWork.assignedPersonName && (
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600" /> Assigned To: {currentWork.assignedPersonName} ({currentWork.assignedPersonRole || 'MEMBER'})
                </span>
              )}
            </div>

            {currentWork.assignedPersonName && (
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-1 text-xs">
                <div className="font-extrabold text-blue-900">Current Assignment Record:</div>
                <div className="text-slate-800">
                  Assigned to: <strong className="text-slate-900">{currentWork.assignedPersonName}</strong> ({currentWork.assignedPersonRole})
                </div>
                <div className="text-slate-600">Instructions: {currentWork.assignmentNotes || 'No specific notes recorded.'}</div>
                {currentWork.assignmentAssignedAt && (
                  <div className="text-[10px] text-blue-700 font-mono">Assigned At: {currentWork.assignmentAssignedAt}</div>
                )}
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Person / Recipient (Including Admin, CRM, Supervisors, etc.):
                </label>
                <select
                  value={assignedPersonId}
                  onChange={(e) => setAssignedPersonId(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 bg-slate-50 cursor-pointer"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} [{u.role}] {u.email ? `(${u.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assignment Notes & Receipt Instructions:
                </label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="Enter specific instructions for the assigned person regarding receipt, visit, or initial execution..."
                  rows={3}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveAssignedPerson}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Save Assignment & Move to Step 2 (Visit Report)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP A: VISIT REPORT */}
        {activeStepTab === 'STEP_A_VISIT_REPORT' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Step A: Review Assigned Person's Visit & Picture Submission
                </h3>
                <p className="text-xs text-slate-500">
                  Review the site pictures and documentation submitted by the assigned person ({currentWork.assignedPersonName || 'Staff'}), then approve to send further.
                </p>
              </div>
              {currentWork.visitReport && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Reviewed & Approved
                </span>
              )}
            </div>

            {/* Display Assigned Person's Submission (Pictures & Notes) */}
            <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-200 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                <div className="font-extrabold text-indigo-950 text-xs flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  Assigned Person Submission Record:
                </div>
                <span className="text-[10px] bg-indigo-200 text-indigo-900 font-bold px-2 py-0.5 rounded-full">
                  {currentWork.receSubmission ? 'Submitted by ' + (currentWork.receSubmission.submittedBy || currentWork.assignedPersonName) : 'Awaiting Submission'}
                </span>
              </div>

              {currentWork.receSubmission ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-700 mb-1">Assigned Person Notes:</div>
                    <p className="text-slate-800 bg-white p-3 rounded-xl border border-indigo-100 leading-relaxed italic">
                      "{currentWork.receSubmission.notes}"
                    </p>
                  </div>

                  {currentWork.receSubmission.imageUrls && currentWork.receSubmission.imageUrls.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-700">Pictures Sent by Assigned Person:</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {currentWork.receSubmission.imageUrls.map((img, idx) => (
                          <div key={idx} className="relative group overflow-hidden rounded-xl">
                            <img
                              src={img}
                              alt={`Site capture ${idx}`}
                              onClick={() => {
                                if (window.showGlobalImageViewer) {
                                  window.showGlobalImageViewer(img, `Site Capture ${idx + 1} - ${currentWork.brandName}`);
                                } else {
                                  window.open(img, '_blank');
                                }
                              }}
                              className="w-full h-32 object-cover rounded-xl border border-indigo-200 shadow-xs cursor-pointer transition-transform hover:scale-105 duration-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (window.showGlobalImageViewer) {
                                  window.showGlobalImageViewer(img, `Site Capture ${idx + 1} - ${currentWork.brandName}`);
                                } else {
                                  window.open(img, '_blank');
                                }
                              }}
                              className="absolute bottom-2 right-2 bg-slate-900/90 hover:bg-blue-600 text-white text-[10px] px-2.5 py-1.5 rounded-lg backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-md cursor-pointer"
                            >
                              Fullscreen View
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentWork.receSubmission.documentNames && currentWork.receSubmission.documentNames.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-700">Documents Attached:</div>
                      <div className="flex flex-wrap gap-2">
                        {currentWork.receSubmission.documentNames.map((docName, idx) => (
                          <span key={idx} className="bg-white px-3 py-1.5 rounded-lg border border-indigo-200 text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-xs">
                            <FileText className="w-3.5 h-3.5 text-indigo-600" /> {docName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-indigo-700 font-mono pt-1">
                    Submitted At: {currentWork.receSubmission.submittedAt}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2 bg-white/60 rounded-xl border border-indigo-100 p-4">
                  <AlertCircle className="w-8 h-8 text-indigo-400 mx-auto" />
                  <div className="font-bold text-slate-800 text-xs">Waiting for assigned person ({currentWork.assignedPersonName || 'Staff'}) to complete and submit RECE visit pictures.</div>
                  <p className="text-[11px] text-slate-500">The assigned person will upload site photos and notes via their Client & Site RECE Hub.</p>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  CRM Review Notes & Approval Remarks *
                </label>
                <textarea
                  value={visitText}
                  onChange={(e) => setVisitText(e.target.value)}
                  placeholder="Enter CRM review remarks, verification status, or instructions before proceeding further..."
                  rows={3}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3">
                <button
                  onClick={handleSaveVisitReport}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" /> Review & Approve Pictures: Send to Designer Brief
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP D: ASSIGN DESIGNER */}
        {activeStepTab === 'STEP_D_ASSIGN_DESIGNER' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-purple-600" />
                  Step D: Assign to Designer & Provide Brief
                </h3>
                <p className="text-xs text-slate-500">
                  Select a designer and upload brief file / text instructions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://1drv.ms/f/c/5B3D25D3EA1B900F/IgAJlltjpsdsSY1fD3GR0QVrAV9kNgpAmu6qZpI4wMFDwKk?e=7y5YOU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-[10px] text-blue-800 font-bold transition-all cursor-pointer shadow-2xs"
                  title="Open OneDrive Cloud Storage"
                >
                  <FolderSync className="w-3.5 h-3.5 text-blue-600" />
                  <span>OneDrive Cloud Sync ↗</span>
                </a>
                {currentWork.designerBrief && (
                  <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200">
                    Assigned to: {currentWork.designerBrief.assignedDesignerName}
                  </span>
                )}
              </div>
            </div>

            {/* Live Designer Assignment & Sub-Delegation Status Tracking Box */}
            {(currentWork.assignedSeniorDesignerName || currentWork.designerBrief || currentWork.assignedSubDesignerName) && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-800 text-white rounded-lg font-bold text-xs">
                      <Palette className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Design Team Allocation & Sub-Delegation Live Status
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Tracks CRM Person's assignment to Designer Head & Designer Head's delegation to Junior Designer
                      </p>
                    </div>
                  </div>

                  {currentWork.assignedSubDesignerName ? (
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Delegated to Junior Designer
                    </span>
                  ) : currentWork.assignedSeniorDesignerName ? (
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Designer Head Sub-Delegation
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md">
                      Not Assigned Yet
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Step 1: CRM Person to Senior Designer Head */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                    <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center justify-between">
                      <span>1. Assigned By CRM Person</span>
                      <span className="text-blue-600 font-bold">Step Complete</span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 pt-0.5">
                      <span className="text-slate-500">CRM Person:</span> {currentWork.assignedCrmName}
                    </div>
                    <div className="text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
                      <span className="text-slate-500">Designer Head:</span> {currentWork.assignedSeniorDesignerName || currentWork.designerBrief?.assignedDesignerName || 'Senior Designer'}
                    </div>
                    {currentWork.designerBrief?.assignedAt && (
                      <div className="text-[10px] text-slate-400">
                        Assigned on: {currentWork.designerBrief.assignedAt}
                      </div>
                    )}
                  </div>

                  {/* Step 2: Senior Designer Head to Junior Designer */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
                      <span>2. Delegated By Designer Head</span>
                      {currentWork.assignedSubDesignerName ? (
                        <span className="text-emerald-600 font-bold">Sub-Assigned</span>
                      ) : (
                        <span className="text-amber-600 font-bold">Pending</span>
                      )}
                    </div>
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 pt-0.5">
                      <span className="text-slate-500">Designer Head:</span> {currentWork.assignedSeniorDesignerName || 'Senior Designer Lead'}
                    </div>
                    <div className="text-[11px] text-slate-800 font-semibold flex items-center gap-1.5">
                      <span className="text-slate-500">Junior Designer:</span>
                      {currentWork.assignedSubDesignerName ? (
                        <strong className="text-emerald-900 font-bold">{currentWork.assignedSubDesignerName}</strong>
                      ) : (
                        <span className="text-amber-700 font-normal italic">Awaiting Senior Designer Head allocation...</span>
                      )}
                    </div>
                    {currentWork.seniorDesignerAssignedAt && (
                      <div className="text-[10px] text-slate-400">
                        Delegated on: {currentWork.seniorDesignerAssignedAt}
                      </div>
                    )}
                  </div>
                </div>

                {currentWork.seniorDesignerNotes && (
                  <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-xs text-slate-900 font-medium space-y-0.5">
                    <div className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1">
                      Senior Designer Guidance Notes for Junior Designer:
                    </div>
                    <p className="text-slate-800 font-medium text-[11px]">"{currentWork.seniorDesignerNotes}"</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-purple-600" />
                  Assign Brief to Senior Designer Lead:
                </label>
                <select
                  value={designerId}
                  onChange={(e) => setDesignerId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-purple-200 bg-purple-50/50 text-purple-950 font-bold rounded-xl focus:ring-2 focus:ring-purple-500"
                >
                  {eligibleSeniorDesigners.map((d) => (
                    <option key={d.id} value={d.id}>
                      👑 {d.name} ({d.department || 'Senior Designer Lead'})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-purple-700 font-medium mt-1">
                  * All design briefs from CRM are assigned directly to Senior Designer Lead for allocation and quality control.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Design Brief & Instructions for Designer:
                </label>
                <textarea
                  value={designerBriefText}
                  onChange={(e) => setDesignerBriefText(e.target.value)}
                  placeholder="Provide client design brief, color schemes, dimensions, logo specifications..."
                  rows={4}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attach Brief File / Measurement Document:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={briefAttachment}
                    onChange={(e) => setBriefAttachment(e.target.value)}
                    className="flex-1 text-xs p-2.5 border border-slate-300 rounded-xl"
                  />
                  <button className="bg-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-300 flex items-center gap-1 font-semibold">
                    <Upload className="w-4 h-4" /> Browse
                  </button>
                </div>

                {/* AUTOMATIC ATTACHMENTS PREVIEW */}
                <div className="mt-3.5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-black text-emerald-950 uppercase tracking-wider">
                        Auto-Linked Site Assets (Supervisor & CRM Confirmed)
                      </span>
                    </div>
                    <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded uppercase">
                      Auto-Attached
                    </span>
                  </div>

                  {((currentWork.visitReport?.attachments && currentWork.visitReport.attachments.length > 0) || 
                    (currentWork.visitReport?.images && currentWork.visitReport.images.length > 0) ||
                    (currentWork.receSubmission?.documentNames && currentWork.receSubmission.documentNames.length > 0) ||
                    (currentWork.receSubmission?.imageUrls && currentWork.receSubmission.imageUrls.length > 0)) ? (
                    <div className="space-y-3">
                      <p className="text-[11px] text-emerald-800 font-medium">
                        All site photos and measurement reports uploaded by supervisors/RECE and approved by CRM are automatically attached to the Designer brief below:
                      </p>

                      {/* Documents */}
                      {((currentWork.visitReport?.attachments && currentWork.visitReport.attachments.length > 0) || 
                        (currentWork.receSubmission?.documentNames && currentWork.receSubmission.documentNames.length > 0)) && (
                        <div className="space-y-1">
                          <div className="text-[9px] uppercase font-bold text-emerald-700/80">Site Documents & Measurement Reports:</div>
                          <div className="flex flex-wrap gap-2">
                            {currentWork.visitReport?.attachments?.map((doc, idx) => (
                              <span key={`v-doc-${idx}`} className="bg-white border border-emerald-200 text-[10px] font-bold text-slate-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs">
                                <FileText className="w-3.5 h-3.5 text-emerald-600" /> {doc.name}
                                <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded font-extrabold uppercase">CRM Approved</span>
                              </span>
                            ))}
                            {(!currentWork.visitReport?.attachments || currentWork.visitReport.attachments.length === 0) && 
                              currentWork.receSubmission?.documentNames?.map((docName, idx) => (
                              <span key={`r-doc-${idx}`} className="bg-white border border-emerald-200 text-[10px] font-bold text-slate-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs">
                                <FileText className="w-3.5 h-3.5 text-emerald-600" /> {docName}
                                <span className="text-[8px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-extrabold uppercase">Supervisor Uploaded</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Images */}
                      {((currentWork.visitReport?.images && currentWork.visitReport.images.filter(img => !img.includes('1581094794329')).length > 0) || 
                        (currentWork.receSubmission?.imageUrls && currentWork.receSubmission.imageUrls.length > 0)) && (
                        <div className="space-y-1.5">
                          <div className="text-[9px] uppercase font-bold text-emerald-700/80">Site Pictures & Facade Captures:</div>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {currentWork.visitReport?.images?.filter(img => !img.includes('1581094794329')).map((img, idx) => (
                              <div key={`v-img-${idx}`} className="relative group rounded-lg overflow-hidden border border-emerald-300 cursor-pointer h-12 shadow-xs"
                                onClick={() => {
                                  if (window.showGlobalImageViewer) {
                                    window.showGlobalImageViewer(img, `Site Picture ${idx + 1} (Approved)`);
                                  }
                                }}
                              >
                                <img src={img} alt="CRM Approved" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-emerald-950/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-[8px] text-white font-extrabold bg-emerald-700 px-1 rounded shadow-xs">View</span>
                                </div>
                              </div>
                            ))}
                            {(!currentWork.visitReport?.images || currentWork.visitReport.images.filter(img => !img.includes('1581094794329')).length === 0) && 
                              currentWork.receSubmission?.imageUrls?.map((img, idx) => (
                              <div key={`r-img-${idx}`} className="relative group rounded-lg overflow-hidden border border-emerald-300 cursor-pointer h-12 shadow-xs"
                                onClick={() => {
                                  if (window.showGlobalImageViewer) {
                                    window.showGlobalImageViewer(img, `Site Picture ${idx + 1} (Supervisor)`);
                                  }
                                }}
                              >
                                <img src={img} alt="Supervisor uploaded" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-emerald-950/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-[8px] text-white font-extrabold bg-blue-700 px-1 rounded shadow-xs">View</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-800 italic font-medium">
                      ⚠️ No site pictures or files have been uploaded by the supervisor yet. If uploaded, they will be attached automatically here.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleAssignDesigner}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Dispatch Brief to Designer & Move to Step E
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP E: DESIGN STATUS */}
        {activeStepTab === 'STEP_E_DESIGN_STATUS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Step 3: Creative Deliverables Validation
                </h3>
                <p className="text-xs text-slate-500">
                  Review and sign off on both RECE Presentation and final 3D Design presentations in sequence
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                currentWork.designStatus === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-purple-100 text-purple-800 border-purple-300'
              }`}>
                Pipeline status: {currentWork.designStatus || 'PENDING'}
              </span>
            </div>

            {/* Live Designer Assignment & Delegation Chain Banner for CRM Person */}
            {(currentWork.assignedSeniorDesignerName || currentWork.designerBrief || currentWork.assignedSubDesignerName) && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎨</span>
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                      Design Team Execution Chain
                    </span>
                  </div>
                  {currentWork.assignedSubDesignerName ? (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Junior Designer Assigned
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending Senior Designer Delegation
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned By CRM Person:</span>
                    <div className="font-extrabold text-white flex items-center gap-1">
                      👑 {currentWork.assignedSeniorDesignerName || currentWork.designerBrief?.assignedDesignerName || 'Senior Designer Lead'}
                    </div>
                  </div>

                  <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Junior / Team Designer:</span>
                    <div className="font-extrabold text-emerald-300 flex items-center gap-1">
                      👤 {currentWork.assignedSubDesignerName || (currentWork.designerBrief?.assignedDesignerName !== currentWork.assignedSeniorDesignerName ? currentWork.designerBrief?.assignedDesignerName : null) || 'Awaiting Delegation by Head'}
                    </div>
                  </div>
                </div>

                {currentWork.seniorDesignerNotes && (
                  <div className="bg-purple-950/60 p-2.5 rounded-xl border border-purple-800/60 text-xs text-purple-200">
                    <strong className="text-amber-300 font-extrabold">Senior Designer Guidance:</strong> "{currentWork.seniorDesignerNotes}"
                  </div>
                )}
              </div>
            )}

            {/* PART 1: RECE PRESENTATION REVIEW */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Stage 1: Designer's RECE PowerPoint Audit
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  currentWork.designerRecePptApprovedByCrm === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentWork.designerRecePptApprovedByCrm === 'EDITS'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Approval: {currentWork.designerRecePptApprovedByCrm || 'AWAITING_SUBMISSION'}
                </span>
              </div>

              {currentWork.designerRecePptUrl ? (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {currentWork.designerRecePptUrl && (
                        <div 
                          className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shadow-xs cursor-pointer shrink-0 group relative bg-slate-50 flex items-center justify-center"
                          onClick={() => {
                            if (window.showGlobalImageViewer) {
                              window.showGlobalImageViewer(currentWork.designerRecePptUrl || '', currentWork.designerRecePptTitle || 'RECE Report Photo');
                            }
                          }}
                          title="Click to view full size"
                        >
                          {isDocument(currentWork.designerRecePptUrl, currentWork.designerRecePptTitle) ? (
                            <FileText className="w-6 h-6 text-blue-500" />
                          ) : (
                            <img 
                              src={currentWork.designerRecePptUrl} 
                              alt="RECE Report" 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        </div>
                      )}
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-600" />
                          {currentWork.designerRecePptTitle || 'RECE_Presentation.pptx'}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Submitted: {currentWork.designerRecePptSubmittedAt}</p>
                        <p className="text-xs text-slate-700 italic mt-1.5">"{currentWork.designerRecePptComments || 'Please review.'}"</p>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => {
                          if (window.showGlobalImageViewer) {
                            window.showGlobalImageViewer(currentWork.designerRecePptUrl || '', currentWork.designerRecePptTitle || 'RECE Presentation');
                          }
                        }}
                        className="px-2.5 py-1.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        {isDocument(currentWork.designerRecePptUrl, currentWork.designerRecePptTitle) ? (
                          <><FileText className="w-3.5 h-3.5" /> View Document</>
                        ) : (
                          <><Eye className="w-3.5 h-3.5" /> View Picture</>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (window.showGlobalImageViewer) {
                            window.showGlobalImageViewer(currentWork.designerRecePptUrl || '', currentWork.designerRecePptTitle || 'RECE Presentation');
                          }
                        }}
                        className="px-2.5 py-1.5 text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  </div>

                  {currentWork.designerRecePptApprovedByCrm === 'APPROVED' ? (
                    <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>RECE PPT Approved by CRM</span>
                        {currentWork.designerRecePptCrmComments && (
                          <span className="text-emerald-700 font-normal italic">("{currentWork.designerRecePptCrmComments}")</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRequestRecePptEdits(crmReceFeedback)}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Request RECE Edits
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      {currentWork.designerRecePptApprovedByCrm === 'EDITS' && (
                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 text-xs text-orange-900 flex items-center justify-between">
                          <span className="font-semibold flex items-center gap-1.5">
                            <Pencil className="w-4 h-4 text-orange-600" />
                            Status: Edits Requested from Designer team. ({currentWork.designerRecePptCrmComments})
                          </span>
                        </div>
                      )}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">
                          RECE Audit Review Comments / Request Edits:
                        </label>
                        <input
                          type="text"
                          value={crmReceFeedback}
                          onChange={(e) => setCrmReceFeedback(e.target.value)}
                          placeholder="Type notes on measurement verification or layout edits..."
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveRecePpt(crmReceFeedback)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve RECE PPT
                        </button>
                        <button
                          onClick={() => handleRequestRecePptEdits(crmReceFeedback)}
                          className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Request RECE Edits
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
                  ⏳ Waiting for Designer team to upload the RECE PPT presentation...
                </div>
              )}
            </div>

            {/* PART 2: FINAL DESIGN ARTWORK REVIEW */}
            <div className={`bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4`}>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Stage 2: 3D Facade & Brand Artwork PPT Sign-off
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  currentWork.designerDesignPptApprovedByCrm === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : currentWork.designerDesignPptApprovedByCrm === 'EDITS'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Approval: {currentWork.designerDesignPptApprovedByCrm || 'AWAITING_SUBMISSION'}
                </span>
              </div>
              
              <FileDownloadList files={[
                  { url: currentWork.designerRecePptUrl || '', title: currentWork.designerRecePptTitle || 'RECE PPT' },
                  { url: currentWork.designerDesignPptUrl || '', title: currentWork.designerDesignPptTitle || 'Design PPT' }
                ]} />

              {!currentWork.designerDesignPptUrl && !currentWork.crmDesignBrief ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                      Design Brief Instructions for Designer:
                    </label>
                    <textarea
                      value={crmDesignFeedback}
                      onChange={(e) => setCrmDesignFeedback(e.target.value)}
                      placeholder="Give brief what design they want to create..."
                      rows={3}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                      Upload Document (Optional):
                    </label>
                    <input type="file" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt" className="text-xs mt-1" />
                  </div>
                  <button
                    onClick={() => {
                        const updated: WorkAssignment = {
                            ...currentWork,
                            crmDesignBrief: {
                                briefText: crmDesignFeedback,
                                briefSentAt: new Date().toLocaleString()
                            },
                            lastUpdatedByName: activeUser.name,
                            lastUpdatedByRole: activeUser.role,
                            updatedAt: new Date().toISOString().split('T')[0]
                        };
                        onUpdateWork(updated);
                    }}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer"
                  >
                    Send Brief
                  </button>
                </div>
              ) : !currentWork.designerDesignPptUrl ? (
                <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-600" />
                      Design Brief Sent to Designer ({currentWork.crmDesignBrief?.briefSentAt}):
                    </span>
                    <button
                      onClick={() => {
                        const newBrief = window.prompt("Edit Design Brief for Designer:", currentWork.crmDesignBrief?.briefText || crmDesignFeedback);
                        if (newBrief !== null && newBrief.trim() !== "") {
                          setCrmDesignFeedback(newBrief);
                          const updated: WorkAssignment = {
                            ...currentWork,
                            crmDesignBrief: {
                              briefText: newBrief,
                              briefSentAt: new Date().toLocaleString()
                            },
                            lastUpdatedByName: activeUser.name,
                            lastUpdatedByRole: activeUser.role,
                            updatedAt: new Date().toISOString().split('T')[0]
                          };
                          onUpdateWork(updated);
                        }
                      }}
                      className="px-2.5 py-1 bg-purple-200 hover:bg-purple-300 text-purple-900 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit Brief
                    </button>
                  </div>
                  <p className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-purple-100 italic">
                    "{currentWork.crmDesignBrief?.briefText}"
                  </p>
                  <p className="text-[11px] text-slate-500 italic mt-1">
                    ⏳ Waiting for Designer team to create designs based on your brief...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-purple-600" />
                        {currentWork.designerDesignPptTitle || 'Design_Presentation.pptx'}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Submitted: {currentWork.designerDesignPptSubmittedAt}</p>
                      <p className="text-xs text-slate-700 italic mt-1.5">"{currentWork.designerDesignPptComments || 'Ready for review.'}"</p>
                    </div>

                    <div className="flex gap-2 shrink-0 ml-4">
                      <button
                        onClick={() => {
                          if (window.showGlobalImageViewer) {
                            window.showGlobalImageViewer(currentWork.designerDesignPptUrl || '', currentWork.designerDesignPptTitle || 'Final Design Presentation');
                          }
                        }}
                        className="px-2.5 py-1.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        {isDocument(currentWork.designerDesignPptUrl, currentWork.designerDesignPptTitle) ? (
                          <><FileText className="w-3.5 h-3.5" /> View Document</>
                        ) : (
                          <><Eye className="w-3.5 h-3.5" /> View Fullscreen</>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (window.showGlobalImageViewer) {
                            window.showGlobalImageViewer(currentWork.designerDesignPptUrl || '', currentWork.designerDesignPptTitle || 'Final Design Presentation');
                          }
                        }}
                        className="px-2.5 py-1.5 text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  </div>

                  {currentWork.designerDesignPptApprovedByCrm === 'APPROVED' ? (
                    <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Final Artwork Approved by CRM</span>
                        {currentWork.designerDesignPptCrmComments && (
                          <span className="text-emerald-700 font-normal italic">("{currentWork.designerDesignPptCrmComments}")</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRequestDesignPptEdits(crmDesignFeedback)}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Request Artwork Edits
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      {currentWork.designerDesignPptApprovedByCrm === 'EDITS' && (
                        <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 text-xs text-orange-900 flex items-center justify-between">
                          <span className="font-semibold flex items-center gap-1.5">
                            <Pencil className="w-4 h-4 text-orange-600" />
                            Status: Edits Requested from Designer team. ({currentWork.designerDesignPptCrmComments})
                          </span>
                        </div>
                      )}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">
                          Final Creative Design Review Feedback:
                        </label>
                        <input
                          type="text"
                          value={crmDesignFeedback}
                          onChange={(e) => setCrmDesignFeedback(e.target.value)}
                          placeholder="Type final revision request or feedback..."
                          className="w-full text-xs p-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveDesignPpt(crmDesignFeedback)}
                          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" /> Approve Designs & Proceed to Step F
                        </button>
                        <button
                          onClick={() => handleRequestDesignPptEdits(crmDesignFeedback)}
                          className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Request Artwork Edits
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP F: QUOTE PREPARED */}
        {activeStepTab === 'STEP_F_QUOTE_PREPARED' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Step F: Prepare Quotation (Real Estate Ad & Works Format)
                </h3>
                <p className="text-xs text-slate-500">
                  Create formal commercial quotation with itemized pricing, taxes, and terms
                </p>
              </div>
              {currentWork.quotation && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Quote Attached (₹{currentWork.quotation.totalAmount.toLocaleString('en-IN')})
                </span>
              )}
            </div>

            {currentWork.quotation ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{currentWork.quotation.quoteNumber}</span>
                    <span className="text-slate-500 ml-2">Total: ₹{currentWork.quotation.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    onClick={() => setShowQuoteEngine(true)}
                    className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Edit Quotation
                  </button>
                </div>
                <div className="text-xs text-slate-600">
                  Subject: {currentWork.quotation.subject}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                <FileText className="w-10 h-10 text-blue-600 mx-auto" />
                <div className="text-sm font-bold text-slate-800">No Quotation Attached Yet</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Launch the Real Estate Ad & Interior/Exterior format quote generator to assemble line items, tax rate, and client terms.
                </p>
                <button
                  onClick={() => setShowQuoteEngine(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  Launch Quotation Builder Engine
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP G: QUOTE STATUS */}
        {activeStepTab === 'STEP_G_QUOTE_STATUS' && (
          <div className="space-y-6">
            {/* Header with Status Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  Step G: Quotation Status Review & Client Decision
                </h3>
                <p className="text-xs text-slate-500">
                  Track daily client follow-ups and record client approval or commercial revision requests
                </p>
              </div>
              <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border shadow-2xs ${
                currentWork.quotationStatus === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : currentWork.quotationStatus === 'EDITS'
                  ? 'bg-orange-100 text-orange-900 border-orange-300'
                  : 'bg-blue-100 text-blue-900 border-blue-300'
              }`}>
                {currentWork.quotationStatus === 'APPROVED'
                  ? '✓ STATUS: APPROVED'
                  : currentWork.quotationStatus === 'EDITS'
                  ? '✏️ STATUS: EDITS REQUESTED'
                  : '⏰ STATUS: SENT TO CLIENT (AWAITING APPROVAL)'}
              </span>
            </div>

            {reminderNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center justify-between shadow-xs animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{reminderNotice}</span>
                </div>
                <button onClick={() => setReminderNotice('')} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Attached Quotation Quick Card */}
            {currentWork.quotation ? (
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <span className="font-extrabold text-sm text-white">{currentWork.quotation.quoteNumber}</span>
                    <span className="text-slate-400 text-xs">• {currentWork.quotation.quoteDate}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    Client: <strong className="text-white">{currentWork.quotation.clientCompanyName || currentWork.clientCompanyName}</strong> | Total: <strong className="text-teal-300">₹{currentWork.quotation.totalAmount.toLocaleString('en-IN')}</strong> ({currentWork.quotation.items?.length || 0} line items)
                  </p>
                </div>
                <button
                  onClick={() => setShowQuoteEngine(true)}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer shrink-0 transition-all"
                >
                  <Eye className="w-4 h-4" /> View / Edit Quotation
                </button>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs font-bold flex items-center justify-between">
                <span>No quotation payload attached to this work order yet. Launch the builder in Step F to create one.</span>
                <button
                  onClick={() => setShowQuoteEngine(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Create Quotation
                </button>
              </div>
            )}

            {/* OPTION 1: SENT TO CLIENT & DAILY REMINDER TRACKER */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 md:p-5 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-blue-950 uppercase tracking-wide">
                      Option 1: Sent to Client (Awaiting Approval)
                    </h4>
                    <p className="text-[11px] text-blue-700 font-medium">
                      Official quote handed over: Daily automated follow-up reminder is active
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Daily Auto-Reminder: Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white/80 p-3 rounded-xl border border-blue-100">
                <div>
                  <span className="text-slate-500 text-[11px] font-semibold block">Last Reminder Dispatched:</span>
                  <span className="font-extrabold text-blue-950">
                    {currentWork.quotationLastReminderAt || 'Today at 10:00 AM (System Dispatch)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] font-semibold block">Follow-Up Schedule:</span>
                  <span className="font-bold text-slate-800">Every 24 Hours (Daily 10:00 AM)</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] font-semibold block">Follow-up Channel:</span>
                  <span className="font-bold text-slate-800">Email & WhatsApp / Phone Call</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => handleDispatchQuotationReminder()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Bell className="w-3.5 h-3.5" /> Dispatch Daily Follow-Up Reminder Now
                </button>

                {currentWork.quotationStatus !== 'SENT' && (
                  <button
                    onClick={() => handleUpdateQuotationStatus('SENT')}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Status to "Sent to Client"
                  </button>
                )}
              </div>
            </div>

            {/* OPTIONS 2 & 3 TOGETHER: CLIENT DECISION HUB */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600" />
                Select Client Decision / Response (Options 2 & 3):
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* OPTION 2: COMMERCIAL EDITS REQUESTED */}
                <div className={`border-2 rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  currentWork.quotationStatus === 'EDITS'
                    ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-200'
                    : 'border-orange-200 bg-orange-50/40 hover:border-orange-300 hover:bg-orange-50/70'
                }`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                          2
                        </div>
                        <h5 className="font-extrabold text-sm text-orange-950">
                          Commercial Edits Requested
                        </h5>
                      </div>
                      <span className="text-[10px] font-black text-orange-800 bg-orange-100 px-2 py-0.5 rounded-md border border-orange-200">
                        Edits / Revision
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Client requested price discounts, line item modifications, or scope negotiation. Opens the quotation editor for immediate edits.
                    </p>
                  </div>

                  <button
                    onClick={() => handleUpdateQuotationStatus('EDITS')}
                    className="mt-5 w-full bg-orange-600 hover:bg-orange-500 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Edit3 className="w-4 h-4" /> Request Commercial Edits & Open Quotation Editor
                  </button>
                </div>

                {/* OPTION 3: APPROVE QUOTATION */}
                <div className={`border-2 rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  currentWork.quotationStatus === 'APPROVED'
                    ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-200'
                    : 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300 hover:bg-emerald-50/70'
                }`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                          3
                        </div>
                        <h5 className="font-extrabold text-sm text-emerald-950">
                          Approve Quotation
                        </h5>
                      </div>
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                        Advances to Order Confirmation
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Client approved quotation pricing and scope without further changes. Formally advances the work order to Step 7: Order Confirmed.
                    </p>
                  </div>

                  <button
                    onClick={() => handleUpdateQuotationStatus('APPROVED')}
                    className="mt-5 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Quotation & Advance to Order Confirmation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP I: ORDER CONFIRMED */}
        {activeStepTab === 'STEP_I_ORDER_CONFIRMED' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Step I: Order Confirmed (Proof Upload & Handover)
                </h3>
                <p className="text-xs text-slate-500">
                  Upload signed PO image or client audio voice confirmation proof to complete CRM role
                </p>
              </div>
              {currentWork.crmCompleted && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> CRM Phase Fully Completed
                </span>
              )}
            </div>

            {currentWork.crmCompleted && (
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> All 9 CRM workflow steps successfully completed!
                    </span>
                    <p className="text-[11px] text-slate-700">
                      This project has been moved to work sections / Supervisor phase. You can restart the process to start all steps with a new process cycle once again.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRestartProcess}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer shrink-0 transition-all hover:scale-101"
                  >
                    🔄 Restart New Process (Start Again from Step A)
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmation Proof Format:
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="proof"
                      checked={proofType === 'IMAGE'}
                      onChange={() => setProofType('IMAGE')}
                      className="text-blue-600"
                    />
                    <Image className="w-4 h-4 text-blue-600" /> Image File (Signed PO / Cheque Stamp)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="proof"
                      checked={proofType === 'AUDIO'}
                      onChange={() => setProofType('AUDIO')}
                      className="text-blue-600"
                    />
                    <Music className="w-4 h-4 text-purple-600" /> Audio File (Client Voice Confirmation)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proof File Attachment Name:
                </label>
                <input
                  type="text"
                  value={proofFileName}
                  onChange={(e) => setProofFileName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Order Confirmation Remarks:
                </label>
                <textarea
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleFinalOrderConfirm}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-101"
                >
                  <Key className="w-4 h-4" /> Confirm Order & End CRM Role (Generate Project Coordinator OTP)
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal: Edit Work Assignment */}
      {editingWork && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Edit Active Work Assignment</h3>
                  <p className="text-xs text-slate-500">Update project title, client company & brand name</p>
                </div>
              </div>
              <button onClick={() => setEditingWork(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingWork && onUpdateWork) {
                  const updated: WorkAssignment = {
                    ...editingWork,
                    workTitle: editWorkTitle,
                    brandName: editBrandName,
                    clientCompanyName: editClientCompName
                  };
                  onUpdateWork(updated);
                  setEditingWork(null);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Work / Project Title *</label>
                <input
                  type="text"
                  required
                  value={editWorkTitle}
                  onChange={(e) => setEditWorkTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Company Name *</label>
                <input
                  type="text"
                  required
                  value={editClientCompName}
                  onChange={(e) => setEditClientCompName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={editBrandName}
                  onChange={(e) => setEditBrandName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingWork(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 font-bold uppercase text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-amber-600 hover:bg-amber-700 font-bold uppercase text-xs shadow-md shadow-amber-600/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
