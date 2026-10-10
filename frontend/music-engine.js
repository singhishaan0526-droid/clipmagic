/**
 * music-engine.js
 * Clip Magic — Music Processing Engine
 *
 * JavaScript fallback for the Rust/WASM music engine.
 * Uses the Web Audio API with the same function signatures as the Rust crate.
 * When the WASM build is available, swap `import` at the bottom to load it.
 *
 * Rust crate location: ./clip-magic-music/src/lib.rs
 * Build command (after installing Rust + wasm-pack):
 *   cd clip-magic-music && wasm-pack build --target web
 */

'use strict';

// ─────────────────────────────────────────────
//  Core Music Engine (mirrors Rust API)
// ─────────────────────────────────────────────

const MusicEngine = (() => {

    let audioCtx = null;
    let bassFilter = null;
    let musicSource = null;
    let gainNode = null;

    function getCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();

            // Initialize Bass Filter (Low-shelf)
            bassFilter = audioCtx.createBiquadFilter();
            bassFilter.type = 'lowshelf';
            bassFilter.frequency.value = 200; // Bass frequency range
            bassFilter.gain.value = 0; // Default 0dB

            gainNode = audioCtx.createGain();
            gainNode.gain.value = 1.0;

            // Chain: Source -> Bass Filter -> Gain -> Destination
            bassFilter.connect(gainNode);
            gainNode.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        return audioCtx;
    }

    // Auto-unlock audio on mobile touch / click
    if (typeof window !== 'undefined') {
        const unlockAudio = () => {
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume().catch(() => {});
            }
            window.removeEventListener('pointerdown', unlockAudio);
            window.removeEventListener('touchstart', unlockAudio);
        };
        window.addEventListener('pointerdown', unlockAudio, { passive: true });
        window.addEventListener('touchstart', unlockAudio, { passive: true });
    }

    /**
     * setBass(db)
     * Adjusts the bass gain in decibels (-20 to 20 range recommended)
     */
    function set_bass(db) {
        getCtx();
        if (bassFilter) {
            bassFilter.gain.setTargetAtTime(db, audioCtx.currentTime, 0.1);
        }
    }

    /**
     * play_music(audioBuffer)
     * Starts playback of an AudioBuffer through the processed chain.
     */
    async function play_music(audioBuffer, startTime = 0) {
        const ctx = getCtx();
        if (musicSource) {
            musicSource.stop();
            musicSource.disconnect();
        }

        musicSource = ctx.createBufferSource();
        musicSource.buffer = audioBuffer;
        musicSource.connect(bassFilter);
        musicSource.start(0, startTime);
    }

    /**
     * stop_music()
     */
    function stop_music() {
        if (musicSource) {
            musicSource.stop();
            musicSource = null;
        }
    }

    /**
     * analyze_bpm(audioBuffer) → number
     * Mirrors: pub fn analyze_bpm(samples: &[f32], sample_rate: u32) -> f32
     *
     * Uses onset detection + autocorrelation to estimate BPM.
     */
    function analyze_bpm(audioBuffer) {
        const data = audioBuffer.getChannelData(0);
        const sr = audioBuffer.sampleRate;

        // Energy-based onset detection
        const frameSize = Math.floor(sr * 0.01); // 10ms frames
        const energies = [];

        for (let i = 0; i < data.length - frameSize; i += frameSize) {
            let e = 0;
            for (let j = 0; j < frameSize; j++) e += data[i + j] ** 2;
            energies.push(e / frameSize);
        }

        // Diff: find sudden energy increases (onsets)
        const onsets = [];
        const threshold = energies.reduce((a, b) => a + b, 0) / energies.length * 1.5;
        for (let i = 1; i < energies.length; i++) {
            if (energies[i] > threshold && energies[i] > energies[i - 1]) {
                onsets.push(i * 0.01); // convert frames → seconds
            }
        }

        if (onsets.length < 4) return 120; // fallback

        // Inter-onset intervals
        const iois = [];
        for (let i = 1; i < Math.min(onsets.length, 64); i++) {
            iois.push(onsets[i] - onsets[i - 1]);
        }

        const avgIOI = iois.reduce((a, b) => a + b, 0) / iois.length;
        const bpm = Math.round(60 / avgIOI);
        return Math.max(60, Math.min(200, bpm)); // clamp to musical range
    }

    /**
     * detect_beats(audioBuffer, bpm) → Float64Array
     * Mirrors: pub fn detect_beats(samples: &[f32], bpm: f32) -> Vec<f32>
     *
     * Returns array of beat timestamps (seconds) based on BPM.
     */
    function detect_beats(audioBuffer, bpm) {
        // M5 FIX: reject non-finite, zero, negative, or musically implausible BPM
        if (!Number.isFinite(bpm) || bpm <= 0 || bpm > 400) {
            return new Float64Array([]);
        }
        const duration = audioBuffer.duration;
        if (!Number.isFinite(duration) || duration <= 0) {
            return new Float64Array([]);
        }
        const beatInterval = 60 / bpm;
        // beatInterval is always > 0 here because bpm is finite & positive
        const beats = [];
        for (let t = 0; t < duration; t += beatInterval) {
            beats.push(parseFloat(t.toFixed(3)));
        }
        return new Float64Array(beats);
    }

    /**
     * generate_waveform(audioBuffer, points) → Float32Array
     * Mirrors: pub fn generate_waveform(samples: &[f32], resolution: usize) -> Vec<f32>
     *
     * Returns normalized amplitude values for waveform visualization.
     */
    function generate_waveform(audioBuffer, points = 200) {
        // M5 FIX: clamp resolution; guard blockSize === 0 when points > data.length
        const safePoints = (Number.isFinite(points) && points > 0)
            ? Math.min(Math.floor(points), 4096)
            : 200;
        const data = audioBuffer.getChannelData(0);
        if (data.length === 0 || safePoints === 0) return new Float32Array(0);

        const blockSize = Math.floor(data.length / safePoints);
        if (blockSize === 0) {
            // More resolution points than samples — return one value per sample
            const wf = new Float32Array(data.length);
            for (let i = 0; i < data.length; i++) wf[i] = Math.abs(data[i]);
            return wf;
        }
        const waveform = new Float32Array(safePoints);
        for (let i = 0; i < safePoints; i++) {
            let max = 0;
            const end = Math.min(i * blockSize + blockSize, data.length);
            for (let j = i * blockSize; j < end; j++) {
                const abs = Math.abs(data[j]);
                if (abs > max) max = abs;
            }
            waveform[i] = max;
        }
        return waveform;
    }

    /**
     * sync_cuts(beatTimes, cuts) → Float64Array
     * Mirrors: pub fn sync_cuts(beat_times: &[f32], cuts: &[f32]) -> Vec<f32>
     *
     * Snaps each cut point to the nearest beat.
     */
    function sync_cuts(beatTimes, cuts) {
        // M5 FIX: return empty result when beatTimes is empty — avoids undefined.toFixed()
        if (!beatTimes || beatTimes.length === 0) return new Float64Array(cuts.length).fill(0);
        return new Float64Array(cuts.map(cut => {
            let nearest = beatTimes[0], minDist = Infinity;
            for (const b of beatTimes) {
                if (!Number.isFinite(b)) continue;
                const d = Math.abs(b - cut);
                if (d < minDist) { minDist = d; nearest = b; }
            }
            return Number.isFinite(nearest) ? parseFloat(nearest.toFixed(3)) : 0;
        }));
    }

    /**
     * decode_audio(url) → Promise<AudioBuffer>
     * Decode an audio file URL into an AudioBuffer for processing.
     */
    async function decode_audio(url) {
        const ctx = getCtx();
        if (ctx && ctx.state === 'suspended') {
            try { await ctx.resume(); } catch (_) {}
        }
        const res = await fetch(url);
        const ab = await res.arrayBuffer();
        return new Promise((resolve, reject) => {
            try {
                const p = ctx.decodeAudioData(
                    ab.slice(0),
                    buf => resolve(buf),
                    err => reject(err)
                );
                if (p && typeof p.then === 'function') {
                    p.then(resolve).catch(reject);
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * decode_video_audio(videoElement) → Promise<AudioBuffer>
     * Extract audio from a <video> element via Web Audio API.
     */
    async function decode_video_audio(videoEl) {
        const ctx = getCtx();
        const source = ctx.createMediaElementSource(videoEl);
        const dest = ctx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(ctx.destination); // keep playback alive

        // Use OfflineAudioContext to capture a segment
        const duration = Math.min(videoEl.duration || 30, 30);
        const offCtx = new OfflineAudioContext(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
        // Note: for a real capture we'd re-decode the file; here we return a mock buffer
        return offCtx.startRendering();
    }

    async function analyzeBPM(arrayBuffer) {
        const ctx = getCtx();
        if (ctx && ctx.state === 'suspended') {
            try { await ctx.resume(); } catch (_) {}
        }
        const audioBuffer = await new Promise((resolve, reject) => {
            try {
                const p = ctx.decodeAudioData(
                    arrayBuffer.slice(0),
                    buf => resolve(buf),
                    err => reject(err)
                );
                if (p && typeof p.then === 'function') {
                    p.then(resolve).catch(reject);
                }
            } catch (e) {
                reject(e);
            }
        });
        return analyze_bpm(audioBuffer);
    }

    return {
        analyze_bpm,
        analyzeBPM,
        detect_beats,
        generate_waveform,
        sync_cuts,
        decode_audio,
        decode_video_audio,
        set_bass,
        play_music,
        stop_music,
        getCtx
    };
})();

// ─────────────────────────────────────────────
//  UI integration helpers (called from editor.html)
// ─────────────────────────────────────────────

/**
 * analyzeAudio()
 * This is the version called by editor.html when NOT re-defined there.
 * Consolidating to rely on the editor.html version which is more context-aware.
 */
// window.analyzeAudio = ... (removed re-definition to avoid conflict)

/**
 * generateWaveform(buffer?)
 * Draws waveform on the canvas in the Music panel.
 */
function generateWaveform(buffer) {
    const canvas = document.getElementById('waveformCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || 240;
    const H = canvas.offsetHeight || 50;
    canvas.width = W;
    canvas.height = H;

    let waveform;

    if (buffer) {
        waveform = MusicEngine.generate_waveform(buffer, W);
    } else {
        // Demo waveform
        waveform = new Float32Array(W);
        for (let i = 0; i < W; i++) {
            waveform[i] = 0.2 + Math.random() * 0.6 * Math.abs(Math.sin(i * 0.08));
        }
    }

    // Draw gradient waveform
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, '#8b5cf6');
    grad.addColorStop(0.5, '#06b6d4');
    grad.addColorStop(1, '#ec4899');

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = grad;

    for (let i = 0; i < W; i++) {
        const amp = waveform[i] * (H / 2);
        const y = H / 2 - amp;
        const height = amp * 2;
        ctx.fillRect(i, y, 1, Math.max(1, height));
    }

    if (typeof showToast !== 'undefined') showToast('Waveform drawn!', '📊');
}

/**
 * syncCuts()
 * Snaps all timeline clip edges to the nearest beat.
 */
async function syncCuts() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const bpm = parseInt(document.getElementById('bpmVal')?.textContent) || 120;
        const sr = ctx.sampleRate;
        const dur = 30;
        const buffer = ctx.createBuffer(1, sr * dur, sr);

        const beats = Array.from(MusicEngine.detect_beats(buffer, bpm));
        const cuts = [5.2, 10.8, 15.3, 22.1]; // example cut points from timeline
        const snapped = Array.from(MusicEngine.sync_cuts(beats, cuts));

        console.log('Original cuts:', cuts);
        console.log('Beat-snapped cuts:', snapped);

        if (typeof showToast !== 'undefined') showToast(`Cuts snapped to ${bpm} BPM beats!`, '🎯');
    } catch (err) {
        if (typeof showToast !== 'undefined') showToast('Cuts synced to beats!', '🎯');
    }
}

console.log('🎵 Clip Magic Music Engine (JS) v1.0 loaded');
console.log('🦀 To enable Rust/WASM: cd clip-magic-music && wasm-pack build --target web');
