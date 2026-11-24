const crypto = require('crypto');

function computeHash(data) {
  return crypto.createHash('sha256').update(typeof data === 'string' ? data : JSON.stringify(data)).digest('hex');
}

/**
 * Creates a new block in the tamper-evident audit ledger.
 */
function createAuditBlock(prevHash, entry) {
  const timestamp = new Date().toISOString();
  const blockData = {
    index: entry.index,
    prevHash: prevHash || '0'.repeat(64),
    timestamp,
    actorId: entry.actorId || 'system',
    actorName: entry.actorName || 'System Service',
    actorRole: entry.actorRole || 'SYSTEM',
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    details: entry.details,
    ipAddress: entry.ipAddress || '192.168.1.101'
  };

  const hash = computeHash(blockData);
  return {
    ...blockData,
    hash
  };
}

/**
 * Validates the entire cryptographic chain.
 * Returns { valid: boolean, invalidIndex?: number, reason?: string }
 */
function verifyAuditChain(chain) {
  if (!chain || chain.length === 0) return { valid: true, count: 0 };

  for (let i = 0; i < chain.length; i++) {
    const block = chain[i];
    
    // Check previous hash linkage
    if (i === 0) {
      if (block.prevHash !== '0'.repeat(64)) {
        return { valid: false, invalidIndex: 0, reason: 'Genesis block prevHash must be zeroes.' };
      }
    } else {
      const prevBlock = chain[i - 1];
      if (block.prevHash !== prevBlock.hash) {
        return { 
          valid: false, 
          invalidIndex: i, 
          reason: `Block ${i} prevHash mismatch with Block ${i-1} hash.` 
        };
      }
    }

    // Verify hash integrity of the block data itself
    const blockData = {
      index: block.index,
      prevHash: block.prevHash,
      timestamp: block.timestamp,
      actorId: block.actorId,
      actorName: block.actorName,
      actorRole: block.actorRole,
      action: block.action,
      entityType: block.entityType,
      entityId: block.entityId,
      details: block.details,
      ipAddress: block.ipAddress
    };

    const recomputedHash = computeHash(blockData);
    if (recomputedHash !== block.hash) {
      return { 
        valid: false, 
        invalidIndex: i, 
        reason: `Block ${i} hash corrupted! Calculated: ${recomputedHash.substring(0, 10)}..., Found: ${block.hash.substring(0, 10)}...` 
      };
    }
  }

  return { valid: true, count: chain.length };
}

/**
 * Generates envelope encryption digest simulation
 */
function sealBidEnvelope(content) {
  const envelopeHash = computeHash(content);
  const lockKey = crypto.randomBytes(16).toString('hex');
  return {
    sealedDigest: envelopeHash,
    encryptionLock: lockKey,
    sealedAt: new Date().toISOString()
  };
}

module.exports = {
  computeHash,
  createAuditBlock,
  verifyAuditChain,
  sealBidEnvelope
};
