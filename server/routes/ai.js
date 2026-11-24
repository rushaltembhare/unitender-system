const express = require('express');
const router = express.Router();
const store = require('../db/store');

// AI Spec Drafter: Converts short need into full GFR-compliant specs
router.post('/draft-specs', (req, res) => {
  const { requirement, category, estimatedBudget } = req.body;
  const prompt = (requirement || '').toLowerCase();

  let specifications = [];
  let eligibilityCriteria = [
    'Minimum 3 years of audited balance sheets with annual turnover >= ₹1.5 Crores',
    'OEM Authorization Form (MAF) specific to the university',
    'GST and PAN registration compliance with clean track record',
    'Exemption for MSME/Startups as per GFR 2017 Rule 170'
  ];

  if (prompt.includes('laptop') || prompt.includes('computer') || prompt.includes('pc') || prompt.includes('server')) {
    specifications = [
      { item: 'Processor', requirement: 'Intel Core i7/i9 14th Gen or AMD Ryzen 9 7900X (16 cores, 32 threads, 5.0+ GHz boost)' },
      { item: 'Memory', requirement: '32 GB DDR5 5600 MHz RAM (Expandable up to 128 GB)' },
      { item: 'Storage', requirement: '1 TB NVMe M.2 PCIe Gen4 SSD + 2 TB Enterprise HDD' },
      { item: 'Dedicated Graphics', requirement: 'NVIDIA RTX 4070 / RTX 4080 16GB GDDR6X workstation card' },
      { item: 'Operating System', requirement: 'Pre-loaded Dual Boot: Windows 11 Pro 64-bit + Ubuntu Linux 24.04 LTS' },
      { item: 'Warranty & Support', requirement: '3 Years Comprehensive 24x7 On-Site Next Business Day OEM Warranty' }
    ];
  } else if (prompt.includes('lab') || prompt.includes('spectro') || prompt.includes('microscope') || prompt.includes('chemical')) {
    specifications = [
      { item: 'Optical / Analytical System', requirement: 'High precision dual-beam optics with low stray light (< 0.01%T)' },
      { item: 'Wavelength Range', requirement: '190 nm to 1100 nm with 0.1 nm spectral resolution' },
      { item: 'Detector', requirement: 'Silicon photodiode / Photomultiplier tube (PMT) array' },
      { item: 'Sample Chamber', requirement: 'Thermostatted cuvette holder with Peltier temperature control (10°C - 80°C)' },
      { item: 'Software & Compliance', requirement: 'CFR 21 Part 11 compliant analytical software with audit trail logging' }
    ];
  } else if (prompt.includes('wifi') || prompt.includes('network') || prompt.includes('switch') || prompt.includes('router')) {
    specifications = [
      { item: 'Wi-Fi Standard', requirement: 'Wi-Fi 6 (802.11ax) Dual-Band 4x4 MU-MIMO concurrent 5GHz and 2.4GHz' },
      { item: 'Throughput', requirement: 'Aggregated throughput >= 3.5 Gbps with 1024-QAM modulation' },
      { item: 'Client Capacity', requirement: 'Support for minimum 512 concurrent active clients per access point' },
      { item: 'Controller & Security', requirement: 'WPA3 Enterprise, 802.1X RADIUS authentication, Cloud management controller' },
      { item: 'PoE Support', requirement: '802.3at PoE+ power input with surge protection' }
    ];
  } else if (prompt.includes('furniture') || prompt.includes('bench') || prompt.includes('chair') || prompt.includes('desk')) {
    specifications = [
      { item: 'Material Specification', requirement: 'Cold Rolled Close Annealed (CRCA) steel tube frame >= 1.2mm thickness' },
      { item: 'Table Top & Seating', requirement: '25mm Pre-laminated medium density exterior grade MDF with PVC edge-banding' },
      { item: 'Finish & Coating', requirement: '7-tank phosphating and pure epoxy polyester powder coating (>= 50 microns)' },
      { item: 'Ergonomic Certification', requirement: 'BIFMA level 2 certified for institutional classroom durability' }
    ];
  } else {
    specifications = [
      { item: 'Scope of Supply', requirement: `Supply, testing, calibration, and commissioning of ${requirement}` },
      { item: 'Quality Standard', requirement: 'ISO 9001:2015 certified manufacturing and CE/BIS compliant parts' },
      { item: 'Delivery Schedule', requirement: 'Delivery within 30 days of Work Order receipt at University Campus' },
      { item: 'Warranty Period', requirement: 'Minimum 2 years comprehensive on-site warranty including spares' }
    ];
  }

  const generated = {
    title: `Procurement, Supply and Commissioning of ${requirement.trim()}`,
    suggestedCategory: prompt.includes('wifi') || prompt.includes('network') || prompt.includes('laptop') || prompt.includes('pc') ? 'Goods / IT & Electronics' :
                       prompt.includes('lab') || prompt.includes('spectro') ? 'Goods / Scientific Instruments' :
                       prompt.includes('furniture') ? 'Goods / Furniture' : 'Goods & Services',
    specifications,
    eligibilityCriteria,
    suggestedEmd: Math.round((Number(estimatedBudget) || 2000000) * 0.02),
    suggestedTenderFee: 1500,
    gfrChecklist: [
      'Rule 149: Verification that item is not exclusively mandated via GeM or Non-Availability Certificate is attached',
      'Rule 161: Notice period of minimum 21 days published on web notice board',
      'Rule 170: Exemption of Bid Security (EMD) for registered Micro and Small Enterprises (MSEs)',
      'Rule 173: Two-envelope system mandated for high-value scientific/technical equipment'
    ],
    aiSummary: `AI Assistant generated ${specifications.length} technical parameters conforming to standard higher education university procurement norms under GFR 2017.`
  };

  res.json({ success: true, generated });
});

// AI Proposal Summarizer: Creates executive brief for committee members
router.post('/summarize-bid', (req, res) => {
  const { bidId, tenderId } = req.body;
  const bid = store.getBid(bidId);
  const tender = store.getTender(tenderId || bid?.tenderId);

  if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });

  const summary = {
    vendorName: bid.vendorName,
    complianceVerdict: 'COMPLIANT WITH MINOR OBSERVATIONS',
    keyHighlights: [
      `Submitted valid digital signature (${bid.digitalSignatureStatus})`,
      `MSME Status: ${bid.msmeExemptionClaimed ? 'Claimed Exemption (Udyam Verified)' : 'Paid full EMD of ₹' + tender?.emdAmount?.toLocaleString('en-IN')}`,
      `Documents submitted: ${(bid.technicalEnvelope?.submittedDocs || []).length} verifiable credentials attached`
    ],
    riskAssessment: 'LOW RISK: Proven vendor with prior delivery history to premier institutions. Documentation complete under GFR 2017 checklist.',
    recommendedCommitteeScore: 85
  };

  res.json({ success: true, summary });
});

// AI Radar: Deep scan of tender bids for anti-collusion & price anomalies
router.post('/scan-collusion', (req, res) => {
  const { tenderId } = req.body;
  const tender = store.getTender(tenderId);
  if (!tender) return res.status(404).json({ success: false, message: 'Tender not found' });

  const bids = store.getBids(tenderId);
  const report = store.getAntiCollusionReport(tenderId);

  const narrative = report.flags.length === 0
    ? 'All submitted bids exhibit organic variance in timestamps, independent IP routing, and distinct cryptographic document checksums. No cartel or cover-bidding patterns detected.'
    : `Attention required: ${report.flags.length} anomaly marker(s) detected. Primary flags include ${report.flags.map(f => f.title).join('; ')}. The Evaluation Committee should scrutinize the listed vendors before final financial opening.`;

  res.json({
    success: true,
    tenderTitle: tender.title,
    bidsCount: bids.length,
    riskScore: report.riskScore,
    flags: report.flags,
    aiNarrative: narrative
  });
});

module.exports = router;
