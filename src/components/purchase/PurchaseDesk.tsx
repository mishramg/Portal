import React, { useState, useEffect } from 'react';
import { 
  UserAccount, 
  Vendor, 
  ProcurementRequirement, 
  AdminPurchaseApproval, 
  PurchaseOrder, 
  CompanyProfile,
  QuoteShortlist,
  VendorItem
} from '../../types';
import { Storage } from '../../lib/storage';
import { generateThreeMaterialQuotes } from '../../lib/materialQuoteEngine';
import { RequirementsSection } from './RequirementsSection';
import { VendorsDirectory } from './VendorsDirectory';
import { AdminApprovalSection } from './AdminApprovalSection';
import { PurchaseOrderSection } from './PurchaseOrderSection';
import { 
  ShoppingCart, ShieldCheck, Building2, FileText, CheckCircle2, 
  Truck, Clock, Layers, Sparkles, HardHat, Factory
} from 'lucide-react';

interface PurchaseDeskProps {
  currentUser: UserAccount;
  users: UserAccount[];
  companyProfile: CompanyProfile;
  initialTab?: PurchaseSubTab;
  onSendNotification?: (title: string, message: string, targetRole?: any) => void;
}

export type PurchaseSubTab = 'REQUIREMENTS' | 'VENDORS' | 'ADMIN_APPROVALS' | 'PURCHASE_ORDERS';

export const PurchaseDesk: React.FC<PurchaseDeskProps> = ({
  currentUser,
  users,
  companyProfile,
  initialTab = 'REQUIREMENTS',
  onSendNotification
}) => {
  const [activeTab, setActiveTab] = useState<PurchaseSubTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  // Stored Procurement Entities
  const [requirements, setRequirements] = useState<ProcurementRequirement[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [approvals, setApprovals] = useState<AdminPurchaseApproval[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    setRequirements(Storage.getProcurementRequirements());
    setVendors(Storage.getVendors());
    setApprovals(Storage.getAdminPurchaseApprovals());
    setPurchaseOrders(Storage.getPurchaseOrders());
  }, []);

  const handleSaveRequirements = (updated: ProcurementRequirement[]) => {
    setRequirements(updated);
    Storage.saveProcurementRequirements(updated);
  };

  const handleSaveVendors = (updated: Vendor[]) => {
    setVendors(updated);
    Storage.saveVendors(updated);
  };

  const handleSaveApprovals = (updated: AdminPurchaseApproval[]) => {
    setApprovals(updated);
    Storage.saveAdminPurchaseApprovals(updated);
  };

  const handleSavePurchaseOrders = (updated: PurchaseOrder[]) => {
    setPurchaseOrders(updated);
    Storage.savePurchaseOrders(updated);
  };

  // Bridge: Send Requirement to Admin RFQ Shortlist
  const handleForwardRequirementToRFQ = (req: ProcurementRequirement) => {
    const estRate = req.estimatedRate || 2200;
    const qtyNum = isNaN(Number(req.quantity)) ? 20 : Number(req.quantity);
    const unitStr = req.unit || 'Units';

    // Automatically generate 3 quotes from matching vendors specifically for the requested material!
    const autoQuotes = generateThreeMaterialQuotes(
      req.itemName,
      req.itemCategory,
      qtyNum,
      unitStr,
      vendors,
      estRate
    );

    const winningQuote = autoQuotes.find(q => q.isRecommended) || autoQuotes[0];

    const newApproval: AdminPurchaseApproval = {
      id: `appr_${Date.now()}`,
      approvalNumber: `RFQ-ADM-${new Date().getFullYear()}-${String(approvals.length + 1).padStart(3, '0')}`,
      title: `Shortlist for ${req.siteOrProjectName} - ${req.itemName}`,
      requirementId: req.id,
      projectName: req.siteOrProjectName,
      itemSummary: `${req.quantity} ${req.unit} of ${req.itemName}`,
      materialName: req.itemName,
      quantity: qtyNum,
      unit: unitStr,
      targetUnitRate: estRate,
      category: req.itemCategory,
      estimatedBudget: req.estimatedTotal || (estRate * qtyNum),
      submittedById: currentUser.id,
      submittedByName: currentUser.name,
      submittedDate: new Date().toISOString(),
      purchaseOfficerNotes: `Requirement confirmed by Project Manager. Sourced 3 quotes against technical specs: "${req.specification}". Rates auto-filtered for material: ${req.itemName}.`,
      selectedQuoteVendorId: winningQuote?.vendorId,
      shortlistedQuotes: autoQuotes,
      status: 'PENDING_ADMIN_APPROVAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    handleSaveApprovals([newApproval, ...approvals]);
    setActiveTab('ADMIN_APPROVALS');
  };

  // Bridge: Proceed from Approved RFQ to Generate PO
  const handleProceedToGeneratePO = (approval: AdminPurchaseApproval, winningQuote: QuoteShortlist) => {
    const ven = vendors.find(v => v.id === winningQuote.vendorId) || vendors[0];
    const req = requirements.find(r => r.id === approval.requirementId);

    const subtotal = winningQuote.quotedAmount;
    const tax = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + tax;

    const newPO: PurchaseOrder = {
      id: `po_${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 43).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      requirementId: approval.requirementId,
      adminApprovalId: approval.id,
      vendorId: ven.id,
      vendorName: ven.name,
      vendorCompany: ven.companyName,
      vendorPhone: ven.phone,
      vendorEmail: ven.email,
      vendorAddress: ven.address,
      vendorGstin: ven.gstin,
      destinationType: req?.type || 'ON_SITE',
      destinationName: approval.projectName,
      destinationAddress: req?.locationAddress || 'Direct Site / Plant Delivery',
      receiverSupervisorId: req?.siteSupervisorId,
      receiverSupervisorName: req?.siteSupervisorName || 'Site Supervisor Incharge',
      receiverSupervisorPhone: req?.siteSupervisorPhone || '+91 98765 10293',
      items: [
        {
          id: `poi_${Date.now()}_1`,
          itemName: approval.itemSummary,
          quantity: req?.quantity ? (isNaN(Number(req.quantity)) ? 24 : Number(req.quantity)) : 24,
          unit: req?.unit || 'Units',
          unitPrice: Math.round(subtotal / (req?.quantity && !isNaN(Number(req.quantity)) ? Number(req.quantity) : 24)),
          taxRatePct: 18,
          amount: subtotal,
          processDetails: `Executive Approved Spec: ${req?.specification || 'Tested PVDF & MTC certified batch'}`,
          mtcRequired: true
        }
      ],
      subtotal,
      cgst: Math.round(tax / 2),
      sgst: Math.round(tax / 2),
      igst: 0,
      grandTotal,
      paymentTerms: winningQuote.paymentTerms,
      deliveryTerms: `Direct Delivery to ${approval.projectName} within ${winningQuote.deliveryTimelineDays} Days`,
      specialInstructions: `Approved by Admin ${approval.adminApprovedByName || 'Owner'}. Verify Delivery Challan and physical batch count prior to unloading.`,
      status: 'PO_ISSUED',
      mtcStatus: 'MTC_REQUESTED',
      mtcReminderCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update approval with linked PO
    const updatedApprovals = approvals.map(a => a.id === approval.id ? { ...a, linkedPurchaseOrderId: newPO.id } : a);
    handleSaveApprovals(updatedApprovals);

    handleSavePurchaseOrders([newPO, ...purchaseOrders]);
    setActiveTab('PURCHASE_ORDERS');
  };

  // Summary Metrics
  const pendingPMCount = requirements.filter(r => r.pmConfirmationStatus === 'PENDING').length;
  const pmConfirmedCount = requirements.filter(r => r.pmConfirmationStatus === 'CONFIRMED').length;
  const pendingAdminCount = approvals.filter(a => a.status === 'PENDING_ADMIN_APPROVAL').length;
  const inTransitCount = purchaseOrders.filter(p => p.status === 'DISPATCHED_IN_TRANSIT').length;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* Top Header Hub */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-yellow-400 rounded-2xl shadow-xs">
            {activeTab === 'VENDORS' ? (
              <Building2 className="w-7 h-7" />
            ) : (
              <ShoppingCart className="w-7 h-7" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {activeTab === 'VENDORS' ? 'Vendor Directory & Supplier Catalog' : 'Purchase & Procurement Desk'}
              </h1>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                activeTab === 'VENDORS' 
                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' 
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}>
                {activeTab === 'VENDORS' ? 'Vendor Master' : 'Purchase Operations'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'VENDORS'
                ? 'Certified vendor directory, rate cards, fabrication processes, GST records & WhatsApp RFQs'
                : 'Material requirements, PM verification gate, 3-quote Admin RFQ sign-off & PO fulfillment'}
            </p>
          </div>
        </div>

        {/* Global Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start lg:self-auto max-w-full">
          {/* Purchase Operations Group */}
          <div className="flex items-center gap-1 bg-white/80 p-1 rounded-lg border border-slate-200/60 shadow-2xs">
            <span className="text-[9px] font-black uppercase px-1 text-slate-400 font-mono hidden xl:inline">Purchase:</span>
            
            <button
              onClick={() => setActiveTab('REQUIREMENTS')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'REQUIREMENTS'
                  ? 'bg-slate-900 text-yellow-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Requirements</span>
              {pendingPMCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full">
                  {pendingPMCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ADMIN_APPROVALS')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'ADMIN_APPROVALS'
                  ? 'bg-slate-900 text-yellow-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin RFQs</span>
              {pendingAdminCount > 0 && (
                <span className="px-1.5 py-0.2 bg-yellow-400 text-slate-950 text-[10px] font-black rounded-full animate-pulse">
                  {pendingAdminCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('PURCHASE_ORDERS')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'PURCHASE_ORDERS'
                  ? 'bg-slate-900 text-yellow-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Purchase Orders</span>
              {inTransitCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full">
                  {inTransitCount}
                </span>
              )}
            </button>
          </div>

          {/* Vendor Hub Group */}
          <div className="flex items-center gap-1 bg-white/80 p-1 rounded-lg border border-slate-200/60 shadow-2xs">
            <span className="text-[9px] font-black uppercase px-1 text-indigo-400 font-mono hidden xl:inline">Vendors:</span>
            
            <button
              onClick={() => setActiveTab('VENDORS')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'VENDORS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 hover:bg-indigo-50 font-bold'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Vendor Directory ({vendors.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Awaiting PM Confirm</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingPMCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">On-site & Factory requisitions</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Verified Vendors</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{vendors.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Categorized with price ranges</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Admin RFQ Approvals</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingAdminCount} Pending</div>
          <p className="text-[11px] text-slate-500 mt-0.5">3-Quote comparative shortlists</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Active In-Transit POs</span>
            <Truck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{inTransitCount} Shipments</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Live supervisor location tracking</p>
        </div>
      </div>

      {/* Active Tab View */}
      {activeTab === 'REQUIREMENTS' && (
        <RequirementsSection
          requirements={requirements}
          currentUser={currentUser}
          users={users}
          onSaveRequirements={handleSaveRequirements}
          onSendToAdminApproval={handleForwardRequirementToRFQ}
        />
      )}

      {activeTab === 'VENDORS' && (
        <VendorsDirectory
          vendors={vendors}
          currentUser={currentUser}
          onSaveVendors={handleSaveVendors}
          onSelectVendorForRFQ={(vendor, item) => {
            setActiveTab('ADMIN_APPROVALS');
          }}
        />
      )}

      {activeTab === 'ADMIN_APPROVALS' && (
        <AdminApprovalSection
          approvals={approvals}
          vendors={vendors}
          currentUser={currentUser}
          onSaveApprovals={handleSaveApprovals}
          onProceedToGeneratePO={handleProceedToGeneratePO}
        />
      )}

      {activeTab === 'PURCHASE_ORDERS' && (
        <PurchaseOrderSection
          purchaseOrders={purchaseOrders}
          currentUser={currentUser}
          companyProfile={companyProfile}
          users={users}
          vendors={vendors}
          onSavePurchaseOrders={handleSavePurchaseOrders}
          onSendNotification={onSendNotification}
        />
      )}

    </div>
  );
};
