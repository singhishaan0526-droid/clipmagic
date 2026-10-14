/**
 * ==============================================================================
 * CLIP MAGIC — Reusable Asset Library Foundation (Phase 4)
 * ==============================================================================
 * Provides a standardized asset catalog, metadata model, search engine,
 * preview players, licensing tracking, and application handlers for:
 *   - Stickers & Animated Emojis
 *   - Music Tracks (Royalty-free / Synthesized)
 *   - Sound Effects (Whooshes, Pops, Glitches, Impacts)
 *   - Filters & Color Grading Presets
 *   - Text Styles & Subtitle Typography
 *   - Visual Effects (VFX)
 *   - Smart Cut Transitions
 * ==============================================================================
 */

(function (window) {
    'use strict';

    // ──────────────────────────────────────────────────────────────────────────
    // 1. ASSET CATALOG (Curated, Royalty-Free & Native Presets)
    // ──────────────────────────────────────────────────────────────────────────
    const ASSET_CATALOG = [
        // ── Stickers ──
        {
            id: 'cm-stk-fire',
            name: 'Flame Reaction',
            type: 'sticker',
            category: 'Reaction',
            preview: '🔥',
            tags: ['fire', 'flame', 'lit', 'hot', 'reaction', 'trending'],
            license: 'CC0 1.0 Universal (Public Domain)',
            attribution: 'Unicode Consortium / Open Emoji Standard'
        },
        {
            id: 'cm-stk-sparkles',
            name: 'Magic Sparkles',
            type: 'sticker',
            category: 'Graphic',
            preview: '✨',
            tags: ['sparkles', 'magic', 'clean', 'star', 'aesthetic', 'shine'],
            license: 'CC0 1.0 Universal (Public Domain)',
            attribution: 'Unicode Consortium / Open Emoji Standard'
        },
        {
            id: 'cm-stk-lightning',
            name: 'Thunder Zap',
            type: 'sticker',
            category: 'Energy',
            preview: '⚡',
            tags: ['lightning', 'bolt', 'zap', 'electric', 'power', 'fast', 'shock'],
            license: 'CC0 1.0 Universal (Public Domain)',
            attribution: 'Unicode Consortium / Open Emoji Standard'
        },
        {
            id: 'cm-stk-heart',
            name: 'Neon Heart',
            type: 'sticker',
            category: 'Reaction',
            preview: '❤️',
            tags: ['heart', 'love', 'romance', 'like', 'red', 'cute'],
            license: 'CC0 1.0 Universal (Public Domain)',
            attribution: 'Unicode Consortium / Open Emoji Standard'
        },
        {
            id: 'cm-stk-rocket',
            name: 'Rocket Boost',
            type: 'sticker',
            category: 'Motion',
            preview: '🚀',
            tags: ['rocket', 'boost', 'launch', 'speed', 'up', 'moon', 'space'],
            license: 'CC0 1.0 Universal (Public Domain)',
            attribution: 'Unicode Consortium / Open Emoji Standard'
        },
        {
            id: 'cm-stk-party',
            name: 'Party Popper',
            type: 'sticker',
            category: 'Celebration',
            preview: '🎉',
            tags: ['party', 'celebrate', 'win', 'yay', 'popper', 'confetti'],
            license: 'CC0 1.0 Universal (Public Domain)',
            attribution: 'Unicode Consortium / Open Emoji Standard'
        },
        {
            id: 'cm-stk-100',
            name: 'Hundred Points',
            type: 'sticker',
            category: 'Reaction',
            preview: '💯',
            tags: ['100', 'hundred', 'perfect', 'score', 'viral', 'top'],
            license: 'CC0 1.0 Universal (Public Domain)',
            attribution: 'Unicode Consortium / Open Emoji Standard'
        },
        {
            id: 'cm-stk-thumbsup',
            name: 'Thumbs Up',
            type: 'sticker',
            category: 'Reaction',
            preview: '👍',
            tags: ['thumbs', 'up', 'yes', 'agree', 'approve', 'like', 'good'],
            license: 'CC0 1.0 Universal (Public Domain)',
            attribution: 'Unicode Consortium / Open Emoji Standard'
        },

        // ── Music Tracks ──
        {
            id: 'cm-mus-lofi',
            name: 'Lofi Sunset Chill',
            type: 'music',
            category: 'Chill',
            duration: 8.0,
            previewType: 'synth-lofi',
            tags: ['lofi', 'chill', 'sunset', 'relax', 'study', 'calm', 'ambient'],
            license: 'CC0 Royalty-Free (Built-in Audio Generator)',
            attribution: 'Clip Magic Audio Engine Synthesis'
        },
        {
            id: 'cm-mus-cyber',
            name: 'Cyber Neon Synth',
            type: 'music',
            category: 'Electronic',
            duration: 6.0,
            previewType: 'synth-cyber',
            tags: ['synth', 'cyber', 'neon', '80s', 'dance', 'electronic', 'energy'],
            license: 'CC0 Royalty-Free (Built-in Audio Generator)',
            attribution: 'Clip Magic Audio Engine Synthesis'
        },
        {
            id: 'cm-mus-hiphop',
            name: 'Urban Boom Bap',
            type: 'music',
            category: 'Hip-Hop',
            duration: 8.0,
            previewType: 'synth-hiphop',
            tags: ['hiphop', 'boom', 'bap', 'drums', 'street', 'rhythm', 'beat'],
            license: 'CC0 Royalty-Free (Built-in Audio Generator)',
            attribution: 'Clip Magic Audio Engine Synthesis'
        },

        // ── Sound Effects (SFX) ──
        {
            id: 'cm-sfx-whoosh',
            name: 'Air Swipe Whoosh',
            type: 'sfx',
            category: 'Transition',
            duration: 0.7,
            previewType: 'synth-whoosh',
            tags: ['whoosh', 'swoosh', 'swipe', 'fast', 'air', 'fly', 'cut'],
            license: 'CC0 Royalty-Free (Built-in Web Audio Generator)',
            attribution: 'Clip Magic Audio Synthesizer'
        },
        {
            id: 'cm-sfx-pop',
            name: 'Bubble Snap Pop',
            type: 'sfx',
            category: 'Foley',
            duration: 0.35,
            previewType: 'synth-pop',
            tags: ['pop', 'bubble', 'snap', 'click', 'cute', 'cartoon'],
            license: 'CC0 Royalty-Free (Built-in Web Audio Generator)',
            attribution: 'Clip Magic Audio Synthesizer'
        },
        {
            id: 'cm-sfx-glitch',
            name: 'Cyber Glitch Zap',
            type: 'sfx',
            category: 'Sci-Fi',
            duration: 0.6,
            previewType: 'synth-glitch',
            tags: ['glitch', 'static', 'cyber', 'sci-fi', 'noise', 'zap', 'digital'],
            license: 'CC0 Royalty-Free (Built-in Web Audio Generator)',
            attribution: 'Clip Magic Audio Synthesizer'
        },
        {
            id: 'cm-sfx-impact',
            name: 'Sub Bass Impact',
            type: 'sfx',
            category: 'Impact',
            duration: 1.2,
            previewType: 'synth-impact',
            tags: ['impact', 'sub', 'bass', 'boom', 'thud', 'drop', 'cinematic'],
            license: 'CC0 Royalty-Free (Built-in Web Audio Generator)',
            attribution: 'Clip Magic Audio Synthesizer'
        },

        // ── Filters & Color Presets ──
        {
            id: 'cm-flt-vivid',
            name: 'Vivid Vibrance',
            type: 'filter',
            category: 'Stylized',
            filterVal: 'vivid',
            preview: '🌟',
            previewColor: 'linear-gradient(135deg, #f59e0b, #ec4899)',
            tags: ['vivid', 'bright', 'saturated', 'punchy', 'pop', 'colorful'],
            license: 'Clip Magic Native Preset',
            attribution: 'Clip Magic Creative Lab'
        },
        {
            id: 'cm-flt-cinema',
            name: 'Teal & Orange Cinema',
            type: 'filter',
            category: 'Cinematic',
            filterVal: 'cinematic',
            preview: '🎬',
            previewColor: 'linear-gradient(135deg, #06b6d4, #f97316)',
            tags: ['cinema', 'teal', 'orange', 'film', 'hollywood', 'dramatic'],
            license: 'Clip Magic Native Preset',
            attribution: 'Clip Magic Creative Lab'
        },
        {
            id: 'cm-flt-warm',
            name: 'Sunset Glow Warm',
            type: 'filter',
            category: 'Warm',
            filterVal: 'warm',
            preview: '🔥',
            previewColor: 'linear-gradient(135deg, #f97316, #ef4444)',
            tags: ['warm', 'sunset', 'golden', 'summer', 'heat', 'cozy'],
            license: 'Clip Magic Native Preset',
            attribution: 'Clip Magic Creative Lab'
        },
        {
            id: 'cm-flt-cool',
            name: 'Nordic Frost Cool',
            type: 'filter',
            category: 'Cool',
            filterVal: 'cool',
            preview: '❄️',
            previewColor: 'linear-gradient(135deg, #38bdf8, #6366f1)',
            tags: ['cool', 'frost', 'blue', 'cold', 'clean', 'nordic'],
            license: 'Clip Magic Native Preset',
            attribution: 'Clip Magic Creative Lab'
        },
        {
            id: 'cm-flt-bw',
            name: 'Noir Film B&W',
            type: 'filter',
            category: 'Monochrome',
            filterVal: 'bw',
            preview: '🏁',
            previewColor: 'linear-gradient(135deg, #27272a, #e4e4e7)',
            tags: ['bw', 'monochrome', 'black', 'white', 'noir', 'retro', 'classic'],
            license: 'Clip Magic Native Preset',
            attribution: 'Clip Magic Creative Lab'
        },

        // ── Text & Typography Styles ──
        {
            id: 'cm-txt-gradient',
            name: 'Candy Gradient',
            type: 'text-style',
            category: 'Gradient',
            styleVal: 'gradient',
            colorA: '#f472b6',
            colorB: '#38bdf8',
            tags: ['gradient', 'pink', 'blue', 'cotton', 'candy', 'karaoke', 'modern'],
            license: 'Clip Magic Native Preset',
            attribution: 'Clip Magic Typography'
        },
        {
            id: 'cm-txt-neon',
            name: 'Cyberpunk Neon',
            type: 'text-style',
            category: 'Neon',
            styleVal: 'neon',
            colorA: '#22c55e',
            colorB: '#06b6d4',
            tags: ['neon', 'cyber', 'green', 'cyan', 'glow', 'electric', 'bold'],
            license: 'Clip Magic Native Preset',
            attribution: 'Clip Magic Typography'
        },
        {
            id: 'cm-txt-box',
            name: 'TikTok Subtitle Box',
            type: 'text-style',
            category: 'Social',
            styleVal: 'box',
            colorA: '#09090b',
            colorB: '#ffffff',
            tags: ['box', 'tiktok', 'reels', 'captions', 'subtitles', 'viral'],
            license: 'Clip Magic Native Preset',
            attribution: 'Clip Magic Typography'
        },
        {
            id: 'cm-txt-luxury',
            name: 'Royal Gold Luxury',
            type: 'text-style',
            category: 'Luxury',
            styleVal: 'luxury',
            colorA: '#facc15',
            colorB: '#ea580c',
            tags: ['luxury', 'gold', 'royal', 'class', 'amber', 'premium'],
            license: 'Clip Magic Native Preset',
            attribution: 'Clip Magic Typography'
        },
        {
            id: 'cm-txt-flame',
            name: 'Heat Flame',
            type: 'text-style',
            category: 'Energy',
            styleVal: 'flame',
            colorA: '#fbbf24',
            colorB: '#f43f5e',
            tags: ['flame', 'heat', 'fire', 'red', 'yellow', 'intense'],
            license: 'Clip Magic Native Preset',
            attribution: 'Clip Magic Typography'
        },

        // ── Visual Effects (VFX) ──
        {
            id: 'cm-vfx-glitch',
            name: 'RGB Chromatic Glitch',
            type: 'vfx',
            category: 'Distortion',
            vfxVal: 'glitch',
            intensity: 65,
            preview: '⚡',
            tags: ['glitch', 'rgb', 'chromatic', 'distortion', 'cyberpunk', 'shake'],
            license: 'Clip Magic Native VFX Shader',
            attribution: 'Clip Magic VFX Lab'
        },
        {
            id: 'cm-vfx-blur',
            name: 'Cinematic Dream Blur',
            type: 'vfx',
            category: 'Focus',
            vfxVal: 'blur',
            intensity: 45,
            preview: '🌫️',
            tags: ['blur', 'dream', 'focus', 'soft', 'bokeh', 'diffuse'],
            license: 'Clip Magic Native VFX Shader',
            attribution: 'Clip Magic VFX Lab'
        },
        {
            id: 'cm-vfx-shake',
            name: 'Action Camera Quake',
            type: 'vfx',
            category: 'Motion',
            vfxVal: 'shake',
            intensity: 60,
            preview: '💥',
            tags: ['shake', 'quake', 'tremor', 'action', 'impact', 'cam'],
            license: 'Clip Magic Native VFX Shader',
            attribution: 'Clip Magic VFX Lab'
        },

        // ── Smart Transitions ──
        {
            id: 'cm-trn-dissolve',
            name: 'Soft Cross-Dissolve',
            type: 'transition',
            category: 'Basic',
            transVal: 'dissolve',
            duration: 0.5,
            preview: '🌫️',
            tags: ['dissolve', 'fade', 'crossfade', 'smooth', 'blend', 'cut'],
            license: 'Clip Magic Smart Transition Engine',
            attribution: 'Clip Magic Motion Core'
        },
        {
            id: 'cm-trn-fade-black',
            name: 'Dip Through Black',
            type: 'transition',
            category: 'Basic',
            transVal: 'fade-black',
            duration: 0.5,
            preview: '🌘',
            tags: ['black', 'dip', 'fade', 'dark', 'cinema', 'scene'],
            license: 'Clip Magic Smart Transition Engine',
            attribution: 'Clip Magic Motion Core'
        },
        {
            id: 'cm-trn-slide-left',
            name: 'Push Slide Left',
            type: 'transition',
            category: 'Motion',
            transVal: 'slide-left',
            duration: 0.5,
            preview: '⬅️',
            tags: ['slide', 'left', 'push', 'wipe', 'swipe', 'motion'],
            license: 'Clip Magic Smart Transition Engine',
            attribution: 'Clip Magic Motion Core'
        },
        {
            id: 'cm-trn-zoom-in',
            name: 'Vortex Zoom In',
            type: 'transition',
            category: 'Motion',
            transVal: 'zoom-in',
            duration: 0.5,
            preview: '🔍',
            tags: ['zoom', 'in', 'vortex', 'punch', 'dynamic', 'scale'],
            license: 'Clip Magic Smart Transition Engine',
            attribution: 'Clip Magic Motion Core'
        },
        {
            id: 'cm-trn-spin',
            name: 'Roll 360° Spin',
            type: 'transition',
            category: 'Stylish',
            transVal: 'spin',
            duration: 0.6,
            preview: '🌀',
            tags: ['spin', 'roll', '360', 'rotate', 'stylish', 'action'],
            license: 'Clip Magic Smart Transition Engine',
            attribution: 'Clip Magic Motion Core'
        },
        {
            id: 'cm-trn-motion-blur',
            name: 'Directional Speed Blur',
            type: 'transition',
            category: 'Stylish',
            transVal: 'motion-blur',
            duration: 0.5,
            preview: '💨',
            tags: ['blur', 'speed', 'motion', 'whip', 'swipe', 'fast'],
            license: 'Clip Magic Smart Transition Engine',
            attribution: 'Clip Magic Motion Core'
        },
        {
            id: 'cm-trn-wipe',
            name: 'Linear Wipe Sweep',
            type: 'transition',
            category: 'Stylish',
            transVal: 'wipe',
            duration: 0.5,
            preview: '↔️',
            tags: ['wipe', 'sweep', 'linear', 'reveal', 'clean'],
            license: 'Clip Magic Smart Transition Engine',
            attribution: 'Clip Magic Motion Core'
        }
    ];

    // Filter Pack (filters-pack.js) — same ids drive preview, export and this library.
    if (window.ClipFilterPack) {
        const tintOf = f => (f.layers.find(l => l.t === 'tint') || {}).color || '#64748b';
        window.ClipFilterPack.FILTERS.forEach(f => ASSET_CATALOG.push({
            id: `cm-flt-${f.id}`,
            name: f.name,
            type: 'filter',
            category: 'Stylized',
            filterVal: f.id,
            preview: '🎨',
            previewColor: `linear-gradient(135deg, ${tintOf(f)}, #0f172a)`,
            tags: ['filter', 'instagram', 'look', ...f.id.split('-')],
            license: 'Clip Magic Native Preset',
            attribution: 'Clip Magic Creative Lab'
        }));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. FAVORITES & RECENTS PERSISTENCE
    // ──────────────────────────────────────────────────────────────────────────
    const STORAGE_KEY_FAVS = 'cm-favorite-assets';
    const STORAGE_KEY_RECENTS = 'cm-recent-assets';

    function getStoredFavorites() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY_FAVS) || '[]');
        } catch (_) {
            return [];
        }
    }

    function saveStoredFavorites(favs) {
        localStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(favs));
    }

    function getStoredRecents() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY_RECENTS) || '[]');
        } catch (_) {
            return [];
        }
    }

    function addStoredRecent(id) {
        let recents = getStoredRecents().filter(item => item !== id);
        recents.unshift(id);
        if (recents.length > 20) recents = recents.slice(0, 20);
        localStorage.setItem(STORAGE_KEY_RECENTS, JSON.stringify(recents));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. AUDIO PREVIEW & SYNTHESIS ENGINE (Zero external dependencies)
    // ──────────────────────────────────────────────────────────────────────────
    let previewAudioCtx = null;
    let activePreviewSource = null;

    function getAudioContext() {
        if (!previewAudioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) previewAudioCtx = new AudioCtx();
        }
        if (previewAudioCtx && previewAudioCtx.state === 'suspended') {
            previewAudioCtx.resume().catch(() => {});
        }
        return previewAudioCtx;
    }

    function stopActiveAudioPreview() {
        if (activePreviewSource) {
            try { activePreviewSource.stop(); } catch (_) {}
            try { activePreviewSource.disconnect(); } catch (_) {}
            activePreviewSource = null;
        }
    }

    /**
     * Synthesizes audio waveforms directly into Web Audio buffers
     */
    function playSynthesizedPreview(previewType) {
        stopActiveAudioPreview();
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const out = ctx.createGain();
        out.gain.setValueAtTime(0.35, now);
        out.connect(ctx.destination);

        if (previewType === 'synth-whoosh') {
            const bufferSize = ctx.sampleRate * 0.7;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.8;

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(200, now);
            filter.frequency.exponentialRampToValueAtTime(3200, now + 0.35);
            filter.frequency.exponentialRampToValueAtTime(300, now + 0.7);
            filter.Q.value = 3.0;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.exponentialRampToValueAtTime(0.7, now + 0.35);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(out);
            noise.start(now);
            noise.stop(now + 0.7);
            activePreviewSource = noise;
        } else if (previewType === 'synth-pop') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
            gain.gain.setValueAtTime(0.8, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            osc.connect(gain);
            gain.connect(out);
            osc.start(now);
            osc.stop(now + 0.25);
            activePreviewSource = osc;
        } else if (previewType === 'synth-impact') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(32, now + 0.6);
            gain.gain.setValueAtTime(1.0, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

            osc.connect(gain);
            gain.connect(out);
            osc.start(now);
            osc.stop(now + 1.2);
            activePreviewSource = osc;
        } else if (previewType === 'synth-glitch') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            for (let i = 0; i < 6; i++) {
                osc.frequency.setValueAtTime(200 + Math.random() * 2400, now + (i * 0.08));
            }
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

            osc.connect(gain);
            gain.connect(out);
            osc.start(now);
            osc.stop(now + 0.55);
            activePreviewSource = osc;
        } else if (previewType.startsWith('synth-')) {
            const chords = previewType === 'synth-lofi'
                ? [261.63, 329.63, 392.00, 523.25]
                : previewType === 'synth-cyber'
                ? [220.00, 277.18, 329.63, 440.00]
                : [174.61, 220.00, 261.63, 349.23];

            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.3, now);
            masterGain.connect(out);

            chords.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const noteGain = ctx.createGain();
                osc.type = previewType === 'synth-cyber' ? 'sawtooth' : 'sine';
                osc.frequency.setValueAtTime(freq, now + (idx * 0.15));
                noteGain.gain.setValueAtTime(0.01, now + (idx * 0.15));
                noteGain.gain.linearRampToValueAtTime(0.2, now + (idx * 0.15) + 0.05);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

                osc.connect(noteGain);
                noteGain.connect(masterGain);
                osc.start(now + (idx * 0.15));
                osc.stop(now + 2.8);
            });
            activePreviewSource = masterGain;
        }
    }

    /**
     * Creates an actual AudioBuffer and Blob for saving into project tracks
     */
    async function generateAssetAudioBlob(asset) {
        const ctx = getAudioContext();
        if (!ctx) return null;

        const dur = asset.duration || (asset.type === 'sfx' ? 1.0 : 6.0);
        const sampleRate = 44100;
        const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, sampleRate * dur, sampleRate);

        const out = offlineCtx.createGain();
        out.gain.setValueAtTime(0.7, 0);
        out.connect(offlineCtx.destination);

        if (asset.previewType === 'synth-whoosh') {
            const buffer = offlineCtx.createBuffer(1, sampleRate * dur, sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.8;
            const noise = offlineCtx.createBufferSource();
            noise.buffer = buffer;
            const filter = offlineCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(200, 0);
            filter.frequency.exponentialRampToValueAtTime(3200, 0.35);
            filter.frequency.exponentialRampToValueAtTime(300, 0.7);
            filter.Q.value = 3.0;

            const gain = offlineCtx.createGain();
            gain.gain.setValueAtTime(0.01, 0);
            gain.gain.exponentialRampToValueAtTime(0.8, 0.35);
            gain.gain.exponentialRampToValueAtTime(0.001, dur);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(out);
            noise.start(0);
        } else if (asset.previewType === 'synth-impact') {
            const osc = offlineCtx.createOscillator();
            const gain = offlineCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(140, 0);
            osc.frequency.exponentialRampToValueAtTime(30, dur);
            gain.gain.setValueAtTime(1.0, 0);
            gain.gain.exponentialRampToValueAtTime(0.001, dur);
            osc.connect(gain);
            gain.connect(out);
            osc.start(0);
        } else {
            const notes = [220, 261.63, 329.63, 392, 440, 523.25];
            const steps = Math.floor(dur / 0.5);
            for (let step = 0; step < steps; step++) {
                const noteTime = step * 0.5;
                const freq = notes[step % notes.length];
                const osc = offlineCtx.createOscillator();
                const noteGain = offlineCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, noteTime);
                noteGain.gain.setValueAtTime(0.01, noteTime);
                noteGain.gain.linearRampToValueAtTime(0.3, noteTime + 0.05);
                noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);
                osc.connect(noteGain);
                noteGain.connect(out);
                osc.start(noteTime);
                osc.stop(noteTime + 0.48);
            }
        }

        const renderedBuffer = await offlineCtx.startRendering();
        return audioBufferToWavBlob(renderedBuffer);
    }

    function audioBufferToWavBlob(buffer) {
        const numOfChan = buffer.numberOfChannels;
        const length = buffer.length * numOfChan * 2 + 44;
        const out = new DataView(new ArrayBuffer(length));
        const channels = [];
        let sample = 0;
        let offset = 0;
        let pos = 0;

        function setUint16(data) { out.setUint16(pos, data, true); pos += 2; }
        function setUint32(data) { out.setUint32(pos, data, true); pos += 4; }

        setUint32(0x46464952); // "RIFF"
        setUint32(length - 8);
        setUint32(0x45564157); // "WAVE"
        setUint32(0x20746d66); // "fmt "
        setUint32(16);
        setUint16(1); // PCM
        setUint16(numOfChan);
        setUint32(buffer.sampleRate);
        setUint32(buffer.sampleRate * 2 * numOfChan);
        setUint16(numOfChan * 2);
        setUint16(16);
        setUint32(0x61746164); // "data"
        setUint32(length - pos - 4);

        for (let i = 0; i < buffer.numberOfChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }

        while (offset < buffer.length) {
            for (let i = 0; i < numOfChan; i++) {
                sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
                out.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }

        return new Blob([out.buffer], { type: 'audio/wav' });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. ASSET LIBRARY ENGINE API
    // ──────────────────────────────────────────────────────────────────────────
    const AssetLibrary = {
        getAll() {
            const favs = new Set(getStoredFavorites());
            return ASSET_CATALOG.map(a => ({
                ...a,
                isFavorite: favs.has(a.id)
            }));
        },

        getById(id) {
            const asset = ASSET_CATALOG.find(a => a.id === id);
            if (!asset) return null;
            return {
                ...asset,
                isFavorite: getStoredFavorites().includes(id)
            };
        },

        search({ query = '', category = 'all', onlyFavorites = false } = {}) {
            const q = query.trim().toLowerCase();
            const favs = new Set(getStoredFavorites());

            return ASSET_CATALOG.filter(a => {
                if (category !== 'all' && a.type !== category) {
                    return false;
                }
                if (onlyFavorites && !favs.has(a.id)) {
                    return false;
                }
                if (q) {
                    const inName = a.name.toLowerCase().includes(q);
                    const inCat = (a.category || '').toLowerCase().includes(q);
                    const inType = a.type.toLowerCase().includes(q);
                    const inTags = Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(q));
                    return inName || inCat || inType || inTags;
                }
                return true;
            }).map(a => ({
                ...a,
                isFavorite: favs.has(a.id)
            }));
        },

        toggleFavorite(id) {
            let favs = getStoredFavorites();
            if (favs.includes(id)) {
                favs = favs.filter(f => f !== id);
            } else {
                favs.push(id);
            }
            saveStoredFavorites(favs);
            return favs.includes(id);
        },

        isFavorite(id) {
            return getStoredFavorites().includes(id);
        },

        getRecents() {
            const recents = getStoredRecents();
            return recents.map(id => this.getById(id)).filter(Boolean);
        },

        previewAudio(asset) {
            if (asset.previewType) {
                playSynthesizedPreview(asset.previewType);
            }
        },

        stopPreview() {
            stopActiveAudioPreview();
        },

        async applyAsset(asset) {
            if (!asset) return;
            addStoredRecent(asset.id);

            if (asset.type === 'sticker') {
                if (typeof window.addStickerOverlay === 'function') {
                    window.addStickerOverlay(asset.preview, asset.name);
                }
            } else if (asset.type === 'music' || asset.type === 'sfx') {
                if (typeof window.showToast === 'function') {
                    window.showToast(`Loading ${asset.name}...`, '⏳', 'info');
                }
                const wavBlob = await generateAssetAudioBlob(asset);
                if (wavBlob) {
                    if (typeof window.importAudioFile === 'function') {
                        const file = new File([wavBlob], `${asset.name}.wav`, { type: 'audio/wav' });
                        await window.importAudioFile(file);
                    } else if (window.projectState) {
                        const projectId = typeof window.getReliableProjectId === 'function' ? window.getReliableProjectId() : 'proj-active';
                        const assetId = `asset-lib-${asset.id}-${Date.now()}`;
                        const service = window.ProjectService || (typeof ProjectService !== 'undefined' ? ProjectService : null);
                        if (service && service.saveAsset) {
                            try { await service.saveAsset(projectId, assetId, wavBlob); } catch (_) {}
                        }

                        let audioTrack = window.projectState.tracks.find(t => t.type === 'audio');
                        if (!audioTrack) {
                            audioTrack = { id: `track-audio-${Date.now()}`, type: 'audio', name: 'Audio 1', clips: [] };
                            window.projectState.tracks.push(audioTrack);
                        }

                        if (typeof window.recordEdit === 'function') window.recordEdit();

                        const now = typeof window.getCurrentPlaybackTime === 'function' ? window.getCurrentPlaybackTime() : 0;
                        const clipDuration = asset.duration || (asset.type === 'sfx' ? 1.0 : 6.0);
                        const newClip = {
                            id: `clip-aud-${Date.now()}`,
                            assetId,
                            name: asset.name,
                            type: 'audio',
                            start: Number(now.toFixed(2)),
                            duration: clipDuration,
                            trimStart: 0,
                            trimEnd: clipDuration,
                            volume: 0.9,
                            fadeIn: 0.2,
                            fadeOut: 0.4,
                            color: asset.type === 'sfx' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(236, 72, 153, 0.4)',
                            borderColor: asset.type === 'sfx' ? '#38bdf8' : '#ec4899'
                        };

                        audioTrack.clips.push(newClip);
                        if (typeof window.requestTimelineRender === 'function') window.requestTimelineRender();
                        if (typeof window.selectClip === 'function') window.selectClip(newClip);
                        if (typeof window.showToast === 'function') {
                            window.showToast(`🎵 Added "${asset.name}" to timeline!`, '✨', 'success');
                        }
                    }
                }
            } else if (asset.type === 'filter') {
                if (typeof window.applyClipFilter === 'function') {
                    window.applyClipFilter(asset.filterVal);
                    if (typeof window.showToast === 'function') {
                        window.showToast(`Applied ${asset.name} filter!`, '🌟', 'success');
                    }
                }
            } else if (asset.type === 'text-style') {
                if (window.selectedOverlay) {
                    if (typeof window.recordEdit === 'function') window.recordEdit();
                    window.selectedOverlay.style = asset.styleVal;
                    if (asset.colorA) window.selectedOverlay.colorA = asset.colorA;
                    if (asset.colorB) window.selectedOverlay.colorB = asset.colorB;
                    if (typeof window.renderTextOverlays === 'function') window.renderTextOverlays();
                    if (typeof window.selectOverlay === 'function') window.selectOverlay(window.selectedOverlay);
                    if (typeof window.showToast === 'function') {
                        window.showToast(`Applied ${asset.name} style!`, '🎨', 'success');
                    }
                } else if (typeof window.addTextOverlay === 'function') {
                    window.addTextOverlay();
                    if (window.projectState.textOverlays?.length) {
                        const last = window.projectState.textOverlays[window.projectState.textOverlays.length - 1];
                        last.style = asset.styleVal;
                        if (asset.colorA) last.colorA = asset.colorA;
                        if (asset.colorB) last.colorB = asset.colorB;
                        if (typeof window.renderTextOverlays === 'function') window.renderTextOverlays();
                    }
                    if (typeof window.showToast === 'function') {
                        window.showToast(`Added text with ${asset.name}!`, '🎨', 'success');
                    }
                }
            } else if (asset.type === 'vfx') {
                const clip = typeof window.getActiveClip === 'function' ? window.getActiveClip() : window.selectedClip;
                if (clip) {
                    if (typeof window.recordEdit === 'function') window.recordEdit();
                    clip.vfx = { preset: asset.vfxVal, intensity: asset.intensity || 50 };
                    if (typeof window.updatePreviewVisuals === 'function') window.updatePreviewVisuals();
                    if (typeof window.showToast === 'function') {
                        window.showToast(`Applied ${asset.name} VFX!`, '⚡', 'success');
                    }
                } else if (typeof window.showToast === 'function') {
                    window.showToast('Please select a video clip to apply VFX.', '⚠️', 'info');
                }
            } else if (asset.type === 'transition') {
                window.activeTransitionType = asset.transVal;
                const ts = document.getElementById('transitionSelectVal');
                if (ts) ts.value = asset.transVal;
                if (typeof window.selectTransitionCard === 'function') {
                    window.selectTransitionCard(asset.transVal);
                }
                if (typeof window.applyTransitionToActiveCut === 'function') {
                    window.applyTransitionToActiveCut();
                } else if (typeof window.showToast === 'function') {
                    window.showToast(`Selected ${asset.name} transition!`, '✨', 'success');
                }
            }
        },

        stopAudioPreview() {
            stopActiveAudioPreview();
        }
    };

    // ──────────────────────────────────────────────────────────────────────────
    // 5. REUSABLE ASSET LIBRARY UI COMPONENT
    // ──────────────────────────────────────────────────────────────────────────
    let activeFilterCategory = 'all';
    let activeSearchQuery = '';
    let showFavoritesOnly = false;
    let visibleAssetLimit = 24;

    function renderAssetLibraryHTML() {
        return `
            <div class="asset-library-container" style="display:flex;flex-direction:column;height:100%;gap:10px;">
                <!-- Search Bar -->
                <div class="asset-search-row" style="position:relative;display:flex;align-items:center;">
                    <span style="position:absolute;left:10px;font-size:0.85rem;color:var(--text-muted);pointer-events:none;">🔍</span>
                    <label for="assetLibrarySearchInput" class="sr-only">Search assets</label>
                    <input 
                        type="text" 
                        id="assetLibrarySearchInput"
                        class="prop-input asset-library-search-input" 
                        aria-label="Search stickers, music, sfx, filters, styles"
                        placeholder="Search stickers, music, sfx, filters, styles..." 
                        value="${escapeAttr(activeSearchQuery)}"
                        style="padding-left:32px;padding-right:28px;width:100%;border-radius:8px;"
                        oninput="AssetLibraryUI.onSearchInput(this.value)"
                    />
                    <button 
                        class="icon-btn asset-library-clear-btn" 
                        style="position:absolute;right:4px;width:24px;height:24px;font-size:0.75rem;display:${activeSearchQuery ? 'flex' : 'none'};" 
                        onclick="AssetLibraryUI.clearSearch()"
                        title="Clear search"
                        aria-label="Clear asset search"
                    >✕</button>
                </div>

                <!-- Category Filter Pills -->
                <div class="asset-category-tabs" style="display:flex;gap:4px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;">
                    <button class="chip-option ${activeFilterCategory === 'all' && !showFavoritesOnly ? 'active' : ''}" style="white-space:nowrap;font-size:0.72rem;padding:4px 8px;" onclick="AssetLibraryUI.setCategory('all')">All</button>
                    <button class="chip-option ${showFavoritesOnly ? 'active' : ''}" style="white-space:nowrap;font-size:0.72rem;padding:4px 8px;border-color:rgba(234,179,8,0.4);" onclick="AssetLibraryUI.toggleFavoritesOnly()">⭐ Favorites</button>
                    <button class="chip-option ${activeFilterCategory === 'sticker' && !showFavoritesOnly ? 'active' : ''}" style="white-space:nowrap;font-size:0.72rem;padding:4px 8px;" onclick="AssetLibraryUI.setCategory('sticker')">✨ Stickers</button>
                    <button class="chip-option ${activeFilterCategory === 'music' && !showFavoritesOnly ? 'active' : ''}" style="white-space:nowrap;font-size:0.72rem;padding:4px 8px;" onclick="AssetLibraryUI.setCategory('music')">🎵 Music</button>
                    <button class="chip-option ${activeFilterCategory === 'sfx' && !showFavoritesOnly ? 'active' : ''}" style="white-space:nowrap;font-size:0.72rem;padding:4px 8px;" onclick="AssetLibraryUI.setCategory('sfx')">🔊 SFX</button>
                    <button class="chip-option ${activeFilterCategory === 'filter' && !showFavoritesOnly ? 'active' : ''}" style="white-space:nowrap;font-size:0.72rem;padding:4px 8px;" onclick="AssetLibraryUI.setCategory('filter')">🎨 Filters</button>
                    <button class="chip-option ${activeFilterCategory === 'text-style' && !showFavoritesOnly ? 'active' : ''}" style="white-space:nowrap;font-size:0.72rem;padding:4px 8px;" onclick="AssetLibraryUI.setCategory('text-style')">✏️ Text</button>
                    <button class="chip-option ${activeFilterCategory === 'vfx' && !showFavoritesOnly ? 'active' : ''}" style="white-space:nowrap;font-size:0.72rem;padding:4px 8px;" onclick="AssetLibraryUI.setCategory('vfx')">⚡ VFX</button>
                    <button class="chip-option ${activeFilterCategory === 'transition' && !showFavoritesOnly ? 'active' : ''}" style="white-space:nowrap;font-size:0.72rem;padding:4px 8px;" onclick="AssetLibraryUI.setCategory('transition')">↔️ Transitions</button>
                </div>

                <!-- Asset Grid Display -->
                <div class="asset-library-grid" style="flex:1;overflow-y:auto;max-height:480px;display:grid;grid-template-columns:repeat(auto-fill, minmax(135px, 1fr));gap:8px;padding-right:2px;">
                    ${renderAssetCardsHTML()}
                </div>

                <!-- Footer Licensing & Attribution Bar -->
                <div style="padding:6px 8px;background:rgba(255,255,255,0.02);border-radius:6px;border:1px solid rgba(255,255,255,0.06);font-size:0.68rem;color:var(--text-muted);display:flex;justify-content:space-between;align-items:center;">
                    <span>🛡️ License: <strong>100% Royalty-Free & CC0</strong></span>
                    <a href="about.html" target="_blank" style="color:var(--purple);text-decoration:none;">Attributions</a>
                </div>
            </div>
        `;
    }

    function renderAssetCardsHTML() {
        const allMatching = AssetLibrary.search({
            query: activeSearchQuery,
            category: activeFilterCategory,
            onlyFavorites: showFavoritesOnly
        });

        if (!allMatching.length) {
            return `
                <div style="grid-column:1/-1;text-align:center;padding:32px 12px;color:var(--text-muted);">
                    <div style="font-size:2rem;margin-bottom:8px;opacity:0.6;">🔍</div>
                    <div style="font-weight:700;color:var(--text-secondary);margin-bottom:4px;">No Assets Found</div>
                    <p style="font-size:0.75rem;line-height:1.4;margin-bottom:12px;">No items match "${escapeHTML(activeSearchQuery)}". Try searching for 'fire', 'chill', 'whoosh', or 'neon'.</p>
                    <button class="chip-option active" style="padding:6px 14px;font-size:0.75rem;margin:0 auto;" onclick="AssetLibraryUI.clearSearch()">Clear Filters</button>
                </div>
            `;
        }

        const assets = allMatching.slice(0, visibleAssetLimit);
        const hasMore = allMatching.length > visibleAssetLimit;
        const remainingCount = allMatching.length - visibleAssetLimit;

        let cardsHtml = assets.map(asset => {
            const isFav = asset.isFavorite;
            const hasAudioPreview = Boolean(asset.previewType);

            let thumbContent = '';
            if (asset.type === 'sticker') {
                if (typeof asset.preview === 'string' && asset.preview.startsWith('http')) {
                    thumbContent = `<img src="${asset.preview}" loading="lazy" decoding="async" alt="${escapeAttr(asset.name)}" style="max-height:48px;max-width:48px;object-fit:contain;"/>`;
                } else {
                    thumbContent = `<div style="font-size:2rem;line-height:1;">${asset.preview}</div>`;
                }
            } else if (asset.type === 'filter') {
                thumbContent = `<div style="width:36px;height:36px;border-radius:6px;background:${asset.previewColor || '#a855f7'};display:flex;align-items:center;justify-content:center;font-size:1.1rem;">${asset.preview || '🎨'}</div>`;
            } else if (asset.type === 'text-style') {
                thumbContent = `<div style="font-weight:800;font-size:1rem;background:linear-gradient(135deg, ${asset.colorA || '#fff'}, ${asset.colorB || '#a855f7'});-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Aa</div>`;
            } else if (asset.type === 'music' || asset.type === 'sfx') {
                thumbContent = `<div style="font-size:1.6rem;line-height:1;">${asset.type === 'music' ? '🎵' : '🔊'}</div>`;
            } else if (asset.type === 'vfx') {
                thumbContent = `<div style="font-size:1.6rem;line-height:1;">${asset.preview || '⚡'}</div>`;
            } else if (asset.type === 'transition') {
                thumbContent = `<div style="font-size:1.6rem;line-height:1;">${asset.preview || '✨'}</div>`;
            }

            return `
                <div class="asset-card" data-asset-id="${asset.id}" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:8px;display:flex;flex-direction:column;position:relative;transition:all 0.15s ease;">
                    <!-- Top row: Type Tag & Favorite Button -->
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:0.62rem;color:var(--text-muted);text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">${asset.category || asset.type}</span>
                        <button 
                            class="icon-btn" 
                            style="width:20px;height:20px;font-size:0.75rem;color:${isFav ? '#eab308' : 'rgba(255,255,255,0.3)'};border:none;background:transparent;" 
                            onclick="event.stopPropagation(); AssetLibraryUI.toggleFav('${asset.id}')"
                            title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
                            aria-label="${isFav ? 'Remove ' + escapeAttr(asset.name) + ' from favorites' : 'Add ' + escapeAttr(asset.name) + ' to favorites'}"
                        >${isFav ? '★' : '☆'}</button>
                    </div>

                    <!-- Center Preview Thumbnail -->
                    <div style="display:flex;align-items:center;justify-content:center;height:52px;margin-bottom:6px;">
                        ${thumbContent}
                    </div>

                    <!-- Asset Name -->
                    <div style="font-size:0.75rem;font-weight:700;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px;" title="${escapeAttr(asset.name)}">${escapeHTML(asset.name)}</div>
                    <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:8px;">${asset.duration ? asset.duration + 's' : asset.license.split(' ')[0]}</div>

                    <!-- Actions Row -->
                    <div style="display:flex;gap:4px;margin-top:auto;">
                        ${hasAudioPreview ? `
                            <button class="chip-option" style="padding:4px 6px;font-size:0.68rem;" onclick="event.stopPropagation(); AssetLibraryUI.previewSound('${asset.id}')" title="Listen to preview" aria-label="Listen to preview of ${escapeAttr(asset.name)}">▶</button>
                        ` : ''}
                        <button 
                            class="music-btn" 
                            style="flex:1;padding:5px 6px;font-size:0.7rem;font-weight:700;background:var(--gradient-main);color:#fff;" 
                            onclick="AssetLibraryUI.applyItem('${asset.id}')"
                            aria-label="Apply ${escapeAttr(asset.name)}"
                        >＋ Apply</button>
                    </div>
                </div>
            `;
        }).join('');

        if (hasMore) {
            cardsHtml += `
                <div style="grid-column:1/-1;text-align:center;padding:12px 0;">
                    <button class="music-btn" style="padding:8px 18px;font-size:0.75rem;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);color:#f1f5f9;margin:0 auto;" onclick="AssetLibraryUI.loadMore()" aria-label="Load ${remainingCount} more assets">
                        ⬇ Load More (${remainingCount} remaining)
                    </button>
                </div>
            `;
        }

        return cardsHtml;
    }

    function escapeHTML(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function escapeAttr(str) {
        return String(str || '').replace(/"/g, '&quot;');
    }

    const AssetLibraryUI = {
        getHTML() {
            return renderAssetLibraryHTML();
        },

        refreshGrid() {
            const grids = document.querySelectorAll('#assetLibraryGrid, .asset-library-grid');
            grids.forEach(grid => {
                grid.innerHTML = renderAssetCardsHTML();
            });
        },

        onSearchInput(val) {
            activeSearchQuery = val;
            visibleAssetLimit = 24;
            const clearBtns = document.querySelectorAll('#assetLibraryClearBtn, .asset-library-clear-btn');
            clearBtns.forEach(btn => {
                btn.style.display = val ? 'flex' : 'none';
            });
            this.refreshGrid();
        },

        clearSearch() {
            activeSearchQuery = '';
            visibleAssetLimit = 24;
            const inputs = document.querySelectorAll('#assetLibrarySearchInput, .asset-library-search-input');
            inputs.forEach(input => {
                input.value = '';
            });
            const clearBtns = document.querySelectorAll('#assetLibraryClearBtn, .asset-library-clear-btn');
            clearBtns.forEach(btn => {
                btn.style.display = 'none';
            });
            this.refreshGrid();
        },

        setCategory(cat) {
            activeFilterCategory = cat;
            showFavoritesOnly = false;
            visibleAssetLimit = 24;
            this.refreshUI();
        },

        toggleFavoritesOnly() {
            showFavoritesOnly = !showFavoritesOnly;
            visibleAssetLimit = 24;
            this.refreshUI();
        },

        loadMore() {
            visibleAssetLimit += 24;
            this.refreshGrid();
        },

        stopAudio() {
            stopActiveAudioPreview();
        },

        refreshUI() {
            const containers = document.querySelectorAll('.asset-library-container');
            containers.forEach(container => {
                if (container && container.parentElement) {
                    container.parentElement.innerHTML = renderAssetLibraryHTML();
                }
            });
        },

        toggleFav(id) {
            AssetLibrary.toggleFavorite(id);
            this.refreshGrid();
        },

        previewSound(id) {
            const asset = AssetLibrary.getById(id);
            if (asset) {
                AssetLibrary.previewAudio(asset);
            }
        },

        applyItem(id) {
            const asset = AssetLibrary.getById(id);
            if (asset) {
                AssetLibrary.applyAsset(asset);
            }
        }
    };

    // Export to global window
    window.AssetCatalog = ASSET_CATALOG;
    window.AssetLibrary = AssetLibrary;
    window.AssetLibraryUI = AssetLibraryUI;

})(window);
