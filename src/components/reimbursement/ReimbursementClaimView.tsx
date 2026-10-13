import React, { useState } from 'react';
import { ReimbursementClaim, ReimbursementCategory, UserAccount, WorkAssignment } from '../../types';
import { 
  Receipt, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon, 
  CreditCard, 
  Landmark, 
  FileText, 
  Building2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Eye,
  X
} from 'lucide-react';

interface ReimbursementClaimViewProps {
  claims: ReimbursementClaim[];
  activeUser: UserAccount;
  activeWorks: WorkAssignment[];
  onSubmitClaim: (claim: ReimbursementClaim) => void;
}

export const ReimbursementClaimView: React.FC<ReimbursementClaimViewProps> = ({
  claims,
  activeUser,
  activeWorks,
  onSubmitClaim
}) => {
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [selectedClaimDetails, setSelectedClaimDetails] = useState<ReimbursementClaim | null>(null);

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<ReimbursementCategory>('TRAVEL_CONVEYANCE');
  const [amount, setAmount] = useState<string>('');
  const [claimDate, setClaimDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedWorkId, setSelectedWorkId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [proofImage, setProofImage] = useState<string>(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
  );

  // Filter My Claims
  const myClaims = claims.filter((c) => c.applicantId === activeUser.id);

  // Statistics
  const totalClaimed = myClaims.reduce((acc, c) => acc + c.amount, 0);
  const totalPaid = myClaims.filter((c) => c.status === 'PAID').reduce((acc, c) => acc + c.amount, 0);
  const pendingCount = myClaims.filter((c) => c.status === 'PENDING_ACCOUNTS' || c.status === 'APPROVED_BY_ACCOUNTS' || c.status === 'APPROVED_BY_ADMIN').length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const matchedWork = activeWorks.find((w) => w.id === selectedWorkId);

    const newClaim: ReimbursementClaim = {
      id: `claim_${Date.now()}`,
      claimNumber: `CLM-2026-${Math.floor(100 + Math.random() * 900)}`,
      applicantId: activeUser.id,
      applicantName: activeUser.name,
      applicantRole: activeUser.role,
      applicantDepartment: activeUser.department || 'Operations',
      title: title.trim(),
      category,
      amount: Number(amount),
      claimDate,
      workId: matchedWork?.id,
      workTitle: matchedWork?.workTitle,
      notes: notes.trim(),
      proofDocumentUrl: proofImage,
      status: 'PENDING_ACCOUNTS',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSubmitClaim(newClaim);
    setShowSubmitModal(false);
    // Reset Form
    setTitle('');
    setAmount('');
    setNotes('');
  };

  const getStatusBadge = (status: ReimbursementClaim['status']) => {
    switch (status) {
      case 'PENDING_ACCOUNTS':
        return {
          label: 'Pending Accounts Verification',
          class: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />
        };
      case 'APPROVED_BY_ACCOUNTS':
        return {
          label: 'Accounts Verified • Awaiting Admin Approval',
          class: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
        };
      case 'APPROVED_BY_ADMIN':
        return {
          label: 'Admin Approved • Ready for Payment Clearance',
          class: 'bg-purple-100 text-purple-900 border-purple-300',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
        };
      case 'PAID':
        return {
          label: 'Payment Cleared & Paid',
          class: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        };
      case 'REJECTED':
        return {
          label: 'Claim Rejected',
          class: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />
        };
    }
  };

  const getCategoryLabel = (cat: ReimbursementCategory) => {
    switch (cat) {
      case 'TRAVEL_CONVEYANCE': return 'Travel & Conveyance';
      case 'SITE_MATERIAL': return 'Site Emergency Material';
      case 'CLIENT_MEETING': return 'Client Meeting & Food';
      case 'FOOD_ALLOWANCE': return 'Food & Daily Allowance';
      case 'EQUIPMENT_TOOLS': return 'Equipment & Tools';
      case 'MISCELLANEOUS': return 'Miscellaneous';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <Receipt className="w-3.5 h-3.5" />
            Employee Expense Claims & Reimbursements
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex flex-wrap items-center gap-3">
            <span>My Reimbursements Portal</span>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 font-mono">
              ₹ CLAIMS • TWO-STEP APPROVALS
            </span>
          </h1>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-xl flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Apply New Reimbursement
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Claims Submitted</p>
            <p className="text-2xl font-black text-slate-900 pt-1">₹{totalClaimed.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-slate-500 font-semibold pt-1">{myClaims.length} Claims Filed</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Disbursed / Paid</p>
            <p className="text-2xl font-black text-emerald-600 pt-1">₹{totalPaid.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-emerald-600 font-semibold pt-1">Payment Cleared to Bank</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Under Approval Process</p>
            <p className="text-2xl font-black text-amber-600 pt-1">{pendingCount} Active</p>
            <p className="text-[11px] text-amber-600 font-semibold pt-1">Accounts & Admin Audit</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Claims List Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            My Reimbursement Claims History ({myClaims.length})
          </h2>
          <span className="text-xs text-slate-500 font-bold">Applicant: {activeUser.name}</span>
        </div>

        {myClaims.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No reimbursement claims filed yet.</p>
            <p className="text-xs text-slate-500">Click "Apply New Reimbursement" to submit travel or site expenses.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myClaims.map((claim) => {
              const statusInfo = getStatusBadge(claim.status);
              return (
                <div key={claim.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-extrabold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                        {claim.claimNumber}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900">{claim.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase inline-flex items-center gap-1 ${statusInfo.class}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                      <span>Category: <strong>{getCategoryLabel(claim.category)}</strong></span>
                      <span>Date: <strong>{claim.claimDate}</strong></span>
                      {claim.workTitle && (
                        <span className="text-blue-700 font-semibold">Work: {claim.workTitle}</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1 italic">"{claim.notes}"</p>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase">Amount</p>
                      <p className="text-xl font-black text-slate-900">₹{claim.amount.toLocaleString('en-IN')}</p>
                    </div>

                    <button
                      onClick={() => setSelectedClaimDetails(claim)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Claim Details
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal - Submit New Claim */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                Submit New Expense Reimbursement Claim
              </h3>
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Site Emergency Chemical Purchase / Fuel Allowance"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expense Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ReimbursementCategory)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="TRAVEL_CONVEYANCE">Travel & Conveyance</option>
                    <option value="SITE_MATERIAL">Site Emergency Material</option>
                    <option value="CLIENT_MEETING">Client Meeting & Food</option>
                    <option value="FOOD_ALLOWANCE">Food & Site Allowance</option>
                    <option value="EQUIPMENT_TOOLS">Equipment & Tools</option>
                    <option value="MISCELLANEOUS">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Claim Amount (₹) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. 2500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={claimDate}
                    onChange={(e) => setClaimDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Linked Site Work (Optional)</label>
                  <select
                    value={selectedWorkId}
                    onChange={(e) => setSelectedWorkId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">-- General Expense --</option>
                    {activeWorks.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.workTitle} ({w.clientCompanyName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Reason & Expense Breakdown</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  rows={2}
                  placeholder="Provide context or receipt invoice details..."
                  required
                />
              </div>

              {/* Attach Proof Receipt */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Upload Bill / Receipt Proof Image *</label>
                <div className="flex items-center gap-4 border p-3 rounded-xl bg-slate-50">
                  <div className="relative group overflow-hidden rounded-lg shrink-0">
                    <img
                      src={proofImage}
                      alt="Proof Receipt"
                      onClick={() => {
                        if (window.showGlobalImageViewer) {
                          window.showGlobalImageViewer(proofImage, 'Claim Proof Receipt Preview');
                        }
                      }}
                      className="w-16 h-16 rounded-lg object-cover border cursor-pointer hover:scale-105 duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[8px] text-white font-bold text-center pointer-events-none">
                      Zoom
                    </div>
                  </div>
                  <div className="space-y-1">
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
                      onChange={handleFileUpload}
                      className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">JPG, PNG or Receipt photo up to 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
                >
                  Submit Reimbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Detailed Claim View & Status Workflow */}
      {selectedClaimDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                    {selectedClaimDetails.claimNumber}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {selectedClaimDetails.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 pt-1">
                  Submitted by <strong>{selectedClaimDetails.applicantName}</strong> ({selectedClaimDetails.applicantRole})
                </p>
              </div>
              <button 
                onClick={() => setSelectedClaimDetails(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Approval Progress Timeline */}
            <div className="bg-slate-50 p-4 rounded-xl border space-y-3">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Two-Level Approval & Payment Disburse Status
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {/* Step 1: Accounts Approval */}
                <div className={`p-3 rounded-lg border ${
                  selectedClaimDetails.status === 'APPROVED_BY_ACCOUNTS' || selectedClaimDetails.status === 'APPROVED_BY_ADMIN' || selectedClaimDetails.status === 'PAID'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : selectedClaimDetails.status === 'REJECTED'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  <p className="font-extrabold flex items-center gap-1 text-[11px]">
                    Accounts Audit
                  </p>
                  <p className="text-[10px] font-semibold pt-1">
                    {selectedClaimDetails.accountsApprovedBy 
                      ? `Verified by ${selectedClaimDetails.accountsApprovedBy}` 
                      : 'Pending Level 1 Review'}
                  </p>
                </div>

                {/* Step 2: Admin Approval */}
                <div className={`p-3 rounded-lg border ${
                  selectedClaimDetails.status === 'APPROVED_BY_ADMIN' || selectedClaimDetails.status === 'PAID'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : selectedClaimDetails.status === 'APPROVED_BY_ACCOUNTS'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}>
                  <p className="font-extrabold flex items-center gap-1 text-[11px]">
                    Admin Sanction
                  </p>
                  <p className="text-[10px] font-semibold pt-1">
                    {selectedClaimDetails.adminApprovedBy 
                      ? `Sanctioned by ${selectedClaimDetails.adminApprovedBy}` 
                      : 'Awaiting Admin Approval'}
                  </p>
                </div>

                {/* Step 3: Payment Disburse */}
                <div className={`p-3 rounded-lg border ${
                  selectedClaimDetails.status === 'PAID'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}>
                  <p className="font-extrabold flex items-center gap-1 text-[11px]">
                    Payment Cleared
                  </p>
                  <p className="text-[10px] font-semibold pt-1">
                    {selectedClaimDetails.paymentDate 
                      ? `Disbursed on ${selectedClaimDetails.paymentDate}` 
                      : 'Pending Disburse'}
                  </p>
                </div>
              </div>
            </div>

            {/* Claim Particulars */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border">
              <div>
                <p className="text-slate-400 font-bold uppercase">Claim Amount</p>
                <p className="text-xl font-black text-slate-900">₹{selectedClaimDetails.amount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase">Category</p>
                <p className="text-sm font-bold text-slate-800">{getCategoryLabel(selectedClaimDetails.category)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400 font-bold uppercase">Expense Notes & Purpose</p>
                <p className="text-xs text-slate-800 font-medium pt-1">{selectedClaimDetails.notes}</p>
              </div>
            </div>

            {/* Uploaded Bill Proof */}
            {selectedClaimDetails.proofDocumentUrl && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700 uppercase">Uploaded Bill / Invoice Proof (Click to view full screen)</h5>
                <div className="relative group overflow-hidden rounded-xl">
                  <img
                    src={selectedClaimDetails.proofDocumentUrl}
                    alt="Bill Proof"
                    onClick={() => {
                      if (window.showGlobalImageViewer) {
                        window.showGlobalImageViewer(selectedClaimDetails.proofDocumentUrl || '', `Bill Receipt - ₹${selectedClaimDetails.amount}`);
                      }
                    }}
                    className="w-full h-48 object-cover rounded-xl border cursor-pointer hover:scale-[1.02] duration-300"
                  />
                  <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-bold cursor-pointer flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Click to view full screen & download
                  </div>
                </div>
              </div>
            )}

            {/* Payment Clearance Proof (If Paid) */}
            {selectedClaimDetails.status === 'PAID' && selectedClaimDetails.paymentScreenshotUrl && (
              <div className="space-y-2 border-t pt-4 bg-emerald-50/50 p-4 rounded-xl border-emerald-200">
                <div className="flex justify-between items-center">
                  <h5 className="text-xs font-extrabold text-emerald-900 uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Accounts Disbursed Payment Screenshot Proof
                  </h5>
                  <span className="text-[11px] font-mono font-bold text-emerald-800">
                    Ref: {selectedClaimDetails.paymentRefNo || 'N/A'} ({selectedClaimDetails.paymentMode})
                  </span>
                </div>
                <div className="relative group overflow-hidden rounded-xl mt-1">
                  <img
                    src={selectedClaimDetails.paymentScreenshotUrl}
                    alt="Payment Screenshot"
                    onClick={() => {
                      if (window.showGlobalImageViewer) {
                        window.showGlobalImageViewer(selectedClaimDetails.paymentScreenshotUrl || '', `Clearance Screenshot - ₹${selectedClaimDetails.amount}`);
                      }
                    }}
                    className="w-full h-56 object-cover rounded-xl border border-emerald-300 shadow-md cursor-pointer hover:scale-[1.02] duration-300"
                  />
                  <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-bold cursor-pointer flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Click to view full screen & download
                  </div>
                </div>
              </div>
            )}

            <div className="text-right pt-2 border-t">
              <button
                onClick={() => setSelectedClaimDetails(null)}
                className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
