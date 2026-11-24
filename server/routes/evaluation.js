const express = require('express');
const router = express.Router();
const store = require('../db/store');

// Get Comparative Statement (CSQ)
router.get('/comparative-statement/:tenderId', (req, res) => {
  const csq = store.getComparativeStatement(req.params.tenderId);
  if (!csq) return res.status(404).json({ success: false, message: 'Tender not found' });
  res.json({ success: true, comparativeStatement: csq });
});

// Award Tender to winning bidder & generate PO
router.post('/award/:tenderId', (req, res) => {
  const userId = req.headers['x-user-id'] || 'admin-1';
  const user = store.getUser(userId);
  const { winningBidId } = req.body;

  if (!winningBidId) {
    return res.status(400).json({ success: false, message: 'Winning bid ID is required.' });
  }

  const updatedTender = store.awardTender(req.params.tenderId, winningBidId, user, req.ip);
  if (!updatedTender) return res.status(404).json({ success: false, message: 'Failed to award tender.' });

  res.json({
    success: true,
    message: `Contract awarded successfully. Work order ${updatedTender.workOrderNumber} issued.`,
    tender: updatedTender
  });
});

module.exports = router;
