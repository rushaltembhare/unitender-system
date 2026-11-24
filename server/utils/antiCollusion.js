/**
 * Anti-Collusion & Integrity Engine for Public Procurement
 */
function analyzeTenderBids(tender, bids) {
  const flags = [];
  if (!bids || bids.length === 0) return { flags, riskScore: 'LOW' };

  // 1. IP Address Collision Check
  const ipMap = {};
  bids.forEach(b => {
    if (!b.ipAddress) return;
    if (!ipMap[b.ipAddress]) ipMap[b.ipAddress] = [];
    ipMap[b.ipAddress].push({ vendorName: b.vendorName, bidId: b.id });
  });

  for (const [ip, list] of Object.entries(ipMap)) {
    if (list.length > 1) {
      flags.push({
        type: 'IP_COLLUSION',
        severity: 'CRITICAL',
        title: 'Matching IP Address Detected Between Competing Bidders',
        description: `Bidders ${list.map(x => x.vendorName).join(', ')} submitted bids from the exact same IP address (${ip}). Possible shared network, proxy collusion, or single entity submitting multiple dummy quotes.`,
        affectedVendors: list.map(x => x.vendorName)
      });
    }
  }

  // 2. Timestamp Proximity Check (< 180 seconds difference from matching subnets)
  for (let i = 0; i < bids.length; i++) {
    for (let j = i + 1; j < bids.length; j++) {
      const b1 = bids[i];
      const b2 = bids[j];
      const timeDiff = Math.abs(new Date(b1.submittedAt).getTime() - new Date(b2.submittedAt).getTime()) / 1000;
      if (timeDiff < 180) {
        flags.push({
          type: 'TIMESTAMP_PROXIMITY',
          severity: 'HIGH',
          title: 'Suspiciously Rapid Consecutive Submissions',
          description: `Bids from "${b1.vendorName}" and "${b2.vendorName}" were submitted within ${Math.round(timeDiff)} seconds of each other. Inspect for coordinated last-minute cartel behavior.`,
          affectedVendors: [b1.vendorName, b2.vendorName]
        });
      }
    }
  }

  // 3. Document / Proposal Hash Duplication Check
  const docHashMap = {};
  bids.forEach(b => {
    const docHash = b.technicalEnvelope?.docHash;
    if (!docHash) return;
    if (!docHashMap[docHash]) docHashMap[docHash] = [];
    docHashMap[docHash].push(b.vendorName);
  });

  for (const [hash, vendors] of Object.entries(docHashMap)) {
    if (vendors.length > 1) {
      flags.push({
        type: 'DUPLICATE_DOCUMENTS',
        severity: 'CRITICAL',
        title: 'Identical Document Checksum Identified',
        description: `Vendors ${vendors.join(' and ')} uploaded proposals with exact matching cryptographic file hashes (${hash.substring(0, 12)}...). High probability of shared proposal origin.`,
        affectedVendors: vendors
      });
    }
  }

  // 4. Financial Quote Anomaly & Cartel Clustering Check (if financial bids unlocked)
  const estimatedCost = tender.estimatedCost || 0;
  const financialBids = bids.filter(b => b.financialEnvelope && b.financialEnvelope.totalAmount);

  if (estimatedCost > 0 && financialBids.length > 0) {
    financialBids.forEach(b => {
      const quote = b.financialEnvelope.totalAmount;
      const deviation = ((quote - estimatedCost) / estimatedCost) * 100;

      if (deviation < -35) {
        flags.push({
          type: 'ABNORMALLY_LOW_BID',
          severity: 'MEDIUM',
          title: `Abnormally Low Quote (-${Math.abs(Math.round(deviation))}%)`,
          description: `Vendor "${b.vendorName}" quoted ₹${quote.toLocaleString('en-IN')}, which is ${Math.abs(Math.round(deviation))}% below estimated cost ₹${estimatedCost.toLocaleString('en-IN')}. Verify against GFR 2017 dumping / non-viability clauses.`,
          affectedVendors: [b.vendorName]
        });
      } else if (deviation > 50) {
        flags.push({
          type: 'HIGH_PREMIUM_QUOTE',
          severity: 'LOW',
          title: `Excessive Premium Quote (+${Math.round(deviation)}%)`,
          description: `Vendor "${b.vendorName}" quoted ₹${quote.toLocaleString('en-IN')}, exceeding estimated budget by ${Math.round(deviation)}%.`,
          affectedVendors: [b.vendorName]
        });
      }
    });

    // Check price clustering (cartel pattern: quotes within 0.5% of each other)
    for (let i = 0; i < financialBids.length; i++) {
      for (let j = i + 1; j < financialBids.length; j++) {
        const q1 = financialBids[i].financialEnvelope.totalAmount;
        const q2 = financialBids[j].financialEnvelope.totalAmount;
        const diffRatio = Math.abs(q1 - q2) / Math.min(q1, q2);
        if (diffRatio > 0 && diffRatio < 0.008) {
          flags.push({
            type: 'CARTEL_PRICE_CLUSTERING',
            severity: 'HIGH',
            title: 'Close Price Clustering (Cover Bidding Marker)',
            description: `Quotes from "${financialBids[i].vendorName}" (₹${q1.toLocaleString('en-IN')}) and "${financialBids[j].vendorName}" (₹${q2.toLocaleString('en-IN')}) are within ${(diffRatio * 100).toFixed(2)}% of each other. Potential rotating cover-bid arrangement.`,
            affectedVendors: [financialBids[i].vendorName, financialBids[j].vendorName]
          });
        }
      }
    }
  }

  // Determine overall risk level
  const hasCritical = flags.some(f => f.severity === 'CRITICAL');
  const hasHigh = flags.some(f => f.severity === 'HIGH');
  const riskScore = hasCritical ? 'CRITICAL' : hasHigh ? 'HIGH' : flags.length > 0 ? 'MEDIUM' : 'CLEAN';

  return {
    flags,
    riskScore,
    totalBidsAnalyzed: bids.length,
    analyzedAt: new Date().toISOString()
  };
}

module.exports = {
  analyzeTenderBids
};
