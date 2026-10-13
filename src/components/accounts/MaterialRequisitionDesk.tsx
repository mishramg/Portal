import React, { useState } from 'react';
import { 
  MaterialRequest, 
  MaterialRequestCategory, 
  MaterialRequestStatus, 
  UserAccount, 
  WorkAssignment 
} from '../../types';
import { 
  Boxes, 
  PlusCircle, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  IndianRupee, 
  MapPin, 
  User, 
  Calendar, 
  ExternalLink, 
  CreditCard, 
  Send, 
  X, 
  FileText, 
  ShieldAlert, 
  Building2,
  Phone,
  Tag
} from 'lucide-react';

interface MaterialRequisitionDeskProps {
  materialRequests: MaterialRequest[];
  activeUser: UserAccount;
  works: WorkAssignment[];
  isSiteSupervisorView?: boolean;
  onCreateRequest: (newReq: MaterialRequest) => void;
  onApproveRequest: (reqId: string, notes?: string) => void;
  onDisburseRequest: (
    reqId: string, 
    paymentMode: 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'COMPANY_CARD', 
    refNo: string, 
    disbursedAmount: number
  ) => void;
  onRejectRequest: (reqId: string, reason: string) => void;
}

export const MaterialRequisitionDesk: React.FC<MaterialRequisitionDeskProps> = ({
  materialRequests,
  activeUser,
  works,
  isSiteSupervisorView = false,
  onCreateRequest,
  onApproveRequest,
  onDisburseRequest,
  onRejectRequest
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Determine if viewing as Site Supervisor
  const isSupervisorScope = isSiteSupervisorView || activeUser.role === 'SITE_SUPERVISOR' || activeUser.role === 'PROJECT_COORDINATOR';

  // Base list of requests: Site Supervisors see only their own requests, Accounts/Admin see all
  const scopedRequests = isSupervisorScope
    ? materialRequests.filter((r) => 
        r.requestedByUserId === activeUser.id || 
        (r.requestedByName && activeUser.name && r.requestedByName.toLowerCase().includes(activeUser.name.toLowerCase().split(' ')[0]))
      )
    : materialRequests;

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showSanctionModal, setShowSanctionModal] = useState<MaterialRequest | null>(null);
  const [showDisburseModal, setShowDisburseModal] = useState<MaterialRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<MaterialRequest | null>(null);

  // New Request Form State
  const [newSiteName, setNewSiteName] = useState<string>('');
  const [newWorkId, setNewWorkId] = useState<string>('');
  const [newCategory, setNewCategory] = useState<MaterialRequestCategory>('RAW_MATERIALS');
  const [newItemName, setNewItemName] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<string>('');
  const [newEstimatedCost, setNewEstimatedCost] = useState<string>('');
  const [newUrgency, setNewUrgency] = useState<'NORMAL' | 'HIGH' | 'EMERGENCY_IMMEDIATE'>('NORMAL');
  const [newRequiredByDate, setNewRequiredByDate] = useState<string>('');
  const [newVendorName, setNewVendorName] = useState<string>('');
  const [newVendorContact, setNewVendorContact] = useState<string>('');
  const [newQuotationDocUrl, setNewQuotationDocUrl] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');

  // Action Modals Inputs
  const [sanctionNote, setSanctionNote] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'BANK_TRANSFER' | 'CASH' | 'COMPANY_CARD'>('UPI');
  const [paymentRefNo, setPaymentRefNo] = useState<string>('');
  const [disbursedAmountInput, setDisbursedAmountInput] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');

  // Metrics Calculations on scopedRequests
  const pendingCount = scopedRequests.filter((r) => r.status === 'PENDING_ACCOUNTS').length;
  const pendingTotalAmount = scopedRequests
    .filter((r) => r.status === 'PENDING_ACCOUNTS')
    .reduce((sum, r) => sum + r.estimatedCost, 0);

  const sanctionedCount = scopedRequests.filter((r) => r.status === 'SANCTIONED').length;
  const sanctionedTotalAmount = scopedRequests
    .filter((r) => r.status === 'SANCTIONED')
    .reduce((sum, r) => sum + r.estimatedCost, 0);

  const emergencyCount = scopedRequests.filter(
    (r) => r.urgency === 'EMERGENCY_IMMEDIATE' && r.status !== 'PAID' && r.status !== 'REJECTED'
  ).length;

  const totalPaidAmount = scopedRequests
    .filter((r) => r.status === 'PAID')
    .reduce((sum, r) => sum + (r.disbursedAmount || r.estimatedCost), 0);

  // Filter Logic
  const filteredRequests = scopedRequests.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
    if (urgencyFilter !== 'ALL' && r.urgency !== urgencyFilter) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = r.requestNumber.toLowerCase().includes(q);
      const matchItem = r.itemName.toLowerCase().includes(q);
      const matchSite = r.siteOrProjectName.toLowerCase().includes(q);
      const matchRequester = r.requestedByName.toLowerCase().includes(q);
      const matchVendor = r.vendorName?.toLowerCase().includes(q);
      return matchNumber || matchItem || matchSite || matchRequester || matchVendor;
    }
    return true;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newSiteName || !newQuantity || !newEstimatedCost) {
      alert('Please fill in all mandatory fields (Item, Site, Quantity, Estimated Cost).');
      return;
    }

    const costVal = parseFloat(newEstimatedCost) || 0;
    const reqNumber = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newReq: MaterialRequest = {
      id: `req_${Date.now()}`,
      requestNumber: reqNumber,
      requestedByUserId: activeUser.id,
      requestedByName: activeUser.name,
      requestedByRole: activeUser.role,
      requestedByDepartment: activeUser.department || 'Operations',
      siteOrProjectName: newSiteName,
      workId: newWorkId || undefined,
      category: newCategory,
      itemName: newItemName,
      quantity: newQuantity,
      estimatedCost: costVal,
      urgency: newUrgency,
      requiredByDate: newRequiredByDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      vendorName: newVendorName || undefined,
      vendorContact: newVendorContact || undefined,
      quotationDocUrl: newQuotationDocUrl || undefined,
      notes: newNotes,
      status: 'PENDING_ACCOUNTS',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onCreateRequest(newReq);
    setShowCreateModal(false);

    // Reset Form
    setNewSiteName('');
    setNewWorkId('');
    setNewCategory('RAW_MATERIALS');
    setNewItemName('');
    setNewQuantity('');
    setNewEstimatedCost('');
    setNewUrgency('NORMAL');
    setNewRequiredByDate('');
    setNewVendorName('');
    setNewVendorContact('');
    setNewQuotationDocUrl('');
    setNewNotes('');
  };

  const handleConfirmSanction = () => {
    if (!showSanctionModal) return;
    onApproveRequest(showSanctionModal.id, sanctionNote);
    setShowSanctionModal(null);
    setSanctionNote('');
  };

  const handleConfirmDisbursement = () => {
    if (!showDisburseModal) return;
    if (!paymentRefNo.trim()) {
      alert('Please enter a valid payment reference / transaction number.');
      return;
    }
    const amt = parseFloat(disbursedAmountInput) || showDisburseModal.estimatedCost;
    onDisburseRequest(showDisburseModal.id, paymentMode, paymentRefNo, amt);
    setShowDisburseModal(null);
    setPaymentRefNo('');
    setDisbursedAmountInput('');
  };

  const handleConfirmReject = () => {
    if (!showRejectModal) return;
    if (!rejectReason.trim()) {
      alert('Please state a reason for rejecting the material requisition.');
      return;
    }
    onRejectRequest(showRejectModal.id, rejectReason);
    setShowRejectModal(null);
    setRejectReason('');
  };

  const getUrgencyBadge = (urgency: MaterialRequest['urgency']) => {
    switch (urgency) {
      case 'EMERGENCY_IMMEDIATE':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/15 text-rose-600 border border-rose-300 flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Immediate Emergency
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-700 border border-amber-300 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-600" /> High Urgency
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
            Normal Priority
          </span>
        );
    }
  };

  const getStatusBadge = (status: MaterialRequestStatus) => {
    switch (status) {
      case 'PENDING_ACCOUNTS':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3 h-3 text-amber-600 animate-spin" /> Pending Accounts
          </span>
        );
      case 'SANCTIONED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-blue-600" /> Sanctioned (Awaiting Payout)
          </span>
        );
      case 'PAID':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Purchased & Disbursed
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1.5 shadow-2xs">
            <XCircle className="w-3 h-3 text-rose-600" /> Rejected
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: MaterialRequestCategory) => {
    switch (cat) {
      case 'RAW_MATERIALS': return 'Raw Materials & Timber';
      case 'SAFETY_GEAR': return 'Safety & Personal Gear';
      case 'POWER_TOOLS': return 'Power Tools & Machinery';
      case 'HEAVY_EQUIPMENT': return 'Heavy Equipment Rental';
      case 'ELECTRICAL_PLUMBING': return 'Electrical & Plumbing';
      case 'MISC_HARDWARE': return 'Hardware & Fixtures';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Context Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex flex-wrap items-center gap-2">
                <span>{isSupervisorScope ? 'Site Supervisor Material & Requirement Requests' : 'Accounts Material & Requirement Desk'}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  PROCUREMENT REQUISITION • PO
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-amber-500/20 uppercase tracking-wider"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Raise Material Requisition</span>
          </button>
        </div>
      </div>

      {/* Scope Indicator for Site Supervisor */}
      {isSupervisorScope && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-sm">
              <User className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <p className="font-bold text-amber-950 text-xs">
                Site Supervisor Mode: Showing requests for <span className="underline decoration-amber-400 decoration-2 font-black">{activeUser.name}</span>
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Displaying {scopedRequests.length} requisition{scopedRequests.length === 1 ? '' : 's'} filed by you. All requests are instantly routed to the Accounts Desk for sanctioning and disbursement.
              </p>
            </div>
          </div>
          <span className="bg-amber-200/80 text-amber-950 font-extrabold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border border-amber-300 shrink-0">
            Routed to Accounts Desk
          </span>
        </div>
      )}

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">Pending Verification</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{pendingCount} <span className="text-xs font-normal text-slate-500">requests</span></h3>
            <p className="text-xs font-extrabold text-amber-800 font-mono mt-1">₹{pendingTotalAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">Sanctioned Budgets</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{sanctionedCount} <span className="text-xs font-normal text-slate-500">approved</span></h3>
            <p className="text-xs font-extrabold text-blue-700 font-mono mt-1">₹{sanctionedTotalAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700">Emergency Site Needs</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{emergencyCount} <span className="text-xs font-normal text-slate-500">urgent</span></h3>
            <p className="text-xs text-rose-600 font-semibold mt-1">Immediate site action</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">Total Material Cleared</p>
            <h3 className="text-2xl font-black text-emerald-700 font-mono mt-0.5">₹{totalPaidAmount.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Disbursed to vendors</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Requests' },
              { id: 'PENDING_ACCOUNTS', label: `Pending (${pendingCount})` },
              { id: 'SANCTIONED', label: `Sanctioned (${sanctionedCount})` },
              { id: 'PAID', label: 'Disbursed / Paid' },
              { id: 'REJECTED', label: 'Rejected' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Requisition #, Item, Site, Vendor..."
              className="w-full bg-slate-50 text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>

        {/* Secondary Category & Urgency Selectors */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold outline-none focus:border-blue-500"
          >
            <option value="ALL">All Material Categories</option>
            <option value="RAW_MATERIALS">Raw Materials & Timber</option>
            <option value="SAFETY_GEAR">Safety & Personal Gear</option>
            <option value="POWER_TOOLS">Power Tools & Machinery</option>
            <option value="HEAVY_EQUIPMENT">Heavy Equipment</option>
            <option value="ELECTRICAL_PLUMBING">Electrical & Plumbing</option>
            <option value="MISC_HARDWARE">Hardware & Fixtures</option>
          </select>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold outline-none focus:border-blue-500"
          >
            <option value="ALL">All Urgencies</option>
            <option value="EMERGENCY_IMMEDIATE">Immediate Emergency</option>
            <option value="HIGH">High Urgency</option>
            <option value="NORMAL">Normal Priority</option>
          </select>

          {(categoryFilter !== 'ALL' || urgencyFilter !== 'ALL' || searchQuery !== '' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setCategoryFilter('ALL');
                setUrgencyFilter('ALL');
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold uppercase tracking-wider underline cursor-pointer ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Material Requisitions Card List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
            <Boxes className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No material requisitions match your filter.</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search query, status filters, or click the button above to submit a new site material requirement.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              {/* Card Top Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {req.requestNumber}
                  </span>
                  {getStatusBadge(req.status)}
                  {getUrgencyBadge(req.urgency)}
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    {getCategoryLabel(req.category)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Estimated Budget</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    ₹{req.estimatedCost.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Main Material Item & Description Body */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-2">
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {req.itemName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1">
                      <Boxes className="w-3.5 h-3.5 text-amber-500" />
                      <span>Qty: <strong className="text-slate-900">{req.quantity}</strong></span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Site: <strong className="text-slate-900">{req.siteOrProjectName}</strong></span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      <span>Need By: <strong className="text-slate-900">{req.requiredByDate}</strong></span>
                    </div>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100 italic">
                      "{req.notes}"
                    </p>
                  )}

                  {req.vendorName && (
                    <div className="flex items-center gap-3 text-xs bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 text-amber-900">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Building2 className="w-3.5 h-3.5 text-amber-600" /> Vendor: {req.vendorName}
                      </div>
                      {req.vendorContact && (
                        <div className="flex items-center gap-1 font-mono text-[11px] text-amber-800">
                          <Phone className="w-3 h-3 text-amber-600" /> {req.vendorContact}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Requester & Quotation Info Column */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Requested By</span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                        {req.requestedByName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{req.requestedByName}</div>
                        <div className="text-[10px] font-semibold text-slate-500">{req.requestedByRole} • {req.requestedByDepartment}</div>
                      </div>
                    </div>
                  </div>

                  {req.quotationDocUrl ? (
                    <a
                      href={req.quotationDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-blue-600 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Vendor Quotation / Proof</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No quotation doc attached</span>
                  )}
                </div>
              </div>

              {/* Status Audit Logs / Disbursed Banner */}
              {req.status === 'SANCTIONED' && req.accountsApprovedBy && (
                <div className="bg-blue-50/70 rounded-xl p-3 border border-blue-100 text-xs text-blue-900 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Sanctioned by <strong>{req.accountsApprovedBy}</strong> on {req.accountsApprovalDate}</span>
                  </div>
                  {req.accountsNotes && <span className="italic text-blue-700">Note: "{req.accountsNotes}"</span>}
                </div>
              )}

              {req.status === 'PAID' && (
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div>Disbursed <strong>₹{(req.disbursedAmount || req.estimatedCost).toLocaleString('en-IN')}</strong> via <strong>{req.paymentMode}</strong> ({req.paymentRefNo})</div>
                      <div className="text-[10px] text-emerald-700">Cleared by {req.disbursedByName} on {req.paymentDate}</div>
                    </div>
                  </div>
                </div>
              )}

              {req.status === 'REJECTED' && req.rejectionReason && (
                <div className="bg-rose-50 rounded-xl p-3 border border-rose-200 text-xs text-rose-900 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <strong>Requisition Rejected:</strong> {req.rejectionReason}
                  </div>
                </div>
              )}

              {/* Accounts Action Toolbar */}
              {(activeUser.role === 'ACCOUNTS' || activeUser.role === 'ADMIN' || activeUser.role === 'SUB_ADMIN') && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                  {req.status === 'PENDING_ACCOUNTS' && (
                    <>
                      <button
                        onClick={() => setShowRejectModal(req)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center gap-1.5 cursor-pointer transition-colors uppercase tracking-wider"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>

                      <button
                        onClick={() => setShowSanctionModal(req)}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-blue-500/20 cursor-pointer transition-all uppercase tracking-wider"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sanction Material Budget
                      </button>
                    </>
                  )}

                  {req.status === 'SANCTIONED' && (
                    <button
                      onClick={() => {
                        setShowDisburseModal(req);
                        setDisbursedAmountInput(req.estimatedCost.toString());
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-md hover:shadow-emerald-500/20 cursor-pointer transition-all uppercase tracking-wider"
                    >
                      <CreditCard className="w-4 h-4" /> Release Payment / Disburse Purchase
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* MODAL: Raise New Material Requisition */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                  <Boxes className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Raise Site Material & Requirement Request</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Site / Project Name *</label>
                  <input
                    type="text"
                    required
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                    placeholder="e.g. Oberoi Realty Site - Goregaon"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Link Work Order (Optional)</label>
                  <select
                    value={newWorkId}
                    onChange={(e) => {
                      setNewWorkId(e.target.value);
                      const w = works.find((x) => x.id === e.target.value);
                      if (w && !newSiteName) setNewSiteName(w.brandName || w.workTitle);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="">Select Work Order...</option>
                    {works.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.workTitle} ({w.clientCompanyName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Material Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MaterialRequestCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="RAW_MATERIALS">Raw Materials & Timber</option>
                    <option value="SAFETY_GEAR">Safety & Personal Gear</option>
                    <option value="POWER_TOOLS">Power Tools & Machinery</option>
                    <option value="HEAVY_EQUIPMENT">Heavy Equipment Rental</option>
                    <option value="ELECTRICAL_PLUMBING">Electrical & Plumbing</option>
                    <option value="MISC_HARDWARE">Hardware & Fixtures</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Urgency Level *</label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="NORMAL">Normal Priority (Within 3-5 days)</option>
                    <option value="HIGH">High Urgency (Within 24-48 hrs)</option>
                    <option value="EMERGENCY_IMMEDIATE">Immediate Emergency (Work Halted)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Item Name & Detailed Specifications *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. 18mm CenturyPly Marine Plywood & Fevicol SH 50kg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Quantity & Units *</label>
                  <input
                    type="text"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    placeholder="e.g. 35 Sheets / 2 Drums"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Estimated Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newEstimatedCost}
                    onChange={(e) => setNewEstimatedCost(e.target.value)}
                    placeholder="e.g. 68500"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Required By Date *</label>
                  <input
                    type="date"
                    required
                    value={newRequiredByDate}
                    onChange={(e) => setNewRequiredByDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Vendor Name (Optional)</label>
                  <input
                    type="text"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    placeholder="e.g. Mahavir Plywood Mart"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Vendor Phone / Contact</label>
                  <input
                    type="text"
                    value={newVendorContact}
                    onChange={(e) => setNewVendorContact(e.target.value)}
                    placeholder="e.g. +91 98201 11223"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-medium font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Quotation Document / Image URL (Optional)</label>
                <input
                  type="text"
                  value={newQuotationDocUrl}
                  onChange={(e) => setNewQuotationDocUrl(e.target.value)}
                  placeholder="Paste URL e.g. https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Site Requirement Justification & Notes</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Describe why this material is required for execution..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-blue-500 font-medium resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Requisition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Sanction Material Budget (Accounts) */}
      {showSanctionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Sanction Material Budget
              </h3>
              <button onClick={() => setShowSanctionModal(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
              <div className="font-bold text-slate-900">{showSanctionModal.itemName}</div>
              <div className="text-slate-500">Site: {showSanctionModal.siteOrProjectName}</div>
              <div className="font-extrabold text-blue-600 font-mono text-sm">
                ₹{showSanctionModal.estimatedCost.toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <label className="font-extrabold text-slate-700 text-xs block mb-1">Accounts Approval Notes (Optional)</label>
              <textarea
                rows={3}
                value={sanctionNote}
                onChange={(e) => setSanctionNote(e.target.value)}
                placeholder="e.g. Verified vendor quotation against market rate. Sanctioned for purchase."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-medium resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSanctionModal(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSanction}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
              >
                Confirm Sanction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Disburse / Release Payment */}
      {showDisburseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Disburse Material Purchase Funds
              </h3>
              <button onClick={() => setShowDisburseModal(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 space-y-1 text-xs">
              <div className="font-bold text-emerald-950">{showDisburseModal.itemName}</div>
              <div className="text-emerald-800">Requested Cost: ₹{showDisburseModal.estimatedCost.toLocaleString('en-IN')}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Disbursed Amount (₹) *</label>
                <input
                  type="number"
                  value={disbursedAmountInput}
                  onChange={(e) => setDisbursedAmountInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Payment Mode *</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="UPI">UPI Instant (GPay/PhonePe/Paytm)</option>
                  <option value="BANK_TRANSFER">Bank NEFT / RTGS Transfer</option>
                  <option value="COMPANY_CARD">Company Corporate Card</option>
                  <option value="CASH">Site Cash Disbursement</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Transaction Ref / UTR / Cheque # *</label>
                <input
                  type="text"
                  required
                  value={paymentRefNo}
                  onChange={(e) => setPaymentRefNo(e.target.value)}
                  placeholder="e.g. UPI/3819201982/HDFC"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDisburseModal(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisbursement}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
              >
                Release Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Reject Requisition */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                Reject Material Requisition
              </h3>
              <button onClick={() => setShowRejectModal(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="font-extrabold text-slate-700 text-xs block mb-1">Rejection Reason *</label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="State why this material request is rejected or needs revision..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-rose-500 font-medium resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer uppercase tracking-wider"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
