// ffmpeg-engine.js - Handles in-browser video processing via WebAssembly
'use strict';

let ffmpeg = null;
let ffmpegLoadPromise = null;

// Icon identifiers mapped to safe inline SVG — never put user data inside these.
const ICONS = {
    settings: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    rocket:   '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
    xcircle:  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
};

// M1 FIX: showToast calls now use the ICONS map instead of raw HTML with inner double-quotes.
async function loadFFmpeg() {
    if (ffmpeg) return ffmpeg;
    if (ffmpegLoadPromise) return ffmpegLoadPromise;

    ffmpegLoadPromise = (async () => {
        if (typeof showToast === 'function') showToast('Booting processing engine...', ICONS.settings);
        const FFmpegLib = window.FFmpeg || window;
        if (!FFmpegLib.FFmpeg) throw new Error('FFmpeg library is unavailable');
        const instance = new FFmpegLib.FFmpeg();
        instance.on('progress', ({ progress }) => {
            const pct = Math.round(progress * 100);
            const pb = document.getElementById('aiProgress');
            if (pb) pb.style.width = pct + '%';
        });

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        let coreURL;
        let wasmURL;
        try {
            [coreURL, wasmURL] = await Promise.all([
                toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
            ]);
            await instance.load({ coreURL, wasmURL });
            ffmpeg = instance;
            if (typeof showToast === 'function') showToast('Processing Engine Ready!', ICONS.rocket, 'success');
            return ffmpeg;
        } finally {
            if (coreURL) URL.revokeObjectURL(coreURL);
            if (wasmURL) URL.revokeObjectURL(wasmURL);
        }
    })().catch((error) => {
        ffmpegLoadPromise = null;
        console.error('FFmpeg load failed:', error);
        if (typeof showToast === 'function') showToast('Engine failed to load. Check console.', ICONS.xcircle, 'error');
        throw error;
    });
    return ffmpegLoadPromise;
}

// Convert unpkg remote urls to Blob URLs to satisfy CORS isolation policies safely
async function toBlobURL(url, mimeType) {
    const resp = await fetch(url, { cache: 'force-cache' });
    if (!resp.ok) throw new Error(`Unable to download FFmpeg asset (${resp.status})`);
    const blob = await resp.blob();
    return URL.createObjectURL(new Blob([blob], { type: mimeType }));
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────

/**
 * Hook this to your "Export" button.
 * Exports the project video locally using FFmpeg.wasm.
 *
 * M2 FIX:
 *  - trimEnd === 0 is treated as "use full source duration" (omit -t)
 *  - validates 0 <= trimStart < trimEnd
 *  - handles video-only (no audio stream) clips via aevalsrc silence injection
 *  - includes the music/audio track via amix
 *
 * L3 FIX:
 *  - every VFS file is deleted in a finally block
 *  - output Blob URL is revoked 5 s after download starts
 */
async function exportProjectVideo(projectId, opts = {}) {
    const qualityMap = {
        fast: { preset: 'ultrafast', crf: '28' },
        balanced: { preset: 'veryfast', crf: '23' },
        quality: { preset: 'medium', crf: '18' }
    };
    const selectedQuality = qualityMap[opts.quality] || qualityMap.balanced;
    const resolutionMap = { '1080': 1080, '720': 720, '480': 480 };
    const targetHeight = resolutionMap[String(opts.resolution)] || null;
    const audioBitrate = ['128k', '192k', '256k'].includes(opts.audioBitrate) ? opts.audioBitrate : '192k';
    if (opts.format && opts.format !== 'mp4') throw new Error('Only MP4 export is currently supported.');

    if (!ffmpeg) {
        showToast('Starting FFmpeg engine just-in-time...', '⚙️');
        await loadFFmpeg();
    }

    const writtenFiles = []; // VFS filenames to clean up
    let outputUrl = null;

    try {
        const aiOverlay = document.getElementById('aiOverlay') || document.getElementById('exportModal');
        if (aiOverlay) aiOverlay.classList.add('active');

        showToast('Preparing raw assets...', '📦');

        const state = window.projectState;
        if (!state || !Array.isArray(state.tracks)) {
            throw new Error('No valid project state found');
        }

        // 1. Gather all unique assets and write to FFmpeg VFS
        const uniqueAssetIds = new Set();
        state.tracks.forEach(track => {
            if (Array.isArray(track.clips)) {
                track.clips.forEach(clip => {
                    if (clip.assetId) uniqueAssetIds.add(clip.assetId);
                });
            }
        });

        for (const assetId of uniqueAssetIds) {
            const file = await ProjectService.getAsset(projectId, assetId);
            if (file) {
                const buffer = new Uint8Array(await file.arrayBuffer());
                await ffmpeg.writeFile(assetId, buffer);
                writtenFiles.push(assetId);
                console.log(`[FFmpeg] Wrote asset to VFS: ${assetId}`);
            }
        }

        showToast('Rendering timeline...', '🎬');

        // 2. Identify tracks
        const videoTrack = state.tracks.find(t => t.type === 'video');
        const musicTrack = state.tracks.find(t => t.type === 'audio' || t.type === 'music');

        if (!videoTrack || !Array.isArray(videoTrack.clips) || videoTrack.clips.length === 0) {
            throw new Error('No video clips to export');
        }

        const clips = videoTrack.clips;

        // 3. Build validated input arguments for video clips
        const inputArgs = [];
        let inputCount = 0;

        for (const clip of clips) {
            // M2 FIX: validate trim values; treat trimEnd=0 as "read to end"
            const trimStart = Number.isFinite(clip.trimStart) ? Math.max(0, clip.trimStart) : 0;
            const trimEnd   = Number.isFinite(clip.trimEnd) && clip.trimEnd > trimStart ? clip.trimEnd : null;
            const duration  = trimEnd !== null ? trimEnd - trimStart : null;

            inputArgs.push('-ss', trimStart.toString());
            if (duration !== null) inputArgs.push('-t', duration.toString());
            inputArgs.push('-i', clip.assetId);
            inputCount++;
        }

        // 4. Optionally add music input
        let musicInputIdx = -1;
        if (musicTrack && Array.isArray(musicTrack.clips) && musicTrack.clips.length > 0) {
            const mc = musicTrack.clips[0];
            if (mc.assetId) {
                const mStart = Number.isFinite(mc.trimStart) ? Math.max(0, mc.trimStart) : 0;
                const mEnd   = Number.isFinite(mc.trimEnd) && mc.trimEnd > mStart ? mc.trimEnd : null;
                inputArgs.push('-ss', mStart.toString());
                if (mEnd !== null) inputArgs.push('-t', (mEnd - mStart).toString());
                inputArgs.push('-i', mc.assetId);
                musicInputIdx = inputCount;
                inputCount++;
            }
        }

        // 5. Build filter_complex
        // M2 FIX: inject aevalsrc silence for clips that lack an audio stream
        const filterParts = [];
        const vStreams    = [];
        const aStreams    = [];

        clips.forEach((clip, idx) => {
            const filterMap = {
                vivid: 'eq=saturation=1.35:contrast=1.08',
                cinematic: 'eq=saturation=0.82:contrast=1.15',
                warm: 'colorbalance=rs=.08:gs=.02:bs=-.04',
                cool: 'colorbalance=rs=-.04:gs=.02:bs=.08',
                bw: 'hue=s=0,eq=contrast=1.12'
            };
            const videoLabel = `[video${idx}]`;
            const videoFilters = ['setpts=PTS-STARTPTS'];
            if (targetHeight) videoFilters.push(`scale=-2:${targetHeight}:flags=lanczos`);
            if (filterMap[clip.filter]) videoFilters.push(filterMap[clip.filter]);
            const incomingTransition = clip.transition?.type;
            const transitionDuration = Math.min(2, Math.max(0.1, Number(clip.transition?.duration) || 0.5));
            if (incomingTransition === 'fade' || incomingTransition === 'dissolve') {
                videoFilters.push(`fade=t=in:st=0:d=${transitionDuration}`);
            }
            filterParts.push(`[${idx}:v]${videoFilters.join(',')}${videoLabel}`);
            vStreams.push(videoLabel);
            if (clip.hasAudio !== false) {
                // assume audio track present (default)
                aStreams.push(`[${idx}:a]`);
            } else {
                // inject silence matching the trimmed duration
                const trimStart = Number.isFinite(clip.trimStart) ? Math.max(0, clip.trimStart) : 0;
                const trimEnd   = Number.isFinite(clip.trimEnd) && clip.trimEnd > trimStart ? clip.trimEnd : 30;
                const silLabel  = `[silence${idx}]`;
                filterParts.push(`aevalsrc=0:d=${trimEnd - trimStart}${silLabel}`);
                aStreams.push(silLabel);
            }
        });

        const concatIn = vStreams.join('') + aStreams.join('');
        filterParts.push(`${concatIn}concat=n=${clips.length}:v=1:a=1[outv][outa_vid]`);

        // Mix music track if present
        let finalAudioMap;
        if (musicInputIdx >= 0) {
            filterParts.push(`[outa_vid][${musicInputIdx}:a]amix=inputs=2:duration=first[outa]`);
            finalAudioMap = '[outa]';
        } else {
            finalAudioMap = '[outa_vid]';
        }

        const filterComplex = filterParts.join(';');

        const finalArgs = [
            ...inputArgs,
            '-filter_complex', filterComplex,
            '-map', '[outv]',
            '-map', finalAudioMap,
            '-c:v', 'libx264',
            '-preset', selectedQuality.preset,
            '-crf', selectedQuality.crf,
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac',
            '-b:a', audioBitrate,
            '-movflags', '+faststart',
            'output.mp4'
        ];

        console.log('[FFmpeg] Executing: ', finalArgs.join(' '));
        await ffmpeg.exec(finalArgs);
        writtenFiles.push('output.mp4');

        // 6. Read result and download
        const data = await ffmpeg.readFile('output.mp4');
        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        outputUrl  = URL.createObjectURL(blob);

        if (aiOverlay) aiOverlay.classList.remove('active');
        showToast('Render Complete!', '✅', 'success');

        const a    = document.createElement('a');
        a.href     = outputUrl;
        a.download = `clip-magic-export-${Date.now()}.mp4`;
        a.click();

        // L3 FIX: revoke after the browser has had time to begin the download
        setTimeout(() => {
            if (outputUrl) { URL.revokeObjectURL(outputUrl); outputUrl = null; }
        }, 5000);

    } catch (err) {
        console.error(err);
        showToast('Export failed: ' + err.message, '❌', 'error');
        const aiOverlay = document.getElementById('aiOverlay') || document.getElementById('exportModal');
        if (aiOverlay) aiOverlay.classList.remove('active');
        if (outputUrl) { URL.revokeObjectURL(outputUrl); outputUrl = null; }
    } finally {
        // L3 FIX: always delete VFS files to free WASM memory
        for (const name of writtenFiles) {
            try { await ffmpeg.deleteFile(name); } catch (_) { /* ignore */ }
        }
    }
}

// ─── EDITOR UI INTEGRATION ───────────────────────────────────────────────────

window.handleEditorExport = async function (opts = {}) {
    const projId = window.currentProject ? window.currentProject.id : null;
    if (!projId) {
        showToast('No active project to export.', '⚠️', 'error');
        return;
    }
    await exportProjectVideo(projId, opts);
};
