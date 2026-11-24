const express = require('express');
const router = express.Router();
const store = require('../db/store');

// List inventory / asset register items
router.get('/', (req, res) => {
  res.json({ success: true, count: store.getInventory().length, inventory: store.getInventory() });
});

// Auto-sync completed delivery into university asset register
router.post('/sync/:tenderId', (req, res) => {
  const userId = req.headers['x-user-id'] || 'admin-1';
  const user = store.getUser(userId);

  const result = store.receiveDeliveryAndSyncInventory(req.params.tenderId, user, req.ip);
  if (!result) return res.status(404).json({ success: false, message: 'Tender not found or not in awarded state.' });

  res.json({
    success: true,
    message: 'Delivery inspected and equipment accessioned into University Asset Register.',
    asset: result.asset,
    tender: result.tender
  });
});

module.exports = router;
