const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 8000;

// ── Security: hide server fingerprint ────────────────────────────────────────
app.disable('x-powered-by');

// ── Body size limit (static-file server has no upload routes, kept defensive) ─
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ── Required headers for FFmpeg.wasm (SharedArrayBuffer) ─────────────────────
// L1 FIX: CORS removed (no API routes); add hardening headers instead.
app.use((req, res, next) => {
    // SharedArrayBuffer requirements
    res.setHeader('Cross-Origin-Opener-Policy',   'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

    // L1: basic hardening headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options',        'DENY');
    res.setHeader('Referrer-Policy',        'strict-origin-when-cross-origin');

    // NOTE: A full Content-Security-Policy requires vendoring/pinning the CDN
    // scripts (M6). Until then we omit it to avoid breaking the app.
    next();
});

// Gemini requests stay server-side; GEMINI_API_KEY is read only from the environment.
app.post('/api/gemini', require('./api/gemini'));

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '.'), {
    // Prevent directory listing
    index: 'index.html'
}));

// Fallback to index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    console.log(`[Clip Magic] Server running at http://localhost:${PORT}`);
});

// L2 FIX: graceful shutdown on SIGTERM / SIGINT
function shutdown(signal) {
    console.log(`[Clip Magic] Received ${signal}. Shutting down gracefully…`);
    server.close(() => {
        console.log('[Clip Magic] HTTP server closed.');
        process.exit(0);
    });
    // Force-exit after 10 s if connections linger
    setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
