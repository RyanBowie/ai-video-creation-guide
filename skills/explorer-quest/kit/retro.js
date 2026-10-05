// retro.js - 90s anime / arcade rendering engine for "Copilot Quest".
// Cel-shading core (path/cel/crescent/ribbon/flutter/airbrush), limb() and flare values are adapted from
// lemomo-ai/lemo-opuscar styles/cel-anime-80s (cel.js, rider.js, fx.js, head80.js) - MIT licence.
// Everything is exported on window.R (IIFE keeps top-level names out of the shared global scope).
(() => {
'use strict';
// ================================================================ cel core (opuscar cel.js, MIT)
const TAU = Math.PI * 2;
const LWK = { k: 1 };

function canvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); return [c, g];
}

function path(pts, closed = true, tension = 1) {
  const p = new Path2D(), n = pts.length;
  if (n < 2) return p;
  const P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  p.moveTo(pts[0][0], pts[0][1]);
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const k = tension / 6;
    let c1x = p1[0] + (p2[0] - p0[0]) * k, c1y = p1[1] + (p2[1] - p0[1]) * k;
    let c2x = p2[0] - (p3[0] - p1[0]) * k, c2y = p2[1] - (p3[1] - p1[1]) * k;
    if (p1[2] || (!closed && i === 0)) { c1x = p1[0] + (p2[0] - p1[0]) / 3; c1y = p1[1] + (p2[1] - p1[1]) / 3; }
    if (p2[2] || (!closed && i === segs - 1)) { c2x = p2[0] - (p2[0] - p1[0]) / 3; c2y = p2[1] - (p2[1] - p1[1]) / 3; }
    p.bezierCurveTo(c1x, c1y, c2x, c2y, p2[0], p2[1]);
  }
  if (closed) p.closePath();
  return p;
}
const poly = (pts, closed = true) => path(pts.map(q => [q[0], q[1], 1]), closed);

const crescent = (P, d) => { const Q = new Path2D(); Q.addPath(P); Q.addPath(P, new DOMMatrix().translate(d[0], d[1])); return Q; };
function cel(g, pts, o) {
  const P = pts instanceof Path2D ? pts : path(pts);
  if (o.f) { g.fillStyle = o.f; g.fill(P); }
  const toP = x => x instanceof Path2D ? x : path(x);
  if (o.so || o.ho || o.rim || (o.sh && o.sh.length) || (o.hi && o.hi.length) || o.clipFn) {
    g.save(); g.clip(P);
    if (o.so) { g.fillStyle = o.s; g.fill(crescent(P, o.so), 'evenodd'); }
    if (o.sh) { g.fillStyle = o.s; for (const s of o.sh) g.fill(toP(s)); }
    if (o.s2 && o.sh2) { g.fillStyle = o.s2; for (const s of o.sh2) g.fill(toP(s)); }
    if (o.ho) { g.fillStyle = o.h; g.fill(crescent(P, o.ho), 'evenodd'); }
    if (o.hi) { g.fillStyle = o.h; for (const s of o.hi) g.fill(toP(s)); }
    if (o.rim) { g.fillStyle = o.rim.c; g.fill(crescent(P, o.rim.d), 'evenodd'); }
    if (o.clipFn) o.clipFn(g, P);
    g.restore();
  }
  if (o.l) { g.strokeStyle = o.l; g.lineWidth = (o.lw || 2.2) * LWK.k; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(P); }
  return P;
}
function line(g, pts, col, lw = 2, closed = false) {
  const P = pts instanceof Path2D ? pts : path(pts, closed);
  g.strokeStyle = col; g.lineWidth = lw * LWK.k; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(P);
}

function ribbon(spine, width) {
  const n = spine.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = spine[Math.max(0, i - 1)], b = spine[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const w = width(i / (n - 1)) / 2;
    L.push([spine[i][0] - dy * w, spine[i][1] + dx * w]); R.push([spine[i][0] + dy * w, spine[i][1] - dx * w]);
  }
  return L.concat(R.reverse());
}
function flutter(x, y, ang, len, n, amp, waves, phase, droop = 0) {
  const pts = [], ca = Math.cos(ang), sa = Math.sin(ang);
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), s = u * len;
    const off = Math.sin(u * waves * TAU - phase) * amp * Math.pow(u, .8) + droop * u * u;
    pts.push([x + ca * s - sa * off, y + sa * s + ca * off]);
  }
  return pts;
}

function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(a, b, t) { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
function rgba(c, a) { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; }

function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };

function airbrush(g, x, y, rx, ry, col, a = 1, soft = 1) {
  g.save(); g.translate(x, y); g.scale(1, ry / rx);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
  gr.addColorStop(0, rgba(col, a)); gr.addColorStop(Math.max(0, 1 - soft), rgba(col, a)); gr.addColorStop(1, rgba(col, 0));
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, TAU); g.fill(); g.restore();
}
function vgrad(g, x, y, w, h, stops) {
  const gr = g.createLinearGradient(0, y, 0, y + h); for (const [o, c] of stops) gr.addColorStop(o, c);
  g.fillStyle = gr; g.fillRect(x, y, w, h);
}
// ================================================================ retro engine
// Stage: everything is authored in virtual 640x360 units and drawn at x3 onto 1920x1080 canvases.
// SC = scene canvas, GC = glow canvas (emissive light only, opaque black base - see post.js note).
const W = 640, H = 360, K = 3, DW = 1920, DH = 1080;
const [SC, g] = canvas(DW, DH);
const [GC, gg] = canvas(DW, DH);
window.SC = SC; window.GC = GC;
const NEON = ['#ff3fa4', '#35e7ff', '#ffd23f', '#ff5a3c', '#b36bff', '#4dff9a'];

// ---- capsule limb (from opuscar rider.js, MIT)
function limb(a, b, w1, w2) {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, qx = -uy, qy = ux;
  const r1 = w1 / 2, r2 = w2 / 2;
  const cap = (c, r, s) => { const out = []; for (let k = 0; k <= 4; k++) { const an = -Math.PI / 2 + k * Math.PI / 4; const ca = Math.cos(an), sa = Math.sin(an); out.push([c[0] + (ux * ca * s + qx * sa * s) * r, c[1] + (uy * ca * s + qy * sa * s) * r]); } return out; };
  return cap(b, r2, 1).concat(cap(a, r1, -1));
}

// ---- timing helpers
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const easeOut = t => { t = clamp(t); return 1 - Math.pow(1 - t, 3); };
const easeIn = t => { t = clamp(t); return t * t * t; };
const back = (t, s = 1.70158) => { t = clamp(t) - 1; return 1 + (s + 1) * t * t * t + s * t * t; };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const quant = (v, n) => Math.floor(v * n) / n;
const onTwos = (t, fps = 12) => Math.floor(t * fps) / fps;
const pulse = (t, a, d = .3) => { const u = (t - a) / d; return u < 0 || u > 1 ? 0 : Math.sin(u * Math.PI); };
const blink = (t, rate = 2) => Math.floor(t * rate * 2) % 2 === 0;
const typeText = (s, t, cps = 40) => s.slice(0, Math.max(0, Math.floor(t * cps)));

// ---- frame setup
function reset(G) { G.setTransform(1, 0, 0, 1, 0, 0); G.globalAlpha = 1; G.globalCompositeOperation = 'source-over'; G.filter = 'none'; G.imageSmoothingEnabled = true; G.setLineDash([]); }
function begin(bg = '#000000') {
  reset(g); reset(gg);
  g.fillStyle = bg; g.fillRect(0, 0, DW, DH);
  gg.fillStyle = '#000000'; gg.fillRect(0, 0, DW, DH);
  g.setTransform(K, 0, 0, K, 0, 0); gg.setTransform(K, 0, 0, K, 0, 0);
  LWK.k = 1;
}
// camera: c = {x, y, z, rot, dx, dy}; (x, y) is the virtual point placed at screen centre
function withCam(c, fn) {
  for (const G of [g, gg]) { G.save(); G.translate(W / 2 + (c.dx || 0), H / 2 + (c.dy || 0)); const z = c.z || 1; G.scale(z, z); if (c.rot) G.rotate(c.rot); G.translate(-(c.x ?? W / 2), -(c.y ?? H / 2)); }
  try { fn(); } finally { g.restore(); gg.restore(); }
}
function both(fn) { g.save(); gg.save(); try { fn(); } finally { g.restore(); gg.restore(); } }

// ---- pixels, dither, plates
function px(x, y, w, h, col, G = g) { G.fillStyle = col; G.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
const PLATES = {};
function plate(key, w, h, fn) {
  if (PLATES[key]) return PLATES[key];
  const [c, x] = canvas(w, h); const id = x.createImageData(w, h); fn(id.data, w, h); x.putImageData(id, 0, 0);
  return (PLATES[key] = c);
}
// ordered-dither gradient between adjacent palette steps; fn(x, y) -> 0..1 (negative = transparent)
function ditherGrad(key, w, h, cols, fn) {
  const C = cols.map(hex), f0 = fn || ((x, y) => y / Math.max(1, h - 1));
  return plate(key, w, h, d => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4, v0 = f0(x, y);
      if (v0 < 0) { d[o + 3] = 0; continue; }
      const v = clamp(v0) * (C.length - 1); let i = Math.floor(v);
      if (v - i > BAYER[(y & 3) * 4 + (x & 3)]) i++;
      const c = C[Math.min(C.length - 1, i)]; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
    }
  });
}
function drawPlate(c, x = 0, y = 0, w = c.width, h = c.height, G = g) { G.save(); G.imageSmoothingEnabled = false; G.drawImage(c, Math.round(x), Math.round(y), w, h); G.restore(); }
// Bayer dither fade (retro screen fade): p 0..1
const DPAT = {};
function ditherFade(p, col = '#000000', G = g) {
  const k = Math.round(clamp(p) * 16); if (k <= 0) return;
  G.save(); G.setTransform(K, 0, 0, K, 0, 0);
  if (k >= 16) { G.fillStyle = col; G.fillRect(-4, -4, W + 8, H + 8); G.restore(); return; }
  const key = col + k; let c = DPAT[key];
  if (!c) { let x; [c, x] = canvas(4, 4); x.fillStyle = col; for (let i = 0; i < 16; i++) if (BAYER[i] * 16 - .5 < k) x.fillRect(i & 3, i >> 2, 1, 1); DPAT[key] = c; }
  G.imageSmoothingEnabled = false; G.fillStyle = G.createPattern(c, 'repeat'); G.fillRect(-4, -4, W + 8, H + 8); G.restore();
}

// ---- pixel layer: draw vector art at 640x360, threshold alpha, blit chunky (true pixel-art look)
const LR = document.createElement('canvas'); LR.width = W; LR.height = H;
const lr = LR.getContext('2d', { willReadFrequently: true });
function pixLayer(fn, o = {}) {
  lr.setTransform(1, 0, 0, 1, 0, 0); lr.globalAlpha = 1; lr.globalCompositeOperation = 'source-over'; lr.filter = 'none'; lr.clearRect(0, 0, W, H);
  lr.save(); try { fn(lr); } finally { lr.restore(); }
  if (o.hard !== false || o.outline) {
    const id = lr.getImageData(0, 0, W, H), d = id.data, thr = (o.thr ?? .5) * 255;
    for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= thr ? 255 : 0;
    if (o.outline) {
      const oc = hex(o.outline), A = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) A[i] = d[i * 4 + 3] ? 1 : 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x; if (A[i]) continue;
        if ((x > 0 && A[i - 1]) || (x < W - 1 && A[i + 1]) || (y > 0 && A[i - W]) || (y < H - 1 && A[i + W])) { const j = i * 4; d[j] = oc[0]; d[j + 1] = oc[1]; d[j + 2] = oc[2]; d[j + 3] = 255; }
      }
    }
    lr.putImageData(id, 0, 0);
  }
  const G = o.G || g;
  G.save(); G.imageSmoothingEnabled = false; G.globalAlpha = o.alpha ?? 1; G.drawImage(LR, 0, 0, W, H); G.restore();
  if (o.glow) { gg.save(); gg.imageSmoothingEnabled = false; gg.globalAlpha = o.glow; gg.globalCompositeOperation = 'lighter'; gg.drawImage(LR, 0, 0, W, H); gg.restore(); }
}

// ---- decorative fx
function halftone(G, x0, y0, w, h, col, fn, step = 6) {
  G.fillStyle = col; G.beginPath();
  for (let j = 0, y = y0; y < y0 + h + step; j++, y += step * .866) {
    const off = (j & 1) ? step / 2 : 0;
    for (let x = x0 - step + off; x < x0 + w + step; x += step) {
      const r = fn(x, y) * step * .55; if (r > .15) { G.moveTo(x + r, y); G.arc(x, y, r, 0, TAU); }
    }
  }
  G.fill();
}
function stars(G, t, seed, n, x0 = 0, y0 = 0, w = W, h = H, cols = ['#ffffff', '#bfe8ff', '#ffe6a8'], glowA = .7) {
  const Rr = rng(seed); G.save();
  for (let i = 0; i < n; i++) {
    const x = Math.round(x0 + Rr() * w), y = Math.round(y0 + Rr() * h), big = Rr() < .14, ph = Rr() * TAU, sp = 1.5 + Rr() * 3, c = cols[(Rr() * cols.length) | 0];
    const tw = .55 + .45 * Math.sin(t * sp + ph); if (tw < .25) continue;
    G.globalAlpha = tw; G.fillStyle = c; G.fillRect(x, y, 1, 1);
    if (big) { G.globalAlpha = tw * .8; G.fillRect(x - 1, y, 3, 1); G.fillRect(x, y - 1, 1, 3); if (tw > .85) { G.globalAlpha = .5; G.fillRect(x - 2, y, 5, 1); G.fillRect(x, y - 2, 1, 5); } }
    if (big && glowA) { gg.save(); gg.globalAlpha = tw * glowA; gg.fillStyle = c; gg.fillRect(x - 1, y - 1, 3, 3); gg.restore(); }
  }
  G.restore();
}
function starPath(G, x, y, r, rot, pinch = .12) {
  G.beginPath();
  for (let i = 0; i < 4; i++) {
    const an = rot + i * TAU / 4, an2 = an + TAU / 8, nx = rot + (i + 1) * TAU / 4;
    if (i === 0) G.moveTo(x + Math.cos(an) * r, y + Math.sin(an) * r);
    G.quadraticCurveTo(x + Math.cos(an2) * r * pinch, y + Math.sin(an2) * r * pinch, x + Math.cos(nx) * r, y + Math.sin(nx) * r);
  }
  G.closePath();
}
// anime 4-point sparkle (+ smaller diagonal star) with glow
function sparkle(G, x, y, r, col = '#ffffff', a = 1, rot = 0, glowA = .9) {
  if (r <= .2 || a <= 0) return;
  G.save(); G.globalAlpha *= clamp(a); G.fillStyle = col;
  starPath(G, x, y, r, rot - Math.PI / 2); G.fill(); starPath(G, x, y, r * .45, rot - Math.PI / 2 + TAU / 8, .2); G.fill();
  G.restore();
  if (glowA) {
    gg.save(); gg.globalAlpha = clamp(a) * glowA; gg.fillStyle = col; starPath(gg, x, y, r * 1.25, rot - Math.PI / 2, .16); gg.fill();
    const gr = gg.createRadialGradient(x, y, 0, x, y, r * .8); gr.addColorStop(0, rgba(col, .9)); gr.addColorStop(1, rgba(col, 0));
    gg.fillStyle = gr; gg.beginPath(); gg.arc(x, y, r * .8, 0, TAU); gg.fill(); gg.restore();
  }
}
function pxSpark(G, x, y, s, col, a = 1) {
  G.save(); G.globalAlpha *= clamp(a); x = Math.round(x); y = Math.round(y); G.fillStyle = col;
  G.fillRect(x - s, y, 2 * s + 1, 1); G.fillRect(x, y - s, 1, 2 * s + 1); if (s >= 3) G.fillRect(x - 1, y - 1, 3, 3);
  G.restore();
}

// ---- pixel text
const TITLE_GRAD = ['#fff6d8', '#ffe9a8', '#ffd27a', '#ffb653', '#ff9a3a', '#ff7a2a', '#e85a20', '#d84a18', '#c83a10'];
function textX(s, x, sc, align) { const w = PF.textW(s, sc); return Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x); }
// dark ink ring just outside the coloured outline: keeps neon/gold text readable over bloom, flares and busy art
function inkRing(G, s, x0, y, sc, ink) {
  const fb = PF.FB(G), o = Math.max(1, Math.round(sc / 2)), d = 2 * o;
  for (const [dx, dy] of [[-d, 0], [d, 0], [0, -d], [0, d], [-d, -d], [d, -d], [-d, d], [d, d], [-d, -o], [d, -o], [-d, o], [d, o], [-o, -d], [o, -d], [-o, d], [o, d]])
    PF.text(fb, s, x0 + dx, y + dy, ink, null, sc);
}
function neonText(s, x, y, col, sc = 2, core = '#ffffff', align = 'center', o = {}) {
  const x0 = textX(s, x, sc, align), ink = o.ink === undefined ? '#12051f' : o.ink;
  gg.save(); gg.globalAlpha = o.glow ?? .35; PF.putBig(gg, s, x0, y, col, col, sc); gg.restore();
  if (ink) inkRing(g, s, x0, y, sc, ink);
  PF.putBig(g, s, x0, y, core, col, sc, o.shadow || null);
  return x0;
}
// dark HUD plate (1px bevelled edge) behind captions/counters so they never sit straight on bright art
function panel(G, x, y, w, h, o = {}) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  G.save(); G.globalAlpha *= o.alpha ?? 1;
  G.fillStyle = o.fill || 'rgba(12,6,34,.84)'; G.fillRect(x + 1, y, w - 2, h); G.fillRect(x, y + 1, w, h - 2);
  if (o.edge !== null) { G.fillStyle = o.edge || '#7a5cff'; G.fillRect(x + 1, y, w - 2, 1); G.fillRect(x + 1, y + h - 1, w - 2, 1); G.fillRect(x, y + 1, 1, h - 2); G.fillRect(x + w - 1, y + 1, 1, h - 2); }
  G.restore();
}
// neon text on its own plate; returns the plate rect.
// o.mask (true or 0-1) also blacks out the glow layer under the plate, so bright glow behind it cannot bloom over the text.
function hudText(s, x, y, col = '#ffe14a', sc = 2, align = 'center', o = {}) {
  const w = PF.textW(s, sc), x0 = textX(s, x, sc, align), p = o.pad ?? 3 + sc, r = { x: x0 - p - 1, y: y - p, w: w + 2 * p + 2, h: 7 * sc + 2 * p + 1 };
  if (o.mask) { gg.save(); gg.globalAlpha *= o.mask === true ? 1 : o.mask; gg.fillStyle = '#000000'; gg.fillRect(r.x - 6, r.y - 6, r.w + 12, r.h + 12); gg.restore(); }
  panel(g, r.x, r.y, r.w, r.h, o);
  neonText(s, x, y, col, sc, o.core || '#ffffff', align, Object.assign({ glow: .22 }, o));
  return r;
}
function logoText(s, cx, y, sc, o = {}) {
  const x0 = textX(s, cx, sc, 'center'), grad = o.grad || TITLE_GRAD;
  if (o.glow !== 0) { gg.save(); gg.globalAlpha = o.glow ?? .5; PF.putBig(gg, s, x0, y, o.glowCol || '#ff6a2a', o.glowCol || '#ff6a2a', sc); gg.restore(); }
  PF.putBig(g, s, x0, y, r => grad[Math.min(grad.length - 1, r)], o.outline || '#2a0e3a', sc, o.shadow === undefined ? '#12061f' : o.shadow);
  return x0;
}
function label(G, s, x, y, col = '#fff3d6', sc = 1, align = 'left', shadow = '#000000') { return PF.put(G, s, textX(s, x, sc, align), y, col, shadow, sc); }

// ---- 90s UI
const THEMES = {
  classic: { frame: '#c0c0c0', light: '#ffffff', dark: '#808080', dk2: '#202020', t0: '#000080', t1: '#1084d0', tt: '#ffffff', body: '#ffffff', ink: '#000000' },
  vapor: { frame: '#e8e0ff', light: '#ffffff', dark: '#7a6aa8', dk2: '#2a1a58', t0: '#ff3fa4', t1: '#7a3cff', tt: '#ffffff', body: '#10142e', ink: '#fff3d6' },
  night: { frame: '#1e2a5a', light: '#5a78d0', dark: '#0e1430', dk2: '#05081a', t0: '#35e7ff', t1: '#7a3cff', tt: '#05081a', body: '#0a1030', ink: '#bfefff' },
};
function bevel(G, x, y, w, h, light, dark, inset = false) {
  px(x, y, w, 1, inset ? dark : light, G); px(x, y, 1, h, inset ? dark : light, G);
  px(x, y + h - 1, w, 1, inset ? light : dark, G); px(x + w - 1, y, 1, h, inset ? light : dark, G);
}
function win(G, x, y, w, h, title, o = {}) {
  const T = THEMES[o.theme || 'classic'];
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  if (o.shadow !== false) { G.save(); G.globalAlpha *= .4; px(x + 4, y + 4, w, h, '#000000', G); G.restore(); }
  px(x, y, w, h, T.frame, G);
  bevel(G, x, y, w, h, T.light, T.dk2); bevel(G, x + 1, y + 1, w - 2, h - 2, T.frame, T.dark);
  const th = 12, gr = G.createLinearGradient(x + 3, 0, x + w - 3, 0); gr.addColorStop(0, o.t0 || T.t0); gr.addColorStop(1, o.t1 || T.t1);
  G.fillStyle = gr; G.fillRect(x + 3, y + 3, w - 6, th);
  if (o.icon) o.icon(G, x + 5, y + 4); 
  PF.put(G, title, x + (o.icon ? 16 : 6), y + 6, T.tt);
  let bx = x + w - 14;
  for (const k of ['x', 'o', '_']) {
    px(bx, y + 4, 10, 10, T.frame, G); bevel(G, bx, y + 4, 10, 10, T.light, T.dk2);
    G.fillStyle = '#000000';
    if (k === 'x') for (let i = 0; i < 5; i++) { G.fillRect(bx + 2 + i, y + 6 + i, 2, 1); G.fillRect(bx + 6 - i, y + 6 + i, 2, 1); }
    if (k === 'o') { G.fillRect(bx + 2, y + 6, 6, 1); G.fillRect(bx + 2, y + 7, 6, 1); G.fillRect(bx + 2, y + 6, 1, 6); G.fillRect(bx + 7, y + 6, 1, 6); G.fillRect(bx + 2, y + 11, 6, 1); }
    if (k === '_') G.fillRect(bx + 2, y + 10, 5, 2);
    bx -= 11;
  }
  const cx = x + 4, cy = y + 3 + th + 2, cw = w - 8, ch = h - (3 + th + 2) - 4;
  px(cx, cy, cw, ch, o.body || T.body, G); bevel(G, cx - 1, cy - 1, cw + 2, ch + 2, T.dark, T.light);
  return { x: cx, y: cy, w: cw, h: ch, T };
}
// reveal text in sync with VO word timings: words = [[t, "word"], ...] (t relative to clip start)
function vnReveal(text, words, tt, cps = 40) {
  if (!words || !words.length) return Math.floor(Math.max(0, tt) * cps);
  // edge-tts can merge tokens ("Microsoft 365") and use curly apostrophes: match on the first word, straight quotes
  const q = s => s.toLowerCase().replace(/[\u2018\u2019]/g, "'"), low = q(text), M = []; let p = 0;
  for (const [t0, w] of words) {
    const key = q(String(w)).split(/\s+/)[0].replace(/[^a-z0-9'\-]/g, ''); if (!key) continue;
    const k = low.indexOf(key, p); if (k >= 0) { M.push([t0, k]); p = k + 1; }
  }
  if (!M.length) return Math.floor(Math.max(0, tt) * cps);
  let i = -1; for (let j = 0; j < M.length; j++) if (M[j][0] <= tt) i = j;
  if (i < 0) return 0;
  const cap = i + 1 < M.length ? M[i + 1][1] : text.length;
  return Math.min(cap, Math.floor(M[i][1] + (tt - M[i][0]) * cps));
}
// visual-novel dialogue box (navy glass, cream frame, orange name)
function vnBox(G, x, y, w, h, name, text, t, o = {}) {
  if (t < 0) return;
  const pop = clamp(t / .16), sc = o.sc || 2, cps = o.cps || 40;
  G.save();
  const cy = y + h / 2; G.translate(0, cy); G.scale(1, .15 + .85 * easeOut(pop)); G.translate(0, -cy); G.globalAlpha *= Math.min(1, pop * 1.5);
  G.fillStyle = 'rgba(10,12,40,.86)'; G.fillRect(x, y, w, h);
  px(x, y, w, 2, '#fff3d6', G); px(x, y + h - 2, w, 2, '#fff3d6', G); px(x, y, 2, h, '#fff3d6', G); px(x + w - 2, y, 2, h, '#fff3d6', G);
  G.globalAlpha *= .8; px(x + 4, y + 4, w - 8, 1, '#ff9a3a', G); px(x + 4, y + h - 5, w - 8, 1, '#ff9a3a', G); px(x + 4, y + 4, 1, h - 8, '#ff9a3a', G); px(x + w - 5, y + 4, 1, h - 8, '#ff9a3a', G);
  G.globalAlpha /= .8;
  for (const [cx2, cy2] of [[x, y], [x + w - 4, y], [x, y + h - 4], [x + w - 4, y + h - 4]]) px(cx2, cy2, 4, 4, '#ff9a3a', G);
  let ty = y + 10;
  if (name) { PF.put(G, '\u3010' + name + '\u3011', x + 12, ty, o.nameCol || '#ff9a3a', '#000000'); ty += 13; }
  const tt = t - .16, n = o.words ? vnReveal(text, o.words, tt - (o.wordOffset || 0), cps) : Math.floor(Math.max(0, tt) * cps);
  const lines = PF.wrap(text, (w - 26) / sc); let left = n;
  for (const L of lines) { if (left > 0) PF.put(G, L.slice(0, left), x + 13, ty, o.col || '#fff3d6', '#05061a', sc); left -= L.length + 1; ty += 10 * sc; }
  if (n >= text.length && blink(t, 1.6)) PF.put(G, '\u25bc', x + w - 16, y + h - 13, '#ff9a3a');
  G.restore();
}
function meter(G, x, y, w, h, v, o = {}) {
  const segs = o.segs || 10, gap = 1, sw = (w - (segs - 1) * gap) / segs;
  px(x - 2, y - 2, w + 4, h + 4, o.frame || '#fff3d6', G); px(x - 1, y - 1, w + 2, h + 2, o.bg || '#140c26', G);
  for (let i = 0; i < segs; i++) {
    const on = i < v * segs - 1e-6;
    G.fillStyle = on ? (o.colFn ? o.colFn(i / Math.max(1, segs - 1)) : o.col || '#4dff9a') : (o.off || '#2a2440');
    G.fillRect(Math.round(x + i * (sw + gap)), Math.round(y), Math.max(1, Math.round(sw)), Math.round(h));
    if (on) { G.fillStyle = 'rgba(255,255,255,.35)'; G.fillRect(Math.round(x + i * (sw + gap)), Math.round(y), Math.max(1, Math.round(sw)), 1); }
  }
}
// rubber stamp slam (like the "ROLES SWAPPED" stamp)
function stamp(G, s, cx, cy, t, o = {}) {
  if (t < 0) return;
  const sc = o.sc || 2, col = o.col || '#ff3f5a', p = easeOut(seg(t, 0, .13)), z = lerp(2.6, 1, p) * (1 + .06 * pulse(t, .13, .12));
  const tw = PF.textW(s, sc), w = tw + 22, h = 7 * sc + 16;
  for (const [G2, isGlow] of [[G, false], [gg, true]]) {
    G2.save(); G2.translate(cx, cy); G2.rotate(o.rot ?? -.1); G2.scale(z, z); G2.globalAlpha *= Math.min(1, t / .05) * (isGlow ? .55 : 1);
    G2.strokeStyle = col; G2.lineWidth = 2.5; G2.strokeRect(-w / 2, -h / 2, w, h); G2.lineWidth = 1; G2.strokeRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
    if (!isGlow && o.fill) { G2.fillStyle = o.fill; G2.fillRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10); }
    PF.put(G2, s, -tw / 2, -7 * sc / 2, col, null, sc);
    G2.restore();
  }
}

// ---- transitions
const [TMP, tg] = canvas(DW, DH);
function pixelate(b) {
  b = Math.round(b / 3) * 3; if (b < 3) return;
  const w = Math.ceil(DW / b), h = Math.ceil(DH / b);
  for (const [C, G] of [[SC, g], [GC, gg]]) {
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.imageSmoothingEnabled = true; tg.clearRect(0, 0, w, h); tg.drawImage(C, 0, 0, w, h);
    G.save(); G.setTransform(1, 0, 0, 1, 0, 0); G.imageSmoothingEnabled = false; G.globalCompositeOperation = 'copy'; G.drawImage(TMP, 0, 0, w, h, 0, 0, w * b, h * b); G.restore();
  }
}
// Transitions also paint black on the glow canvas: gg is added in post, so anything left there would glow through the wipe.
const GLOW_MASK = '#000000';
function iris(cx, cy, r, col = '#000000') {
  if (r > 800) return;
  pixLayer(G => { G.fillStyle = col; G.beginPath(); G.rect(0, 0, W, H); G.arc(cx, cy, Math.max(0, r), 0, TAU); G.fill('evenodd'); });
  gg.save(); gg.fillStyle = GLOW_MASK; gg.beginPath(); gg.rect(-4, -4, W + 8, H + 8); gg.arc(cx, cy, Math.max(0, r), 0, TAU); gg.fill('evenodd'); gg.restore();
  if (r <= 0) { g.fillStyle = col; g.fillRect(0, 0, W, H); }
}
function blinds(p, col = '#000000', n = 12, vertical = false) {
  if (p <= 0) return;
  for (const [G, c] of [[g, col], [gg, GLOW_MASK]]) {
    G.fillStyle = c;
    for (let i = 0; i < n; i++) { const s = (vertical ? W : H) / n, q = clamp(p * 1.6 - i / n * .6); if (vertical) G.fillRect(Math.floor(i * s), 0, Math.ceil(s * q), H); else G.fillRect(0, Math.floor(i * s), W, Math.ceil(s * q)); }
  }
}
function diamonds(p, col = '#000000', sz = 40, dir = 1) {
  if (p <= 0) return;
  for (const [G, c] of [[g, col], [gg, GLOW_MASK]]) {
    G.fillStyle = c; G.beginPath();
    for (let y = sz / 2; y < H + sz; y += sz) for (let x = sz / 2; x < W + sz; x += sz) {
      const u = dir > 0 ? x / W : 1 - x / W, q = clamp(p * 2 - u), r = q * sz; if (r <= 0) continue;
      G.moveTo(x, y - r); G.lineTo(x + r, y); G.lineTo(x, y + r); G.lineTo(x - r, y); G.closePath();
    }
    G.fill();
  }
}
function stepFade(p, col = '#000000', steps = 4) {
  const a = Math.floor(clamp(p) * steps) / steps; if (a <= 0) return;
  for (const [G, c] of [[g, col], [gg, GLOW_MASK]]) { G.save(); G.globalAlpha = a; G.fillStyle = c; G.fillRect(-4, -4, W + 8, H + 8); G.restore(); }
}
const shake = (F, amp, seed = 1) => amp <= 0 ? [0, 0] : [Math.round((hash(F * 1.37 + seed) - .5) * 2 * amp), Math.round((hash(F * 2.71 + seed * 3.1 + 9) - .5) * 2 * amp)];
function letterbox(a, frac = .12, col = '#000000') { if (a <= 0) return; const h = Math.round(H * frac * clamp(a)); px(-4, -4, W + 8, h + 4, col); px(-4, H - h, W + 8, h + 4, col); }

// ---- anime fx
function speedLines(G, cx, cy, n, col, a, seed, r0 = 140, r1 = 520, wmax = .045) {
  const Rr = rng(seed); G.save(); G.globalAlpha *= a; G.fillStyle = col; G.beginPath();
  for (let i = 0; i < n; i++) {
    const an = Rr() * TAU, w = (.25 + Rr() * .75) * wmax, rr = r0 + Rr() * (r1 - r0) * .45;
    G.moveTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr);
    G.lineTo(cx + Math.cos(an - w) * r1 * 1.6, cy + Math.sin(an - w) * r1 * 1.6);
    G.lineTo(cx + Math.cos(an + w) * r1 * 1.6, cy + Math.sin(an + w) * r1 * 1.6); G.closePath();
  }
  G.fill(); G.restore();
}
function gloom(G, t, x0, w, h, col = '#3a1a6a', a = .85, seed = 7) {
  const Rr = rng(seed); G.save();
  const top = G.createLinearGradient(0, 0, 0, h * .7); top.addColorStop(0, rgba(col, a * .75)); top.addColorStop(1, rgba(col, 0));
  G.fillStyle = top; G.fillRect(x0, 0, w, h * .7);
  for (let i = 0; i < 30; i++) {
    const x = x0 + Rr() * w, len = h * (.35 + Rr() * .65) * (.92 + .08 * Math.sin(t * 2.4 + i)), lw = 1 + Math.floor(Rr() * 2.5);
    const gr = G.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, rgba(col, a)); gr.addColorStop(1, rgba(col, 0));
    G.fillStyle = gr; G.fillRect(Math.round(x), 0, lw, len);
  }
  G.restore();
}
const GHOSTS = [[.35, 13, '#7fffd4', .16], [.62, 7, '#ff9fe0', .22], [1.15, 23, '#8fb0ff', .1], [1.4, 10, '#ffe08a', .18], [1.75, 37, '#b08aff', .07]];
function flare(x, y, s = 1, a = 1, G = gg) {
  if (a <= 0) return;
  G.save(); G.globalCompositeOperation = 'lighter';
  let gr = G.createRadialGradient(x, y, 0, x, y, 60 * s); gr.addColorStop(0, `rgba(255,250,235,${.95 * a})`); gr.addColorStop(.22, `rgba(255,215,160,${.4 * a})`); gr.addColorStop(1, 'rgba(255,150,90,0)');
  G.fillStyle = gr; G.beginPath(); G.arc(x, y, 60 * s, 0, TAU); G.fill();
  gr = G.createLinearGradient(x - 300 * s, 0, x + 300 * s, 0); gr.addColorStop(0, 'rgba(120,180,255,0)'); gr.addColorStop(.5, `rgba(210,235,255,${.85 * a})`); gr.addColorStop(1, 'rgba(120,180,255,0)');
  G.fillStyle = gr; G.fillRect(x - 300 * s, y - .85 * s, 600 * s, 1.7 * s);
  G.fillStyle = `rgba(255,240,220,${.7 * a})`;
  for (let i = 0; i < 6; i++) { const an = i * TAU / 6 + .26, L = (i & 1 ? 53 : 100) * s, wv = .022; G.beginPath(); G.moveTo(x, y); G.lineTo(x + Math.cos(an - wv) * L, y + Math.sin(an - wv) * L); G.lineTo(x + Math.cos(an) * L * 1.05, y + Math.sin(an) * L * 1.05); G.lineTo(x + Math.cos(an + wv) * L, y + Math.sin(an + wv) * L); G.closePath(); G.fill(); }
  for (const [k, r, col, ga] of GHOSTS) {
    const hx = x + (W / 2 - x) * k * 1.2, hy = y + (H / 2 - y) * k * 1.2, rr = r * s;
    G.fillStyle = rgba(col, ga * a); G.beginPath(); for (let i = 0; i < 6; i++) { const an = i * TAU / 6; G[i ? 'lineTo' : 'moveTo'](hx + Math.cos(an) * rr, hy + Math.sin(an) * rr); } G.closePath(); G.fill();
  }
  G.restore();
}
// striped synthwave sun built as chunky pixel art
function synthSun(cx, cy, r, t, o = {}) {
  const cols = o.cols || ['#fff3a0', '#ffe070', '#ffc04a', '#ff9a4a', '#ff6a6a', '#ff4a8a', '#d23aa8'];
  airbrush(gg, cx, cy, r * 2.3, r * 2.3, o.halo || '#ff6a4a', .5 * (o.glow ?? 1), 1);
  airbrush(gg, cx, cy, r * 1.15, r * 1.15, '#ffd27a', .55 * (o.glow ?? 1), .5);
  const d = Math.ceil(r * 2) + 2, pl = ditherGrad('sun' + d + cols.join(''), d, d, cols, (x, y) => (Math.hypot(x - d / 2, y - d / 2) <= r ? y / (d - 1) : -1));
  pixLayer(G => {
    G.drawImage(pl, Math.round(cx - d / 2), Math.round(cy - d / 2));
    if (o.stripes !== false) {
      G.globalCompositeOperation = 'destination-out';
      const sp = r / 6.5, ph = (t * (o.speed ?? .8)) % 1;
      for (let i = 0; i < 9; i++) { const k = i + ph, yy = cy + r * .05 + k * sp; if (yy > cy + r) break; const gh = Math.max(1, Math.round(.6 + k * .55)); G.fillRect(Math.round(cx - r - 2), Math.round(yy), Math.round(2 * r + 4), gh); }
    }
  }, { hard: true });
}
// perspective neon grid floor
function synthGrid(t, hy, col = '#ff3fa4', o = {}) {
  const spd = o.speed ?? .7, vx = o.vx ?? W / 2, a = o.a ?? 1, spacing = o.spacing ?? 46, y1 = o.y1 ?? H + 4;
  const drawIt = (G, al, lw) => {
    G.save(); G.strokeStyle = col; G.globalAlpha *= al * a; G.lineWidth = lw; G.beginPath();
    for (let i = -16; i <= 16; i++) { G.moveTo(vx + i * 2.2, hy); G.lineTo(vx + i * spacing * 1.6, y1 + 60); }
    const ph = (t * spd) % 1;
    for (let j = 0; j < 22; j++) { const z = j + 1 - ph; if (z <= .05) continue; const y = hy + (y1 - hy) / z; if (y > y1 + 4) continue; G.moveTo(-10, Math.round(y) + .5); G.lineTo(W + 10, Math.round(y) + .5); }
    G.stroke(); G.restore();
  };
  g.save(); g.beginPath(); g.rect(-10, hy, W + 20, y1 - hy + 70); g.clip(); drawIt(g, 1, 1); g.restore();
  gg.save(); gg.beginPath(); gg.rect(-10, hy, W + 20, y1 - hy + 70); gg.clip(); drawIt(gg, .7, 2.2); gg.restore();
}
// CRT glass overlay for in-scene monitors: scanlines, vignette, glare
function screenFX(G, x, y, w, h, o = {}) {
  G.save(); G.beginPath(); G.rect(x, y, w, h); G.clip();
  G.fillStyle = `rgba(0,0,0,${o.scan ?? .22})`; for (let yy = Math.floor(y); yy < y + h; yy += 2) G.fillRect(x, yy, w, 1);
  const vg = G.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * .3, x + w / 2, y + h / 2, Math.max(w, h) * .75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,10,${o.vig ?? .55})`); G.fillStyle = vg; G.fillRect(x, y, w, h);
  const gl = G.createLinearGradient(x, y, x + w * .6, y + h * .7); gl.addColorStop(0, 'rgba(255,255,255,.16)'); gl.addColorStop(.5, 'rgba(255,255,255,.03)'); gl.addColorStop(.51, 'rgba(255,255,255,0)');
  G.fillStyle = gl; G.fillRect(x, y, w, h);
  G.restore();
}

// ---- Microsoft 365 Copilot mark (ported from sofia-return/cast.js)
const CP_A = 'M70 325 L160 325 Q173 325 181 300 L216 185 Q224 155 250 155 L385 155 C350 155 348 110 340 82 C330 50 315 40 290 40 L150 40 Q115 40 105 75 L40 290 Q28 325 70 325 Z';
const CP_FOLD = 'M262 40 L290 40 C315 40 330 50 340 82 C348 110 350 155 385 155 L250 155 Q224 155 220 170 Q232 90 262 40 Z';
let _cpA = null, _cpF = null;
function lg(G, x0, y0, x1, y1, stops) { const gr = G.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => Array.isArray(s) ? gr.addColorStop(s[0], s[1]) : gr.addColorStop(i / (stops.length - 1), s)); return gr; }
function mark(G, x, y, size, o = {}) {
  _cpA = _cpA || new Path2D(CP_A); _cpF = _cpF || new Path2D(CP_FOLD);
  const k = size / 360, gap = o.gap ?? 14;
  G.save(); G.translate(x, y); if (o.rot) G.rotate(o.rot); G.scale(k, k); G.translate(-240, -240);
  if (o.alpha != null) G.globalAlpha *= o.alpha;
  const half = warm => {
    G.save(); if (warm) { G.translate(480, 480); G.rotate(Math.PI); } G.translate(-gap * .5, -gap * .3);
    G.fillStyle = warm ? lg(G, 150, 40, 110, 325, ['#FFB16A', '#F7738A', '#E4569A', '#B04FE6']) : lg(G, 150, 40, 110, 325, ['#38C2F8', [.3, '#1C8FE3'], [.62, '#4DB57A'], [1, '#F7C51E']]);
    G.fill(_cpA);
    G.fillStyle = warm ? lg(G, 250, 60, 380, 150, ['#C92E1C', '#F0582E', '#FF9A5A']) : lg(G, 250, 60, 380, 150, ['#0B2BA8', '#1552D6', '#1E7BEA']);
    G.fill(_cpF);
    G.save(); G.clip(_cpA); const rg = G.createRadialGradient(120, 90, 0, 120, 90, 260); rg.addColorStop(0, 'rgba(255,255,245,.45)'); rg.addColorStop(1, 'rgba(255,255,245,0)'); G.fillStyle = rg; G.fillRect(0, 0, 480, 480); G.restore();
    if (o.ink) { G.strokeStyle = o.ink; G.lineJoin = 'round'; G.lineWidth = (o.sw ?? 1.5) / k; G.stroke(_cpA); }
    G.restore();
  };
  half(false); half(true);
  G.restore();
  if (o.glow) airbrush(gg, x, y, size * .8, size * .8, '#8a7aff', o.glow, 1);
}
function markPix(x, y, size, o = {}) { pixLayer(G => mark(G, x, y, size, o), { hard: true, outline: o.outline, glow: o.pglow }); if (o.glow) airbrush(gg, x, y, size * .8, size * .8, '#8a7aff', o.glow, 1); }

window.R = {
  TAU, LWK, canvas, path, poly, crescent, cel, line, ribbon, flutter, hex, mix, rgba, rng, hash, airbrush, vgrad,
  W, H, K, DW, DH, SC, GC, g, gg, NEON, limb,
  clamp, lerp, ease, easeOut, easeIn, back, seg, quant, onTwos, pulse, blink, typeText,
  reset, begin, withCam, both, px, BAYER, plate, ditherGrad, drawPlate, ditherFade, pixLayer, LR, lr,
  halftone, stars, starPath, sparkle, pxSpark, TITLE_GRAD, textX, inkRing, neonText, panel, hudText, logoText, label,
  THEMES, bevel, win, vnReveal, vnBox, meter, stamp,
  pixelate, iris, blinds, diamonds, stepFade, shake, letterbox,
  speedLines, gloom, flare, synthSun, synthGrid, screenFX, lg, mark, markPix
};
})();
