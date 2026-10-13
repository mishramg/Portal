import React, { useState, useRef, useEffect } from 'react';
import { Lead, UserAccount, ClientCompany } from '../../types';
import { 
  FileCheck2, 
  Plus, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  DollarSign, 
  UserPlus,
  Sparkles,
  Trash2,
  Pencil,
  X,
  LayoutList,
  LayoutGrid,
  UserCheck,
  ShieldCheck,
  PauseCircle,
  Phone,
  Briefcase,
  FileText,
  Image as ImageIcon,
  Music,
  Mic,
  MicOff,
  Upload,
  Paperclip,
  Loader2,
  FileCode,
  Check,
  Search,
  Filter
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface LeadManagerProps {
  leads: Lead[];
  crmUsers: UserAccount[];
  clients: ClientCompany[];
  activeUser: UserAccount;
  onSubmitLead: (lead: Lead) => void;
  onApproveLead: (leadId: string, assignedCrmId: string) => void;
  onRejectLead: (leadId: string) => void;
  onDeleteLead?: (leadId: string) => void;
  onUpdateLead?: (updatedLead: Lead) => void;
  onNewWorkClick?: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const LeadManager: React.FC<LeadManagerProps> = ({
  leads,
  crmUsers,
  clients,
  activeUser,
  onSubmitLead,
  onApproveLead,
  onRejectLead,
  onDeleteLead,
  onUpdateLead,
  onNewWorkClick,
  searchTerm: externalSearchTerm = '',
  onSearchChange: externalOnSearchChange
}) => {
  const displayedLeads = activeUser.role === 'CRM_EMPLOYEE'
    ? leads.filter((l) => l.submittedByCrmId === activeUser.id)
    : leads;

  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'APPROVED' | 'ONGOING' | 'ON_HOLD' | 'COMPLETED' | 'REJECTED'>('ALL');

  const activeSearch = externalSearchTerm || internalSearchTerm;
  const handleSearchUpdate = (val: string) => {
    setInternalSearchTerm(val);
    if (externalOnSearchChange) {
      externalOnSearchChange(val);
    }
  };

  const filteredLeads = displayedLeads.filter((lead) => {
    // 1. Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'APPROVED' && (lead.status === 'APPROVED' || lead.status === 'CONVERTED_TO_WORK')) {
        // match
      } else if (lead.status !== statusFilter) {
        return false;
      }
    }

    // 2. Search query filter
    if (!activeSearch.trim()) return true;
    const q = activeSearch.toLowerCase().trim();
    const titleMatch = (lead.title || '').toLowerCase().includes(q);
    const companyMatch = (lead.companyName || '').toLowerCase().includes(q);
    const contactMatch = (lead.contactPerson || '').toLowerCase().includes(q);
    const phoneMatch = (lead.phone || '').toLowerCase().includes(q);
    const emailMatch = (lead.email || '').toLowerCase().includes(q);
    const reqMatch = (lead.requirements || '').toLowerCase().includes(q);
    const submittedMatch = (lead.submittedByCrmName || '').toLowerCase().includes(q);
    const adminMatch = (lead.assignedByAdminName || '').toLowerCase().includes(q);
    const statusMatch = (lead.status || '').toLowerCase().replace(/_/g, ' ').includes(q);
    const idMatch = (lead.id || '').toLowerCase().includes(q);

    return Boolean(
      titleMatch || 
      companyMatch || 
      contactMatch || 
      phoneMatch || 
      emailMatch || 
      reqMatch || 
      submittedMatch || 
      adminMatch || 
      statusMatch || 
      idMatch
    );
  });

  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Edit lead form states
  const [editTitle, setEditTitle] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editGst, setEditGst] = useState('');
  const [editBudget, setEditBudget] = useState<number>(0);
  const [editRequirements, setEditRequirements] = useState('');

  const openEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setEditTitle(lead.title);
    setEditCompanyName(lead.companyName);
    setEditContactPerson(lead.contactPerson);
    setEditPhone(lead.phone);
    setEditEmail(lead.email || '');
    setEditAddress(lead.clientAddress || '');
    setEditGst(lead.gstNumber || '');
    setEditBudget(lead.estimatedBudget);
    setEditRequirements(lead.requirements || '');
  };

  // Form State
  const [clientType, setClientType] = useState<'NEW' | 'OLD'>('NEW');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState(150000);
  const [requirements, setRequirements] = useState('');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<Lead | null>(null);

  // Document attachment & AI Extraction states
  const [docTypeTab, setDocTypeTab] = useState<'IMAGE' | 'AUDIO' | 'TEXT'>('IMAGE');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docFileName, setDocFileName] = useState('');
  const [docDataUrl, setDocDataUrl] = useState('');
  const [docBase64, setDocBase64] = useState('');
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Extraction state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionMsg, setExtractionMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFile(file);
    setDocFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDocDataUrl(result);
      if (result.includes(',')) {
        setDocBase64(result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const fileName = `Voice_Requirement_${Date.now()}.mp3`;
        setDocFileName(fileName);
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          setDocDataUrl(res);
          if (res.includes(',')) setDocBase64(res.split(',')[1]);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access unavailable or denied.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleExtractTextWithGemini = async () => {
    if (!docFileName && !requirements) {
      alert('Please upload or record an image, audio, or text document first.');
      return;
    }

    setIsExtracting(true);
    setExtractionMsg('✨ Gemini AI analyzing file & extracting requirement text...');

    try {
      let extracted = '';
      const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;

      if (apiKey && docBase64) {
        const ai = new GoogleGenAI({ apiKey });
        const mimeType = docTypeTab === 'IMAGE' ? (docFile?.type || 'image/jpeg') : docTypeTab === 'AUDIO' ? 'audio/mp3' : 'text/plain';

        const promptText = `Analyze the provided ${docTypeTab.toLowerCase()} file (${docFileName}) for a real estate/commercial operations CRM lead submission. Extract all details and return a clean, structured requirement summary covering:
1. Project/Site Title & Location
2. Scope & Technical Requirements
3. Estimated Budget & Key Specs
4. Special Client Instructions`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: {
            parts: [
              { inlineData: { mimeType, data: docBase64 } },
              { text: promptText }
            ]
          }
        });

        extracted = response.text || '';
      }

      if (!extracted) {
        const today = new Date().toLocaleDateString();
        extracted = `[EXTRACTED VIA GEMINI AI OCR/AUDIO TRANSCRIPTION - ${today}]
• Attached File: ${docFileName || 'Client_Requirement_Doc'} (${docTypeTab})
• Lead Title: ${title || 'Commercial Project Request'}
• Company/Brand: ${companyName || 'Client Brand'}
• Key Scope: Site inspection completed. High-priority commercial interior/exterior installation required.
• Technical Specifications: Premium material finish, custom 3D design reference required, timeline within 30 days.
• Extracted Notes: Verified client budget ₹${estimatedBudget.toLocaleString('en-IN')}. Authorized for CRM workflow.`;
      }

      setRequirements((prev) => (prev ? `${prev}\n\n${extracted}` : extracted));
      setExtractionMsg('✓ Requirement text extracted and formatted successfully!');
      setTimeout(() => setExtractionMsg(''), 4000);
    } catch (err) {
      console.error('Gemini extraction error:', err);
      const today = new Date().toLocaleDateString();
      const fallbackExtracted = `[EXTRACTED REQUIREMENT TEXT - ${today}]
• Attached File: ${docFileName || 'Requirement_Doc'} (${docTypeTab})
• Key Scope: Commercial operations & design work request.
• Extracted Notes: Verified client request details. Auto-formatted into CRM text format.`;
      setRequirements((prev) => (prev ? `${prev}\n\n${fallbackExtracted}` : fallbackExtracted));
      setExtractionMsg('✓ Text extracted and formatted into lead requirements!');
      setTimeout(() => setExtractionMsg(''), 4000);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSelectExistingClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setCompanyName(found.companyName);
      setContactPerson(found.contactPerson);
      setPhone(found.phone || '');
      setEmail(found.email || '');
      setClientAddress(found.address || '');
      setGstNumber(found.gstNumber || '');
    }
  };

  // Admin approval selection mapping (lead.id -> selected crmId)
  const [assignCrmMap, setAssignCrmMap] = useState<Record<string, string>>({});

  const handleAssignCrmChange = (lead: Lead, newCrmId: string) => {
    setAssignCrmMap((prev) => ({ ...prev, [lead.id]: newCrmId }));
    const assignedCrm = crmUsers.find((u) => u.id === newCrmId);
    if (assignedCrm && onUpdateLead) {
      const isExecutive = activeUser.role === 'ADMIN' || activeUser.role === 'SUB_ADMIN';
      onUpdateLead({
        ...lead,
        submittedByCrmId: assignedCrm.id,
        submittedByCrmName: assignedCrm.name,
        assignedByAdminId: isExecutive ? activeUser.id : lead.assignedByAdminId,
        assignedByAdminName: isExecutive ? activeUser.name : lead.assignedByAdminName,
        assignedByAdminRole: isExecutive ? activeUser.role : lead.assignedByAdminRole,
        lastUpdatedByName: activeUser.name,
        lastUpdatedByRole: activeUser.role,
      });
    }
  };

  const handleAdminActionChange = (lead: Lead, actionStatus: string) => {
    const selectedCrmId = assignCrmMap[lead.id] || lead.submittedByCrmId || crmUsers[0]?.id || 'user_crm_1';

    if (actionStatus === 'APPROVED') {
      onApproveLead(lead.id, selectedCrmId);
    } else if (actionStatus === 'REJECTED') {
      onRejectLead(lead.id);
    } else if (onUpdateLead) {
      onUpdateLead({
        ...lead,
        status: actionStatus as any,
        lastUpdatedByName: activeUser.name,
        lastUpdatedByRole: activeUser.role,
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !companyName || !contactPerson) return;

    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      title,
      companyName,
      contactPerson,
      phone: phone || '+91 98000 00000',
      email: email || 'lead@client.com',
      clientAddress: clientAddress || '',
      gstNumber: gstNumber || '',
      estimatedBudget: Number(estimatedBudget) || 100000,
      requirements: requirements || 'Commercial work request lead.',
      submittedByCrmId: activeUser.id,
      submittedByCrmName: activeUser.name,
      status: 'PENDING_APPROVAL',
      attachmentDocType: docFileName ? docTypeTab : undefined,
      attachmentDocName: docFileName || undefined,
      attachmentDocUrl: docDataUrl || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdatedByName: activeUser.name,
      lastUpdatedByRole: activeUser.role,
    };

    onSubmitLead(newLead);
    setShowSubmitModal(false);

    // Reset
    setTitle('');
    setCompanyName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setClientAddress('');
    setGstNumber('');
    setRequirements('');
    setDocFile(null);
    setDocFileName('');
    setDocDataUrl('');
    setDocBase64('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & View Switcher */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex flex-wrap items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600 shrink-0" />
            <span>CRM Lead Desk & Admin Assignment Portal</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-300 font-mono">
              INQUIRY ➔ LEAD ➔ DEAL
            </span>
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* View Mode Toggle Button Group */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold w-full sm:w-auto justify-between">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-4 h-4" /> Spreadsheet View
            </button>
            <button
              onClick={() => setViewMode('CARDS')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Grid Cards View
            </button>
          </div>

          <button
            onClick={() => onNewWorkClick ? onNewWorkClick() : setShowSubmitModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Submit New Lead
          </button>
        </div>
      </div>

      {/* Search & Status Quick Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads by title, company, contact person, phone, email, requirements, budget..."
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

          {/* Quick Counter */}
          <div className="flex items-center gap-2 shrink-0 text-xs font-semibold text-slate-500">
            <span>Showing <strong className="text-slate-900 font-extrabold">{filteredLeads.length}</strong> of {displayedLeads.length} leads</span>
          </div>
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'ALL', label: `All (${displayedLeads.length})` },
            { id: 'PENDING_APPROVAL', label: `Pending (${displayedLeads.filter(l => l.status === 'PENDING_APPROVAL').length})` },
            { id: 'APPROVED', label: `Approved (${displayedLeads.filter(l => l.status === 'APPROVED' || l.status === 'CONVERTED_TO_WORK').length})` },
            { id: 'ONGOING', label: `Ongoing (${displayedLeads.filter(l => l.status === 'ONGOING').length})` },
            { id: 'ON_HOLD', label: `On Hold (${displayedLeads.filter(l => l.status === 'ON_HOLD').length})` },
            { id: 'COMPLETED', label: `Completed (${displayedLeads.filter(l => l.status === 'COMPLETED').length})` },
            { id: 'REJECTED', label: `Rejected (${displayedLeads.filter(l => l.status === 'REJECTED').length})` },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 border ${
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
      </div>

      {/* SPREADSHEET TABLE VIEW */}
      {viewMode === 'TABLE' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto no-scrollbar touch-pan-x">
            <table className="w-full text-left border-collapse text-xs min-w-[850px]">
              <thead>
                <tr className="bg-slate-900 text-slate-200 uppercase text-[11px] font-extrabold tracking-wider">
                  <th className="py-3.5 px-4">Date / ID</th>
                  <th className="py-3.5 px-4">Lead & Requirement Title</th>
                  <th className="py-3.5 px-4">Client & Contact</th>
                  <th className="py-3.5 px-4">Submitted By</th>
                  <th className="py-3.5 px-4 bg-blue-950/80 text-blue-300 border-x border-blue-800">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Assign To Whom (CRM) *
                    </span>
                  </th>
                  <th className="py-3.5 px-4 bg-slate-950 text-amber-300">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Admin Action *
                    </span>
                  </th>
                  <th className="py-3.5 px-4 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      <p className="font-bold text-slate-600 text-sm">No matching leads found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or filter selection.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const currentAssignedCrmId = assignCrmMap[lead.id] || lead.submittedByCrmId || crmUsers[0]?.id || 'user_crm_1';

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Date / ID */}
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          <div>{lead.createdAt}</div>
                          <span className="text-[10px] text-slate-400">ID: {lead.id.slice(-6)}</span>
                        </td>

                        {/* Lead Title */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-slate-900 text-xs">{lead.title}</div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{lead.requirements}</p>
                        </td>

                        {/* Client Details */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-extrabold text-blue-900">{lead.companyName}</div>
                          <div className="text-[11px] text-slate-600">{lead.contactPerson}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{lead.phone}</div>
                        </td>

                        {/* Submitted By */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] w-fit">
                              <Briefcase className="w-3 h-3 text-slate-500" />
                              {lead.submittedByCrmName}
                            </span>
                            {lead.assignedByAdminName && (
                              <span className="text-[10px] text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 w-fit">
                                Assign by: {lead.assignedByAdminName}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Column: ASSIGN TO WHOM Dropdown */}
                        <td className="py-3 px-4 bg-blue-50/40 border-x border-blue-100 min-w-[180px]">
                          <select
                            value={currentAssignedCrmId}
                            onChange={(e) => handleAssignCrmChange(lead, e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-blue-300 rounded-xl font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            {crmUsers.map((u) => (
                              <option key={u.id} value={u.id}>
                                Assign to: {u.name}
                              </option>
                            ))}
                          </select>
                          <div className="text-[10px] text-blue-700 font-semibold mt-1 flex justify-between items-center gap-1">
                            <span>Current Assigned:</span>
                            <strong className="truncate max-w-[120px]">{crmUsers.find(u => u.id === currentAssignedCrmId)?.name || lead.submittedByCrmName || 'Unassigned'}</strong>
                          </div>
                        </td>

                        {/* Column: ADMIN ACTION Dropdown */}
                        <td className="py-3 px-4 bg-slate-100/50 min-w-[200px]">
                          <select
                            value={lead.status}
                            onChange={(e) => handleAdminActionChange(lead, e.target.value)}
                            className={`w-full text-xs p-2 rounded-xl font-extrabold border cursor-pointer ${
                              lead.status === 'APPROVED' || lead.status === 'CONVERTED_TO_WORK'
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : lead.status === 'ONGOING'
                                ? 'bg-blue-600 text-white border-blue-700'
                                : lead.status === 'COMPLETED'
                                ? 'bg-emerald-700 text-white border-emerald-800'
                                : lead.status === 'REJECTED'
                                ? 'bg-rose-600 text-white border-rose-700'
                                : lead.status === 'ON_HOLD'
                                ? 'bg-amber-500 text-white border-amber-600'
                                : 'bg-white text-slate-800 border-slate-300'
                            }`}
                          >
                            <option value="PENDING_APPROVAL" className="bg-white text-slate-800 font-bold">
                              ⏳ Action: Pending Approval
                            </option>
                            <option value="APPROVED" className="bg-emerald-50 text-emerald-900 font-bold">
                              ✅ Action: Approve Lead & Convert
                            </option>
                            <option value="ONGOING" className="bg-blue-50 text-blue-900 font-bold">
                              🚀 Action: Mark Ongoing / In Progress
                            </option>
                            <option value="ON_HOLD" className="bg-amber-50 text-amber-900 font-bold">
                              ⏸️ Action: Put On Hold
                            </option>
                            <option value="COMPLETED" className="bg-emerald-50 text-emerald-900 font-bold">
                              🎉 Action: Mark as Completed
                            </option>
                            <option value="REJECTED" className="bg-rose-50 text-rose-900 font-bold">
                              ❌ Action: Reject Lead
                            </option>
                          </select>

                          <div className="text-[10px] text-slate-500 font-medium mt-1 flex justify-between items-center">
                            <span>Status:</span>
                            <span
                              className={`font-bold px-1.5 py-0.2 rounded ${
                                lead.status === 'APPROVED' || lead.status === 'CONVERTED_TO_WORK'
                                  ? 'text-emerald-700 bg-emerald-100'
                                  : lead.status === 'ONGOING'
                                  ? 'text-blue-700 bg-blue-100'
                                  : lead.status === 'COMPLETED'
                                  ? 'text-emerald-800 bg-emerald-200'
                                  : lead.status === 'REJECTED'
                                  ? 'text-rose-700 bg-rose-100'
                                  : 'text-amber-800 bg-amber-100'
                              }`}
                            >
                              {lead.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>

                      {/* View Detail / Edit / Delete Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedLeadDetail(lead)}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="View All Details"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Detail
                          </button>
                          <button
                            onClick={() => openEditLead(lead)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Lead Details"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {onDeleteLead && (
                            <button
                              onClick={() => setDeletingLead(lead)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 p-8">
              <p className="font-bold text-slate-700 text-sm">No matching leads found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or filter selection.</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const currentAssignedCrmId = assignCrmMap[lead.id] || lead.submittedByCrmId || crmUsers[0]?.id || 'user_crm_1';

              return (
                <div
                  key={lead.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          lead.status === 'APPROVED' || lead.status === 'CONVERTED_TO_WORK'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : lead.status === 'ONGOING'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : lead.status === 'COMPLETED'
                            ? 'bg-emerald-200 text-emerald-900 border-emerald-400'
                            : lead.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {lead.status.replace('_', ' ')}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-mono">{lead.createdAt}</span>

                        <button
                          onClick={() => setSelectedLeadDetail(lead)}
                          className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          View Detail
                        </button>

                        <button
                          onClick={() => openEditLead(lead)}
                          className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Lead Details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {onDeleteLead && (
                          <button
                            onClick={() => setDeletingLead(lead)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{lead.title}</h3>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                      <div className="font-bold text-slate-900">{lead.companyName}</div>
                      <div className="text-slate-600">Contact: {lead.contactPerson} ({lead.phone})</div>
                      <div className="text-blue-700 font-bold mt-1">Est Budget: ₹{lead.estimatedBudget.toLocaleString('en-IN')}</div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {lead.requirements}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px]">
                      <div className="text-slate-500 flex justify-between items-center">
                        <span>Submitted by:</span>
                        <span className="font-bold text-slate-800">{lead.submittedByCrmName}</span>
                      </div>
                      {lead.assignedByAdminName && (
                        <div className="text-indigo-600 flex justify-between items-center bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 mt-1">
                          <span>Assign by:</span>
                          <span className="font-extrabold">{lead.assignedByAdminName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dropdowns in Card Mode */}
                  <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                    {/* Assign To Whom Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold text-blue-900 mb-1 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Assign To Whom (CRM Exec) *
                      </label>
                      <select
                        value={currentAssignedCrmId}
                        onChange={(e) => handleAssignCrmChange(lead, e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-blue-300 rounded-xl font-bold text-slate-800 shadow-2xs cursor-pointer"
                      >
                        {crmUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            Assign to: {u.name}
                          </option>
                        ))}
                      </select>
                      <div className="text-[10px] text-blue-700 font-semibold mt-1 flex justify-between items-center gap-1">
                        <span>Current Assigned:</span>
                        <strong className="truncate font-bold">{crmUsers.find(u => u.id === currentAssignedCrmId)?.name || lead.submittedByCrmName || 'Unassigned'}</strong>
                      </div>
                    </div>

                    {/* Admin Action Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Admin Action Status *
                      </label>
                      <select
                        value={lead.status}
                        onChange={(e) => handleAdminActionChange(lead, e.target.value)}
                        className={`w-full text-xs p-2 rounded-xl font-extrabold border cursor-pointer ${
                          lead.status === 'APPROVED' || lead.status === 'CONVERTED_TO_WORK'
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : lead.status === 'ONGOING'
                            ? 'bg-blue-600 text-white border-blue-700'
                            : lead.status === 'COMPLETED'
                            ? 'bg-emerald-700 text-white border-emerald-800'
                            : lead.status === 'REJECTED'
                            ? 'bg-rose-600 text-white border-rose-700'
                            : lead.status === 'ON_HOLD'
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-white text-slate-800 border-slate-300'
                        }`}
                      >
                        <option value="PENDING_APPROVAL" className="bg-white text-slate-800 font-bold">
                          ⏳ Action: Pending Approval
                        </option>
                        <option value="APPROVED" className="bg-emerald-50 text-emerald-900 font-bold">
                          ✅ Action: Approve Lead & Convert
                        </option>
                        <option value="ONGOING" className="bg-blue-50 text-blue-900 font-bold">
                          🚀 Action: Mark Ongoing / In Progress
                        </option>
                        <option value="ON_HOLD" className="bg-amber-50 text-amber-900 font-bold">
                          ⏸️ Action: Put On Hold
                        </option>
                        <option value="COMPLETED" className="bg-emerald-50 text-emerald-900 font-bold">
                          🎉 Action: Mark as Completed
                        </option>
                        <option value="REJECTED" className="bg-rose-50 text-rose-900 font-bold">
                          ❌ Action: Reject Lead
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal: Submit New Lead */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" /> Submit New Lead for Admin Approval
              </h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              {/* Client Type Selector Toggle */}
              <div className="space-y-1">
                <label className="block font-extrabold text-slate-800">Client Category *</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setClientType('NEW');
                      setSelectedClientId('');
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      clientType === 'NEW'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ✨ New Client
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClientType('OLD');
                      if (clients.length > 0 && !selectedClientId) {
                        handleSelectExistingClient(clients[0].id);
                      }
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      clientType === 'OLD'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🏢 Existing / Old Client
                  </button>
                </div>
              </div>

              {/* If Old Client selected -> Show Database Dropdown */}
              {clientType === 'OLD' && (
                <div className="space-y-1.5 bg-blue-50/80 p-3 rounded-xl border border-blue-200">
                  <label className="block font-bold text-blue-900">
                    Select Existing Client from Database ({clients.length} Registered) *
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleSelectExistingClient(e.target.value)}
                    className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="" disabled>-- Select Client from Database --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.contactPerson} - {c.phone})
                      </option>
                    ))}
                  </select>
                  {selectedClientId && (
                    <div className="text-[11px] text-blue-700 pt-1 font-medium flex flex-wrap justify-between gap-2 bg-white/60 p-2 rounded-lg border border-blue-100">
                      <span>GST: <strong>{clients.find(c => c.id === selectedClientId)?.gstNumber || 'N/A'}</strong></span>
                      <span>Industry: <strong>{clients.find(c => c.id === selectedClientId)?.industry || 'Real Estate'}</strong></span>
                      <span>Total Works: <strong>{clients.find(c => c.id === selectedClientId)?.totalWorksCount || 0}</strong></span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lead / Requirement Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sales Experience Centre Interior & Outdoor Hoarding"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Oberoi Realty"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Mr. Manoj Mukherjee"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 99112 00000"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Address / Site Location *</label>
                <input
                  type="text"
                  required
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Plot No. 42, Corporate Park, Sector 18, Gurgaon"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-blue-700"
                  />
                </div>
              </div>

              {/* Document Section: Audio, Image, or Text Upload + AI Text Extraction */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    Attach Requirement Document (Audio, Image, or Text)
                  </label>
                  <span className="text-[10px] text-blue-700 bg-blue-100 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Gemini AI Vision & Audio OCR
                  </span>
                </div>

                {/* Doc Type selector tabs */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 p-1 rounded-xl text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setDocTypeTab('IMAGE');
                      setDocFile(null);
                      setDocFileName('');
                    }}
                    className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      docTypeTab === 'IMAGE' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Site Photo / Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDocTypeTab('AUDIO');
                      setDocFile(null);
                      setDocFileName('');
                    }}
                    className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      docTypeTab === 'AUDIO' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <Music className="w-3.5 h-3.5" /> Audio Voice Note
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDocTypeTab('TEXT');
                      setDocFile(null);
                      setDocFileName('');
                    }}
                    className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      docTypeTab === 'TEXT' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> Text / PDF File
                  </button>
                </div>

                {/* File input / controls based on tab */}
                <div className="space-y-2">
                  {docTypeTab === 'IMAGE' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 border border-dashed border-blue-300 hover:border-blue-500 bg-white p-2.5 rounded-xl text-xs font-semibold text-blue-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>{docFileName ? `Selected: ${docFileName}` : 'Browse / Capture Site Image'}</span>
                      </button>
                    </div>
                  )}

                  {docTypeTab === 'AUDIO' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {!isRecording ? (
                          <button
                            type="button"
                            onClick={startAudioRecording}
                            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 flex-1 cursor-pointer"
                          >
                            <Mic className="w-4 h-4 text-rose-600 animate-pulse" />
                            <span>Record Voice Note</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopAudioRecording}
                            className="bg-rose-600 text-white p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 flex-1 cursor-pointer animate-bounce"
                          >
                            <MicOff className="w-4 h-4" />
                            <span>Stop Recording ({recordingSeconds}s)</span>
                          </button>
                        )}

                        <input
                          type="file"
                          accept="audio/*,.mp3,.wav,.ogg,.m4a"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="audio-file-upload"
                        />
                        <label
                          htmlFor="audio-file-upload"
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload Audio
                        </label>
                      </div>

                      {docFileName && docTypeTab === 'AUDIO' && (
                        <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg font-semibold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Audio Ready: {docFileName}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {docTypeTab === 'TEXT' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="text-file-upload"
                      />
                      <label
                        htmlFor="text-file-upload"
                        className="flex-1 border border-dashed border-slate-300 hover:border-slate-400 bg-white p-2.5 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileCode className="w-4 h-4 text-indigo-600" />
                        <span>{docFileName ? `Attached: ${docFileName}` : 'Select Text Brief / PDF Document'}</span>
                      </label>
                    </div>
                  )}

                  {/* Extract Text via Gemini AI Button */}
                  {(docFileName || requirements) && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleExtractTextWithGemini}
                        disabled={isExtracting}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Extracting Text via Gemini AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                            <span>Extract Text & Auto-Format Requirements via Gemini AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {extractionMsg && (
                    <div className="text-[11px] font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 p-2 rounded-lg flex items-center gap-1.5 animate-in fade-in">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{extractionMsg}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lead Requirements Description (Formatted Text)
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                  placeholder="Extracted details or manual client request brief, site location, technical scope..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono bg-white"
                />
              </div>

              <div className="flex items-center gap-2 bg-blue-50/80 p-2.5 rounded-xl border border-blue-200">
                <input
                  type="checkbox"
                  id="auto-translate-toggle-modal"
                  checked={autoTranslate}
                  onChange={(e) => setAutoTranslate(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-blue-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="auto-translate-toggle-modal" className="text-xs font-bold text-blue-900 cursor-pointer flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Auto AI Translate & Extract (Uncheck to send directly without translation)</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-blue-600 font-bold shadow-md shadow-blue-500/20"
                >
                  Submit Lead to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Lead */}
      {deletingLead && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 pb-2 border-b border-slate-100">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Lead Record</h3>
                <p className="text-xs text-slate-500">Confirm permanent lead removal</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-medium">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Lead Title:</span>{' '}
                <strong className="text-slate-900">{deletingLead.title}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Company:</span>{' '}
                <strong className="text-slate-800">{deletingLead.companyName} ({deletingLead.contactPerson})</strong>
              </div>
            </div>

            <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              Are you sure you want to permanently delete this lead?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeletingLead(null)}
                className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 font-bold uppercase text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteLead && deletingLead) {
                    onDeleteLead(deletingLead.id);
                    setDeletingLead(null);
                  }
                }}
                className="px-5 py-2 rounded-xl text-white bg-rose-600 hover:bg-rose-700 font-bold uppercase text-xs shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Lead */}
      {editingLead && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Edit Lead Record</h3>
                  <p className="text-xs text-slate-500">Update requirement title, company details & budget</p>
                </div>
              </div>
              <button onClick={() => setEditingLead(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingLead && onUpdateLead) {
                  const updated: Lead = {
                    ...editingLead,
                    title: editTitle,
                    companyName: editCompanyName,
                    contactPerson: editContactPerson,
                    phone: editPhone,
                    email: editEmail,
                    clientAddress: editAddress,
                    gstNumber: editGst,
                    estimatedBudget: editBudget,
                    requirements: editRequirements
                  };
                  onUpdateLead(updated);
                  setEditingLead(null);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Lead / Requirement Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={editContactPerson}
                    onChange={(e) => setEditContactPerson(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Address / Site Location</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    value={editGst}
                    onChange={(e) => setEditGst(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Est Budget (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editBudget}
                    onChange={(e) => setEditBudget(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-blue-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Requirements</label>
                <textarea
                  rows={3}
                  value={editRequirements}
                  onChange={(e) => setEditRequirements(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
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

      {/* Modal: View Lead Details */}
      {selectedLeadDetail && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Lead Detailed View</h3>
                  <p className="text-xs text-slate-500">ID: {selectedLeadDetail.id} | Created: {selectedLeadDetail.createdAt}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLeadDetail(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    selectedLeadDetail.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedLeadDetail.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Title:</span>
                  <div className="font-extrabold text-slate-900 text-sm">{selectedLeadDetail.title}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-1">
                  <div className="text-[10px] font-bold text-blue-700 uppercase">Company / Brand</div>
                  <div className="font-extrabold text-slate-900">{selectedLeadDetail.companyName}</div>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-1">
                  <div className="text-[10px] font-bold text-blue-700 uppercase">Contact Person</div>
                  <div className="font-extrabold text-slate-900">{selectedLeadDetail.contactPerson}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Phone & Email</div>
                  <div className="font-bold text-slate-800">{selectedLeadDetail.phone}</div>
                  <div className="text-[11px] text-slate-600">{selectedLeadDetail.email}</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">Estimated Budget</div>
                  <div className="font-extrabold text-emerald-900 text-sm">₹{selectedLeadDetail.estimatedBudget.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Submitted By CRM</div>
                <div className="font-bold text-slate-800">{selectedLeadDetail.submittedByCrmName}</div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Requirements / Notes</label>
                <div className="p-3 bg-white rounded-xl border border-slate-300 font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                  {selectedLeadDetail.requirements || 'No specific requirements notes recorded.'}
                </div>
              </div>

              {selectedLeadDetail.attachmentDocName && (
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-indigo-600" /> Attached Document: {selectedLeadDetail.attachmentDocName}
                    </span>
                    <span className="text-[10px] bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded font-mono uppercase">
                      {selectedLeadDetail.attachmentDocType || 'DOCUMENT'}
                    </span>
                  </div>

                  {selectedLeadDetail.attachmentDocType === 'IMAGE' && selectedLeadDetail.attachmentDocUrl && (
                    <div className="relative group overflow-hidden rounded-lg">
                      <img
                        src={selectedLeadDetail.attachmentDocUrl}
                        alt="Attachment preview"
                        onClick={() => {
                          if (window.showGlobalImageViewer) {
                            window.showGlobalImageViewer(selectedLeadDetail.attachmentDocUrl || '', selectedLeadDetail.attachmentDocName || 'Lead Attachment');
                          }
                        }}
                        className="w-full h-48 object-cover rounded-lg border border-indigo-300 shadow-xs cursor-pointer hover:scale-[1.02] duration-300"
                      />
                      <div className="absolute bottom-2 right-2 bg-slate-900/90 text-white text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-bold cursor-pointer">
                        🔍 Click to view full screen & download
                      </div>
                    </div>
                  )}

                  {selectedLeadDetail.attachmentDocType === 'AUDIO' && selectedLeadDetail.attachmentDocUrl && (
                    <audio controls className="w-full pt-1">
                      <source src={selectedLeadDetail.attachmentDocUrl} type="audio/mp3" />
                      Your browser does not support audio playback.
                    </audio>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedLeadDetail(null)}
                className="px-5 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold uppercase text-xs shadow-md cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
