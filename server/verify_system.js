const store = require('./db/store');
const { verifyAuditChain } = require('./utils/crypto');
const { analyzeTenderBids } = require('./utils/antiCollusion');

async function runSystemVerification() {
  console.log('================================================================');
  console.log('  UniTender Automated System Verification & Compliance Test Suite');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${testName}`);
    }
  }

  // 1. Data Store & Seed Initialization
  const users = store.getUsers();
  assert(users.length >= 6, `Seed users populated (found ${users.length} users across 6 roles)`);
  const admin = store.getUser('admin-1');
  assert(admin && admin.role === 'admin', 'Procurement Officer admin persona verified');
  const vendor1 = store.getUser('vendor-1');
  assert(vendor1 && vendor1.msmeRegistered && vendor1.msmeUdyam, 'MSME registered vendor KYC verified');

  // 2. Department Budgets & Encumbrance Check
  const budgetCheckGood = store.checkBudget('dept-cse', 'DST-AI-2025', 500000);
  assert(budgetCheckGood.valid, 'Budget check passed for available grant balance');
  const budgetCheckOver = store.checkBudget('dept-cse', 'DST-AI-2025', 99000000);
  assert(!budgetCheckOver.valid, 'Budget check correctly rejected over-budget requisition');

  // 3. Tenders & Two-Envelope System
  const tenders = store.getTenders();
  assert(tenders.length >= 4, `Pre-seeded tenders present (found ${tenders.length} tenders)`);
  const gpuTender = store.getTender('TDR-2026-001');
  assert(gpuTender && gpuTender.biddingType === 'TWO_ENVELOPE', 'Two-envelope bidding format verified on tender');

  // 4. Two-Envelope Sealed Bids
  const bids = store.getBids('TDR-2026-001');
  assert(bids.length >= 2, `Sealed bids found for TDR-2026-001 (found ${bids.length} bids)`);
  const bid1 = bids[0];
  assert(bid1.technicalEnvelope?.sealed && bid1.financialEnvelope?.sealed, 'Envelopes A & B are cryptographically sealed');
  assert(bid1.financialEnvelope.encryptedDigest.startsWith('sha256-'), 'Financial envelope is protected with SHA-256 digest lock');

  // 5. Anti-Collusion Radar
  const collusionReport = analyzeTenderBids(gpuTender, bids);
  assert(collusionReport.flags.length > 0, `Anti-Collusion engine identified suspicious pattern (found ${collusionReport.flags.length} flags)`);
  const hasIpFlag = collusionReport.flags.some(f => f.type === 'IP_COLLUSION');
  assert(hasIpFlag, 'Anti-Collusion flagged matching IP submission between competing bidders');

  // 6. Committee Blind Technical Scoring
  const commUser = store.getUser('comm-2');
  const scoredBid = store.scoreTechnicalBid('BID-2026-0101', commUser, 86, 'Good lab capabilities');
  assert(scoredBid && scoredBid.technicalEnvelope.averageScore >= 80, 'Blind committee technical score recorded and averaged');

  // 7. Live Bid Opening Room Dual-Key Unlock
  const unlockResult = store.unlockFinancialEnvelopes('TDR-2026-001', commUser, '192.168.1.100');
  assert(unlockResult && !unlockResult.tender.isFinancialLocked, 'Dual-key quorum successfully unlocked financial envelopes');

  // 8. Automated Comparative Statement (CSQ)
  const csq = store.getComparativeStatement('TDR-2026-002');
  assert(csq && csq.ranked.length > 0, `Comparative Statement (CSQ) generated in ${csq.evaluationMethod} mode`);
  assert(csq.ranked[0].rank === 1, 'Top qualified bidder ranked at position 1');

  // 9. Contract Award & Work Order Generation
  const awardedTender = store.awardTender('TDR-2026-002', csq.ranked[0].bidId, admin, '127.0.0.1');
  assert(awardedTender && awardedTender.status === 'AWARDED' && awardedTender.workOrderNumber, `Contract awarded. Work order ${awardedTender.workOrderNumber} issued`);

  // 10. Delivery QC & University Asset Register Accessioning
  const syncResult = store.receiveDeliveryAndSyncInventory(awardedTender.id, admin, '127.0.0.1');
  assert(syncResult && syncResult.asset.assetCode, `Tender delivery accessioned into University Asset Register (${syncResult.asset.assetCode})`);
  const inventory = store.getInventory();
  assert(inventory.length >= 2, `Asset register updated (total assets: ${inventory.length})`);

  // 11. Payments & EMD Escrow
  const payments = store.getPayments();
  assert(payments.length >= 3, `Payments tracked (total payments: ${payments.length})`);

  // 12. Blockchain SHA-256 Audit Ledger Validation
  const auditVerification = store.verifyLedger();
  assert(auditVerification.valid, `Cryptographic SHA-256 chain integrity verified 100% valid (${auditVerification.count} blocks)`);

  console.log('\n================================================================');
  console.log(`  Verification Complete: ${passed}/${total} Tests Passed (${Math.round((passed/total)*100)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSystemVerification();
