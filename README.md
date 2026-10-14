# ✨ Clip Magic — In-Browser AI Video Editor

[![Tests](https://img.shields.io/badge/tests-19%2F19%20passed-brightgreen.svg)](tests/unit-tests.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](package.json)
[![FFmpeg](https://img.shields.io/badge/Export-FFmpeg%20WASM-orange.svg)](frontend/ffmpeg-engine.js)

**Clip Magic** is a modern, privacy-focused, browser-based video editing studio. It combines hardware-accelerated video decoding, multi-track timeline editing, WebGL GLSL visual filters, keyframe animation, AI-driven speech/karaoke lyric transcription with Google Gemini, and client-side FFmpeg WebAssembly export.

---

## 🚀 Key Features

### 🎞️ Multi-Track Timeline & Hardware Playback
* **Master-Clock Synchronization**: Decoupled hardware video playback with zero seek-thrashing, providing jitter-free 60 FPS preview playback.
* **Multi-Layer Compositor**: Primary base video track, Picture-in-Picture (PiP) overlay tracks, background audio/music lanes, text overlays, and sticker tracks.
* **Precision Trimming & Splitting**: Non-destructive live-frame dragging with floating timestamps, playhead split (`S`), ripple delete (`Shift + Delete`), and In/Out ranges (`I` / `O`).
* **Magnetic Snapping**: Intelligent playhead snapping to clip boundaries, playheads, and trim markers.

### 🎨 WebGL GLSL Filters & Color Grading
* **20 Curated Shader Filters**: Cinematic teal & orange, Cyberpunk, VHS retro, monochrome noir, golden hour, vintage film, and glitch/motion blur VFX.
* **Live WebGL Canvas Preview**: Real-time shader blending synced directly with video playback.
* **Transform Controls**: Interactive scale, rotation, position, and opacity controls.

### 💎 Keyframe Animation Engine
* **Diamond Keyframes**: Add and adjust keyframes (`K`) for scale, rotation, translation, and opacity.
* **Smooth Interpolation**: Linear and ease-in/out interpolation mathematical engines.
* **Presets**: Quick-animate presets including zoom-in, bounce, drift, and spin.

### 🤖 AI Karaoke Lyrics & Auto-Captions (Google Gemini)
* **Audio Transcription**: Direct audio/vocal transcription with word-level timestamps.
* **Multilingual Support**: Tailored support for Hinglish (Roman script), Hindi (Devanagari), and English.
* **Lyric Styling**: Word-by-word karaoke highlights, neon glow, luxury serif, gradient box, and flame styling.

### 🎵 Web Audio Music & Beat Engine
* **BPM Detection**: Automatic tempo analysis and beat grid synchronization.
* **Audio Controls**: Bass boost gain, volume curve automation, and independent clip muting.

### ⚡ Client-Side WebAssembly Export
* **Private In-Browser Rendering**: Powered by `ffmpeg.wasm`—your video never leaves your device during export.
* **Social Presets**: TikTok/Reels/Shorts (9:16), YouTube (16:9), and Square (1:1).
* **Stream Copy Support**: Lossless stream copy (`-c copy`) for instant keyframe-aligned exports.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Play / Pause |
| <kbd>S</kbd> | Split clip at current playhead |
| <kbd>Q</kbd> | Ripple trim start to playhead |
| <kbd>W</kbd> | Ripple trim end to playhead |
| <kbd>I</kbd> | Mark In point |
| <kbd>O</kbd> | Mark Out point |
| <kbd>Delete</kbd> | Delete selected clip / In-Out range |
| <kbd>Shift</kbd> + <kbd>Delete</kbd> | Ripple delete (closes timeline gap) |
| <kbd>J</kbd> / <kbd>K</kbd> / <kbd>L</kbd> | Shuttle controls (Rewind / Pause / Fast-Forward) |
| <kbd>←</kbd> / <kbd>→</kbd> | Step backward / forward 1 frame |
| <kbd>Shift</kbd> + <kbd>←</kbd> / <kbd>→</kbd> | Step backward / forward 10 frames |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> / <kbd>Ctrl</kbd> + <kbd>Y</kbd> | Redo |
| <kbd>K</kbd> | Add / Remove diamond keyframe at playhead |

---

## 🛠️ Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) v18.0.0 or higher
* npm v9.0.0 or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/singhishaan0526-droid/clipmagic.git
   cd clipmagic
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and add your Google Gemini API key if using AI transcription:
   ```env
   PORT=8000
   NODE_ENV=development
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 🧪 Testing

Run the automated test suite verifying asset catalogs, keyframe math, project schema serialization, accessibility, multi-layer compositing, and WebGL filters:

```bash
npm test
```

---

## 📁 Project Structure

```
clip-magic-site/
├── backend/
│   ├── api/
│   │   └── gemini.js         # Gemini AI transcription & subtitle endpoint
│   └── server.js             # Express server (security headers, COOP/COEP, rate limiting)
├── frontend/
│   ├── asset-library.js      # Curated catalog (stickers, music, VFX, sfx)
│   ├── ffmpeg-engine.js      # In-browser FFmpeg WebAssembly export pipeline
│   ├── filters-pack.js       # WebGL GLSL shaders & canvas renderers
│   ├── music-engine.js       # Web Audio API context, BPM analyzer & audio graphs
│   ├── editor.html           # Main video editor workspace
│   ├── index.html            # Landing page
│   ├── upload.html           # Media ingestion & quick-start wizard
│   └── style.css             # Design system tokens and styles
├── api/
│   └── gemini.js             # Vercel serverless function entry
├── tests/
│   └── unit-tests.js         # Automated test suite (19 test cases)
├── .env.example              # Environment variables template
├── package.json              # Project scripts & dependencies
└── task.md                   # Feature tracker & delivery log
```

---

## 🔒 Security & Privacy

* **Local-First Media**: Videos, audio files, and frames are processed directly in browser memory via blob URLs and Web Workers.
* **COOP & COEP Headers**: Configured with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` to allow `SharedArrayBuffer` support for multi-threaded WebAssembly FFmpeg.
* **Protected Secrets**: API keys remain securely on the backend server and are never exposed to client-side code.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
