import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  ExternalLink,
  MessageSquare,
  BadgeCheck,
  CreditCard,
  Tag,
  Boxes,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Upload,
  Eye,
  SlidersHorizontal,
  PlusCircle
} from 'lucide-react';
import { Vendor, VendorItem, UserAccount } from '../../types';
import { Storage } from '../../lib/storage';

interface VendorMasterListProps {
  currentUser: UserAccount;
  onNavigateToRFQ?: (category?: string, vendorId?: string) => void;
  isEmbeddedOnHome?: boolean;
}

export const VendorMasterList: React.FC<VendorMasterListProps> = ({
  currentUser,
  onNavigateToRFQ,
  isEmbeddedOnHome = false
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>('ALL');
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
  const [newPan, setNewPan] = useState('');
  const [newPriceTier, setNewPriceTier] = useState<'ECONOMY' | 'STANDARD' | 'PREMIUM' | 'HEAVY_INDUSTRIAL'>('STANDARD');
  const [newPriceRangeText, setNewPriceRangeText] = useState('₹1,500 - ₹5,000 / Unit');
  const [newPaymentTerms, setNewPaymentTerms] = useState('30 Days Net Credit');
  const [newRemarks, setNewRemarks] = useState('');
  const [newCatalogDoc, setNewCatalogDoc] = useState<{ name: string; url: string; size?: string } | null>(null);

  // Add Item to Vendor Modal / Form
  const [addItemToVendor, setAddItemToVendor] = useState<Vendor | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('Sheet (8x4 ft)');
  const [newItemMinPrice, setNewItemMinPrice] = useState('');
  const [newItemMaxPrice, setNewItemMaxPrice] = useState('');
  const [newItemFinalPrice, setNewItemFinalPrice] = useState('');
  const [newItemHsn, setNewItemHsn] = useState('');
  const [newItemProcessDetails, setNewItemProcessDetails] = useState('');
  const [newItemMoq, setNewItemMoq] = useState('5 Units');
  const [newItemLeadTime, setNewItemLeadTime] = useState('2');

  const categories = [
    'ALL',
    'ACP & Sheet Metal',
    'Acrylic & Vinyl',
    'LED & Electricals',
    'Hardware & Fasteners',
    'Structural Steel & MS',
    'Paints & Coatings'
  ];

  // Quick Vendor Presets for Instant Loading
  const VENDOR_TEMPLATES = [
    {
      company: 'Aludecor & Eurobond ACP Depot',
      contact: 'Rajesh Shah',
      category: 'ACP & Sheet Metal',
      vendorFor: 'ACP Sheets, Cladding Panels & Extrusions',
      phone: '+91 98201 54321',
      email: 'sales@aludecorwest.in',
      address: 'Gala 14, Western Express Industrial Hub, Goregaon East',
      city: 'Mumbai',
      priceTier: 'PREMIUM' as const,
      priceRange: '₹1,800 - ₹4,500 / Sheet',
      terms: '30 Days Net Credit, MTC Test Report Included',
      gst: '27AAACA9921D1Z4',
      pan: 'AAACA9921D',
      remarks: 'Prime PVDF Exterior grade with certified 10-year warranty against peeling and UV discoloration.'
    },
    {
      company: 'SignTech LED & Power Systems',
      contact: 'Amit Sharma',
      category: 'LED & Electricals',
      vendorFor: 'Signage LED Modules, Power Supplies & Drivers',
      phone: '+91 98920 87654',
      email: 'orders@signtechled.com',
      address: 'Shop 4, Lamington Road Electronics Market',
      city: 'Mumbai',
      priceTier: 'STANDARD' as const,
      priceRange: '₹24 - ₹2,200 / Piece',
      terms: '15 Days Credit / 5 Years Replacement Warranty',
      gst: '27AABCS4412K1Z9',
      pan: 'AABCS4412K',
      remarks: 'IP67 Waterproof modules, Samsung lens chips, zero flickering certified power supplies.'
    },
    {
      company: 'Virgo & Asian Acrylic World',
      contact: 'Ketan Patel',
      category: 'Acrylic & Vinyl',
      vendorFor: 'Cast Acrylic Sheets, 3M Vinyl & Diffuser Panels',
      phone: '+91 98199 43210',
      email: 'info@acrylicworld.co.in',
      address: 'Plot 22, Khetwadi Main Road, Girgaon',
      city: 'Mumbai',
      priceTier: 'STANDARD' as const,
      priceRange: '₹2,500 - ₹6,800 / Sheet',
      terms: '50% Advance, Balance on Delivery',
      gst: '27AADCA1190N1Z2',
      pan: 'AADCA1190N',
      remarks: '100% Cast Virgin MMA sheets with 93% optical light transmission for 3D signage letters.'
    },
    {
      company: 'Jindal & Tata Structural Tubes Hub',
      contact: 'Vikram Malhotra',
      category: 'Structural Steel & MS',
      vendorFor: 'MS Hollow Pipes, Structural Angles & Base Plates',
      phone: '+91 97654 32109',
      email: 'supply@tatasignpipes.in',
      address: 'Plot 88, Steel Market, Kalamboli, Navi Mumbai',
      city: 'Navi Mumbai',
      priceTier: 'HEAVY_INDUSTRIAL' as const,
      priceRange: '₹72 - ₹110 / Kg',
      terms: '45 Days Corporate Credit / Weighbridge Slip Mandatory',
      gst: '27AABCT8841F1ZL',
      pan: 'AABCT8841F',
      remarks: 'Hot-dip galvanized and MS Hollow pipe sections with certified mill test certificates.'
    }
  ];

  useEffect(() => {
    const loaded = Storage.getVendors();
    setVendors(loaded);
  }, []);

  const saveVendorsList = (updated: Vendor[]) => {
    setVendors(updated);
    Storage.saveVendors(updated);
  };

  const handleApplyVendorTemplate = (tmpl: typeof VENDOR_TEMPLATES[0]) => {
    setNewCompanyName(tmpl.company);
    setNewVendorName(tmpl.contact);
    setNewCategory(tmpl.category);
    setNewVendorFor(tmpl.vendorFor);
    setNewPhone(tmpl.phone);
    setNewEmail(tmpl.email);
    setNewAddress(tmpl.address);
    setNewCity(tmpl.city);
    setNewPriceTier(tmpl.priceTier);
    setNewPriceRangeText(tmpl.priceRange);
    setNewPaymentTerms(tmpl.terms);
    setNewGstin(tmpl.gst);
    setNewPan(tmpl.pan);
    setNewRemarks(tmpl.remarks);
    setNewCatalogDoc({
      name: `${tmpl.company.slice(0, 12)}_Catalog_2026.pdf`,
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      size: '2.4 MB'
    });
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

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendWhatsAppInquiry = (vendor: Vendor) => {
    const text = encodeURIComponent(
      `*REQUEST FOR QUOTATION (RFQ) / INQUIRY*\n` +
      `*To:* ${vendor.companyName} (Attn: ${vendor.name})\n` +
      `*Service/Category:* ${vendor.category}\n\n` +
      `Hello, we are looking for current dispatch rates, test certificates, and stock availability for our active project.\nPlease share your updated price list.\nThank you.`
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
      email: newEmail || 'orders@vendor.com',
      address: newAddress || 'Industrial Hub, Mumbai',
      city: newCity || 'Mumbai',
      gstin: newGstin || '27AAACL0000A1Z1',
      panNumber: newPan || (newGstin ? newGstin.slice(2, 12) : 'AAACL0000A'),
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
          priceRangeMin: 1200,
          priceRangeMax: 4800,
          finalPrice: 2200,
          taxRatePct: 18,
          hsnCode: newCategory.includes('ACP') ? '760612' : newCategory.includes('LED') ? '854140' : '392051',
          processDetails: 'Tested grade material with manufacturer quality certificate & GST invoice.',
          moq: '5 Units',
          leadTimeDays: 2
        }
      ]
    };

    saveVendorsList([created, ...vendors]);
    setShowAddVendorModal(false);
    
    // Reset Form
    setNewCompanyName('');
    setNewVendorName('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setNewGstin('');
    setNewPan('');
    setNewRemarks('');
    setNewCatalogDoc(null);
  };

  const handleAddItemToVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addItemToVendor || !newItemName) return;

    const newItem: VendorItem = {
      id: `vi_${Date.now()}`,
      name: newItemName,
      category: addItemToVendor.category,
      unit: newItemUnit,
      priceRangeMin: Number(newItemMinPrice) || 1000,
      priceRangeMax: Number(newItemMaxPrice) || 3000,
      finalPrice: Number(newItemFinalPrice) || Number(newItemMinPrice) || 1500,
      taxRatePct: 18,
      hsnCode: newItemHsn || '760612',
      processDetails: newItemProcessDetails || 'Certified specifications with test report',
      moq: newItemMoq || '5 Units',
      leadTimeDays: Number(newItemLeadTime) || 2
    };

    const updatedVendors = vendors.map(v => {
      if (v.id === addItemToVendor.id) {
        return {
          ...v,
          items: [...(v.items || []), newItem]
        };
      }
      return v;
    });

    saveVendorsList(updatedVendors);
    setAddItemToVendor(null);
    setNewItemName('');
    setNewItemMinPrice('');
    setNewItemMaxPrice('');
    setNewItemFinalPrice('');
    setNewItemHsn('');
    setNewItemProcessDetails('');
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
        v.city.toLowerCase().includes(q) ||
        v.gstin.toLowerCase().includes(q) ||
        v.phone.includes(q);
      const matchesItems = v.items?.some(it => it.name.toLowerCase().includes(q) || it.processDetails?.toLowerCase().includes(q));
      return matchesVendor || matchesItems;
    }
    return true;
  });

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'ACP & Sheet Metal':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Acrylic & Vinyl':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'LED & Electricals':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300';
      case 'Hardware & Fasteners':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Structural Steel & MS':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'Paints & Coatings':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getTierBadgeClass = (tier: string) => {
    switch (tier) {
      case 'PREMIUM':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'HEAVY_INDUSTRIAL':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'STANDARD':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ECONOMY':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className={`space-y-6 ${isEmbeddedOnHome ? 'mt-4' : ''}`}>
      
      {/* Section Master Header */}
      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-blue-600 text-white rounded-lg font-bold shrink-0 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                  Vendor Master & Supplier Adding List
                </h3>
                <span className="text-[10px] font-bold bg-slate-800 text-blue-300 border border-slate-700 px-2.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                  {vendors.length} Approved Suppliers
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Add and manage verified suppliers with full company profiles, GSTIN & PAN details, service/material categories, agreed credit terms, live raw material price sheets, and PDF catalogs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={() => setShowAddVendorModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> + Add New Vendor
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar & Category Pills */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        
        {/* Search and Secondary Tier Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor by company, contact person, service category, item, GSTIN, or city..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                &times;
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-[11px] text-slate-500">Tier:</span>
              <select
                value={selectedPriceTier}
                onChange={(e) => setSelectedPriceTier(e.target.value)}
                className="bg-transparent font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Tiers</option>
                <option value="PREMIUM">Premium Tier</option>
                <option value="STANDARD">Standard Tier</option>
                <option value="ECONOMY">Economy Tier</option>
                <option value="HEAVY_INDUSTRIAL">Heavy Industrial</option>
              </select>
            </div>
            <span className="text-[11px] font-bold text-slate-500 px-2">
              Showing {filteredVendors.length} of {vendors.length}
            </span>
          </div>
        </div>

        {/* Service Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = cat === 'ALL' ? vendors.length : vendors.filter(v => v.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{cat === 'ALL' ? 'All Services' : cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vendor Cards List with ALL DETAILS */}
      <div className="space-y-4">
        {filteredVendors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">No Vendors Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No registered suppliers matched your filter criteria "{selectedCategory}" or search query "{searchQuery}".
            </p>
            <button
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredVendors.map((vendor) => {
            const isExpanded = expandedVendorId === vendor.id;
            return (
              <div 
                key={vendor.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main Card Header Bar */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100">
                  
                  {/* Left: Company & Contact Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-2xs">
                      {vendor.companyName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-extrabold text-base text-slate-900 tracking-tight">
                          {vendor.companyName}
                        </h4>
                        {vendor.verified && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black rounded-md flex items-center gap-1">
                            <BadgeCheck className="w-3 h-3 text-emerald-600" /> GST Verified
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-md border ${getCategoryBadgeClass(vendor.category)}`}>
                          {vendor.category}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${getTierBadgeClass(vendor.priceTier)}`}>
                          {vendor.priceTier}
                        </span>
                      </div>
                      
                      {/* Prominent Vendor For Details Row */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 my-1 bg-indigo-50 border border-indigo-200/80 rounded-md text-xs text-indigo-950 font-bold">
                        <Tag className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span className="text-[10px] uppercase font-extrabold text-indigo-600 tracking-wider">Vendor For:</span>
                        <span>{vendor.vendorFor || vendor.category}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">
                          Contact: <strong>{vendor.name}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {vendor.city} • {vendor.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
                    <button
                      onClick={() => handleSendWhatsAppInquiry(vendor)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      title="Send instant WhatsApp Inquiry to Vendor"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp RFQ
                    </button>
                    <a
                      href={`tel:${vendor.phone}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" /> Call
                    </a>
                    {onNavigateToRFQ && (
                      <button
                        onClick={() => onNavigateToRFQ(vendor.category, vendor.id)}
                        className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> Create RFQ
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedVendorId(isExpanded ? null : vendor.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'Full Details'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 4 Key Attribute Snapshot Blocks */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/70 text-xs border-b border-slate-100">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-0.5">
                      GSTIN & PAN Details
                    </span>
                    <div className="flex items-center justify-between font-mono font-bold text-slate-900 text-[11px]">
                      <span>{vendor.gstin}</span>
                      <button
                        onClick={() => handleCopyText(vendor.gstin, `gst_${vendor.id}`)}
                        className="text-slate-400 hover:text-indigo-600 p-0.5"
                        title="Copy GSTIN"
                      >
                        {copiedId === `gst_${vendor.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    {vendor.panNumber && (
                      <span className="text-[10px] text-slate-500 font-mono">PAN: {vendor.panNumber}</span>
                    )}
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-0.5">
                      Payment & Credit Terms
                    </span>
                    <p className="font-bold text-slate-900 truncate" title={vendor.paymentTerms}>
                      {vendor.paymentTerms}
                    </p>
                    <span className="text-[10px] text-slate-500 font-medium">Standard Billing Cycle</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-0.5">
                      Price Range
                    </span>
                    <p className="font-bold text-indigo-900 font-mono">
                      {vendor.priceRangeText}
                    </p>
                    <span className="text-[10px] text-slate-500 font-medium">{vendor.items?.length || 0} Catalog Items Listed</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-0.5">
                      Contact & Email
                    </span>
                    <p className="font-bold text-slate-900 truncate">
                      {vendor.phone}
                    </p>
                    <a href={`mailto:${vendor.email}`} className="text-[10px] text-indigo-600 hover:underline truncate block">
                      {vendor.email}
                    </a>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="p-5 bg-white space-y-4 animate-in slide-in-from-top-2 duration-150 border-t border-slate-100">
                    
                    {/* Quality Remarks / Notes */}
                    {vendor.remarks && (
                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950">
                        <span className="font-extrabold uppercase text-[10px] tracking-wider text-amber-800 block mb-0.5">
                          Quality Guarantee & Remarks:
                        </span>
                        <p className="font-medium leading-relaxed">{vendor.remarks}</p>
                      </div>
                    )}

                    {/* Catalog Items / Material Rate Sheet */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Boxes className="w-4 h-4 text-indigo-600" />
                          Material Rate Sheet & Catalog ({vendor.items?.length || 0} Products)
                        </h5>
                        <button
                          onClick={() => setAddItemToVendor(vendor)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-[11px] rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Add Material / Process
                        </button>
                      </div>

                      {vendor.items && vendor.items.length > 0 ? (
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                                <th className="p-2.5">Item / Material Name</th>
                                <th className="p-2.5">Unit</th>
                                <th className="p-2.5">HSN Code</th>
                                <th className="p-2.5">Standard Rate (₹)</th>
                                <th className="p-2.5">MOQ & Lead Time</th>
                                <th className="p-2.5">Specifications / Process</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {vendor.items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="p-2.5 font-bold text-slate-900">{item.name}</td>
                                  <td className="p-2.5 text-slate-600">{item.unit}</td>
                                  <td className="p-2.5 font-mono text-[11px] text-slate-500">{item.hsnCode || 'N/A'}</td>
                                  <td className="p-2.5 font-mono font-bold text-indigo-900">
                                    ₹{item.finalPrice?.toLocaleString('en-IN')}
                                    {item.priceRangeMin && item.priceRangeMax && (
                                      <span className="block text-[10px] text-slate-400 font-normal">
                                        Range: ₹{item.priceRangeMin} - ₹{item.priceRangeMax}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-slate-700">
                                    <span className="font-semibold">{item.moq || '1 Unit'}</span>
                                    <span className="block text-[10px] text-slate-500 font-medium">
                                      Dispatch: {item.leadTimeDays || 1} Days
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-slate-600 text-[11px] max-w-xs">{item.processDetails}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                          No specific price list items added yet. Click "+ Add Material / Process" to register standard prices.
                        </div>
                      )}
                    </div>

                    {/* Attached Catalog Document */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{vendor.companyName}_Official_Catalog.pdf</span>
                          <span className="text-[10px] text-slate-500">Certified supplier pricelist & product technical sheets</span>
                        </div>
                      </div>
                      <a
                        href="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 rounded-lg font-bold flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View PDF
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Add New Vendor */}
      {showAddVendorModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 my-8">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Add New Vendor to Supplier Master Directory
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Register approved vendor with all GST, service category, and contact details</p>
              </div>
              <button
                onClick={() => setShowAddVendorModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Template Presets */}
            <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 my-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10.5px] font-extrabold uppercase text-indigo-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Fast Vendor Presets:
                </span>
                <span className="text-[10px] text-indigo-700">Click to autofill approved vendor details</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {VENDOR_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyVendorTemplate(tmpl)}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-100 hover:border-indigo-300 border border-indigo-200 rounded-lg text-[10px] font-bold text-indigo-900 transition-colors cursor-pointer"
                  >
                    + {tmpl.company.slice(0, 22)}...
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddVendor} className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Firm Name *</label>
                  <input
                    type="text"
                    required
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="e.g. Aludecor & Eurobond ACP Depot"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person Name / Proprietor</label>
                  <input
                    type="text"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    placeholder="e.g. Rajesh Shah"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Service / Material *</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98201 54321"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="orders@aludecorwest.in"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Vendor For Column / Supply Scope Details */}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={newGstin}
                    onChange={(e) => {
                      setNewGstin(e.target.value);
                      if (e.target.value.length >= 12 && !newPan) {
                        setNewPan(e.target.value.slice(2, 12));
                      }
                    }}
                    placeholder="27AAACA9921D1Z4"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={newPan}
                    onChange={(e) => setNewPan(e.target.value)}
                    placeholder="AAACA9921D"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price Tier</label>
                  <select
                    value={newPriceTier}
                    onChange={(e) => setNewPriceTier(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="STANDARD">STANDARD</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="ECONOMY">ECONOMY</option>
                    <option value="HEAVY_INDUSTRIAL">HEAVY INDUSTRIAL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office / Godown Address</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Gala 14, Western Express Industrial Hub, Goregaon East"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Mumbai / Navi Mumbai"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment & Credit Terms</label>
                  <input
                    type="text"
                    value={newPaymentTerms}
                    onChange={(e) => setNewPaymentTerms(e.target.value)}
                    placeholder="e.g. 30 Days Net Credit, MTC Test Report"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Typical Price Range</label>
                  <input
                    type="text"
                    value={newPriceRangeText}
                    onChange={(e) => setNewPriceRangeText(e.target.value)}
                    placeholder="e.g. ₹1,800 - ₹4,500 / Sheet"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quality Specifications & Remarks</label>
                <textarea
                  value={newRemarks}
                  onChange={(e) => setNewRemarks(e.target.value)}
                  placeholder="Prime PVDF Exterior grade with certified 10-year warranty, test reports, and wind-load certificates..."
                  rows={2}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* PDF Catalog Attachment */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-800">
                    {newCatalogDoc ? newCatalogDoc.name : 'Attach Product Catalog / Price List (PDF)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setNewCatalogDoc({
                    name: `${newCompanyName ? newCompanyName.slice(0, 10) : 'Vendor'}_Catalog.pdf`,
                    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
                    size: '1.8 MB'
                  })}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-indigo-700 border border-slate-200 rounded-lg font-bold shadow-2xs cursor-pointer"
                >
                  {newCatalogDoc ? 'Catalog Attached' : '+ Sample Catalog'}
                </button>
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Vendor to Master List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Material / Item to Existing Vendor */}
      {addItemToVendor && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Add Material / Rate Card Item</h4>
                <p className="text-xs text-slate-500">For vendor: <strong>{addItemToVendor.companyName}</strong></p>
              </div>
              <button onClick={() => setAddItemToVendor(null)} className="text-slate-400 text-lg font-bold cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleAddItemToVendorSubmit} className="space-y-3 my-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item / Material Name *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. 4mm PVDF Grey Metallic ACP Sheet (8x4 ft)"
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="Sheet / Length / Sq.Ft"
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={newItemHsn}
                    onChange={(e) => setNewItemHsn(e.target.value)}
                    placeholder="e.g. 760612"
                    className="w-full p-2 bg-slate-50 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Rate (₹)</label>
                  <input
                    type="number"
                    value={newItemMinPrice}
                    onChange={(e) => setNewItemMinPrice(e.target.value)}
                    placeholder="1800"
                    className="w-full p-2 bg-slate-50 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Rate (₹)</label>
                  <input
                    type="number"
                    value={newItemMaxPrice}
                    onChange={(e) => setNewItemMaxPrice(e.target.value)}
                    placeholder="2400"
                    className="w-full p-2 bg-slate-50 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Final Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newItemFinalPrice}
                    onChange={(e) => setNewItemFinalPrice(e.target.value)}
                    placeholder="1950"
                    className="w-full p-2 bg-slate-50 border rounded-lg font-mono font-bold text-indigo-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Minimum Order Qty (MOQ)</label>
                  <input
                    type="text"
                    value={newItemMoq}
                    onChange={(e) => setNewItemMoq(e.target.value)}
                    placeholder="e.g. 10 Sheets"
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={newItemLeadTime}
                    onChange={(e) => setNewItemLeadTime(e.target.value)}
                    placeholder="2"
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Process / Technical Specification</label>
                <textarea
                  value={newItemProcessDetails}
                  onChange={(e) => setNewItemProcessDetails(e.target.value)}
                  placeholder="PVDF coated, 0.50mm coil thickness, tested for 150 km/h wind load..."
                  rows={2}
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setAddItemToVendor(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg shadow-xs"
                >
                  Add to Rate Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
