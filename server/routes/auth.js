const express = require('express');
const router = express.Router();
const store = require('../db/store');

// Get all test users for role switching
router.get('/users', (req, res) => {
  res.json({ success: true, users: store.getUsers() });
});

// Login with Username / Email and Password
router.post('/login', (req, res) => {
  const { username, email, password, userId } = req.body;
  const loginIdentifier = (username || email || userId || '').trim().toLowerCase();

  const users = store.getUsers();
  const user = users.find(u => {
    const id = (u.id || '').toLowerCase();
    const uname = (u.username || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const role = (u.role || '').toLowerCase();
    const gstin = (u.gstin || '').toLowerCase();
    const pan = (u.pan || '').toLowerCase();
    
    return (
      id === loginIdentifier ||
      uname === loginIdentifier ||
      email === loginIdentifier ||
      email.startsWith(loginIdentifier + '@') ||
      role === loginIdentifier ||
      (loginIdentifier === 'admin' && role === 'admin') ||
      (loginIdentifier === 'vendor' && role === 'vendor') ||
      (loginIdentifier === 'auditor' && role === 'auditor') ||
      (loginIdentifier === 'hod' && role === 'department') ||
      (loginIdentifier === 'approver' && role === 'approver') ||
      gstin === loginIdentifier ||
      pan === loginIdentifier
    );
  });

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid username, email, or user not found.' });
  }

  // Password verification: accept user.password or default password123 / admin123
  if (password) {
    const validPasswords = [
      user.password,
      'password123',
      'admin123',
      'vendor123',
      'hod123',
      'comm123',
      'approver123',
      'auditor123'
    ];
    if (user.password && !validPasswords.includes(password)) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Try password: password123' });
    }
  }

  const simulatedOtp = '742910';
  store.logAudit(user, 'USER_LOGIN', 'AUTH', user.id, `User authenticated as ${user.roleTitle || user.role}`, req.ip);

  res.json({
    success: true,
    user,
    requiresTwoFactor: !!user.twoFactorEnabled,
    simulatedOtp
  });
});

// Register / Sign Up for first-time users
router.post('/register', (req, res) => {
  const { name, username, email, password, role, department, gstin, pan, msmeRegistered, msmeUdyam, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email/username, and password are required.' });
  }

  const users = store.getUsers();
  const existing = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase() || 
    (username && u.username && u.username.toLowerCase() === username.toLowerCase()) ||
    (pan && u.pan && u.pan.toUpperCase() === pan.toUpperCase())
  );

  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email, username, or PAN already exists.' });
  }

  const userRole = role || (gstin ? 'vendor' : 'department');
  const newId = `${userRole}-${Date.now().toString().slice(-4)}`;

  const newUser = {
    id: newId,
    name,
    username: username || email.split('@')[0],
    email,
    password: password || 'password123',
    role: userRole,
    roleTitle: userRole === 'vendor' ? (msmeRegistered ? 'MSME Registered Bidder' : 'Registered Bidder') : `${department || 'University'} Staff`,
    department: department || (userRole === 'vendor' ? 'Commercial Bidder' : 'Central Department'),
    phone: phone || '+91 98980 12345',
    category: userRole === 'vendor' ? 'General Procurement' : undefined,
    gstin: gstin ? gstin.toUpperCase() : undefined,
    pan: pan ? pan.toUpperCase() : undefined,
    msmeRegistered: !!msmeRegistered,
    msmeUdyam: msmeRegistered ? (msmeUdyam || 'UDYAM-MH-01-XXXXXXX') : undefined,
    twoFactorEnabled: true,
    registeredAt: new Date().toISOString()
  };

  store.data.users.push(newUser);
  store.logAudit(newUser, 'USER_REGISTERED', 'AUTH', newUser.id, `New ${userRole} account created for ${name}`, req.ip);
  store.save();

  res.json({
    success: true,
    user: newUser,
    message: 'Account created successfully! Proceeding to Two-Factor Authentication.'
  });
});

// Verify 2FA
router.post('/verify-2fa', (req, res) => {
  const { userId, otp } = req.body;
  const user = store.getUser(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (otp === '742910' || otp === '123456') {
    store.logAudit(user, '2FA_VERIFIED', 'AUTH', user.id, `Completed two-factor authentication verification`, req.ip);
    return res.json({ success: true, user, message: '2FA authentication successful' });
  }

  res.status(400).json({ success: false, message: 'Invalid OTP code. Use test OTP: 742910' });
});

// Check Conflict of Interest status
router.get('/coi/:tenderId', (req, res) => {
  const userId = req.headers['x-user-id'];
  const tenderId = req.params.tenderId;
  const decls = store.getConflictDeclarations(tenderId);
  const userDecl = decls.find(d => d.userId === userId);

  res.json({
    success: true,
    hasDeclared: !!userDecl,
    declaration: userDecl || null,
    allDeclarations: decls
  });
});

// Affirm Conflict of Interest
router.post('/coi/:tenderId', (req, res) => {
  const userId = req.headers['x-user-id'];
  const user = store.getUser(userId);
  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const decl = store.affirmConflictDeclaration(req.params.tenderId, user, req.ip);
  res.json({ success: true, declaration: decl });
});

module.exports = router;
