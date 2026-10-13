import pptxgen from 'pptxgenjs';
import jsPDF from 'jspdf';
import { CompanyProfile, UserAccount, WorkAssignment, Lead, ReimbursementClaim, AttendanceRecord } from '../types';

export interface ExportPresentationData {
  companyProfile: CompanyProfile;
  users: UserAccount[];
  works: WorkAssignment[];
  leads: Lead[];
  reimbursements: ReimbursementClaim[];
  attendanceRecords: AttendanceRecord[];
}

export const generateAndDownloadPptx = async (data: ExportPresentationData) => {
  const { companyProfile, users, works, leads, reimbursements } = data;

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Kamlawati Display Private Limited';
  pptx.company = companyProfile.companyName || 'Kamlawati Display Private Limited';
  pptx.title = `${companyProfile.shortName || 'KDPL'} Enterprise Operations Portal Client Pitch & Architecture Deck`;

  const activeStaffCount = users.filter((u) => u.active).length;
  const activeJobsCount = works.length;
  const totalLeadsCount = leads.length;
  const totalClaimsCount = reimbursements.length;

  // Blue & White Corporate Palette
  const NAVY_DEEP = '0B1D3A';
  const BLUE_PRIMARY = '1A56DB';
  const BLUE_MEDIUM = '2563EB';
  const BLUE_LIGHT = 'EFF6FF';
  const BLUE_BORDER = 'BFDBFE';
  const WHITE = 'FFFFFF';
  const SLATE_DARK = '1E293B';
  const SLATE_MUTED = '64748B';
  const EMERALD = '059669';
  const AMBER = 'D97706';

  // Helper: Standardized Slide Header
  const addSlideHeader = (slide: any, slideNum: number, title: string, subtitle: string) => {
    // Header Bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 1.15,
      fill: { color: NAVY_DEEP }
    });

    // Badge
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.5,
      y: 0.28,
      w: 1.5,
      h: 0.38,
      fill: { color: BLUE_PRIMARY },
      rectRadius: 0.08
    });
    slide.addText(`SLIDE ${slideNum} / 8`, {
      x: 0.5,
      y: 0.28,
      w: 1.5,
      h: 0.38,
      fontSize: 10,
      color: WHITE,
      bold: true,
      align: 'center',
      valign: 'middle'
    });

    // Slide Title
    slide.addText(title, {
      x: 2.2,
      y: 0.18,
      w: 7.8,
      h: 0.45,
      fontSize: 16,
      color: WHITE,
      bold: true,
      valign: 'middle'
    });

    // Slide Subtitle
    slide.addText(subtitle, {
      x: 2.2,
      y: 0.62,
      w: 8.5,
      h: 0.35,
      fontSize: 10,
      color: '93C5FD',
      valign: 'top'
    });

    // Brand Watermark
    slide.addText(companyProfile.shortName || 'KDPL', {
      x: 10.8,
      y: 0.28,
      w: 2.0,
      h: 0.4,
      fontSize: 13,
      color: 'FCD34D',
      bold: true,
      align: 'right'
    });
  };

  // -------------------------------------------------------------
  // SLIDE 1: Cover Slide & Executive Pitch
  // -------------------------------------------------------------
  const slide1 = pptx.addSlide();
  slide1.background = { color: NAVY_DEEP };

  // Main Hero Card
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 0.7,
    y: 0.7,
    w: 11.9,
    h: 6.1,
    fill: { color: '102A54' },
    line: { color: '1E427B', width: 1.5 },
    rectRadius: 0.15
  });

  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 1.2,
    y: 1.1,
    w: 3.2,
    h: 0.4,
    fill: { color: BLUE_PRIMARY },
    rectRadius: 0.08
  });
  slide1.addText('CLIENT PITCH & ARCHITECTURE DECK', {
    x: 1.2,
    y: 1.1,
    w: 3.2,
    h: 0.4,
    fontSize: 9.5,
    color: WHITE,
    bold: true,
    align: 'center',
    valign: 'middle'
  });

  slide1.addText(companyProfile.companyName || 'Kamlawati Display Private Limited', {
    x: 1.2,
    y: 1.6,
    w: 10.8,
    h: 0.8,
    fontSize: 26,
    color: WHITE,
    bold: true,
    valign: 'middle'
  });

  slide1.addText(
    'Enterprise Operations & Collaborative Workspaces Portal · WhatsApp Group-Style Workflows · 3-Action File Verification · OneDrive Cloud Sync',
    {
      x: 1.2,
      y: 2.45,
      w: 10.8,
      h: 0.55,
      fontSize: 12.5,
      color: 'BFDBFE'
    }
  );

  // 4 Metrics / Core Pillars
  const heroMetrics = [
    { label: 'Admin Matrix', value: '10 Roles', sub: 'HR · CRM · Design · Purchase · Accounts', color: '1A56DB' },
    { label: 'Project Workspaces', value: 'Chat Rooms', sub: 'WhatsApp Group model per job', color: '059669' },
    { label: 'File Verification', value: '3-Action Gate', sub: 'Approve · Correction · Reject', color: 'D97706' },
    { label: 'Procurement Engine', value: 'Material Bucket', sub: 'Accounts & Site group auto-sync', color: '7C3AED' }
  ];

  heroMetrics.forEach((m, idx) => {
    const cardX = 1.2 + idx * 2.75;
    slide1.addShape(pptx.ShapeType.roundRect, {
      x: cardX,
      y: 3.3,
      w: 2.55,
      h: 1.75,
      fill: { color: '0A192F' },
      line: { color: '1E3A8A', width: 1 },
      rectRadius: 0.1
    });

    slide1.addText(m.label, {
      x: cardX + 0.15,
      y: 3.45,
      w: 2.25,
      h: 0.3,
      fontSize: 10,
      color: '93C5FD',
      bold: true
    });

    slide1.addText(m.value, {
      x: cardX + 0.15,
      y: 3.8,
      w: 2.25,
      h: 0.55,
      fontSize: 19,
      color: WHITE,
      bold: true
    });

    slide1.addText(m.sub, {
      x: cardX + 0.15,
      y: 4.45,
      w: 2.25,
      h: 0.45,
      fontSize: 8.5,
      color: '38BDF8'
    });
  });

  slide1.addText(`Prepared for Client Presentation · Professional Blue & White Standard · Generated: ${new Date().toLocaleDateString('en-IN')}`, {
    x: 1.2,
    y: 5.95,
    w: 10.8,
    h: 0.4,
    fontSize: 9.5,
    color: '94A3B8'
  });

  // -------------------------------------------------------------
  // SLIDE 2: Master Admin Look & 10 Operational Roles
  // -------------------------------------------------------------
  const slide2 = pptx.addSlide();
  slide2.background = { color: 'F8FAFC' };
  addSlideHeader(slide2, 2, 'Master Admin Look: 10 Operational Roles Matrix', 'Centralized governance across all 10 specialized departments with dedicated work permissions');

  const tenRoles = [
    { title: '1. HR Role', desc: 'GPS mobile punch, selfie check-in, late attendance rules (>10:15 AM), staff KYC documents & leave audits.' },
    { title: '2. CRM', desc: 'Lead qualification, separate project chat rooms, client communications, 3-action file reviews & status updates.' },
    { title: '3. Designer', desc: 'Creative 2D graphic artworks, 3D realistic visual renderings, client brand adaptation & design iterations.' },
    { title: '4. Structure Designer', desc: 'Structural engineering CAD drawings, stability analysis, fabrication specifications & material load specs.' },
    { title: '5. Project Team', desc: 'Overall project execution, milestone scheduling, contractor management & cross-department coordination.' },
    { title: '6. Purchase', desc: 'Vendor sourcing, 3-quote supplier matrix comparison, negotiation, and official Purchase Order (PO) creation.' },
    { title: '7. Billing', desc: 'Client milestone billing schedules (Advance, Fabrication, Dispatch, Handover), GST invoices & payment follow-up.' },
    { title: '8. Accounts', desc: 'Centralized purchase request bucket, financial verification, staff reimbursement clearance & vendor payouts.' },
    { title: '9. Stocks', desc: 'Warehouse inventory tracking, material reservations, low-stock threshold alerts & site dispatch logs.' },
    { title: '10. Site Supervisor', desc: 'OTP site check-in, contractor labor headcount logs, daily EOD progress photos & on-site material requests.' }
  ];

  tenRoles.forEach((r, idx) => {
    const col = idx % 5;
    const row = Math.floor(idx / 5);
    const boxX = 0.5 + col * 2.45;
    const boxY = 1.35 + row * 2.65;

    slide2.addShape(pptx.ShapeType.roundRect, {
      x: boxX,
      y: boxY,
      w: 2.32,
      h: 2.45,
      fill: { color: WHITE },
      line: { color: BLUE_BORDER, width: 1 },
      rectRadius: 0.1
    });

    slide2.addShape(pptx.ShapeType.roundRect, {
      x: boxX,
      y: boxY,
      w: 2.32,
      h: 0.45,
      fill: { color: NAVY_DEEP },
      rectRadius: 0.08
    });

    slide2.addText(r.title, {
      x: boxX + 0.1,
      y: boxY + 0.05,
      w: 2.12,
      h: 0.35,
      fontSize: 9.5,
      color: WHITE,
      bold: true,
      valign: 'middle'
    });

    slide2.addText(r.desc, {
      x: boxX + 0.12,
      y: boxY + 0.55,
      w: 2.08,
      h: 1.8,
      fontSize: 8.5,
      color: SLATE_DARK
    });
  });

  // -------------------------------------------------------------
  // SLIDE 3: CRM Project Group Room & Lead Lifecycle (WhatsApp Model)
  // -------------------------------------------------------------
  const slide3 = pptx.addSlide();
  slide3.background = { color: 'F8FAFC' };
  addSlideHeader(slide3, 3, 'CRM: Project Chat Rooms (WhatsApp Group Model)', 'Dedicated project group per client order · Dynamic member management · 3-Action File Verification');

  const crmFeatures = [
    {
      title: 'Separate Project Group Room',
      badge: 'WhatsApp Group Type',
      color: '1A56DB',
      points: [
        'A dedicated group is created for each project name automatically.',
        'CRM person has full authority to Add or Remove any team member (Designers, PM, Client).',
        'Conversations, files, and updates are isolated only to that specific active group.'
      ]
    },
    {
      title: '3-Action File Review System',
      badge: 'Approve · Correction · Reject',
      color: '059669',
      points: [
        'Whenever any file or drawing is shared, 3 explicit action buttons appear.',
        '✅ APPROVE: Design accepted; version locked & auto-saved to OneDrive.',
        '✏️ CORRECTION: Opens reply interface where CRM/Client types precise revision feedback.',
        '❌ REJECT: File discarded with reason logged for audit.'
      ]
    },
    {
      title: 'Reminders, Status & OneDrive Sync',
      badge: 'Auto Automation',
      color: 'D97706',
      points: [
        'Action Reminders: CRM sets automated reminder alarms for update follow-ups.',
        'Order Confirmed: When the client signs off, status updates to COMPLETED.',
        'OneDrive Auto-Sync: All approved drawings & quotes automatically save to cloud.'
      ]
    }
  ];

  crmFeatures.forEach((cf, idx) => {
    const boxX = 0.6 + idx * 4.05;
    slide3.addShape(pptx.ShapeType.roundRect, {
      x: boxX,
      y: 1.4,
      w: 3.85,
      h: 5.2,
      fill: { color: WHITE },
      line: { color: BLUE_BORDER, width: 1.2 },
      rectRadius: 0.1
    });

    slide3.addShape(pptx.ShapeType.roundRect, {
      x: boxX + 0.2,
      y: 1.6,
      w: 3.45,
      h: 0.35,
      fill: { color: BLUE_LIGHT },
      line: { color: BLUE_BORDER, width: 0.8 },
      rectRadius: 0.05
    });

    slide3.addText(cf.badge, {
      x: boxX + 0.2,
      y: 1.6,
      w: 3.45,
      h: 0.35,
      fontSize: 8.5,
      color: cf.color,
      bold: true,
      align: 'center',
      valign: 'middle'
    });

    slide3.addText(cf.title, {
      x: boxX + 0.2,
      y: 2.1,
      w: 3.45,
      h: 0.5,
      fontSize: 12,
      color: NAVY_DEEP,
      bold: true
    });

    cf.points.forEach((pt, pIdx) => {
      slide3.addShape(pptx.ShapeType.roundRect, {
        x: boxX + 0.2,
        y: 2.75 + pIdx * 1.25,
        w: 3.45,
        h: 1.1,
        fill: { color: 'F8FAFC' },
        line: { color: 'E2E8F0', width: 0.8 },
        rectRadius: 0.06
      });

      slide3.addText(`• ${pt}`, {
        x: boxX + 0.3,
        y: 2.85 + pIdx * 1.25,
        w: 3.25,
        h: 0.95,
        fontSize: 9,
        color: SLATE_DARK
      });
    });
  });

  // -------------------------------------------------------------
  // SLIDE 4: Designer & Structure Designer Collaborative Work Chat Spaces
  // -------------------------------------------------------------
  const slide4 = pptx.addSlide();
  slide4.background = { color: 'F8FAFC' };
  addSlideHeader(slide4, 4, 'Designers & Structure Designers: Work Chat Spaces', 'Transforming static assignment queues into collaborative live studio work chat spaces');

  const designPillars = [
    {
      title: 'Graphic & 3D Visual Designers',
      role: 'Creative Visual Concept',
      desc: 'Work chat space where designers receive site visit photos, client briefs, and dimension notes. Upload 2D graphics, branding layouts, and 3D realistic studio mockups.',
      points: [
        'Direct project chat thread for each job assignment.',
        'High-resolution render deliverables upload.',
        'Receives instant 3-Action feedback (Approve / Correction / Reject).'
      ]
    },
    {
      title: 'Structure Designers (Engineering)',
      role: 'Structural CAD & Stability',
      desc: 'Specialized structural engineering space focusing on fabrication stability, steel/acrylic loads, wind pressure, and fabrication detailing blueprints.',
      points: [
        'Technical CAD file & PDF engineering drawing uploads.',
        'Material grade specifications and joint stress analysis.',
        'Revision versioning with correction markup reply integration.'
      ]
    }
  ];

  designPillars.forEach((dp, idx) => {
    const boxX = 0.8 + idx * 5.8;
    slide4.addShape(pptx.ShapeType.roundRect, {
      x: boxX,
      y: 1.45,
      w: 5.5,
      h: 3.7,
      fill: { color: WHITE },
      line: { color: BLUE_BORDER, width: 1.2 },
      rectRadius: 0.1
    });

    slide4.addText(dp.role.toUpperCase(), {
      x: boxX + 0.25,
      y: 1.65,
      w: 5.0,
      h: 0.3,
      fontSize: 9,
      color: BLUE_PRIMARY,
      bold: true
    });

    slide4.addText(dp.title, {
      x: boxX + 0.25,
      y: 1.95,
      w: 5.0,
      h: 0.45,
      fontSize: 13,
      color: NAVY_DEEP,
      bold: true
    });

    slide4.addText(dp.desc, {
      x: boxX + 0.25,
      y: 2.45,
      w: 5.0,
      h: 0.8,
      fontSize: 9.5,
      color: SLATE_DARK
    });

    dp.points.forEach((pt, pIdx) => {
      slide4.addText(`✔  ${pt}`, {
        x: boxX + 0.25,
        y: 3.35 + pIdx * 0.45,
        w: 5.0,
        h: 0.4,
        fontSize: 9,
        color: '0F766E',
        bold: true
      });
    });
  });

  // Bottom Banner
  slide4.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 5.4,
    w: 11.3,
    h: 1.3,
    fill: { color: NAVY_DEEP },
    rectRadius: 0.1
  });
  slide4.addText('COLLABORATIVE DESIGN LOOP', {
    x: 1.0,
    y: 5.5,
    w: 10.9,
    h: 0.3,
    fontSize: 9,
    color: 'FCD34D',
    bold: true
  });
  slide4.addText(
    'Client Brief ➔ Graphic 3D Concept ➔ Structure CAD ➔ 3-Action Review (Approve/Correction/Reject) ➔ OneDrive Sync ➔ Project Team Handover',
    {
      x: 1.0,
      y: 5.85,
      w: 10.9,
      h: 0.5,
      fontSize: 10.5,
      color: WHITE,
      bold: true,
      align: 'center'
    }
  );

  // -------------------------------------------------------------
  // SLIDE 5: Project Team & Site Supervisor Field Execution
  // -------------------------------------------------------------
  const slide5 = pptx.addSlide();
  slide5.background = { color: 'F8FAFC' };
  addSlideHeader(slide5, 5, 'Project Team & Site Supervisor: Field Execution Groups', 'Conducting further project execution through unified project group spaces & live field telemetry');

  const execBlocks = [
    {
      title: 'Project Team Execution Workspace',
      desc: 'Takes handover from CRM once order is confirmed. Uses project group to orchestrate site readiness, vendor scheduling, and client milestone delivery.',
      bullets: [
        'Monitors active milestone timelines & site readiness dates.',
        'Reviews on-site material requests before accounts routing.',
        'Issues time-limited OTP tokens for site supervisor handovers.'
      ]
    },
    {
      title: 'Site Supervisor On-Site Operations',
      desc: 'Field execution lead at client premises. Communicates in the project group room with live photos, progress logs, and manpower headcount.',
      bullets: [
        'Geo-verified OTP check-in upon arriving at client site.',
        'Daily contractor headcount logs (carpenters, fabricators, painters, electricians).',
        'Daily EOD progress photos & site inspection sign-offs.'
      ]
    }
  ];

  execBlocks.forEach((eb, idx) => {
    const boxX = 0.8 + idx * 5.8;
    slide5.addShape(pptx.ShapeType.roundRect, {
      x: boxX,
      y: 1.45,
      w: 5.5,
      h: 5.2,
      fill: { color: WHITE },
      line: { color: BLUE_BORDER, width: 1.2 },
      rectRadius: 0.1
    });

    slide5.addText(eb.title, {
      x: boxX + 0.25,
      y: 1.7,
      w: 5.0,
      h: 0.5,
      fontSize: 13,
      color: NAVY_DEEP,
      bold: true
    });

    slide5.addText(eb.desc, {
      x: boxX + 0.25,
      y: 2.3,
      w: 5.0,
      h: 0.9,
      fontSize: 9.5,
      color: SLATE_DARK
    });

    eb.bullets.forEach((b, bIdx) => {
      slide5.addShape(pptx.ShapeType.roundRect, {
        x: boxX + 0.25,
        y: 3.35 + bIdx * 0.95,
        w: 5.0,
        h: 0.8,
        fill: { color: BLUE_LIGHT },
        line: { color: BLUE_BORDER, width: 0.6 },
        rectRadius: 0.06
      });

      slide5.addText(`✔  ${b}`, {
        x: boxX + 0.35,
        y: 3.42 + bIdx * 0.95,
        w: 4.8,
        h: 0.68,
        fontSize: 9,
        color: NAVY_DEEP
      });
    });
  });

  // -------------------------------------------------------------
  // SLIDE 6: Purchase & Accounts Material Request Bucket
  // -------------------------------------------------------------
  const slide6 = pptx.addSlide();
  slide6.background = { color: 'F8FAFC' };
  addSlideHeader(slide6, 6, 'Purchase & Accounts: Material Request Bucket Flow', 'Consolidated bucket for all site material demands with instant 2-way sync back to project groups');

  const bucketSteps = [
    {
      num: 'STEP 1',
      title: 'Group Requisition',
      actor: 'Project Team / Site Supervisor',
      desc: 'Posts material requirement directly in their specific project group room (items, quantity, urgency, photos).'
    },
    {
      num: 'STEP 2',
      title: 'Consolidated Bucket',
      actor: 'Accounts & Purchase Team',
      desc: 'Accounts team sees a unified bucket of all material requests across every live project in one real-time dashboard.'
    },
    {
      num: 'STEP 3',
      title: 'Update & Response',
      actor: 'Accounts / Purchase Desk',
      desc: 'Accounts evaluates budget, approves PO / vendor dispatch, and types an update with ETA and order numbers.'
    },
    {
      num: 'STEP 4',
      title: 'Direct Group Sync',
      actor: 'Project Chat Room',
      desc: 'The update automatically pipes into the specific project group, giving the site team immediate real-time tracking.'
    }
  ];

  bucketSteps.forEach((bs, idx) => {
    const boxX = 0.6 + idx * 3.0;
    slide6.addShape(pptx.ShapeType.roundRect, {
      x: boxX,
      y: 1.45,
      w: 2.85,
      h: 3.8,
      fill: { color: WHITE },
      line: { color: BLUE_BORDER, width: 1.2 },
      rectRadius: 0.1
    });

    slide6.addShape(pptx.ShapeType.roundRect, {
      x: boxX + 0.2,
      y: 1.65,
      w: 1.1,
      h: 0.35,
      fill: { color: BLUE_PRIMARY },
      rectRadius: 0.06
    });

    slide6.addText(bs.num, {
      x: boxX + 0.2,
      y: 1.65,
      w: 1.1,
      h: 0.35,
      fontSize: 9,
      color: WHITE,
      bold: true,
      align: 'center',
      valign: 'middle'
    });

    slide6.addText(bs.title, {
      x: boxX + 0.2,
      y: 2.1,
      w: 2.45,
      h: 0.45,
      fontSize: 11.5,
      color: NAVY_DEEP,
      bold: true
    });

    slide6.addText(`By: ${bs.actor}`, {
      x: boxX + 0.2,
      y: 2.6,
      w: 2.45,
      h: 0.3,
      fontSize: 8.5,
      color: BLUE_PRIMARY,
      bold: true
    });

    slide6.addText(bs.desc, {
      x: boxX + 0.2,
      y: 3.0,
      w: 2.45,
      h: 2.0,
      fontSize: 9,
      color: SLATE_DARK
    });
  });

  // Bottom Flow Banner
  slide6.addShape(pptx.ShapeType.roundRect, {
    x: 0.6,
    y: 5.5,
    w: 11.85,
    h: 1.2,
    fill: { color: BLUE_LIGHT },
    line: { color: BLUE_BORDER, width: 1 },
    rectRadius: 0.08
  });
  slide6.addText(
    '🔄 Zero Communication Gaps: Field teams request in group ➔ Accounts manages in bucket ➔ Update auto-posts back into group with zero manual follow-ups.',
    {
      x: 0.8,
      y: 5.7,
      w: 11.45,
      h: 0.8,
      fontSize: 10,
      color: NAVY_DEEP,
      bold: true
    }
  );

  // -------------------------------------------------------------
  // SLIDE 7: Billing, Stocks & Inventory Management
  // -------------------------------------------------------------
  const slide7 = pptx.addSlide();
  slide7.background = { color: 'F8FAFC' };
  addSlideHeader(slide7, 7, 'Billing & Stocks: Seamless Inventory & Invoice Operations', 'Automating warehouse inventory deductions, milestone billing schedules & GST tax invoices');

  const opsBoxes = [
    {
      title: 'Warehouse Stocks Management',
      badge: 'Live Inventory Tracking',
      desc: 'Centralized stock management linking central factory stock directly with active site requisitions.',
      points: [
        'Real-time deduction of materials when site supervisor requests are fulfilled.',
        'Automated threshold alerts when raw materials fall below minimum safety levels.',
        'Scrap, wastage, and returns tracking post-site handover.'
      ]
    },
    {
      title: 'Milestone Billing & GST Tax Invoicing',
      badge: 'Client Milestone Financials',
      desc: 'Structured billing desk managing payment stages from advance booking to final client handover.',
      points: [
        'Milestone billing schedule: Advance ➔ Fabrication ➔ Delivery ➔ Handover.',
        '1-click GST-compliant tax invoice generation with company bank details & QR code.',
        'Real-time outstanding balance tracking and payment reminder notices.'
      ]
    }
  ];

  opsBoxes.forEach((ob, idx) => {
    const boxX = 0.8 + idx * 5.8;
    slide7.addShape(pptx.ShapeType.roundRect, {
      x: boxX,
      y: 1.45,
      w: 5.5,
      h: 5.2,
      fill: { color: WHITE },
      line: { color: BLUE_BORDER, width: 1.2 },
      rectRadius: 0.1
    });

    slide7.addShape(pptx.ShapeType.roundRect, {
      x: boxX + 0.25,
      y: 1.65,
      w: 2.8,
      h: 0.35,
      fill: { color: BLUE_LIGHT },
      line: { color: BLUE_BORDER, width: 0.8 },
      rectRadius: 0.05
    });

    slide7.addText(ob.badge, {
      x: boxX + 0.25,
      y: 1.65,
      w: 2.8,
      h: 0.35,
      fontSize: 8.5,
      color: BLUE_PRIMARY,
      bold: true,
      align: 'center',
      valign: 'middle'
    });

    slide7.addText(ob.title, {
      x: boxX + 0.25,
      y: 2.15,
      w: 5.0,
      h: 0.5,
      fontSize: 13,
      color: NAVY_DEEP,
      bold: true
    });

    slide7.addText(ob.desc, {
      x: boxX + 0.25,
      y: 2.75,
      w: 5.0,
      h: 0.8,
      fontSize: 9.5,
      color: SLATE_DARK
    });

    ob.points.forEach((pt, pIdx) => {
      slide7.addShape(pptx.ShapeType.roundRect, {
        x: boxX + 0.25,
        y: 3.65 + pIdx * 0.95,
        w: 5.0,
        h: 0.8,
        fill: { color: 'F8FAFC' },
        line: { color: 'E2E8F0', width: 0.8 },
        rectRadius: 0.06
      });

      slide7.addText(`• ${pt}`, {
        x: boxX + 0.35,
        y: 3.72 + pIdx * 0.95,
        w: 4.8,
        h: 0.68,
        fontSize: 9,
        color: SLATE_DARK
      });
    });
  });

  // -------------------------------------------------------------
  // SLIDE 8: Technical Architecture, OneDrive Auto-Sync & Client Pitch ROI
  // -------------------------------------------------------------
  const slide8 = pptx.addSlide();
  slide8.background = { color: 'F8FAFC' };
  addSlideHeader(slide8, 8, 'OneDrive Auto-Sync, Security & Client Value Proposition', 'Enterprise cloud backup, role-based security & measurable business return on investment');

  const pitchCards = [
    {
      title: 'Automated OneDrive Cloud Backup',
      stat: '100% Zero File Loss',
      desc: 'All approved files, 2D/3D artwork, quotations, POs, and completion certificates automatically sync to client-specific Microsoft OneDrive folders without manual uploads.'
    },
    {
      title: 'Role-Based Access Control (RBAC)',
      stat: 'Complete Security',
      desc: '10 distinct roles with segmented access. Staff only see projects and channels they are invited to. Full audit trail of approvals, corrections, and payment authorizations.'
    },
    {
      title: 'Blue & White Professional UI',
      stat: 'Intuitive & Fast',
      desc: 'Clean corporate color palette, high-contrast readability, responsive touch controls for on-site supervisors, and zero training required for new staff.'
    },
    {
      title: 'Client Pitch Business ROI',
      stat: '35% Faster Delivery',
      desc: 'Eliminates WhatsApp message confusion, lost files, and procurement delays. Real-time bucket processing and automated reminders accelerate delivery by over 35%.'
    }
  ];

  pitchCards.forEach((pc, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const boxX = 0.8 + col * 5.8;
    const boxY = 1.45 + row * 2.65;

    slide8.addShape(pptx.ShapeType.roundRect, {
      x: boxX,
      y: boxY,
      w: 5.5,
      h: 2.45,
      fill: { color: WHITE },
      line: { color: BLUE_BORDER, width: 1.2 },
      rectRadius: 0.1
    });

    slide8.addShape(pptx.ShapeType.roundRect, {
      x: boxX + 0.25,
      y: boxY + 0.2,
      w: 2.2,
      h: 0.35,
      fill: { color: BLUE_LIGHT },
      rectRadius: 0.05
    });

    slide8.addText(pc.stat, {
      x: boxX + 0.25,
      y: boxY + 0.2,
      w: 2.2,
      h: 0.35,
      fontSize: 8.5,
      color: BLUE_PRIMARY,
      bold: true,
      align: 'center',
      valign: 'middle'
    });

    slide8.addText(pc.title, {
      x: boxX + 0.25,
      y: boxY + 0.65,
      w: 5.0,
      h: 0.45,
      fontSize: 12,
      color: NAVY_DEEP,
      bold: true
    });

    slide8.addText(pc.desc, {
      x: boxX + 0.25,
      y: boxY + 1.15,
      w: 5.0,
      h: 1.15,
      fontSize: 9,
      color: SLATE_DARK
    });
  });

  // Export and download the PPTX presentation file to device
  const filename = `${companyProfile.shortName || 'KDPL'}_Portal_Overview_Presentation_${new Date().toISOString().split('T')[0]}.pptx`;
  await pptx.writeFile({ fileName: filename });
};

export const generateAndDownloadPdf = (data: ExportPresentationData) => {
  const { companyProfile, users, works, leads, reimbursements } = data;
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const addHeader = (pageNum: number, title: string, subtitle: string) => {
    // Top Bar
    doc.setFillColor(11, 29, 58); // NAVY_DEEP
    doc.rect(0, 0, pageWidth, 60, 'F');

    // Slide Number Badge
    doc.setFillColor(26, 86, 219); // BLUE_PRIMARY
    doc.roundedRect(25, 18, 85, 24, 4, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`SLIDE ${pageNum} / 8`, 67, 34, { align: 'center' });

    // Title
    doc.setFontSize(13);
    doc.text(title, 125, 28);

    // Subtitle
    doc.setFontSize(8.5);
    doc.setTextColor(147, 197, 253);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 125, 46);

    // Brand Watermark
    doc.setTextColor(252, 211, 77);
    doc.setFont('helvetica', 'bold');
    doc.text(companyProfile.shortName || 'KDPL', pageWidth - 35, 34, { align: 'right' });

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${companyProfile.companyName || 'KDPL'} · Enterprise Operations Portal Client Pitch · Slide ${pageNum} of 8`,
      30,
      pageHeight - 16
    );
  };

  // ---------------- PAGE 1 ----------------
  doc.setFillColor(11, 29, 58);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setFillColor(16, 42, 84);
  doc.roundedRect(40, 40, pageWidth - 80, pageHeight - 80, 8, 8, 'F');

  doc.setTextColor(147, 197, 253);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT PITCH & ARCHITECTURE DECK', 70, 85);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(companyProfile.companyName || 'Kamlawati Display Private Limited', 70, 120);

  doc.setTextColor(191, 219, 254);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Enterprise Operations & Collaborative Workspaces Portal · WhatsApp Group-Style Workflows · 3-Action File Verification · OneDrive Cloud Sync', 70, 145);

  const heroMetrics = [
    { label: 'Admin Matrix', value: '10 Roles', sub: 'HR · CRM · Design · Purchase · Accounts' },
    { label: 'Project Workspaces', value: 'Chat Rooms', sub: 'WhatsApp Group model per job' },
    { label: 'File Verification', value: '3-Action Gate', sub: 'Approve · Correction · Reject' },
    { label: 'Procurement Engine', value: 'Material Bucket', sub: 'Accounts & Site group auto-sync' }
  ];

  heroMetrics.forEach((m, idx) => {
    const bx = 70 + idx * 175;
    doc.setFillColor(10, 25, 47);
    doc.roundedRect(bx, 190, 160, 120, 6, 6, 'F');

    doc.setTextColor(147, 197, 253);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(m.label, bx + 15, 220);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(m.value, bx + 15, 255);

    doc.setTextColor(56, 189, 248);
    doc.setFontSize(7.5);
    doc.text(doc.splitTextToSize(m.sub, 130), bx + 15, 285);
  });

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8.5);
  doc.text(`Prepared for Client Presentation · Professional Blue & White Standard · Date: ${new Date().toLocaleDateString('en-IN')}`, 70, 480);

  // ---------------- PAGE 2 ----------------
  doc.addPage();
  addHeader(2, 'Master Admin Look: 10 Operational Roles Matrix', 'Centralized governance across all 10 specialized departments with dedicated work permissions');

  const tenRolesPdf = [
    { title: '1. HR Role', desc: 'GPS mobile punch, selfie check-in, late attendance rules (>10:15 AM), staff KYC documents & leave audits.' },
    { title: '2. CRM', desc: 'Lead qualification, separate project chat rooms, client communications, 3-action file reviews & status updates.' },
    { title: '3. Designer', desc: 'Creative 2D graphic artworks, 3D realistic visual renderings, client brand adaptation & design iterations.' },
    { title: '4. Structure Designer', desc: 'Structural engineering CAD drawings, stability analysis, fabrication specifications & material load specs.' },
    { title: '5. Project Team', desc: 'Overall project execution, milestone scheduling, contractor management & cross-department coordination.' },
    { title: '6. Purchase', desc: 'Vendor sourcing, 3-quote supplier matrix comparison, negotiation, and official Purchase Order (PO) creation.' },
    { title: '7. Billing', desc: 'Client milestone billing schedules (Advance, Fabrication, Dispatch, Handover), GST invoices & payment follow-up.' },
    { title: '8. Accounts', desc: 'Centralized purchase request bucket, financial verification, staff reimbursement clearance & vendor payouts.' },
    { title: '9. Stocks', desc: 'Warehouse inventory tracking, material reservations, low-stock threshold alerts & site dispatch logs.' },
    { title: '10. Site Supervisor', desc: 'OTP site check-in, contractor labor headcount logs, daily EOD progress photos & on-site material requests.' }
  ];

  tenRolesPdf.forEach((r, idx) => {
    const col = idx % 5;
    const row = Math.floor(idx / 5);
    const rx = 30 + col * 150;
    const ry = 80 + row * 200;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(rx, ry, 140, 185, 6, 6, 'F');
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(rx, ry, 140, 185, 6, 6, 'S');

    doc.setFillColor(11, 29, 58);
    doc.roundedRect(rx, ry, 140, 30, 4, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(r.title, rx + 8, ry + 19);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(r.desc, 124);
    doc.text(descLines, rx + 8, ry + 48);
  });

  // ---------------- PAGE 3 ----------------
  doc.addPage();
  addHeader(3, 'CRM: Project Chat Rooms (WhatsApp Group Model)', 'Dedicated project group per client order · Dynamic member management · 3-Action File Verification');

  const crmCardsPdf = [
    {
      title: 'Separate Project Group Room',
      badge: 'WhatsApp Group Type',
      points: [
        'A dedicated group is created for each project name automatically.',
        'CRM person has full authority to Add or Remove any team member (Designers, PM, Client).',
        'Conversations, files, and updates are isolated only to that specific active group.'
      ]
    },
    {
      title: '3-Action File Review System',
      badge: 'Approve · Correction · Reject',
      points: [
        'Whenever any file or drawing is shared, 3 explicit action buttons appear.',
        'APPROVE: Design accepted; version locked & auto-saved to OneDrive.',
        'CORRECTION: Opens reply interface where CRM/Client types precise revision feedback.',
        'REJECT: File discarded with reason logged for audit.'
      ]
    },
    {
      title: 'Reminders, Status & OneDrive Sync',
      badge: 'Auto Automation',
      points: [
        'Action Reminders: CRM sets automated reminder alarms for update follow-ups.',
        'Order Confirmed: When the client signs off, status updates to COMPLETED.',
        'OneDrive Auto-Sync: All approved drawings & quotes automatically save to cloud.'
      ]
    }
  ];

  crmCardsPdf.forEach((c, idx) => {
    const cx = 30 + idx * 255;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cx, 80, 245, 395, 6, 6, 'F');
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(cx, 80, 245, 395, 6, 6, 'S');

    doc.setFillColor(239, 246, 255);
    doc.roundedRect(cx + 10, 95, 225, 24, 4, 4, 'F');
    doc.setTextColor(26, 86, 219);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(c.badge, cx + 122, 111, { align: 'center' });

    doc.setTextColor(11, 29, 58);
    doc.setFontSize(11);
    doc.text(c.title, cx + 12, 145);

    c.points.forEach((pt, pIdx) => {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(cx + 10, 165 + pIdx * 90, 225, 80, 4, 4, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(cx + 10, 165 + pIdx * 90, 225, 80, 4, 4, 'S');

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(`• ${pt}`, 205);
      doc.text(lines, cx + 18, 185 + pIdx * 90);
    });
  });

  // ---------------- PAGE 4 ----------------
  doc.addPage();
  addHeader(4, 'Designers & Structure Designers: Work Chat Spaces', 'Transforming static assignment queues into collaborative live studio work chat spaces');

  const designPillarsPdf = [
    {
      role: 'CREATIVE VISUAL CONCEPT',
      title: 'Graphic & 3D Visual Designers',
      desc: 'Work chat space where designers receive site visit photos, client briefs, and dimension notes. Upload 2D graphics, branding layouts, and 3D realistic studio mockups.',
      points: [
        'Direct project chat thread for each job assignment.',
        'High-resolution render deliverables upload.',
        'Receives instant 3-Action feedback (Approve / Correction / Reject).'
      ]
    },
    {
      role: 'STRUCTURAL CAD & STABILITY',
      title: 'Structure Designers (Engineering)',
      desc: 'Specialized structural engineering space focusing on fabrication stability, steel/acrylic loads, wind pressure, and fabrication detailing blueprints.',
      points: [
        'Technical CAD file & PDF engineering drawing uploads.',
        'Material grade specifications and joint stress analysis.',
        'Revision versioning with correction markup reply integration.'
      ]
    }
  ];

  designPillarsPdf.forEach((dp, idx) => {
    const dx = 40 + idx * 370;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(dx, 80, 345, 275, 6, 6, 'F');
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(dx, 80, 345, 275, 6, 6, 'S');

    doc.setTextColor(26, 86, 219);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(dp.role, dx + 15, 105);

    doc.setTextColor(11, 29, 58);
    doc.setFontSize(12);
    doc.text(dp.title, dx + 15, 125);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(dp.desc, 315), dx + 15, 150);

    dp.points.forEach((pt, pIdx) => {
      doc.setTextColor(15, 118, 110);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`✔  ${pt}`, dx + 15, 215 + pIdx * 25);
    });
  });

  doc.setFillColor(11, 29, 58);
  doc.roundedRect(40, 380, pageWidth - 80, 85, 6, 6, 'F');
  doc.setTextColor(252, 211, 77);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('COLLABORATIVE DESIGN LOOP', 60, 405);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(
    'Client Brief ➔ Graphic 3D Concept ➔ Structure CAD ➔ 3-Action Review ➔ OneDrive Sync ➔ Project Team Handover',
    pageWidth / 2,
    435,
    { align: 'center' }
  );

  // ---------------- PAGE 5 ----------------
  doc.addPage();
  addHeader(5, 'Project Team & Site Supervisor: Field Execution Groups', 'Conducting further project execution through unified project group spaces & live field telemetry');

  const execBlocksPdf = [
    {
      title: 'Project Team Execution Workspace',
      desc: 'Takes handover from CRM once order is confirmed. Uses project group to orchestrate site readiness, vendor scheduling, and client milestone delivery.',
      bullets: [
        'Monitors active milestone timelines & site readiness dates.',
        'Reviews on-site material requests before accounts routing.',
        'Issues time-limited OTP tokens for site supervisor handovers.'
      ]
    },
    {
      title: 'Site Supervisor On-Site Operations',
      desc: 'Field execution lead at client premises. Communicates in the project group room with live photos, progress logs, and manpower headcount.',
      bullets: [
        'Geo-verified OTP check-in upon arriving at client site.',
        'Daily contractor headcount logs (carpenters, fabricators, painters, electricians).',
        'Daily EOD progress photos & site inspection sign-offs.'
      ]
    }
  ];

  execBlocksPdf.forEach((eb, idx) => {
    const ex = 40 + idx * 370;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(ex, 80, 345, 395, 6, 6, 'F');
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(ex, 80, 345, 395, 6, 6, 'S');

    doc.setTextColor(11, 29, 58);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(eb.title, ex + 15, 110);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(eb.desc, 315), ex + 15, 135);

    eb.bullets.forEach((b, bIdx) => {
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(ex + 15, 205 + bIdx * 75, 315, 60, 4, 4, 'F');
      doc.setDrawColor(191, 219, 254);
      doc.roundedRect(ex + 15, 205 + bIdx * 75, 315, 60, 4, 4, 'S');

      doc.setTextColor(11, 29, 58);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`✔  ${b}`, ex + 25, 235 + bIdx * 75);
    });
  });

  // ---------------- PAGE 6 ----------------
  doc.addPage();
  addHeader(6, 'Purchase & Accounts: Material Request Bucket Flow', 'Consolidated bucket for all site material demands with instant 2-way sync back to project groups');

  const bucketStepsPdf = [
    {
      num: 'STEP 1',
      title: 'Group Requisition',
      actor: 'Project Team / Site Supervisor',
      desc: 'Posts material requirement directly in their specific project group room (items, quantity, urgency, photos).'
    },
    {
      num: 'STEP 2',
      title: 'Consolidated Bucket',
      actor: 'Accounts & Purchase Team',
      desc: 'Accounts team sees a unified bucket of all material requests across every live project in one real-time dashboard.'
    },
    {
      num: 'STEP 3',
      title: 'Update & Response',
      actor: 'Accounts / Purchase Desk',
      desc: 'Accounts evaluates budget, approves PO / vendor dispatch, and types an update with ETA and order numbers.'
    },
    {
      num: 'STEP 4',
      title: 'Direct Group Sync',
      actor: 'Project Chat Room',
      desc: 'The update automatically pipes into the specific project group, giving the site team immediate real-time tracking.'
    }
  ];

  bucketStepsPdf.forEach((bs, idx) => {
    const bx = 30 + idx * 190;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(bx, 80, 180, 280, 6, 6, 'F');
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(bx, 80, 180, 280, 6, 6, 'S');

    doc.setFillColor(26, 86, 219);
    doc.roundedRect(bx + 10, 95, 60, 20, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(bs.num, bx + 40, 108, { align: 'center' });

    doc.setTextColor(11, 29, 58);
    doc.setFontSize(10.5);
    doc.text(bs.title, bx + 10, 135);

    doc.setTextColor(26, 86, 219);
    doc.setFontSize(7.5);
    doc.text(`By: ${bs.actor}`, bx + 10, 155);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(bs.desc, 160), bx + 10, 175);
  });

  doc.setFillColor(239, 246, 255);
  doc.roundedRect(30, 390, pageWidth - 60, 80, 6, 6, 'F');
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(30, 390, pageWidth - 60, 80, 6, 6, 'S');
  doc.setTextColor(11, 29, 58);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(
    '🔄 Zero Communication Gaps: Field teams request in group ➔ Accounts manages in bucket ➔ Update auto-posts back into group with zero manual follow-ups.',
    50,
    435
  );

  // ---------------- PAGE 7 ----------------
  doc.addPage();
  addHeader(7, 'Billing & Stocks: Seamless Inventory & Invoice Operations', 'Automating warehouse inventory deductions, milestone billing schedules & GST tax invoices');

  const opsBoxesPdf = [
    {
      badge: 'LIVE INVENTORY TRACKING',
      title: 'Warehouse Stocks Management',
      desc: 'Centralized stock management linking central factory stock directly with active site requisitions.',
      points: [
        'Real-time deduction of materials when site supervisor requests are fulfilled.',
        'Automated threshold alerts when raw materials fall below minimum safety levels.',
        'Scrap, wastage, and returns tracking post-site handover.'
      ]
    },
    {
      badge: 'CLIENT MILESTONE FINANCIALS',
      title: 'Milestone Billing & GST Tax Invoicing',
      desc: 'Structured billing desk managing payment stages from advance booking to final client handover.',
      points: [
        'Milestone billing schedule: Advance ➔ Fabrication ➔ Delivery ➔ Handover.',
        '1-click GST-compliant tax invoice generation with company bank details & QR code.',
        'Real-time outstanding balance tracking and payment reminder notices.'
      ]
    }
  ];

  opsBoxesPdf.forEach((ob, idx) => {
    const ox = 40 + idx * 370;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(ox, 80, 345, 395, 6, 6, 'F');
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(ox, 80, 345, 395, 6, 6, 'S');

    doc.setFillColor(239, 246, 255);
    doc.roundedRect(ox + 15, 95, 180, 20, 3, 3, 'F');
    doc.setTextColor(26, 86, 219);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(ob.badge, ox + 105, 108, { align: 'center' });

    doc.setTextColor(11, 29, 58);
    doc.setFontSize(12);
    doc.text(ob.title, ox + 15, 140);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(ob.desc, 315), ox + 15, 165);

    ob.points.forEach((pt, pIdx) => {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(ox + 15, 230 + pIdx * 75, 315, 60, 4, 4, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(ox + 15, 230 + pIdx * 75, 315, 60, 4, 4, 'S');

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(8);
      doc.text(`• ${pt}`, ox + 25, 260 + pIdx * 75);
    });
  });

  // ---------------- PAGE 8 ----------------
  doc.addPage();
  addHeader(8, 'OneDrive Auto-Sync, Security & Client Value Proposition', 'Enterprise cloud backup, role-based security & measurable business return on investment');

  const pitchCardsPdf = [
    {
      title: 'Automated OneDrive Cloud Backup',
      stat: '100% Zero File Loss',
      desc: 'All approved files, 2D/3D artwork, quotations, POs, and completion certificates automatically sync to client-specific Microsoft OneDrive folders without manual uploads.'
    },
    {
      title: 'Role-Based Access Control (RBAC)',
      stat: 'Complete Security',
      desc: '10 distinct roles with segmented access. Staff only see projects and channels they are invited to. Full audit trail of approvals, corrections, and payment authorizations.'
    },
    {
      title: 'Blue & White Professional UI',
      stat: 'Intuitive & Fast',
      desc: 'Clean corporate color palette, high-contrast readability, responsive touch controls for on-site supervisors, and zero training required for new staff.'
    },
    {
      title: 'Client Pitch Business ROI',
      stat: '35% Faster Delivery',
      desc: 'Eliminates WhatsApp message confusion, lost files, and procurement delays. Real-time bucket processing and automated reminders accelerate delivery by over 35%.'
    }
  ];

  pitchCardsPdf.forEach((pc, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const px = 40 + col * 370;
    const py = 80 + row * 195;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(px, py, 345, 180, 6, 6, 'F');
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(px, py, 345, 180, 6, 6, 'S');

    doc.setFillColor(239, 246, 255);
    doc.roundedRect(px + 15, py + 15, 120, 20, 3, 3, 'F');
    doc.setTextColor(26, 86, 219);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(pc.stat, px + 75, py + 28, { align: 'center' });

    doc.setTextColor(11, 29, 58);
    doc.setFontSize(11);
    doc.text(pc.title, px + 15, py + 55);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(pc.desc, 315), px + 15, py + 80);
  });

  const pdfFilename = `${companyProfile.shortName || 'KDPL'}_Portal_Overview_Presentation_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(pdfFilename);
};
