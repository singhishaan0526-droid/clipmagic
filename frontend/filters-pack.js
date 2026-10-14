/*!
 * Clip Magic — Filter Pack (18 Instagram-style filters)
 *
 * One definition per filter drives three outputs so preview and export stay in sync:
 *   1. previewFilter()  -> CSS filter string for #previewVideo
 *   2. syncPreview()    -> DOM overlay (tint / vignette / grain / film strip / light leak,
 *                          plus mirror canvases for glow / ghost / RGB-split / corner PiP)
 *   3. ffmpegStage()    -> filter_complex segments used by ffmpeg-engine.js on export
 *
 * clip.filter = '<id>' and clip.filterAmount = 0..100 (strength, default 100).
 */
(function (root) {
  'use strict';

  const DEFS = [{"id":"toxic-glitch","name":"Toxic Glitch","css":"brightness(.8) contrast(.8) saturate(.7) sepia(.2) hue-rotate(35deg)","layers":[{"t":"tint","color":"#0a6b5a","blend":"soft-light","a":0.45},
  {"t":"split","dx":0.006,"a":0.35},
  {"t":"vignette","s":0.45}]},
  {"id":"low-light","name":"Low Light +","css":"brightness(.84) contrast(.92) saturate(1.05) hue-rotate(-4deg)","layers":[{"t":"tint","color":"#4a5a80","blend":"soft-light","a":0.25}]},
  {"id":"view-hd","name":"View HD","css":"brightness(1.02) contrast(1.06) saturate(1.15)","layers":[]},
  {"id":"aesthetic-brown","name":"AESTHETIC BROWN","css":"brightness(1.1) contrast(.95) saturate(1.4) sepia(.25) hue-rotate(-8deg)","layers":[{"t":"tint","color":"#7a5030","blend":"soft-light","a":0.35},
  {"t":"vignette","s":0.3}]},
  {"id":"black-and-white","name":"Black and White","css":"grayscale(.85) contrast(1.05) brightness(.75)","layers":[]},
  {"id":"4k-ultra","name":"4K Ultra","css":"brightness(.88) contrast(1.18) saturate(1.3)","layers":[]},
  {"id":"glamy","name":"glamy <3","css":"brightness(.74) contrast(.98) saturate(1.5) hue-rotate(6deg)","layers":[{"t":"tint","color":"#ffb070","blend":"soft-light","a":0.2},
  {"t":"glow","blur":8,"a":0.22}]},
  {"id":"natural-skin","name":"natural skin","css":"brightness(.85) contrast(.92) saturate(1.3) sepia(.12)","layers":[{"t":"tint","color":"#ffc8a0","blend":"soft-light","a":0.25}]},
  {"id":"feel-with-reel","name":"Feel with Reel","css":"brightness(1.08) contrast(1.05) saturate(1.2) hue-rotate(8deg)","layers":[{"t":"tint","color":"#7a6bd0","blend":"soft-light","a":0.25},
  {"t":"grain","a":0.22},
  {"t":"vignette","s":0.4},
  {"t":"filmstrip"}]},
  {"id":"bas-a-droite","name":"Bas à droite","css":"brightness(.65) contrast(.75) saturate(.9)","layers":[{"t":"tint","color":"#ffffff","blend":"screen","a":0.3},
  {"t":"pip","size":0.38}]},
  {"id":"fine-tone","name":"Fine Tone","css":"brightness(.98) contrast(.95) saturate(1.4)","layers":[]},
  {"id":"black-ii","name":"Black II","css":"brightness(1.0) contrast(1.05) saturate(.9) hue-rotate(15deg)","layers":[{"t":"tint","color":"#1c2c55","blend":"soft-light","a":0.5},
  {"t":"vignette","s":0.35}]},
  {"id":"iphone-14","name":"iPhone 14","css":"brightness(.96) contrast(1.1) saturate(1.6) hue-rotate(-12deg)","layers":[{"t":"tint","color":"#1a6cff","blend":"soft-light","a":0.25}]},
  {"id":"prism","name":"P r i s m","css":"brightness(.6) contrast(.9) saturate(1.3) hue-rotate(-30deg)","layers":[{"t":"tint","color":"#2aa8b8","blend":"soft-light","a":0.45},
  {"t":"ghost","dx":0.05,"dy":0.03,"scale":1.08,"a":0.3},
  {"t":"leak","a":0.35}]},
  {"id":"vignette","name":"Vignette","css":"brightness(1.0) contrast(1.05) saturate(1.05)","layers":[{"t":"vignette","s":0.42}]},
  {"id":"soft","name":"soft","css":"brightness(.9) contrast(.7) saturate(.8) sepia(.12)","layers":[{"t":"tint","color":"#ffd8d0","blend":"soft-light","a":0.3},
  {"t":"glow","blur":10,"a":0.3}]},
  {"id":"fairy-grunge","name":"- fairy grunge -","css":"brightness(.86) contrast(1.0) saturate(1.1) hue-rotate(-25deg)","layers":[{"t":"tint","color":"#38e0d8","blend":"soft-light","a":0.6},
  {"t":"glow","blur":10,"a":0.3},
  {"t":"grain","a":0.15},
  {"t":"vignette","s":0.35}]},
  {"id":"bliss","name":"Bliss ✨","css":"brightness(.93) contrast(1.2) saturate(1.7) hue-rotate(-8deg)","layers":[{"t":"tint","color":"#00a0ff","blend":"soft-light","a":0.2}]}];

  // Existing built-in filters (handled by editor.html / ffmpeg-engine.js as before).
  const CLASSIC = [
    { id: 'vivid', name: 'Vivid', emoji: '🌟' },
    { id: 'cinematic', name: 'Cinema', emoji: '🎬' },
    { id: 'warm', name: 'Warm', emoji: '🔥' },
    { id: 'cool', name: 'Cool', emoji: '❄' },
    { id: 'bw', name: 'B&W', emoji: '🏁' }
  ];

  // ---- CSS filter string <-> ops --------------------------------------------------
  function parseCss(css) {
    const ops = [], re = /([a-z-]+)\(\s*(-?[\d.]+)(deg)?\s*\)/g;
    let m;
    while ((m = re.exec(css || ''))) ops.push({ f: m[1], v: parseFloat(m[2]) });
    return ops;
  }
  const IDENTITY = { brightness: 1, contrast: 1, saturate: 1, sepia: 0, grayscale: 0, 'hue-rotate': 0 };
  const lerp = (op, k) => ({ f: op.f, v: IDENTITY[op.f] + (op.v - IDENTITY[op.f]) * k });
  const num = n => (+n.toFixed(4)).toString();

  const FILTERS = DEFS.map(d => Object.assign({ ops: parseCss(d.css) }, d));
  const byId = Object.fromEntries(FILTERS.map(f => [f.id, f]));
  byId.none = { id: 'none', name: 'No effect', css: '', layers: [], ops: [] };
  const isPack = id => !!byId[id] && id !== 'none';
  const clampAmt = a => { a = Number(a); return Number.isFinite(a) ? Math.max(0, Math.min(100, a)) / 100 : 1; };
  const nameOf = id => (byId[id] || CLASSIC.find(c => c.id === id) || { name: id }).name;

  function previewFilter(id, amount) {
    const f = byId[id]; if (!f) return '';
    const k = clampAmt(amount);
    return f.ops.map(o => lerp(o, k)).map(o => `${o.f}(${num(o.v)}${o.f === 'hue-rotate' ? 'deg' : ''})`).join(' ');
  }

  // ---- Preview overlay ----------------------------------------------------------------
  let grainUrl = null;
  function grainDataUrl() {
    if (grainUrl) return grainUrl;
    try {
      const c = document.createElement('canvas'); c.width = c.height = 128;
      const g = c.getContext('2d'), d = g.createImageData(128, 128);
      for (let i = 0; i < d.data.length; i += 4) { const v = 100 + Math.random() * 56; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      g.putImageData(d, 0, 0); grainUrl = c.toDataURL();
    } catch (e) { grainUrl = ''; }
    return grainUrl;
  }
  const BLEND = { 'soft-light': 'soft-light', screen: 'screen', overlay: 'overlay', multiply: 'multiply' };
  const abs = (extra) => `position:absolute;pointer-events:none;${extra}`;
  let mirrors = [], raf = 0, mirrorVideo = null;

  function mirrorLoop() {
    raf = mirrors.length ? requestAnimationFrame(mirrorLoop) : 0;
    const v = mirrorVideo;
    if (!v || v.readyState < 2 || !v.videoWidth) return;
    for (const m of mirrors) {
      const c = m.canvas, w = v.videoWidth, h = v.videoHeight;
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      const g = c.getContext('2d'); g.clearRect(0, 0, w, h);
      if (m.kind === 'ghost') {
        const sw = w * m.s, sh = h * m.s;
        g.drawImage(v, w * m.dx - (sw - w) / 2, h * m.dy - (sh - h) / 2, sw, sh);
      } else g.drawImage(v, 0, 0, w, h);
    }
  }

  function clearPreview(screen) {
    const o = screen && screen.querySelector('.cfp-overlay');
    if (o) o.remove();
    mirrors = [];
  }

  function syncPreview(screen, video, id, amount) {
    const f = byId[id];
    if (!screen || !video || !f || !f.layers.length) { clearPreview(screen); return; }
    const k = clampAmt(amount);
    let o = screen.querySelector('.cfp-overlay');
    const key = id + '|' + k;
    if (!o) {
      o = document.createElement('div'); o.className = 'cfp-overlay';
      video.insertAdjacentElement('afterend', o);
    }
    // Match the video's laid-out box (offset* ignores CSS transforms).
    o.style.cssText = abs(`z-index:1;overflow:hidden;left:${video.offsetLeft}px;top:${video.offsetTop}px;` +
      `width:${video.offsetWidth}px;height:${video.offsetHeight}px;display:${video.style.display === 'none' ? 'none' : 'block'};`);
    mirrorVideo = video;
    if (o.dataset.key === key) return;
    o.dataset.key = key; o.innerHTML = ''; mirrors = [];
    const grade = previewFilter(id, amount);
    const add = (style, html = '') => { const d = document.createElement('div'); d.style.cssText = abs(style); d.innerHTML = html; o.appendChild(d); return d; };
    const addCanvas = (style, kind, extra = {}) => {
      const c = document.createElement('canvas'); c.style.cssText = abs(style + 'left:0;top:0;width:100%;height:100%;');
      mirrors.push(Object.assign({ canvas: c, kind }, extra)); return c;
    };
    for (const L of f.layers) {
      const a = (L.a ?? 1) * k;
      if (L.t === 'tint') add(`inset:0;background:${L.color};mix-blend-mode:${BLEND[L.blend] || 'normal'};opacity:${a};`);
      else if (L.t === 'vignette') add(`inset:0;background:radial-gradient(circle farthest-corner at 50% 50%,rgba(0,0,0,0) 35%,rgba(0,0,0,${L.s * k}) 100%);`);
      else if (L.t === 'grain') { const u = grainDataUrl(); if (u) add(`inset:0;background:url(${u});mix-blend-mode:overlay;opacity:${a};`); }
      else if (L.t === 'filmstrip') {
        const s = add(`left:0;top:0;width:8%;height:100%;background:rgba(0,0,0,${.65 * k});display:flex;flex-direction:column;justify-content:space-around;align-items:center;`);
        for (let i = 0; i < 9; i++) { const r = document.createElement('i'); r.style.cssText = `display:block;width:50%;height:4.5%;background:rgba(255,255,255,${.75 * k});`; s.appendChild(r); }
      } else if (L.t === 'leak') add(`inset:0;mix-blend-mode:screen;opacity:${a};background:` +
        'radial-gradient(circle at 85% 90%,rgba(255,190,80,.9),rgba(255,190,80,0) 70%),' +
        'radial-gradient(circle at 10% 10%,rgba(255,80,200,.5),rgba(255,80,200,0) 50%);');
      else if (L.t === 'glow') o.appendChild(addCanvas(`mix-blend-mode:screen;opacity:${a};filter:${grade} blur(${L.blur}px);`, 'glow'));
      else if (L.t === 'ghost') o.appendChild(addCanvas(`mix-blend-mode:screen;opacity:${a};`, 'ghost', { s: L.scale, dx: L.dx, dy: L.dy }));
      else if (L.t === 'pip') {
        const c = addCanvas(`opacity:${k};border:2px solid #fff;box-sizing:border-box;`, 'pip');
        Object.assign(c.style, { left: 'auto', top: 'auto', right: '0', bottom: '0',
          width: (L.size * 100) + '%', height: (L.size * 100) + '%' });
        o.appendChild(c);
      } else if (L.t === 'split') {
        // Red / cyan tinted copies nudged left and right, screened over the picture.
        [['#ff0040', L.dx], ['#00e0ff', -L.dx]].forEach(([col, dx]) => {
          const w = add(`inset:0;isolation:isolate;mix-blend-mode:screen;opacity:${a};transform:translateX(${dx * 100}%);`);
          w.appendChild(addCanvas('', 'split'));
          const t = document.createElement('div');
          t.style.cssText = abs(`inset:0;background:${col};mix-blend-mode:multiply;`); w.appendChild(t);
        });
      }
    }
    if (mirrors.length && !raf) raf = requestAnimationFrame(mirrorLoop);
  }

  // ---- FFmpeg export graph -------------------------------------------------------------
  const MAT_I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const mul = (A, B) => A.map((r, i) => B[0].map((_, j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
  function matrixFor(op) {
    const v = op.v;
    if (op.f === 'saturate') return [[.213 + .787 * v, .715 - .715 * v, .072 - .072 * v], [.213 - .213 * v, .715 + .285 * v, .072 - .072 * v], [.213 - .213 * v, .715 - .715 * v, .072 + .928 * v]];
    if (op.f === 'grayscale') { const t = 1 - v; return [[.2126 + .7874 * t, .7152 - .7152 * t, .0722 - .0722 * t], [.2126 - .2126 * t, .7152 + .2848 * t, .0722 - .0722 * t], [.2126 - .2126 * t, .7152 - .7152 * t, .0722 + .9278 * t]]; }
    if (op.f === 'sepia') { const t = 1 - v; return [[.393 + .607 * t, .769 - .769 * t, .189 - .189 * t], [.349 - .349 * t, .686 + .314 * t, .168 - .168 * t], [.272 - .272 * t, .534 - .534 * t, .131 + .869 * t]]; }
    if (op.f === 'hue-rotate') {
      const r = v * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
      return [[.213 + c * .787 - s * .213, .715 - c * .715 - s * .715, .072 - c * .072 + s * .928],
              [.213 - c * .213 + s * .143, .715 + c * .285 + s * .140, .072 - c * .072 - s * .283],
              [.213 - c * .213 - s * .787, .715 - c * .715 + s * .715, .072 + c * .928 + s * .072]];
    }
    return null;
  }
  const mixer = M => 'colorchannelmixer=' + ['rr', 'rg', 'rb', 'gr', 'gg', 'gb', 'br', 'bg', 'bb']
    .map((k, i) => `${k}=${num(Math.max(-2, Math.min(2, M[(i / 3) | 0][i % 3])))}`).join(':');
  const lut = expr => ['r', 'g', 'b'].map(c => `${c}='${expr}'`).join(':');

  function gradeChain(ops) {
    const out = []; let M = null;
    const flush = () => { if (M) { out.push(mixer(M)); M = null; } };
    for (const op of ops) {
      const m = matrixFor(op);
      if (m) { M = mul(m, M || MAT_I); continue; }
      flush();
      if (op.f === 'brightness' && Math.abs(op.v - 1) > 1e-4) out.push(`lutrgb=${lut(`clip(val*${num(op.v)},0,maxval)`)}`);
      else if (op.f === 'contrast' && Math.abs(op.v - 1) > 1e-4) out.push(`lutrgb=${lut(`clip((val-maxval/2)*${num(op.v)}+maxval/2,0,maxval)`)}`);
    }
    flush();
    return out.join(',');
  }
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const FF_BLEND = { 'soft-light': 'softlight', screen: 'screen', overlay: 'overlay', multiply: 'multiply' };

  /** Returns filter_complex segments turning stream `inL` into `outL` (labels include []). */
  function ffmpegStage(id, amount, inL, outL, uid) {
    const f = byId[id]; if (!f) return null;
    const k = clampAmt(amount), parts = [];
    if (k === 0) return [`${inL}null${outL}`]; // strength 0 = untouched
    let n = 0; const lab = () => `[cf${uid}_${n++}]`;
    const rawUsers = f.layers.filter(L => L.t === 'pip' || L.t === 'ghost');
    let cur = inL, raws = [];
    if (rawUsers.length) {
      const g = lab(); raws = rawUsers.map(lab);
      parts.push(`${cur}split=${1 + raws.length}${g}${raws.join('')}`); cur = g;
    }
    const chain = gradeChain(f.ops.map(o => lerp(o, k)));
    if (chain) { const nx = lab(); parts.push(`${cur}${chain}${nx}`); cur = nx; }
    const blendWith = (srcChain, mode, opacity) => {
      const a = lab(), b = lab(), c = lab(), nx = lab();
      parts.push(`${cur}split=2${a}${b}`, `${b}${srcChain}${c}`, `${a}${c}blend=all_mode=${mode}:all_opacity=${num(opacity)}${nx}`);
      cur = nx;
    };
    for (const L of f.layers) {
      const a = (L.a ?? 1) * k;
      if (a <= 0 && !['vignette', 'filmstrip', 'pip', 'ghost'].includes(L.t)) continue;
      if (L.t === 'tint') { const [r, g, b] = hexRgb(L.color); blendWith(`lutrgb=r=${r}:g=${g}:b=${b}`, FF_BLEND[L.blend] || 'normal', a); }
      else if (L.t === 'vignette') {
        // ffmpeg vignette: corner brightness = cos(angle)^4, so pick the angle that gives the
        // same corner falloff as the CSS gradient (black at strength s).
        const s = Math.min(1, L.s * k);
        if (s > 0.02) { const nx = lab(); parts.push(`${cur}vignette=angle=${num(Math.acos(Math.pow(1 - 0.9 * s, 0.25)))}:mode=forward${nx}`); cur = nx; }
      } else if (L.t === 'grain') { const nx = lab(); parts.push(`${cur}noise=alls=${Math.round(a * 70)}:allf=t${nx}`); cur = nx; }
      else if (L.t === 'split') blendWith('rgbashift=rh=5:bh=-5', 'normal', Math.min(1, a * 1.4));
      else if (L.t === 'glow') blendWith(`gblur=sigma=${num(L.blur * 1.5)}`, 'screen', a);
      else if (L.t === 'leak') blendWith('lutrgb=r=255:g=190:b=80', 'screen', a * 0.3);
      else if (L.t === 'ghost') {
        const src = raws.shift(), c = lab(), nx = lab();
        parts.push(`${src}scale=iw*${L.scale}:ih*${L.scale},crop=w=iw/${L.scale}:h=ih/${L.scale}:x=(iw-ow)/2-ow*${L.dx}:y=(ih-oh)/2-oh*${L.dy}${c}`,
          `${cur}${c}blend=all_mode=screen:all_opacity=${num(a)}${nx}`);
        cur = nx;
      } else if (L.t === 'pip') {
        const src = raws.shift(), p = lab(), nx = lab();
        parts.push(`${src}scale=iw*${L.size}:ih*${L.size},drawbox=x=0:y=0:w=iw:h=ih:color=white:t=2${p}`,
          `${cur}${p}overlay=x=W-w:y=H-h${nx}`);
        cur = nx;
      } else if (L.t === 'filmstrip') {
        const boxes = [`drawbox=x=0:y=0:w=iw*0.08:h=ih:color=black@${num(.65 * k)}:t=fill`];
        for (let i = 0; i < 9; i++) boxes.push(`drawbox=x=iw*0.02:y=ih*${num(i / 9 + (1 / 9) * .275)}:w=iw*0.04:h=ih*${num(.45 / 9)}:color=white@${num(.75 * k)}:t=fill`);
        const nx = lab(); parts.push(`${cur}${boxes.join(',')}${nx}`); cur = nx;
      }
    }
    parts.push(`${cur}null${outL}`);
    return parts;
  }

  // ---- Properties panel ---------------------------------------------------------------
  function chip(id, name, emoji) {
    return `<div class="chip-option" data-filter-id="${id}" onclick="selectChipGroup(this,'filterSelectVal','${id}');applyClipFilter('${id}');">${emoji ? emoji + ' ' : ''}${name}</div>`;
  }
  function panelHtml() {
    return `<div class="prop-section"><div class="prop-section-title">Clip Filter</div>
      <div class="chip-grid" id="filterChipGrid" style="margin-bottom:8px;max-height:46vh;overflow-y:auto;">
        <div class="chip-option active" data-filter-id="none" onclick="selectChipGroup(this,'filterSelectVal','none');applyClipFilter('none');">Original</div>
        ${CLASSIC.map(c => chip(c.id, c.name, c.emoji)).join('')}
        ${FILTERS.map(f => chip(f.id, f.name, '')).join('')}
      </div>
      <input type="hidden" id="filterSelectVal" value="none"/>
      <div id="filterAmountRow" style="display:flex;align-items:center;gap:8px;margin-top:6px">
        <label for="filterAmount" style="font-size:.78rem;color:var(--text-secondary)">Strength</label>
        <input type="range" id="filterAmount" min="0" max="100" value="100" style="flex:1" aria-label="Filter strength"
          oninput="applyClipFilterAmount(this.value)"/>
        <span id="filterAmountValue" style="font-size:.78rem;min-width:34px;text-align:right">100%</span>
      </div>
      <p style="color:var(--text-secondary);font-size:.78rem;margin-top:8px">Select a clip first to apply filter.</p></div>`;
  }
  /** Reflect the selected clip's filter in an open panel. */
  function syncPanel(clip) {
    const id = (clip && clip.filter) || 'none';
    document.querySelectorAll('#filterChipGrid .chip-option').forEach(c => c.classList.toggle('active', c.dataset.filterId === id));
    const amt = clip && clip.filterAmount != null ? clip.filterAmount : 100;
    const r = document.getElementById('filterAmount'), v = document.getElementById('filterAmountValue');
    if (r) r.value = amt; if (v) v.textContent = amt + '%';
  }

  // ---- Canvas Renderer & Direct MediaRecorder export ----------------------------------
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const supportsCtxFilter = (() => {
    try { return typeof document !== 'undefined' && 'filter' in document.createElement('canvas').getContext('2d'); } catch (e) { return false; }
  })();

  let grainTile = null;
  function getGrain() {
    if (grainTile) return grainTile;
    grainTile = mk(256, 256);
    const g = grainTile.getContext('2d'), d = g.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = 100 + Math.random() * 56;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    return grainTile;
  }

  class Renderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
      this.work = typeof document !== 'undefined' ? mk(2, 2) : null;
      this.raw = typeof document !== 'undefined' ? mk(2, 2) : null;
      this.filter = byId.none || byId['view-hd'] || { id: 'none', layers: [] };
      this.intensity = 1;
      this._raf = 0;
    }
    setFilter(id) { this.filter = byId[id] || byId.none || { id: 'none', layers: [] }; }
    setIntensity(v) { this.intensity = Math.max(0, Math.min(1, v)); }

    render(src) {
      if (!this.canvas || !src) return;
      const w = src.videoWidth || src.naturalWidth || src.width;
      const h = src.videoHeight || src.naturalHeight || src.height;
      if (!w || !h) return;
      const { canvas, ctx, work, raw } = this;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      if (work.width !== w || work.height !== h) { work.width = w; work.height = h; raw.width = w; raw.height = h; }

      const f = this.filter;
      const rg = raw.getContext('2d');
      rg.clearRect(0, 0, w, h); rg.drawImage(src, 0, 0, w, h);

      ctx.clearRect(0, 0, w, h);
      ctx.filter = 'none';
      if (!f || f.id === 'none' || this.intensity === 0) { ctx.drawImage(raw, 0, 0); return; }

      const g = work.getContext('2d');
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      g.clearRect(0, 0, w, h);
      if (supportsCtxFilter) g.filter = f.css || 'none';
      g.drawImage(raw, 0, 0);
      g.filter = 'none';
      for (const L of (f.layers || [])) this._layer(g, L, w, h);
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;

      ctx.drawImage(raw, 0, 0);
      ctx.globalAlpha = this.intensity;
      ctx.drawImage(work, 0, 0);
      ctx.globalAlpha = 1;
    }

    _layer(g, L, w, h) {
      g.save();
      switch (L.t) {
        case 'tint':
          g.globalCompositeOperation = L.blend; g.globalAlpha = L.a;
          g.fillStyle = L.color; g.fillRect(0, 0, w, h); break;
        case 'vignette': {
          const r = Math.hypot(w, h) / 2;
          const gr = g.createRadialGradient(w / 2, h / 2, r * .35, w / 2, h / 2, r);
          gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${L.s})`);
          g.fillStyle = gr; g.fillRect(0, 0, w, h); break; }
        case 'grain': {
          g.globalCompositeOperation = 'overlay'; g.globalAlpha = L.a;
          g.fillStyle = g.createPattern(getGrain(), 'repeat'); g.fillRect(0, 0, w, h); break; }
        case 'split': {
          const dx = Math.round(w * L.dx);
          const c = mk(w, h), cg = c.getContext('2d');
          for (const [col, off] of [['#ff0040', dx], ['#00e0ff', -dx]]) {
            cg.globalCompositeOperation = 'source-over'; cg.clearRect(0, 0, w, h);
            cg.drawImage(this.raw, 0, 0);
            cg.globalCompositeOperation = 'multiply'; cg.fillStyle = col; cg.fillRect(0, 0, w, h);
            g.globalCompositeOperation = 'screen'; g.globalAlpha = L.a;
            g.drawImage(c, off, 0);
          }
          break; }
        case 'ghost': {
          g.globalAlpha = L.a; g.globalCompositeOperation = 'screen';
          const sw = w * L.scale, sh = h * L.scale;
          g.drawImage(this.raw, w * L.dx - (sw - w) / 2, h * L.dy - (sh - h) / 2, sw, sh); break; }
        case 'pip': {
          const pw = w * L.size, ph = h * L.size, x = w - pw, y = h - ph;
          g.drawImage(this.raw, x, y, pw, ph);
          g.strokeStyle = '#fff'; g.lineWidth = Math.max(2, w * .006); g.strokeRect(x, y, pw, ph); break; }
        case 'filmstrip': {
          const bw = w * .08;
          g.fillStyle = 'rgba(0,0,0,.65)'; g.fillRect(0, 0, bw, h);
          g.fillStyle = 'rgba(255,255,255,.75)';
          const n = 9, step = h / n, rw = bw * .5, rh = step * .45;
          for (let i = 0; i < n; i++) g.fillRect((bw - rw) / 2, i * step + (step - rh) / 2, rw, rh);
          break; }
        case 'leak': {
          g.globalCompositeOperation = 'screen'; g.globalAlpha = L.a;
          let gr = g.createRadialGradient(w * .85, h * .9, 0, w * .85, h * .9, w * .7);
          gr.addColorStop(0, 'rgba(255,190,80,.9)'); gr.addColorStop(1, 'rgba(255,190,80,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, h);
          gr = g.createRadialGradient(w * .1, h * .1, 0, w * .1, h * .1, w * .5);
          gr.addColorStop(0, 'rgba(255,80,200,.5)'); gr.addColorStop(1, 'rgba(255,80,200,0)');
          g.fillStyle = gr; g.fillRect(0, 0, w, h); break; }
        case 'glow': {
          if (!supportsCtxFilter) break;
          g.globalCompositeOperation = 'screen'; g.globalAlpha = L.a;
          g.filter = `blur(${Math.round(L.blur * w / 576)}px)`;
          g.drawImage(g.canvas, 0, 0); break; }
      }
      g.restore();
    }

    start(video) {
      this.stop();
      const tick = () => { this.render(video); this._raf = requestAnimationFrame(tick); };
      tick();
    }
    stop() { if (this._raf) cancelAnimationFrame(this._raf); this._raf = 0; }
  }

  async function exportVideo(video, filterId, opts = {}) {
    if (typeof document === 'undefined') return null;
    const canvas = mk(2, 2), r = new Renderer(canvas);
    r.setFilter(filterId); r.setIntensity(opts.intensity ?? 1);
    video.currentTime = opts.start ?? 0;
    await new Promise(res => { video.onseeked = res; });
    r.render(video);
    const stream = canvas.captureStream(opts.fps || 30);
    try {
      const vs = video.captureStream ? video.captureStream() : null;
      vs && vs.getAudioTracks().forEach(t => stream.addTrack(t));
    } catch (e) { /* audio optional */ }
    const mime = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
      .find(m => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m));
    if (!mime || typeof MediaRecorder === 'undefined') return null;
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: opts.bitrate || 8e6 });
    const chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    const done = new Promise(res => { rec.onstop = () => res(new Blob(chunks, { type: 'video/webm' })); });
    const end = opts.end ?? video.duration;
    rec.start(); r.start(video); await video.play();
    await new Promise(res => {
      const chk = () => (video.ended || video.currentTime >= end) ? res() : requestAnimationFrame(chk);
      chk();
    });
    video.pause(); r.stop(); rec.stop();
    return done;
  }

  const api = { FILTERS, CLASSIC, byId, isPack, nameOf, previewFilter, syncPreview, clearPreview,
    ffmpegStage, panelHtml, syncPanel, parseCss, gradeChain, Renderer, exportVideo, supportsCtxFilter };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ClipFilterPack = api;
  root.ClipFilters = api;
})(typeof window !== 'undefined' ? window : globalThis);