const express = require('express');
const router = express.Router();
const store = require('../db/store');

// Get audit trail
router.get('/', (req, res) => {
  const trail = store.getAuditTrail();
  res.json({ success: true, count: trail.length, auditTrail: trail });
});

// Verify cryptographic hash chain
router.get('/verify', (req, res) => {
  const verification = store.verifyLedger();
  res.json({
    success: true,
    verification: {
      ...verification,
      status: verification.valid ? 'IMMUTABLE_VERIFIED' : 'TAMPER_DETECTED',
      checkedAt: new Date().toISOString()
    }
  });
});

module.exports = router;
