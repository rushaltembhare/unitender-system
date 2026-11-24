const { computeHash, createAuditBlock } = require('../utils/crypto');

function getInitialData() {
  const users = [
    {
      id: 'admin-1',
      name: 'Dr. Sanjay Deshmukh',
      email: 'procurement@univ.edu.in',
      role: 'admin',
      roleTitle: 'Procurement Officer (Central Purchase Section)',
      department: 'Central Administration',
      phone: '+91 98200 11223',
      twoFactorEnabled: true
    },
    {
      id: 'dept-1',
      name: 'Prof. Anjali Sharma',
      email: 'hod.cse@univ.edu.in',
      role: 'department',
      roleTitle: 'Head of Department (Computer Science & Engg)',
      department: 'Computer Science & Engineering',
      phone: '+91 98200 44556',
      twoFactorEnabled: true
    },
    {
      id: 'dept-2',
      name: 'Prof. Rajesh Verma',
      email: 'hod.chemistry@univ.edu.in',
      role: 'department',
      roleTitle: 'Head of Department (Chemistry & Materials)',
      department: 'Department of Chemistry',
      phone: '+91 98200 77889',
      twoFactorEnabled: true
    },
    {
      id: 'dept-3',
      name: 'Dr. Sunita Kadam',
      email: 'librarian@univ.edu.in',
      role: 'department',
      roleTitle: 'Chief University Librarian',
      department: 'Central University Library',
      phone: '+91 98200 99001',
      twoFactorEnabled: false
    },
    {
      id: 'approver-1',
      name: 'CA Ramesh Nair',
      email: 'finance.officer@univ.edu.in',
      role: 'approver',
      roleTitle: 'Finance Officer / Chief Accounts Officer',
      department: 'Finance & Accounts Division',
      approvalLevel: 1,
      phone: '+91 98300 22334',
      twoFactorEnabled: true
    },
    {
      id: 'approver-2',
      name: 'Prof. K. R. Ramanathan',
      email: 'registrar@univ.edu.in',
      role: 'approver',
      roleTitle: 'University Registrar',
      department: 'General Administration',
      approvalLevel: 2,
      phone: '+91 98300 55667',
      twoFactorEnabled: true
    },
    {
      id: 'approver-3',
      name: 'Prof. (Dr.) Meera Joshi',
      email: 'vc@univ.edu.in',
      role: 'approver',
      roleTitle: 'Vice-Chancellor / Principal',
      department: 'Executive Leadership',
      approvalLevel: 3,
      phone: '+91 98300 88990',
      twoFactorEnabled: true
    },
    {
      id: 'comm-1',
      name: 'Dr. Vikram Rao',
      email: 'vikram.rao@univ.edu.in',
      role: 'committee',
      roleTitle: 'Evaluation Committee Chairman (Dean Academics)',
      department: 'Electronics & Communication',
      phone: '+91 98400 11335',
      twoFactorEnabled: true
    },
    {
      id: 'comm-2',
      name: 'Dr. Priya Patel',
      email: 'priya.patel@univ.edu.in',
      role: 'committee',
      roleTitle: 'Technical Committee Member',
      department: 'Information Technology',
      phone: '+91 98400 44668',
      twoFactorEnabled: true
    },
    {
      id: 'vendor-1',
      name: 'TechSol India Systems Pvt Ltd',
      contactPerson: 'Mr. Arvind Mehta',
      email: 'bid@techsolindia.com',
      role: 'vendor',
      roleTitle: 'Registered Tier-1 Vendor',
      phone: '+91 98765 43210',
      category: 'IT & Hardware Equipment',
      msmeRegistered: true,
      msmeUdyam: 'UDYAM-MH-02-0045892',
      gstin: '27AABCT3421K1ZM',
      pan: 'AABCT3421K',
      verifiedKYC: true,
      rating: 4.8,
      twoFactorEnabled: true
    },
    {
      id: 'vendor-2',
      name: 'Alpha Precision Scientific Instruments Ltd',
      contactPerson: 'Dr. Sameer Godbole',
      email: 'sales@alphaprecision.in',
      role: 'vendor',
      roleTitle: 'Registered Scientific Vendor',
      phone: '+91 98765 77665',
      category: 'Scientific & Laboratory Equipment',
      msmeRegistered: false,
      gstin: '27AAECP1122D1ZQ',
      pan: 'AAECP1122D',
      verifiedKYC: true,
      rating: 4.6,
      twoFactorEnabled: true
    },
    {
      id: 'vendor-3',
      name: 'Apex Campus Facility Services LLP',
      contactPerson: 'Ms. Reena Sen',
      email: 'tenders@apexfacilities.co.in',
      role: 'vendor',
      roleTitle: 'Registered Facility Vendor',
      phone: '+91 98765 88990',
      category: 'AMC & Campus Maintenance',
      msmeRegistered: true,
      msmeUdyam: 'UDYAM-MH-03-0091234',
      gstin: '27BBKPS9988C1ZR',
      pan: 'BBKPS9988C',
      verifiedKYC: true,
      rating: 4.3,
      twoFactorEnabled: true
    },
    {
      id: 'vendor-4',
      name: 'Metro Educational Furniture Works',
      contactPerson: 'Mr. Deepak Chawla',
      email: 'projects@metrofurniture.in',
      role: 'vendor',
      roleTitle: 'Registered Furniture Manufacturer',
      phone: '+91 98765 22331',
      category: 'Furniture & Campus Infrastructure',
      msmeRegistered: true,
      msmeUdyam: 'UDYAM-MH-01-0023451',
      gstin: '27CCWPF4433E1ZS',
      pan: 'CCWPF4433E',
      verifiedKYC: true,
      rating: 4.9,
      twoFactorEnabled: true
    },
    {
      id: 'vendor-5',
      name: 'CyberNet Infotech Systems',
      contactPerson: 'Mr. Sunil Gupta',
      email: 'tenders@cybernetinfo.com',
      role: 'vendor',
      roleTitle: 'Hardware Reseller',
      phone: '+91 98765 99002',
      category: 'IT & Hardware Equipment',
      msmeRegistered: false,
      gstin: '27ZZXCV8877B1ZU',
      pan: 'ZZXCV8877B',
      verifiedKYC: true,
      rating: 3.9,
      twoFactorEnabled: false
    },
    {
      id: 'auditor-1',
      name: 'Mr. P. N. Murthy',
      email: 'internal.audit@univ.edu.in',
      role: 'auditor',
      roleTitle: 'Senior Statutory Auditor (CAG & State Vigilance)',
      department: 'Statutory Audit Cell',
      phone: '+91 98111 22334',
      twoFactorEnabled: true
    }
  ];

  const departments = [
    {
      id: 'dept-cse',
      name: 'Department of Computer Science & Engineering',
      code: 'CSE-101',
      hod: 'Prof. Anjali Sharma',
      budgets: [
        { code: 'DST-AI-2025', name: 'DST AI Center of Excellence Grant', allocated: 5000000, committed: 3600000, spent: 1800000 },
        { code: 'CSE-REC-2026', name: 'Department Recurring & Consumables', allocated: 1500000, committed: 400000, spent: 350000 }
      ]
    },
    {
      id: 'dept-chem',
      name: 'Department of Chemistry & Materials',
      code: 'CHM-102',
      hod: 'Prof. Rajesh Verma',
      budgets: [
        { code: 'SERB-LAB-2025', name: 'SERB High-Tech Analytical Lab Grant', allocated: 3500000, committed: 2450000, spent: 1200000 },
        { code: 'CHM-ANN-2026', name: 'Annual Chemical Reagents Budget', allocated: 1000000, committed: 200000, spent: 150000 }
      ]
    },
    {
      id: 'dept-lib',
      name: 'Central University Library',
      code: 'LIB-103',
      hod: 'Dr. Sunita Kadam',
      budgets: [
        { code: 'UGC-LIB-CAP', name: 'UGC E-Resource & CapEx Grant', allocated: 2000000, committed: 850000, spent: 450000 }
      ]
    },
    {
      id: 'dept-hostel',
      name: 'Student Hostels & Campus Amenities',
      code: 'HST-104',
      hod: 'Col. Arvind Patil',
      budgets: [
        { code: 'HOSTEL-DEV-2026', name: 'Hostel Maintenance & Mess Upgrades', allocated: 2500000, committed: 1550000, spent: 800000 }
      ]
    }
  ];

  const requisitions = [
    {
      id: 'REQ-2026-081',
      title: 'High-Speed Wi-Fi 6 Access Points for 8 Student Hostels',
      departmentId: 'dept-hostel',
      departmentName: 'Student Hostels & Campus Amenities',
      requesterId: 'dept-4',
      requesterName: 'Col. Arvind Patil',
      budgetCode: 'HOSTEL-DEV-2026',
      budgetName: 'Hostel Maintenance & Mess Upgrades',
      estimatedAmount: 1450000,
      justification: 'Current Wi-Fi infrastructure in hostel blocks A through H is over 8 years old, causing frequent drops during online examinations and academic submissions for 1800 residential students.',
      status: 'APPROVED',
      history: [
        { role: 'department', action: 'Submitted Requisition', timestamp: '2026-09-10T10:30:00Z', actor: 'Col. Arvind Patil' },
        { role: 'approver', action: 'Finance Officer Verified Budget', timestamp: '2026-09-11T14:15:00Z', actor: 'CA Ramesh Nair' },
        { role: 'approver', action: 'Registrar Sanctioned', timestamp: '2026-09-12T11:00:00Z', actor: 'Prof. K. R. Ramanathan' }
      ]
    },
    {
      id: 'REQ-2026-085',
      title: 'Digital Microtome & Biosafety Cabinet Level-2 for Life Sciences Lab',
      departmentId: 'dept-chem',
      departmentName: 'Department of Chemistry & Materials',
      requesterId: 'dept-2',
      requesterName: 'Prof. Rajesh Verma',
      budgetCode: 'SERB-LAB-2025',
      budgetName: 'SERB High-Tech Analytical Lab Grant',
      estimatedAmount: 850000,
      justification: 'Required for advanced cell culture research and tissue sectioning under SERB CRG research grant.',
      status: 'PENDING_FINANCE',
      history: [
        { role: 'department', action: 'Submitted Requisition', timestamp: '2026-09-25T09:00:00Z', actor: 'Prof. Rajesh Verma' }
      ]
    }
  ];

  const tenders = [
    {
      id: 'TDR-2026-001',
      referenceNumber: 'UNIV/PROC/CSE/2026/014',
      title: 'Supply, Testing and Commissioning of 60 High-Performance GPU Workstations for AI Research Lab',
      category: 'Goods / IT & Electronics',
      templateType: 'computers',
      departmentId: 'dept-cse',
      departmentName: 'Computer Science & Engineering',
      requisitionRef: 'REQ-2026-042',
      budgetCode: 'DST-AI-2025',
      estimatedCost: 3600000,
      emdAmount: 72000, // 2% EMD
      tenderFee: 2500,
      biddingType: 'TWO_ENVELOPE', // Technical & Financial
      evaluationMethod: 'L1', // Lowest cost among technically qualified
      minTechnicalScore: 75,
      publishDate: '2026-09-01T09:00:00Z',
      preBidMeetingDate: '2026-09-08T11:00:00Z',
      submissionDeadline: '2026-09-28T17:00:00Z',
      technicalBidOpeningDate: '2026-09-29T10:00:00Z',
      financialBidOpeningDate: '2026-09-30T15:00:00Z',
      status: 'TECHNICAL_EVALUATION', // Stages: DRAFT, APPROVAL, PUBLISHED, TECHNICAL_EVALUATION, FINANCIAL_OPENING_READY, AWARDED, CANCELLED
      isFinancialLocked: true,
      dualKeyUnlockStatus: {
        commChairUnlocked: true,
        financeOfficerUnlocked: true,
        status: 'UNLOCKED_TECHNICAL'
      },
      specifications: [
        { item: 'Processor', requirement: 'Intel Core i9 14th Gen or AMD Ryzen 9 7900X, 16+ Cores' },
        { item: 'GPU', requirement: 'NVIDIA RTX 4080 16GB GDDR6X or higher workstation grade' },
        { item: 'Memory', requirement: '64 GB DDR5 5600 MHz (Expandable to 128GB)' },
        { item: 'Storage', requirement: '2 TB PCIe Gen4 NVMe M.2 SSD + 4 TB Enterprise SATA HDD' },
        { item: 'Display', requirement: '27-inch 4K IPS Monitor with 99% sRGB color gamut' },
        { item: 'Warranty', requirement: '3 Years Comprehensive On-Site OEM Warranty' }
      ],
      eligibilityCriteria: [
        'Bidder must have average annual turnover of ₹1.5 Crores in last 3 financial years',
        'Valid OEM Authorization Letter (MAF) specifically addressing Registrar, UniTender Portal',
        'Minimum 3 successful supply orders to IITs/NITs/State Universities in last 3 years',
        'GST and PAN registration certificate with clean compliance records',
        'MSME / Startup exemption eligible as per GFR 2017 Rule 170'
      ],
      gfrCompliance: {
        gfrRule: 'GFR 2017 Rule 149 / 161 (Open Competitive Bidding)',
        noticePeriodDays: 28,
        gemNonAvailabilityRef: 'GeM/GAR/2026/092144',
        procurementType: 'Advertised Tender'
      },
      assignedCommittee: ['comm-1', 'comm-2', 'approver-1'],
      downloadsCount: 14,
      downloadLogs: [
        { vendorName: 'TechSol India Systems Pvt Ltd', ip: '103.24.120.45', downloadedAt: '2026-09-02T10:14:22Z' },
        { vendorName: 'CyberNet Infotech Systems', ip: '103.24.120.45', downloadedAt: '2026-09-02T11:30:10Z' }, // intentionally same IP for demo collusion
        { vendorName: 'National IT Solutions', ip: '49.36.19.82', downloadedAt: '2026-09-03T16:45:00Z' }
      ],
      preBidQueries: [
        {
          id: 'PBQ-01',
          vendorId: 'vendor-1',
          vendorName: 'TechSol India Systems Pvt Ltd',
          query: 'Can we offer NVIDIA RTX 4070 Ti Super 16GB instead of RTX 4080 if it meets benchmark scores?',
          status: 'ANSWERED',
          response: 'Clarification: Only RTX 4080 16GB or higher workstation class GPUs will be accepted for AI model training requirements.',
          answeredAt: '2026-09-09T14:00:00Z'
        },
        {
          id: 'PBQ-02',
          vendorId: 'vendor-5',
          vendorName: 'CyberNet Infotech Systems',
          query: 'Is delivery timeline extendable from 30 days to 45 days considering international GPU logistics?',
          status: 'ANSWERED',
          response: 'Corrigendum 1 published extending delivery window to 42 calendar days.',
          answeredAt: '2026-09-09T15:30:00Z'
        }
      ],
      corrigenda: [
        {
          number: 'CORR-01',
          title: 'Extension of Delivery Timeline & Specification Clarification',
          publishedAt: '2026-09-10T11:00:00Z',
          description: '1. Delivery period relaxed to 42 days from Work Order. 2. Linux Ubuntu 24.04 LTS pre-installation certified required.',
          downloadRef: 'CORR-01-UNIV-CSE-2026.pdf'
        }
      ]
    },
    {
      id: 'TDR-2026-002',
      referenceNumber: 'UNIV/PROC/CHM/2026/008',
      title: 'Procurement, Installation and Testing of High-Performance Liquid Chromatography (HPLC) & UV-Vis Spectrophotometer',
      category: 'Goods / Scientific Instruments',
      templateType: 'lab_equipment',
      departmentId: 'dept-chem',
      departmentName: 'Department of Chemistry & Materials',
      requisitionRef: 'REQ-2026-031',
      budgetCode: 'SERB-LAB-2025',
      estimatedCost: 2450000,
      emdAmount: 49000,
      tenderFee: 1500,
      biddingType: 'TWO_ENVELOPE',
      evaluationMethod: 'QCBS', // 70:30 Quality and Cost Based Selection
      qcbsWeights: { technical: 70, financial: 30 },
      minTechnicalScore: 70,
      publishDate: '2026-08-20T10:00:00Z',
      submissionDeadline: '2026-09-20T17:00:00Z',
      technicalBidOpeningDate: '2026-09-22T11:00:00Z',
      financialBidOpeningDate: '2026-09-29T15:00:00Z',
      status: 'FINANCIAL_OPENING_READY', // Technical completed, ready for committee to open financial envelopes!
      isFinancialLocked: false,
      dualKeyUnlockStatus: {
        commChairUnlocked: true,
        financeOfficerUnlocked: true,
        status: 'READY_TO_OPEN_FINANCIAL'
      },
      specifications: [
        { item: 'Pump System', requirement: 'Quaternary Gradient HPLC Pump with integrated vacuum degasser, pressure up to 600 bar' },
        { item: 'Detector', requirement: 'Photodiode Array (PDA/DAD) detector, wavelength range 190-800 nm' },
        { item: 'Autosampler', requirement: 'Capacity 100+ vials with temperature control (4°C - 45°C)' },
        { item: 'Software', requirement: 'CFR 21 Part 11 compliant chromatography data workstation with 3 client licenses' }
      ],
      eligibilityCriteria: [
        'Manufacturer must have ISO 9001 and CE certification for analytical instrumentation',
        'Minimum 5 installations of identical model in Central Universities, CSIR or IIT labs',
        'Minimum ₹2 Crores annual turnover for last 3 years',
        'Dedicated factory-trained service engineer located within 200 km radius'
      ],
      gfrCompliance: {
        gfrRule: 'GFR 2017 Rule 192 (QCBS Selection)',
        noticePeriodDays: 30,
        gemNonAvailabilityRef: 'GeM/GAR/2026/088712',
        procurementType: 'Global / Advertised'
      },
      assignedCommittee: ['comm-1', 'comm-2', 'approver-1'],
      downloadsCount: 9,
      downloadLogs: [],
      preBidQueries: [],
      corrigenda: []
    },
    {
      id: 'TDR-2026-003',
      referenceNumber: 'UNIV/EST/AMC/2026/003',
      title: 'Comprehensive Annual Maintenance Contract (AMC) for 40 Campus Elevators & Substation Transformers',
      category: 'Services & AMC',
      templateType: 'amc',
      departmentId: 'dept-hostel',
      departmentName: 'Campus Estates & Hostel Amenities',
      requisitionRef: 'REQ-2026-019',
      budgetCode: 'HOSTEL-DEV-2026',
      estimatedCost: 1550000,
      emdAmount: 31000,
      tenderFee: 1000,
      biddingType: 'TWO_ENVELOPE',
      evaluationMethod: 'L1',
      minTechnicalScore: 70,
      publishDate: '2026-09-18T10:00:00Z',
      submissionDeadline: '2026-10-15T17:00:00Z',
      technicalBidOpeningDate: '2026-10-16T11:00:00Z',
      status: 'PUBLISHED',
      isFinancialLocked: true,
      specifications: [
        { item: 'Scope of Service', requirement: '24/7 Breakdown emergency response within 45 minutes; Monthly preventive inspection' },
        { item: 'Spare Parts', requirement: 'All genuine OEM drive belts, sensors, control cables, contactors included in contract' },
        { item: 'Safety Audit', requirement: 'Bi-annual government elevator inspector safety certification renewal included' }
      ],
      eligibilityCriteria: [
        'Valid Electrical Contractor License (Class-A) issued by State Govt',
        'Direct authorization from elevator OEMs (Otis, Schindler, KONE)',
        '3 years proven AMC performance record in educational or public campuses'
      ],
      gfrCompliance: {
        gfrRule: 'GFR 2017 Rule 162',
        noticePeriodDays: 27,
        gemNonAvailabilityRef: 'GeM/GAR/2026/102938',
        procurementType: 'Advertised Tender'
      },
      assignedCommittee: ['comm-1', 'approver-1'],
      downloadsCount: 18,
      downloadLogs: [],
      preBidQueries: [],
      corrigenda: []
    },
    {
      id: 'TDR-2026-004',
      referenceNumber: 'UNIV/FURN/2026/002',
      title: 'Supply & Installation of 350 Dual Desk Modular Classroom Benches & Ergonomic Faculty Chairs',
      category: 'Goods / Furniture',
      templateType: 'furniture',
      departmentId: 'dept-cse',
      departmentName: 'General University Infrastructure',
      requisitionRef: 'REQ-2026-005',
      budgetCode: 'DST-AI-2025',
      estimatedCost: 1800000,
      emdAmount: 36000,
      tenderFee: 1000,
      biddingType: 'TWO_ENVELOPE',
      evaluationMethod: 'L1',
      status: 'AWARDED',
      awardedVendorId: 'vendor-4',
      awardedVendorName: 'Metro Educational Furniture Works',
      awardedAmount: 1620000,
      savingsAchieved: 180000, // 10% under estimate
      contractStatus: 'DELIVERY_IN_PROGRESS',
      workOrderNumber: 'WO/UNIV/2026/044',
      workOrderIssuedAt: '2026-08-15T10:00:00Z',
      deliveryMilestone: {
        totalItems: 350,
        deliveredItems: 280,
        inspectionStatus: 'PARTIALLY_INSPECTED',
        stockUpdated: true
      },
      gfrCompliance: {
        gfrRule: 'GFR 2017 Rule 149',
        noticePeriodDays: 25,
        gemNonAvailabilityRef: 'GeM/GAR/2026/044910',
        procurementType: 'Open Tender'
      },
      assignedCommittee: ['comm-1', 'comm-2']
    }
  ];

  const bids = [
    // Bids for TDR-2026-001 (GPU Workstations - Under Technical Evaluation)
    {
      id: 'BID-2026-0101',
      tenderId: 'TDR-2026-001',
      vendorId: 'vendor-1',
      vendorName: 'TechSol India Systems Pvt Ltd',
      submittedAt: '2026-09-27T14:20:10Z',
      ipAddress: '103.24.120.45',
      digitalSignatureStatus: 'VERIFIED_ESIGN_AADHAAR',
      msmeExemptionClaimed: true,
      emdStatus: 'EXEMPTED_MSME',
      technicalEnvelope: {
        sealed: true,
        docHash: 'a7f3e8812c98d641efb3c4a2e6f98721',
        submittedDocs: [
          'OEM Authorization Form (Dell Enterprise)',
          'Audited Balance Sheet FY 2023-2026',
          '3 Purchase Orders from IIT Bombay & VJTI',
          'MSME Udyam Certificate'
        ],
        complianceScore: null, // to be entered by committee
        status: 'PENDING_SCORING',
        evaluations: [
          { committeeId: 'comm-1', committeeName: 'Dr. Vikram Rao', score: 88, remarks: 'Meets all OEM certifications and benchmark requirements. Solid past track record with IIT Bombay.', submittedAt: '2026-09-29T11:00:00Z' }
          // comm-2 has not scored yet (Blind scoring test!)
        ]
      },
      financialEnvelope: {
        sealed: true,
        isUnlocked: false,
        encryptedDigest: 'sha256-4c90e12ba8311bc7629e46a51d8b9e4a3b119c6f2a',
        itemizedQuotes: [
          { item: '60x High-End GPU Workstation (i9 + RTX 4080)', unitRate: 54000, gstRate: 18, total: 3823200 }
        ],
        totalAmount: 3340000 // Unlocks when technical evaluation completes
      }
    },
    {
      id: 'BID-2026-0102',
      tenderId: 'TDR-2026-001',
      vendorId: 'vendor-5',
      vendorName: 'CyberNet Infotech Systems',
      submittedAt: '2026-09-27T14:22:45Z', // 2.5 mins after vendor-1 (for collusion detection demo!)
      ipAddress: '103.24.120.45', // exact same IP as vendor-1!
      digitalSignatureStatus: 'VERIFIED_OTP',
      msmeExemptionClaimed: false,
      emdStatus: 'PAID',
      emdTransactionRef: 'TXN-UPI-9821410',
      technicalEnvelope: {
        sealed: true,
        docHash: 'a7f3e8812c98d641efb3c4a2e6f98721', // exact matching doc checksum!
        submittedDocs: [
          'Authorization Form (HP Enterprise)',
          'Audited Balance Sheet',
          'Past Delivery Letters'
        ],
        complianceScore: null,
        status: 'PENDING_SCORING',
        evaluations: [
          { committeeId: 'comm-1', committeeName: 'Dr. Vikram Rao', score: 78, remarks: 'Documentation present but OEM authorization lacks official seal for current fiscal year.', submittedAt: '2026-09-29T11:15:00Z' }
        ]
      },
      financialEnvelope: {
        sealed: true,
        isUnlocked: false,
        encryptedDigest: 'sha256-11884ba89cd234fae2348bcae9981249910d8a',
        totalAmount: 3490000
      }
    },

    // Bids for TDR-2026-002 (HPLC Equipment - Technical Evaluation Complete, Ready to View CSQ)
    {
      id: 'BID-2026-0201',
      tenderId: 'TDR-2026-002',
      vendorId: 'vendor-2',
      vendorName: 'Alpha Precision Scientific Instruments Ltd',
      submittedAt: '2026-09-18T16:00:00Z',
      ipAddress: '14.139.112.9',
      digitalSignatureStatus: 'VERIFIED_DSC_CLASS3',
      msmeExemptionClaimed: false,
      emdStatus: 'PAID',
      emdTransactionRef: 'TXN-NEFT-889123',
      technicalEnvelope: {
        sealed: false,
        status: 'QUALIFIED',
        averageScore: 92,
        evaluations: [
          { committeeId: 'comm-1', committeeName: 'Dr. Vikram Rao', score: 94, remarks: 'Excellent pump specifications with low dead volume. Direct OEM service station in Pune.', submittedAt: '2026-09-22T14:00:00Z' },
          { committeeId: 'comm-2', committeeName: 'Dr. Priya Patel', score: 90, remarks: 'Complies with CFR 21 Part 11 software audit requirements.', submittedAt: '2026-09-22T15:10:00Z' }
        ]
      },
      financialEnvelope: {
        sealed: false,
        isUnlocked: true,
        itemizedQuotes: [
          { item: 'Quaternary HPLC System with PDA Detector', unitRate: 1850000, gstRate: 18, total: 2183000 },
          { item: '3-Year Annual Consumables Kit & Columns', unitRate: 110000, gstRate: 18, total: 129800 }
        ],
        totalAmount: 2312800 // Technically Qualified & Financial Unlocked
      }
    },
    {
      id: 'BID-2026-0202',
      tenderId: 'TDR-2026-002',
      vendorId: 'vendor-1',
      vendorName: 'TechSol India Systems Pvt Ltd',
      submittedAt: '2026-09-19T11:20:00Z',
      ipAddress: '103.24.120.45',
      digitalSignatureStatus: 'VERIFIED_ESIGN_AADHAAR',
      msmeExemptionClaimed: true,
      emdStatus: 'EXEMPTED_MSME',
      technicalEnvelope: {
        sealed: false,
        status: 'QUALIFIED',
        averageScore: 84,
        evaluations: [
          { committeeId: 'comm-1', committeeName: 'Dr. Vikram Rao', score: 85, remarks: 'OEM partner for Shimadzu. Good specs.', submittedAt: '2026-09-22T14:30:00Z' },
          { committeeId: 'comm-2', committeeName: 'Dr. Priya Patel', score: 83, remarks: 'Minor clarification needed on column oven heating range, otherwise compliant.', submittedAt: '2026-09-22T15:45:00Z' }
        ]
      },
      financialEnvelope: {
        sealed: false,
        isUnlocked: true,
        itemizedQuotes: [
          { item: 'HPLC System with UV Detector', unitRate: 1950000, gstRate: 18, total: 2301000 }
        ],
        totalAmount: 2301000
      }
    }
  ];

  const payments = [
    {
      id: 'PAY-001',
      tenderId: 'TDR-2026-001',
      vendorId: 'vendor-5',
      vendorName: 'CyberNet Infotech Systems',
      type: 'EMD',
      amount: 72000,
      mode: 'UPI / NetBanking',
      status: 'HELD_IN_ESCROW',
      transactionDate: '2026-09-27T14:21:00Z',
      refundStatus: 'PENDING_EVALUATION'
    },
    {
      id: 'PAY-002',
      tenderId: 'TDR-2026-002',
      vendorId: 'vendor-2',
      vendorName: 'Alpha Precision Scientific Instruments Ltd',
      type: 'EMD',
      amount: 49000,
      mode: 'NEFT / RTGS',
      status: 'HELD_IN_ESCROW',
      transactionDate: '2026-09-18T15:55:00Z',
      refundStatus: 'PENDING_AWARD'
    },
    {
      id: 'PAY-003',
      tenderId: 'TDR-2026-004',
      vendorId: 'vendor-4',
      vendorName: 'Metro Educational Furniture Works',
      type: 'INVOICE_PARTIAL',
      amount: 1296000, // 80% milestone payment for 280 delivered desks
      mode: 'PFMS Direct Transfer',
      status: 'PROCESSED_ACCOUNTS',
      transactionDate: '2026-09-20T11:00:00Z',
      invoiceNumber: 'INV/MEF/2026/109'
    }
  ];

  const inventory = [
    {
      assetCode: 'UNIV/CSE/2026/AST-0891',
      name: 'Modular Classroom Benches (Batches 1 & 2)',
      tenderRef: 'TDR-2026-004',
      vendor: 'Metro Educational Furniture Works',
      quantity: 280,
      unitPrice: 4628,
      totalCost: 1296000,
      location: 'Lecture Hall Complex - Rooms 101 to 106',
      department: 'Computer Science & Engineering',
      inspectionCertificate: 'QC-INSP-2026-041 (Passed)',
      warrantyExpiry: '2029-08-15',
      addedOn: '2026-09-18T14:00:00Z'
    }
  ];

  const conflictDeclarations = [
    {
      userId: 'comm-1',
      userName: 'Dr. Vikram Rao',
      tenderId: 'TDR-2026-001',
      declared: true,
      hasConflict: false,
      affirmedAt: '2026-09-28T09:30:00Z',
      statement: 'I solemnly affirm under GFR 2017 ethics code that neither I nor any of my immediate relatives have any financial or advisory interest in any participating bidder for tender TDR-2026-001.'
    },
    {
      userId: 'comm-2',
      userName: 'Dr. Priya Patel',
      tenderId: 'TDR-2026-001',
      declared: true,
      hasConflict: false,
      affirmedAt: '2026-09-28T10:15:00Z',
      statement: 'I solemnly affirm under GFR 2017 ethics code that neither I nor any of my immediate relatives have any financial or advisory interest in any participating bidder for tender TDR-2026-001.'
    }
  ];

  // Build the cryptographic blockchain audit log
  const initialAuditTrail = [];
  let prevHash = '0'.repeat(64);

  const initialLogEntries = [
    {
      index: 0,
      actorId: 'system',
      actorName: 'Genesis Protocol',
      actorRole: 'SYSTEM',
      action: 'GENESIS_BLOCK_CREATED',
      entityType: 'SYSTEM',
      entityId: 'ROOT',
      details: 'UniTender Tamper-Proof Cryptographic Ledger initialized.',
      ipAddress: '127.0.0.1'
    },
    {
      index: 1,
      actorId: 'dept-1',
      actorName: 'Prof. Anjali Sharma',
      actorRole: 'DEPARTMENT_HOD',
      action: 'REQUISITION_SUBMITTED',
      entityType: 'REQUISITION',
      entityId: 'REQ-2026-042',
      details: 'Submitted purchase request for 60 GPU workstations under DST AI grant.',
      ipAddress: '192.168.10.45'
    },
    {
      index: 2,
      actorId: 'approver-1',
      actorName: 'CA Ramesh Nair',
      actorRole: 'FINANCE_OFFICER',
      action: 'BUDGET_ENCUMBERED',
      entityType: 'BUDGET',
      entityId: 'DST-AI-2025',
      details: 'Encumbered ₹36,00,000 against DST AI Center budget code.',
      ipAddress: '192.168.10.12'
    },
    {
      index: 3,
      actorId: 'admin-1',
      actorName: 'Dr. Sanjay Deshmukh',
      actorRole: 'PROCUREMENT_OFFICER',
      action: 'TENDER_PUBLISHED',
      entityType: 'TENDER',
      entityId: 'TDR-2026-001',
      details: 'Tender UNIV/PROC/CSE/2026/014 published on Public Notice Board with 28-day notice.',
      ipAddress: '192.168.10.8'
    },
    {
      index: 4,
      actorId: 'vendor-1',
      actorName: 'TechSol India Systems Pvt Ltd',
      actorRole: 'VENDOR',
      action: 'DOCUMENT_DOWNLOADED',
      entityType: 'TENDER',
      entityId: 'TDR-2026-001',
      details: 'Downloaded tender documents & BOQ sheet.',
      ipAddress: '103.24.120.45'
    },
    {
      index: 5,
      actorId: 'vendor-1',
      actorName: 'TechSol India Systems Pvt Ltd',
      actorRole: 'VENDOR',
      action: 'BID_SUBMITTED_TWO_ENVELOPE',
      entityType: 'BID',
      entityId: 'BID-2026-0101',
      details: 'Cryptographically sealed Envelope A and Envelope B submitted. MSME exemption validated.',
      ipAddress: '103.24.120.45'
    },
    {
      index: 6,
      actorId: 'comm-1',
      actorName: 'Dr. Vikram Rao',
      actorRole: 'COMMITTEE_CHAIR',
      action: 'COI_DECLARATION_AFFIRMED',
      entityType: 'COMPLIANCE',
      entityId: 'TDR-2026-001',
      details: 'Signed electronic conflict-of-interest waiver before technical bid inspection.',
      ipAddress: '192.168.12.99'
    }
  ];

  initialLogEntries.forEach(entry => {
    const block = createAuditBlock(prevHash, entry);
    initialAuditTrail.push(block);
    prevHash = block.hash;
  });

  return {
    users,
    departments,
    requisitions,
    tenders,
    bids,
    payments,
    inventory,
    conflictDeclarations,
    auditTrail: initialAuditTrail
  };
}

module.exports = {
  getInitialData
};
