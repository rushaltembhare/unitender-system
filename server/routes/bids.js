const express = require('express');
const router = express.Router();
const store = require('../db/store');

// List bids for a tender with blind evaluation privacy rules
router.get('/', (req, res) => {
  const { tenderId } = req.query;
  const userId = req.headers['x-user-id'];
  const user = store.getUser(userId);
  const tender = store.getTender(tenderId);

  let bids = store.getBids(tenderId);

  // If role is committee, enforce BLIND SCORING privacy:
  // Committee members cannot see peer members' scores until tender reaches FINANCIAL_OPENING_READY or AWARDED!
  if (user && user.role === 'committee' && tender && tender.status === 'TECHNICAL_EVALUATION') {
    bids = bids.map(bid => {
      const copy = JSON.parse(JSON.stringify(bid));
      if (copy.technicalEnvelope && copy.technicalEnvelope.evaluations) {
        // Only keep current user's evaluation, hide peers
        copy.technicalEnvelope.evaluations = copy.technicalEnvelope.evaluations.filter(e => e.committeeId === user.id);
        copy.technicalEnvelope.isPeerScoresHidden = true;
      }
      // Financial envelope is strictly locked and obscured
      if (copy.financialEnvelope && !copy.financialEnvelope.isUnlocked) {
        copy.financialEnvelope.totalAmount = 'LOCKED_UNTIL_TECH_QUALIFIED';
        copy.financialEnvelope.itemizedQuotes = [];
      }
      return copy;
    });
  }

  // If vendor role, only see own bid!
  if (user && user.role === 'vendor') {
    bids = bids.filter(b => b.vendorId === user.id);
  }

  res.json({ success: true, count: bids.length, bids });
});

// Submit 2-envelope bid (Vendor)
router.post('/', (req, res) => {
  const userId = req.headers['x-user-id'] || 'vendor-1';
  const vendor = store.getUser(userId);
  if (!vendor || vendor.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Only registered vendors can submit bids.' });
  }

  try {
    const bid = store.submitBid(req.body, vendor, req.ip);
    res.json({ success: true, bid, message: 'Bid envelopes sealed and encrypted successfully.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Blind Technical Scoring by Committee Member
router.post('/:id/score', (req, res) => {
  const userId = req.headers['x-user-id'] || 'comm-1';
  const committeeUser = store.getUser(userId);
  if (!committeeUser || (committeeUser.role !== 'committee' && committeeUser.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Unauthorized: Only evaluation committee members can score bids.' });
  }

  const { score, remarks } = req.body;
  if (score === undefined || score < 0 || score > 100) {
    return res.status(400).json({ success: false, message: 'Score must be a number between 0 and 100.' });
  }

  const updatedBid = store.scoreTechnicalBid(req.params.id, committeeUser, score, remarks, req.ip);
  if (!updatedBid) return res.status(404).json({ success: false, message: 'Bid not found' });

  res.json({ success: true, bid: updatedBid });
});

// Dual-Key Quorum Financial Unlock in Live Bid Opening Room
router.post('/unlock-financial/:tenderId', (req, res) => {
  const userId = req.headers['x-user-id'] || 'comm-1';
  const user = store.getUser(userId);

  const result = store.unlockFinancialEnvelopes(req.params.tenderId, user, req.ip);
  if (!result) return res.status(404).json({ success: false, message: 'Tender not found' });

  res.json({
    success: true,
    message: 'Dual-key quorum completed. Financial envelopes decrypted for technically qualified bidders.',
    ...result
  });
});

// Anti-Collusion Report
router.get('/collusion-report/:tenderId', (req, res) => {
  const report = store.getAntiCollusionReport(req.params.tenderId);
  if (!report) return res.status(404).json({ success: false, message: 'Tender not found' });
  res.json({ success: true, report });
});

module.exports = router;
