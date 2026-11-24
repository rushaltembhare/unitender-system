const express = require('express');
const cors = require('cors');
const path = require('path');
const store = require('./db/store');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger for audit IP capture
app.use((req, res, next) => {
  req.ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  next();
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/requisitions', require('./routes/requisitions'));
app.use('/api/tenders', require('./routes/tenders'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/evaluation', require('./routes/evaluation'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/vendors', require('./routes/vendors'));

// Health check & DB Reset for testing
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'UniTender Secure Procurement API',
    version: '2.4.0',
    auditBlocks: store.getAuditTrail().length,
    tendersCount: store.getTenders().length,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/reset-demo', (req, res) => {
  store.reset();
  res.json({ success: true, message: 'Database reset to default seed state' });
});

// Serve frontend static build if present
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('UniTender Server Online. Client build not found. Run "npm run build" in client directory or use Vite dev server on port 5173.');
  }
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` UniTender Server running at http://localhost:${PORT}`);
  console.log(` GFR 2017 & CVC Compliant Procurement Engine Active`);
  console.log(` Cryptographic SHA-256 Audit Ledger Initialized`);
  console.log(`=======================================================`);
});
