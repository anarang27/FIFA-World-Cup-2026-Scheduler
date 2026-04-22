/* ───────────────────────────────────────────────
   FIFA World Cup 2026 Scheduler — Express Server
   ─────────────────────────────────────────────── */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ────────────────────────────────── */
app.use(cors());
app.use(express.json());

/* ── Serve frontend static files ──────────────── */
app.use(express.static(path.join(__dirname, '..', 'frontend')));

/* ── API Routes ───────────────────────────────── */
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/teams',    require('./routes/teams'));
app.use('/api/matches',  require('./routes/matches'));
app.use('/api/stadiums', require('./routes/stadiums'));
app.use('/api/watchlist',require('./routes/watchlist'));
app.use('/api/reports',  require('./routes/reports'));

/* ── Root redirect ────────────────────────────── */
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

/* ── Global error handler ─────────────────────── */
app.use((err, _req, res, _next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

/* ── Start ────────────────────────────────────── */
app.listen(PORT, () => {
    console.log(`\n  🏆  WC Scheduler server running at http://localhost:${PORT}\n`);
});
