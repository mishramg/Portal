import React, { useState } from 'react';
import { ProcurementRequirement, UserAccount, RequirementType, RequirementStatus } from '../../types';
import { FileUploadBox } from './FileUploadBox';
import { 
  Plus, CheckCircle2, XCircle, Clock, AlertTriangle, Building2, 
  HardHat, Factory, UserCheck, ShieldCheck, FileCheck, ArrowRight, 
  Search, Filter, MapPin, Calendar, Layers, Send, Sparkles,
  Paperclip, Eye, Download, CheckSquare, Square, FileSpreadsheet
} from 'lucide-react';

interface RequirementsSectionProps {
  requirements: ProcurementRequirement[];
  currentUser: UserAccount;
  users: UserAccount[];
  onSaveRequirements: (reqs: ProcurementRequirement[]) => void;
  onSendToAdminApproval?: (req: ProcurementRequirement) => void;
}

export const RequirementsSection: React.FC<RequirementsSectionProps> = ({
  requirements,
  currentUser,
  users,
  onSaveRequirements,
  onSendToAdminApproval
}) => {
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'ON_SITE' | 'FACTORY'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [pmConfirmModalReq, setPmConfirmModalReq] = useState<ProcurementRequirement | null>(null);
  const [pmDecisionNotes, setPmDecisionNotes] = useState('');
  const [viewAttachmentUrl, setViewAttachmentUrl] = useState<{ title: string; url: string } | null>(null);

  // Multi-select for bulk PM actions
  const [selectedReqIds, setSelectedReqIds] = useState<string[]>([]);

  // New Requirement Form State
  const [newReqType, setNewReqType] = useState<RequirementType>('ON_SITE');
  const [newProjectName, setNewProjectName] = useState('');
  const [newFactoryUnit, setNewFactoryUnit] = useState('Central Plant Unit 1 - CNC & Laser Workshop, Mira Road');
  const [newDepartment, setNewDepartment] = useState('Production');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('ACP & Sheet Metal');
  const [newSpecification, setNewSpecification] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newUnit, setNewUnit] = useState('Sheets');
  const [newEstimatedRate, setNewEstimatedRate] = useState('');
  const [newUrgency, setNewUrgency] = useState<'NORMAL' | 'HIGH' | 'EMERGENCY_IMMEDIATE'>('NORMAL');
  const [newRequiredByDate, setNewRequiredByDate] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');
  const [newSiteSupervisorId, setNewSiteSupervisorId] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newAttachment, setNewAttachment] = useState<{ name: string; url: string; size?: string } | null>(null);

  // Eligible stakeholders
  const siteSupervisors = users.filter(u => u.role === 'SITE_SUPERVISOR');
  const coordinators = users.filter(u => u.role === 'PROJECT_COORDINATOR');
  const projectManagers = users.filter(u => u.role === 'PROJECT_MANAGER' || u.role === 'ADMIN');
  const factoryHeads = users.filter(u => u.role === 'FACTORY_STAFF');
  const facilityManagers = users.filter(u => u.role === 'FACILITY_MANAGER');
  const designerHeads = users.filter(u => u.role === 'SENIOR_DESIGNER' || u.role === 'DESIGNER_HEAD');

  // Common Presets for 1-Click Fast Requisition Filling
  const MATERIAL_PRESETS = [
    {
      name: 'ACP Sheet 4mm PVDF Grey Metallic',
      category: 'ACP & Sheet Metal',
      unit: 'Sheets',
      rate: 2200,
      spec: 'Grade 3003, PVDF 30-micron outdoor coating with MTC test certificate, size 8x4 ft.',
      sampleDoc: { title: 'ACP_Facade_Drawing_Rev2.pdf', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80' }
    },
    {
      name: 'Cast Acrylic Sheet 3mm Opal White 040',
      category: 'Acrylic & Vinyl',
      unit: 'Sheets',
      rate: 3400,
      spec: '100% Virgin MMA Cast Acrylic, 40% light transmission, laser-cut grade, size 8x4 ft.',
      sampleDoc: { title: 'Letter_Cutting_Nesting.pdf', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80' }
    },
    {
      name: 'Samsung 1.2W LED Module (6500K Cool White)',
      category: 'LED & Electricals',
      unit: 'Pieces',
      rate: 28,
      spec: 'IP68 injection molded, 160° optic lens, 120 lm/W luminous efficiency with 5-year warranty.',
      sampleDoc: { title: 'Electrical_Load_Chart.pdf', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80' }
    },
    {
      name: 'Meanwell 12V 350W IP67 Waterproof Power Supply',
      category: 'LED & Electricals',
      unit: 'Pieces',
      rate: 1850,
      spec: 'HLG series aluminum casing, short circuit & over-voltage protection, BIS approved.',
      sampleDoc: { title: 'Power_Supply_Datasheet.pdf', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80' }
    },
    {
      name: 'GI Box Tube 50x25mm (1.6mm Heavy Duty)',
      category: 'Structural Steel & MS',
      unit: 'Lengths',
      rate: 850,
      spec: 'Hot-dip galvanized tube, IS:1239 grade, 6 meter standard length for facade substructure.',
      sampleDoc: { title: 'Structural_Framing_CAD.pdf', url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80' }
    },
    {
      name: '3M IJ35C Gloss Cast Vinyl with Cast Overlaminate',
      category: 'Acrylic & Vinyl',
      unit: 'Sq.Ft',
      rate: 65,
      spec: 'Comply adhesive technology, 5-year UV outdoor rated graphic film with matching 8518 overlaminate.',
      sampleDoc: { title: '3M_Vinyl_Spec_Sheet.pdf', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80' }
    }
  ];

  const handleApplyPreset = (preset: typeof MATERIAL_PRESETS[0]) => {
    setNewItemName(preset.name);
    setNewItemCategory(preset.category);
    setNewUnit(preset.unit);
    setNewEstimatedRate(String(preset.rate));
    setNewSpecification(preset.spec);
    if (preset.sampleDoc && !newAttachment) {
      setNewAttachment({ name: preset.sampleDoc.title, url: preset.sampleDoc.url, size: '1.4 MB' });
    }
  };

  // Filtered items
  const filteredReqs = requirements.filter(req => {
    if (selectedTab === 'ON_SITE' && req.type !== 'ON_SITE') return false;
    if (selectedTab === 'FACTORY' && req.type !== 'FACTORY') return false;
    if (statusFilter === 'PENDING' && req.pmConfirmationStatus !== 'PENDING') return false;
    if (statusFilter === 'CONFIRMED' && req.pmConfirmationStatus !== 'CONFIRMED') return false;
    if (statusFilter === 'REJECTED' && req.pmConfirmationStatus !== 'REJECTED') return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        req.reqNumber.toLowerCase().includes(q) ||
        req.itemName.toLowerCase().includes(q) ||
        req.siteOrProjectName.toLowerCase().includes(q) ||
        req.requestedByName.toLowerCase().includes(q) ||
        req.itemCategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const canConfirmAsPM = currentUser.role === 'PROJECT_MANAGER' || currentUser.role === 'ADMIN' || currentUser.role === 'SUB_ADMIN';

  const handleCreateRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newQuantity) {
      alert('Please fill in Item Name and Quantity');
      return;
    }

    const assignedSup = siteSupervisors.find(s => s.id === newSiteSupervisorId);

    const newReq: ProcurementRequirement = {
      id: `req_${Date.now()}`,
      reqNumber: `REQ-${newReqType === 'ON_SITE' ? 'SITE' : 'FAC'}-${new Date().getFullYear()}-${String(requirements.length + 1).padStart(3, '0')}`,
      type: newReqType,
      siteOrProjectName: newReqType === 'ON_SITE' ? (newProjectName || 'On-Site Project Location') : `${newFactoryUnit} (${newDepartment})`,
      factoryUnit: newReqType === 'FACTORY' ? newFactoryUnit : undefined,
      department: newReqType === 'FACTORY' ? newDepartment : undefined,
      itemName: newItemName,
      itemCategory: newItemCategory,
      specification: newSpecification,
      quantity: newQuantity,
      unit: newUnit,
      estimatedRate: newEstimatedRate ? Number(newEstimatedRate) : undefined,
      estimatedTotal: newEstimatedRate && newQuantity && !isNaN(Number(newQuantity)) ? Number(newEstimatedRate) * Number(newQuantity) : undefined,
      urgency: newUrgency,
      requiredByDate: newRequiredByDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      locationAddress: newLocationAddress || (newReqType === 'ON_SITE' ? 'Site Location Mumbai' : 'Kamlawati Central Plant, Mira Road East'),
      siteSupervisorId: assignedSup?.id,
      siteSupervisorName: assignedSup?.name,
      siteSupervisorPhone: '+91 98765 10293',
      requestedById: currentUser.id,
      requestedByName: currentUser.name,
      requestedByRole: currentUser.role,
      notes: newNotes,
      attachmentUrl: newAttachment?.url,
      pmConfirmationStatus: 'PENDING',
      status: 'PENDING_PM_CONFIRMATION',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveRequirements([newReq, ...requirements]);
    setShowNewModal(false);

    // Reset Form
    setNewItemName('');
    setNewSpecification('');
    setNewQuantity('');
    setNewEstimatedRate('');
    setNewNotes('');
    setNewProjectName('');
    setNewAttachment(null);
  };

  const handlePMDecision = (confirmed: boolean) => {
    if (!pmConfirmModalReq) return;

    const updated = requirements.map(r => {
      if (r.id === pmConfirmModalReq.id) {
        return {
          ...r,
          pmConfirmationStatus: confirmed ? ('CONFIRMED' as const) : ('REJECTED' as const),
          pmConfirmedById: currentUser.id,
          pmConfirmedByName: currentUser.name,
          pmConfirmedDate: new Date().toISOString(),
          pmNotes: pmDecisionNotes || (confirmed ? 'Confirmed and validated for purchase requisition' : 'Rejected - please revise quantity or specifications'),
          status: confirmed ? ('PM_CONFIRMED' as const) : ('PM_REJECTED' as const),
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    onSaveRequirements(updated);
    setPmConfirmModalReq(null);
    setPmDecisionNotes('');
  };

  const handleBulkPMDecision = (confirmed: boolean) => {
    if (selectedReqIds.length === 0) return;

    const updated = requirements.map(r => {
      if (selectedReqIds.includes(r.id) && r.pmConfirmationStatus === 'PENDING') {
        return {
          ...r,
          pmConfirmationStatus: confirmed ? ('CONFIRMED' as const) : ('REJECTED' as const),
          pmConfirmedById: currentUser.id,
          pmConfirmedByName: currentUser.name,
          pmConfirmedDate: new Date().toISOString(),
          pmNotes: confirmed ? 'Batch verified by Project Manager' : 'Batch rejected by Project Manager',
          status: confirmed ? ('PM_CONFIRMED' as const) : ('PM_REJECTED' as const),
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    onSaveRequirements(updated);
    setSelectedReqIds([]);
  };

  const handleToggleSelectReq = (id: string) => {
    if (selectedReqIds.includes(id)) {
      setSelectedReqIds(selectedReqIds.filter(item => item !== id));
    } else {
      setSelectedReqIds([...selectedReqIds, id]);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Req No', 'Type', 'Target / Site', 'Item Name', 'Category', 'Quantity', 'Unit', 'Urgency', 'Required Date', 'Requested By', 'PM Status'];
    const rows = filteredReqs.map(r => [
      r.reqNumber,
      r.type,
      `"${r.siteOrProjectName.replace(/"/g, '""')}"`,
      `"${r.itemName.replace(/"/g, '""')}"`,
      r.itemCategory,
      r.quantity,
      r.unit,
      r.urgency,
      r.requiredByDate,
      `"${r.requestedByName}"`,
      r.pmConfirmationStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `procurement_requirements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner explaining the PM Confirmation Gate */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-5 rounded-r-2xl bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                Requirements Approval Gate
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  Gated Until Project Manager Confirms
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
                All procurement requests raised across <strong>On-Site</strong> (Coordinator, Site Supervisor, Project Manager) and <strong>Factory</strong> (Factory Head, Designer Head, Facility Manager) remain locked until the <strong>Project Manager verifies</strong> site readiness and technical specs. Attach CAD/BOQ drawings for faster validation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Export filtered requisitions as CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
            </button>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-yellow-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Raise Requirement
            </button>
          </div>
        </div>
      </div>

      {/* Tabs, Filter Bar & Bulk Actions */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          
          {/* Requirement Type Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSelectedTab('ALL')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Requisitions ({requirements.length})
            </button>
            <button
              onClick={() => setSelectedTab('ON_SITE')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTab === 'ON_SITE'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              On-Site ({requirements.filter(r => r.type === 'ON_SITE').length})
            </button>
            <button
              onClick={() => setSelectedTab('FACTORY')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedTab === 'FACTORY'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Factory className="w-3.5 h-3.5" />
              Factory ({requirements.filter(r => r.type === 'FACTORY').length})
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search item, site, requester..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48 sm:w-56 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending PM ({requirements.filter(r => r.pmConfirmationStatus === 'PENDING').length})</option>
              <option value="CONFIRMED">PM Confirmed ({requirements.filter(r => r.pmConfirmationStatus === 'CONFIRMED').length})</option>
              <option value="REJECTED">PM Rejected ({requirements.filter(r => r.pmConfirmationStatus === 'REJECTED').length})</option>
            </select>
          </div>
        </div>

        {/* Bulk PM Decision Bar (when PM selects multiple) */}
        {canConfirmAsPM && selectedReqIds.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded-xl flex items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-2 text-amber-950 font-bold">
              <CheckSquare className="w-4 h-4 text-amber-700" />
              <span>{selectedReqIds.length} Requisition(s) Selected for Project Manager Review</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedReqIds([])}
                className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-lg text-xs cursor-pointer"
              >
                Clear Selection
              </button>
              <button
                onClick={() => handleBulkPMDecision(false)}
                className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject Selected
              </button>
              <button
                onClick={() => handleBulkPMDecision(true)}
                className="px-4 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Batch Confirm Selected ({selectedReqIds.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Requirements List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReqs.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-2">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No procurement requirements found matching your filter</p>
            <p className="text-xs text-slate-400">Use the "Raise Requirement" button to create a new requisition with specifications and CAD drawings</p>
          </div>
        ) : (
          filteredReqs.map(req => {
            const isSelected = selectedReqIds.includes(req.id);
            return (
              <div 
                key={req.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between relative ${
                  isSelected ? 'ring-2 ring-amber-500 bg-amber-50/20' : ''
                } ${
                  req.pmConfirmationStatus === 'CONFIRMED'
                    ? 'border-emerald-200 hover:border-emerald-300'
                    : req.pmConfirmationStatus === 'REJECTED'
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-amber-200 bg-amber-50/10'
                }`}
              >
                <div>
                  {/* Header Badge Row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {canConfirmAsPM && req.pmConfirmationStatus === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleToggleSelectReq(req.id)}
                          className="text-slate-400 hover:text-amber-600 cursor-pointer"
                        >
                          {isSelected ? <CheckSquare className="w-4 h-4 text-amber-600" /> : <Square className="w-4 h-4" />}
                        </button>
                      )}
                      <span className={`px-2.5 py-1 rounded-md text-[10.5px] font-black flex items-center gap-1 ${
                        req.type === 'ON_SITE'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                      }`}>
                        {req.type === 'ON_SITE' ? <HardHat className="w-3 h-3" /> : <Factory className="w-3 h-3" />}
                        {req.type === 'ON_SITE' ? 'ON-SITE REQ' : 'FACTORY REQ'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">{req.reqNumber}</span>
                    </div>

                    {/* PM Confirmation Status Pill */}
                    <div>
                      {req.pmConfirmationStatus === 'CONFIRMED' ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[11px] font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PM Confirmed
                        </span>
                      ) : req.pmConfirmationStatus === 'REJECTED' ? (
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-[11px] font-extrabold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" /> PM Rejected
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[11px] font-extrabold flex items-center gap-1 animate-pulse">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Awaiting PM Confirm
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Content */}
                  <h4 className="font-extrabold text-slate-900 text-base leading-snug">{req.itemName}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{req.specification}</p>

                  {/* Key Attributes Box */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Target / Location:</span>
                      <p className="font-bold text-slate-800 truncate">{req.siteOrProjectName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Required Quantity:</span>
                      <p className="font-bold text-slate-800">{req.quantity} {req.unit}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Requested By:</span>
                      <p className="font-medium text-slate-700 truncate">{req.requestedByName}</p>
                      <span className="text-[10px] text-slate-500 font-semibold">{req.requestedByRole}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Required By Date:</span>
                      <p className="font-bold text-slate-800">{req.requiredByDate}</p>
                    </div>
                  </div>

                  {/* Attachment Thumbnail & Preview Trigger if available */}
                  {req.attachmentUrl && (
                    <div className="my-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-bold text-slate-800 truncate text-[11px]">Site Reference Drawing / Specification Attached</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewAttachmentUrl({ title: `${req.reqNumber} Reference Drawing`, url: req.attachmentUrl! })}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                      >
                        <Eye className="w-3 h-3 text-slate-600" /> Preview
                      </button>
                    </div>
                  )}

                  {/* Project Manager Remarks if confirmed */}
                  {req.pmNotes && (
                    <div className="bg-emerald-50/80 border border-emerald-200 p-2.5 rounded-lg text-xs text-emerald-900 my-2">
                      <strong>PM Verification Note ({req.pmConfirmedByName}):</strong> {req.pmNotes}
                    </div>
                  )}
                </div>

                {/* Action Buttons Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* PM Confirmation Trigger */}
                    {req.pmConfirmationStatus === 'PENDING' && canConfirmAsPM && (
                      <button
                        onClick={() => setPmConfirmModalReq(req)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> PM Review & Confirm
                      </button>
                    )}

                    {/* Send to Purchase / Create RFQ trigger once confirmed */}
                    {req.pmConfirmationStatus === 'CONFIRMED' && (
                      <button
                        onClick={() => onSendToAdminApproval && onSendToAdminApproval(req)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-yellow-400 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <span>Forward to RFQ Shortlist</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal: View Uploaded Document */}
      {viewAttachmentUrl && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-amber-500" />
                {viewAttachmentUrl.title}
              </h4>
              <button
                onClick={() => setViewAttachmentUrl(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center p-2">
              <img
                src={viewAttachmentUrl.url}
                alt="Document Preview"
                className="max-h-[60vh] object-contain rounded-lg shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="pt-3 text-right">
              <button
                onClick={() => setViewAttachmentUrl(null)}
                className="px-4 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: PM Confirmation Gate */}
      {pmConfirmModalReq && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Project Manager Verification</h3>
                  <p className="text-xs text-slate-500">Confirm requirement specifications prior to purchase approval</p>
                </div>
              </div>
              <button
                onClick={() => setPmConfirmModalReq(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 text-sm">{pmConfirmModalReq.itemName}</p>
                <p className="text-slate-600 mt-1">{pmConfirmModalReq.specification}</p>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
                  <span>Target: <strong>{pmConfirmModalReq.siteOrProjectName}</strong></span>
                  <span>Qty: <strong>{pmConfirmModalReq.quantity} {pmConfirmModalReq.unit}</strong></span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  PM Verification Notes & Approval Remarks:
                </label>
                <textarea
                  value={pmDecisionNotes}
                  onChange={(e) => setPmDecisionNotes(e.target.value)}
                  placeholder="e.g. Verified site readiness, drawing rev 3 approved. Cleared for RFQ quote shortlist."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => handlePMDecision(false)}
                className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" /> Reject Requirement
              </button>
              <button
                onClick={() => handlePMDecision(true)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm & Unlock for Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Raise New Requirement */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Raise Procurement Requirement</h3>
                <p className="text-xs text-slate-500">Initiate on-site or factory material requisition with drawing upload</p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Quick 1-Click Material Presets Bar */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 my-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10.5px] font-extrabold uppercase text-slate-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Fast Pre-fill Material Templates:
                </span>
                <span className="text-[10px] text-slate-400">Click to fill specs instantly</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MATERIAL_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2 py-1 bg-white hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    + {p.name.slice(0, 22)}...
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateRequirement} className="space-y-4 my-2 text-xs">
              {/* Type Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Requisition Category *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewReqType('ON_SITE')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      newReqType === 'ON_SITE'
                        ? 'border-amber-500 bg-amber-50/60 text-slate-900 font-bold ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <HardHat className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="text-xs font-extrabold">On-Site Requirement</div>
                      <div className="text-[10px] text-slate-500 font-normal">Coordinator / Supervisor / PM</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewReqType('FACTORY')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      newReqType === 'FACTORY'
                        ? 'border-indigo-600 bg-indigo-50/60 text-slate-900 font-bold ring-2 ring-indigo-600/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Factory className="w-5 h-5 text-indigo-600" />
                    <div>
                      <div className="text-xs font-extrabold">Factory Requirement</div>
                      <div className="text-[10px] text-slate-500 font-normal">Factory Head / Designer / Facility</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dynamic inputs based on Type */}
              {newReqType === 'ON_SITE' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Site / Project Name *</label>
                    <input
                      type="text"
                      required
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g. Croma Bandra Store Signage"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Site Supervisor Incharge</label>
                    <select
                      value={newSiteSupervisorId}
                      onChange={(e) => setNewSiteSupervisorId(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="">Select Supervisor...</option>
                      {siteSupervisors.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Factory Workshop Unit</label>
                    <select
                      value={newFactoryUnit}
                      onChange={(e) => setNewFactoryUnit(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Unit 1 - CNC, Laser & Acrylic Bay, Mira Road">Unit 1 - CNC, Laser & Acrylic Bay</option>
                      <option value="Unit 2 - Structural Steel & MS Fabrication Shed">Unit 2 - Structural Steel & MS Shed</option>
                      <option value="Unit 3 - Paint Booth & Powder Coating Line">Unit 3 - Paint Booth & Powder Coating</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department</label>
                    <select
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Production">Production & Assembly</option>
                      <option value="CNC & Fabrication">CNC Cutting & Grooving</option>
                      <option value="Electrical & LED">Electrical Wiring & LED</option>
                      <option value="Facility Maintenance">Facility & Machine Maintenance</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Item Details */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Material / Item Description *</label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. ACP Sheet 4mm PVDF Grey Metallic"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="ACP & Sheet Metal">ACP & Sheet Metal</option>
                    <option value="Acrylic & Vinyl">Acrylic & Vinyl</option>
                    <option value="LED & Electricals">LED & Electricals</option>
                    <option value="Hardware & Fasteners">Hardware & Fasteners</option>
                    <option value="Structural Steel & MS">Structural Steel & MS</option>
                    <option value="Paints & Coatings">Paints & Coatings</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Technical Specifications & Quality Requirements</label>
                <textarea
                  value={newSpecification}
                  onChange={(e) => setNewSpecification(e.target.value)}
                  placeholder="e.g. Grade 3003, PVDF 30-micron outdoor coating with MTC test certificate..."
                  rows={2}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Quantity, Unit & Urgency */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="text"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    placeholder="e.g. 24"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="Sheets">Sheets (8x4 ft)</option>
                    <option value="Lengths">Lengths (6 Mtr)</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Pieces">Pieces / Nos</option>
                    <option value="Meters">Meters</option>
                    <option value="Sq.Ft">Sq.Ft</option>
                    <option value="Kgs">Kgs</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Urgency</label>
                  <select
                    value={newUrgency}
                    onChange={(e: any) => setNewUrgency(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="NORMAL">Normal (3-5 Days)</option>
                    <option value="HIGH">High Urgency (24-48h)</option>
                    <option value="EMERGENCY_IMMEDIATE">Emergency (Immediate)</option>
                  </select>
                </div>
              </div>

              {/* Upload Site Drawing / Reference Document Button */}
              <FileUploadBox
                label="Attach Site Drawing / CAD Nesting / BOQ Reference"
                helperText="Upload PDF, DWG export, or photo for PM & Vendor quote verification"
                fileUrl={newAttachment?.url}
                fileName={newAttachment?.name}
                onFileChange={(file) => setNewAttachment(file)}
                sampleOptions={[
                  { title: 'Site_Nesting_Drawing.pdf', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80' },
                  { title: 'BOQ_Breakup_Sheet.pdf', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80' }
                ]}
              />

              {/* Delivery Address & Required Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Destination Address</label>
                  <input
                    type="text"
                    value={newLocationAddress}
                    onChange={(e) => setNewLocationAddress(e.target.value)}
                    placeholder="e.g. Bandra West Linking Rd site"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Required By Date</label>
                  <input
                    type="date"
                    value={newRequiredByDate}
                    onChange={(e) => setNewRequiredByDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-yellow-400 font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Submit for PM Confirmation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
