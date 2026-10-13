import React, { useState, useEffect } from 'react';
import { AdminPurchaseApproval, QuoteShortlist, UserAccount, Vendor, ProcurementRequirement } from '../../types';
import { FileUploadBox } from './FileUploadBox';
import { 
  ShieldCheck, Upload, FileText, CheckCircle2, XCircle, AlertCircle, 
  Clock, ArrowRight, Eye, Plus, Sparkles, Building2, Calendar, 
  DollarSign, Check, X, RefreshCw, Layers, Paperclip, Download, Share2, Tag,
  Box, Calculator, PackageCheck, Zap, ArrowDownUp, UserCheck, User
} from 'lucide-react';
import { 
  SIGNAGE_MATERIALS_CATALOG, 
  extractVendorRateForMaterial, 
  generateThreeMaterialQuotes,
  MaterialCatalogItem
} from '../../lib/materialQuoteEngine';

interface AdminApprovalSectionProps {
  approvals: AdminPurchaseApproval[];
  vendors: Vendor[];
  currentUser: UserAccount;
  onSaveApprovals: (approvals: AdminPurchaseApproval[]) => void;
  onProceedToGeneratePO: (approval: AdminPurchaseApproval, winningQuote: QuoteShortlist) => void;
}

export const AdminApprovalSection: React.FC<AdminApprovalSectionProps> = ({
  approvals,
  vendors,
  currentUser,
  onSaveApprovals,
  onProceedToGeneratePO
}) => {
  const [selectedApproval, setSelectedApproval] = useState<AdminPurchaseApproval | null>(approvals[0] || null);
  const [adminDecisionNotes, setAdminDecisionNotes] = useState('');
  const [selectedQuoteVendorId, setSelectedQuoteVendorId] = useState<string>('');
  const [showNewRfqModal, setShowNewRfqModal] = useState(false);
  const [viewDocumentUrl, setViewDocumentUrl] = useState<string | null>(null);

  // New RFQ State
  const [newTitle, setNewTitle] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newItemSummary, setNewItemSummary] = useState('');
  const [newCategory, setNewCategory] = useState('ACP & Sheet Metal');
  const [newMaterialName, setNewMaterialName] = useState('ACP Sheet 4mm PVDF External Grade (8x4 ft)');
  const [newQuantity, setNewQuantity] = useState(24);
  const [newUnit, setNewUnit] = useState('Sheets');
  const [newTargetRate, setNewTargetRate] = useState(2150);
  const [newEstimatedBudget, setNewEstimatedBudget] = useState('51600');
  const [newOfficerNotes, setNewOfficerNotes] = useState('');

  // 3 Shortlisted Quotes state for creation (initialized for the same material)
  const [quotes, setQuotes] = useState<QuoteShortlist[]>(() => {
    return generateThreeMaterialQuotes(
      'ACP Sheet 4mm PVDF External Grade (8x4 ft)',
      'ACP & Sheet Metal',
      24,
      'Sheets',
      vendors,
      2150
    );
  });

  const isAdminOrOwner = currentUser.role === 'ADMIN' || currentUser.role === 'SUB_ADMIN';

  // Fast RFQ Preset Templates (All aligned with exact materials and rates)
  const RFQ_PRESETS = [
    {
      title: 'Bandra Facade Exterior ACP Sheets & Panels',
      project: 'TATA Croma Bandra Flagship',
      category: 'ACP & Sheet Metal',
      material: 'ACP Sheet 4mm PVDF External Grade (8x4 ft)',
      quantity: 24,
      unit: 'Sheets',
      rate: 2150,
      summary: '24 Sheets 4mm PVDF External Grade ACP with factory batch test report',
      budget: 51600,
      notes: 'Vendor 1 has guaranteed 48-hour delivery with factory test report.'
    },
    {
      title: 'Wayfinding LED Modules 1.5W Samsung SMD2835',
      project: 'Metro Station Wayfinding Phase 2',
      category: 'LED & Electricals',
      material: 'Injection LED Module 1.5W 6500K IP67 (Samsung SMD2835)',
      quantity: 1200,
      unit: 'Pcs',
      rate: 26,
      summary: '1200 Pcs Samsung LED Signage Modules (1.5W IP67 Waterproof)',
      budget: 31200,
      notes: 'Vendor 1 offers 5-year replacement warranty and constant current IC drivers.'
    },
    {
      title: 'Reception Signage Milky White Cast Acrylic Sheets 3mm',
      project: 'Corporate Headquarters Reception Signage',
      category: 'Acrylic & Vinyl',
      material: 'Cast Acrylic Milky White Sheet 3mm (Diffuser)',
      quantity: 15,
      unit: 'Sheets',
      rate: 1920,
      summary: '15 Sheets 3mm Cast Acrylic Opal Diffuser for 3D channel letters',
      budget: 28800,
      notes: 'Virgin MMA casting ensures bubble-free laser edge finish.'
    },
    {
      title: 'Facade Anchor Bolts SS304 M10x100mm',
      project: 'HDFC Bank Facade Pylon Signage',
      category: 'Hardware & Fasteners',
      material: 'SS304 Wedge Anchor Through Bolts M10x100mm',
      quantity: 50,
      unit: 'Boxes',
      rate: 540,
      summary: '50 Boxes SS304 Wedge Anchor Through Bolts M10x100mm (50 pcs/box)',
      budget: 27000,
      notes: 'High tensile certified stainless steel grade 304 for exterior wind loads.'
    },
    {
      title: 'Structural MS Framework Square Pipe 50x50x2.5mm',
      project: 'National Highway Pylon Sign Tower',
      category: 'Structural Steel & MS',
      material: 'MS Square Hollow Section (SHS) 50x50x2.5mm (6 Mtr)',
      quantity: 30,
      unit: 'Lengths',
      rate: 1620,
      summary: '30 Lengths (6m) MS Square Hollow Section 50x50mm anti-rust primed',
      budget: 48600,
      notes: 'IS 4923 certified uniform wall thickness with red-oxide primer.'
    },
    {
      title: '2K Polyurethane Topcoat Gloss White Signage Enamel',
      project: 'Central Workshop Paint Bay Refinish',
      category: 'Paints & Coatings',
      material: '2K Polyurethane (PU) Topcoat Enamel - Gloss White (4L)',
      quantity: 40,
      unit: 'Packs',
      rate: 560,
      summary: '40 Packs (4L) 2K Polyurethane Topcoat Enamel Gloss White with Hardener',
      budget: 22400,
      notes: 'Automotive grade UV protective gloss finish for exterior outdoor signage.'
    }
  ];

  const handleApplyPreset = (preset: typeof RFQ_PRESETS[0]) => {
    setNewTitle(preset.title);
    setNewProjectName(preset.project);
    setNewCategory(preset.category);
    setNewMaterialName(preset.material);
    setNewQuantity(preset.quantity);
    setNewUnit(preset.unit);
    setNewTargetRate(preset.rate);
    setNewItemSummary(preset.summary);
    setNewEstimatedBudget(String(preset.budget));
    setNewOfficerNotes(preset.notes);

    // Auto-filter 3 quotes for the same material!
    const autoQuotes = generateThreeMaterialQuotes(
      preset.material,
      preset.category,
      preset.quantity,
      preset.unit,
      vendors,
      preset.rate
    );
    setQuotes(autoQuotes);
  };

  const handleAdminDecision = (status: 'ADMIN_APPROVED' | 'ADMIN_REJECTED' | 'CHANGES_REQUESTED') => {
    if (!selectedApproval) return;

    const chosenVendorId = selectedQuoteVendorId || selectedApproval.selectedQuoteVendorId || selectedApproval.shortlistedQuotes[0]?.vendorId;

    const updated = approvals.map(appr => {
      if (appr.id === selectedApproval.id) {
        return {
          ...appr,
          status,
          selectedQuoteVendorId: chosenVendorId,
          adminApprovedById: currentUser.id,
          adminApprovedByName: currentUser.name,
          adminDecisionDate: new Date().toISOString(),
          adminNotes: adminDecisionNotes || (status === 'ADMIN_APPROVED' ? 'Approved by Admin for Purchase Order issuance.' : 'Changes or rejection communicated.'),
          updatedAt: new Date().toISOString()
        };
      }
      return appr;
    });

    onSaveApprovals(updated);
    const refreshed = updated.find(a => a.id === selectedApproval.id);
    if (refreshed) setSelectedApproval(refreshed);
    setAdminDecisionNotes('');
  };

  const handleCreateNewRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newItemSummary) {
      alert('Please fill in Title and Item Summary');
      return;
    }

    const calculatedBudget = Number(newEstimatedBudget) || (newTargetRate * newQuantity) || 50000;

    const newApproval: AdminPurchaseApproval = {
      id: `appr_${Date.now()}`,
      approvalNumber: `RFQ-ADM-${new Date().getFullYear()}-${String(approvals.length + 1).padStart(3, '0')}`,
      title: newTitle,
      projectName: newProjectName || 'Main Signage & Facade Project',
      itemSummary: newItemSummary || `${newQuantity} ${newUnit} of ${newMaterialName}`,
      materialName: newMaterialName,
      quantity: newQuantity,
      unit: newUnit,
      targetUnitRate: newTargetRate,
      category: newCategory,
      estimatedBudget: calculatedBudget,
      submittedById: currentUser.id,
      submittedByName: currentUser.name,
      submittedDate: new Date().toISOString(),
      purchaseOfficerNotes: newOfficerNotes || `Quotes compiled for ${newMaterialName}. Rates verified against vendor rate card.`,
      selectedQuoteVendorId: quotes.find(q => q.isRecommended)?.vendorId || quotes[0]?.vendorId,
      shortlistedQuotes: quotes,
      status: 'PENDING_ADMIN_APPROVAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newApproval, ...approvals];
    onSaveApprovals(updated);
    setSelectedApproval(newApproval);
    setShowNewRfqModal(false);

    // Reset Form
    setNewTitle('');
    setNewProjectName('');
    setNewItemSummary('');
    setNewOfficerNotes('');
  };

  const handleCategoryChange = (cat: string) => {
    setNewCategory(cat);
    // Find default material for this category
    const catMats = SIGNAGE_MATERIALS_CATALOG.filter(m => m.category === cat);
    const defaultMat = catMats[0];
    if (defaultMat) {
      setNewMaterialName(defaultMat.name);
      setNewUnit(defaultMat.unit);
      setNewTargetRate(defaultMat.defaultRate);
      const total = defaultMat.defaultRate * newQuantity;
      setNewEstimatedBudget(String(total));
      setNewItemSummary(`${newQuantity} ${defaultMat.unit} of ${defaultMat.name}`);
      
      const newQuotes = generateThreeMaterialQuotes(
        defaultMat.name,
        cat,
        newQuantity,
        defaultMat.unit,
        vendors,
        defaultMat.defaultRate
      );
      setQuotes(newQuotes);
    }
  };

  const handleSelectMaterial = (mat: MaterialCatalogItem) => {
    setNewMaterialName(mat.name);
    setNewCategory(mat.category);
    setNewUnit(mat.unit);
    setNewTargetRate(mat.defaultRate);
    const total = mat.defaultRate * newQuantity;
    setNewEstimatedBudget(String(total));
    setNewItemSummary(`${newQuantity} ${mat.unit} of ${mat.name}`);

    // Auto-generate 3 quotes for the same selected material
    const newQuotes = generateThreeMaterialQuotes(
      mat.name,
      mat.category,
      newQuantity,
      mat.unit,
      vendors,
      mat.defaultRate
    );
    setQuotes(newQuotes);
  };

  const handleAutoFilterQuotesForSameMaterial = () => {
    const newQuotes = generateThreeMaterialQuotes(
      newMaterialName,
      newCategory,
      newQuantity,
      newUnit,
      vendors,
      newTargetRate
    );
    setQuotes(newQuotes);
  };

  const handleUpdateQuoteField = (index: number, field: keyof QuoteShortlist, value: any) => {
    const next = [...quotes];
    next[index] = { ...next[index], [field]: value };
    if (field === 'vendorId') {
      const v = vendors.find(item => item.id === value);
      if (v) {
        next[index].vendorName = v.name;
        next[index].vendorCompany = v.companyName;
        next[index].vendorFor = v.vendorFor || v.category;
        next[index].paymentTerms = v.paymentTerms || next[index].paymentTerms;
        
        // Auto-extract vendor's rate specifically for the requested material
        const extracted = extractVendorRateForMaterial(v, newMaterialName, newCategory, newTargetRate);
        next[index].unitRate = extracted.unitRate;
        next[index].materialName = newMaterialName;
        next[index].quantity = newQuantity;
        next[index].unit = newUnit;
        next[index].materialPriceRange = extracted.priceRange;
        next[index].materialSpecs = extracted.specs;
        next[index].quotedAmount = Math.round(extracted.unitRate * newQuantity);
        next[index].deliveryTimelineDays = extracted.leadTimeDays;
      }
    } else if (field === 'unitRate') {
      const uRate = Number(value) || 0;
      next[index].unitRate = uRate;
      next[index].quotedAmount = Math.round(uRate * (next[index].quantity || newQuantity));
    }
    setQuotes(next);
  };

  // Re-generate quotes on selected approval for comparison if requested
  const handleFilterSelectedApprovalMaterial = (matName: string) => {
    if (!selectedApproval) return;
    const cat = selectedApproval.category;
    const qty = selectedApproval.quantity || 24;
    const un = selectedApproval.unit || 'Units';
    const updatedQuotes = generateThreeMaterialQuotes(matName, cat, qty, un, vendors);
    
    const updatedApproval: AdminPurchaseApproval = {
      ...selectedApproval,
      materialName: matName,
      shortlistedQuotes: updatedQuotes,
      estimatedBudget: updatedQuotes[0]?.quotedAmount || selectedApproval.estimatedBudget,
      updatedAt: new Date().toISOString()
    };

    const allUpdated = approvals.map(a => a.id === selectedApproval.id ? updatedApproval : a);
    onSaveApprovals(allUpdated);
    setSelectedApproval(updatedApproval);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner explaining Admin 3-Quote Approval Flow */}
      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-yellow-500 text-slate-950 rounded-lg font-black shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                Admin RFQ & 3-Quote Shortlist Approval Console
                <span className="text-[11px] font-bold bg-yellow-400 text-slate-950 px-2 py-0.5 rounded-md">
                  Executive Approval Engine
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Purchase officers upload <strong>3 shortlisted vendor quotes</strong> with comparative delivery timelines, payment terms, and attached PDFs. Admin evaluates price, quality, and warranties before giving final authorization to generate the Purchase Order.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowNewRfqModal(true)}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Submit 3-Quote Shortlist for Admin
          </button>
        </div>
      </div>

      {/* Main Approval Grid & Selected Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Shortlist Request Pipeline */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
              Submitted RFQs ({approvals.length})
            </h4>
            <span className="text-[11px] text-slate-500">
              {approvals.filter(a => a.status === 'PENDING_ADMIN_APPROVAL').length} Pending
            </span>
          </div>

          <div className="space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
            {approvals.map(appr => {
              const isSelected = selectedApproval?.id === appr.id;
              return (
                <div
                  key={appr.id}
                  onClick={() => setSelectedApproval(appr)}
                  className={`p-4 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-1 ring-yellow-400/50'
                      : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-yellow-400' : 'text-slate-500'}`}>
                        {appr.approvalNumber}
                      </span>
                      {appr.status === 'ADMIN_APPROVED' ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded-md border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                        </span>
                      ) : appr.status === 'ADMIN_REJECTED' ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-900 text-[10px] font-bold rounded-md border border-rose-300 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" /> Rejected
                        </span>
                      ) : appr.status === 'CHANGES_REQUESTED' ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md border border-amber-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" /> Changes Req
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-950 text-[10px] font-bold rounded-md border border-yellow-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-yellow-700" /> Awaiting Admin
                        </span>
                      )}
                    </div>

                    <h5 className="font-bold text-sm leading-snug line-clamp-2">{appr.title}</h5>
                    <p className={`text-xs mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                      {appr.projectName}
                    </p>
                  </div>

                  <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] ${
                    isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    <span>3 Quotes Attached</span>
                    <span className="font-bold text-yellow-500 font-mono">
                      Budget: ₹{appr.estimatedBudget?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: 3-Quote Comparative Evaluation Board */}
        <div className="lg:col-span-8">
          {selectedApproval ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 font-extrabold text-[10px] rounded uppercase border border-purple-200">
                      {selectedApproval.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">{selectedApproval.approvalNumber}</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg leading-snug">{selectedApproval.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    <strong>Project:</strong> {selectedApproval.projectName} | <strong>Submitted By:</strong> {selectedApproval.submittedByName} on {new Date(selectedApproval.submittedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="text-right shrink-0">
                  {selectedApproval.status === 'ADMIN_APPROVED' ? (
                    <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-emerald-900 text-right">
                      <div className="flex items-center gap-1.5 justify-end font-black text-xs text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" /> APPROVED BY ADMIN
                      </div>
                      <p className="text-[11px] font-semibold mt-0.5">{selectedApproval.adminApprovedByName}</p>
                      <p className="text-[10px] text-emerald-600">{selectedApproval.adminDecisionDate && new Date(selectedApproval.adminDecisionDate).toLocaleString('en-IN')}</p>
                    </div>
                  ) : selectedApproval.status === 'ADMIN_REJECTED' ? (
                    <div className="bg-rose-50 border border-rose-300 p-3 rounded-xl text-rose-900 text-right">
                      <div className="flex items-center gap-1.5 justify-end font-black text-xs text-rose-700">
                        <XCircle className="w-4 h-4" /> REJECTED BY ADMIN
                      </div>
                      <p className="text-[11px] mt-0.5">{selectedApproval.adminApprovedByName}</p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-300 p-3 rounded-xl text-yellow-950 text-right animate-pulse">
                      <div className="flex items-center gap-1.5 justify-end font-black text-xs text-yellow-800">
                        <Clock className="w-4 h-4" /> PENDING ADMIN DECISION
                      </div>
                      <p className="text-[11px] text-yellow-700 mt-0.5">Awaiting Owner / Admin Review</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Item Summary & Who Raised Request */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Required Materials Summary</span>
                  <p className="font-bold text-slate-900 mt-1">{selectedApproval.itemSummary}</p>
                </div>
                <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-200/90 text-indigo-950">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-indigo-800 tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Who Raised Request
                    </span>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 bg-white/80 px-2 py-0.5 rounded border border-indigo-200">
                      {selectedApproval.requirementId ? `Req #${selectedApproval.requirementId}` : selectedApproval.approvalNumber}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {(selectedApproval.submittedByName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">{selectedApproval.submittedByName || 'Requester'}</p>
                      <p className="text-[10.5px] text-indigo-900 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                        <span>🗓 {new Date(selectedApproval.submittedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>📍 {selectedApproval.projectName}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 SHORTLISTED QUOTES SIDE-BY-SIDE COMPARISON */}
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-yellow-500" />
                      3 Shortlisted Vendor Quotations & Documents
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Comparing 3 competitive supplier quotes for the <strong>exact same material</strong>
                    </span>
                  </div>

                  {/* Material Switcher / Auto-Filter for this Category */}
                  <div className="flex items-center gap-1.5 self-start md:self-auto">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Compare Material:</span>
                    <select
                      value={selectedApproval.materialName || ''}
                      onChange={(e) => handleFilterSelectedApprovalMaterial(e.target.value)}
                      className="bg-slate-100 border border-slate-300 text-slate-900 text-[11px] font-bold py-1 px-2 rounded-lg cursor-pointer focus:outline-none focus:border-yellow-500"
                    >
                      {SIGNAGE_MATERIALS_CATALOG.filter(m => m.category === selectedApproval.category).map(m => (
                        <option key={m.id} value={m.name}>
                          {m.name} (Base ₹{m.defaultRate}/{m.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Requested Material & Benchmark Card */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 mb-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-900 font-bold shrink-0">
                      <Box className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider block">
                        Target Material Requested for RFQ
                      </span>
                      <p className="font-black text-slate-900 text-xs">
                        {selectedApproval.materialName || selectedApproval.itemSummary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-700 font-bold">
                    <div className="border-l border-amber-200 pl-3">
                      <span className="text-[9px] uppercase text-slate-400 block">Requested Qty</span>
                      <span className="font-mono text-slate-950">
                        {selectedApproval.quantity || 24} {selectedApproval.unit || 'Units'}
                      </span>
                    </div>
                    <div className="border-l border-amber-200 pl-3">
                      <span className="text-[9px] uppercase text-slate-400 block">Est. Unit Rate</span>
                      <span className="font-mono text-slate-950">
                        ₹{(selectedApproval.targetUnitRate || Math.round(selectedApproval.estimatedBudget / (selectedApproval.quantity || 24))).toLocaleString('en-IN')} / {selectedApproval.unit || 'Unit'}
                      </span>
                    </div>
                    <div className="border-l border-amber-200 pl-3">
                      <span className="text-[9px] uppercase text-slate-400 block">Total Est. Budget</span>
                      <span className="font-mono text-emerald-700 font-black">
                        ₹{selectedApproval.estimatedBudget.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3 Quotation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {selectedApproval.shortlistedQuotes.map((quote, idx) => {
                    const isSelectedWinning = (selectedQuoteVendorId === quote.vendorId) || (!selectedQuoteVendorId && selectedApproval.selectedQuoteVendorId === quote.vendorId);
                    const currentUnitRate = quote.unitRate || Math.round(quote.quotedAmount / (quote.quantity || selectedApproval.quantity || 24));
                    const currentQty = quote.quantity || selectedApproval.quantity || 24;
                    const currentUnit = quote.unit || selectedApproval.unit || 'Units';

                    return (
                      <div 
                        key={quote.quoteId}
                        className={`rounded-2xl border p-4 transition-all flex flex-col justify-between relative shadow-2xs ${
                          quote.isRecommended
                            ? 'bg-yellow-50/50 border-yellow-400 ring-2 ring-yellow-400/30'
                            : isSelectedWinning
                            ? 'bg-emerald-50/50 border-emerald-400 ring-2 ring-emerald-400/30'
                            : 'bg-slate-50/80 border-slate-200'
                        }`}
                      >
                        {quote.isRecommended && (
                          <div className="absolute -top-2.5 right-3 bg-yellow-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                            Recommended
                          </div>
                        )}

                        <div>
                          {/* Quote Header */}
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-mono font-bold text-slate-400">Quote #{idx + 1}</span>
                            <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-500" /> {quote.deliveryTimelineDays} Day(s) Dispatch
                            </span>
                          </div>

                          <h5 className="font-extrabold text-slate-900 text-sm leading-snug">{quote.vendorCompany}</h5>
                          <p className="text-xs text-slate-600 font-medium">{quote.vendorName}</p>

                          {/* Vendor For Badge */}
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 my-1.5 bg-indigo-50 border border-indigo-200/80 rounded-md text-[10px] text-indigo-950 font-bold max-w-full truncate">
                            <Tag className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                            <span className="text-indigo-600 font-extrabold uppercase tracking-wide shrink-0">Vendor For:</span>
                            <span className="truncate">{quote.vendorFor || vendors.find(v => v.id === quote.vendorId)?.vendorFor || selectedApproval.category}</span>
                          </div>

                          {/* Material & Unit Rate Breakdown Box */}
                          <div className="my-2.5 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase mb-0.5">
                                <span>Material Filtered Rate</span>
                                <span className="text-slate-500">{currentQty} {currentUnit}</span>
                              </div>
                              <div className="flex items-baseline justify-between">
                                <span className="font-mono font-black text-slate-950 text-base text-yellow-950">
                                  ₹{currentUnitRate.toLocaleString('en-IN')} <span className="text-xs font-semibold text-slate-500">/ {currentUnit.slice(0, -1) || currentUnit}</span>
                                </span>
                                <span className="text-[10px] font-mono font-bold text-slate-500">
                                  Total: ₹{quote.quotedAmount.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>

                            {/* Catalog Price Range */}
                            {quote.materialPriceRange && (
                              <div className="text-[9.5px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center justify-between">
                                <span className="font-semibold text-slate-400 uppercase">Depot Range:</span>
                                <span className="font-mono font-bold text-slate-700">{quote.materialPriceRange}</span>
                              </div>
                            )}

                            {/* Material Specs */}
                            {quote.materialSpecs && (
                              <div className="text-[10px] text-slate-700 font-medium leading-tight border-t border-slate-100 pt-1.5">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">Technical Specs:</span>
                                <p className="line-clamp-2">{quote.materialSpecs}</p>
                              </div>
                            )}
                          </div>

                          {/* Terms & Evaluation */}
                          <div className="space-y-1.5 text-xs text-slate-600">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Payment Terms:</span>
                              <p className="font-medium text-slate-800 text-[11px]">{quote.paymentTerms}</p>
                            </div>
                            {quote.pros && (
                              <div className="text-emerald-800 bg-emerald-50 p-1.5 rounded text-[10px] leading-tight">
                                <strong>Pros:</strong> {quote.pros}
                              </div>
                            )}
                            {quote.cons && (
                              <div className="text-rose-800 bg-rose-50 p-1.5 rounded text-[10px] leading-tight">
                                <strong>Cons:</strong> {quote.cons}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Document View Button & Select Button */}
                        <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-2">
                          {quote.documentUrl && (
                            <button
                              onClick={() => setViewDocumentUrl(quote.documentUrl || null)}
                              className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-yellow-600" />
                              <span>View {quote.documentTitle || 'Quote PDF'}</span>
                            </button>
                          )}

                          {isAdminOrOwner && selectedApproval.status !== 'ADMIN_APPROVED' && (
                            <button
                              onClick={() => setSelectedQuoteVendorId(quote.vendorId)}
                              className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                isSelectedWinning
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              }`}
                            >
                              {isSelectedWinning ? <Check className="w-3.5 h-3.5" /> : null}
                              {isSelectedWinning ? 'Selected for Approval' : 'Select This Quote'}
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Admin Decision Console (for Admin / Sub-Admin) */}
              {isAdminOrOwner && selectedApproval.status === 'PENDING_ADMIN_APPROVAL' && (
                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-yellow-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Admin Executive Action Console
                    </h4>
                    <span className="text-[11px] text-slate-400">Owner Authorization Required</span>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">
                      Admin Approval Instructions & Modification Notes:
                    </label>
                    <textarea
                      value={adminDecisionNotes}
                      onChange={(e) => setAdminDecisionNotes(e.target.value)}
                      placeholder="e.g. Approved Aludecor Quote. Negotiate 2% cash discount on 30-day clearance. Ensure test certificate is delivered on-site."
                      rows={2}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleAdminDecision('CHANGES_REQUESTED')}
                      className="px-3.5 py-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" /> Request Quote Adjustments
                    </button>
                    <button
                      onClick={() => handleAdminDecision('ADMIN_REJECTED')}
                      className="px-3.5 py-2 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Reject RFQ
                    </button>
                    <button
                      onClick={() => handleAdminDecision('ADMIN_APPROVED')}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Authorize & Approve Selected Quote
                    </button>
                  </div>
                </div>
              )}

              {/* Proceed to Final Purchase / Generate PO Trigger */}
              {selectedApproval.status === 'ADMIN_APPROVED' && (
                <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-600 text-white rounded-xl">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-base">Executive Approval Granted</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Quote from <strong>{selectedApproval.shortlistedQuotes.find(q => q.vendorId === selectedApproval.selectedQuoteVendorId)?.vendorCompany || 'Selected Vendor'}</strong> has been approved. Proceed to generate official Purchase Order.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const winning = selectedApproval.shortlistedQuotes.find(q => q.vendorId === selectedApproval.selectedQuoteVendorId) || selectedApproval.shortlistedQuotes[0];
                      onProceedToGeneratePO(selectedApproval, winning);
                    }}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-yellow-400 font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    <span>Proceed for Final Purchase (Generate PO)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Select an RFQ Shortlist to view 3-quote analysis</p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: View Uploaded Document / PDF */}
      {viewDocumentUrl && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-yellow-500" />
                Verified Supplier Quotation Document
              </h4>
              <button
                onClick={() => setViewDocumentUrl(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center p-2">
              <img
                src={viewDocumentUrl}
                alt="Quote Document Preview"
                className="max-h-[60vh] object-contain rounded-lg shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="pt-3 text-right">
              <button
                onClick={() => setViewDocumentUrl(null)}
                className="px-4 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Submit New 3-Quote Shortlist for Admin */}
      {showNewRfqModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Submit 3-Quote RFQ Shortlist for Admin Approval</h3>
                <p className="text-xs text-slate-500">Upload 3 competitive vendor quotations and PDF files for executive sign-off</p>
              </div>
              <button
                onClick={() => setShowNewRfqModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Fast RFQ Presets */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 my-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10.5px] font-extrabold uppercase text-slate-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Fast RFQ Templates:
                </span>
                <span className="text-[10px] text-slate-400">Click to autofill RFQ details</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {RFQ_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2 py-1 bg-white hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    + {preset.title.slice(0, 25)}...
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateNewRFQ} className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">RFQ Title / Subject *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Shortlisted Quotes for Bandra Facade ACP & Box Sections"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Site / Project Target</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="e.g. TATA Croma Bandra Flagship"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Material Specification & Target Rate Section */}
              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-extrabold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-amber-700" />
                    Target Material & Unit Rate Auto-Filter:
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold">
                    Select a material to auto-pull vendor rates
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-600 font-bold mb-0.5">
                      Select Master Catalog Material ({newCategory})
                    </label>
                    <select
                      value={newMaterialName}
                      onChange={(e) => {
                        const found = SIGNAGE_MATERIALS_CATALOG.find(m => m.name === e.target.value);
                        if (found) {
                          handleSelectMaterial(found);
                        } else {
                          setNewMaterialName(e.target.value);
                        }
                      }}
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:border-amber-500"
                    >
                      {SIGNAGE_MATERIALS_CATALOG.filter(m => m.category === newCategory).map(m => (
                        <option key={m.id} value={m.name}>
                          {m.name} (Base: ₹{m.defaultRate}/{m.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold mb-0.5">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={newQuantity}
                      onChange={(e) => {
                        const qty = Number(e.target.value) || 1;
                        setNewQuantity(qty);
                        setNewEstimatedBudget(String(Math.round(qty * newTargetRate)));
                        setNewItemSummary(`${qty} ${newUnit} of ${newMaterialName}`);
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold mb-0.5">Unit</label>
                    <input
                      type="text"
                      value={newUnit}
                      onChange={(e) => {
                        setNewUnit(e.target.value);
                        setNewItemSummary(`${newQuantity} ${e.target.value} of ${newMaterialName}`);
                      }}
                      placeholder="e.g. Sheets, Pcs, Lengths"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold mb-0.5">Estimated Unit Rate (₹ / {newUnit.slice(0, -1) || newUnit})</label>
                    <input
                      type="number"
                      value={newTargetRate}
                      onChange={(e) => {
                        const r = Number(e.target.value) || 0;
                        setNewTargetRate(r);
                        setNewEstimatedBudget(String(Math.round(r * newQuantity)));
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 font-bold mb-0.5">Total Estimated Budget (₹)</label>
                    <input
                      type="number"
                      value={newEstimatedBudget}
                      onChange={(e) => setNewEstimatedBudget(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-emerald-700"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAutoFilterQuotesForSameMaterial}
                      className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Auto-Filter 3 Vendor Rates
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Materials / Items Summary *</label>
                  <input
                    type="text"
                    required
                    value={newItemSummary}
                    onChange={(e) => setNewItemSummary(e.target.value)}
                    placeholder="e.g. 24 Sheets 4mm PVDF Grey Metallic ACP + 20 Lengths 50x25mm Tubes"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service / Material Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer font-bold text-slate-800"
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

              {/* 3 Quotations Entry Form with Service-Matched Vendor Dropdown & Material Rate Breakdown */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-yellow-600" />
                      3 Shortlisted Vendor Quotations for: <span className="text-yellow-700 lowercase">[{newMaterialName}]</span>
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      All 3 quotations below are filtered for <strong>{newQuantity} {newUnit}</strong> of <strong>{newMaterialName}</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFilterQuotesForSameMaterial}
                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-[11px] rounded-lg transition-all shadow-2xs flex items-center gap-1 cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Recalculate Rates
                  </button>
                </div>

                <div className="space-y-3">
                  {quotes.map((q, idx) => {
                    const matchingVendors = vendors.filter(v => 
                      v.category === newCategory || 
                      (v.vendorFor && v.vendorFor.toLowerCase().includes(newCategory.toLowerCase()))
                    );
                    const otherVendors = vendors.filter(v => 
                      v.category !== newCategory && 
                      (!v.vendorFor || !v.vendorFor.toLowerCase().includes(newCategory.toLowerCase()))
                    );
                    const selectedVendorObj = vendors.find(v => v.id === q.vendorId);
                    const isDirectMatch = selectedVendorObj && (
                      selectedVendorObj.category === newCategory ||
                      (selectedVendorObj.vendorFor && selectedVendorObj.vendorFor.toLowerCase().includes(newCategory.toLowerCase()))
                    );

                    return (
                      <div key={q.quoteId} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded-md">
                              Quotation #{idx + 1}
                            </span>
                            {selectedVendorObj && (
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                isDirectMatch
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                <Tag className="w-2.5 h-2.5" />
                                {isDirectMatch 
                                  ? `For: ${selectedVendorObj.vendorFor || selectedVendorObj.category}`
                                  : `Other: ${selectedVendorObj.category}`}
                              </span>
                            )}
                          </div>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-amber-700">
                            <input
                              type="radio"
                              name="recommendedQuote"
                              checked={q.isRecommended}
                              onChange={() => {
                                const updated = quotes.map((item, i) => ({ ...item, isRecommended: i === idx }));
                                setQuotes(updated);
                              }}
                            />
                            Mark as Recommended by Purchase Officer
                          </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <div className="sm:col-span-1">
                            <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                              Supplier Dropdown ({newCategory})
                            </label>
                            <select
                              value={q.vendorId}
                              onChange={(e) => handleUpdateQuoteField(idx, 'vendorId', e.target.value)}
                              className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs cursor-pointer font-medium focus:outline-none focus:border-amber-500"
                            >
                              <optgroup label={`Matching Vendor For Scope: ${newCategory} (${matchingVendors.length})`}>
                                {matchingVendors.map(v => (
                                  <option key={v.id} value={v.id}>
                                    {v.companyName}: [For: {v.vendorFor || v.category}] ({v.priceTier} · Verified)
                                  </option>
                                ))}
                              </optgroup>
                              {otherVendors.length > 0 && (
                                <optgroup label={`Other Registered Suppliers (${otherVendors.length})`}>
                                  {otherVendors.map(v => (
                                    <option key={v.id} value={v.id}>
                                      {v.companyName}: [For: {v.vendorFor || v.category}]
                                    </option>
                                  ))}
                                </optgroup>
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                              Unit Rate (₹ / {newUnit.slice(0, -1) || newUnit})
                            </label>
                            <input
                              type="number"
                              value={q.unitRate || Math.round(q.quotedAmount / newQuantity)}
                              onChange={(e) => handleUpdateQuoteField(idx, 'unitRate', Number(e.target.value))}
                              className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-yellow-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                              Total Amount for {newQuantity} {newUnit} (₹)
                            </label>
                            <input
                              type="number"
                              value={q.quotedAmount}
                              onChange={(e) => handleUpdateQuoteField(idx, 'quotedAmount', Number(e.target.value))}
                              className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Lead Time (Days)</label>
                            <input
                              type="number"
                              value={q.deliveryTimelineDays}
                              onChange={(e) => handleUpdateQuoteField(idx, 'deliveryTimelineDays', Number(e.target.value))}
                              className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Payment Terms</label>
                            <input
                              type="text"
                              value={q.paymentTerms}
                              onChange={(e) => handleUpdateQuoteField(idx, 'paymentTerms', e.target.value)}
                              placeholder="e.g. 30 Days Net"
                              className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 font-bold mb-0.5">Material Technical Specs</label>
                            <input
                              type="text"
                              value={q.materialSpecs || ''}
                              onChange={(e) => handleUpdateQuoteField(idx, 'materialSpecs', e.target.value)}
                              placeholder="e.g. PVDF 30-micron coating, tested MTC"
                              className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                            />
                          </div>
                        </div>

                        {/* Quick Catalog Rates Selector if vendor has catalog items */}
                        {selectedVendorObj?.items && selectedVendorObj.items.length > 0 && (
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-wrap items-center gap-1.5 text-[10.5px]">
                            <span className="text-slate-500 font-bold">Catalog Rates:</span>
                            {selectedVendorObj.items.map((it) => (
                              <button
                                key={it.id}
                                type="button"
                                onClick={() => {
                                  handleUpdateQuoteField(idx, 'quotedAmount', it.finalPrice);
                                  handleUpdateQuoteField(idx, 'pros', `${it.name} - ${it.processDetails}`);
                                  handleUpdateQuoteField(idx, 'deliveryTimelineDays', it.leadTimeDays || 2);
                                }}
                                className="px-2 py-0.5 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-900 border border-slate-200 rounded font-semibold transition-colors cursor-pointer shadow-2xs"
                                title={`Click to set rate: ₹${it.finalPrice} (${it.processDetails})`}
                              >
                                {it.name.slice(0, 22)}... @ ₹{it.finalPrice}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={q.pros || ''}
                            onChange={(e) => handleUpdateQuoteField(idx, 'pros', e.target.value)}
                            placeholder="Key Advantage / Quality Pro (e.g. PVDF tested, 10-yr warranty)"
                            className="p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]"
                          />
                          <input
                            type="text"
                            value={q.cons || ''}
                            onChange={(e) => handleUpdateQuoteField(idx, 'cons', e.target.value)}
                            placeholder="Trade-off / Quality Con (e.g. 50% advance, 3-day lead)"
                            className="p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]"
                          />
                        </div>

                        {/* File Upload Box for this specific quote */}
                        <FileUploadBox
                          label={`Upload Quotation PDF / Image for Quote #${idx + 1}`}
                          helperText="Attach formal quote received on WhatsApp/Email"
                          fileUrl={q.documentUrl}
                          fileName={q.documentTitle}
                          onFileChange={(file) => {
                            handleUpdateQuoteField(idx, 'documentUrl', file?.url || '');
                            handleUpdateQuoteField(idx, 'documentTitle', file?.name || '');
                          }}
                          sampleOptions={[
                            { title: `Quote_Signed_Vendor_${idx + 1}.pdf`, url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80' }
                          ]}
                        />

                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Purchase Officer Recommendation Notes</label>
                <textarea
                  value={newOfficerNotes}
                  onChange={(e) => setNewOfficerNotes(e.target.value)}
                  placeholder="Explain why the recommended quote is optimal in terms of pricing, wind-load specs, test certificates, and site timeline..."
                  rows={2}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewRfqModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-yellow-400 font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" /> Submit to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
