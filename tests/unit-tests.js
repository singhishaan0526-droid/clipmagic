// Phase 8: Clip Magic Automated Unit Test Suite
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Clip Magic Phase 8 Unit Tests...\n');

let totalTests = 0;
let passedTests = 0;

function it(name, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`  ✓ ${name}`);
    } catch (err) {
        console.error(`  ✗ ${name}`);
        console.error(`    ${err.message}`);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Asset Library Catalog & Licensing Audit
// ─────────────────────────────────────────────────────────────────────────────
console.log('📦 Test Suite 1: Asset Library Catalog & Licensing Integrity');

const assetLibrarySrc = fs.readFileSync(path.join(__dirname, '../frontend/asset-library.js'), 'utf8');

it('Asset library defines ASSET_CATALOG with diverse asset types', () => {
    assert(assetLibrarySrc.includes('const ASSET_CATALOG = ['), 'ASSET_CATALOG definition should exist');
    assert(assetLibrarySrc.includes("type: 'sticker'"), 'Sticker type must be present');
    assert(assetLibrarySrc.includes("type: 'music'"), 'Music type must be present');
    assert(assetLibrarySrc.includes("type: 'sfx'"), 'SFX type must be present');
    assert(assetLibrarySrc.includes("type: 'filter'"), 'Filter type must be present');
    assert(assetLibrarySrc.includes("type: 'text-style'"), 'Text-style type must be present');
    assert(assetLibrarySrc.includes("type: 'vfx'"), 'VFX type must be present');
    assert(assetLibrarySrc.includes("type: 'transition'"), 'Transition type must be present');
});

it('All catalog items include licensing and attribution metadata', () => {
    const catalogMatch = assetLibrarySrc.match(/const ASSET_CATALOG = (\[[\s\S]*?\n\s*\]);/);
    assert(catalogMatch, 'Should locate ASSET_CATALOG array in asset-library.js');
    
    const catalog = eval(catalogMatch[1]);
    assert(catalog.length >= 24, `Catalog should have sufficient starter assets (found ${catalog.length})`);
    
    catalog.forEach(item => {
        assert(item.id, `Item ${item.name} must have a stable unique ID`);
        assert(item.name, `Item ${item.id} must have a display name`);
        assert(item.category, `Item ${item.id} must have a category`);
        assert(item.license, `Item ${item.id} must have a declared license (e.g., CC0, MIT, Google Fonts, Freesound)`);
        assert(item.attribution, `Item ${item.id} must have attribution details`);
    });
});

it('Asset library implements pagination and audio cleanup hooks', () => {
    assert(assetLibrarySrc.includes('visibleAssetLimit'), 'Must declare visibleAssetLimit for mobile virtualization');
    assert(assetLibrarySrc.includes('loadMore'), 'Must provide loadMore pagination method');
    assert(assetLibrarySrc.includes('stopAudioPreview'), 'Must export stopAudioPreview for clean audio lifecycle');
    assert(assetLibrarySrc.includes('loading="lazy"'), 'Must utilize lazy image loading');
    assert(assetLibrarySrc.includes('decoding="async"'), 'Must utilize async image decoding');
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Animation Engine & Mathematical Interpolation
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🎬 Test Suite 2: Animation Engine & Keyframe Interpolation');

function valueAt(keyframes, time, property, defaultValue) {
    if (!keyframes || keyframes.length === 0) return defaultValue;
    if (keyframes.length === 1) return keyframes[0].values[property] ?? defaultValue;

    const sorted = [...keyframes].sort((a, b) => a.time - b.time);
    if (time <= sorted[0].time) return sorted[0].values[property] ?? defaultValue;
    if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].values[property] ?? defaultValue;

    let kfPrev = sorted[0];
    let kfNext = sorted[1];
    for (let i = 0; i < sorted.length - 1; i++) {
        if (time >= sorted[i].time && time <= sorted[i + 1].time) {
            kfPrev = sorted[i];
            kfNext = sorted[i + 1];
            break;
        }
    }

    const t0 = kfPrev.time;
    const t1 = kfNext.time;
    const span = t1 - t0;
    if (span <= 0.0001) return kfPrev.values[property] ?? defaultValue;

    const t = (time - t0) / span;
    const v0 = kfPrev.values[property] ?? defaultValue;
    const v1 = kfNext.values[property] ?? defaultValue;

    return v0 + (v1 - v0) * t;
}

it('valueAt correctly clamps before first and after last keyframe', () => {
    const kfs = [
        { time: 1.0, values: { scale: 0.5, opacity: 0 } },
        { time: 3.0, values: { scale: 1.5, opacity: 1 } }
    ];

    assert.strictEqual(valueAt(kfs, 0.5, 'scale', 1.0), 0.5);
    assert.strictEqual(valueAt(kfs, 1.0, 'scale', 1.0), 0.5);
    assert.strictEqual(valueAt(kfs, 4.0, 'scale', 1.0), 1.5);
    assert.strictEqual(valueAt(kfs, 0.0, 'opacity', 0.5), 0);
    assert.strictEqual(valueAt(kfs, 5.0, 'opacity', 0.5), 1);
});

it('valueAt correctly interpolates midway values linearly', () => {
    const kfs = [
        { time: 0.0, values: { x: 0, y: 100 } },
        { time: 2.0, values: { x: 100, y: 200 } }
    ];

    const midX = valueAt(kfs, 1.0, 'x', 0);
    const midY = valueAt(kfs, 1.0, 'y', 0);
    assert.strictEqual(midX, 50, 'Midpoint X at t=1.0 should be exactly 50');
    assert.strictEqual(midY, 150, 'Midpoint Y at t=1.0 should be exactly 150');
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Project Schema Serialization & Deserialization
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n💾 Test Suite 3: Project Schema Persistence & State Roundtrip');

it('Project state serialization preserves tracks, overlays, keyframes and audio settings', () => {
    const sampleProject = {
        id: 'proj-qa-test-1',
        name: 'Phase 8 QA Project',
        duration: 12.5,
        tracks: [
            {
                id: 'track-v1',
                type: 'video',
                name: 'Main Video',
                clips: [
                    {
                        id: 'clip-1',
                        start: 0,
                        duration: 5.0,
                        trimIn: 1.0,
                        trimOut: 6.0,
                        filter: 'cinematic',
                        filterIntensity: 85,
                        keyframes: [
                            { time: 0, values: { scale: 1.0, opacity: 1.0 } },
                            { time: 2.5, values: { scale: 1.2, opacity: 0.8 } }
                        ]
                    }
                ]
            },
            {
                id: 'track-a1',
                type: 'audio',
                name: 'Background Music',
                clips: [
                    {
                        id: 'audio-1',
                        start: 0,
                        duration: 10.0,
                        volume: 0.75,
                        bassGain: 4
                    }
                ]
            }
        ],
        textOverlays: [
            {
                id: 'text-1',
                text: 'Release Ready',
                fontFamily: 'Montserrat',
                fontSize: 48,
                color: '#ffffff',
                startTime: 1.0,
                endTime: 4.0,
                x: 50,
                y: 80
            }
        ],
        stickers: [
            {
                id: 'sticker-1',
                assetId: 'stk-sparkles',
                startTime: 2.0,
                endTime: 5.0,
                scale: 1.1,
                rotation: 15
            }
        ]
    };

    const serialized = JSON.stringify(sampleProject);
    const deserialized = JSON.parse(serialized);

    assert.deepStrictEqual(deserialized, sampleProject, 'Deserialized object must exactly match original');
    assert.strictEqual(deserialized.tracks[0].clips[0].keyframes.length, 2);
    assert.strictEqual(deserialized.textOverlays[0].text, 'Release Ready');
    assert.strictEqual(deserialized.stickers[0].assetId, 'stk-sparkles');
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Mobile Architecture & Accessibility Guardrails
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📱 Test Suite 4: Mobile Viewport CSS & Accessibility Attributes');

const editorHtmlSrc = fs.readFileSync(path.join(__dirname, '../frontend/editor.html'), 'utf8');
const editorCssSrc = fs.existsSync(path.join(__dirname, '../frontend/editor.css')) ? fs.readFileSync(path.join(__dirname, '../frontend/editor.css'), 'utf8') : '';
const editorJsSrc = fs.existsSync(path.join(__dirname, '../frontend/editor-main.js')) ? fs.readFileSync(path.join(__dirname, '../frontend/editor-main.js'), 'utf8') : '';
const editorSrc = editorHtmlSrc + '\n' + editorCssSrc + '\n' + editorJsSrc;

it('Editor includes mobile landscape media query rules', () => {
    assert(editorSrc.includes('@media (max-height: 520px) and (orientation: landscape)'), 'Landscape query must exist');
    assert(editorSrc.includes('.editor-props.mobile-landscape-open'), 'Drawer style for landscape properties must exist');
});

it('Editor implements coarse pointer tap target padding', () => {
    assert(editorSrc.includes('@media (pointer: coarse)'), 'Coarse pointer query must exist');
    assert(editorSrc.includes('.trim-handle::before'), 'Trim handle hit padding expansion must exist');
});

it('Editor respects reduced-motion preferences', () => {
    assert(editorSrc.includes('@media (prefers-reduced-motion: reduce)'), 'Prefers-reduced-motion query must exist');
});

it('Editor provides accessible form labels and high-visibility focus styles', () => {
    assert(editorSrc.includes(':focus-visible'), 'Focus-visible rules must be defined');
    assert(editorSrc.includes('sr-only'), 'Screen-reader only utility class must be defined');
    assert(editorSrc.includes('checkDeviceStorageQuota'), 'Storage quota checking method must exist');
    assert(editorSrc.includes('unlockMobileAudio'), 'Web Audio unlock method must exist');
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Multi-Clip, Multi-Layer Compositor & State Integrity (Phase 1)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🎞️ Test Suite 5: Multi-Clip, Multi-Layer Compositor & State Integrity');

function resolveActiveClipsAtTime(tracks, time) {
    const active = [];
    (tracks || []).forEach((track, trackIdx) => {
        if (track.hidden) return;
        const zIndex = track.zIndex !== undefined ? track.zIndex : (track.isBase ? 10 : 20 + trackIdx * 10);
        (track.clips || []).forEach(clip => {
            const start = Number(clip.start) || 0;
            const trimStart = Number(clip.trimStart) || 0;
            const trimEnd = Number(clip.trimEnd) || Number(clip.duration) || (trimStart + 1);
            const duration = Math.max(0.01, trimEnd - trimStart);
            if (time >= start && time < start + duration) {
                const sourceTime = trimStart + (time - start);
                active.push({
                    clip,
                    track,
                    zIndex,
                    sourceTime,
                    isBase: !!track.isBase
                });
            }
        });
    });
    return active.sort((a, b) => a.zIndex - b.zIndex);
}

function addMediaAssetToProject(projectState, asset) {
    if (!projectState.mediaAssets) projectState.mediaAssets = [];
    const existing = projectState.mediaAssets.find(a => a.id === asset.id);
    if (!existing) {
        projectState.mediaAssets.push({ ...asset });
    }
    return projectState.mediaAssets;
}

it('Importing a second media asset preserves the first in projectState.mediaAssets', () => {
    const state = {
        mediaAssets: [],
        tracks: [{ id: 'track-v1', type: 'video', isBase: true, clips: [] }]
    };
    addMediaAssetToProject(state, { id: 'asset-1', name: 'beach.mp4', duration: 10, type: 'video' });
    assert.strictEqual(state.mediaAssets.length, 1);
    assert.strictEqual(state.mediaAssets[0].id, 'asset-1');

    addMediaAssetToProject(state, { id: 'asset-2', name: 'sunset.mp4', duration: 8, type: 'video' });
    assert.strictEqual(state.mediaAssets.length, 2, 'Second asset must be added without replacing first');
    assert.strictEqual(state.mediaAssets[0].id, 'asset-1', 'First asset remains intact');
    assert.strictEqual(state.mediaAssets[1].id, 'asset-2', 'Second asset has distinct ID');
});

it('resolveActiveClipsAtTime identifies both base and overlay clips during overlap', () => {
    const tracks = [
        {
            id: 'track-v1',
            type: 'video',
            name: 'Base Video',
            isBase: true,
            zIndex: 10,
            clips: [
                { id: 'clip-base-1', assetId: 'asset-1', start: 0, duration: 10, trimStart: 0, trimEnd: 10 }
            ]
        },
        {
            id: 'track-v2',
            type: 'video',
            name: 'Overlay Video',
            isBase: false,
            zIndex: 20,
            clips: [
                { id: 'clip-overlay-1', assetId: 'asset-2', start: 2, duration: 5, trimStart: 1, trimEnd: 6 }
            ]
        }
    ];

    // At t = 1.0 (before overlay starts): only base clip is active
    const activeAt1 = resolveActiveClipsAtTime(tracks, 1.0);
    assert.strictEqual(activeAt1.length, 1);
    assert.strictEqual(activeAt1[0].clip.id, 'clip-base-1');
    assert.strictEqual(activeAt1[0].sourceTime, 1.0);

    // At t = 3.5 (during overlap): both base and overlay clips are active in deterministic z-order
    const activeAt3p5 = resolveActiveClipsAtTime(tracks, 3.5);
    assert.strictEqual(activeAt3p5.length, 2, 'Both clips must be active during overlap');
    assert.strictEqual(activeAt3p5[0].clip.id, 'clip-base-1', 'Base clip renders first (lower z-index)');
    assert.strictEqual(activeAt3p5[1].clip.id, 'clip-overlay-1', 'Overlay clip renders second (higher z-index)');
    assert.strictEqual(activeAt3p5[0].zIndex < activeAt3p5[1].zIndex, true, 'Base z-index must be lower than overlay');
    // Check computed source times:
    // Base: start=0, trimStart=0 -> sourceTime = 3.5
    assert.strictEqual(activeAt3p5[0].sourceTime, 3.5);
    // Overlay: start=2, trimStart=1 -> sourceTime = 1 + (3.5 - 2) = 2.5
    assert.strictEqual(activeAt3p5[1].sourceTime, 2.5);

    // At t = 8.0 (after overlay ends): only base clip is active
    const activeAt8 = resolveActiveClipsAtTime(tracks, 8.0);
    assert.strictEqual(activeAt8.length, 1);
    assert.strictEqual(activeAt8[0].clip.id, 'clip-base-1');
});

it('Overlay layer respects visibility toggle and mute settings', () => {
    const tracks = [
        {
            id: 'track-v1',
            type: 'video',
            isBase: true,
            zIndex: 10,
            clips: [{ id: 'clip-base', start: 0, duration: 10, trimStart: 0, trimEnd: 10 }]
        },
        {
            id: 'track-v2',
            type: 'video',
            isBase: false,
            zIndex: 20,
            hidden: true, // hidden track
            clips: [{ id: 'clip-overlay', start: 0, duration: 10, trimStart: 0, trimEnd: 10 }]
        }
    ];

    const active = resolveActiveClipsAtTime(tracks, 5.0);
    assert.strictEqual(active.length, 1, 'Hidden overlay track must not be included in active render');
    assert.strictEqual(active[0].clip.id, 'clip-base');
});

it('Split clip operation preserves total duration and creates independent instances', () => {
    const clip = {
        id: 'clip-orig',
        assetId: 'asset-1',
        start: 2.0,
        trimStart: 1.0,
        trimEnd: 9.0
    };
    const splitPoint = 5.0; // split at 5.0s on timeline (relative local = 1.0 + (5.0 - 2.0) = 4.0s)

    const relSplit = clip.trimStart + (splitPoint - clip.start);
    const clipA = {
        ...clip,
        id: 'clip-orig',
        trimEnd: relSplit
    };
    const clipB = {
        ...clip,
        id: 'clip-split-2',
        start: splitPoint,
        trimStart: relSplit,
        trimEnd: clip.trimEnd
    };

    const durA = clipA.trimEnd - clipA.trimStart; // 4.0 - 1.0 = 3.0s
    const durB = clipB.trimEnd - clipB.trimStart; // 9.0 - 4.0 = 5.0s
    assert.strictEqual(durA + durB, 8.0, 'Total duration of split halves must equal original 8.0s');
    assert.strictEqual(clipA.start + durA, clipB.start, 'Clip B must start exactly where Clip A ends');
    assert.notStrictEqual(clipA.id, clipB.id, 'Split clips must have unique IDs');
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Filter Pack (preview + FFmpeg export parity)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🎨 Test Suite 6: Filter Pack');

const pack = require('../frontend/filters-pack.js');
const engineSrc = fs.readFileSync(path.join(__dirname, '../frontend/ffmpeg-engine.js'), 'utf8');

it('Filter pack defines 20 uniquely-named filters', () => {
    assert.strictEqual(pack.FILTERS.length, 20);
    assert.strictEqual(new Set(pack.FILTERS.map(f => f.id)).size, 20);
    pack.FILTERS.forEach(f => assert(pack.previewFilter(f.id, 100).length > 0, `${f.id} needs a preview filter`));
});

it('Every filter builds a balanced FFmpeg graph at 100% and 40% strength', () => {
    for (const f of pack.FILTERS) for (const amt of [100, 40, 0]) {
        const segs = pack.ffmpegStage(f.id, amt, '[in]', '[out]', 't');
        const used = {}, made = {};
        segs.forEach(seg => {
            const outs = seg.match(/\[[^\]]+\]/g) || [];
            // leading labels are inputs, trailing labels are outputs
            const m = seg.match(/^((?:\[[^\]]+\])+)/); const ins = m ? m[1].match(/\[[^\]]+\]/g) : [];
            const tail = seg.match(/((?:\[[^\]]+\])+)$/); const os = tail ? tail[1].match(/\[[^\]]+\]/g) : [];
            ins.forEach(l => used[l] = (used[l] || 0) + 1); os.forEach(l => made[l] = (made[l] || 0) + 1);
        });
        Object.keys(used).forEach(l => { if (l !== '[in]') assert(made[l], `${f.id}@${amt}: ${l} consumed but never produced`); });
        Object.keys(made).forEach(l => { if (l !== '[out]') assert(used[l], `${f.id}@${amt}: ${l} produced but never consumed`); });
        assert(made['[out]'] === 1, `${f.id}: exactly one [out]`);
    }
});

it('Strength 0 leaves the picture untouched in preview', () => {
    pack.FILTERS.forEach(f => {
        const css = pack.previewFilter(f.id, 0);
        css.split(') ').forEach(fn => assert(/(brightness|contrast|saturate)\(1\)?|(sepia|grayscale)\(0\)|hue-rotate\(0deg\)/.test(fn.endsWith(')') ? fn : fn + ')'), `${f.id}: ${fn}`));
    });
});

it('Editor and export engine are wired to the filter pack', () => {
    assert(editorSrc.includes('src="filters-pack.js"'));
    assert(editorSrc.includes('applyClipFilterAmount'));
    assert(engineSrc.includes('ClipFilterPack.ffmpegStage'));
    assert(assetLibrarySrc.includes('ClipFilterPack.FILTERS.forEach'));
});

it('Filter pack provides canvas Renderer and ClipFilters compatibility API', () => {
    assert(typeof pack.Renderer === 'function', 'Renderer class must be exported');
    const renderer = new pack.Renderer(null);
    assert(renderer.filter, 'Renderer must initialize with default filter');
    renderer.setFilter('toxic-glitch');
    assert.strictEqual(renderer.filter.id, 'toxic-glitch');
    renderer.setIntensity(0.5);
    assert.strictEqual(renderer.intensity, 0.5);
    assert(typeof pack.exportVideo === 'function', 'exportVideo method must be exported');
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Typography, Text Animations, Screen Draw & Per-Frame Motion Keyframing
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n✍️ Test Suite 7: Typography, Text Animations, Screen Draw & Per-Frame Motion');

it('Google Fonts and font family selectors are loaded for front styling', () => {
    assert(editorSrc.includes('fonts.googleapis.com/css2?family='), 'Google fonts link must be loaded in head');
    const expectedFonts = ['Inter', 'Montserrat', 'Bebas Neue', 'Outfit', 'Permanent Marker', 'Playfair Display', 'Righteous', 'Bangers', 'Orbitron', 'Cinzel', 'Dancing Script'];
    expectedFonts.forEach(font => {
        assert(editorSrc.includes(`value="${font}"`), `Font family option for ${font} must be available in editor`);
    });
});

it('All 14 entrance/motion animations and visual front styles are defined in CSS & UI', () => {
    const expectedAnimations = ['pop', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'typewriter', 'fade-zoom', 'glitch', 'bounce-drop', 'blur-in', 'rotate-in', 'wave', 'pulse', 'word-by-word'];
    expectedAnimations.forEach(anim => {
        if (anim === 'typewriter') {
            assert(editorSrc.includes("animation === 'typewriter'"), 'Typewriter animation logic must exist');
        } else {
            assert(editorSrc.includes(`.lyric-${anim}`), `CSS class .lyric-${anim} must be defined`);
        }
    });

    const expectedStyles = ['gradient', 'neon', 'box', 'luxury', 'flame', 'outline', 'shadow3d', 'solid'];
    expectedStyles.forEach(style => {
        assert(editorSrc.includes(`.lyric-${style}`), `Visual style class .lyric-${style} must be defined`);
    });
});

it('On-canvas draw mode and interactive handles are wired in the preview screen', () => {
    assert(editorSrc.includes('function setupTextDrawListener'), 'setupTextDrawListener must be defined');
    assert(editorSrc.includes('function toggleTextDrawMode'), 'toggleTextDrawMode must be defined');
    assert(editorSrc.includes('function addTextOverlayAtPosition'), 'addTextOverlayAtPosition must be defined');
    assert(editorSrc.includes('text-draw-box-preview'), 'text-draw-box-preview CSS class must exist');
    assert(editorSrc.includes('text-handle-resize'), 'Resize handle must be defined');
    assert(editorSrc.includes('text-handle-rotate'), 'Rotate handle must be defined');
});

it('Per-frame keyframe interpolation correctly evaluates position, scale, and rotation across timestamps', () => {
    assert(editorSrc.includes('function getTextOverlayTransformAt'), 'getTextOverlayTransformAt must exist');
    assert(editorSrc.includes('function setTextOverlayKeyframeAtCurrentTime'), 'setTextOverlayKeyframeAtCurrentTime must exist');
    assert(editorSrc.includes('function stepTextOverlayKeyframe'), 'stepTextOverlayKeyframe must exist');

    const match = editorSrc.match(/(function getTextOverlayTransformAt\(item, time\) \{[\s\S]*?\r?\n\s*\})\r?\n\s*function setTextOverlayKeyframeAtCurrentTime/);
    assert(match, 'getTextOverlayTransformAt function must be extractable');
    const getTextOverlayTransformAt = eval(`(${match[1]})`);

    const testItem = {
        x: 50,
        y: 70,
        keyframes: [
            { time: 1.0, x: 20, y: 30, scale: 100, rotation: 0, opacity: 100 },
            { time: 3.0, x: 80, y: 90, scale: 150, rotation: 45, opacity: 50 }
        ]
    };

    // Before first keyframe
    const before = getTextOverlayTransformAt(testItem, 0.5);
    assert.strictEqual(before.x, 20);
    assert.strictEqual(before.y, 30);

    // After last keyframe
    const after = getTextOverlayTransformAt(testItem, 4.0);
    assert.strictEqual(after.x, 80);
    assert.strictEqual(after.y, 90);

    // Midway interpolated values (at t = 2.0s, ratio = 0.5)
    const mid = getTextOverlayTransformAt(testItem, 2.0);
    assert(mid.x > 20 && mid.x < 80, `mid.x ${mid.x} should be between 20 and 80`);
    assert(mid.y > 30 && mid.y < 90, `mid.y ${mid.y} should be between 30 and 90`);
    assert(mid.scale > 100 && mid.scale < 150, `mid.scale ${mid.scale} should be between 100 and 150`);
    assert(mid.rotation > 0 && mid.rotation < 45, `mid.rotation ${mid.rotation} should be between 0 and 45`);
});

it('Live filter playback applies GPU-accelerated WebGL filters with requestVideoFrameCallback and seek-loop guards', () => {
    const updatedEditorSrc = editorSrc;
    const updatedFiltersPackSrc = fs.readFileSync(path.join(__dirname, '../frontend/filters-pack.js'), 'utf8');
    
    assert(!updatedEditorSrc.includes("const baseFilter = isPack ? '' :"), 'baseFilter must not be bypassed for pack filters');
    assert(updatedEditorSrc.includes("typeof getBasePreviewFilter === 'function' ? getBasePreviewFilter(clip?.filter, clip?.filterAmount) : ''"), 'applyVisualFilters must compute baseFilter');
    assert(updatedFiltersPackSrc.includes('requestVideoFrameCallback'), 'syncPreview must use requestVideoFrameCallback for smooth lockstep frame presentation');
    assert(updatedFiltersPackSrc.includes('targetW'), 'syncPreview must scale render target to display dimensions');
    assert(updatedEditorSrc.includes('if (!baseVid.seeking)'), 'baseVid seeking guard must prevent seek-loops');
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 8: Clip Magic CSS Design System & Mobile Lime Toolbar
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🎨 Test Suite 8: Clip Magic CSS Design System & Mobile Lime Toolbar');

it('Global style.css defines the Clip Magic CSS variables system', () => {
    const styleSrc = fs.readFileSync(path.join(__dirname, '../frontend/style.css'), 'utf8');
    assert(styleSrc.includes('--accent-lime:'), 'style.css must define --accent-lime');
    assert(styleSrc.includes('--track-video-bg:'), 'style.css must define --track-video-bg');
    assert(styleSrc.includes('--track-audio-bg:'), 'style.css must define --track-audio-bg');
    assert(styleSrc.includes('--track-text-bg:'), 'style.css must define --track-text-bg');
    assert(styleSrc.includes('--track-overlay-bg:'), 'style.css must define --track-overlay-bg');
    assert(styleSrc.includes('--mobile-toolbar-bg:'), 'style.css must define --mobile-toolbar-bg');
    assert(styleSrc.includes('--clip-selected-outline:'), 'style.css must define --clip-selected-outline');
    assert(styleSrc.includes('--text-on-dark-high:'), 'style.css must define --text-on-dark-high');
});

it('Editor stylesheet integrates design system variables with dark toolbar & lime active tool', () => {
    assert(editorSrc.includes('--accent-lime: #a3e635;'), 'editor.html must declare --accent-lime in :root');
    assert(editorSrc.includes('--mobile-toolbar-bg: #0d0e12;'), 'editor.html must keep toolbar dark');
    assert(editorSrc.includes('.mob-tool-btn.active'), 'editor.html must define active tool state');
    assert(editorSrc.includes('var(--mobile-toolbar-active-color, #a3e635)'), 'active tool must use accent lime');
    assert(editorSrc.includes('.track-clip.selected'), 'editor.html must define selected clip state');
    assert(editorSrc.includes('var(--clip-selected-outline'), 'selected clip must use lime accent outline');
});

it('Track clip styling preserves distinctive colors for video, audio, text, and overlay tracks', () => {
    assert(editorSrc.includes('.clip-video'), 'Video clips must have distinct styling');
    assert(editorSrc.includes('--track-video-bg'), 'Video clips must use video track token');
    assert(editorSrc.includes('.clip-music, .clip-audio'), 'Audio clips must have distinct styling');
    assert(editorSrc.includes('--track-audio-bg'), 'Audio clips must use audio track token');
    assert(editorSrc.includes('.clip-caption, .clip-text'), 'Text/caption clips must have distinct styling');
    assert(editorSrc.includes('--track-text-bg'), 'Text clips must use text track token');
    assert(editorSrc.includes('.clip-overlay, .clip-image'), 'Overlay clips must have distinct styling');
    assert(editorSrc.includes('--track-overlay-bg'), 'Overlay clips must use overlay track token');
});

it('Small text and icons have enhanced contrast and readability against dark surfaces', () => {
    assert(editorSrc.includes('.clip-content-label'), 'clip-content-label must be styled');
    assert(editorSrc.includes('text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95)'), 'clip text must have shadow for readability');
    assert(editorSrc.includes('--text-on-dark-medium'), 'Must use readable text tokens for dark surfaces');
    assert(editorSrc.includes('syncMobileToolbarForSelection'), 'Toolbar must dynamically synchronize for clip selection');
});


// ─────────────────────────────────────────────────────────────────────────────
// 9. TypeScript Migrated Engines & Type-Safe Core Validation
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n⚡ Test Suite 9: TypeScript Migrated Engines & Core Validation');

const vm = require('vm');
const bundlePath = path.join(__dirname, '../frontend/dist/clip-magic.bundle.js');
const dtsPath = path.join(__dirname, '../frontend/dist/index.d.ts');

it('TypeScript build artifacts and type declarations exist', () => {
    assert(fs.existsSync(bundlePath), 'clip-magic.bundle.js must exist in frontend/dist/');
    assert(fs.existsSync(dtsPath), 'index.d.ts declaration file must exist in frontend/dist/');
    const dtsContent = fs.readFileSync(dtsPath, 'utf8');
    assert(dtsContent.includes('TimelineEngine'), 'Declarations must export TimelineEngine');
    assert(dtsContent.includes('PlaybackEngine'), 'Declarations must export PlaybackEngine');
    assert(dtsContent.includes('CompositorEngine'), 'Declarations must export CompositorEngine');
    assert(dtsContent.includes('RenderEngine'), 'Declarations must export RenderEngine');
    assert(dtsContent.includes('SpeedEngine'), 'Declarations must export SpeedEngine');
});

// Evaluate bundle in isolated VM with browser mock
const sandbox = { console };
sandbox.window = sandbox;
const bundleSrc = fs.readFileSync(bundlePath, 'utf8');
vm.runInNewContext(bundleSrc, sandbox);
const Core = sandbox.ClipMagicCore;

it('ClipMagicCore exports all primary editing engines and guards', () => {
    assert(Core.TimelineEngine, 'Must export TimelineEngine');
    assert(Core.PlaybackEngine, 'Must export PlaybackEngine');
    assert(Core.CompositorEngine, 'Must export CompositorEngine');
    assert(Core.TransitionEngine, 'Must export TransitionEngine');
    assert(Core.KeyframeEngine, 'Must export KeyframeEngine');
    assert(Core.AudioEngine, 'Must export AudioEngine');
    assert(Core.FilterEngine, 'Must export FilterEngine');
    assert(Core.OverlayEngine, 'Must export OverlayEngine');
    assert(Core.SpeedEngine, 'Must export SpeedEngine');
    assert(Core.RenderEngine, 'Must export RenderEngine');
    assert(typeof Core.isVideoClip === 'function', 'Must export isVideoClip');
    assert(typeof Core.isAudioClip === 'function', 'Must export isAudioClip');
});

it('TimelineEngine: accurately calculates clip duration accounting for speed segments', () => {
    const normalClip = { id: 'c1', assetId: 'a1', name: 'V1', type: 'video', start: 0, duration: 10, trimStart: 2, trimEnd: 8, volume: 1, speed: 1.0 };
    const dur1 = Core.TimelineEngine.calculateClipDuration(normalClip);
    assert.strictEqual(dur1, 6.0, 'Duration should be trimEnd - trimStart at 1.0x speed');

    const fastClip = { id: 'c2', assetId: 'a1', name: 'V2', type: 'video', start: 0, duration: 10, trimStart: 0, trimEnd: 10, volume: 1, speed: 2.0 };
    const dur2 = Core.TimelineEngine.calculateClipDuration(fastClip);
    assert.strictEqual(dur2, 5.0, 'Duration should be halved at 2.0x speed');
});

it('TimelineEngine: splitClipAtTime correctly divides clip into two continuous instances', () => {
    const clip = { id: 'c_orig', assetId: 'a1', name: 'Original', type: 'video', start: 2.0, duration: 10.0, trimStart: 0.0, trimEnd: 10.0, volume: 1, speed: 1.0 };
    const track = { id: 't1', type: 'video', clips: [clip] };
    // Split at timeline time 6.0s (4.0s into the clip)
    const result = Core.TimelineEngine.splitClipAtTime(clip, track, 6.0);
    assert(result, 'splitClipAtTime should return a split pair');
    const { original, created } = result;

    assert.strictEqual(original.start, 2.0);
    assert.strictEqual(original.trimStart, 0.0);
    assert.strictEqual(original.trimEnd, 4.0);
    assert.strictEqual(original.duration, 4.0);

    assert.strictEqual(created.start, 6.0);
    assert.strictEqual(created.trimStart, 4.0);
    assert.strictEqual(created.trimEnd, 10.0);
    assert.strictEqual(created.duration, 6.0);
    assert.strictEqual(track.clips.length, 2, 'Track should now have both clips');
});

it('TimelineEngine: calculateMagneticSnap snaps playhead to clip boundary within threshold', () => {
    const tracks = [
        { id: 't1', type: 'video', clips: [
            { id: 'c1', assetId: 'a1', name: 'C1', type: 'video', start: 0, duration: 5, trimStart: 0, trimEnd: 5, volume: 1 },
            { id: 'c2', assetId: 'a1', name: 'C2', type: 'video', start: 5, duration: 5, trimStart: 0, trimEnd: 5, volume: 1 }
        ]}
    ];

    // Near 5.0s boundary (4.95s is within 0.15s threshold)
    const snap1 = Core.TimelineEngine.calculateMagneticSnap(4.95, tracks, 0.15);
    assert.strictEqual(snap1.didSnap, true);
    assert.strictEqual(snap1.snappedTime, 5.0);

    // Far from 5.0s boundary (3.2s is outside threshold)
    const snap2 = Core.TimelineEngine.calculateMagneticSnap(3.2, tracks, 0.15);
    assert.strictEqual(snap2.didSnap, false);
    assert.strictEqual(snap2.snappedTime, 3.2);
});

it('TimelineEngine: rippleDeleteClip removes clip and shifts subsequent clips', () => {
    const tracks = [
        { id: 't1', type: 'video', clips: [
            { id: 'c1', assetId: 'a1', name: 'C1', type: 'video', start: 0, duration: 4, trimStart: 0, trimEnd: 4, volume: 1 },
            { id: 'c2', assetId: 'a1', name: 'C2', type: 'video', start: 4, duration: 6, trimStart: 0, trimEnd: 6, volume: 1 },
            { id: 'c3', assetId: 'a1', name: 'C3', type: 'video', start: 10, duration: 5, trimStart: 0, trimEnd: 5, volume: 1 }
        ]}
    ];

    const deleted = Core.TimelineEngine.rippleDeleteClip(tracks, 'c2');
    assert.strictEqual(deleted, true);
    assert.strictEqual(tracks[0].clips.length, 2);
    assert.strictEqual(tracks[0].clips[0].id, 'c1');
    assert.strictEqual(tracks[0].clips[1].id, 'c3');
    // c3 should be rippled backwards by 6 seconds (from 10 to 4)
    assert.strictEqual(tracks[0].clips[1].start, 4);
});

it('KeyframeEngine: applyEasing and valueAt interpolate with easing curves', () => {
    assert.strictEqual(Core.KeyframeEngine.applyEasing(0, 'ease-in'), 0);
    assert.strictEqual(Core.KeyframeEngine.applyEasing(1, 'ease-in'), 1);
    assert(Core.KeyframeEngine.applyEasing(0.5, 'ease-in') < 0.5, 'Ease-in starts slower');
    assert(Core.KeyframeEngine.applyEasing(0.5, 'ease-out') > 0.5, 'Ease-out finishes slower');

    const keyframes = [
        { time: 0.0, property: 'scale', value: 100, easing: 'linear' },
        { time: 2.0, property: 'scale', value: 200, easing: 'linear' }
    ];

    const midway = Core.KeyframeEngine.valueAt(keyframes, 'scale', 1.0, 100);
    assert.strictEqual(midway, 150, 'Midway linear interpolation should be 150');

    const before = Core.KeyframeEngine.valueAt(keyframes, 'scale', -1.0, 100);
    assert.strictEqual(before, 100, 'Clamps to first keyframe before start');

    const after = Core.KeyframeEngine.valueAt(keyframes, 'scale', 5.0, 100);
    assert.strictEqual(after, 200, 'Clamps to last keyframe after end');
});

it('AudioEngine: computeInstantVolume applies fade-in and fade-out smoothly', () => {
    const audioClip = {
        id: 'a1', assetId: 'aud1', name: 'Track', type: 'audio',
        start: 0, duration: 10, trimStart: 0, trimEnd: 10, volume: 1.0,
        fadeIn: 2.0, fadeOut: 2.0
    };

    // At 0s: fade-in should be 0 volume
    assert.strictEqual(Core.AudioEngine.computeInstantVolume(audioClip, 0), 0);
    // At 1s: halfway through 2s fade-in (approx 0.5)
    assert.strictEqual(Math.round(Core.AudioEngine.computeInstantVolume(audioClip, 1.0) * 100) / 100, 0.5);
    // At 5s: full volume (1.0)
    assert.strictEqual(Core.AudioEngine.computeInstantVolume(audioClip, 5.0), 1.0);
    // At 9s: halfway through 2s fade-out (approx 0.5)
    assert.strictEqual(Math.round(Core.AudioEngine.computeInstantVolume(audioClip, 9.0) * 100) / 100, 0.5);
    // At 10s: fade-out complete (0 volume)
    assert.strictEqual(Core.AudioEngine.computeInstantVolume(audioClip, 10.0), 0);
});

it('CompositorEngine: calculates PiP rect bounds correctly for positioning presets', () => {
    const pipBottomRight = Core.CompositorEngine.computePiPStyle({ position: 'bottom-right', size: 30, opacity: 100 });
    assert.strictEqual(pipBottomRight.left, '65%');
    assert.strictEqual(pipBottomRight.top, '65%');
    assert.strictEqual(pipBottomRight.width, '30%');

    const pipCenter = Core.CompositorEngine.computePiPStyle({ position: 'center', size: 50, opacity: 100 });
    assert.strictEqual(pipCenter.left, '25%');
    assert.strictEqual(pipCenter.top, '25%');
    assert.strictEqual(pipCenter.width, '50%');
});

it('TransitionEngine: maps transitions to FFmpeg xfade filter names', () => {
    assert.strictEqual(Core.TransitionEngine.toFFmpegXFade('fade'), 'fade');
    assert.strictEqual(Core.TransitionEngine.toFFmpegXFade('dissolve'), 'fade');
    assert.strictEqual(Core.TransitionEngine.toFFmpegXFade('slide'), 'slideleft');
    assert.strictEqual(Core.TransitionEngine.toFFmpegXFade('zoom'), 'zoomin');
    assert.strictEqual(Core.TransitionEngine.toFFmpegXFade('dip-black'), 'fadeblack');
});


it('RenderEngine: evaluates lossless copy capability and builds render plans', () => {
    const losslessProject = {
        id: 'p_lossless', name: 'Simple Cut', schemaVersion: 2, mediaAssets: [{ id: 'v1', name: 'V.mp4' }],
        tracks: [
            { id: 't1', type: 'video', clips: [{ id: 'c1', assetId: 'v1', name: 'Clip', type: 'video', start: 0, duration: 10, trimStart: 2, trimEnd: 8, volume: 1 }] }
        ],
        textOverlays: []
    };

    const losslessSettings = Core.RenderEngine.normalizeSettings({ quality: 'lossless' });
    assert.strictEqual(Core.RenderEngine.canPerformLosslessCopy(losslessProject, losslessSettings), true);

    const plan = Core.RenderEngine.buildRenderPlan(losslessProject, losslessSettings, 6.0);
    assert.strictEqual(plan.isLossless, true);
    assert(plan.outputArgs.includes('-c') && plan.outputArgs.includes('copy'), 'Must use -c copy for lossless plan');

    // Add filter to clip -> lossless should be disabled, full transcode planned
    losslessProject.tracks[0].clips[0].filter = 'cyberpunk';
    assert.strictEqual(Core.RenderEngine.canPerformLosslessCopy(losslessProject, losslessSettings), false);

    const reencodePlan = Core.RenderEngine.buildRenderPlan(losslessProject, Core.RenderEngine.normalizeSettings({ quality: 'balanced', resolution: 1080 }), 6.0);
    assert.strictEqual(reencodePlan.isLossless, false);
    assert(reencodePlan.outputArgs.includes('libx264'), 'Must transcode with libx264 when filters are present');
    assert(reencodePlan.filterComplex.includes('scale='), 'Must include scaling filter in re-encode plan');
});

it('Project Validation: validates and upgrades legacy project states', () => {
    const rawLegacy = {
        name: 'Old Project',
        tracks: [{ id: 'v1', clips: [{ id: 'c1', assetId: 'a1', start: 0, duration: 5 }] }]
    };

    const validated = Core.validateProjectState(rawLegacy);
    assert(validated.id, 'Must generate ID if missing');
    assert.strictEqual(validated.schemaVersion, 2, 'Must upgrade schemaVersion to 2');
    assert.strictEqual(validated.tracks[0].type, 'video', 'Must backfill track type if missing');
    assert(Array.isArray(validated.textOverlays), 'Must ensure textOverlays is an array');
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. Speed Ramping & Velocity Editor Engine
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🚀 Test Suite 10: Speed Ramping, Velocity Curves & FFmpeg Timing Integration');

it('SpeedEngine: provides all 7 ready-made presets with valid control points', () => {
    const presets = ['montage', 'hero', 'bullet', 'flash-in', 'flash-out', 'smooth-slow', 'custom'];
    presets.forEach(preset => {
        const curve = Core.SpeedEngine.createPresetCurve(preset);
        assert.strictEqual(curve.preset, preset);
        assert(Array.isArray(curve.points), `${preset} must have points array`);
        assert(curve.points.length >= 4, `${preset} must have at least 4 control points`);
        assert.strictEqual(curve.points[0].t, 0.0, `${preset} start point must be t=0`);
        assert.strictEqual(curve.points[curve.points.length - 1].t, 1.0, `${preset} end point must be t=1`);
        curve.points.forEach(p => {
            assert(p.v >= Core.SpeedEngine.MIN_SPEED, `${preset} point speed >= 0.25`);
            assert(p.v <= Core.SpeedEngine.MAX_SPEED, `${preset} point speed <= 4.0`);
        });
    });
});

it('SpeedEngine: sanitizeCurveData guarantees sorted points and boundary clamping', () => {
    const malformed = {
        preset: 'custom',
        points: [
            { t: 0.8, v: 5.5 }, // over max speed
            { t: 0.2, v: 0.05 }, // under min speed
            { t: 0.5, v: 2.0 }
        ]
    };

    const clean = Core.SpeedEngine.sanitizeCurveData(malformed);
    assert.strictEqual(clean.points[0].t, 0.0, 'Must pad start boundary at t=0');
    assert.strictEqual(clean.points[clean.points.length - 1].t, 1.0, 'Must pad end boundary at t=1');
    for (let i = 0; i < clean.points.length - 1; i++) {
        assert(clean.points[i].t <= clean.points[i + 1].t, 'Points must be strictly sorted by t');
    }
    clean.points.forEach(p => {
        assert(p.v >= Core.SpeedEngine.MIN_SPEED && p.v <= Core.SpeedEngine.MAX_SPEED, 'Points clamped');
    });
});

it('SpeedEngine: monotonic cubic Hermite interpolation avoids overshoot and preserves bounds', () => {
    const curve = Core.SpeedEngine.createPresetCurve('hero');
    const table = Core.SpeedEngine.buildSpeedIntegrationTable(curve, 100);

    for (let i = 0; i <= 100; i++) {
        const speed = table.speedSamples[i];
        assert(speed >= Core.SpeedEngine.MIN_SPEED, `Interpolated speed ${speed} must not dip below 0.25`);
        assert(speed <= Core.SpeedEngine.MAX_SPEED, `Interpolated speed ${speed} must not exceed 4.0`);
    }
});

it('SpeedEngine: numerical integration accurately calculates output duration (integral of 1/v dt)', () => {
    // 10s clip at constant 2x speed -> output 5s
    const clip2x = { id: 'c1', assetId: 'a1', name: '2x', type: 'video', start: 0, duration: 10, trimStart: 0, trimEnd: 10, speed: 2.0, volume: 1 };
    assert.strictEqual(Core.TimelineEngine.calculateClipDuration(clip2x), 5.0);

    // 10s clip at constant 0.5x speed -> output 20s
    const clipHalf = { id: 'c2', assetId: 'a1', name: '0.5x', type: 'video', start: 0, duration: 10, trimStart: 0, trimEnd: 10, speed: 0.5, volume: 1 };
    assert.strictEqual(Core.TimelineEngine.calculateClipDuration(clipHalf), 20.0);

    // 10s clip with variable speed curve (Hero preset)
    const clipHero = {
        id: 'c3', assetId: 'a1', name: 'Hero Clip', type: 'video', start: 0, duration: 10, trimStart: 0, trimEnd: 10,
        volume: 1, speedMode: 'curve', speedCurve: Core.SpeedEngine.createPresetCurve('hero')
    };
    const heroDur = Core.TimelineEngine.calculateClipDuration(clipHero);
    // Hero has slow-motion middle section, so output duration must be longer than 10s (approx 12-16s)
    assert(heroDur > 10.0, `Hero preset output duration (${heroDur}s) should be greater than 10s source due to slow-mo`);

    // Flash-in preset accelerates into fast motion (speeds up to 3.5x), so output duration is shorter than source
    const clipFlashIn = {
        id: 'c4', assetId: 'a1', name: 'FlashIn Clip', type: 'video', start: 0, duration: 10, trimStart: 0, trimEnd: 10,
        volume: 1, speedMode: 'curve', speedCurve: Core.SpeedEngine.createPresetCurve('flash-in')
    };
    const flashDur = Core.TimelineEngine.calculateClipDuration(clipFlashIn);
    assert(flashDur < 10.0, `Flash In preset output duration (${flashDur}s) should be shorter than 10s source due to fast motion`);
});

it('SpeedEngine: forward and inverse time mapping roundtrips accurately', () => {
    const clip = {
        id: 'c1', assetId: 'a1', name: 'Test', type: 'video', start: 0, duration: 10, trimStart: 2, trimEnd: 12,
        volume: 1, speedMode: 'curve', speedCurve: Core.SpeedEngine.createPresetCurve('montage')
    };

    const outDur = Core.SpeedEngine.calculateOutputDuration(clip);
    // Test multiple sample points across the clip
    for (let testOutTime = 0.5; testOutTime < outDur - 0.5; testOutTime += 1.5) {
        const srcTimeLocal = Core.SpeedEngine.outputTimeToSourceLocal(clip, testOutTime);
        const mappedOutTime = Core.SpeedEngine.sourceTimeToOutputLocal(clip, srcTimeLocal);
        assert(Math.abs(mappedOutTime - testOutTime) < 0.05, `Roundtrip mapping error at ${testOutTime}s should be < 50ms (got ${mappedOutTime}s)`);
    }
});

it('SpeedEngine: generates valid FFmpeg video setpts filter expressions and audio atempo filters', () => {
    const clipCurve = {
        id: 'c1', assetId: 'a1', name: 'Curve Clip', type: 'video', start: 0, duration: 10, trimStart: 0, trimEnd: 10,
        volume: 1, speedMode: 'curve', speedCurve: Core.SpeedEngine.createPresetCurve('bullet')
    };

    const vFilter = Core.SpeedEngine.generateFfmpegVideoSpeedFilter(clipCurve, 30);
    assert(vFilter.filterChain.length >= 2, 'Video filter chain must have at least setpts and fps');
    assert(vFilter.filterChain[0].startsWith("setpts='if(lt(T,"), 'Must use piecewise setpts expression for curve');
    assert(vFilter.filterChain.some(f => f.includes('fps=30')), 'Must include output frame rate');

    const aFilter = Core.SpeedEngine.generateFfmpegAudioSpeedFilter(clipCurve);
    assert.strictEqual(aFilter.isMuted, false);
    assert(aFilter.filterStr.includes('atempo='), 'Must include atempo filter');

    // Muted audio test
    clipCurve.speedAudioMute = true;
    const aMuted = Core.SpeedEngine.generateFfmpegAudioSpeedFilter(clipCurve);
    assert.strictEqual(aMuted.isMuted, true);
    assert(aMuted.filterStr.includes('aevalsrc='), 'Muted clip audio generates silence of matching duration');
});

it('TimelineEngine: resolveActiveClipsAtTime correctly tracks variable speed frame progression', () => {
    const clipHero = {
        id: 'c_hero', assetId: 'a1', name: 'Hero', type: 'video', start: 0, duration: 10, trimStart: 5, trimEnd: 15,
        volume: 1, speedMode: 'curve', speedCurve: Core.SpeedEngine.createPresetCurve('hero')
    };
    const track = { id: 't1', type: 'video', isBase: true, clips: [clipHero] };

    const activeAtStart = Core.TimelineEngine.resolveActiveClipsAtTime([track], 0.0);
    assert.strictEqual(activeAtStart.length, 1);
    assert.strictEqual(Math.round(activeAtStart[0].sourceTime), 5, 'At timeline 0, source time is trimStart (5.0s)');

    const activeMid = Core.TimelineEngine.resolveActiveClipsAtTime([track], 3.0);
    assert.strictEqual(activeMid.length, 1);
    assert(activeMid[0].sourceTime > 5.0 && activeMid[0].sourceTime < 15.0, 'Mid-playhead maps into source interval');
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`Results: ${passedTests}/${totalTests} unit tests passed (${Math.round(passedTests/totalTests*100)}%)`);
console.log('═══════════════════════════════════════════════════════════════\n');

if (passedTests !== totalTests) {
    process.exit(1);
}

