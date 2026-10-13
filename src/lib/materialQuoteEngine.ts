import { Vendor, QuoteShortlist, VendorItem } from '../types';

export interface MaterialCatalogItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  defaultRate: number;
  priceRange: string;
  defaultSpecs: string;
  hsnCode: string;
}

export const SIGNAGE_MATERIALS_CATALOG: MaterialCatalogItem[] = [
  // ACP & Sheet Metal
  {
    id: 'mat_acp_4mm_pvdf',
    name: 'ACP Sheet 4mm PVDF External Grade (8x4 ft)',
    category: 'ACP & Sheet Metal',
    unit: 'Sheets',
    defaultRate: 2150,
    priceRange: '₹1,800 - ₹2,450 / Sheet',
    defaultSpecs: '0.50mm Aluminum skin, PVDF 30-micron outdoor coating, fire-rated core, batch test certified with MTC.',
    hsnCode: '760612'
  },
  {
    id: 'mat_acp_3mm_pe',
    name: 'ACP Sheet 3mm Polyester Interior Grade (8x4 ft)',
    category: 'ACP & Sheet Metal',
    unit: 'Sheets',
    defaultRate: 1450,
    priceRange: '₹1,250 - ₹1,650 / Sheet',
    defaultSpecs: '0.25mm skin, PE interior coating, lightweight core for backing & fascia box panelling.',
    hsnCode: '760612'
  },
  {
    id: 'mat_alu_tube_50x25',
    name: 'Aluminum Rectangular Tube 50x25x2mm (6 Mtr)',
    category: 'ACP & Sheet Metal',
    unit: 'Lengths',
    defaultRate: 1180,
    priceRange: '₹950 - ₹1,400 / Length',
    defaultSpecs: 'Alloy 6063-T6, anodized natural silver 15-micron, mill test certified for structural framework.',
    hsnCode: '760429'
  },

  // Acrylic & Vinyl
  {
    id: 'mat_acrylic_white_3mm',
    name: 'Cast Acrylic Milky White Sheet 3mm (Diffuser)',
    category: 'Acrylic & Vinyl',
    unit: 'Sheets',
    defaultRate: 1920,
    priceRange: '₹1,750 - ₹2,200 / Sheet',
    defaultSpecs: '100% Cast virgin MMA, 93% high light transmission diffuser, laser-cut compatible without burrs.',
    hsnCode: '392051'
  },
  {
    id: 'mat_acrylic_clear_5mm',
    name: 'Clear Acrylic Solid Sheet 5mm (Logo Base)',
    category: 'Acrylic & Vinyl',
    unit: 'Sheets',
    defaultRate: 3650,
    priceRange: '₹3,200 - ₹4,100 / Sheet',
    defaultSpecs: 'High optical clarity, diamond edge polishable, UV stabilized non-yellowing 5-year guarantee.',
    hsnCode: '392051'
  },
  {
    id: 'mat_vinyl_3m_translucent',
    name: 'Cast Vinyl 3M Translucent Film 3630 Series',
    category: 'Acrylic & Vinyl',
    unit: 'Rolls',
    defaultRate: 16200,
    priceRange: '₹14,500 - ₹18,500 / Roll',
    defaultSpecs: '3M certified exterior signage grade translucent vinyl, matte uniform backlit color.',
    hsnCode: '391990'
  },

  // LED & Electricals
  {
    id: 'mat_led_mod_1_5w',
    name: 'Injection LED Module 1.5W 6500K IP67 (Samsung SMD2835)',
    category: 'LED & Electricals',
    unit: 'Pcs',
    defaultRate: 26,
    priceRange: '₹22 - ₹32 / Piece',
    defaultSpecs: '160-degree optical lens, constant current IC driver, 3M VHB back, ultrasonic waterproof IP68 seal.',
    hsnCode: '854140'
  },
  {
    id: 'mat_power_supply_350w',
    name: 'Meanwell Waterproof Power Supply 12V 350W IP67',
    category: 'LED & Electricals',
    unit: 'Units',
    defaultRate: 2250,
    priceRange: '₹1,850 - ₹2,600 / Unit',
    defaultSpecs: 'Aluminum casing, surge protection 4KV, short circuit and overload auto-recovery with CE/BIS.',
    hsnCode: '850440'
  },

  // Hardware & Fasteners
  {
    id: 'mat_anchor_m10x100',
    name: 'SS304 Wedge Anchor Through Bolts M10x100mm',
    category: 'Hardware & Fasteners',
    unit: 'Boxes',
    defaultRate: 540,
    priceRange: '₹450 - ₹650 / Box',
    defaultSpecs: 'Grade 304 Stainless steel, test certified tensile load capacity for high wind facade installation.',
    hsnCode: '731815'
  },
  {
    id: 'mat_tek_screws_19mm',
    name: 'Zinc Plated Self-Drilling Hex Flange Screws 19mm',
    category: 'Hardware & Fasteners',
    unit: 'Packets',
    defaultRate: 390,
    priceRange: '₹320 - ₹480 / Packet',
    defaultSpecs: 'EPDM bonded weather seal washer, drilling capacity up to 4.5mm steel sections.',
    hsnCode: '731814'
  },

  // Structural Steel & MS
  {
    id: 'mat_ms_shs_50x50',
    name: 'MS Square Hollow Section (SHS) 50x50x2.5mm (6 Mtr)',
    category: 'Structural Steel & MS',
    unit: 'Lengths',
    defaultRate: 1620,
    priceRange: '₹1,450 - ₹1,850 / Length',
    defaultSpecs: 'IS 4923 Grade YSt 210, certified uniform wall thickness, red oxide anti-rust primed.',
    hsnCode: '730661'
  },
  {
    id: 'mat_ms_base_plate_16mm',
    name: 'MS Base Plate 16mm Laser Cut 300x300mm with Stiffeners',
    category: 'Structural Steel & MS',
    unit: 'Pcs',
    defaultRate: 1850,
    priceRange: '₹1,600 - ₹2,200 / Piece',
    defaultSpecs: 'IS 2062 Grade E250 structural plate with pre-drilled anchor slots and gusset stiffeners.',
    hsnCode: '730890'
  },

  // Paints & Coatings
  {
    id: 'mat_pu_enamel_white',
    name: '2K Polyurethane (PU) Topcoat Enamel - Gloss White (4L)',
    category: 'Paints & Coatings',
    unit: 'Packs',
    defaultRate: 560,
    priceRange: '₹480 - ₹650 / Liter',
    defaultSpecs: 'Automotive & signage grade UV protective gloss finish with aliphatic isocyanate hardener.',
    hsnCode: '320890'
  },
  {
    id: 'mat_zinc_primer',
    name: 'Epoxy Zinc Phosphate High Build Anti-Corrosive Primer (4L)',
    category: 'Paints & Coatings',
    unit: 'Packs',
    defaultRate: 420,
    priceRange: '₹360 - ₹510 / Liter',
    defaultSpecs: '500-hour salt spray corrosion resistance for exterior metal facade frameworks.',
    hsnCode: '320820'
  }
];

/**
 * Filter and resolve rate details for a specific material from a vendor's catalog
 */
export function extractVendorRateForMaterial(
  vendor: Vendor,
  materialName: string,
  category: string,
  targetRate?: number
): {
  unitRate: number;
  priceRange: string;
  specs: string;
  leadTimeDays: number;
  matchedItemName: string;
} {
  const normMat = (materialName || '').toLowerCase().trim();
  
  // 1. Try to find direct item match in vendor's catalog
  if (vendor.items && vendor.items.length > 0) {
    const directMatch = vendor.items.find(it => {
      const itName = it.name.toLowerCase();
      return itName.includes(normMat) || normMat.includes(itName) || 
             (normMat.includes('acp') && itName.includes('acp')) ||
             (normMat.includes('acrylic') && itName.includes('acrylic')) ||
             (normMat.includes('led') && itName.includes('led')) ||
             (normMat.includes('screw') && itName.includes('screw')) ||
             (normMat.includes('anchor') && itName.includes('anchor')) ||
             (normMat.includes('pipe') && itName.includes('pipe')) ||
             (normMat.includes('tube') && itName.includes('tube')) ||
             (normMat.includes('paint') && itName.includes('paint')) ||
             (normMat.includes('pu') && itName.includes('pu'));
    });

    if (directMatch) {
      return {
        unitRate: directMatch.finalPrice || directMatch.priceRangeMin,
        priceRange: `₹${directMatch.priceRangeMin.toLocaleString('en-IN')} - ₹${directMatch.priceRangeMax.toLocaleString('en-IN')} / ${directMatch.unit}`,
        specs: directMatch.processDetails || `${directMatch.name} (HSN: ${directMatch.hsnCode || 'N/A'}) - Factory Certified`,
        leadTimeDays: directMatch.leadTimeDays || 2,
        matchedItemName: directMatch.name
      };
    }
  }

  // 2. Lookup standard base rate from catalog
  const catalogItem = SIGNAGE_MATERIALS_CATALOG.find(c => 
    c.name.toLowerCase().includes(normMat) || normMat.includes(c.name.toLowerCase())
  ) || SIGNAGE_MATERIALS_CATALOG.find(c => c.category === category) || SIGNAGE_MATERIALS_CATALOG[0];

  const basePrice = targetRate || catalogItem.defaultRate || 2000;
  
  // 3. Adjust rate based on vendor price tier
  let rateMultiplier = 1.0;
  if (vendor.priceTier === 'ECONOMY') rateMultiplier = 0.93;
  else if (vendor.priceTier === 'PREMIUM') rateMultiplier = 1.08;
  else if (vendor.priceTier === 'HEAVY_INDUSTRIAL') rateMultiplier = 1.03;
  else rateMultiplier = 0.99; // Standard

  const unitRate = Math.round(basePrice * rateMultiplier);
  const minRate = Math.round(unitRate * 0.88);
  const maxRate = Math.round(unitRate * 1.14);

  return {
    unitRate,
    priceRange: `₹${minRate.toLocaleString('en-IN')} - ₹${maxRate.toLocaleString('en-IN')} / ${catalogItem.unit}`,
    specs: `${catalogItem.defaultSpecs} (Supplied by ${vendor.companyName})`,
    leadTimeDays: vendor.priceTier === 'PREMIUM' ? 1 : vendor.priceTier === 'ECONOMY' ? 3 : 2,
    matchedItemName: catalogItem.name
  };
}

/**
 * Generate 3 Shortlisted Vendor Quotations for the exact SAME material
 */
export function generateThreeMaterialQuotes(
  materialName: string,
  category: string,
  quantity: number,
  unit: string,
  vendors: Vendor[],
  targetRate?: number
): QuoteShortlist[] {
  const normQty = quantity > 0 ? quantity : 20;

  // Filter vendors matching this category or material
  let matchingVendors = vendors.filter(v => 
    v.category === category || 
    (v.vendorFor && v.vendorFor.toLowerCase().includes(category.toLowerCase())) ||
    (v.vendorFor && v.vendorFor.toLowerCase().includes((materialName || '').toLowerCase().slice(0, 5)))
  );

  if (matchingVendors.length < 3) {
    const remaining = vendors.filter(v => !matchingVendors.some(m => m.id === v.id));
    matchingVendors = [...matchingVendors, ...remaining];
  }

  const v1 = matchingVendors[0] || vendors[0];
  const v2 = matchingVendors[1] || vendors[1] || vendors[0];
  const v3 = matchingVendors[2] || vendors[2] || vendors[0];

  const rate1 = extractVendorRateForMaterial(v1, materialName, category, targetRate);
  const rate2 = extractVendorRateForMaterial(v2, materialName, category, targetRate);
  const rate3 = extractVendorRateForMaterial(v3, materialName, category, targetRate);

  // Ensure slight realistic variance if vendors share the same rate
  let uRate1 = rate1.unitRate;
  let uRate2 = rate2.unitRate;
  let uRate3 = rate3.unitRate;

  if (uRate2 === uRate1) uRate2 = Math.round(uRate1 * 1.05);
  if (uRate3 === uRate1 || uRate3 === uRate2) uRate3 = Math.round(uRate1 * 0.94);

  const total1 = Math.round(uRate1 * normQty);
  const total2 = Math.round(uRate2 * normQty);
  const total3 = Math.round(uRate3 * normQty);

  const displayMat = materialName || rate1.matchedItemName;

  return [
    {
      quoteId: 'q_1',
      vendorId: v1.id,
      vendorName: v1.name,
      vendorCompany: v1.companyName,
      vendorFor: v1.vendorFor || v1.category,
      materialName: displayMat,
      unitRate: uRate1,
      quantity: normQty,
      unit: unit || 'Units',
      materialPriceRange: rate1.priceRange,
      materialSpecs: rate1.specs,
      quotedAmount: total1,
      deliveryTimelineDays: rate1.leadTimeDays,
      paymentTerms: v1.paymentTerms || '30 Days Net Credit',
      isRecommended: true
    },
    {
      quoteId: 'q_2',
      vendorId: v2.id,
      vendorName: v2.name,
      vendorCompany: v2.companyName,
      vendorFor: v2.vendorFor || v2.category,
      materialName: displayMat,
      unitRate: uRate2,
      quantity: normQty,
      unit: unit || 'Units',
      materialPriceRange: rate2.priceRange,
      materialSpecs: rate2.specs,
      quotedAmount: total2,
      deliveryTimelineDays: Math.max(rate2.leadTimeDays + 1, 2),
      paymentTerms: v2.paymentTerms || '50% Advance, 50% on Delivery',
      isRecommended: false
    },
    {
      quoteId: 'q_3',
      vendorId: v3.id,
      vendorName: v3.name,
      vendorCompany: v3.companyName,
      vendorFor: v3.vendorFor || v3.category,
      materialName: displayMat,
      unitRate: uRate3,
      quantity: normQty,
      unit: unit || 'Units',
      materialPriceRange: rate3.priceRange,
      materialSpecs: rate3.specs,
      quotedAmount: total3,
      deliveryTimelineDays: rate3.leadTimeDays + 2,
      paymentTerms: 'Cash on Delivery / RTGS',
      isRecommended: false
    }
  ];
}
