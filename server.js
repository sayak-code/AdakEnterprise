require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/shopinfo', require('./routes/shopinfo'));
app.use('/api/notify', require('./routes/notifications'));
app.use('/api/content', require('./routes/content'));

// ─── SPA Fallback for Public Pages ────────────────────────────────────────────
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'login.html')));
app.get('/admin/*', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'login.html')));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   Adak Enterprise – Tathya Mitra Kendra Server Running    ║
║                                                            ║
║   Public Website : http://localhost:${PORT}               ║
║   Admin Panel    : http://localhost:${PORT}/admin         ║
║   API Health     : http://localhost:${PORT}/api/health    ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
