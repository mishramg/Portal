import React, { useState } from 'react';
import { BillingInvoice, UserAccount, WorkAssignment } from '../../types';
import { 
  Receipt, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Download, 
  Printer, 
  Building2, 
  Calendar, 
  CreditCard, 
  AlertCircle,
  ExternalLink,
  Tag,
  X,
  Sparkles
} from 'lucide-react';

interface BillingDeskProps {
  invoices: BillingInvoice[];
  activeUser: UserAccount;
  works: WorkAssignment[];
  onUpdateInvoice: (invoice: BillingInvoice) => void;
  onAddInvoice?: (newInvoice: BillingInvoice) => void;
}

export const BillingDesk: React.FC<BillingDeskProps> = ({
  invoices,
  activeUser,
  works,
  onUpdateInvoice,
  onAddInvoice
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'PARTIAL'>('ALL');
  
  // Selected Invoice for Detailed Modal / Print Preview
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);

  // New Invoice Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkId, setNewWorkId] = useState(() => works[0]?.id || '');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('Phase 2: Fabrication Completion & Material Dispatch');
  const [newTaxableAmount, setNewTaxableAmount] = useState<number>(250000);
  const [newGstRate, setNewGstRate] = useState<number>(18);
  const [newDueDate, setNewDueDate] = useState(() => new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]);

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'ALL' && inv.paymentStatus !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.projectName.toLowerCase().includes(q) ||
      inv.clientCompanyName.toLowerCase().includes(q) ||
      inv.clientGst.toLowerCase().includes(q)
    );
  });

  // KPI Calculations
  const totalBilledVolume = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = invoices
    .filter((inv) => inv.paymentStatus === 'PAID')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalReceivables = invoices
    .filter((inv) => inv.paymentStatus !== 'PAID')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const paidCount = invoices.filter((inv) => inv.paymentStatus === 'PAID').length;
  const unpaidCount = invoices.filter((inv) => inv.paymentStatus !== 'PAID').length;

  const handleMarkPaymentStatus = (inv: BillingInvoice, newStatus: 'PAID' | 'UNPAID') => {
    const updated: BillingInvoice = {
      ...inv,
      paymentStatus: newStatus,
      paymentReceivedDate: newStatus === 'PAID' ? new Date().toISOString().split('T')[0] : undefined
    };
    onUpdateInvoice(updated);
    if (selectedInvoice && selectedInvoice.id === inv.id) {
      setSelectedInvoice(updated);
    }
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const work = works.find((w) => w.id === newWorkId) || works[0];
    const taxable = Number(newTaxableAmount) || 0;
    const gstRate = Number(newGstRate) || 18;
    const gstAmt = Math.round((taxable * gstRate) / 100);
    const total = taxable + gstAmt;

    const newInv: BillingInvoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `KDPL-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      workId: work ? work.id : `work_${Date.now()}`,
      projectName: work ? work.workTitle : 'Client Retail Project',
      clientCompanyName: work ? work.clientCompanyName : 'Corporate Client',
      clientGst: work?.clientGst || '07AAACH1092Q1ZV',
      clientAddress: work?.clientAddress || 'Corporate Office Complex, Mumbai',
      milestoneTitle: newMilestoneTitle.trim(),
      taxableAmount: taxable,
      gstRate: gstRate,
      gstAmount: gstAmt,
      totalAmount: total,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: newDueDate,
      paymentStatus: 'UNPAID',
      bankDetails: {
        bankName: 'HDFC Bank Ltd',
        accountNo: '50200084918234',
        ifscCode: 'HDFC0001092'
      }
    };

    if (onAddInvoice) {
      onAddInvoice(newInv);
    } else {
      onUpdateInvoice(newInv);
    }

    setShowCreateModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Banner - Blue & White Professional UI */}
      <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              Finance & Commercial Operations
            </span>
            <span className="text-xs text-blue-700 font-bold">GST Compliant Tax Invoicing</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" />
            Billing Desk & Milestone Invoicing
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Generate and track milestone invoices across Advance, Fabrication, Material Delivery, and Handover phases with automated 18% GST calculation and bank ledger sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Generate Milestone Invoice
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Invoiced</span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹{totalBilledVolume.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-slate-400 font-medium">{invoices.length} Invoices generated</p>
        </div>

        <div className="bg-white border border-emerald-200 p-4 rounded-xl shadow-xs space-y-1 bg-emerald-50/20">
          <div className="flex justify-between items-center text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Remittances Received</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">₹{totalCollected.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-emerald-600/80 font-medium">{paidCount} Milestones paid in full</p>
        </div>

        <div className="bg-white border border-amber-200 p-4 rounded-xl shadow-xs space-y-1 bg-amber-50/20">
          <div className="flex justify-between items-center text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Receivables</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800">₹{totalReceivables.toLocaleString('en-IN')}</div>
          <p className="text-[11px] text-amber-700/80 font-medium">{unpaidCount} Invoices awaiting payment</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">GST Liability Tracked</span>
            <IndianRupee className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{invoices.reduce((sum, inv) => sum + inv.gstAmount, 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">18% GST (CGST + SGST)</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search invoice number, client, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-bold">
          {(['ALL', 'UNPAID', 'PAID', 'PARTIAL'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'All Invoices' : st === 'UNPAID' ? 'Pending Payment' : st === 'PAID' ? 'Settled (Paid)' : 'Partial'}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Project & Client Name</th>
                <th className="py-3 px-4">Milestone Stage</th>
                <th className="py-3 px-4 text-right">Taxable (₹)</th>
                <th className="py-3 px-4 text-right">GST 18% (₹)</th>
                <th className="py-3 px-4 text-right font-black">Total Amount</th>
                <th className="py-3 px-4 text-center">Due Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No billing invoice records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.paymentStatus === 'PAID';

                  return (
                    <tr key={inv.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{inv.projectName}</div>
                        <div className="text-[11px] text-slate-500">{inv.clientCompanyName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {inv.milestoneTitle}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        ₹{inv.taxableAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        ₹{inv.gstAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                        ₹{inv.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500">
                        {inv.dueDate}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" /> UNPAID
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="bg-white hover:bg-slate-100 text-blue-700 border border-slate-300 font-bold text-[11px] px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1"
                            title="View official GST invoice"
                          >
                            <FileText className="w-3.5 h-3.5" /> View
                          </button>
                          {isPaid ? (
                            <button
                              onClick={() => handleMarkPaymentStatus(inv, 'UNPAID')}
                              className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                            >
                              Mark Unpaid
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkPaymentStatus(inv, 'PAID')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-xs flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
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

      {/* Invoice Detail / Print Preview Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-xs max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedInvoice.invoiceNumber}</h3>
                  <span className="text-[10px] text-slate-500 font-bold">Tax Invoice • Kamlawati Design & Projects LLP</span>
                </div>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Invoice Sheet */}
            <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/50">
              {/* Company & Client Addresses */}
              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ISSUED BY:</div>
                  <div className="font-extrabold text-slate-900">Kamlawati Design & Projects LLP</div>
                  <div className="text-slate-600 text-[11px]">Gala No. 4, Industrial Area, Kanjurmarg West, Mumbai - 400078</div>
                  <div className="font-mono text-[10px] text-blue-700 font-bold mt-1">GSTIN: 27AABCK8901L1Z8</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BILLED TO (CLIENT):</div>
                  <div className="font-extrabold text-slate-900">{selectedInvoice.clientCompanyName}</div>
                  <div className="text-slate-600 text-[11px]">{selectedInvoice.clientAddress}</div>
                  <div className="font-mono text-[10px] text-blue-700 font-bold mt-1">GSTIN: {selectedInvoice.clientGst}</div>
                </div>
              </div>

              {/* Milestone Details */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PROJECT & MILESTONE STAGE:</div>
                <div className="font-extrabold text-slate-900 text-sm">{selectedInvoice.projectName}</div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-blue-900 font-semibold text-xs">
                  {selectedInvoice.milestoneTitle}
                </div>
              </div>

              {/* Amount Breakdown Table */}
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-right">Taxable Amount</th>
                    <th className="py-2 px-3 text-right">GST Rate</th>
                    <th className="py-2 px-3 text-right">GST Amount</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-2.5 px-3">{selectedInvoice.milestoneTitle}</td>
                    <td className="py-2.5 px-3 text-right">₹{selectedInvoice.taxableAmount.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right">{selectedInvoice.gstRate}%</td>
                    <td className="py-2.5 px-3 text-right">₹{selectedInvoice.gstAmount.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 font-black text-sm text-slate-900 bg-slate-100/60">
                    <td colSpan={4} className="py-2.5 px-3 text-right uppercase">Net Grand Total Payable:</td>
                    <td className="py-2.5 px-3 text-right text-blue-700">₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Bank Details */}
              <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">BANK REMITTANCE DETAILS FOR RTGS/NEFT:</div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-800">
                  <div>Bank: <span className="font-bold">{selectedInvoice.bankDetails.bankName}</span></div>
                  <div>Account: <span className="font-bold">{selectedInvoice.bankDetails.accountNo}</span></div>
                  <div>IFSC: <span className="font-bold">{selectedInvoice.bankDetails.ifscCode}</span></div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                {selectedInvoice.paymentStatus === 'PAID' ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settled on {selectedInvoice.paymentReceivedDate || 'Recent'}
                  </span>
                ) : (
                  <button
                    onClick={() => handleMarkPaymentStatus(selectedInvoice, 'PAID')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate New Milestone Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" /> Generate Milestone Invoice
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Client Project *</label>
                <select
                  value={newWorkId}
                  onChange={(e) => setNewWorkId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  {works.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.workTitle} ({w.clientCompanyName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Milestone Stage Title *</label>
                <select
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="Phase 1: Project Mobilization & Initial CAD Sign-off">Phase 1: Mobilization & CAD Sign-off (Advance)</option>
                  <option value="Phase 2: Fabrication Completion & Material Dispatch">Phase 2: Fabrication Completion & Material Dispatch</option>
                  <option value="Phase 3: Structural Erection & Site Installation">Phase 3: Structural Erection & Installation</option>
                  <option value="Phase 4: Final Inspection, Snag Clearance & Handover">Phase 4: Final Handover & Sign-off</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Taxable Amount (₹) *</label>
                  <input
                    type="number"
                    min="1000"
                    value={newTaxableAmount}
                    onChange={(e) => setNewTaxableAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GST Tax Rate (%)</label>
                  <input
                    type="number"
                    value={newGstRate}
                    onChange={(e) => setNewGstRate(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Due Date *</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl space-y-1 text-blue-900">
                <div className="flex justify-between">
                  <span>Calculated GST (18%):</span>
                  <span className="font-bold">₹{Math.round((newTaxableAmount * newGstRate) / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-black text-sm">
                  <span>Grand Total Payable:</span>
                  <span>₹{(newTaxableAmount + Math.round((newTaxableAmount * newGstRate) / 100)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Generate Official Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
