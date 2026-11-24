const express = require('express');
const router = express.Router();
const store = require('../db/store');

// List payments
router.get('/', (req, res) => {
  res.json({ success: true, payments: store.getPayments() });
});

// Pay EMD / Tender Fee via payment gateway simulation
router.post('/pay', (req, res) => {
  const userId = req.headers['x-user-id'] || 'vendor-1';
  const vendor = store.getUser(userId);
  const { tenderId, amount, type, paymentMethod } = req.body;

  const paymentRecord = {
    id: `PAY-${String(store.getPayments().length + 1).padStart(3, '0')}`,
    tenderId,
    vendorId: vendor?.id || 'vendor-1',
    vendorName: vendor?.name || 'Registered Vendor',
    type: type || 'EMD',
    amount: Number(amount),
    mode: paymentMethod || 'UPI / NetBanking',
    status: 'HELD_IN_ESCROW',
    transactionDate: new Date().toISOString(),
    gatewayRef: `PG-TXN-${Date.now().toString(36).toUpperCase()}`,
    refundStatus: 'PENDING_EVALUATION'
  };

  store.data.payments.push(paymentRecord);
  store.logAudit(vendor, 'PAYMENT_RECEIVED', 'PAYMENT', paymentRecord.id, `Received ${type} payment of ₹${amount} via ${paymentMethod}`, req.ip);
  store.save();

  res.json({ success: true, payment: paymentRecord });
});

// Process EMD Refund for non-winning bidder
router.post('/refund/:id', (req, res) => {
  const userId = req.headers['x-user-id'] || 'approver-1';
  const user = store.getUser(userId);

  const payment = store.getPayments().find(p => p.id === req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

  payment.refundStatus = 'REFUNDED_TO_SOURCE';
  payment.refundedAt = new Date().toISOString();
  payment.status = 'REFUND_SETTLED';

  store.logAudit(user, 'EMD_REFUND_PROCESSED', 'PAYMENT', payment.id, `Refunded ₹${payment.amount} to ${payment.vendorName}`, req.ip);
  store.save();

  res.json({ success: true, payment });
});

// Submit Vendor Invoice for Milestone Payment
router.post('/invoice', (req, res) => {
  const userId = req.headers['x-user-id'] || 'vendor-4';
  const vendor = store.getUser(userId);
  const { tenderId, amount, invoiceNumber, milestoneNotes } = req.body;

  const invoiceRecord = {
    id: `INV-${Date.now().toString().slice(-4)}`,
    tenderId,
    vendorId: vendor?.id || 'vendor-4',
    vendorName: vendor?.name || 'Awarded Contractor',
    type: 'INVOICE_MILESTONE',
    amount: Number(amount),
    invoiceNumber: invoiceNumber || `INV/VEND/${Date.now().toString().slice(-4)}`,
    milestoneNotes: milestoneNotes || 'Milestone Delivery Inspection Passed',
    mode: 'PFMS Direct Credit',
    status: 'UNDER_FINANCE_VERIFICATION',
    transactionDate: new Date().toISOString()
  };

  store.data.payments.push(invoiceRecord);
  store.logAudit(vendor, 'INVOICE_SUBMITTED', 'INVOICE', invoiceRecord.id, `Submitted invoice #${invoiceRecord.invoiceNumber} for ₹${amount}`, req.ip);
  store.save();

  res.json({ success: true, invoice: invoiceRecord });
});

module.exports = router;
