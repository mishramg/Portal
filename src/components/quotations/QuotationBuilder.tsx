import React, { useState, useRef } from 'react';
import { Quotation, QuotationLineItem, CompanyProfile, WorkAssignment, ServiceAssignment } from '../../types';
import { Storage } from '../../lib/storage';
import { compressImageFile } from '../../lib/fileUtils';
import { exportQuotationToExcel } from '../../lib/excelExport';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  FileSpreadsheet, 
  Building, 
  CheckCircle2, 
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  X,
  Eye,
  DollarSign,
  IndianRupee,
  Check
} from 'lucide-react';

interface QuotationBuilderProps {
  initialQuotation?: Quotation;
  companyProfile?: CompanyProfile;
  workAssignment?: WorkAssignment;
  assignedServices?: ServiceAssignment[];
  works?: WorkAssignment[];
  services?: ServiceAssignment[];
  onSaveQuotation: (quote: Quotation, targetWorkId?: string) => void;
  onBack?: () => void;
  readOnly?: boolean;
}

export const QuotationBuilder: React.FC<QuotationBuilderProps> = ({
  initialQuotation,
  companyProfile,
  workAssignment,
  assignedServices,
  works,
  services,
  onSaveQuotation,
  onBack,
  readOnly = false,
}) => {
  const company = companyProfile || Storage.getCompanyProfile();

  // Load available works and services
  const availableWorks = works || Storage.getWorks() || [];
  const availableServices = services || assignedServices || Storage.getServices() || [];

  // Determine active work order
  const initialWork = workAssignment || availableWorks[0];
  const [selectedWorkId, setSelectedWorkId] = useState<string>(initialWork?.id || '');

  // Helper to build line items corresponding ONLY to assigned services
  const buildLineItemsForWork = (
    work?: WorkAssignment,
    existingQuote?: Quotation,
    allSvcs: ServiceAssignment[] = []
  ): QuotationLineItem[] => {
    // If an existing saved quotation has non-mock items, preserve them
    if (existingQuote?.items && existingQuote.items.length > 0) {
      const isOldMockItems = existingQuote.items.some(
        i => i.itemTitle === 'Web Development' || i.itemTitle === 'Backend Design'
      );
      if (!isOldMockItems) {
        return existingQuote.items;
      }
    }

    if (work) {
      // Find matching assigned services
      const matchedSvcs = allSvcs.filter(
        s => s.workId === work.id || (s.workTitle && s.workTitle === work.workTitle) || (s.clientCompanyName && s.clientCompanyName === work.clientCompanyName)
      );

      if (matchedSvcs.length > 0) {
        return matchedSvcs.map((svc, idx) => ({
          id: `svc_${svc.id || idx}_${Date.now()}`,
          itemTitle: svc.serviceName,
          description: `Assigned Service: ${svc.serviceName} (${svc.category ? svc.category.replace(/_/g, ' ') : 'General'})`,
          quantity: 1,
          unit: 'Job',
          rate: 0,     // Blank amount column
          amount: 0,   // Blank amount column
          imageUrl: '' // Blank image column
        }));
      } else if (work.workTitle) {
        return [{
          id: `work_${work.id}_${Date.now()}`,
          itemTitle: work.workTitle,
          description: `Assigned Service Execution: ${work.workTitle}`,
          quantity: 1,
          unit: 'Job',
          rate: 0,     // Blank amount column
          amount: 0,   // Blank amount column
          imageUrl: '' // Blank image column
        }];
      }
    }

    // Default blank service row
    return [{
      id: '1',
      itemTitle: 'Assigned Service Item',
      description: 'Specify assigned service scope details...',
      quantity: 1,
      unit: 'Job',
      rate: 0,
      amount: 0,
      imageUrl: ''
    }];
  };

  // Quotation Metadata State
  const [quoteNumber, setQuoteNumber] = useState(
    initialQuotation?.quoteNumber || `QUO/2026/${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [date, setDate] = useState(initialQuotation?.date || new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(
    initialQuotation?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  // Default currency is Rupee (₹)
  const [currencySymbol, setCurrencySymbol] = useState<string>(initialQuotation?.currencySymbol || '₹');

  // Company Header Info State - Official Locked Company Header
  const companyName = 'Kamlawati';
  const companySubtitle = 'SYMBOL OF TRUST';
  const companyAddressLine1 = '1st Floor Office No11, Shweta Heights, kanakia Road,';
  const companyAddressLine2 = 'Near MBMC Water Tank, Mira Road East, Maharashtra - 401107.';
  const companyAddress = `${companyAddressLine1} ${companyAddressLine2}`;
  const companyPhone1 = '+91 99677 99270';
  const companyPhone2 = '+91 99677 99203';
  const companyPhone = `${companyPhone1} / ${companyPhone2}`;
  const companyEmail = 'info@kamlawati.com';
  const websiteUrl = 'www.kamlawati.com';
  const [logoUrl, setLogoUrl] = useState(company?.logoUrl || '');

  // Client Info State - Auto-populated from assigned work details
  const [clientCompanyName, setClientCompanyName] = useState(
    initialQuotation?.clientCompanyName || initialWork?.clientCompanyName || initialWork?.brandName || ''
  );
  const [clientContactPerson, setClientContactPerson] = useState(
    initialQuotation?.clientContactPerson || initialWork?.assignedPersonName || initialWork?.clientCompanyName || 'Client Contact'
  );
  const [clientAddress, setClientAddress] = useState(
    initialQuotation?.clientAddress || initialWork?.siteLocationAddress || initialWork?.clientAddress || ''
  );
  const [clientPhone, setClientPhone] = useState(
    initialQuotation?.clientPhone || initialWork?.clientPhone || ''
  );
  const [clientEmail, setClientEmail] = useState(
    initialQuotation?.clientEmail || initialWork?.clientEmail || ''
  );
  const [clientGst, setClientGst] = useState(
    initialQuotation?.clientGst || initialWork?.clientGst || ''
  );
  const [subject, setSubject] = useState(
    initialQuotation?.subject || (initialWork ? `Quotation for ${initialWork.workTitle}` : 'Quotation for Assigned Services')
  );

  // Line Items State - Loaded with ONLY assigned services, keeping image and amount columns blank
  const [items, setItems] = useState<QuotationLineItem[]>(() =>
    buildLineItemsForWork(initialWork, initialQuotation, availableServices)
  );

  // Payment Details & Calculations State
  const [bankName, setBankName] = useState(initialQuotation?.bankName || 'Your Bank Name');
  const [bankAccountNo, setBankAccountNo] = useState(initialQuotation?.bankAccountNo || '123456789');
  const [bankAccountName, setBankAccountName] = useState(initialQuotation?.bankAccountName || '01234567890');
  
  // Tax Type & Rate State
  const [taxType, setTaxType] = useState<'CGST_SGST' | 'IGST'>(
    initialQuotation?.taxType || 'CGST_SGST'
  );
  const [cgstRatePercent, setCgstRatePercent] = useState<number>(
    initialQuotation?.cgstRatePercent ?? 9
  );
  const [sgstRatePercent, setSgstRatePercent] = useState<number>(
    initialQuotation?.sgstRatePercent ?? 9
  );
  const [igstRatePercent, setIgstRatePercent] = useState<number>(
    initialQuotation?.igstRatePercent ?? (initialQuotation?.gstTaxRatePercent || 18)
  );

  // Discount Type & Value State
  const [discountType, setDiscountType] = useState<'PERCENT' | 'AMOUNT'>(
    initialQuotation?.discountType || 'AMOUNT'
  );
  const [discountPercent, setDiscountPercent] = useState<number>(
    initialQuotation?.discountPercent ?? 5
  );
  const [discountAmountInput, setDiscountAmountInput] = useState<number>(
    initialQuotation?.discountAmount ?? 0
  );

  // Round Off State
  const [isRoundOffEnabled, setIsRoundOffEnabled] = useState<boolean>(
    initialQuotation?.isRoundOffEnabled ?? true
  );

  const [authorizedSignatoryName, setAuthorizedSignatoryName] = useState(
    initialQuotation?.authorizedSignatoryName || 'DAVID ANDERSON'
  );
  const [authorizedSignatureUrl, setAuthorizedSignatureUrl] = useState(
    initialQuotation?.authorizedSignatureUrl || ''
  );

  const [terms, setTerms] = useState<string[]>(
    initialQuotation?.termsAndConditions || [
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      'Payment is due within 15 days of quotation date via direct bank transfer or online gateway.',
      'All revisions and design assets delivered upon 100% full quotation clearance.'
    ]
  );

  // Preview Modal Lightbox State
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);

  // Calculations Breakdown
  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Tax Calculations
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let totalTaxAmount = 0;
  let gstTaxRatePercent = 0;

  if (taxType === 'CGST_SGST') {
    gstTaxRatePercent = cgstRatePercent + sgstRatePercent;
    cgstAmount = (subtotal * cgstRatePercent) / 100;
    sgstAmount = (subtotal * sgstRatePercent) / 100;
    totalTaxAmount = cgstAmount + sgstAmount;
  } else {
    gstTaxRatePercent = igstRatePercent;
    igstAmount = (subtotal * igstRatePercent) / 100;
    totalTaxAmount = igstAmount;
  }

  // Discount Calculations
  let effectiveDiscountAmount = 0;
  let effectiveDiscountPercent = 0;

  if (discountType === 'AMOUNT') {
    effectiveDiscountAmount = discountAmountInput;
    effectiveDiscountPercent = subtotal > 0 ? (discountAmountInput / subtotal) * 100 : 0;
  } else {
    effectiveDiscountPercent = discountPercent;
    effectiveDiscountAmount = (subtotal * discountPercent) / 100;
  }

  // Unrounded Sub-total + Tax - Discount
  const unroundedTotal = subtotal + totalTaxAmount - effectiveDiscountAmount;

  // Round Off Calculation
  let grandTotal = unroundedTotal;
  let roundOffAmount = 0;

  if (isRoundOffEnabled) {
    grandTotal = Math.round(unroundedTotal);
    roundOffAmount = grandTotal - unroundedTotal;
  }

  // Item Handler
  const handleItemChange = (id: string, field: keyof QuotationLineItem, val: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === 'quantity' || field === 'rate') {
          const q = field === 'quantity' ? Number(val) : Number(item.quantity);
          const r = field === 'rate' ? Number(val) : Number(item.rate);
          updated.amount = q * r;
        }
        return updated;
      })
    );
  };

  const handleImageUploadForItem = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImageFile(file).then((dataUrl) => {
      handleItemChange(id, 'imageUrl', dataUrl);
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImageFile(file).then((dataUrl) => {
      setLogoUrl(dataUrl);
    });
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressImageFile(file).then((dataUrl) => {
      setAuthorizedSignatureUrl(dataUrl);
    });
  };

  const handleWorkChange = (workId: string) => {
    setSelectedWorkId(workId);
    const selected = availableWorks.find(w => w.id === workId);
    if (selected) {
      setClientCompanyName(selected.clientCompanyName || selected.brandName || '');
      setClientContactPerson(selected.assignedPersonName || selected.clientCompanyName || 'Client Contact');
      setClientAddress(selected.siteLocationAddress || selected.clientAddress || '');
      setClientPhone(selected.clientPhone || '');
      setClientEmail(selected.clientEmail || '');
      setClientGst(selected.clientGst || '');
      setSubject(`Quotation for ${selected.workTitle}`);
      setItems(buildLineItemsForWork(selected, undefined, availableServices));
    }
  };

  const addItemRow = () => {
    const newItem: QuotationLineItem = {
      id: Date.now().toString(),
      itemTitle: 'Additional Assigned Service',
      description: 'Provide service description and scope details...',
      quantity: 1,
      unit: 'Job',
      rate: 0,
      amount: 0,
      imageUrl: ''
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItemRow = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const constructQuotePayload = (): Quotation => {
    return {
      id: initialQuotation?.id || `quote_${Date.now()}`,
      quoteNumber,
      date,
      validUntil,
      currencySymbol,
      clientCompanyName,
      clientContactPerson,
      clientAddress,
      clientPhone,
      clientEmail,
      clientGst,
      subject,
      items,
      subtotal,
      taxType,
      gstTaxRatePercent,
      taxAmount: totalTaxAmount,
      igstRatePercent,
      igstAmount,
      cgstRatePercent,
      cgstAmount,
      sgstRatePercent,
      sgstAmount,
      discountType,
      discountPercent: effectiveDiscountPercent,
      discountAmount: effectiveDiscountAmount,
      isRoundOffEnabled,
      roundOffAmount,
      totalAmount: grandTotal,
      termsAndConditions: terms,
      preparedByCrmName: initialQuotation?.preparedByCrmName || 'CRM Team',
      status: initialQuotation?.status || 'APPROVED',
      companyAddress,
      companyPhone,
      companyEmail,
      websiteUrl,
      companyLogoUrl: logoUrl,
      bankName,
      bankAccountName,
      bankAccountNo,
      authorizedSignatoryName,
      authorizedSignatureUrl,
      pdfAttached: true
    };
  };

  const handleSave = () => {
    const quotePayload = constructQuotePayload();
    onSaveQuotation(quotePayload, selectedWorkId);
  };

  const handleExportExcel = () => {
    const quotePayload = constructQuotePayload();
    exportQuotationToExcel(quotePayload);
  };

  const formattedDate = (dStr: string) => {
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      const day = d.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} / ${months[d.getMonth()]} / ${d.getFullYear()}`;
    } catch {
      return dStr;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span>Quotation Builder Engine</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 border border-teal-300 font-mono">
                GST 18% CALC • PDF EXPORT
              </span>
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Client Work Assignment Selector */}
          {availableWorks.length > 0 && !readOnly && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-600 inline" /> Client Work:
              </label>
              <select
                value={selectedWorkId}
                onChange={(e) => handleWorkChange(e.target.value)}
                className="text-xs font-bold bg-white text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer max-w-[220px] truncate"
              >
                <option value="">-- Select Work Assignment --</option>
                {availableWorks.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.clientCompanyName || w.brandName} - {w.workTitle}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setCurrencySymbol('₹')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                currencySymbol === '₹' ? 'bg-teal-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" /> INR (₹)
            </button>
            <button
              onClick={() => setCurrencySymbol('$')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                currencySymbol === '$' ? 'bg-teal-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" /> USD ($)
            </button>
          </div>

          {/* Download PDF Button */}
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Download PDF or Print Invoice"
          >
            <Printer className="w-4 h-4 text-teal-700" /> Download PDF
          </button>

          {/* Download Excel Button */}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Download formatted Excel Spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> Download Excel
          </button>

          {!readOnly && (
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-extrabold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-md shadow-teal-700/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Quotation
            </button>
          )}
        </div>
      </div>

      {/* PRINTABLE QUOTATION PAPER CANVAS */}
      <div className="bg-white border border-slate-300 rounded-xl p-6 md:p-10 shadow-xl text-slate-800 space-y-8 font-sans print:border-none print:shadow-none print:p-0 print:m-0">
        
        {/* 1. TOP HEADER SECTION - LOCKED OFFICIAL COMPANY HEADER */}
        <div className="flex flex-wrap items-start justify-between gap-6 pb-2">
          {/* Top Left: Logo & Company Branding (Locked) */}
          <div className="flex items-center gap-3.5">
            <div className="shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Company Logo"
                  className="w-16 h-16 object-contain rounded-xl border border-slate-200 p-1"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#0052cc] flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                  <span>K</span>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-black text-[#0052cc] tracking-wider uppercase font-sans">
                {companyName}
              </h1>
              <p className="text-xs font-bold text-[#0052cc]/80 tracking-widest uppercase pt-0.5">
                {companySubtitle}
              </p>
            </div>
          </div>

          {/* Top Right: Company Contact Details Stack (Locked) */}
          <div className="space-y-2 text-xs text-slate-600 font-medium">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#0052cc] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div className="font-semibold text-slate-700 leading-tight">
                <p>{companyPhone1}</p>
                <p>{companyPhone2}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#0052cc] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-700">{companyEmail}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#0052cc] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-700">{websiteUrl}</span>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#0052cc] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="font-semibold text-slate-700 max-w-xs leading-snug">
                <p>{companyAddressLine1}</p>
                <p>{companyAddressLine2}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Solid Blue Separator Line with Left Accent Notch */}
        <div className="relative">
          <div className="h-[3px] bg-[#0052cc] w-full rounded-full" />
          <div className="absolute left-0 -top-1 w-28 h-2 bg-[#0052cc] rounded-r-lg" />
        </div>

        {/* 2. CLIENT & QUOTATION META ROW */}
        <div className="flex flex-wrap items-start justify-between gap-8 pt-2">
          {/* Left Column: Client Info */}
          <div className="space-y-2 max-w-md">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              QUOTATION FOR
            </div>
            
            {readOnly ? (
              <h2 className="text-2xl font-black text-[#0052cc] tracking-tight uppercase">
                {clientCompanyName}
              </h2>
            ) : (
              <input
                type="text"
                value={clientCompanyName}
                onChange={(e) => setClientCompanyName(e.target.value)}
                placeholder="CLIENT NAME"
                className="text-2xl font-black text-[#0052cc] tracking-tight uppercase bg-transparent border-b border-slate-300 focus:border-[#0052cc] focus:outline-none w-full"
              />
            )}

            <div className="text-xs text-slate-600 leading-relaxed space-y-1 pt-1 font-medium">
              {readOnly ? (
                <>
                  <p>{clientAddress}</p>
                  <p><strong className="text-slate-800">Contact:</strong> {clientContactPerson}</p>
                  <p><strong className="text-slate-800">P.:</strong> {clientPhone} | <strong className="text-slate-800">E.:</strong> {clientEmail}</p>
                  {clientGst && <p><strong className="text-slate-800">GSTIN:</strong> {clientGst}</p>}
                </>
              ) : (
                <>
                  <textarea
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    rows={2}
                    placeholder="Client Corporate / Site Location Address"
                    className="w-full text-xs text-slate-600 bg-transparent border border-slate-200 rounded p-1.5 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={clientContactPerson}
                      onChange={(e) => setClientContactPerson(e.target.value)}
                      placeholder="Contact Person"
                      className="text-xs bg-transparent border-b border-slate-200 p-0.5 focus:outline-none font-bold"
                    />
                    <input
                      type="text"
                      value={clientGst}
                      onChange={(e) => setClientGst(e.target.value)}
                      placeholder="GSTIN Number"
                      className="text-xs bg-transparent border-b border-slate-200 p-0.5 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Phone"
                      className="w-1/2 text-xs bg-transparent border-b border-slate-200 p-0.5 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="Email"
                      className="w-1/2 text-xs bg-transparent border-b border-slate-200 p-0.5 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Title, Quote #, Total Due, Date */}
          <div className="text-right space-y-4 min-w-[260px]">
            <div>
              <h1 className="text-5xl font-black tracking-wider text-[#0052cc] uppercase">
                QUOTATION
              </h1>
              <div className="text-xs font-mono font-bold text-slate-600 tracking-wider pt-1">
                {readOnly ? (
                  <span># {quoteNumber}</span>
                ) : (
                  <input
                    type="text"
                    value={quoteNumber}
                    onChange={(e) => setQuoteNumber(e.target.value)}
                    className="text-right font-mono font-bold text-slate-700 bg-transparent border-b border-slate-300 focus:outline-none"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-left border-b-2 border-slate-900 pb-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Due:
                </div>
                <div className="text-sm font-extrabold text-[#0052cc]">
                  {currencySymbol}{grandTotal.toFixed(2)}
                </div>
              </div>

              <div className="text-right border-b-2 border-slate-900 pb-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Quotation Date:
                </div>
                <div className="text-xs font-bold text-slate-900 pt-0.5">
                  {readOnly ? (
                    formattedDate(date)
                  ) : (
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="text-xs font-bold text-slate-900 bg-transparent border-none focus:outline-none text-right cursor-pointer"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ITEMIZED PRICING TABLE WITH IMAGE COLUMN */}
        <div className="space-y-2 pt-2">
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="text-xs font-black uppercase tracking-wider">
                  <th className="p-3.5 bg-[#0052cc] text-white w-[42%]">
                    ITEM DESCRIPTION
                  </th>
                  <th className="p-3.5 bg-white text-[#0052cc] text-center w-[15%] border-y border-slate-300">
                    UNIT PRICE
                  </th>
                  <th className="p-3.5 bg-white text-[#0052cc] text-center w-[11%] border-y border-slate-300">
                    QTY
                  </th>
                  <th className="p-3.5 bg-white text-[#0052cc] text-center w-[16%] border-y border-slate-300">
                    TOTAL
                  </th>
                  <th className="p-3.5 bg-white text-[#0052cc] text-center w-[16%] border-y border-slate-300 border-r border-slate-300">
                    IMAGE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0052cc]/20 bg-white">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Item Description & Subtitle */}
                    <td className="p-4 align-top">
                      {readOnly ? (
                        <div>
                          <h4 className="font-extrabold text-[#0052cc] text-sm">
                            {item.itemTitle || item.description}
                          </h4>
                          {item.itemTitle && (
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                              {item.description}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={item.itemTitle || ''}
                            onChange={(e) => handleItemChange(item.id, 'itemTitle', e.target.value)}
                            placeholder="Item Heading (e.g. Web Development)"
                            className="w-full font-extrabold text-[#0052cc] text-sm bg-transparent border-b border-slate-200 focus:border-[#0052cc] focus:outline-none"
                          />
                          <textarea
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            rows={2}
                            placeholder="Detailed description / scope"
                            className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-[#0052cc]"
                          />
                        </div>
                      )}
                    </td>

                    {/* Unit Price */}
                    <td className="p-4 align-top text-center font-extrabold text-[#0052cc] text-sm">
                      {readOnly ? (
                        `${currencySymbol}${Number(item.rate).toFixed(2)}`
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-slate-400 font-normal">{currencySymbol}</span>
                          <input
                            type="number"
                            value={item.rate === 0 ? '' : item.rate}
                            onChange={(e) => handleItemChange(item.id, 'rate', e.target.value === '' ? 0 : Number(e.target.value))}
                            placeholder="0.00"
                            className="w-20 text-center font-bold border border-slate-200 rounded p-1 text-xs focus:ring-1 focus:ring-[#0052cc] focus:outline-none bg-slate-50/50"
                          />
                        </div>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="p-4 align-top text-center font-extrabold text-[#0052cc] text-sm">
                      {readOnly ? (
                        item.quantity
                      ) : (
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          className="w-14 text-center font-bold border border-slate-200 rounded p-1 text-xs"
                        />
                      )}
                    </td>

                    {/* Total Amount */}
                    <td className="p-4 align-top text-center font-extrabold text-[#0052cc] text-sm">
                      {currencySymbol}{Number(item.amount).toFixed(2)}
                    </td>

                    {/* IMAGE Preview & Upload Option */}
                    <td className="p-3 align-top text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        {item.imageUrl ? (
                          <div className="relative group/img w-20 h-14 rounded-lg border border-slate-300 overflow-hidden shadow-xs bg-slate-100">
                            <img
                              src={item.imageUrl}
                              alt={item.itemTitle || 'Item image'}
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                            />
                            <button
                              onClick={() => setActivePreviewImage(item.imageUrl || null)}
                              className="absolute inset-0 bg-slate-900/40 text-white opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                              title="Click to Expand Image"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-20 h-14 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}

                        {!readOnly && (
                          <div className="flex items-center gap-1 print:hidden">
                            <label className="text-[10px] font-bold text-[#0052cc] hover:text-[#0052cc]/80 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded cursor-pointer transition-colors border border-blue-200">
                              {item.imageUrl ? 'Change' : '+ Image'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUploadForItem(item.id, e)}
                              />
                            </label>
                            {items.length > 1 && (
                              <button
                                onClick={() => removeItemRow(item.id)}
                                className="text-red-400 hover:text-red-600 p-0.5"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!readOnly && (
            <button
              onClick={addItemRow}
              className="text-xs font-bold text-[#0052cc] hover:text-[#0052cc]/80 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer print:hidden shadow-2xs"
            >
              <Plus className="w-4 h-4" /> Add Item Line Row
            </button>
          )}
        </div>

        {/* 4. SUMMARY & PAYMENT METHOD SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Left Box: Payment Method Details */}
          <div className="space-y-3 text-xs">
            <h3 className="font-extrabold text-[#0052cc] uppercase tracking-wider">
              PAYMENT METHOD
            </h3>

            <div className="space-y-2.5 text-slate-700 font-medium bg-slate-50/80 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">By Bank</p>
                <div className="space-y-0.5 text-slate-600 pt-1">
                  <p>Bank Name : <span className="font-bold text-slate-800">{bankName}</span></p>
                  <p>Bank Account : <span className="font-bold text-slate-800">{bankAccountNo}</span></p>
                  <p>Account No : <span className="font-bold text-slate-800">{bankAccountName}</span></p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <p className="font-bold text-slate-900">By Online</p>
                <p className="text-slate-600">Website : <span className="font-bold text-slate-800">{websiteUrl}</span></p>
                <p className="text-slate-500 italic">Payment : You can make payment using online</p>
              </div>
            </div>
          </div>

          {/* Right Box: Calculations Breakdown & Grand Total Banner */}
          <div className="space-y-3 text-xs">
            {/* Tax Calculation Mode Selector (Edit mode only) */}
            {!readOnly && (
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 print:hidden">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tax Type:</span>
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setTaxType('CGST_SGST')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      taxType === 'CGST_SGST' ? 'bg-[#0052cc] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    CGST + SGST
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaxType('IGST')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      taxType === 'IGST' ? 'bg-[#0052cc] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    IGST
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2.5 border-b border-slate-200 pb-3">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-bold text-slate-700">Sub Total</span>
                <span className="font-extrabold text-[#0052cc]">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>

              {/* Tax Rows Breakdown */}
              {taxType === 'CGST_SGST' ? (
                <>
                  <div className="flex justify-between items-center text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-700">CGST</span>
                      {!readOnly ? (
                        <div className="flex items-center text-[10px] text-slate-500 font-normal">
                          (<input
                            type="number"
                            value={cgstRatePercent}
                            onChange={(e) => setCgstRatePercent(Number(e.target.value))}
                            className="w-10 text-center border border-slate-200 rounded text-xs p-0.5 mx-0.5 font-bold text-slate-800"
                          />%)
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">({cgstRatePercent}%)</span>
                      )}
                    </div>
                    <span className="font-bold text-slate-900">+{currencySymbol}{cgstAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-slate-700">SGST</span>
                      {!readOnly ? (
                        <div className="flex items-center text-[10px] text-slate-500 font-normal">
                          (<input
                            type="number"
                            value={sgstRatePercent}
                            onChange={(e) => setSgstRatePercent(Number(e.target.value))}
                            className="w-10 text-center border border-slate-200 rounded text-xs p-0.5 mx-0.5 font-bold text-slate-800"
                          />%)
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">({sgstRatePercent}%)</span>
                      )}
                    </div>
                    <span className="font-bold text-slate-900">+{currencySymbol}{sgstAmount.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-slate-700">IGST</span>
                    {!readOnly ? (
                      <div className="flex items-center text-[10px] text-slate-500 font-normal">
                        (<input
                          type="number"
                          value={igstRatePercent}
                          onChange={(e) => setIgstRatePercent(Number(e.target.value))}
                          className="w-10 text-center border border-slate-200 rounded text-xs p-0.5 mx-0.5 font-bold text-slate-800"
                        />%)
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">({igstRatePercent}%)</span>
                    )}
                  </div>
                  <span className="font-bold text-slate-900">+{currencySymbol}{igstAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Discount Row (Full Rupees Support) */}
              <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-700">Discount</span>
                  {!readOnly && (
                    <div className="inline-flex rounded border border-slate-200 bg-slate-100 p-0.5 text-[10px] font-bold print:hidden">
                      <button
                        type="button"
                        onClick={() => setDiscountType('AMOUNT')}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          discountType === 'AMOUNT' ? 'bg-[#0052cc] text-white' : 'text-slate-600'
                        }`}
                        title="Enter Discount in Rupees"
                      >
                        ₹ Amount
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType('PERCENT')}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          discountType === 'PERCENT' ? 'bg-[#0052cc] text-white' : 'text-slate-600'
                        }`}
                        title="Enter Discount in Percent %"
                      >
                        % Percent
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-red-600 font-bold">
                  {!readOnly ? (
                    discountType === 'AMOUNT' ? (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 font-normal">{currencySymbol}</span>
                        <input
                          type="number"
                          value={discountAmountInput === 0 ? '' : discountAmountInput}
                          onChange={(e) => setDiscountAmountInput(e.target.value === '' ? 0 : Number(e.target.value))}
                          placeholder="0.00"
                          className="w-24 text-right border border-slate-200 rounded text-xs p-0.5 font-bold text-red-600 focus:outline-none focus:ring-1 focus:ring-[#0052cc] bg-slate-50/50"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(Number(e.target.value))}
                          className="w-12 text-center border border-slate-200 rounded text-xs p-0.5 font-bold text-slate-800"
                        />
                        <span className="text-xs text-slate-500">%</span>
                      </div>
                    )
                  ) : null}
                  <span className="font-extrabold">-{currencySymbol}{effectiveDiscountAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Round Off Row */}
              <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-dashed border-slate-200">
                <div className="flex items-center gap-1.5">
                  {!readOnly && (
                    <input
                      type="checkbox"
                      checked={isRoundOffEnabled}
                      onChange={(e) => setIsRoundOffEnabled(e.target.checked)}
                      className="rounded text-[#0052cc] focus:ring-[#0052cc] cursor-pointer print:hidden"
                      title="Toggle Round Off"
                    />
                  )}
                  <span className="font-medium text-slate-700">Round Off</span>
                </div>
                <span className={`font-bold font-mono ${roundOffAmount >= 0 ? 'text-slate-700' : 'text-slate-600'}`}>
                  {roundOffAmount >= 0 ? '+' : ''}{currencySymbol}{roundOffAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* GRAND TOTAL Banner Bar (Matching Kamlawati dual-box style) */}
            <div className="flex items-stretch rounded-lg overflow-hidden border-2 border-[#0052cc] shadow-xs">
              <div className="bg-white text-[#0052cc] font-black tracking-wider uppercase px-5 py-2.5 flex items-center justify-center flex-1 text-xs">
                GRAND TOTAL
              </div>
              <div className="bg-[#0052cc] text-white font-black text-xl px-7 py-2.5 flex items-center justify-center tracking-tight">
                {currencySymbol}{grandTotal.toFixed(2)}
              </div>
            </div>

            {/* Authorized Signatory Block */}
            <div className="pt-6 text-right space-y-1">
              <div className="text-xs text-slate-500 font-medium">Authorized Signatory</div>
              <div className="font-extrabold text-[#0052cc] text-sm uppercase">
                {readOnly ? (
                  authorizedSignatoryName
                ) : (
                  <input
                    type="text"
                    value={authorizedSignatoryName}
                    onChange={(e) => setAuthorizedSignatoryName(e.target.value)}
                    className="text-right font-extrabold text-[#0052cc] text-sm bg-transparent border-b border-slate-200 focus:outline-none"
                  />
                )}
              </div>

              {/* Signature Graphic / Uploaded Signature */}
              <div className="pt-2 flex justify-end">
                {authorizedSignatureUrl ? (
                  <img src={authorizedSignatureUrl} alt="Signature" className="h-10 object-contain" />
                ) : (
                  <div className="font-serif italic text-2xl text-slate-800 tracking-wider font-bold">
                    {authorizedSignatoryName.split(' ')[0]} Anderson
                  </div>
                )}
              </div>

              {!readOnly && (
                <div className="pt-1 print:hidden">
                  <label className="text-[10px] text-[#0052cc] hover:underline cursor-pointer">
                    + Upload Custom Signature Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. FOOTER & TERMS SECTION */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-[#0052cc] tracking-tight font-sans">
              Thank you for your business!
            </h3>
          </div>

          <div className="space-y-1">
            <h4 className="font-extrabold text-[#0052cc] uppercase tracking-wider">
              Terms & Conditions
            </h4>
            <div className="text-slate-500 space-y-1 leading-relaxed">
              {terms.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Solid Blue Bottom Accent Line */}
        <div className="pt-2">
          <div className="h-2 bg-[#0052cc] w-full rounded-full" />
        </div>

      </div>

      {/* Lightbox Modal for Image Preview */}
      {activePreviewImage && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActivePreviewImage(null)}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-800 bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-teal-600" /> Attached Item Image Preview
            </h3>
            <div className="max-h-[70vh] overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center">
              <img src={activePreviewImage} alt="Attachment" className="max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
