const path = require('path');
// Load environment variables from backend or root .env
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app  = express();
const PORT = process.env.PORT || 8000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Security: headers & hide server fingerprint ─────────────────────────────
app.disable('x-powered-by');

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    next();
});

// ── Rate Limiting for AI API endpoint (protect against abuse & API quota drain)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests / min per IP

function apiRateLimiter(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const clientData = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

    if (now > clientData.resetTime) {
        clientData.count = 0;
        clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
    }

    clientData.count++;
    rateLimitMap.set(ip, clientData);

    if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
        return res.status(429).json({ error: 'Too many requests. Please slow down and try again in a minute.' });
    }
    next();
}

// ── Body size limit (allows base64 audio clips for Gemini AI transcription) ─
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: false, limit: '25mb' }));

// Gemini requests stay server-side; GEMINI_API_KEY is read only from the environment.
app.post('/api/gemini', apiRateLimiter, require('./api/gemini'));

// ── Static Frontend Files ───────────────────────────────────────────────────
const frontendDir = path.join(__dirname, '../frontend');
app.use(express.static(frontendDir, {
    index: 'index.html'
}));

// Route helpers for clean URLs
app.get('/', (req, res) => res.sendFile(path.join(frontendDir, 'index.html')));
app.get('/editor', (req, res) => res.sendFile(path.join(frontendDir, 'editor.html')));
app.get('/upload', (req, res) => res.sendFile(path.join(frontendDir, 'upload.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(frontendDir, 'dashboard.html')));
app.get('/about', (req, res) => res.sendFile(path.join(frontendDir, 'about.html')));
app.get('/login', (req, res) => res.sendFile(path.join(frontendDir, 'login.html')));

// ── Start ─────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    console.log(`[Clip Magic] Server running at http://localhost:${PORT}`);
    console.log(`[Clip Magic] Serving frontend from: ${frontendDir}`);
});

// Graceful shutdown on SIGTERM / SIGINT
function shutdown(signal) {
    console.log(`[Clip Magic] Received ${signal}. Shutting down gracefully…`);
    server.close(() => {
        console.log('[Clip Magic] HTTP server closed.');
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
