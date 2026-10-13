import React, { useState } from 'react';
import { ReimbursementClaim, UserAccount, UserRole } from '../../types';
import { 
  Landmark, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Upload, 
  CreditCard, 
  DollarSign, 
  Search, 
  FileText, 
  AlertCircle, 
  Image as ImageIcon,
  Send,
  Eye
} from 'lucide-react';

interface AccountsReimbursementDeskProps {
  claims: ReimbursementClaim[];
  activeUser: UserAccount;
  onAccountsApprove: (claimId: string, notes?: string) => void;
  onAdminApprove: (claimId: string, notes?: string) => void;
  onRejectClaim: (claimId: string, reason: string) => void;
  onDisbursePayment: (
    claimId: string,
    paymentMode: 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'COMPANY_CARD',
    refNo: string,
    screenshotUrl: string
  ) => void;
}

export const AccountsReimbursementDesk: React.FC<AccountsReimbursementDeskProps> = ({
  claims,
  activeUser,
  onAccountsApprove,
  onAdminApprove,
  onRejectClaim,
  onDisbursePayment
}) => {
  const [activeTab, setActiveTab] = useState<'PENDING_ACCOUNTS' | 'APPROVED_BY_ACCOUNTS' | 'APPROVED_BY_ADMIN' | 'PAID' | 'ALL'>('PENDING_ACCOUNTS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [reviewingClaim, setReviewingClaim] = useState<ReimbursementClaim | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [approvalNotes, setApprovalNotes] = useState<string>('');

  // Payment Disburse Modal
  const [payingClaim, setPayingClaim] = useState<ReimbursementClaim | null>(null);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'BANK_TRANSFER' | 'CASH' | 'COMPANY_CARD'>('UPI');
  const [paymentRefNo, setPaymentRefNo] = useState<string>(`UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}/HDFC`);
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string>(
    'https://images.unsplash.com/photo-1556742049-0a670f4a458d?auto=format&fit=crop&w=800&q=80'
  );

  // Filtered Claims
  const filteredClaims = claims.filter((c) => {
    const matchesSearch = 
      c.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'ALL') return matchesSearch;
    return c.status === activeTab && matchesSearch;
  });

  // Metrics
  const pendingAccountsCount = claims.filter((c) => c.status === 'PENDING_ACCOUNTS').length;
  const pendingAdminCount = claims.filter((c) => c.status === 'APPROVED_BY_ACCOUNTS').length;
  const readyForPaymentCount = claims.filter((c) => c.status === 'APPROVED_BY_ADMIN').length;
  const totalPaidSum = claims.filter((c) => c.status === 'PAID').reduce((acc, c) => acc + c.amount, 0);

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExecPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingClaim) return;

    onDisbursePayment(payingClaim.id, paymentMode, paymentRefNo, paymentScreenshotUrl);
    setPayingClaim(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider">
            <Landmark className="w-3.5 h-3.5" />
            Accounts & Finance Audit Desk
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex flex-wrap items-center gap-3">
            <span>Employee Reimbursements Management</span>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 font-mono">
              2-LEVEL AUDIT • CLEARANCE
            </span>
          </h1>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('PENDING_ACCOUNTS')}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'PENDING_ACCOUNTS' ? 'bg-amber-500 text-white border-amber-600 shadow-md' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
          }`}
        >
          <p className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'PENDING_ACCOUNTS' ? 'text-amber-100' : 'text-slate-400'}`}>
            Level 1: Accounts Audit
          </p>
          <p className="text-2xl font-black pt-1">{pendingAccountsCount} Pending</p>
          <p className={`text-[11px] font-semibold pt-1 ${activeTab === 'PENDING_ACCOUNTS' ? 'text-amber-100' : 'text-amber-600'}`}>Requires Accounts Review</p>
        </button>

        <button
          onClick={() => setActiveTab('APPROVED_BY_ACCOUNTS')}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'APPROVED_BY_ACCOUNTS' ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
          }`}
        >
          <p className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'APPROVED_BY_ACCOUNTS' ? 'text-blue-100' : 'text-slate-400'}`}>
            Level 2: Admin Sanction
          </p>
          <p className="text-2xl font-black pt-1">{pendingAdminCount} Awaiting</p>
          <p className={`text-[11px] font-semibold pt-1 ${activeTab === 'APPROVED_BY_ACCOUNTS' ? 'text-blue-100' : 'text-blue-600'}`}>Accounts Verified • Needs Admin</p>
        </button>

        <button
          onClick={() => setActiveTab('APPROVED_BY_ADMIN')}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'APPROVED_BY_ADMIN' ? 'bg-purple-600 text-white border-purple-700 shadow-md' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
          }`}
        >
          <p className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'APPROVED_BY_ADMIN' ? 'text-purple-100' : 'text-slate-400'}`}>
            Ready For Payment
          </p>
          <p className="text-2xl font-black pt-1">{readyForPaymentCount} Sanctioned</p>
          <p className={`text-[11px] font-semibold pt-1 ${activeTab === 'APPROVED_BY_ADMIN' ? 'text-purple-100' : 'text-purple-600'}`}>Disburse & Upload Screenshot</p>
        </button>

        <button
          onClick={() => setActiveTab('PAID')}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'PAID' ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
          }`}
        >
          <p className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'PAID' ? 'text-emerald-100' : 'text-slate-400'}`}>
            Total Disbursed
          </p>
          <p className="text-2xl font-black pt-1">₹{totalPaidSum.toLocaleString('en-IN')}</p>
          <p className={`text-[11px] font-semibold pt-1 ${activeTab === 'PAID' ? 'text-emerald-100' : 'text-emerald-600'}`}>Payment Cleared History</p>
        </button>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('PENDING_ACCOUNTS')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer ${
              activeTab === 'PENDING_ACCOUNTS' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Level 1: Accounts Review ({pendingAccountsCount})
          </button>
          <button
            onClick={() => setActiveTab('APPROVED_BY_ACCOUNTS')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer ${
              activeTab === 'APPROVED_BY_ACCOUNTS' ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Level 2: Admin Approval ({pendingAdminCount})
          </button>
          <button
            onClick={() => setActiveTab('APPROVED_BY_ADMIN')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer ${
              activeTab === 'APPROVED_BY_ADMIN' ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pay & Upload SS ({readyForPaymentCount})
          </button>
          <button
            onClick={() => setActiveTab('PAID')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer ${
              activeTab === 'PAID' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Completed & Paid
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer ${
              activeTab === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Claims ({claims.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search claim, employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Claims Roster Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredClaims.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Landmark className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No reimbursement claims found in this stage.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredClaims.map((claim) => (
              <div key={claim.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* Claim Meta */}
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {claim.claimNumber}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">{claim.title}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                    <span>Employee: <strong className="text-slate-900">{claim.applicantName}</strong> ({claim.applicantRole})</span>
                    <span>Dept: <strong>{claim.applicantDepartment}</strong></span>
                    <span>Date: <strong>{claim.claimDate}</strong></span>
                  </div>

                  <p className="text-xs text-slate-500 italic">"{claim.notes}"</p>

                  {/* Level Notes */}
                  {claim.accountsApprovedBy && (
                    <div className="text-[11px] text-blue-800 bg-blue-50/80 px-2.5 py-1 rounded border border-blue-200 inline-block font-semibold">
                      Accounts Audit: Verified by {claim.accountsApprovedBy}
                    </div>
                  )}
                  {claim.adminApprovedBy && (
                    <div className="text-[11px] text-purple-800 bg-purple-50/80 px-2.5 py-1 rounded border border-purple-200 inline-block font-semibold ml-2">
                      Admin Sanction: Approved by {claim.adminApprovedBy}
                    </div>
                  )}
                </div>

                {/* Claim Amount & Action Buttons */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">Claim Amount</p>
                    <p className="text-xl font-black text-slate-900">₹{claim.amount.toLocaleString('en-IN')}</p>
                  </div>

                  {/* Contextual Action Buttons depending on Stage */}
                  <div className="flex items-center gap-2">
                    {/* Review Button */}
                    <button
                      onClick={() => {
                        setReviewingClaim(claim);
                        setApprovalNotes('');
                        setRejectionReason('');
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      View Proof
                    </button>

                    {/* Stage 1: Accounts Action */}
                    {claim.status === 'PENDING_ACCOUNTS' && (
                      <button
                        onClick={() => {
                          setReviewingClaim(claim);
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                      >
                        Level 1 Audit
                      </button>
                    )}

                    {/* Stage 2: Admin Sanction Action (Admin/Sub-Admin only gets verify option; Accounts team sees progress) */}
                    {claim.status === 'APPROVED_BY_ACCOUNTS' && (
                      activeUser.role === 'ADMIN' || activeUser.role === 'SUB_ADMIN' ? (
                        <button
                          onClick={() => {
                            setReviewingClaim(claim);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Admin Verify Sanction
                        </button>
                      ) : (
                        <div className="px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          <span>Pending Admin Sanction</span>
                        </div>
                      )
                    )}

                    {/* Stage 3: Payment Disburse Action (Verified by Admin -> Moves to next step for Accounts) */}
                    {claim.status === 'APPROVED_BY_ADMIN' && (
                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-flex text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified & Sanctioned
                        </span>
                        <button
                          onClick={() => {
                            setPayingClaim(claim);
                          }}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Disburse & Upload SS
                        </button>
                      </div>
                    )}

                    {claim.status === 'REJECTED' && (
                      <span className="px-3 py-1.5 bg-rose-50 text-rose-800 rounded-xl text-xs font-bold border border-rose-200 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Report Rejected
                      </span>
                    )}

                    {claim.status === 'PAID' && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Paid
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - Review & Approve Claim (Level 1 & Level 2) */}
      {reviewingClaim && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                  {reviewingClaim.claimNumber}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 pt-1">
                  Reimbursement Audit Review
                </h3>
              </div>
              <button 
                onClick={() => setReviewingClaim(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border">
              <div>
                <p className="text-slate-400 font-bold uppercase">Applicant</p>
                <p className="font-extrabold text-slate-800">{reviewingClaim.applicantName}</p>
                <p className="text-[10px] text-slate-500">{reviewingClaim.applicantDepartment} ({reviewingClaim.applicantRole})</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase">Amount</p>
                <p className="text-lg font-black text-slate-900">₹{reviewingClaim.amount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Bill Proof Attachment */}
            {reviewingClaim.proofDocumentUrl && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700 uppercase">Bill / Invoice Attachment (Click to view full screen)</p>
                <div className="relative group overflow-hidden rounded-xl">
                  <img
                    src={reviewingClaim.proofDocumentUrl}
                    alt="Bill Proof"
                    onClick={() => {
                      if (window.showGlobalImageViewer) {
                        window.showGlobalImageViewer(reviewingClaim.proofDocumentUrl || '', `Claim Bill Attachment - ₹${reviewingClaim.amount}`);
                      }
                    }}
                    className="w-full h-44 object-cover rounded-xl border cursor-pointer hover:scale-[1.02] duration-300"
                  />
                  <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity font-semibold cursor-pointer">
                    View Fullscreen
                  </div>
                </div>
              </div>
            )}

            {/* Level 1 Accounts Approval Form */}
            {reviewingClaim.status === 'PENDING_ACCOUNTS' && (
              <div className="space-y-3 border-t pt-3">
                <p className="text-xs font-bold text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  Level 1 Accounts Review: Verify GST/Receipts & send to Admin for final approval.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Accounts Audit Notes</label>
                  <input
                    type="text"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="e.g. GST invoice matched with bank entries."
                    className="w-full p-2 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      onAccountsApprove(reviewingClaim.id, approvalNotes);
                      setReviewingClaim(null);
                    }}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-xl text-xs shadow"
                  >
                    Approve (Pass to Admin)
                  </button>
                  <button
                    onClick={() => {
                      if (!rejectionReason) {
                        alert('Please enter rejection reason below.');
                        return;
                      }
                      onRejectClaim(reviewingClaim.id, rejectionReason);
                      setReviewingClaim(null);
                    }}
                    className="px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl text-xs"
                  >
                    Reject Claim
                  </button>
                </div>
              </div>
            )}

            {/* Level 2 Admin Sanction Form (Only shown to Admin/Sub-Admin) */}
            {reviewingClaim.status === 'APPROVED_BY_ACCOUNTS' && (
              activeUser.role === 'ADMIN' || activeUser.role === 'SUB_ADMIN' ? (
                <div className="space-y-3 border-t pt-3">
                  <p className="text-xs font-bold text-blue-900 bg-blue-50 p-2.5 rounded-lg border border-blue-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    Level 2 Admin Sanction: Verify & sanction claim before Accounts team disburses payment.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Admin Sanction Remarks</label>
                    <input
                      type="text"
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      placeholder="e.g. Sanctioned for immediate payout."
                      className="w-full p-2 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Rejection Reason (If rejecting)</label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter clear reason if rejecting claim..."
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        onAdminApprove(reviewingClaim.id, approvalNotes);
                        setReviewingClaim(null);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs shadow cursor-pointer"
                    >
                      Sanction Payment (Confirm)
                    </button>
                    <button
                      onClick={() => {
                        if (!rejectionReason) {
                          alert('Please enter rejection reason above.');
                          return;
                        }
                        onRejectClaim(reviewingClaim.id, rejectionReason);
                        setReviewingClaim(null);
                      }}
                      className="px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Reject Claim
                    </button>
                  </div>
                </div>
              ) : (
                /* Accounts Team Progress View for Pending Admin Sanction */
                <div className="space-y-3 border-t pt-3">
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">
                    <div className="flex items-center gap-2 font-extrabold text-amber-900">
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span>Progress Status: Level 1 Verified • Pending Admin Sanction</span>
                    </div>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      Level 1 Accounts audit is complete. The Admin verify & sanction option is restricted to Admin users. Once Admin confirms the sanction, this claim will move to the next step for payment disbursement.
                    </p>
                    {reviewingClaim.accountsApprovedBy && (
                      <p className="text-[10px] font-bold text-amber-900 pt-1">
                        ✓ Verified by Accounts Audit: {reviewingClaim.accountsApprovedBy}
                      </p>
                    )}
                  </div>
                </div>
              )
            )}

            {/* Approved by Admin Progress View */}
            {reviewingClaim.status === 'APPROVED_BY_ADMIN' && (
              <div className="space-y-3 border-t pt-3">
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1.5">
                  <div className="flex items-center gap-2 font-extrabold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Report Verified & Sanctioned by Admin</span>
                  </div>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    Admin has confirmed sanction for this reimbursement claim. It has moved to the next step: Disburse Payment & Upload Receipt Screenshot.
                  </p>
                  {reviewingClaim.adminApprovedBy && (
                    <p className="text-[10px] font-bold text-emerald-900">
                      Sanctioned by Admin: {reviewingClaim.adminApprovedBy} {reviewingClaim.adminNotes ? `("${reviewingClaim.adminNotes}")` : ''}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Rejected Progress View */}
            {reviewingClaim.status === 'REJECTED' && (
              <div className="space-y-3 border-t pt-3">
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 text-xs text-rose-900 space-y-1.5">
                  <div className="flex items-center gap-2 font-extrabold text-rose-900">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Report Rejected</span>
                  </div>
                  <p className="text-rose-800 text-[11px] leading-relaxed">
                    This reimbursement claim was rejected and will not proceed to payment disbursement.
                  </p>
                  {reviewingClaim.rejectionReason && (
                    <p className="text-[11px] font-bold text-rose-900">
                      Reason: "{reviewingClaim.rejectionReason}"
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal - Disburse Payment & Upload Payment Screenshot (Accounts) */}
      {payingClaim && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
                  {payingClaim.claimNumber}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 pt-1">
                  Disburse Reimbursement Payment & Upload Screenshot
                </h3>
              </div>
              <button 
                onClick={() => setPayingClaim(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
              <p className="font-extrabold">Payee: {payingClaim.applicantName} ({payingClaim.applicantRole})</p>
              <p className="font-black text-base">Sanctioned Amount: ₹{payingClaim.amount.toLocaleString('en-IN')}</p>
            </div>

            <form onSubmit={handleExecPayment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode *</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="UPI">UPI Transfer (PhonePe/GooglePay)</option>
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="CASH">Cash Disburse</option>
                    <option value="COMPANY_CARD">Company Card</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transaction Ref / UTR No *</label>
                  <input
                    type="text"
                    value={paymentRefNo}
                    onChange={(e) => setPaymentRefNo(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="UTR / Ref No."
                    required
                  />
                </div>
              </div>

              {/* Upload Payment Screenshot */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  Upload Payment Clearance Screenshot / Bank Advice *
                </label>
                <div className="flex items-center gap-4 border p-3 rounded-xl bg-slate-50">
                  <div className="relative group overflow-hidden rounded-lg shrink-0">
                    <img
                      src={paymentScreenshotUrl}
                      alt="Payment Screenshot"
                      onClick={() => {
                        if (window.showGlobalImageViewer) {
                          window.showGlobalImageViewer(paymentScreenshotUrl, 'Disbursement Screenshot Preview');
                        }
                      }}
                      className="w-20 h-20 rounded-lg object-cover border shadow-sm cursor-pointer hover:scale-105 duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] text-white font-bold text-center pointer-events-none">
                      Zoom
                    </div>
                  </div>
                  <div className="space-y-1">
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx"
                      onChange={handleScreenshotUpload}
                      className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">Upload transaction receipt image or screenshot.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setPayingClaim(null)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Confirm Payment & Send SS to Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
