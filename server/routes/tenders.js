const express = require('express');
const router = express.Router();
const store = require('../db/store');

// List tenders with optional search / filter
router.get('/', (req, res) => {
  let list = store.getTenders();
  const { category, status, search, department } = req.query;

  if (category && category !== 'ALL') {
    list = list.filter(t => t.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (status && status !== 'ALL') {
    list = list.filter(t => t.status === status);
  }
  if (department && department !== 'ALL') {
    list = list.filter(t => t.departmentId === department);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.referenceNumber.toLowerCase().includes(q) ||
      t.departmentName.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: list.length, tenders: list });
});

// Get single tender details
router.get('/:id', (req, res) => {
  const tender = store.getTender(req.params.id);
  if (!tender) return res.status(404).json({ success: false, message: 'Tender not found' });
  res.json({ success: true, tender });
});

// Create new tender (Procurement Admin)
router.post('/', (req, res) => {
  const userId = req.headers['x-user-id'] || 'admin-1';
  const user = store.getUser(userId);
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const tender = store.createTender(req.body, user, req.ip);
    res.json({ success: true, tender });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Track document download with vendor identification
router.post('/:id/download', (req, res) => {
  const userId = req.headers['x-user-id'] || 'vendor-1';
  const user = store.getUser(userId) || { name: 'Guest Bidder', role: 'VENDOR' };

  store.trackDocumentDownload(req.params.id, user, req.ip);
  res.json({ success: true, message: 'Download tracked in audit ledger' });
});

// Ask pre-bid query (Vendor)
router.post('/:id/queries', (req, res) => {
  const userId = req.headers['x-user-id'] || 'vendor-1';
  const user = store.getUser(userId);
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const queryItem = store.addPreBidQuery(req.params.id, user, req.body.query, req.ip);
  if (!queryItem) return res.status(404).json({ success: false, message: 'Tender not found' });

  res.json({ success: true, query: queryItem });
});

// Answer pre-bid query (Procurement Office)
router.post('/:id/queries/:queryId/answer', (req, res) => {
  const userId = req.headers['x-user-id'] || 'admin-1';
  const user = store.getUser(userId);

  const answered = store.answerPreBidQuery(req.params.id, req.params.queryId, req.body.response, user, req.ip);
  if (!answered) return res.status(404).json({ success: false, message: 'Query or tender not found' });

  res.json({ success: true, query: answered });
});

// Publish Corrigendum / Amendment notice
router.post('/:id/corrigenda', (req, res) => {
  const userId = req.headers['x-user-id'] || 'admin-1';
  const user = store.getUser(userId);

  const corr = store.addCorrigendum(req.params.id, req.body, user, req.ip);
  if (!corr) return res.status(404).json({ success: false, message: 'Tender not found' });

  res.json({ success: true, corrigendum: corr });
});

module.exports = router;
