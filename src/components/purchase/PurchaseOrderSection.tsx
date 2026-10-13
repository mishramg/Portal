import React, { useState } from 'react';
import { PurchaseOrder, DeliveryChallan, UserAccount, CompanyProfile, Vendor } from '../../types';
import { PrintablePurchaseOrder } from './PrintablePurchaseOrder';
import { FileUploadBox } from './FileUploadBox';
import { 
  FileText, Download, Share2, Printer, Truck, MapPin, CheckCircle2, 
  Clock, ShieldAlert, Bell, Phone, User, Calendar, Plus, 
  ExternalLink, Eye, ArrowRight, X, AlertTriangle, Building2, HardHat
} from 'lucide-react';

interface PurchaseOrderSectionProps {
  purchaseOrders: PurchaseOrder[];
  currentUser: UserAccount;
  companyProfile: CompanyProfile;
  users: UserAccount[];
  vendors: Vendor[];
  onSavePurchaseOrders: (pos: PurchaseOrder[]) => void;
  onSendNotification?: (title: string, message: string, targetRole?: any) => void;
}

export const PurchaseOrderSection: React.FC<PurchaseOrderSectionProps> = ({
  purchaseOrders,
  currentUser,
  companyProfile,
  users,
  vendors,
  onSavePurchaseOrders,
  onSendNotification
}) => {
  const [selectedPOForPrint, setSelectedPOForPrint] = useState<PurchaseOrder | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'IN_TRANSIT' | 'COMPLETED_CHALLAN'>('ALL');
  
  // Location Update Modal State
  const [locationModalPO, setLocationModalPO] = useState<PurchaseOrder | null>(null);
  const [transporterName, setTransporterName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [expectedTime, setExpectedTime] = useState('');
  const [trackingNotes, setTrackingNotes] = useState('');

  // Delivery Challan Verification Modal State
  const [challanModalPO, setChallanModalPO] = useState<PurchaseOrder | null>(null);
  const [challanNumber, setChallanNumber] = useState('');
  const [qualityStatus, setQualityStatus] = useState<'INSPECTED_OK' | 'PARTIAL_DAMAGE' | 'SHORTAGE_REPORTED'>('INSPECTED_OK');
  const [receivedNotes, setReceivedNotes] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const [challanFileUrl, setChallanFileUrl] = useState('');
  const [challanFileName, setChallanFileName] = useState('');

  // New PO Modal State
  const [showNewPOModal, setShowNewPOModal] = useState(false);
  const [newPoVendorId, setNewPoVendorId] = useState(vendors[0]?.id || '');
  const [newPoDestType, setNewPoDestType] = useState<'ON_SITE' | 'FACTORY'>('ON_SITE');
  const [newPoDestName, setNewPoDestName] = useState('');
  const [newPoDestAddress, setNewPoDestAddress] = useState('');
  const [newPoSupervisorId, setNewPoSupervisorId] = useState('');
  const [newPoItemName, setNewPoItemName] = useState('');
  const [newPoQty, setNewPoQty] = useState('');
  const [newPoUnit, setNewPoUnit] = useState('Sheets');
  const [newPoPrice, setNewPoPrice] = useState('');
  const [newPoProcess, setNewPoProcess] = useState('');
  const [newPoMtcReq, setNewPoMtcReq] = useState(true);
  const [newPoPaymentTerms, setNewPoPaymentTerms] = useState('30 Days Net Credit');
  const [newPoDeliveryTerms, setNewPoDeliveryTerms] = useState('Direct Site Unloading');

  const siteSupervisors = users.filter(u => u.role === 'SITE_SUPERVISOR');

  // Compute Recent Site Supervisors who have active or recent deliveries
  const recentSupervisorsMap = new Map<string, { supervisor: UserAccount; poCount: number; lastSite: string; inTransitCount: number }>();
  
  purchaseOrders.forEach(po => {
    if (po.receiverSupervisorId) {
      const supUser = users.find(u => u.id === po.receiverSupervisorId);
      if (supUser) {
        const existing = recentSupervisorsMap.get(supUser.id) || {
          supervisor: supUser,
          poCount: 0,
          lastSite: po.destinationName,
          inTransitCount: 0
        };
        existing.poCount += 1;
        existing.lastSite = po.destinationName;
        if (po.status === 'DISPATCHED_IN_TRANSIT') {
          existing.inTransitCount += 1;
        }
        recentSupervisorsMap.set(supUser.id, existing);
      }
    }
  });

  const recentSupervisorsList = Array.from(recentSupervisorsMap.values());

  const filteredPOs = purchaseOrders.filter(po => {
    if (activeTabFilter === 'IN_TRANSIT' && po.status !== 'DISPATCHED_IN_TRANSIT') return false;
    if (activeTabFilter === 'COMPLETED_CHALLAN' && po.status !== 'DELIVERY_CHALLAN_VERIFIED') return false;
    return true;
  });

  const handleShareWhatsApp = (po: PurchaseOrder) => {
    const text = encodeURIComponent(
      `*PURCHASE ORDER: ${po.poNumber}*\n` +
      `*From:* ${companyProfile.companyName}\n` +
      `*Vendor:* ${po.vendorCompany} (${po.vendorName})\n` +
      `*Delivery To:* ${po.destinationName}\n` +
      `*Receiver Incharge:* ${po.receiverSupervisorName || 'Site Supervisor'} (${po.receiverSupervisorPhone || 'N/A'})\n` +
      `*Grand Total:* ₹${po.grandTotal.toLocaleString('en-IN')}\n` +
      `*Status:* ${po.status}\n` +
      (po.dispatchDetails?.currentTransitLocation ? `📍 *Current Transit Location:* ${po.dispatchDetails.currentTransitLocation} (ETA: ${po.dispatchDetails.expectedDeliveryTime})\n` : '') +
      (po.mtcStatus === 'MTC_REQUESTED' ? `⚠️ *MTC (Material Test Certificate) is strictly required upon delivery.*\n` : '') +
      `Please ensure Delivery Challan is signed upon physical inspection.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleOpenLocationModal = (po: PurchaseOrder) => {
    setLocationModalPO(po);
    setTransporterName(po.dispatchDetails?.transporterName || 'VRL Logistics / Dedicated Truck');
    setVehicleNumber(po.dispatchDetails?.vehicleNumber || '');
    setDriverName(po.dispatchDetails?.driverName || '');
    setDriverPhone(po.dispatchDetails?.driverPhone || '');
    setCurrentLocation(po.dispatchDetails?.currentTransitLocation || '');
    setExpectedTime(po.dispatchDetails?.expectedDeliveryTime || 'Today by 2:00 PM');
    setTrackingNotes(po.dispatchDetails?.trackingNotes || '');
  };

  const handleSaveLocationUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationModalPO) return;

    const updated = purchaseOrders.map(po => {
      if (po.id === locationModalPO.id) {
        return {
          ...po,
          status: 'DISPATCHED_IN_TRANSIT' as const,
          dispatchDetails: {
            transporterName,
            vehicleNumber,
            driverName,
            driverPhone,
            dispatchDate: po.dispatchDetails?.dispatchDate || new Date().toISOString(),
            currentTransitLocation: currentLocation,
            expectedDeliveryTime: expectedTime,
            trackingNotes,
            lastLocationUpdateTimestamp: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        };
      }
      return po;
    });

    onSavePurchaseOrders(updated);
    if (onSendNotification) {
      onSendNotification(
        `Material Transit Location Update: ${locationModalPO.poNumber}`,
        `Vehicle ${vehicleNumber} is at ${currentLocation}. ETA: ${expectedTime}. Receiver ${locationModalPO.receiverSupervisorName} notified.`,
        'SITE_SUPERVISOR'
      );
    }
    setLocationModalPO(null);
  };

  const handleOpenChallanModal = (po: PurchaseOrder) => {
    setChallanModalPO(po);
    setChallanNumber(po.deliveryChallan?.challanNumber || `DC-${po.poNumber.slice(-4)}-01`);
    setQualityStatus(po.deliveryChallan?.qualityStatus || 'INSPECTED_OK');
    setReceivedNotes(po.deliveryChallan?.receivedItemsNotes || 'All items counted and checked against PO specifications.');
    setSignatureName(currentUser.name);
    setChallanFileUrl(po.deliveryChallan?.documentUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80');
    setChallanFileName(po.deliveryChallan?.challanNumber ? `Signed_Challan_${po.deliveryChallan.challanNumber}.pdf` : 'Signed_Challan_Delivery.pdf');
  };

  const handleSaveDeliveryChallan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challanModalPO) return;

    const challan: DeliveryChallan = {
      id: `dc_${Date.now()}`,
      challanNumber,
      date: new Date().toISOString().split('T')[0],
      receivedByUserId: currentUser.id,
      receivedByName: signatureName || currentUser.name,
      receivedByRole: currentUser.role,
      receivedLocation: challanModalPO.destinationName,
      receivedItemsNotes: receivedNotes,
      qualityStatus,
      documentUrl: challanFileUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      signatureName: signatureName || currentUser.name,
      verifiedAt: new Date().toISOString()
    };

    const updated = purchaseOrders.map(po => {
      if (po.id === challanModalPO.id) {
        return {
          ...po,
          status: 'DELIVERY_CHALLAN_VERIFIED' as const,
          deliveryChallan: challan,
          updatedAt: new Date().toISOString()
        };
      }
      return po;
    });

    onSavePurchaseOrders(updated);
    if (onSendNotification) {
      onSendNotification(
        `Delivery Challan Verified: ${challanModalPO.poNumber}`,
        `Material received & verified OK at ${challanModalPO.destinationName} by ${signatureName}.`,
        'ADMIN'
      );
    }
    setChallanModalPO(null);
  };

  const handleSendMTCReminder = (po: PurchaseOrder) => {
    const nextCount = (po.mtcReminderCount || 0) + 1;
    const updated = purchaseOrders.map(p => {
      if (p.id === po.id) {
        return {
          ...p,
          mtcStatus: 'MTC_REQUESTED' as const,
          mtcLastReminderDate: new Date().toISOString(),
          mtcReminderCount: nextCount,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    onSavePurchaseOrders(updated);

    // Also prompt WhatsApp reminder for vendor
    const reminderText = encodeURIComponent(
      `*REMINDER #${nextCount}: Material Test Certificate (MTC) Required*\n` +
      `*PO Number:* ${po.poNumber}\n` +
      `*Vendor:* ${po.vendorCompany}\n` +
      `*Destination:* ${po.destinationName}\n\n` +
      `Dear Supplier, please dispatch the official certified MTC (Material Test Certificate) for batch inspection on-site. Thank you.`
    );
    window.open(`https://api.whatsapp.com/send?text=${reminderText}`, '_blank');
  };

  const handleCreateNewPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoItemName || !newPoQty || !newPoPrice) {
      alert('Please fill in Item Name, Quantity, and Price');
      return;
    }

    const ven = vendors.find(v => v.id === newPoVendorId) || vendors[0];
    const sup = siteSupervisors.find(s => s.id === newPoSupervisorId);
    const qty = Number(newPoQty);
    const price = Number(newPoPrice);
    const sub = qty * price;
    const tax = Math.round(sub * 0.18);
    const total = sub + tax;

    const newPO: PurchaseOrder = {
      id: `po_${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 42).padStart(4, '0')}`,
      date: new Date().toISOString().split('T')[0],
      vendorId: ven.id,
      vendorName: ven.name,
      vendorCompany: ven.companyName,
      vendorPhone: ven.phone,
      vendorEmail: ven.email,
      vendorAddress: ven.address,
      vendorGstin: ven.gstin,
      destinationType: newPoDestType,
      destinationName: newPoDestName || (newPoDestType === 'ON_SITE' ? 'Site Location Mumbai' : 'Central Factory Plant, Mira Road'),
      destinationAddress: newPoDestAddress || (newPoDestType === 'ON_SITE' ? 'Site Address' : 'Kamlawati Central Plant, Mira Road East'),
      receiverSupervisorId: sup?.id,
      receiverSupervisorName: sup?.name,
      receiverSupervisorPhone: '+91 98765 10293',
      items: [
        {
          id: `poi_${Date.now()}_1`,
          itemName: newPoItemName,
          quantity: qty,
          unit: newPoUnit,
          unitPrice: price,
          taxRatePct: 18,
          amount: sub,
          processDetails: newPoProcess || 'Standard batch specification with GST billing',
          mtcRequired: newPoMtcReq
        }
      ],
      subtotal: sub,
      cgst: Math.round(tax / 2),
      sgst: Math.round(tax / 2),
      igst: 0,
      grandTotal: total,
      paymentTerms: newPoPaymentTerms,
      deliveryTerms: newPoDeliveryTerms,
      status: 'PO_ISSUED',
      mtcStatus: newPoMtcReq ? 'MTC_REQUESTED' : 'NOT_REQUIRED',
      mtcReminderCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSavePurchaseOrders([newPO, ...purchaseOrders]);
    setShowNewPOModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* RECENT SECTION: Receiver Site Supervisors Widget */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-500" />
            <h4 className="font-extrabold text-slate-900 text-sm">
              Recent Receiver Site Supervisors (Active Projects & Live Transits)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Direct On-Site Material Receiving Contacts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentSupervisorsList.length === 0 ? (
            <p className="text-xs text-slate-400 col-span-3">No recent supervisor shipments recorded</p>
          ) : (
            recentSupervisorsList.map(({ supervisor, poCount, lastSite, inTransitCount }) => (
              <div 
                key={supervisor.id}
                className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-start gap-3 hover:border-amber-400 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-800 font-bold flex items-center justify-center shrink-0 border border-amber-300">
                  {supervisor.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-slate-900 truncate">{supervisor.name}</h5>
                    {inTransitCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-[9px] rounded-full animate-pulse">
                        {inTransitCount} In-Transit
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{lastSite}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-600 mt-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>+91 98765 10293</span>
                    <span className="text-slate-300">•</span>
                    <span>{poCount} POs assigned</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Filter Tabs & Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTabFilter('ALL')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTabFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Purchase Orders ({purchaseOrders.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('IN_TRANSIT')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTabFilter === 'IN_TRANSIT'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            In-Transit Deliveries ({purchaseOrders.filter(p => p.status === 'DISPATCHED_IN_TRANSIT').length})
          </button>
          <button
            onClick={() => setActiveTabFilter('COMPLETED_CHALLAN')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTabFilter === 'COMPLETED_CHALLAN'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivery Challan Verified ({purchaseOrders.filter(p => p.status === 'DELIVERY_CHALLAN_VERIFIED').length})
          </button>
        </div>

        <button
          onClick={() => setShowNewPOModal(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-yellow-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Purchase Order
        </button>
      </div>

      {/* Purchase Orders List Cards */}
      <div className="space-y-4">
        {filteredPOs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No purchase orders in this view</p>
          </div>
        ) : (
          filteredPOs.map(po => (
            <div
              key={po.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-300 transition-all space-y-4"
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-900 text-yellow-400 rounded-xl font-mono font-bold text-xs">
                    {po.poNumber}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">{po.vendorCompany}</h4>
                    <p className="text-xs text-slate-500">Contact: {po.vendorName} | Ph: {po.vendorPhone}</p>
                  </div>
                </div>

                {/* Status Pill & Grand Total */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Grand Total</span>
                    <span className="font-mono font-black text-slate-950 text-base">
                      ₹{po.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    {po.status === 'DELIVERY_CHALLAN_VERIFIED' ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivery Challan Verified
                      </span>
                    ) : po.status === 'DISPATCHED_IN_TRANSIT' ? (
                      <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-black flex items-center gap-1 animate-pulse">
                        <Truck className="w-3.5 h-3.5 text-amber-600" /> Dispatched & In-Transit
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-300 rounded-full text-xs font-black flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-600" /> PO Issued
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Destination & Receiver Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Deliver To Destination</span>
                  <p className="font-bold text-slate-900 mt-0.5">{po.destinationName}</p>
                  <p className="text-[11px] text-slate-600 truncate">{po.destinationAddress}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Receiver Incharge (Site Supervisor)</span>
                  <p className="font-bold text-slate-900 mt-0.5">{po.receiverSupervisorName || 'Assigned Site Supervisor'}</p>
                  <p className="text-[11px] text-slate-600">{po.receiverSupervisorPhone || '+91 98765 10293'}</p>
                </div>

                {/* MTC Status & Reminder Section */}
                <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                  po.mtcStatus === 'MTC_REQUESTED'
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                    : po.mtcStatus === 'MTC_VERIFIED'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                      MTC Test Certificate:
                    </span>
                    <span className="font-bold text-[11px]">{po.mtcStatus}</span>
                  </div>
                  
                  {po.mtcStatus === 'MTC_REQUESTED' && (
                    <div className="flex items-center justify-between pt-1.5">
                      <span className="text-[10px] text-amber-800">
                        {po.mtcReminderCount ? `Reminded ${po.mtcReminderCount}x` : 'Awaiting dispatch'}
                      </span>
                      <button
                        onClick={() => handleSendMTCReminder(po)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Bell className="w-3 h-3" /> Send MTC Reminder
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Summary Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-[10px] text-slate-400 font-extrabold uppercase">
                      <th className="pb-1.5">Item Name & Specs</th>
                      <th className="pb-1.5 text-right">Qty</th>
                      <th className="pb-1.5 text-right">Rate (₹)</th>
                      <th className="pb-1.5 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {po.items.map(it => (
                      <tr key={it.id}>
                        <td className="py-2">
                          <span className="font-bold text-slate-800">{it.itemName}</span>
                          {it.processDetails && <span className="text-[11px] text-purple-700 block italic">{it.processDetails}</span>}
                        </td>
                        <td className="py-2 text-right font-medium text-slate-700">{it.quantity} {it.unit}</td>
                        <td className="py-2 text-right font-mono text-slate-700">₹{it.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="py-2 text-right font-mono font-bold text-slate-900">₹{it.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Live Transit Location Box if dispatched */}
              {po.dispatchDetails?.currentTransitLocation && (
                <div className="bg-amber-50/60 border border-amber-300 p-3 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-amber-950">Live Vehicle Transit Location:</strong>
                      <p className="text-slate-800 font-medium">
                        {po.dispatchDetails.currentTransitLocation} (Vehicle: {po.dispatchDetails.vehicleNumber || 'En route'})
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-600">
                    <span>ETA: <strong>{po.dispatchDetails.expectedDeliveryTime}</strong></span>
                    {po.dispatchDetails.driverPhone && (
                      <span className="block text-[10px]">Driver Ph: {po.dispatchDetails.driverPhone}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Challan Badge & View if completed */}
              {po.deliveryChallan && (
                <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <strong className="text-emerald-950">Delivery Challan Signed: #{po.deliveryChallan.challanNumber}</strong>
                      <p className="text-[11px] text-slate-600">
                        Received by {po.deliveryChallan.receivedByName} on {po.deliveryChallan.date} ({po.deliveryChallan.qualityStatus})
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-white text-emerald-800 font-bold rounded-lg border border-emerald-200 text-[11px]">
                    QA Passed
                  </span>
                </div>
              )}

              {/* Bottom Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {/* Location Update Trigger */}
                  <button
                    onClick={() => handleOpenLocationModal(po)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Update Location & Transit</span>
                  </button>

                  {/* Delivery Challan Trigger */}
                  {po.status !== 'DELIVERY_CHALLAN_VERIFIED' && (
                    <button
                      onClick={() => handleOpenChallanModal(po)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Record Delivery Challan</span>
                    </button>
                  )}
                </div>

                {/* Print PO, Download PDF, WhatsApp Share */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPOForPrint(po)}
                    className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Auto Download / Print PO</span>
                  </button>

                  <button
                    onClick={() => handleShareWhatsApp(po)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share WhatsApp</span>
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* MODAL: Printable / Downloadable Purchase Order */}
      {selectedPOForPrint && (
        <PrintablePurchaseOrder
          po={selectedPOForPrint}
          companyProfile={companyProfile}
          onClose={() => setSelectedPOForPrint(null)}
        />
      )}

      {/* MODAL: Location Update to Site Supervisor */}
      {locationModalPO && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-start justify-between border-b pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Update Location & Transit to Site Supervisor</h3>
                  <p className="text-[11px] text-slate-500">PO: {locationModalPO.poNumber} | To: {locationModalPO.receiverSupervisorName}</p>
                </div>
              </div>
              <button
                onClick={() => setLocationModalPO(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveLocationUpdate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Transporter / Logistics</label>
                  <input
                    type="text"
                    value={transporterName}
                    onChange={(e) => setTransporterName(e.target.value)}
                    placeholder="e.g. VRL Logistics Express"
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Vehicle Number</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. MH-04-GP-8192"
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Driver Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Sanjay Yadav"
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Driver Phone</label>
                  <input
                    type="text"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="+91 99881 23456"
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Current Transit Location / Checkpoint *</label>
                <input
                  type="text"
                  required
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  placeholder="e.g. Near Western Express Highway Toll, Goregaon Hub (En route to Khar site)"
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Expected Delivery Time (ETA) *</label>
                <input
                  type="text"
                  required
                  value={expectedTime}
                  onChange={(e) => setExpectedTime(e.target.value)}
                  placeholder="e.g. Today by 11:30 AM"
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setLocationModalPO(null)}
                  className="px-4 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-sm"
                >
                  Broadcast Location Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delivery Challan Verification */}
      {challanModalPO && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-start justify-between border-b pb-3 mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Record Final Delivery Challan Clearance</h3>
                  <p className="text-[11px] text-slate-500">PO: {challanModalPO.poNumber} | Receiver QA Inspection</p>
                </div>
              </div>
              <button
                onClick={() => setChallanModalPO(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveDeliveryChallan} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Delivery Challan Number *</label>
                  <input
                    type="text"
                    required
                    value={challanNumber}
                    onChange={(e) => setChallanNumber(e.target.value)}
                    placeholder="e.g. DC-PA-9182"
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">QA Inspection Status</label>
                  <select
                    value={qualityStatus}
                    onChange={(e: any) => setQualityStatus(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="INSPECTED_OK">Inspected OK (100% Passed)</option>
                    <option value="PARTIAL_DAMAGE">Partial Damage Reported</option>
                    <option value="SHORTAGE_REPORTED">Shortage in Piece Count</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Receiver Signature Name *</label>
                <input
                  type="text"
                  required
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="e.g. Suresh Kumar (Site Incharge)"
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-0.5">Inspection & Material Handover Remarks</label>
                <textarea
                  value={receivedNotes}
                  onChange={(e) => setReceivedNotes(e.target.value)}
                  placeholder="e.g. Received 24 sheets in pristine condition with protective film intact. Verified MTC document."
                  rows={2}
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Upload Signed Delivery Challan Photo / Document */}
              <FileUploadBox
                label="Upload Signed Delivery Challan Document / Physical Copy Photo"
                helperText="Attach stamped & signed delivery challan receipt from transporter"
                fileUrl={challanFileUrl}
                fileName={challanFileName}
                onFileChange={(file) => {
                  setChallanFileUrl(file?.url || '');
                  setChallanFileName(file?.name || '');
                }}
                sampleOptions={[
                  { title: 'Signed_Delivery_Challan_OnSite.pdf', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80' },
                  { title: 'Material_Inspection_Pass_Stamped.png', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80' }
                ]}
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setChallanModalPO(null)}
                  className="px-4 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Confirm & Finalize Delivery Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create New Purchase Order */}
      {showNewPOModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 my-8">
            <div className="flex items-start justify-between border-b pb-3 mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Generate Official Purchase Order</h3>
                <p className="text-xs text-slate-500">Directly issue PO with vendor pricing and destination</p>
              </div>
              <button
                onClick={() => setShowNewPOModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewPO} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Supplier / Vendor *</label>
                  <select
                    value={newPoVendorId}
                    onChange={(e) => setNewPoVendorId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none cursor-pointer"
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.companyName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination Category</label>
                  <select
                    value={newPoDestType}
                    onChange={(e: any) => setNewPoDestType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="ON_SITE">On-Site Project Location</option>
                    <option value="FACTORY">Central Factory Unit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination Name / Project *</label>
                  <input
                    type="text"
                    required
                    value={newPoDestName}
                    onChange={(e) => setNewPoDestName(e.target.value)}
                    placeholder="e.g. Croma Bandra Store Site"
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Receiver Site Supervisor</label>
                  <select
                    value={newPoSupervisorId}
                    onChange={(e) => setNewPoSupervisorId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="">Select Supervisor...</option>
                    {siteSupervisors.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={newPoItemName}
                    onChange={(e) => setNewPoItemName(e.target.value)}
                    placeholder="e.g. 4mm PVDF ACP Sheets"
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit</label>
                  <select
                    value={newPoUnit}
                    onChange={(e) => setNewPoUnit(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="Sheets">Sheets</option>
                    <option value="Lengths">Lengths</option>
                    <option value="Pieces">Pieces</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Meters">Meters</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    value={newPoQty}
                    onChange={(e) => setNewPoQty(e.target.value)}
                    placeholder="24"
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newPoPrice}
                    onChange={(e) => setNewPoPrice(e.target.value)}
                    placeholder="2150"
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Process & Fabrication Details</label>
                <input
                  type="text"
                  value={newPoProcess}
                  onChange={(e) => setNewPoProcess(e.target.value)}
                  placeholder="e.g. PVDF 30-micron outdoor coating, protective film with MTC"
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mtcReqCheck"
                  checked={newPoMtcReq}
                  onChange={(e) => setNewPoMtcReq(e.target.checked)}
                  className="cursor-pointer"
                />
                <label htmlFor="mtcReqCheck" className="font-bold text-slate-700 cursor-pointer">
                  Require Mandatory MTC (Material Test Certificate) for this PO
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewPOModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-yellow-400 font-bold rounded-xl shadow-sm"
                >
                  Generate & Issue PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
