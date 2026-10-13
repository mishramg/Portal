export type UserRole = 
  | 'ADMIN' 
  | 'SUB_ADMIN' 
  | 'CRM_EMPLOYEE' 
  | 'PROJECT_MANAGER'
  | 'DESIGNER' 
  | 'SR_DESIGNER'
  | 'SENIOR_DESIGNER'
  | 'STRUCTURE_DESIGNER'
  | 'PROJECT_COORDINATOR' 
  | 'SITE_SUPERVISOR'
  | 'HR'
  | 'ACCOUNTS'
  | 'PURCHASE'
  | 'BILLING'
  | 'STOCKS'
  | 'FACILITY_MANAGER'
  | 'FACTORY_STAFF'
  | 'VENDOR_MANAGER'
  | 'IT_PERSON';

export type NavTab = 
  | 'HOME'
  | 'DASHBOARD'
  | 'CLIENTS'
  | 'LEADS'
  | 'CRM_WORKFLOW'
  | 'PROJECT_GROUP_WORKSPACE'
  | 'QUOTATION_ENGINE'
  | 'DESIGN_PORTAL'
  | 'STRUCTURE_DESIGNER_WORKSPACE'
  | 'DESIGN_REQUESTS'
  | 'PROJECT_MANAGER_OTP'
  | 'SUPERVISOR_DESK'
  | 'SUPERVISOR_ALLOCATION'
  | 'SUPERVISOR_DOCS'
  | 'SUPERVISOR_AUDIT'
  | 'SITE_SUPERVISOR_PORTAL'
  | 'SITE_PROGRESS_REQS'
  | 'SITE_EOD_HUB'
  | 'SITE_ONEDRIVE_SYNC'
  | 'SITE_OTP_DISPATCH'
  | 'SITE_SUPERVISOR_MATERIAL_REQ'
  | 'SITE_VISIT'
  | 'ABOUT_EMPLOYEES'
  | 'SERVICE_CATALOG'
  | 'USER_MANAGEMENT'
  | 'HR_ATTENDANCE'
  | 'ACCOUNTS_REIMBURSEMENT'
  | 'ACCOUNTS_MATERIAL_REQUISITION'
  | 'PURCHASE_BUCKET'
  | 'BILLING_DESK'
  | 'STOCKS_INVENTORY'
  | 'MY_REIMBURSEMENTS'
  | 'MY_ATTENDANCE'
  | 'STAFF_RECE_WORKSPACE'
  | 'PURCHASE_DESK'
  | 'VENDOR_DIRECTORY';

export interface SiteVisitRecord {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  employeeRole: UserRole;
  department?: string;
  visitPurpose: string;
  siteLocation: string;
  startTime: string;
  endTime?: string;
  entryPhotoUrl?: string;
  exitPhotoUrl?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  employeeName: string;
  category: 'LEGAL' | 'BANK';
  documentName: string;
  fileUrl: string;
  uploadedAt: string;
  fileSize?: string;
  folderPath: string; // e.g., "Employee Documents Root/Rahul Mehta/Legal Details"
}

export interface Tombstone {
  entity: 'users' | 'attendance' | 'site_visits' | 'leads' | 'clients' | 'works' | 'reimbursements';
  id: string;
  deletedAt: string;
}

export interface SalaryDetails {
  basicSalary: number;
  annualSalary: number;
  payFrequency: 'Monthly' | 'Annual';
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  panNumber: string;
  uanNumber?: string;
  pfNumber?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  active: boolean;
  employeeCode?: string;
  accessPin?: string;
  password?: string;
  passwordLastChangedAt?: string;
  designation?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  reportingTo?: string;
  joiningDate?: string;
  dateOfBirth?: string;
  salaryDetails?: SalaryDetails;
  bankDetails?: BankDetails;
  permissions?: string[];
}

export interface Festival {
  id: string;
  name: string;
  date: string; // 'YYYY-MM-DD' or 'MM-DD'
  description: string;
  holidayType: 'OFFICIAL' | 'OPTIONAL' | 'CORPORATE_EVENT';
}

export interface ClientCompany {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
  industry?: string;
  createdAt: string;
  totalWorksCount: number;
  lastUpdatedByName?: string;
  lastUpdatedByRole?: UserRole;
}

export interface BirthdayWish {
  id: string;
  targetEmployeeId: string;
  targetEmployeeName: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  message?: string;
  reaction?: string;
  createdAt: string;
}

export type LeadStatus = 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CONVERTED_TO_WORK'
  | 'ON_HOLD'
  | 'ONGOING'
  | 'COMPLETED';

export interface Lead {
  id: string;
  title: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  clientAddress?: string;
  gstNumber?: string;
  estimatedBudget: number;
  requirements: string;
  submittedByCrmId: string;
  submittedByCrmName: string;
  status: LeadStatus;
  adminNotes?: string;
  attachmentDocUrl?: string;
  attachmentDocType?: 'AUDIO' | 'IMAGE' | 'TEXT';
  attachmentDocName?: string;
  extractedTextFormat?: string;
  createdAt: string;
  lastUpdatedByName?: string;
  lastUpdatedByRole?: UserRole;
  assignedByAdminId?: string;
  assignedByAdminName?: string;
  assignedByAdminRole?: string;
}

export type ApprovalStatus = 'PENDING' | 'SENT' | 'EDITS' | 'APPROVED' | 'REJECTED';

export interface VisitReport {
  visitDate: string;
  notes: string;
  images: string[];
  attachments?: { name: string; url?: string; type: 'IMAGE' | 'AUDIO' | 'DOCUMENT' }[];
  submittedAt?: string;
}

export interface PptReport {
  title: string;
  fileUrl?: string;
  fileName?: string;
  notes?: string;
  submittedAt?: string;
}

export interface DesignerBrief {
  briefText: string;
  attachments: string[];
  assignedDesignerId: string;
  assignedDesignerName: string;
  assignedAt: string;
}

export interface DesignDeliverable {
  title: string;
  fileUrl?: string;
  fileName?: string;
  comments?: string;
  updatedAt?: string;
}

export interface QuotationLineItem {
  id: string;
  description: string;
  itemTitle?: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  imageUrl?: string;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  date: string;
  validUntil: string;
  clientCompanyName: string;
  clientContactPerson: string;
  clientAddress: string;
  clientGst?: string;
  clientPhone: string;
  clientEmail?: string;
  subject: string;
  items: QuotationLineItem[];
  subtotal: number;
  taxType?: 'IGST' | 'CGST_SGST';
  gstTaxRatePercent: number;
  taxAmount: number;
  igstRatePercent?: number;
  igstAmount?: number;
  cgstRatePercent?: number;
  cgstAmount?: number;
  sgstRatePercent?: number;
  sgstAmount?: number;
  discountType?: 'PERCENT' | 'AMOUNT';
  discountPercent?: number;
  discountAmount?: number;
  isRoundOffEnabled?: boolean;
  roundOffAmount?: number;
  totalAmount: number;
  termsAndConditions: string[];
  preparedByCrmName: string;
  status: ApprovalStatus;
  pdfAttached?: boolean;
  lastUpdatedByName?: string;
  lastUpdatedByRole?: UserRole;
  currencySymbol?: string;
  companyLogoUrl?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  websiteUrl?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNo?: string;
  authorizedSignatoryName?: string;
  authorizedSignatureUrl?: string;
}

export interface BoqApproval {
  submittedForReview: boolean;
  finalSubmitted: boolean;
  submittedAt?: string;
  finalSubmittedAt?: string;
  boqNotes?: string;
}

export interface OrderConfirmationProof {
  proofType: 'IMAGE' | 'AUDIO' | 'FILE';
  fileUrl: string;
  fileName: string;
  notes: string;
  confirmedAt: string;
}

export interface DailySiteAssignment {
  id: string;
  date: string;
  siteSupervisorId: string;
  siteSupervisorName: string;
  assignedBySupervisorName: string;
  notes?: string;
  assignmentOtpCode?: string;
  sentToPhone?: string;
}

export interface SitePunchIn {
  id: string;
  date: string;
  punchInTime: string;
  photoUrl: string;
  locationAddress: string;
  latitude?: number;
  longitude?: number;
}

export interface SiteUpdateReq {
  id: string;
  timestamp: string;
  updateText: string;
  materialRequirements: string;
  urgent: boolean;
  status?: 'PENDING' | 'APPROVED' | 'DISPATCHED';
  approvedAmount?: number;
}

export interface SiteSnagItem {
  id: string;
  location: string;
  issueDescription: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  reportedAt: string;
  photoUrl?: string;
  resolvedAt?: string;
}

export interface SiteEodReport {
  id: string;
  date: string;
  summaryOfWorkDone: string;
  challengesFaced?: string;
  completionPercentage: number;
  completedWorkImages: string[];
  cloudFolderSyncPath: string; // e.g. "OneDrive / KAMLAWATI CRM PORTAL / Suresh_Kumar - 2026-07-25 - Apex_Retail_Hub"
  submittedAt: string;
}

export type CrmWorkStep = 
  | 'STEP_ASSIGN_PERSON'
  | 'STEP_A_VISIT_REPORT'
  | 'STEP_B_PPT_REPORT'
  | 'STEP_C_REPORT_STATUS'
  | 'STEP_D_ASSIGN_DESIGNER'
  | 'STEP_E_DESIGN_STATUS'
  | 'STEP_F_QUOTE_PREPARED'
  | 'STEP_G_QUOTE_STATUS'
  | 'STEP_H_BOQ_APPROVAL'
  | 'STEP_I_ORDER_CONFIRMED'
  | 'STEP_SUPERVISOR_PHASE'
  | 'COMPLETED';

export interface SiteSupervisorOtp {
  id: string;
  otpCode: string;
  purpose: string;
  generatedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'DISPATCHED';
  verifiedBy?: string;
  verifiedAt?: string;
  sentToPhone?: string;
}

export interface SupervisorOtpRequest {
  id: string;
  requestedBySupervisorName: string;
  requestedByRole: 'PROJECT_COORDINATOR' | 'SITE_SUPERVISOR';
  companyName: string;
  brandName: string;
  otpCode: string;
  requestedAt: string;
  status: 'PENDING' | 'SHARED';
}

export interface DesignRequestRevision {
  id: string;
  note: string;
  attachmentUrl?: string;
  attachmentName?: string;
  submittedFileUrl?: string;
  submittedFileName?: string;
  createdAt: string;
  createdByName: string;
  createdByRole: string;
}

export interface DesignRequest {
  id: string;
  requestedById: string;
  requestedByName: string;
  requestedByRole: string;
  assignedDesignerId?: string;
  assignedDesignerName?: string;
  briefText: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED_FOR_REVIEW' | 'REVISION_REQUESTED' | 'COMPLETED';
  responseFileUrl?: string;
  responseFileName?: string;
  revisionNotes?: string;
  revisionAttachmentUrl?: string;
  revisionAttachmentName?: string;
  revisionHistory?: DesignRequestRevision[];
  createdAt: string;
  updatedAt: string;
}

export type WorkAdminStatus = 'ONGOING' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED' | 'PENDING_APPROVAL';

export interface WorkAssignment {
  id: string;
  workTitle: string;
  clientId: string;
  clientCompanyName: string;
  brandName: string;
  assignedCrmId: string;
  assignedCrmName: string;
  siteLocationAddress?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientGst?: string;

  // Admin Level Status & Action Overrides
  adminStatus?: WorkAdminStatus;
  adminStatusNotes?: string;
  adminStatusUpdatedAt?: string;
  adminStatusUpdatedByName?: string;
  adminStatusUpdatedByRole?: UserRole;

  // Step 1: Assign to person for receipt / work (anyone including admin)
  assignedPersonId?: string;
  assignedPersonName?: string;
  assignedPersonRole?: string;
  assignmentNotes?: string;
  assignmentAssignedAt?: string;
  
  // Workflow step state
  currentStep: CrmWorkStep;
  crmCompleted: boolean;

  // Step payloads
  visitReport?: VisitReport;
  pptReport?: PptReport;
  reportStatus?: ApprovalStatus;
  designerBrief?: DesignerBrief;
  designDeliverable?: DesignDeliverable;
  designStatus?: ApprovalStatus;

  // Detailed Designer Team Workflow State
  assignedSeniorDesignerId?: string;
  assignedSeniorDesignerName?: string;
  assignedSubDesignerId?: string;
  assignedSubDesignerName?: string;
  seniorDesignerNotes?: string;
  seniorDesignerAssignedAt?: string;

  designerBriefStatus?: 'PENDING' | 'WORKING' | 'HOLD' | 'SCHEDULED';
  designerRecePptUrl?: string;
  designerRecePptTitle?: string;
  designerRecePptComments?: string;
  designerRecePptSubmittedAt?: string;
  designerRecePptApprovedByCrm?: 'PENDING' | 'APPROVED' | 'EDITS';
  designerRecePptCrmComments?: string;
  receEditsCount?: number;

  designerDesignStatus?: 'NOT_STARTED' | 'WORKING' | 'HOLD' | 'COMPLETED';
  designerDesignPptUrl?: string;
  designerDesignPptTitle?: string;
  designerDesignPptComments?: string;
  designerDesignPptSubmittedAt?: string;
  designerDesignPptApprovedByCrm?: 'PENDING' | 'APPROVED' | 'EDITS';
  designerDesignPptCrmComments?: string;
  designEditsCount?: number;
  crmDesignBrief?: {
      briefText: string;
      briefSentAt: string;
  };
  designRequests?: DesignRequest[];

  quotation?: Quotation;
  quotationStatus?: ApprovalStatus;
  quotationLastReminderAt?: string;
  quotationFollowUpNotes?: string;
  boqApproval?: BoqApproval;
  orderConfirmation?: OrderConfirmationProof;

  // Supervisor security OTP
  supervisorOtpCode?: string; // 6-digit OTP code created when BOQ/Order is confirmed
  unlockedBySupervisorIds?: string[]; // Supervisors who entered valid OTP
  supervisorUnlockedAtMap?: Record<string, string>; // userId or workId -> ISO timestamp when unlocked
  supervisorOtpRequests?: SupervisorOtpRequest[]; // OTP requests dispatched to CRM Execs

  // Site Supervisor OTP Dispatches
  siteSupervisorOtps?: SiteSupervisorOtp[];

  // Supervisor & Site execution
  assignedSupervisorId?: string;
  assignedSupervisorName?: string;
  dailySiteAssignments?: DailySiteAssignment[];
  supervisorCompletedStep3?: boolean;
  
  // RECE (Real Estate / Site Execution / Visit & Receipt) Hub
  receStatus?: 'PENDING' | 'WANTS_TO_GO' | 'NOT_INTERESTED' | 'COMPLETED';
  receUpdatedByName?: string;
  receUpdatedByRole?: string;
  receSubmission?: {
    notes: string;
    imageUrls: string[];
    documentNames: string[];
    submittedAt: string;
    submittedBy: string;
  };
  
  // Site logs
  punchIns?: SitePunchIn[];
  siteUpdates?: SiteUpdateReq[];
  snagList?: SiteSnagItem[];
  eodReports?: SiteEodReport[];

  createdAt: string;
  updatedAt: string;
  lastUpdatedByName?: string;
  lastUpdatedByRole?: UserRole;
}

export interface ServiceAssignment {
  id: string;
  serviceName: string;
  category: 'ELECTRICAL' | 'SIGNAGE' | 'CARPENTRY' | 'REAL_ESTATE_ADVERTISING' | 'INTERIOR_WORKS' | 'EXTERIOR_FACADE' | 'PEST_CONTROL' | 'PAINTING' | 'HVAC' | 'PLUMBING' | 'CIVIL' | 'SAFETY';
  assignedPersonId: string;
  assignedPersonName: string;
  assignedRole: string;
  workId: string;
  workTitle: string;
  clientCompanyName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  manpowerCount: number;
  scheduledDate: string;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  notes?: string;
  otpCode?: string;
  lastUpdatedByName?: string;
  lastUpdatedByRole?: UserRole;
}

export type MaterialRequestCategory = 
  | 'RAW_MATERIALS' 
  | 'SAFETY_GEAR' 
  | 'POWER_TOOLS' 
  | 'HEAVY_EQUIPMENT' 
  | 'ELECTRICAL_PLUMBING' 
  | 'MISC_HARDWARE';

export type MaterialRequestStatus = 
  | 'PENDING_ACCOUNTS' 
  | 'SANCTIONED' 
  | 'PAID' 
  | 'REJECTED';

export interface MaterialRequest {
  id: string;
  requestNumber: string;
  requestedByUserId: string;
  requestedByName: string;
  requestedByRole: UserRole;
  requestedByDepartment?: string;
  siteOrProjectName: string;
  workId?: string;
  category: MaterialRequestCategory;
  itemName: string;
  quantity: string;
  estimatedCost: number;
  urgency: 'NORMAL' | 'HIGH' | 'EMERGENCY_IMMEDIATE';
  requiredByDate: string;
  vendorName?: string;
  vendorContact?: string;
  quotationDocUrl?: string;
  notes: string;
  status: MaterialRequestStatus;
  
  accountsApprovedBy?: string;
  accountsApprovalDate?: string;
  accountsNotes?: string;
  rejectionReason?: string;
  
  paymentMode?: 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'COMPANY_CARD';
  paymentRefNo?: string;
  paymentDate?: string;
  disbursedAmount?: number;
  disbursedByName?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'LEAD' | 'WORK' | 'DESIGN' | 'QUOTE' | 'OTP' | 'SITE_PUNCH' | 'REIMBURSEMENT' | 'MATERIAL_REQUISITION';
  targetTab?: string;
  targetRole?: UserRole | 'ALL' | 'ADMIN_ONLY';
  targetUserId?: string;
}

export type ReimbursementCategory = 
  | 'TRAVEL_CONVEYANCE' 
  | 'SITE_MATERIAL' 
  | 'CLIENT_MEETING' 
  | 'FOOD_ALLOWANCE' 
  | 'EQUIPMENT_TOOLS' 
  | 'MISCELLANEOUS';

export type ReimbursementStatus = 
  | 'PENDING_ACCOUNTS' 
  | 'APPROVED_BY_ACCOUNTS' 
  | 'APPROVED_BY_ADMIN' 
  | 'PAID' 
  | 'REJECTED';

export interface ReimbursementClaim {
  id: string;
  claimNumber: string;
  applicantId: string;
  applicantName: string;
  applicantRole: UserRole;
  applicantDepartment: string;
  title: string;
  category: ReimbursementCategory;
  amount: number;
  claimDate: string;
  workId?: string;
  workTitle?: string;
  notes: string;
  proofDocumentUrl?: string;
  status: ReimbursementStatus;
  
  // Level 1 Approval (Accounts)
  accountsApprovedBy?: string;
  accountsApprovalDate?: string;
  accountsNotes?: string;
  
  // Level 2 Approval (Admin / SubAdmin)
  adminApprovedBy?: string;
  adminApprovalDate?: string;
  adminNotes?: string;
  
  rejectionReason?: string;
  rejectedByRole?: UserRole;
  
  // Payment Clearance
  paymentDate?: string;
  paymentMode?: 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'COMPANY_CARD';
  paymentRefNo?: string;
  paymentScreenshotUrl?: string;
  disbursedByName?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  employeeRole: UserRole;
  department: string;
  status: 'PRESENT' | 'HALF_DAY' | 'ON_FIELD' | 'LATE' | 'ABSENT';
  punchInTime: string;
  punchOutTime?: string;
  locationAddress: string;
  punchOutLocationAddress?: string;
  photoUrl?: string;
  punchOutPhotoUrl?: string;
  siteWorkTitle?: string;
  notes?: string;
  googleDriveSyncUrl?: string;
}

export interface CompanyProfile {
  companyName: string;
  shortName: string;
  subtitle: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  gstin: string;
  panNumber?: string;
  logoInitial: string;
  logoUrl?: string;
  bankName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
}

// ----------------- PURCHASE & PROCUREMENT ENGINE -----------------

export type RequirementType = 'ON_SITE' | 'FACTORY';

export type RequirementStatus = 
  | 'PENDING_PM_CONFIRMATION'
  | 'PM_CONFIRMED'
  | 'PM_REJECTED'
  | 'SENT_TO_PURCHASE'
  | 'PROCUREMENT_IN_PROGRESS'
  | 'FULFILLED';

export interface ProcurementRequirement {
  id: string;
  reqNumber: string;
  type: RequirementType;
  siteOrProjectName: string;
  workId?: string;
  factoryUnit?: string;
  department?: string; // Production, Fabrication, Electrical, Installation
  itemName: string;
  itemCategory: string;
  specification: string;
  quantity: string;
  unit: string; // Bags, Kgs, Meters, Sheets, Pieces, Nos, Sq.Ft
  estimatedRate?: number;
  estimatedTotal?: number;
  urgency: 'NORMAL' | 'HIGH' | 'EMERGENCY_IMMEDIATE';
  requiredByDate: string;
  locationAddress: string;
  siteSupervisorId?: string;
  siteSupervisorName?: string;
  siteSupervisorPhone?: string;
  requestedById: string;
  requestedByName: string;
  requestedByRole: UserRole;
  notes?: string;
  attachmentUrl?: string;
  
  // Project Manager Verification Gate
  pmConfirmationStatus: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  pmConfirmedById?: string;
  pmConfirmedByName?: string;
  pmConfirmedDate?: string;
  pmNotes?: string;
  
  status: RequirementStatus;
  linkedPurchaseOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  priceRangeMin: number;
  priceRangeMax: number;
  finalPrice: number;
  taxRatePct: number;
  hsnCode?: string;
  processDetails: string;
  moq?: string;
  leadTimeDays?: number;
}

export interface Vendor {
  id: string;
  name: string;
  companyName: string;
  category: string;
  vendorFor: string; // Specific material/trade purpose, e.g. "ACP Sheets, Cladding Panels & Extrusions"
  phone: string;
  email: string;
  address: string;
  city: string;
  gstin: string;
  panNumber?: string;
  priceTier: 'ECONOMY' | 'STANDARD' | 'PREMIUM' | 'HEAVY_INDUSTRIAL';
  priceRangeText: string;
  rating: number;
  paymentTerms: string;
  verified: boolean;
  items: VendorItem[];
  remarks?: string;
  createdAt: string;
}

export interface QuoteShortlist {
  quoteId: string;
  vendorId: string;
  vendorName: string;
  vendorCompany: string;
  vendorFor?: string;
  materialName?: string; // Exact requested material name
  unitRate?: number; // Unit rate specifically for this material
  quantity?: number; // Quantity quoted
  unit?: string; // Unit of measurement (Sheet, Pcs, Length, etc.)
  materialPriceRange?: string; // Vendor's catalog price band, e.g. "₹1,800 - ₹2,450 / Sheet"
  materialSpecs?: string; // Vendor's specification / quality compliance
  quotedAmount: number; // Total amount = unitRate * quantity (or total package bid)
  deliveryTimelineDays: number;
  paymentTerms: string;
  documentUrl?: string;
  documentTitle?: string;
  isRecommended?: boolean;
  pros?: string;
  cons?: string;
}

export interface AdminPurchaseApproval {
  id: string;
  approvalNumber: string;
  title: string;
  requirementId?: string;
  projectName: string;
  itemSummary: string;
  materialName?: string; // Explicit material name for which quotes were collected
  quantity?: number;
  unit?: string;
  targetUnitRate?: number;
  category: string;
  shortlistedQuotes: QuoteShortlist[];
  selectedQuoteVendorId?: string;
  estimatedBudget: number;
  submittedById: string;
  submittedByName: string;
  submittedDate: string;
  purchaseOfficerNotes: string;
  status: 'PENDING_ADMIN_APPROVAL' | 'ADMIN_APPROVED' | 'ADMIN_REJECTED' | 'CHANGES_REQUESTED';
  adminApprovedById?: string;
  adminApprovedByName?: string;
  adminDecisionDate?: string;
  adminNotes?: string;
  linkedPurchaseOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  itemName: string;
  description?: string;
  hsnCode?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRatePct: number;
  amount: number;
  processDetails?: string;
  mtcRequired: boolean;
}

export interface DeliveryChallan {
  id: string;
  challanNumber: string;
  date: string;
  receivedByUserId: string;
  receivedByName: string;
  receivedByRole: UserRole;
  receivedLocation: string;
  receivedItemsNotes: string;
  qualityStatus: 'INSPECTED_OK' | 'PARTIAL_DAMAGE' | 'SHORTAGE_REPORTED';
  documentUrl?: string;
  signatureName?: string;
  verifiedAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  date: string;
  requirementId?: string;
  adminApprovalId?: string;
  vendorId: string;
  vendorName: string;
  vendorCompany: string;
  vendorPhone: string;
  vendorEmail: string;
  vendorAddress: string;
  vendorGstin: string;
  destinationType: 'ON_SITE' | 'FACTORY';
  destinationName: string;
  destinationAddress: string;
  receiverSupervisorId?: string;
  receiverSupervisorName?: string;
  receiverSupervisorPhone?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  paymentTerms: string;
  deliveryTerms: string;
  specialInstructions?: string;
  status: 'DRAFT' | 'PO_ISSUED' | 'DISPATCHED_IN_TRANSIT' | 'DELIVERED_AT_SITE' | 'DELIVERY_CHALLAN_VERIFIED' | 'CANCELLED';
  dispatchDetails?: {
    transporterName?: string;
    vehicleNumber?: string;
    driverName?: string;
    driverPhone?: string;
    dispatchDate?: string;
    currentTransitLocation?: string;
    expectedDeliveryTime?: string;
    trackingNotes?: string;
    lastLocationUpdateTimestamp?: string;
  };
  deliveryChallan?: DeliveryChallan;
  mtcStatus: 'NOT_REQUIRED' | 'MTC_REQUESTED' | 'MTC_RECEIVED' | 'MTC_VERIFIED';
  mtcDocumentUrl?: string;
  mtcLastReminderDate?: string;
  mtcReminderCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// WHATSAPP GROUP-STYLE PROJECT WORKSPACE & FILE REVIEW TYPES
// ============================================================================

export type ProjectFileStatus = 
  | 'PENDING_REVIEW' 
  | 'APPROVED' 
  | 'CORRECTION_REQUESTED' 
  | 'REJECTED';

export interface ProjectGroupFile {
  id: string;
  fileName: string;
  fileUrl?: string;
  fileType: 'IMAGE' | 'PDF' | 'CAD' | 'PPT' | 'DOCUMENT';
  fileSize?: string;
  uploadedByUserId: string;
  uploadedByName: string;
  uploadedByRole: UserRole;
  uploadedAt: string;
  status: ProjectFileStatus;
  statusUpdatedByName?: string;
  statusUpdatedAt?: string;
  correctionNotes?: string;
  correctionReplyBy?: string;
  rejectionReason?: string;
  savedToOneDrive: boolean;
  oneDrivePath?: string;
}

export interface ProjectGroupReminder {
  id: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  notes?: string;
  setByUserId: string;
  setByName: string;
  createdAt: string;
  completed: boolean;
}

export interface ProjectGroupMessage {
  id: string;
  groupId: string; // matches workId
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  text?: string;
  timestamp: string;
  createdAt?: string;
  type: 'TEXT' | 'FILE' | 'PURCHASE_REQUEST' | 'ACCOUNTS_UPDATE' | 'REMINDER_ALERT' | 'SYSTEM';
  file?: ProjectGroupFile;
  purchaseRequestId?: string;
  purchaseRequestDetails?: {
    itemName: string;
    quantity: string;
    urgency: string;
    estimatedCost?: number;
    status: string;
    accountsReply?: string;
    replyTimestamp?: string;
  };
  reminder?: ProjectGroupReminder;
}

export interface ProjectGroup {
  id: string; // workId
  projectName: string;
  clientCompanyName: string;
  clientId: string;
  brandName?: string;
  assignedCrmId: string;
  assignedCrmName: string;
  createdByUserId?: string;
  createdByName?: string;
  createdByRole?: UserRole;
  members: {
    userId: string;
    name: string;
    role: UserRole;
    designation?: string;
    joinedAt: string;
  }[];
  status: 'ONGOING' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  reminders: ProjectGroupReminder[];
  oneDriveSyncedFolder: string;
  lastActivity: string;
  createdAt: string;
}

// ============================================================================
// STOCKS & INVENTORY MANAGEMENT
// ============================================================================

export interface MaterialStockItem {
  id: string;
  itemCode: string;
  name: string;
  category: 'ACRYLIC' | 'METALS_STEEL' | 'LEDS_ELECTRICAL' | 'VINYL_PRINTING' | 'HARDWARE_FASTENERS' | 'WOOD_BOARDS';
  unit: string;
  currentStock: number;
  reservedForProjects: number;
  minimumThreshold: number;
  unitCost: number;
  warehouseLocation: string;
  lastRestockedDate: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'CRITICAL_OUT_OF_STOCK';
}

// ============================================================================
// BILLING DESK & MILESTONE INVOICING
// ============================================================================

export interface BillingMilestone {
  id: string;
  stageName: string;
  percentage: number;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'INVOICE_GENERATED' | 'PAID' | 'OVERDUE';
  invoiceNumber?: string;
  paidDate?: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  workId: string;
  projectName: string;
  clientCompanyName: string;
  clientGst: string;
  clientAddress: string;
  milestoneTitle: string;
  taxableAmount: number;
  gstRate: number; // e.g. 18
  gstAmount: number;
  totalAmount: number;
  invoiceDate: string;
  dueDate: string;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  paymentReceivedDate?: string;
  bankDetails: {
    bankName: string;
    accountNo: string;
    ifscCode: string;
  };
}


