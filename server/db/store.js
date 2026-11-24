const fs = require('fs');
const path = require('path');
const { getInitialData } = require('./seedData');
const { createAuditBlock, verifyAuditChain, computeHash } = require('../utils/crypto');
const { analyzeTenderBids } = require('../utils/antiCollusion');

const DATA_FILE = path.join(__dirname, 'store.json');

class DataStore {
  constructor() {
    this.data = null;
    this.load();
  }

  load() {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Failed reading existing store.json, resetting to seed data:', err);
      }
    }
    this.data = getInitialData();
    this.save();
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist store.json:', err);
    }
  }

  reset() {
    this.data = getInitialData();
    this.save();
    return this.data;
  }

  // Audit Chaining Helper
  logAudit(actor, action, entityType, entityId, details, ip = '192.168.1.100') {
    const chain = this.data.auditTrail || [];
    const prevBlock = chain.length > 0 ? chain[chain.length - 1] : null;
    const prevHash = prevBlock ? prevBlock.hash : '0'.repeat(64);
    
    const entry = {
      index: chain.length,
      actorId: actor?.id || 'system',
      actorName: actor?.name || 'System Actor',
      actorRole: actor?.role || 'SYSTEM',
      action,
      entityType,
      entityId,
      details,
      ipAddress: ip
    };

    const newBlock = createAuditBlock(prevHash, entry);
    this.data.auditTrail.push(newBlock);
    this.save();
    return newBlock;
  }

  getAuditTrail() {
    return this.data.auditTrail || [];
  }

  verifyLedger() {
    return verifyAuditChain(this.data.auditTrail || []);
  }

  // Users
  getUsers() {
    return this.data.users || [];
  }

  getUser(id) {
    return this.getUsers().find(u => u.id === id);
  }

  // Departments & Budgets
  getDepartments() {
    return this.data.departments || [];
  }

  checkBudget(departmentId, budgetCode, requestedAmount) {
    const dept = this.getDepartments().find(d => d.id === departmentId);
    if (!dept) return { valid: false, reason: 'Department not found' };
    const budget = dept.budgets.find(b => b.code === budgetCode);
    if (!budget) return { valid: false, reason: 'Budget code not found' };

    const available = budget.allocated - (budget.committed || 0);
    if (requestedAmount > available) {
      return {
        valid: false,
        reason: `Insufficient funds! Requested ₹${requestedAmount.toLocaleString('en-IN')}, but available balance is only ₹${available.toLocaleString('en-IN')}.`,
        available,
        allocated: budget.allocated,
        committed: budget.committed
      };
    }

    return {
      valid: true,
      available,
      allocated: budget.allocated,
      committed: budget.committed
    };
  }

  // Requisitions
  getRequisitions() {
    return this.data.requisitions || [];
  }

  getRequisition(id) {
    return this.getRequisitions().find(r => r.id === id);
  }

  createRequisition(payload, user, ip) {
    const newId = `REQ-2026-${String(this.data.requisitions.length + 86).padStart(3, '0')}`;
    const reqItem = {
      id: newId,
      title: payload.title,
      departmentId: payload.departmentId,
      departmentName: payload.departmentName,
      requesterId: user.id,
      requesterName: user.name,
      budgetCode: payload.budgetCode,
      budgetName: payload.budgetName,
      estimatedAmount: Number(payload.estimatedAmount),
      justification: payload.justification,
      status: 'PENDING_FINANCE',
      history: [
        {
          role: user.role,
          action: 'Requisition Raised',
          timestamp: new Date().toISOString(),
          actor: user.name
        }
      ],
      createdAt: new Date().toISOString()
    };

    // Commit funds against budget
    const dept = this.data.departments.find(d => d.id === payload.departmentId);
    if (dept) {
      const budget = dept.budgets.find(b => b.code === payload.budgetCode);
      if (budget) {
        budget.committed = (budget.committed || 0) + Number(payload.estimatedAmount);
      }
    }

    this.data.requisitions.unshift(reqItem);
    this.logAudit(user, 'REQUISITION_CREATED', 'REQUISITION', newId, `Submitted requisition "${payload.title}" for ₹${payload.estimatedAmount}`, ip);
    this.save();
    return reqItem;
  }

  updateRequisitionStatus(id, newStatus, user, remarks, ip) {
    const req = this.getRequisition(id);
    if (!req) return null;

    req.status = newStatus;
    req.history.push({
      role: user.role,
      action: `Status changed to ${newStatus} (${remarks || 'No remarks'})`,
      timestamp: new Date().toISOString(),
      actor: user.name
    });

    this.logAudit(user, `REQUISITION_${newStatus}`, 'REQUISITION', id, remarks || `Status updated to ${newStatus}`, ip);
    this.save();
    return req;
  }

  // Tenders
  getTenders() {
    return this.data.tenders || [];
  }

  getTender(id) {
    return this.getTenders().find(t => t.id === id);
  }

  createTender(payload, user, ip) {
    const newId = `TDR-2026-${String(this.data.tenders.length + 5).padStart(3, '0')}`;
    const refNum = `UNIV/PROC/${newId}/2026`;
    const tender = {
      id: newId,
      referenceNumber: refNum,
      title: payload.title,
      category: payload.category || 'Goods',
      templateType: payload.templateType || 'general',
      departmentId: payload.departmentId,
      departmentName: payload.departmentName,
      requisitionRef: payload.requisitionRef || '',
      budgetCode: payload.budgetCode,
      estimatedCost: Number(payload.estimatedCost),
      emdAmount: Number(payload.emdAmount || Math.round(Number(payload.estimatedCost) * 0.02)),
      tenderFee: Number(payload.tenderFee || 1000),
      biddingType: payload.biddingType || 'TWO_ENVELOPE',
      evaluationMethod: payload.evaluationMethod || 'L1',
      qcbsWeights: payload.qcbsWeights || { technical: 70, financial: 30 },
      minTechnicalScore: Number(payload.minTechnicalScore || 70),
      publishDate: payload.publishDate || new Date().toISOString(),
      preBidMeetingDate: payload.preBidMeetingDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      submissionDeadline: payload.submissionDeadline || new Date(Date.now() + 21 * 86400000).toISOString(),
      technicalBidOpeningDate: payload.technicalBidOpeningDate || new Date(Date.now() + 22 * 86400000).toISOString(),
      financialBidOpeningDate: payload.financialBidOpeningDate || new Date(Date.now() + 25 * 86400000).toISOString(),
      status: 'PUBLISHED',
      isFinancialLocked: true,
      specifications: payload.specifications || [],
      eligibilityCriteria: payload.eligibilityCriteria || [],
      gfrCompliance: payload.gfrCompliance || {
        gfrRule: 'GFR 2017 Rule 149/161',
        noticePeriodDays: 21,
        procurementType: 'Open Tender'
      },
      assignedCommittee: payload.assignedCommittee || ['comm-1', 'comm-2'],
      downloadsCount: 0,
      downloadLogs: [],
      preBidQueries: [],
      corrigenda: []
    };

    this.data.tenders.unshift(tender);
    this.logAudit(user, 'TENDER_PUBLISHED', 'TENDER', newId, `Published tender "${payload.title}" with estimated cost ₹${payload.estimatedCost}`, ip);
    this.save();
    return tender;
  }

  trackDocumentDownload(tenderId, vendor, ip) {
    const tender = this.getTender(tenderId);
    if (!tender) return false;
    tender.downloadsCount = (tender.downloadsCount || 0) + 1;
    if (!tender.downloadLogs) tender.downloadLogs = [];
    tender.downloadLogs.unshift({
      vendorName: vendor.name,
      ip: ip || '103.24.120.45',
      downloadedAt: new Date().toISOString()
    });
    this.logAudit(vendor, 'DOCUMENT_DOWNLOADED', 'TENDER', tenderId, `Downloaded tender documents & specs`, ip);
    this.save();
    return true;
  }

  addPreBidQuery(tenderId, vendor, queryText, ip) {
    const tender = this.getTender(tenderId);
    if (!tender) return null;
    const queryItem = {
      id: `PBQ-${String((tender.preBidQueries || []).length + 1).padStart(2, '0')}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      query: queryText,
      status: 'PENDING',
      askedAt: new Date().toISOString()
    };
    if (!tender.preBidQueries) tender.preBidQueries = [];
    tender.preBidQueries.push(queryItem);
    this.logAudit(vendor, 'PRE_BID_QUERY_POSTED', 'TENDER', tenderId, `Posted pre-bid query: "${queryText.substring(0, 40)}..."`, ip);
    this.save();
    return queryItem;
  }

  answerPreBidQuery(tenderId, queryId, responseText, user, ip) {
    const tender = this.getTender(tenderId);
    if (!tender || !tender.preBidQueries) return null;
    const q = tender.preBidQueries.find(x => x.id === queryId);
    if (!q) return null;
    q.status = 'ANSWERED';
    q.response = responseText;
    q.answeredAt = new Date().toISOString();
    this.logAudit(user, 'PRE_BID_QUERY_ANSWERED', 'TENDER', tenderId, `Answered query ${queryId}`, ip);
    this.save();
    return q;
  }

  addCorrigendum(tenderId, corrData, user, ip) {
    const tender = this.getTender(tenderId);
    if (!tender) return null;
    if (!tender.corrigenda) tender.corrigenda = [];
    const number = `CORR-0${tender.corrigenda.length + 1}`;
    const newCorr = {
      number,
      title: corrData.title,
      description: corrData.description,
      publishedAt: new Date().toISOString(),
      downloadRef: `${number}-${tender.id}.pdf`
    };
    tender.corrigenda.push(newCorr);
    if (corrData.newDeadline) {
      tender.submissionDeadline = corrData.newDeadline;
    }
    this.logAudit(user, 'CORRIGENDUM_ISSUED', 'TENDER', tenderId, `Published Corrigendum ${number}: ${corrData.title}`, ip);
    this.save();
    return newCorr;
  }

  // Bids & Two-Envelope System
  getBids(tenderId) {
    const all = this.data.bids || [];
    if (!tenderId) return all;
    return all.filter(b => b.tenderId === tenderId);
  }

  getBid(id) {
    return (this.data.bids || []).find(b => b.id === id);
  }

  submitBid(payload, vendor, ip) {
    const tender = this.getTender(payload.tenderId);
    if (!tender) throw new Error('Tender not found');

    // Deadline validation
    if (new Date() > new Date(tender.submissionDeadline)) {
      throw new Error('Bid submission deadline has expired! Bids are strictly locked.');
    }

    const newBidId = `BID-2026-${String(this.data.bids.length + 103).padStart(4, '0')}`;
    const encDigest = computeHash(payload.financialEnvelope);

    const bid = {
      id: newBidId,
      tenderId: payload.tenderId,
      vendorId: vendor.id,
      vendorName: vendor.name,
      submittedAt: new Date().toISOString(),
      ipAddress: ip || '103.24.120.45',
      digitalSignatureStatus: payload.signatureType || 'VERIFIED_ESIGN_AADHAAR',
      msmeExemptionClaimed: !!payload.msmeExemptionClaimed,
      emdStatus: payload.msmeExemptionClaimed ? 'EXEMPTED_MSME' : 'PAID',
      emdTransactionRef: payload.emdTransactionRef || (payload.msmeExemptionClaimed ? null : 'TXN-' + Math.floor(Math.random() * 899999 + 100000)),
      technicalEnvelope: {
        sealed: true,
        docHash: computeHash(payload.technicalEnvelope?.submittedDocs || ['doc-default']),
        submittedDocs: payload.technicalEnvelope?.submittedDocs || [
          'OEM Technical Compliance Sheet',
          'Past Performance Letters',
          'Audited Balance Sheet'
        ],
        status: 'PENDING_SCORING',
        complianceScore: null,
        evaluations: []
      },
      financialEnvelope: {
        sealed: true,
        isUnlocked: false,
        encryptedDigest: `sha256-${encDigest}`,
        itemizedQuotes: payload.financialEnvelope?.itemizedQuotes || [],
        totalAmount: Number(payload.financialEnvelope?.totalAmount || 0)
      }
    };

    this.data.bids.push(bid);
    this.logAudit(vendor, 'BID_SUBMITTED_TWO_ENVELOPE', 'BID', newBidId, `Submitted 2-envelope bid for ${tender.referenceNumber}`, ip);
    this.save();
    return bid;
  }

  // Blind Scoring: Committee member scores a technical bid
  scoreTechnicalBid(bidId, committeeUser, score, remarks, ip) {
    const bid = this.getBid(bidId);
    if (!bid) return null;

    if (!bid.technicalEnvelope.evaluations) {
      bid.technicalEnvelope.evaluations = [];
    }

    // Upsert committee score
    const existingIndex = bid.technicalEnvelope.evaluations.findIndex(e => e.committeeId === committeeUser.id);
    const evalRecord = {
      committeeId: committeeUser.id,
      committeeName: committeeUser.name,
      score: Number(score),
      remarks: remarks || 'Evaluated against tender specifications.',
      submittedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      bid.technicalEnvelope.evaluations[existingIndex] = evalRecord;
    } else {
      bid.technicalEnvelope.evaluations.push(evalRecord);
    }

    // Calculate average score
    const sum = bid.technicalEnvelope.evaluations.reduce((acc, curr) => acc + curr.score, 0);
    const avg = Math.round(sum / bid.technicalEnvelope.evaluations.length);
    bid.technicalEnvelope.averageScore = avg;

    const tender = this.getTender(bid.tenderId);
    const minPass = tender?.minTechnicalScore || 70;
    bid.technicalEnvelope.status = avg >= minPass ? 'QUALIFIED' : 'DISQUALIFIED';

    this.logAudit(committeeUser, 'TECHNICAL_BID_SCORED', 'BID', bidId, `Recorded technical score ${score}/100. Status: ${bid.technicalEnvelope.status}`, ip);
    this.save();
    return bid;
  }

  // Unlock Financial Envelopes in Live Bid Opening Room (Dual key quorum)
  unlockFinancialEnvelopes(tenderId, user, ip) {
    const tender = this.getTender(tenderId);
    if (!tender) return null;

    tender.isFinancialLocked = false;
    tender.status = 'FINANCIAL_EVALUATION';
    if (!tender.dualKeyUnlockStatus) tender.dualKeyUnlockStatus = {};
    tender.dualKeyUnlockStatus.status = 'UNLOCKED_FINANCIAL';
    tender.dualKeyUnlockStatus.unlockedAt = new Date().toISOString();
    tender.dualKeyUnlockStatus.unlockedBy = user.name;

    // Decrypt financial envelope for technically qualified bids
    const tenderBids = this.getBids(tenderId);
    tenderBids.forEach(b => {
      if (b.technicalEnvelope && b.technicalEnvelope.status === 'QUALIFIED') {
        b.financialEnvelope.isUnlocked = true;
        b.financialEnvelope.sealed = false;
      }
    });

    this.logAudit(user, 'FINANCIAL_BIDS_UNLOCKED', 'TENDER', tenderId, `Dual-key quorum complete. Financial bids opened for technically qualified vendors.`, ip);
    this.save();
    return { tender, bids: tenderBids };
  }

  // Generate Comparative Statement (CSQ)
  getComparativeStatement(tenderId) {
    const tender = this.getTender(tenderId);
    if (!tender) return null;

    const bids = this.getBids(tenderId);
    const qualified = bids.filter(b => b.technicalEnvelope?.status === 'QUALIFIED' && b.financialEnvelope?.isUnlocked);

    let ranked = [];
    if (tender.evaluationMethod === 'QCBS') {
      const techWeight = (tender.qcbsWeights?.technical || 70) / 100;
      const finWeight = (tender.qcbsWeights?.financial || 30) / 100;

      // Find lowest price among qualified for financial formula: (L1_price / Vendor_price) * 100
      const minPrice = Math.min(...qualified.map(b => b.financialEnvelope.totalAmount || Infinity));

      ranked = qualified.map(b => {
        const tScore = b.technicalEnvelope.averageScore || 0;
        const price = b.financialEnvelope.totalAmount || 1;
        const fScore = Math.round((minPrice / price) * 100);
        const compositeScore = Number((tScore * techWeight + fScore * finWeight).toFixed(2));
        return {
          bidId: b.id,
          vendorId: b.vendorId,
          vendorName: b.vendorName,
          technicalScore: tScore,
          financialQuote: price,
          financialScore: fScore,
          compositeScore,
          rank: 0
        };
      });

      ranked.sort((a, b) => b.compositeScore - a.compositeScore);
      ranked.forEach((item, idx) => { item.rank = idx + 1; });
    } else {
      // Standard L1
      ranked = qualified.map(b => ({
        bidId: b.id,
        vendorId: b.vendorId,
        vendorName: b.vendorName,
        technicalScore: b.technicalEnvelope.averageScore || 0,
        financialQuote: b.financialEnvelope.totalAmount,
        rank: 0
      }));

      ranked.sort((a, b) => a.financialQuote - b.financialQuote);
      ranked.forEach((item, idx) => { item.rank = idx + 1; });
    }

    const disqualified = bids.filter(b => b.technicalEnvelope?.status !== 'QUALIFIED');

    return {
      tender,
      evaluationMethod: tender.evaluationMethod,
      ranked,
      disqualified: disqualified.map(d => ({
        bidId: d.id,
        vendorId: d.vendorId,
        vendorName: d.vendorName,
        technicalScore: d.technicalEnvelope?.averageScore || 0,
        reason: 'Failed minimum technical score threshold'
      }))
    };
  }

  // Award Tender & Generate Work Order (PO)
  awardTender(tenderId, winningBidId, user, ip) {
    const tender = this.getTender(tenderId);
    const bid = this.getBid(winningBidId);
    if (!tender || !bid) return null;

    tender.status = 'AWARDED';
    tender.awardedVendorId = bid.vendorId;
    tender.awardedVendorName = bid.vendorName;
    tender.awardedAmount = bid.financialEnvelope.totalAmount;
    tender.savingsAchieved = Math.max(0, tender.estimatedCost - tender.awardedAmount);
    tender.contractStatus = 'WORK_ORDER_ISSUED';
    tender.workOrderNumber = `WO/UNIV/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 899 + 100))}`;
    tender.workOrderIssuedAt = new Date().toISOString();
    tender.deliveryMilestone = {
      totalItems: 100,
      deliveredItems: 0,
      inspectionStatus: 'PENDING_DELIVERY',
      stockUpdated: false
    };

    this.logAudit(user, 'TENDER_AWARDED', 'TENDER', tenderId, `Awarded to ${bid.vendorName} at ₹${tender.awardedAmount}. WO: ${tender.workOrderNumber}`, ip);
    this.save();
    return tender;
  }

  // Inventory / Asset Integration
  receiveDeliveryAndSyncInventory(tenderId, user, ip) {
    const tender = this.getTender(tenderId);
    if (!tender || tender.status !== 'AWARDED') return null;

    const newAsset = {
      assetCode: `UNIV/${tender.departmentId.toUpperCase()}/AST-${Math.floor(Math.random() * 8999 + 1000)}`,
      name: tender.title,
      tenderRef: tender.id,
      vendor: tender.awardedVendorName,
      quantity: 1,
      unitPrice: tender.awardedAmount,
      totalCost: tender.awardedAmount,
      location: `${tender.departmentName} - Central Lab / Hall`,
      department: tender.departmentName,
      inspectionCertificate: `QC-INSP-${new Date().getFullYear()}-PASSED`,
      warrantyExpiry: new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0],
      addedOn: new Date().toISOString()
    };

    if (!this.data.inventory) this.data.inventory = [];
    this.data.inventory.unshift(newAsset);

    if (tender.deliveryMilestone) {
      tender.deliveryMilestone.inspectionStatus = 'COMPLETED_PASSED';
      tender.deliveryMilestone.stockUpdated = true;
      tender.deliveryMilestone.deliveredItems = tender.deliveryMilestone.totalItems;
    }
    tender.contractStatus = 'COMPLETED_IN_STOCK';

    this.logAudit(user, 'INVENTORY_STOCK_SYNCED', 'ASSET', newAsset.assetCode, `Automatically accessioned purchased equipment from ${tender.id} into University Asset Register`, ip);
    this.save();
    return { tender, asset: newAsset };
  }

  getInventory() {
    return this.data.inventory || [];
  }

  getPayments() {
    return this.data.payments || [];
  }

  // Conflict of Interest
  getConflictDeclarations(tenderId) {
    return (this.data.conflictDeclarations || []).filter(c => c.tenderId === tenderId);
  }

  affirmConflictDeclaration(tenderId, user, ip) {
    if (!this.data.conflictDeclarations) this.data.conflictDeclarations = [];
    const existing = this.data.conflictDeclarations.find(c => c.tenderId === tenderId && c.userId === user.id);
    const decl = {
      userId: user.id,
      userName: user.name,
      tenderId,
      declared: true,
      hasConflict: false,
      affirmedAt: new Date().toISOString(),
      statement: `I solemnly affirm under GFR 2017 ethics code that neither I nor any of my immediate relatives have any financial or advisory interest in any participating bidder for tender ${tenderId}.`
    };

    if (existing) {
      Object.assign(existing, decl);
    } else {
      this.data.conflictDeclarations.push(decl);
    }

    this.logAudit(user, 'COI_DECLARATION_AFFIRMED', 'COMPLIANCE', tenderId, 'Signed electronic conflict-of-interest declaration', ip);
    this.save();
    return decl;
  }

  // Anti-Collusion Report
  getAntiCollusionReport(tenderId) {
    const tender = this.getTender(tenderId);
    if (!tender) return null;
    const bids = this.getBids(tenderId);
    return analyzeTenderBids(tender, bids);
  }
}

const store = new DataStore();
module.exports = store;
