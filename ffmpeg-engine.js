// ffmpeg-engine.js - Handles in-browser video processing via WebAssembly
let ffmpeg = null;

async function loadFFmpeg() {
    if (ffmpeg) return;
    
    if (typeof showToast === 'function') {
        showToast("Booting processing engine...", "<i data-lucide="settings" style="width:18px; height:18px;"></i>");
    }
    
    // Access UMD globals
    const FFmpegLib = window.FFmpeg || window;
    ffmpeg = new FFmpegLib.FFmpeg();
    
    // Listen to progress and update any active progress bars
    ffmpeg.on("progress", ({ progress }) => {
        const pct = Math.round(progress * 100);
        const pb = document.getElementById("aiProgress");
        if(pb) pb.style.width = pct + "%";
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    try {
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        if (typeof showToast === 'function') {
            showToast("Processing Engine Ready!", "<i data-lucide="rocket" style="width:18px; height:18px;"></i>", "success");
        }
    } catch (e) {
        console.error("FFmpeg load failed: ", e);
        if (typeof showToast === 'function') {
            showToast("Engine failed to load. Check console.", "<i data-lucide="x-circle" style="width:18px; height:18px;"></i>", "error");
        }
    }
}

// Convert unpkg remote urls to Blob URLs to satisfy CORS isolation policies safely
async function toBlobURL(url, mimeType) {
    const resp = await fetch(url);
    const buf = await resp.arrayBuffer();
    const blob = new Blob([buf], { type: mimeType });
    return URL.createObjectURL(blob);
}

// Auto-load FFmpeg when visiting the editor page
document.addEventListener("DOMContentLoaded", () => {
    // A small timeout ensures UI loads smoothly before heavy WASM loading begins
    setTimeout(() => {
        if(window.location.pathname.includes('editor')) {
            loadFFmpeg();
        }
    }, 500);
});

// CORE EDITING SUITE FUNCTIONS

/**
 * Hook this to your "Export" button.
 * Exports the project video locally using FFmpeg.wasm.
 */
async function exportProjectVideo(projectId, opts = {}) {
    if (!ffmpeg) {
        showToast("Starting FFmpeg engine just-in-time...", "⚙️");
        await loadFFmpeg();
    }

    try {
        const aiOverlay = document.getElementById("aiOverlay") || document.getElementById("exportModal");
        if(aiOverlay) aiOverlay.classList.add('active');
        
        showToast("Preparing raw assets...", "📦");
        
        const state = window.projectState;
        if (!state || !state.tracks) {
            throw new Error("No project state found");
        }

        // 1. Gather all unique assets and write to FFmpeg VFS
        const uniqueAssetIds = new Set();
        state.tracks.forEach(track => {
            track.clips.forEach(clip => {
                if (clip.assetId) uniqueAssetIds.add(clip.assetId);
            });
        });

        for (const assetId of uniqueAssetIds) {
            const file = await ProjectService.getAsset(projectId, assetId);
            if (file) {
                const buffer = new Uint8Array(await file.arrayBuffer());
                await ffmpeg.writeFile(assetId, buffer);
                console.log(`[FFmpeg] Wrote asset to VFS: ${assetId}`);
            }
        }

        showToast("Rendering timeline...", "🎬");

        // 2. Build the FFmpeg filter graph for concatenation and trimming
        // For simplicity in this first version, we'll concatenate clips from the video track
        const videoTrack = state.tracks.find(t => t.type === 'video');
        const audioTrack = state.tracks.find(t => t.type === 'audio' || t.type === 'music');

        if (!videoTrack || videoTrack.clips.length === 0) {
            throw new Error("No video clips to export");
        }

        let filterComplex = "";
        let inputArgs = [];
        let inputCount = 0;

        // Process video clips
        videoTrack.clips.forEach((clip, idx) => {
            inputArgs.push("-ss", clip.trimStart.toString(), "-t", (clip.trimEnd - clip.trimStart).toString(), "-i", clip.assetId);
            filterComplex += `[${idx}:v][${idx}:a]`; // Collect video and audio streams
            inputCount++;
        });

        filterComplex += `concat=n=${inputCount}:v=1:a=1[outv][outa]`;

        // If there's a separate background audio track, we'd need a more complex mix filter.
        // For now, let's focus on concatenating the video clips.

        const finalArgs = [...inputArgs, "-filter_complex", filterComplex, "-map", "[outv]", "-map", "[outa]", "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac", "output.mp4"];

        console.log("[FFmpeg] Executing: ", finalArgs.join(" "));
        await ffmpeg.exec(finalArgs);

        // 3. Read result and download
        const data = await ffmpeg.readFile('output.mp4');
        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);

        if(aiOverlay) aiOverlay.classList.remove('active');
        showToast("Render Complete!", "✅", "success");

        const a = document.createElement('a');
        a.href = url;
        a.download = `clip-magic-export-${Date.now()}.mp4`;
        a.click();
        
    } catch (err) {
        console.error(err);
        showToast("Export failed: " + err.message, "❌", "error");
        const aiOverlay = document.getElementById("aiOverlay") || document.getElementById("exportModal");
        if(aiOverlay) aiOverlay.classList.remove('active');
    }
}

// ==========================================
// EDITOR UI INTEGRATION
// ==========================================

window.handleEditorExport = async function() {
    const projId = window.currentProject ? window.currentProject.id : null;
    if (!projId) {
        showToast("No active project to export.", "⚠️", "error");
        return;
    }

    await exportProjectVideo(projId);
}
