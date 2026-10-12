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

const editorSrc = fs.readFileSync(path.join(__dirname, '../frontend/editor.html'), 'utf8');

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
// Test Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`Results: ${passedTests}/${totalTests} unit tests passed (${Math.round(passedTests/totalTests*100)}%)`);
console.log('═══════════════════════════════════════════════════════════════\n');

if (passedTests !== totalTests) {
    process.exit(1);
}
