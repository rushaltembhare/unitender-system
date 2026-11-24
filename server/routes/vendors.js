const express = require('express');
const router = express.Router();
const store = require('../db/store');

// List vendors
router.get('/', (req, res) => {
  const vendors = store.getUsers().filter(u => u.role === 'vendor');
  res.json({ success: true, count: vendors.length, vendors });
});

// Self-registration with KYC (New Vendor)
router.post('/register', (req, res) => {
  const { name, contactPerson, email, phone, category, gstin, pan, msmeRegistered, msmeUdyam, bankDetails } = req.body;

  if (!name || !email || !gstin || !pan) {
    return res.status(400).json({ success: false, message: 'Vendor name, email, GSTIN, and PAN are mandatory.' });
  }

  // Check duplicate PAN
  const existing = store.getUsers().find(u => u.pan === pan || u.email === email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'A vendor with this PAN or Email is already registered.' });
  }

  const newVendor = {
    id: `vendor-${Date.now().toString().slice(-4)}`,
    name,
    contactPerson: contactPerson || name,
    email,
    phone: phone || '+91 99999 88888',
    role: 'vendor',
    roleTitle: msmeRegistered ? 'MSME Registered Vendor' : 'Registered Vendor',
    category: category || 'General Supplies',
    msmeRegistered: !!msmeRegistered,
    msmeUdyam: msmeRegistered ? msmeUdyam || 'UDYAM-MH-01-XXXX' : null,
    gstin,
    pan,
    bankDetails: bankDetails || { accountType: 'Current', ifsc: 'SBIN0001234' },
    verifiedKYC: true,
    rating: 5.0,
    twoFactorEnabled: true,
    registeredAt: new Date().toISOString()
  };

  store.data.users.push(newVendor);
  store.logAudit(newVendor, 'VENDOR_REGISTERED', 'VENDOR', newVendor.id, `Vendor ${name} registered with GSTIN ${gstin}`, req.ip);
  store.save();

  res.json({ success: true, vendor: newVendor, message: 'KYC verified and account provisioned.' });
});

// Rate vendor performance
router.post('/:id/rate', (req, res) => {
  const userId = req.headers['x-user-id'] || 'admin-1';
  const user = store.getUser(userId);
  const vendor = store.getUser(req.params.id);

  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

  const { rating, feedback } = req.body;
  vendor.rating = Number(rating);
  vendor.lastFeedback = feedback;

  store.logAudit(user, 'VENDOR_RATED', 'VENDOR', vendor.id, `Awarded performance rating of ${rating}/5 stars. Feedback: ${feedback}`, req.ip);
  store.save();

  res.json({ success: true, vendor });
});

// Blacklist / Debar vendor under GFR Rule 151
router.post('/:id/blacklist', (req, res) => {
  const userId = req.headers['x-user-id'] || 'admin-1';
  const user = store.getUser(userId);
  const vendor = store.getUser(req.params.id);

  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

  const { reason, periodMonths } = req.body;
  vendor.isBlacklisted = true;
  vendor.blacklistReason = reason || 'Non-performance or submission of fraudulent certificates under GFR Rule 151';
  vendor.blacklistedUntil = new Date(Date.now() + (periodMonths || 24) * 30 * 86400000).toISOString();

  store.logAudit(user, 'VENDOR_BLACKLISTED', 'VENDOR', vendor.id, `Vendor blacklisted: ${vendor.blacklistReason}`, req.ip);
  store.save();

  res.json({ success: true, vendor });
});

module.exports = router;
