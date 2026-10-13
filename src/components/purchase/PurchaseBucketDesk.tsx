import React, { useState } from 'react';
import { MaterialRequest, UserAccount, WorkAssignment } from '../../types';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Send, 
  IndianRupee, 
  Building2, 
  Package, 
  Truck, 
  X, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface PurchaseBucketDeskProps {
  materialRequests: MaterialRequest[];
  activeUser: UserAccount;
  works: WorkAssignment[];
  onReplyToProjectGroup: (
    reqId: string, 
    replyText: string, 
    newStatus: 'SANCTIONED' | 'PAID' | 'REJECTED' | 'DISPATCHED'
  ) => void;
  onNavigateToGroup?: (workId: string) => void;
}

export const PurchaseBucketDesk: React.FC<PurchaseBucketDeskProps> = ({
  materialRequests,
  activeUser,
  works,
  onReplyToProjectGroup,
  onNavigateToGroup
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');

  // Reply Modal State
  const [selectedReqForReply, setSelectedReqForReply] = useState<MaterialRequest | null>(null);
  const [replyMessageText, setReplyMessageText] = useState('');
  const [replyStatusChoice, setReplyStatusChoice] = useState<'SANCTIONED' | 'PAID' | 'REJECTED' | 'DISPATCHED'>('SANCTIONED');

  const filteredRequests = materialRequests.filter((req) => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (urgencyFilter !== 'ALL' && req.urgency !== urgencyFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      req.itemName.toLowerCase().includes(q) ||
      req.siteOrProjectName.toLowerCase().includes(q) ||
      req.requestedByName.toLowerCase().includes(q) ||
      (req.requestNumber && req.requestNumber.toLowerCase().includes(q))
    );
  });

  // KPI Calculations
  const totalBucketRequests = materialRequests.length;
  const pendingRequestsCount = materialRequests.filter((r) => r.status === 'PENDING_ACCOUNTS').length;
  const emergencyRequestsCount = materialRequests.filter((r) => r.urgency === 'EMERGENCY_IMMEDIATE' && r.status === 'PENDING_ACCOUNTS').length;
  const totalApprovedVolume = materialRequests
    .filter((r) => r.status === 'SANCTIONED' || r.status === 'PAID')
    .reduce((sum, r) => sum + r.estimatedCost, 0);

  const handleOpenReplyModal = (req: MaterialRequest) => {
    setSelectedReqForReply(req);
    setReplyStatusChoice('SANCTIONED');
    setReplyMessageText(
      `✅ Accounts verified ₹${req.estimatedCost.toLocaleString('en-IN')}. PO issued to authorized vendor. Material dispatch scheduled for tomorrow morning.`
    );
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForReply || !replyMessageText.trim()) return;

    onReplyToProjectGroup(
      selectedReqForReply.id,
      replyMessageText.trim(),
      replyStatusChoice
    );

    setSelectedReqForReply(null);
    setReplyMessageText('');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner - Blue & White Professional UI */}
      <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Accounts & Purchase Bucket
            </span>
            <span className="text-xs text-blue-700 font-bold">Connected Project Chat Sync</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            Central Purchase Requisition Bucket
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Whenever project teams or site supervisors request material requirements in their project groups, requests land here. Accounts team reviews the budget and replies with live updates directly back to that project's chat group.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl text-xs text-blue-900 font-bold">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span>Syncs directly to Project WhatsApp Groups</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Bucket Reqs</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalBucketRequests} Requests</div>
          <p className="text-[11px] text-slate-400 font-medium">Logged from project groups</p>
        </div>

        <div className="bg-white border border-amber-200 p-4 rounded-xl shadow-xs space-y-1 bg-amber-50/20">
          <div className="flex justify-between items-center text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Awaiting Accounts Reply</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800">{pendingRequestsCount} Pending</div>
          <p className="text-[11px] text-amber-700/80 font-medium">Needs sanction or vendor update</p>
        </div>

        <div className="bg-white border border-rose-200 p-4 rounded-xl shadow-xs space-y-1 bg-rose-50/20">
          <div className="flex justify-between items-center text-rose-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Emergency On-Site</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-800">{emergencyRequestsCount} Urgent</div>
          <p className="text-[11px] text-rose-700/80 font-medium">Critical work stoppage priority</p>
        </div>

        <div className="bg-white border border-emerald-200 p-4 rounded-xl shadow-xs space-y-1 bg-emerald-50/20">
          <div className="flex justify-between items-center text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sanctioned Value</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">₹{totalApprovedVolume.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-emerald-600/80 font-medium">Approved & dispatched material cost</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search material, project, requester..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-bold">
          {(['ALL', 'PENDING_ACCOUNTS', 'SANCTIONED', 'PAID', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Bucket' : st === 'PENDING_ACCOUNTS' ? 'Needs Reply' : st === 'SANCTIONED' ? 'Sanctioned' : st === 'PAID' ? 'Paid & Fulfilled' : 'Rejected'}
            </button>
          ))}
        </div>
      </div>

      {/* Bucket Requests Cards / Table */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">No material purchase requests found in bucket.</p>
            <p className="text-[11px] text-slate-400">Requests posted by project teams or supervisors in project groups will automatically appear here.</p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPending = req.status === 'PENDING_ACCOUNTS';
            const isSanctioned = req.status === 'SANCTIONED';
            const isPaid = req.status === 'PAID';
            const isRejected = req.status === 'REJECTED';

            return (
              <div
                key={req.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {req.requestNumber || req.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{req.siteOrProjectName}</span>
                      {req.urgency === 'EMERGENCY_IMMEDIATE' && (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-200">
                          🔥 EMERGENCY
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black text-slate-900">{req.itemName}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-base font-black text-slate-900">
                        ₹{req.estimatedCost.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">Estimated Budget</div>
                    </div>

                    <div>
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Needs Accounts Reply
                        </span>
                      ) : isSanctioned ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Sanctioned / PO Issued
                        </span>
                      ) : isPaid ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paid & Dispatched
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Quantity Needed:</span>
                    <div className="font-bold text-slate-800 text-xs">{req.quantity}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Requested By:</span>
                    <div className="font-bold text-slate-800 text-xs">{req.requestedByName} ({req.requestedByRole.replace('_', ' ')})</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Required On Site By:</span>
                    <div className="font-bold text-slate-800 text-xs">{req.requiredByDate}</div>
                  </div>
                  {req.notes && (
                    <div className="col-span-1 sm:col-span-3 pt-1 border-t border-slate-200 text-slate-600 text-[11px]">
                      <span className="font-bold text-slate-700">Requisition Notes:</span> {req.notes}
                    </div>
                  )}
                </div>

                {/* Accounts Past Reply if present */}
                {req.accountsNotes && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
                    <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Last Accounts Update Sent to Project Group:</span>
                    </div>
                    <p className="text-emerald-800 text-[11px] font-medium">{req.accountsNotes}</p>
                    {req.accountsApprovalDate && (
                      <span className="text-[10px] text-emerald-600 font-bold block">Sent on: {req.accountsApprovalDate}</span>
                    )}
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    {onNavigateToGroup && req.workId && (
                      <button
                        onClick={() => onNavigateToGroup(req.workId!)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> View Project WhatsApp Group
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReplyModal(req)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply with Update to Project Group</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Modal */}
      {selectedReqForReply && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-600" /> Reply to Project Group
                </h3>
                <span className="text-[11px] text-slate-400">
                  Update will post as a live message in "{selectedReqForReply.siteOrProjectName}"
                </span>
              </div>
              <button onClick={() => setSelectedReqForReply(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-extrabold text-slate-900">{selectedReqForReply.itemName}</div>
                <div className="text-[11px] text-slate-500">
                  Quantity: <span className="font-bold text-slate-800">{selectedReqForReply.quantity}</span> • Budget: <span className="font-bold text-slate-800">₹{selectedReqForReply.estimatedCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Requested by: <span className="font-bold text-slate-800">{selectedReqForReply.requestedByName}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Set Requisition Status *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyStatusChoice('SANCTIONED')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      replyStatusChoice === 'SANCTIONED'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Sanction / Approved
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyStatusChoice('PAID')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      replyStatusChoice === 'PAID'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Paid / Dispatched
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyStatusChoice('REJECTED')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      replyStatusChoice === 'REJECTED'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Accounts Reply Message for Project Team *</label>
                <textarea
                  rows={4}
                  value={replyMessageText}
                  onChange={(e) => setReplyMessageText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  placeholder="e.g. PO #KDPL-PO-1049 approved & issued to JSW Steel Depot. Material dispatched via Blue Dart Express, tracking BD-901824. Delivery ETA on-site: Tomorrow 11:30 AM."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedReqForReply(null)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Update to Project Group</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
