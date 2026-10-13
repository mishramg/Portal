import React from 'react';
import { PurchaseOrder, CompanyProfile } from '../../types';
import { Download, Share2, Printer, CheckCircle2, ShieldAlert, Phone, Mail, Building2, MapPin, Calendar, FileText } from 'lucide-react';

interface PrintablePurchaseOrderProps {
  po: PurchaseOrder;
  companyProfile: CompanyProfile;
  onClose?: () => void;
}

export const PrintablePurchaseOrder: React.FC<PrintablePurchaseOrderProps> = ({
  po,
  companyProfile,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*PURCHASE ORDER: ${po.poNumber}*\n` +
      `*From:* ${companyProfile.companyName}\n` +
      `*To Vendor:* ${po.vendorCompany} (${po.vendorName})\n` +
      `*Date:* ${po.date}\n` +
      `*Destination:* ${po.destinationName} (${po.destinationType === 'ON_SITE' ? 'Site' : 'Factory'})\n` +
      `*Receiver Incharge:* ${po.receiverSupervisorName || 'Site Supervisor'} (${po.receiverSupervisorPhone || 'N/A'})\n` +
      `*Grand Total:* ₹${po.grandTotal.toLocaleString('en-IN')}\n\n` +
      `*Items Summary:*\n` +
      po.items.map((it, idx) => `${idx + 1}. ${it.itemName} - ${it.quantity} ${it.unit} @ ₹${it.unitPrice} = ₹${it.amount.toLocaleString('en-IN')}`).join('\n') +
      `\n\n*Payment Terms:* ${po.paymentTerms}\n` +
      `*Delivery Terms:* ${po.deliveryTerms}\n` +
      (po.mtcStatus !== 'NOT_REQUIRED' ? `⚠️ *MTC (Material Test Certificate) is strictly required upon delivery.*` : '')
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Convert numbers to words (approx Indian numbering)
  const numberToWords = (num: number): string => {
    if (!num) return 'Zero Rupees Only';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    function inWords(n: number): string {
      let str = '';
      if (n > 9999999) {
        str += inWords(Math.floor(n / 10000000)) + 'Crore ';
        n %= 10000000;
      }
      if (n > 99999) {
        str += inWords(Math.floor(n / 100000)) + 'Lakh ';
        n %= 100000;
      }
      if (n > 999) {
        str += inWords(Math.floor(n / 1000)) + 'Thousand ';
        n %= 1000;
      }
      if (n > 99) {
        str += inWords(Math.floor(n / 100)) + 'Hundred ';
        n %= 100;
      }
      if (n > 19) {
        str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
      } else if (n > 0) {
        str += a[n];
      }
      return str;
    }
    return (inWords(Math.round(num)) + 'Rupees Only').trim();
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:static print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full">
        
        {/* Modal Action Header - Hidden on Print */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="font-bold text-sm">Official Purchase Order Document: {po.poNumber}</h3>
              <p className="text-[11px] text-slate-400">Ready for direct printing, PDF save, and WhatsApp vendor dispatch</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4" /> Share WhatsApp
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg transition-all cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Printable PO Body */}
        <div className="p-8 sm:p-10 overflow-y-auto text-slate-800 font-sans print:p-0 print:overflow-visible text-xs">
          
          {/* Header & Logo */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-500 text-slate-950 font-black text-lg flex items-center justify-center border border-yellow-600 shadow-xs">
                  K
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">{companyProfile.companyName}</h1>
                  <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">{companyProfile.tagline}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 mt-2 max-w-sm leading-relaxed">
                {companyProfile.address}
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                <strong>GSTIN:</strong> {companyProfile.gstin} | <strong>Phone:</strong> {companyProfile.phone}
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block bg-slate-900 text-white font-black text-sm px-4 py-1.5 rounded uppercase tracking-wider mb-2">
                PURCHASE ORDER
              </div>
              <table className="text-[11px] text-right ml-auto">
                <tbody>
                  <tr>
                    <td className="text-slate-500 font-semibold pr-2">PO Number:</td>
                    <td className="font-mono font-bold text-slate-900">{po.poNumber}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500 font-semibold pr-2">Date of Issue:</td>
                    <td className="font-bold text-slate-900">{po.date}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500 font-semibold pr-2">Payment Terms:</td>
                    <td className="font-bold text-slate-900">{po.paymentTerms}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Vendor Details vs Shipping Destination */}
          <div className="grid grid-cols-2 gap-6 my-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Vendor Box */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">SUPPLIER / VENDOR DETAILS</span>
              <h4 className="font-bold text-sm text-slate-900">{po.vendorCompany}</h4>
              <p className="text-slate-700 font-medium">{po.vendorName}</p>
              <p className="text-slate-600 leading-relaxed text-[11px]">{po.vendorAddress}</p>
              <p className="text-slate-700 font-medium text-[11px] pt-1">
                <strong>GSTIN:</strong> {po.vendorGstin || 'Unregistered'} | <strong>Ph:</strong> {po.vendorPhone}
              </p>
              {po.vendorEmail && <p className="text-slate-600 text-[11px]"><strong>Email:</strong> {po.vendorEmail}</p>}
            </div>

            {/* Delivery Destination Box */}
            <div className="space-y-1 border-l border-slate-200 pl-6">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                DELIVER TO ({po.destinationType === 'ON_SITE' ? 'ON-SITE LOCATION' : 'FACTORY UNIT'})
              </span>
              <h4 className="font-bold text-sm text-slate-900">{po.destinationName}</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">{po.destinationAddress}</p>
              <div className="mt-2 pt-1 bg-white p-2 rounded-lg border border-slate-200 text-[11px]">
                <strong className="text-purple-900">Site Receiver / Supervisor:</strong>
                <p className="text-slate-800 font-bold">{po.receiverSupervisorName || 'Assigned Site Supervisor'}</p>
                <p className="text-slate-600">Contact: {po.receiverSupervisorPhone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto my-5">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-wider font-extrabold">
                  <th className="p-2.5 border border-slate-700 w-8 text-center">#</th>
                  <th className="p-2.5 border border-slate-700">Item Description & Material Specifications</th>
                  <th className="p-2.5 border border-slate-700 text-center">HSN</th>
                  <th className="p-2.5 border border-slate-700 text-right">Qty</th>
                  <th className="p-2.5 border border-slate-700 text-center">Unit</th>
                  <th className="p-2.5 border border-slate-700 text-right">Rate (₹)</th>
                  <th className="p-2.5 border border-slate-700 text-center">GST %</th>
                  <th className="p-2.5 border border-slate-700 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {po.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="p-2.5 text-center font-bold text-slate-500 border border-slate-200">{index + 1}</td>
                    <td className="p-2.5 border border-slate-200">
                      <div className="font-bold text-slate-900">{item.itemName}</div>
                      {item.description && <div className="text-slate-600 text-[10px]">{item.description}</div>}
                      {item.processDetails && (
                        <div className="text-purple-700 text-[10px] italic mt-0.5">
                          <strong>Process:</strong> {item.processDetails}
                        </div>
                      )}
                      {item.mtcRequired && (
                        <span className="inline-block bg-amber-100 text-amber-900 font-extrabold text-[9px] px-1.5 py-0.2 rounded mt-1 border border-amber-300">
                          MTC Required
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-mono text-slate-600 border border-slate-200">{item.hsnCode || '-'}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900 border border-slate-200">{item.quantity}</td>
                    <td className="p-2.5 text-center text-slate-600 border border-slate-200">{item.unit}</td>
                    <td className="p-2.5 text-right font-medium text-slate-900 border border-slate-200">{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-center text-slate-600 border border-slate-200">{item.taxRatePct}%</td>
                    <td className="p-2.5 text-right font-bold text-slate-900 border border-slate-200">{item.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation & Amount in Words */}
          <div className="grid grid-cols-12 gap-6 my-4">
            <div className="col-span-7 space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Amount Chargeable in Words</span>
                <p className="font-bold text-slate-900 text-[11px] capitalize mt-0.5">
                  {numberToWords(po.grandTotal)}
                </p>
              </div>

              {/* Special Instructions & MTC Reminder Notice */}
              <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                  Mandatory Delivery & Compliance Terms:
                </div>
                <p className="leading-relaxed">
                  1. Delivery Challan with exact batch count and receiver signature is required for billing clearance.<br/>
                  2. {po.mtcStatus !== 'NOT_REQUIRED' ? 'Material Test Certificate (MTC) must accompany this shipment.' : 'Standard QA warranty applies.'}<br/>
                  3. Delivery instructions: {po.specialInstructions || po.deliveryTerms || 'Handle with care.'}
                </p>
              </div>
            </div>

            <div className="col-span-5">
              <table className="w-full text-right text-[11px] bg-slate-50 rounded-xl p-3 border border-slate-200">
                <tbody>
                  <tr className="border-b border-slate-200 pb-1">
                    <td className="p-1.5 text-slate-600 font-semibold">Sub Total:</td>
                    <td className="p-1.5 font-bold text-slate-900 font-mono">₹{po.subtotal.toLocaleString('en-IN')}</td>
                  </tr>
                  {po.cgst > 0 && (
                    <tr>
                      <td className="p-1.5 text-slate-600">CGST (9%):</td>
                      <td className="p-1.5 font-medium text-slate-800 font-mono">₹{po.cgst.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  {po.sgst > 0 && (
                    <tr>
                      <td className="p-1.5 text-slate-600">SGST (9%):</td>
                      <td className="p-1.5 font-medium text-slate-800 font-mono">₹{po.sgst.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  {po.igst > 0 && (
                    <tr>
                      <td className="p-1.5 text-slate-600">IGST (18%):</td>
                      <td className="p-1.5 font-medium text-slate-800 font-mono">₹{po.igst.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-slate-900 pt-2 text-sm bg-yellow-50/80">
                    <td className="p-2 font-black text-slate-900">Grand Total:</td>
                    <td className="p-2 font-black text-slate-950 font-mono text-base">₹{po.grandTotal.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures & Bank Details */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200 mt-6 text-[11px]">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Bank Account</span>
              <p className="font-bold text-slate-800 mt-0.5">{companyProfile.bankName}</p>
              <p className="text-slate-600">A/C: {companyProfile.bankAccountNo} | IFSC: {companyProfile.bankIfsc}</p>
            </div>

            <div className="text-right space-y-8">
              <span className="text-[10px] font-bold text-slate-400 uppercase">For {companyProfile.companyName}</span>
              <div className="pt-8">
                <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-40 text-center">
                  Authorized Signatory & Stamp
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
