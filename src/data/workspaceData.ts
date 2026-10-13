import { ProjectGroup, ProjectGroupMessage, MaterialStockItem, BillingInvoice } from '../types';

export const INITIAL_PROJECT_GROUPS: ProjectGroup[] = [
  {
    id: 'group_haldirams_noida',
    projectName: 'Haldirams Flagship Store - Noida Sector 18',
    clientCompanyName: 'Haldirams Products Pvt Ltd',
    clientId: 'client_haldirams',
    brandName: 'Haldirams Sweets & Dine',
    assignedCrmId: 'user_crm_1',
    assignedCrmName: 'Sonali Jamdulkar',
    createdByUserId: 'user_crm_1',
    createdByName: 'Sonali Jamdulkar',
    createdByRole: 'CRM_EMPLOYEE',
    status: 'ONGOING',
    oneDriveSyncedFolder: 'OneDrive/KDPL_Projects/Haldirams_Noida_Sec18/',
    createdAt: '2026-09-15',
    lastActivity: '10 mins ago',
    members: [
      { userId: 'user_admin', name: 'Shailesh Pandey', role: 'ADMIN', designation: 'Founder / MD', joinedAt: '2026-09-15' },
      { userId: 'user_sub_admin', name: 'Dolly Dubey', role: 'SUB_ADMIN', designation: 'Operations & Management Head', joinedAt: '2026-09-15' },
      { userId: 'user_crm_1', name: 'Sonali Jamdulkar', role: 'CRM_EMPLOYEE', designation: 'Sales & Marketing Executive', joinedAt: '2026-09-15' },
      { userId: 'user_designer_1', name: 'Krishna Mishra', role: 'SR_DESIGNER', designation: 'Sr. Graphics & 3D Designer', joinedAt: '2026-09-16' },
      { userId: 'user_structure_designer', name: 'Amit Sharma', role: 'STRUCTURE_DESIGNER', designation: 'Structural CAD Lead', joinedAt: '2026-09-16' },
      { userId: 'user_pm_1', name: 'Sachin Pol', role: 'PROJECT_MANAGER', designation: 'Project Manager', joinedAt: '2026-09-17' },
      { userId: 'user_sup_1', name: 'Sagar Sapate', role: 'SITE_SUPERVISOR', designation: 'Site Execution Supervisor', joinedAt: '2026-09-18' },
      { userId: 'emp_17', name: 'Alka Gupta', role: 'ACCOUNTS', designation: 'Accounts Specialist', joinedAt: '2026-09-18' },
      { userId: 'user_billing_1', name: 'Neha Gupta', role: 'BILLING', designation: 'Billing Lead', joinedAt: '2026-09-18' }
    ],
    reminders: [
      {
        id: 'rem_1',
        title: '3D Render Client Sign-Off Follow-up',
        dueDate: '2026-10-10',
        dueTime: '14:00',
        notes: 'Confirm final facade letter color code with Haldirams Brand Manager Mr. Singhania.',
        setByUserId: 'user_crm_1',
        setByName: 'Sonali Jamdulkar',
        createdAt: '2026-10-06',
        completed: false
      },
      {
        id: 'rem_2',
        title: 'On-Site MS Framework Inspection with Client Architect',
        dueDate: '2026-10-12',
        dueTime: '11:00',
        notes: 'Structural safety clearance on 3rd floor terrace steel brackets.',
        setByUserId: 'user_pm_1',
        setByName: 'Sachin Pol',
        createdAt: '2026-10-07',
        completed: false
      }
    ]
  },
  {
    id: 'group_croma_mall',
    projectName: 'Tata Croma Mega Store - Phoenix Palladium',
    clientCompanyName: 'Infiniti Retail Limited (Tata Croma)',
    clientId: 'client_croma',
    brandName: 'Croma Electronics',
    assignedCrmId: 'user_sub_admin',
    assignedCrmName: 'Rithu Nair',
    createdByUserId: 'user_sub_admin',
    createdByName: 'Rithu Nair',
    createdByRole: 'SUB_ADMIN',
    status: 'ONGOING',
    oneDriveSyncedFolder: 'OneDrive/KDPL_Projects/Tata_Croma_Palladium/',
    createdAt: '2026-09-20',
    lastActivity: '2 hours ago',
    members: [
      { userId: 'user_admin', name: 'Shailesh Pandey', role: 'ADMIN', designation: 'Founder / MD', joinedAt: '2026-09-20' },
      { userId: 'user_sub_admin', name: 'Rithu Nair', role: 'SUB_ADMIN', designation: 'Sales & Ops Head', joinedAt: '2026-09-20' },
      { userId: 'user_designer_2', name: 'Pranav Ingale', role: 'DESIGNER', designation: 'Graphic Designer', joinedAt: '2026-09-21' },
      { userId: 'user_structure_designer', name: 'Amit Sharma', role: 'STRUCTURE_DESIGNER', designation: 'Structural CAD Lead', joinedAt: '2026-09-21' },
      { userId: 'user_pm_1', name: 'Sachin Pol', role: 'PROJECT_MANAGER', designation: 'Project Manager', joinedAt: '2026-09-22' },
      { userId: 'emp_38', name: 'Dilip Rathod', role: 'SITE_SUPERVISOR', designation: 'Field Supervisor', joinedAt: '2026-09-22' },
      { userId: 'emp_17', name: 'Alka Gupta', role: 'ACCOUNTS', designation: 'Accounts Specialist', joinedAt: '2026-09-22' }
    ],
    reminders: [
      {
        id: 'rem_croma_1',
        title: 'Advance Billing GST Invoice Clearance',
        dueDate: '2026-10-11',
        dueTime: '16:30',
        notes: 'Follow up with Infiniti Retail accounts for 50% fabrication advance remittance.',
        setByUserId: 'user_sub_admin',
        setByName: 'Rithu Nair',
        createdAt: '2026-10-05',
        completed: false
      }
    ]
  },
  {
    id: 'group_nike_store',
    projectName: 'Nike Store - High Street Pylon & Internal Signage',
    clientCompanyName: 'Nike India Retail Pvt Ltd',
    clientId: 'client_nike',
    brandName: 'Nike Jordan & Performance',
    assignedCrmId: 'user_crm_2',
    assignedCrmName: 'Meenakshi Pandey',
    createdByUserId: 'user_crm_2',
    createdByName: 'Meenakshi Pandey',
    createdByRole: 'CRM_EMPLOYEE',
    status: 'ONGOING',
    oneDriveSyncedFolder: 'OneDrive/KDPL_Projects/Nike_HighStreet_Pylon/',
    createdAt: '2026-09-28',
    lastActivity: 'Yesterday',
    members: [
      { userId: 'user_admin', name: 'Shailesh Pandey', role: 'ADMIN', designation: 'Founder / MD', joinedAt: '2026-09-28' },
      { userId: 'user_sub_admin', name: 'Dolly Dubey', role: 'SUB_ADMIN', designation: 'Operations & Management Head', joinedAt: '2026-09-28' },
      { userId: 'user_crm_2', name: 'Meenakshi Pandey', role: 'CRM_EMPLOYEE', designation: 'CRM Executive', joinedAt: '2026-09-28' },
      { userId: 'emp_10', name: 'Khushboo Yadav', role: 'DESIGNER', designation: '3D Designer & Visualizer', joinedAt: '2026-09-29' },
      { userId: 'user_structure_designer', name: 'Amit Sharma', role: 'STRUCTURE_DESIGNER', designation: 'Structural CAD Lead', joinedAt: '2026-09-29' },
      { userId: 'user_pm_1', name: 'Sachin Pol', role: 'PROJECT_MANAGER', designation: 'Project Manager', joinedAt: '2026-09-30' },
      { userId: 'emp_39', name: 'Ram Ashish Yadav', role: 'SITE_SUPERVISOR', designation: 'Site Supervisor', joinedAt: '2026-09-30' }
    ],
    reminders: []
  },
  {
    id: 'group_reliance_smart',
    projectName: 'Reliance Smart Bazaar - Kiosk & Department Wayfinding',
    clientCompanyName: 'Reliance Retail Ventures Limited',
    clientId: 'client_reliance',
    brandName: 'Reliance Smart Bazaar',
    assignedCrmId: 'user_crm_1',
    assignedCrmName: 'Sonali Jamdulkar',
    createdByUserId: 'user_crm_1',
    createdByName: 'Sonali Jamdulkar',
    createdByRole: 'CRM_EMPLOYEE',
    status: 'COMPLETED',
    oneDriveSyncedFolder: 'OneDrive/KDPL_Projects/Reliance_SmartBazaar_Archive/',
    createdAt: '2026-08-10',
    lastActivity: '3 days ago',
    members: [
      { userId: 'user_admin', name: 'Shailesh Pandey', role: 'ADMIN', designation: 'Founder / MD', joinedAt: '2026-08-10' },
      { userId: 'user_sub_admin', name: 'Dolly Dubey', role: 'SUB_ADMIN', designation: 'Operations & Management Head', joinedAt: '2026-08-10' },
      { userId: 'user_crm_1', name: 'Sonali Jamdulkar', role: 'CRM_EMPLOYEE', designation: 'CRM Executive', joinedAt: '2026-08-10' },
      { userId: 'user_designer_3', name: 'Vinay Adakhale', role: 'DESIGNER', designation: 'Graphic Designer', joinedAt: '2026-08-11' },
      { userId: 'user_pm_1', name: 'Sachin Pol', role: 'PROJECT_MANAGER', designation: 'Project Manager', joinedAt: '2026-08-12' },
      { userId: 'emp_40', name: 'Santosh Chavan', role: 'SITE_SUPERVISOR', designation: 'Field Supervisor', joinedAt: '2026-08-12' }
    ],
    reminders: []
  }
];

export const INITIAL_PROJECT_MESSAGES: ProjectGroupMessage[] = [
  // Haldirams Project Messages
  {
    id: 'msg_h1',
    groupId: 'group_haldirams_noida',
    senderId: 'user_crm_1',
    senderName: 'Sonali Jamdulkar',
    senderRole: 'CRM_EMPLOYEE',
    timestamp: '2026-10-06 09:30 AM',
    type: 'SYSTEM',
    text: '🚀 Welcome to Project Group: Haldirams Flagship Store - Noida Sector 18. Sonali Jamdulkar created the group and assigned design and site execution leads.'
  },
  {
    id: 'msg_h2',
    groupId: 'group_haldirams_noida',
    senderId: 'user_crm_1',
    senderName: 'Sonali Jamdulkar',
    senderRole: 'CRM_EMPLOYEE',
    timestamp: '2026-10-06 09:35 AM',
    type: 'TEXT',
    text: 'Hi Krishna and Amit, please find the site dimensions and brand guidelines. We need a modern LED back-lit acrylic 3D letter sign with a warm gold ambient tone for the main facade.'
  },
  {
    id: 'msg_h3',
    groupId: 'group_haldirams_noida',
    senderId: 'user_designer_1',
    senderName: 'Krishna Mishra',
    senderRole: 'SR_DESIGNER',
    timestamp: '2026-10-06 02:15 PM',
    type: 'FILE',
    text: 'Initial 3D photorealistic visualization render of the facade with warm amber LED halo back-lit channels.',
    file: {
      id: 'file_haldirams_3d_v1',
      fileName: 'Haldirams_Noida_Facade_3D_Render_Draft1.png',
      fileUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80',
      fileType: 'IMAGE',
      fileSize: '4.8 MB',
      uploadedByUserId: 'user_designer_1',
      uploadedByName: 'Krishna Mishra',
      uploadedByRole: 'SR_DESIGNER',
      uploadedAt: '2026-10-06 02:15 PM',
      status: 'CORRECTION_REQUESTED',
      statusUpdatedByName: 'Sonali Jamdulkar',
      statusUpdatedAt: '2026-10-06 04:30 PM',
      correctionNotes: 'Please increase the acrylic glow channel depth to 75mm and update letter height to 450mm per client branding guidelines.',
      correctionReplyBy: 'Sonali Jamdulkar',
      savedToOneDrive: false
    }
  },
  {
    id: 'msg_h4',
    groupId: 'group_haldirams_noida',
    senderId: 'user_crm_1',
    senderName: 'Sonali Jamdulkar',
    senderRole: 'CRM_EMPLOYEE',
    timestamp: '2026-10-06 04:30 PM',
    type: 'TEXT',
    text: '✏️ Correction Note for Krishna: Please increase the acrylic glow channel depth to 75mm and update letter height to 450mm per client branding guidelines.'
  },
  {
    id: 'msg_h5',
    groupId: 'group_haldirams_noida',
    senderId: 'user_designer_1',
    senderName: 'Krishna Mishra',
    senderRole: 'SR_DESIGNER',
    timestamp: '2026-10-07 11:20 AM',
    type: 'FILE',
    text: 'Updated 3D realistic artwork with 75mm depth and 450mm high signage letters.',
    file: {
      id: 'file_haldirams_3d_v2',
      fileName: 'Haldirams_Noida_Facade_3D_Render_Approved_Final.png',
      fileUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      fileType: 'IMAGE',
      fileSize: '5.2 MB',
      uploadedByUserId: 'user_designer_1',
      uploadedByName: 'Krishna Mishra',
      uploadedByRole: 'SR_DESIGNER',
      uploadedAt: '2026-10-07 11:20 AM',
      status: 'APPROVED',
      statusUpdatedByName: 'Sonali Jamdulkar',
      statusUpdatedAt: '2026-10-07 12:45 PM',
      savedToOneDrive: true,
      oneDrivePath: 'OneDrive/KDPL_Projects/Haldirams_Noida_Sec18/Approved_Assets/Haldirams_Noida_Facade_3D_Render_Approved_Final.png'
    }
  },
  {
    id: 'msg_h6',
    groupId: 'group_haldirams_noida',
    senderId: 'user_structure_designer',
    senderName: 'Amit Sharma',
    senderRole: 'STRUCTURE_DESIGNER',
    timestamp: '2026-10-07 03:40 PM',
    type: 'FILE',
    text: 'Structural engineering CAD framework blueprints and steel frame load calculation sheet.',
    file: {
      id: 'file_haldirams_cad_v1',
      fileName: 'Haldirams_Structure_Framework_CAD_Rev2.pdf',
      fileUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
      fileType: 'CAD',
      fileSize: '8.4 MB',
      uploadedByUserId: 'user_structure_designer',
      uploadedByName: 'Amit Sharma',
      uploadedByRole: 'STRUCTURE_DESIGNER',
      uploadedAt: '2026-10-07 03:40 PM',
      status: 'APPROVED',
      statusUpdatedByName: 'Sachin Pol',
      statusUpdatedAt: '2026-10-07 05:00 PM',
      savedToOneDrive: true,
      oneDrivePath: 'OneDrive/KDPL_Projects/Haldirams_Noida_Sec18/Approved_Assets/Haldirams_Structure_Framework_CAD_Rev2.pdf'
    }
  },
  {
    id: 'msg_h7',
    groupId: 'group_haldirams_noida',
    senderId: 'user_sup_1',
    senderName: 'Sagar Sapate',
    senderRole: 'SITE_SUPERVISOR',
    timestamp: '2026-10-08 09:15 AM',
    type: 'PURCHASE_REQUEST',
    text: 'Site Requisition: Need 30 pcs MS Hollow Square Pipes (50x50x2mm) and 15 sheets Cast Acrylic for terrace framework.',
    purchaseRequestId: 'mat_req_haldirams_1',
    purchaseRequestDetails: {
      itemName: 'MS Hollow Square Pipes 50x50x2mm & Cast Acrylic 5mm',
      quantity: '30 Pcs Pipes + 15 Sheets Acrylic',
      urgency: 'HIGH',
      estimatedCost: 85000,
      status: 'PO_ISSUED',
      accountsReply: 'PO #KDPL-PO-1049 issued to JSW Steel Depot. Material dispatched via Blue Dart Express, tracking BD-901824. ETA: Tomorrow 11:30 AM.',
      replyTimestamp: '2026-10-08 11:45 AM'
    }
  },
  {
    id: 'msg_h8',
    groupId: 'group_haldirams_noida',
    senderId: 'emp_17',
    senderName: 'Alka Gupta (Accounts)',
    senderRole: 'ACCOUNTS',
    timestamp: '2026-10-08 11:45 AM',
    type: 'ACCOUNTS_UPDATE',
    text: '💳 ACCOUNTS BUCKET UPDATE: PO #KDPL-PO-1049 approved & issued to JSW Steel Depot. Material dispatched via Blue Dart Express, tracking BD-901824. Delivery ETA on-site: Tomorrow 11:30 AM. Site Supervisor Sagar please verify delivery challan upon arrival.'
  }
];

export const INITIAL_STOCKS_ITEMS: MaterialStockItem[] = [
  {
    id: 'stk_1',
    itemCode: 'MAT-ACR-001',
    name: 'Cast Acrylic Sheet 3mm Opal White (8x4 ft)',
    category: 'ACRYLIC',
    unit: 'Sheets',
    currentStock: 120,
    reservedForProjects: 35,
    minimumThreshold: 30,
    unitCost: 2200,
    warehouseLocation: 'Bay A-1, KDPL Central Factory',
    lastRestockedDate: '2026-10-01',
    status: 'IN_STOCK'
  },
  {
    id: 'stk_2',
    itemCode: 'MAT-ACR-002',
    name: 'Cast Acrylic Sheet 5mm High-Gloss Clear (8x4 ft)',
    category: 'ACRYLIC',
    unit: 'Sheets',
    currentStock: 18,
    reservedForProjects: 15,
    minimumThreshold: 25,
    unitCost: 3400,
    warehouseLocation: 'Bay A-2, KDPL Central Factory',
    lastRestockedDate: '2026-09-20',
    status: 'LOW_STOCK'
  },
  {
    id: 'stk_3',
    itemCode: 'MAT-STEEL-001',
    name: 'MS Hollow Square Pipe 50x50x2mm (6 Meter Length)',
    category: 'METALS_STEEL',
    unit: 'Pipes',
    currentStock: 180,
    reservedForProjects: 60,
    minimumThreshold: 50,
    unitCost: 1150,
    warehouseLocation: 'Yard B-3, Metal Fabrication Section',
    lastRestockedDate: '2026-10-04',
    status: 'IN_STOCK'
  },
  {
    id: 'stk_4',
    itemCode: 'MAT-ALU-001',
    name: 'Aluminum Sign Extrusion Profile 4 Meter',
    category: 'METALS_STEEL',
    unit: 'Lengths',
    currentStock: 95,
    reservedForProjects: 20,
    minimumThreshold: 30,
    unitCost: 950,
    warehouseLocation: 'Yard B-1, Metal Fabrication Section',
    lastRestockedDate: '2026-09-25',
    status: 'IN_STOCK'
  },
  {
    id: 'stk_5',
    itemCode: 'MAT-LED-001',
    name: 'Samsung 3-LED Injection Module 1.5W Warm Amber (IP68)',
    category: 'LEDS_ELECTRICAL',
    unit: 'Pcs',
    currentStock: 2400,
    reservedForProjects: 800,
    minimumThreshold: 1000,
    unitCost: 28,
    warehouseLocation: 'Secure Store C-1, Electronics Hub',
    lastRestockedDate: '2026-10-02',
    status: 'IN_STOCK'
  },
  {
    id: 'stk_6',
    itemCode: 'MAT-PWR-001',
    name: 'MeanWell Waterproof LED Power Supply 12V 350W (IP67)',
    category: 'LEDS_ELECTRICAL',
    unit: 'Units',
    currentStock: 42,
    reservedForProjects: 12,
    minimumThreshold: 15,
    unitCost: 2850,
    warehouseLocation: 'Secure Store C-2, Electronics Hub',
    lastRestockedDate: '2026-09-28',
    status: 'IN_STOCK'
  },
  {
    id: 'stk_7',
    itemCode: 'MAT-VINYL-001',
    name: '3M Translucent Vinyl Film 3630 Series - Brilliant White (50M Roll)',
    category: 'VINYL_PRINTING',
    unit: 'Rolls',
    currentStock: 8,
    reservedForProjects: 3,
    minimumThreshold: 5,
    unitCost: 18500,
    warehouseLocation: 'Print Studio D-1',
    lastRestockedDate: '2026-09-18',
    status: 'IN_STOCK'
  },
  {
    id: 'stk_8',
    itemCode: 'MAT-FAST-001',
    name: 'SS-304 Heavy Duty Anchor Expansion Bolts 12x100mm',
    category: 'HARDWARE_FASTENERS',
    unit: 'Boxes (100 Pcs)',
    currentStock: 4,
    reservedForProjects: 3,
    minimumThreshold: 8,
    unitCost: 1450,
    warehouseLocation: 'Hardware Shelf E-2',
    lastRestockedDate: '2026-09-10',
    status: 'LOW_STOCK'
  }
];

export const INITIAL_BILLING_INVOICES: BillingInvoice[] = [
  {
    id: 'inv_001',
    invoiceNumber: 'KDPL-INV-2026-0041',
    workId: 'group_haldirams_noida',
    projectName: 'Haldirams Flagship Store - Noida Sector 18',
    clientCompanyName: 'Haldirams Products Pvt Ltd',
    clientGst: '07AAACH1092Q1ZV',
    clientAddress: 'B-12, Sector 18, Commercial Belt, Noida, UP - 201301',
    milestoneTitle: 'Phase 1: Advance Booking & 3D Engineering Sign-off',
    taxableAmount: 240000,
    gstRate: 18,
    gstAmount: 43200,
    totalAmount: 283200,
    invoiceDate: '2026-09-20',
    dueDate: '2026-09-30',
    paymentStatus: 'PAID',
    paymentReceivedDate: '2026-09-28',
    bankDetails: {
      bankName: 'HDFC Bank Ltd',
      accountNo: '50200084918234',
      ifscCode: 'HDFC0001092'
    }
  },
  {
    id: 'inv_002',
    invoiceNumber: 'KDPL-INV-2026-0058',
    workId: 'group_haldirams_noida',
    projectName: 'Haldirams Flagship Store - Noida Sector 18',
    clientCompanyName: 'Haldirams Products Pvt Ltd',
    clientGst: '07AAACH1092Q1ZV',
    clientAddress: 'B-12, Sector 18, Commercial Belt, Noida, UP - 201301',
    milestoneTitle: 'Phase 2: Fabrication Completion & Material Dispatch',
    taxableAmount: 360000,
    gstRate: 18,
    gstAmount: 64800,
    totalAmount: 424800,
    invoiceDate: '2026-10-06',
    dueDate: '2026-10-16',
    paymentStatus: 'UNPAID',
    bankDetails: {
      bankName: 'HDFC Bank Ltd',
      accountNo: '50200084918234',
      ifscCode: 'HDFC0001092'
    }
  },
  {
    id: 'inv_003',
    invoiceNumber: 'KDPL-INV-2026-0039',
    workId: 'group_croma_mall',
    projectName: 'Tata Croma Mega Store - Phoenix Palladium',
    clientCompanyName: 'Infiniti Retail Limited (Tata Croma)',
    clientGst: '27AABCI4892K1ZX',
    clientAddress: 'Unit G-12, Phoenix Palladium, Lower Parel, Mumbai - 400013',
    milestoneTitle: 'Phase 1: Project Mobilization & Initial CAD Sign-off',
    taxableAmount: 180000,
    gstRate: 18,
    gstAmount: 32400,
    totalAmount: 212400,
    invoiceDate: '2026-09-25',
    dueDate: '2026-10-05',
    paymentStatus: 'PAID',
    paymentReceivedDate: '2026-10-03',
    bankDetails: {
      bankName: 'HDFC Bank Ltd',
      accountNo: '50200084918234',
      ifscCode: 'HDFC0001092'
    }
  }
];
