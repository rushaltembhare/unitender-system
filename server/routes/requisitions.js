const express = require('express');
const router = express.Router();
const store = require('../db/store');

// List requisitions
router.get('/', (req, res) => {
  res.json({ success: true, requisitions: store.getRequisitions() });
});

// Check Budget availability for department
router.get('/check-budget', (req, res) => {
  const { departmentId, budgetCode, amount } = req.query;
  const result = store.checkBudget(departmentId, budgetCode, Number(amount));
  res.json({ success: true, ...result });
});

// Create new requisition (Dept HOD)
router.post('/', (req, res) => {
  const userId = req.headers['x-user-id'] || 'dept-1';
  const user = store.getUser(userId);
  if (!user) return res.status(401).json({ success: false, message: 'User not found' });

  // Validate budget first
  const budgetCheck = store.checkBudget(req.body.departmentId, req.body.budgetCode, Number(req.body.estimatedAmount));
  if (!budgetCheck.valid) {
    return res.status(400).json({ success: false, message: budgetCheck.reason });
  }

  const reqItem = store.createRequisition(req.body, user, req.ip);
  res.json({ success: true, requisition: reqItem });
});

// Approve requisition (Finance Officer or Registrar)
router.post('/:id/approve', (req, res) => {
  const userId = req.headers['x-user-id'] || 'approver-1';
  const user = store.getUser(userId);
  const { remarks } = req.body;

  const current = store.getRequisition(req.params.id);
  if (!current) return res.status(404).json({ success: false, message: 'Requisition not found' });

  let nextStatus = 'APPROVED';
  if (current.status === 'PENDING_FINANCE' && user.roleTitle.includes('Finance')) {
    nextStatus = 'PENDING_REGISTRAR';
  }

  const updated = store.updateRequisitionStatus(req.params.id, nextStatus, user, remarks, req.ip);
  res.json({ success: true, requisition: updated });
});

// Reject requisition
router.post('/:id/reject', (req, res) => {
  const userId = req.headers['x-user-id'] || 'approver-1';
  const user = store.getUser(userId);
  const { remarks } = req.body;

  const updated = store.updateRequisitionStatus(req.params.id, 'REJECTED', user, remarks, req.ip);
  res.json({ success: true, requisition: updated });
});

module.exports = router;
