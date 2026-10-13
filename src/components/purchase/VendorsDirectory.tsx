import React, { useState } from 'react';
import { Vendor, VendorItem, UserAccount } from '../../types';
import { FileUploadBox } from './FileUploadBox';
import { 
  Building2, Phone, Mail, MapPin, Star, ShieldCheck, Tag, 
  Search, Filter, Plus, FileText, ChevronRight, Eye, Sparkles,
  Layers, Package, Check, ArrowUpRight, DollarSign, X, Share2,
  FileCheck, Download, Trash2, Edit3, Paperclip
} from 'lucide-react';

interface VendorsDirectoryProps {
  vendors: Vendor[];
  currentUser: UserAccount;
  onSaveVendors: (vendors: Vendor[]) => void;
  onSelectVendorForRFQ?: (vendor: Vendor, selectedItem?: VendorItem) => void;
}

export const VendorsDirectory: React.FC<VendorsDirectoryProps> = ({
  vendors,
  currentUser,
  onSaveVendors,
  onSelectVendorForRFQ
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>('ALL');
  
  // Interactive Popup State: Dropdown / Modal for Selected Vendor & Items
  const [selectedVendorForModal, setSelectedVendorForModal] = useState<Vendor | null>(null);
  const [selectedVendorDropdownId, setSelectedVendorDropdownId] = useState<string>(vendors[0]?.id || '');
  
  // Add Vendor Modal
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCategory, setNewCategory] = useState('ACP & Sheet Metal');
  const [newVendorFor, setNewVendorFor] = useState('ACP Sheets, Cladding Panels & Extrusions');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('Mumbai');
  const [newGstin, setNewGstin] = useState('');
  const [newPriceTier, setNewPriceTier] = useState<'ECONOMY' | 'STANDARD' | 'PREMIUM' | 'HEAVY_INDUSTRIAL'>('STANDARD');
  const [newPriceRangeText, setNewPriceRangeText] = useState('₹1,000 - ₹5,000 / Unit');
  const [newPaymentTerms, setNewPaymentTerms] = useState('30 Days Net Credit');
  const [newRemarks, setNewRemarks] = useState('');
  const [newCatalogDoc, setNewCatalogDoc] = useState<{ name: string; url: string; size?: string } | null>(null);

  // New Item addition inside modal
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('Sheets');
  const [newItemMinPrice, setNewItemMinPrice] = useState('');
  const [newItemMaxPrice, setNewItemMaxPrice] = useState('');
  const [newItemFinalPrice, setNewItemFinalPrice] = useState('');
  const [newItemProcessDetails, setNewItemProcessDetails] = useState('');
  const [newItemMoq, setNewItemMoq] = useState('10 Units');
  const [newItemLeadTime, setNewItemLeadTime] = useState('2');

  const categories = ['ALL', 'ACP & Sheet Metal', 'Acrylic & Vinyl', 'LED & Electricals', 'Hardware & Fasteners', 'Structural Steel & MS', 'Paints & Coatings'];

  // Fast Vendor Presets
  const VENDOR_TEMPLATES = [
    {
      company: 'Aludecor & Eurobond ACP Depot',
      contact: 'Rajesh Shah',
      category: 'ACP & Sheet Metal',
      vendorFor: 'ACP Sheets, Cladding Panels & Extrusions',
      phone: '+91 98201 54321',
      email: 'sales@aludecorwest.in',
      address: 'Gala 14, Western Express Industrial Hub, Goregaon East, Mumbai',
      priceTier: 'PREMIUM' as const,
      priceRange: '₹1,800 - ₹4,500 / Sheet',
      terms: '30 Days Net Credit, MTC Test Report Included',
      gst: '27AAACA9921D1Z4'
    },
    {
      company: 'SignTech LED & Power Systems',
      contact: 'Amit Sharma',
      category: 'LED & Electricals',
      vendorFor: 'Signage LED Modules, Power Supplies & Drivers',
      phone: '+91 98920 87654',
      email: 'orders@signtechled.com',
      address: 'Shop 4, Lamington Road Electronics Market, Mumbai',
      priceTier: 'STANDARD' as const,
      priceRange: '₹24 - ₹2,200 / Piece',
      terms: '15 Days Credit / 5 Years Warranty',
      gst: '27AABCS4412K1Z9'
    },
    {
      company: 'Virgo & Asian Acrylic World',
      contact: 'Ketan Patel',
      category: 'Acrylic & Vinyl',
      vendorFor: 'Cast Acrylic Sheets, 3M Vinyl & Diffuser Panels',
      phone: '+91 98199 43210',
      email: 'info@acrylicworld.co.in',
      address: 'Plot 22, Khetwadi Main Road, Girgaon, Mumbai',
      priceTier: 'STANDARD' as const,
      priceRange: '₹2,500 - ₹6,800 / Sheet',
      terms: '50% Advance, Balance on Delivery',
      gst: '27AADCA1190N1Z2'
    }
  ];

  const handleApplyVendorTemplate = (tmpl: typeof VENDOR_TEMPLATES[0]) => {
    setNewCompanyName(tmpl.company);
    setNewVendorName(tmpl.contact);
    setNewCategory(tmpl.category);
    setNewVendorFor(tmpl.vendorFor);
    setNewPhone(tmpl.phone);
    setNewEmail(tmpl.email);
    setNewAddress(tmpl.address);
    setNewPriceTier(tmpl.priceTier);
    setNewPriceRangeText(tmpl.priceRange);
    setNewPaymentTerms(tmpl.terms);
    setNewGstin(tmpl.gst);
    setNewCatalogDoc(null);
  };

  const handleCategoryChangeForNewVendor = (cat: string) => {
    setNewCategory(cat);
    if (cat === 'ACP & Sheet Metal') setNewVendorFor('ACP Sheets, Cladding Panels & Extrusions');
    else if (cat === 'Acrylic & Vinyl') setNewVendorFor('Cast Acrylic Sheets, 3M Vinyl & Diffuser Panels');
    else if (cat === 'LED & Electricals') setNewVendorFor('Signage LED Modules, Power Supplies & Drivers');
    else if (cat === 'Hardware & Fasteners') setNewVendorFor('SS Anchor Bolts, TEK Screws & Signage Fasteners');
    else if (cat === 'Structural Steel & MS') setNewVendorFor('MS Hollow Pipes, Structural Angles & Base Plates');
    else if (cat === 'Paints & Coatings') setNewVendorFor('PU Enamel, Zinc Primer & Powder Coating Powder');
    else setNewVendorFor(`${cat} Material Supply`);
  };

  const filteredVendors = vendors.filter(v => {
    if (selectedCategory !== 'ALL' && v.category !== selectedCategory) return false;
    if (selectedPriceTier !== 'ALL' && v.priceTier !== selectedPriceTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesVendor = 
        v.companyName.toLowerCase().includes(q) || 
        v.name.toLowerCase().includes(q) || 
        v.category.toLowerCase().includes(q) || 
        (v.vendorFor && v.vendorFor.toLowerCase().includes(q)) ||
        v.city.toLowerCase().includes(q);
      const matchesItems = v.items?.some(it => it.name.toLowerCase().includes(q) || it.processDetails.toLowerCase().includes(q));
      return matchesVendor || matchesItems;
    }
    return true;
  });

  const handleDropdownSelectVendor = (vendorId: string) => {
    setSelectedVendorDropdownId(vendorId);
    const found = vendors.find(v => v.id === vendorId);
    if (found) {
      setSelectedVendorForModal(found);
    }
  };

  const handleSendWhatsAppInquiry = (vendor: Vendor) => {
    const text = encodeURIComponent(
      `*REQUEST FOR QUOTATION (RFQ) / INQUIRY*\n` +
      `*To:* ${vendor.companyName} (Attn: ${vendor.name})\n` +
      `*Category:* ${vendor.category}\n\n` +
      `Hello, we are looking for current dispatch rates and stock availability for our active architectural signage project. Please share your updated price sheet.\nThank you.`
    );
    window.open(`https://api.whatsapp.com/send?phone=${vendor.phone.replace(/[^0-9]/g, '')}&text=${text}`, '_blank');
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName || !newPhone) {
      alert('Please fill in Company Name and Phone Number');
      return;
    }

    const created: Vendor = {
      id: `v_${Date.now()}`,
      name: newVendorName || 'Proprietor',
      companyName: newCompanyName,
      category: newCategory,
      vendorFor: newVendorFor || `${newCategory} Specialized Supply`,
      phone: newPhone,
      email: newEmail,
      address: newAddress || 'Industrial Area, Mumbai',
      city: newCity,
      gstin: newGstin || '27AAACL0000A1Z1',
      priceTier: newPriceTier,
      priceRangeText: newPriceRangeText,
      rating: 4.8,
      paymentTerms: newPaymentTerms,
      verified: true,
      remarks: newRemarks,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: `vi_${Date.now()}_1`,
          name: `${newCategory} Standard Prime Specification`,
          category: newCategory,
          unit: 'Unit',
          priceRangeMin: 1000,
          priceRangeMax: 4500,
          finalPrice: 2200,
          taxRatePct: 18,
          processDetails: 'Standard grade material with manufacturer test certification & GST invoice.',
          moq: '5 Units',
          leadTimeDays: 2
        }
      ]
    };

    onSaveVendors([created, ...vendors]);
    setShowAddVendorModal(false);
    
    // Reset Form
    setNewCompanyName('');
    setNewVendorName('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setNewRemarks('');
    setNewCatalogDoc(null);
  };

  const handleAddItemToVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForModal || !newItemName || !newItemFinalPrice) return;

    const newItem: VendorItem = {
      id: `vi_${Date.now()}`,
      name: newItemName,
      category: selectedVendorForModal.category,
      unit: newItemUnit,
      priceRangeMin: Number(newItemMinPrice) || (Number(newItemFinalPrice) * 0.9),
      priceRangeMax: Number(newItemMaxPrice) || (Number(newItemFinalPrice) * 1.2),
      finalPrice: Number(newItemFinalPrice),
      taxRatePct: 18,
      processDetails: newItemProcessDetails || 'Custom specification with verified technical compliance',
      moq: newItemMoq,
      leadTimeDays: Number(newItemLeadTime) || 2
    };

    const updatedVendors = vendors.map(v => {
      if (v.id === selectedVendorForModal.id) {
        return {
          ...v,
          items: [...(v.items || []), newItem]
        };
      }
      return v;
    });

    onSaveVendors(updatedVendors);
    setSelectedVendorForModal({
      ...selectedVendorForModal,
      items: [...(selectedVendorForModal.items || []), newItem]
    });

    setShowAddItemForm(false);
    setNewItemName('');
    setNewItemFinalPrice('');
    setNewItemMinPrice('');
    setNewItemMaxPrice('');
    setNewItemProcessDetails('');
  };

  return (
    <div className="space-y-6">
      
      {/* Interactive Quick Vendor Dropdown Selector Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold text-base tracking-tight text-white">Vendor Catalog & Process Details Engine</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Select any supplier to view their item catalog, verified final price list, attached brochure/catalog, and exact manufacturing/fabrication process details.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Dropdown for Selected Vendor */}
            <div className="relative flex-1 md:w-80">
              <select
                value={selectedVendorDropdownId}
                onChange={(e) => handleDropdownSelectVendor(e.target.value)}
                className="w-full bg-slate-950 border-2 border-yellow-500/70 text-yellow-300 font-bold px-3 py-2 rounded-xl text-xs focus:outline-none cursor-pointer truncate"
              >
                <option value="" disabled>-- Select Vendor to View Items --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.companyName}: [For: {v.vendorFor || v.category}]
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                const cur = vendors.find(v => v.id === selectedVendorDropdownId) || vendors[0];
                if (cur) setSelectedVendorForModal(cur);
              }}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <Eye className="w-4 h-4" /> Open Items & Process Popup
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-yellow-400 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Vendors' : cat}
            </button>
          ))}
        </div>

        {/* Search, Price Tier & Add Vendor */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor, city, items..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-44 sm:w-56 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedPriceTier}
            onChange={(e) => setSelectedPriceTier(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Price Ranges</option>
            <option value="ECONOMY">Economy Tier</option>
            <option value="STANDARD">Standard Tier</option>
            <option value="PREMIUM">Premium Grade</option>
            <option value="HEAVY_INDUSTRIAL">Heavy Industrial</option>
          </select>

          <button
            onClick={() => setShowAddVendorModal(true)}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </div>
      </div>

      {/* Vendor Cards with Brief Details & Price Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVendors.map(vendor => (
          <div 
            key={vendor.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-amber-300"
          >
            <div>
              {/* Card Header: Category & Price Tier Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-[10px] font-extrabold uppercase tracking-wide border border-slate-200">
                  {vendor.category}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    vendor.priceTier === 'PREMIUM'
                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                      : vendor.priceTier === 'ECONOMY'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {vendor.priceTier}
                  </span>
                  
                  {vendor.verified && (
                    <span className="p-1 bg-emerald-50 text-emerald-600 rounded-full" title="Verified Vendor with GST & Bank details">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>

              {/* Vendor Title & Brief Contact */}
              <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-amber-600 transition-colors">
                {vendor.companyName}
              </h4>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{vendor.name}</p>

              {/* Vendor For Column / Scope Highlight */}
              <div className="mt-2 py-1 px-2.5 bg-indigo-50/80 border border-indigo-200 rounded-lg text-indigo-900 text-[11px] font-bold flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-extrabold text-indigo-700 tracking-wider">Vendor Scope:</span>
                <span className="truncate">{vendor.vendorFor || vendor.category}</span>
              </div>

              {/* Price Range Highlight Box */}
              <div className="my-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200/70 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-amber-900 tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-amber-700" /> Price Range:
                  </span>
                  <span className="font-mono font-black text-slate-950 text-xs">{vendor.priceRangeText}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-600">
                  <span>Payment Terms:</span>
                  <span className="font-medium text-slate-800">{vendor.paymentTerms}</span>
                </div>
              </div>

              {/* Brief Contact Info */}
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{vendor.phone}</span>
                </div>
                {vendor.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-500 line-clamp-2">{vendor.address}</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>GSTIN:</strong> <span className="font-mono font-bold text-slate-700">{vendor.gstin}</span>
                </div>
              </div>

              {/* Remarks if available */}
              {vendor.remarks && (
                <p className="text-[11px] text-slate-500 italic mt-2.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  "{vendor.remarks}"
                </p>
              )}
            </div>

            {/* Bottom Actions: View Items & Process Details Popup */}
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleSendWhatsAppInquiry(vendor)}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                title="Send WhatsApp RFQ Inquiry"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedVendorForModal(vendor)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-yellow-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Items & Price Details ({vendor.items?.length || 0})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* POPUP MODAL: Selected Vendor & Items List with Final Prices & Process Details */}
      {selectedVendorForModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-start justify-between shrink-0">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-yellow-500 text-slate-950 rounded-xl font-black text-lg">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-white">{selectedVendorForModal.companyName}</h3>
                    <span className="px-2 py-0.5 bg-yellow-400 text-slate-950 text-[10px] font-black rounded uppercase">
                      {selectedVendorForModal.priceTier} TIER
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Contact: <strong>{selectedVendorForModal.name}</strong> | Ph: {selectedVendorForModal.phone} | GST: {selectedVendorForModal.gstin}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppInquiry(selectedVendorForModal)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3 h-3" /> WhatsApp
                </button>
                <button
                  onClick={() => setSelectedVendorForModal(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer text-xl font-bold"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Subheader & Vendor Terms */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-3 gap-3 text-xs shrink-0">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Category:</span>
                <p className="font-bold text-slate-800">{selectedVendorForModal.category}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Standard Price Range:</span>
                <p className="font-mono font-bold text-amber-700">{selectedVendorForModal.priceRangeText}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Payment & Delivery Terms:</span>
                <p className="font-medium text-slate-800">{selectedVendorForModal.paymentTerms}</p>
              </div>
            </div>

            {/* Items Table with Final Prices & Process Details */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-500" />
                  Item Catalog with Final Prices & Process Details ({selectedVendorForModal.items?.length || 0} Items)
                </h4>
                
                <button
                  onClick={() => setShowAddItemForm(!showAddItemForm)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddItemForm ? 'Hide Form' : 'Add Item / SKU'}
                </button>
              </div>

              {/* Add Custom Item Form */}
              {showAddItemForm && (
                <form onSubmit={handleAddItemToVendor} className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 text-xs space-y-3 animate-fadeIn">
                  <div className="font-bold text-amber-950 text-xs">Add New Item to Vendor Price List</div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block font-bold text-slate-700 mb-0.5">Item Name & Specs *</label>
                      <input
                        type="text"
                        required
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="e.g. 3mm Cast Acrylic Opal Sheet (8x4 ft)"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Unit</label>
                      <select
                        value={newItemUnit}
                        onChange={(e) => setNewItemUnit(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      >
                        <option value="Sheets">Sheets</option>
                        <option value="Lengths">Lengths</option>
                        <option value="Pieces">Pieces</option>
                        <option value="Boxes">Boxes</option>
                        <option value="Sq.Ft">Sq.Ft</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Final Quoted Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={newItemFinalPrice}
                        onChange={(e) => setNewItemFinalPrice(e.target.value)}
                        placeholder="2450"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">MOQ</label>
                      <input
                        type="text"
                        value={newItemMoq}
                        onChange={(e) => setNewItemMoq(e.target.value)}
                        placeholder="5 Sheets"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5">Lead Time (Days)</label>
                      <input
                        type="number"
                        value={newItemLeadTime}
                        onChange={(e) => setNewItemLeadTime(e.target.value)}
                        placeholder="2"
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Process & Technical Details</label>
                    <input
                      type="text"
                      value={newItemProcessDetails}
                      onChange={(e) => setNewItemProcessDetails(e.target.value)}
                      placeholder="e.g. 100% Virgin MMA casting, protective paper masking, laser-cutting grade"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddItemForm(false)}
                      className="px-3 py-1.5 bg-white text-slate-600 font-bold rounded-lg border border-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-slate-900 text-yellow-400 font-bold rounded-lg"
                    >
                      Save Item to Catalog
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {selectedVendorForModal.items?.map((item, index) => (
                  <div 
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-amber-300 transition-all space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 mr-2">#{index + 1}</span>
                        <span className="font-extrabold text-slate-900 text-sm">{item.name}</span>
                        <span className="ml-2 text-xs font-semibold text-slate-500">({item.unit})</span>
                        {item.hsnCode && (
                          <span className="ml-2 text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                            HSN: {item.hsnCode}
                          </span>
                        )}
                      </div>

                      {/* Final Price & Price Range */}
                      <div className="text-right flex items-baseline gap-3 justify-end">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 block">Catalog Price Range</span>
                          <span className="text-xs font-mono text-slate-600">₹{item.priceRangeMin} - ₹{item.priceRangeMax}</span>
                        </div>
                        <div className="bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200 text-right">
                          <span className="text-[9px] font-bold text-yellow-800 uppercase block">Final Rate</span>
                          <span className="font-mono font-black text-slate-950 text-base">₹{item.finalPrice.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Process Details - Prominently Displayed */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center gap-1.5 text-purple-900 font-extrabold text-[11px] mb-1">
                        <Layers className="w-3.5 h-3.5 text-purple-700" />
                        Fabrication & Process Specification Details:
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed font-normal">
                        {item.processDetails}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
                        {item.moq && <span><strong>MOQ:</strong> {item.moq}</span>}
                        {item.leadTimeDays && <span><strong>Lead Time:</strong> {item.leadTimeDays} Business Day(s)</span>}
                        <span><strong>Applicable Tax:</strong> {item.taxRatePct}% GST</span>
                      </div>
                    </div>

                    {/* Quick RFQ Trigger */}
                    {onSelectVendorForRFQ && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            onSelectVendorForRFQ(selectedVendorForModal, item);
                            setSelectedVendorForModal(null);
                          }}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-yellow-400 font-bold text-xs rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Select Item for Quote Shortlist
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
              <div className="text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Vendor Profile & Quality Assurance Certified
              </div>
              <button
                onClick={() => setSelectedVendorForModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Close Catalog
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Add New Vendor */}
      {showAddVendorModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Onboard New Supplier / Vendor</h3>
                <p className="text-xs text-slate-500">Register new material supplier with price range, catalog upload, and GST</p>
              </div>
              <button
                onClick={() => setShowAddVendorModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Quick Supplier Templates */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 my-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10.5px] font-extrabold uppercase text-slate-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Quick Supplier Templates:
                </span>
                <span className="text-[10px] text-slate-400">Click to fill distributor details</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {VENDOR_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyVendorTemplate(tmpl)}
                    className="px-2 py-1 bg-white hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    + {tmpl.company.slice(0, 20)}...
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddVendor} className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Firm Name *</label>
                  <input
                    type="text"
                    required
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="e.g. Royal Sheet & Metal Works"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    placeholder="e.g. Ramesh Shah (Director)"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => handleCategoryChangeForNewVendor(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="ACP & Sheet Metal">ACP & Sheet Metal</option>
                    <option value="Acrylic & Vinyl">Acrylic & Vinyl</option>
                    <option value="LED & Electricals">LED & Electricals</option>
                    <option value="Hardware & Fasteners">Hardware & Fasteners</option>
                    <option value="Structural Steel & MS">Structural Steel & MS</option>
                    <option value="Paints & Coatings">Paints & Coatings</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price Tier</label>
                  <select
                    value={newPriceTier}
                    onChange={(e: any) => setNewPriceTier(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="STANDARD">Standard Tier</option>
                    <option value="PREMIUM">Premium Quality</option>
                    <option value="ECONOMY">Economy Tier</option>
                    <option value="HEAVY_INDUSTRIAL">Heavy Industrial</option>
                  </select>
                </div>
              </div>

              {/* Vendor For Field with Quick Suggestions */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Vendor Scope (Specific Material / Service Supply Scope) *
                </label>
                <input
                  type="text"
                  required
                  value={newVendorFor}
                  onChange={(e) => setNewVendorFor(e.target.value)}
                  placeholder="e.g. ACP Sheets, Cladding Panels & Extrusions"
                  className="w-full p-2 bg-slate-50 border border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold text-slate-900"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="text-[10px] text-slate-400 font-bold self-center">Presets:</span>
                  {[
                    'ACP Sheets, Cladding Panels & Extrusions',
                    'Signage LED Modules, Power Supplies & Drivers',
                    'Cast Acrylic Sheets, 3M Vinyl & Diffuser Panels',
                    'SS Anchor Bolts, TEK Screws & Fasteners',
                    'MS Hollow Pipes & Structural Angles',
                    'PU Enamel & Industrial Coating'
                  ].map((presetScope) => (
                    <button
                      key={presetScope}
                      type="button"
                      onClick={() => setNewVendorFor(presetScope)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[10px] font-medium rounded border border-slate-200 transition-colors cursor-pointer"
                    >
                      {presetScope.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="sales@vendor.com"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={newGstin}
                    onChange={(e) => setNewGstin(e.target.value)}
                    placeholder="27AAACL1234A1Z1"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price Range Display</label>
                  <input
                    type="text"
                    value={newPriceRangeText}
                    onChange={(e) => setNewPriceRangeText(e.target.value)}
                    placeholder="e.g. ₹800 - ₹3,500 / Sheet"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address & Industrial Estate</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Plot 10, MIDC Industrial Area, Andheri East, Mumbai"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Upload Vendor Catalog / Price List File */}
              <FileUploadBox
                label="Upload Vendor Catalog / GST Certificate / Price List"
                helperText="Upload official PDF brochure, rate chart, or GST document"
                fileUrl={newCatalogDoc?.url}
                fileName={newCatalogDoc?.name}
                onFileChange={(file) => setNewCatalogDoc(file)}
                sampleOptions={[
                  { title: 'Official_Price_Catalog.pdf', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80' },
                  { title: 'GST_Registration_Cert.pdf', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80' }
                ]}
              />

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Terms & Remarks</label>
                <input
                  type="text"
                  value={newPaymentTerms}
                  onChange={(e) => setNewPaymentTerms(e.target.value)}
                  placeholder="e.g. 30 Days Net Credit / MTC Certificate Included"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-yellow-400 font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
