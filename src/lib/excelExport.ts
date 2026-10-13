import * as XLSX from 'xlsx';
import { Quotation } from '../types';

export const exportQuotationToExcel = (quote: Quotation) => {
  const currency = quote.currencySymbol || '₹';
  
  // 1. Header Information
  const headerData = [
    ['QUOTATION REPORT'],
    ['Company Name:', quote.companyEmail ? `${quote.preparedByCrmName} / Company` : 'DFINOTECH Creative Solutions'],
    ['Quotation #:', quote.quoteNumber],
    ['Date:', quote.date],
    ['Valid Until:', quote.validUntil],
    [''],
    ['CLIENT DETAILS'],
    ['Client Company:', quote.clientCompanyName],
    ['Contact Person:', quote.clientContactPerson],
    ['Address:', quote.clientAddress],
    ['Phone:', quote.clientPhone],
    ['Email:', quote.clientEmail || 'N/A'],
    ['GSTIN / Tax ID:', quote.clientGst || 'N/A'],
    ['Subject:', quote.subject],
    [''],
    ['ITEMIZED BREAKDOWN']
  ];

  // 2. Table Headers
  const itemHeaders = ['#', 'Item Title', 'Description', 'Unit Price', 'Quantity', 'Unit', 'Total Amount', 'Has Image Attachment'];

  // 3. Table Rows
  const itemRows = quote.items.map((item, index) => [
    index + 1,
    item.itemTitle || `Item ${index + 1}`,
    item.description,
    `${currency} ${Number(item.rate).toFixed(2)}`,
    item.quantity,
    item.unit || 'Units',
    `${currency} ${Number(item.amount).toFixed(2)}`,
    item.imageUrl ? 'Yes (Image Attached)' : 'No'
  ]);

  // 4. Summary Totals
  const summaryRows = [
    [''],
    ['', '', '', '', '', 'Sub Total:', `${currency} ${Number(quote.subtotal).toFixed(2)}`],
    ...(quote.taxType === 'IGST' ? [
      ['', '', '', '', '', `IGST (${quote.igstRatePercent || quote.gstTaxRatePercent || 18}%):`, `${currency} ${Number(quote.igstAmount || quote.taxAmount || 0).toFixed(2)}`]
    ] : [
      ['', '', '', '', '', `CGST (${quote.cgstRatePercent || 9}%):`, `${currency} ${Number(quote.cgstAmount || (quote.taxAmount / 2) || 0).toFixed(2)}`],
      ['', '', '', '', '', `SGST (${quote.sgstRatePercent || 9}%):`, `${currency} ${Number(quote.sgstAmount || (quote.taxAmount / 2) || 0).toFixed(2)}`]
    ]),
    quote.discountAmount ? [
      '', '', '', '', '', 
      `Discount (${quote.discountType === 'AMOUNT' ? 'Rupees' : `${quote.discountPercent || 0}%`}):`, 
      `-${currency} ${Number(quote.discountAmount).toFixed(2)}`
    ] : null,
    quote.roundOffAmount !== undefined && quote.roundOffAmount !== 0 ? [
      '', '', '', '', '', 'Round Off:', `${quote.roundOffAmount >= 0 ? '+' : ''}${currency} ${Number(quote.roundOffAmount).toFixed(2)}`
    ] : null,
    ['', '', '', '', '', 'GRAND TOTAL:', `${currency} ${Number(quote.totalAmount).toFixed(2)}`],
    [''],
    ['PAYMENT DETAILS'],
    ['Bank Name:', quote.bankName || 'Your Bank Name'],
    ['Account Name:', quote.bankAccountName || quote.clientCompanyName],
    ['Account Number:', quote.bankAccountNo || '123456789'],
    ['Website:', quote.websiteUrl || 'www.dfinotech.com'],
    [''],
    ['TERMS & CONDITIONS'],
    ...(quote.termsAndConditions || []).map(t => [t]),
    [''],
    ['Authorized Signatory:', quote.authorizedSignatoryName || 'DAVID ANDERSON']
  ].filter(Boolean) as any[][];

  // Combine into single worksheet dataset
  const wsData = [
    ...headerData,
    itemHeaders,
    ...itemRows,
    ...summaryRows
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // #
    { wch: 25 }, // Title
    { wch: 45 }, // Description
    { wch: 15 }, // Unit Price
    { wch: 10 }, // Qty
    { wch: 10 }, // Unit
    { wch: 18 }, // Total
    { wch: 22 }  // Image status
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Quotation');

  // Trigger file download
  const sanitizedFileName = (quote.quoteNumber || 'Quotation').replace(/[\/\\?%*:|"<>]/g, '_');
  XLSX.writeFile(wb, `${sanitizedFileName}_${quote.clientCompanyName.replace(/\s+/g, '_')}.xlsx`);
};
