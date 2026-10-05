// paper.js — papercraft renderer: torn-edge cut-outs, sticker sheets with a white paper border, pop-up folds, grade.
// Recreates the francozanardi/papermotion paper look in plain Canvas2D (no npm). Everything is deterministic in GF.
'use strict';
const W = 1920, H = 1080, FPS = 30, TAU = Math.PI * 2;
const INK = '#2A1E2E', PAPER = '#FFFDF7', FONT = '"Segoe UI Black","Arial Black",sans-serif';
let X = null, GF = 0;

// ---------- deterministic noise
function pmHash(n) { n = Math.imul(n | 0, 374761393) ^ 0x9E3779B9; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }
function pmNoise(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return (pmHash(i) * (1 - u) + pmHash(i + 1) * u) * 2 - 1; }
function pmRng(seed) { let s = seed | 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- easing / timing
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (F, a, b) => clamp((F - a) / (b - a));
const eOut = t => 1 - Math.pow(1 - t, 3);
const eIn = t => t * t * t;
const eIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eBack = t => { const c = 1.9; return t <= 0 ? 0 : 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const eElastic = t => t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -9 * t) * Math.sin((t * 10 - .75) * TAU / 3) + 1;
const popK = (F, a, d = 12) => eBack(prog(F, a, a + d));
const hop = (F, a, d = 14, h = 1) => (F < a || F > a + d) ? 0 : Math.sin((F - a) / d * Math.PI) * h;

// ---------- textures (generated once at boot)
const TEX = {}, PATS = new WeakMap();
function makeTextures() {
  const mk = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
  const r = pmRng(7), S = 512, f = mk(S, S), c = f.getContext('2d');
  c.fillStyle = '#FBF8F2'; c.fillRect(0, 0, S, S);
  const id = c.getImageData(0, 0, S, S), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = (r() - .5) * 16; d[i] += v; d[i + 1] += v; d[i + 2] += v * 1.15; }
  c.putImageData(id, 0, 0);
  for (let i = 0; i < 1100; i++) {
    const x = r() * S, y = r() * S, a = r() * TAU, l = 6 + r() * 28, dark = r() < .55;
    c.strokeStyle = dark ? `rgba(125,95,65,${.05 + r() * .09})` : `rgba(255,255,255,${.35 + r() * .45})`; c.lineWidth = .6 + r() * 1.1;
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
      c.beginPath(); c.moveTo(x + ox, y + oy); c.quadraticCurveTo(x + ox + Math.cos(a + .6) * l * .5, y + oy + Math.sin(a + .6) * l * .5, x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); c.stroke();
    }
  }
  for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(95,70,45,${.08 + r() * .15})`; c.beginPath(); c.arc(r() * S, r() * S, .5 + r() * 1.5, 0, TAU); c.fill(); }
  TEX.fibre = f;
  const g = mk(256, 256), gc = g.getContext('2d'), gi = gc.createImageData(256, 256);
  for (let i = 0; i < gi.data.length; i += 4) { const v = 128 + (r() - .5) * 255; gi.data[i] = gi.data[i + 1] = gi.data[i + 2] = v; gi.data[i + 3] = 255; }
  gc.putImageData(gi, 0, 0); TEX.grain = g;
}
function pat(ctx, name) { let m = PATS.get(ctx); if (!m) PATS.set(ctx, m = {}); return m[name] || (m[name] = ctx.createPattern(TEX[name], 'repeat')); }

// ---------- geometry
function rectPts(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
function ellPts(cx, cy, rx, ry, n = 44, a0 = 0) { const p = []; for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
function rrPts(x, y, w, h, r, n = 5) {
  const p = [], cs = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
  for (const [cx, cy, a0] of cs) for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return p;
}
function bbox(pts) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of pts) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; }
// hand-cut edge: resample by arc length, offset along the normal by layered noise; re-cut ("boils") every 4 frames
function tornPath(pts, tear = 2.2, seed = 0, step = 6) {
  const P = new Path2D(), boil = Math.floor(GF / 4) % 3, n = pts.length; let arc = seed * 97.3, first = true;
  for (let i = 0; i < n; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % n], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, k = Math.max(1, Math.ceil(L / step));
    for (let j = 0; j < k; j++) {
      const t = j / k, o = (pmNoise(arc * .042 + boil * 41.3) + .35 * pmNoise(arc * .17 + boil * 17.1)) * tear;
      const x = ax + dx * t + dy / L * o, y = ay + dy * t - dx / L * o;
      if (first) P.moveTo(x, y); else P.lineTo(x, y); first = false; arc += L / k;
    }
  }
  P.closePath(); return P;
}
function innerRim(P, dx, dy, col) { const R = new Path2D(); R.rect(-1e4, -1e4, 3e4, 3e4); R.addPath(P, new DOMMatrix().translate(dx, dy)); X.fillStyle = col; X.fill(R, 'evenodd'); }

// ---------- a cut paper piece: drop shadow, fill, painted detail, rim light/core shadow, fibre texture, pale cut edge
function piece(pts, o = {}) {
  const P = tornPath(pts, o.tear ?? 2.2, o.seed ?? 0), b = bbox(pts);
  X.save();
  if (o.shadow !== false) { X.shadowColor = o.shCol || 'rgba(40,20,10,.38)'; X.shadowBlur = o.blur ?? 12; X.shadowOffsetX = o.shx ?? 5; X.shadowOffsetY = o.shy ?? 8; }
  X.fillStyle = typeof o.fill === 'function' ? o.fill() : (o.fill || '#E8DCC8'); X.fill(P); X.restore();
  X.save(); X.clip(P);
  if (o.deco) o.deco(b);
  if (o.rim !== false) { innerRim(P, 5, 6, 'rgba(255,248,235,.2)'); innerRim(P, -4, -5, 'rgba(70,35,15,.16)'); }
  if (o.tex !== false) { X.globalCompositeOperation = 'multiply'; X.fillStyle = pat(X, 'fibre'); X.fillRect(b[0] - 6, b[1] - 6, b[2] - b[0] + 12, b[3] - b[1] + 12); }
  X.restore();
  if (o.edge !== false) { X.save(); X.lineWidth = 1.4; X.strokeStyle = 'rgba(255,246,232,.38)'; X.stroke(P); X.restore(); }
  return P;
}

// ---------- sticker sheet: art drawn by fn() at (ox,oy) in a w×h scratch gets a white paper border (dilated silhouette),
// fibre texture and a drop shadow. o.sx = cos(flip angle) for card flips; o.back shows the plain paper back.
const POOL = {};
function scratchSet(w, h) {
  const k = w + 'x' + h;
  if (!POOL[k]) POOL[k] = [0, 1, 2].map(() => Object.assign(document.createElement('canvas'), { width: w, height: h }).getContext('2d'));
  return POOL[k];
}
function sheet(w, h, ox, oy, fn, o = {}) {
  const sx = (o.sx ?? 1) * (o.s ?? 1), sy = (o.sy ?? 1) * (o.s ?? 1);
  if (Math.abs(sx) < .004 || Math.abs(sy) < .004 || (o.alpha ?? 1) <= 0) return;
  const [A, M, S] = scratchSet(w, h), keep = X, bw = o.border ?? 9;
  A.setTransform(1, 0, 0, 1, 0, 0); A.clearRect(0, 0, w, h); A.translate(ox, oy); X = A; fn(); X = keep; A.setTransform(1, 0, 0, 1, 0, 0);
  M.globalCompositeOperation = 'source-over'; M.clearRect(0, 0, w, h);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; M.drawImage(A.canvas, Math.cos(a) * bw, Math.sin(a) * bw); }
  for (let i = 0; i < 8; i++) { const a = (i + .5) / 8 * TAU; M.drawImage(A.canvas, Math.cos(a) * bw * .55, Math.sin(a) * bw * .55); }
  M.drawImage(A.canvas, 0, 0);
  S.globalCompositeOperation = 'source-over'; S.clearRect(0, 0, w, h); S.drawImage(M.canvas, 0, 0);
  S.globalCompositeOperation = 'source-in'; S.fillStyle = o.paper || PAPER; S.fillRect(0, 0, w, h);
  S.globalCompositeOperation = 'source-over';
  const back = o.back ?? sx < 0;
  if (!back) S.drawImage(A.canvas, 0, 0);
  else { S.globalCompositeOperation = 'source-atop'; S.fillStyle = '#EDE4D3'; S.fillRect(0, 0, w, h); S.globalAlpha = .07; S.drawImage(A.canvas, 0, 0); S.globalAlpha = 1; }
  S.globalCompositeOperation = 'multiply'; S.fillStyle = pat(S, 'fibre'); S.fillRect(0, 0, w, h);
  S.globalCompositeOperation = 'destination-in'; S.drawImage(M.canvas, 0, 0);
  S.globalCompositeOperation = 'source-over';
  X.save(); X.translate(o.x || 0, o.y || 0); if (o.rot) X.rotate(o.rot); X.scale(sx, sy);
  X.globalAlpha *= o.alpha ?? 1;
  if (o.shadow !== false) { X.shadowColor = o.shCol || 'rgba(40,20,10,.42)'; X.shadowBlur = o.blur ?? 10; X.shadowOffsetX = o.shx ?? 6; X.shadowOffsetY = o.shy ?? 9; }
  X.drawImage(S.canvas, -ox, -oy); X.restore();
}

// ---------- pop-up fold: scenery hinged at baseY stands up as k goes 0→1 (with the paper back showing while low)
function popup(k, baseY, fn) {
  if (k <= .002) return;
  X.save(); X.translate(0, baseY); X.scale(1, Math.min(1.08, k)); X.translate(0, -baseY); fn(); X.restore();
}

// ---------- ink drawing helpers (used inside sheets)
function shape(build, fill, o = {}) {
  X.beginPath(); build();
  if (fill) { X.fillStyle = fill; X.fill(); }
  if (o.sw !== 0) { X.lineWidth = o.sw ?? 4.5; X.strokeStyle = o.ink || INK; X.lineJoin = 'round'; X.lineCap = 'round'; X.stroke(); }
}
const circ = (x, y, r) => () => X.arc(x, y, r, 0, TAU);
const ell = (x, y, rx, ry, a = 0) => () => X.ellipse(x, y, rx, ry, a, 0, TAU);
const rr = (x, y, w, h, r) => () => X.roundRect(x, y, w, h, r);
const poly = pts => () => pts.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)) || X.closePath();
function lgr(x0, y0, x1, y1, stops) { const g = X.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => Array.isArray(s) ? g.addColorStop(s[0], s[1]) : g.addColorStop(i / (stops.length - 1), s)); return g; }
function rgr(x, y, r0, r1, stops) { const g = X.createRadialGradient(x, y, r0, x, y, r1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; }
function line(x0, y0, x1, y1, col = INK, w = 4.5) { X.beginPath(); X.moveTo(x0, y0); X.lineTo(x1, y1); X.strokeStyle = col; X.lineWidth = w; X.lineCap = 'round'; X.stroke(); }

// ---------- text
const MEAS = document.createElement('canvas').getContext('2d');
function txt(str, x, y, size, fill = INK, o = {}) {
  X.save(); X.font = `${o.weight || 900} ${size}px ${o.font || FONT}`; X.textAlign = o.align || 'center'; X.textBaseline = 'middle';
  if (o.stroke) { X.lineJoin = 'round'; X.lineWidth = o.sw || size * .14; X.strokeStyle = o.stroke; X.strokeText(str, x, y); }
  X.fillStyle = fill; X.fillText(str, x, y); X.restore();
}
// a sticker of text with a white paper border; fill may be a function returning a gradient (coords around 0,0)
function stickerText(str, x, y, size, o = {}) {
  MEAS.font = `900 ${size}px ${FONT}`;
  const tw = MEAS.measureText(str).width, w = Math.ceil((tw + size * .6 + 40) / 64) * 64, h = Math.ceil((size * 1.45 + 40) / 64) * 64;
  sheet(w, h, w / 2, h / 2, () => {
    const fill = typeof o.fill === 'function' ? o.fill(tw, size) : (o.fill || INK);
    txt(str, 0, size * .04, size, fill, { stroke: o.stroke ?? INK, sw: o.sw ?? size * .13 });
  }, { x, y, rot: o.rot, s: o.s, sx: o.sx, sy: o.sy, alpha: o.alpha, border: o.border ?? Math.max(6, size * .1), shadow: o.shadow });
}

// ---------- camera & grade
function camera(c) { X.translate(W / 2, H / 2); X.scale(c.z || 1, c.z || 1); X.rotate(c.r || 0); X.translate(-W / 2 + (c.x || 0), -H / 2 + (c.y || 0)); }
function shake(F, a, d, amp) { if (F < a || F > a + d) return [0, 0]; const k = (1 - (F - a) / d) * amp; return [pmNoise(F * .9) * k, pmNoise(F * .9 + 50) * k]; }
function grade(F) {
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0);
  X.globalCompositeOperation = 'soft-light'; X.fillStyle = 'rgba(245,215,170,.35)'; X.fillRect(0, 0, W, H);
  X.globalCompositeOperation = 'source-over';
  X.fillStyle = (() => { const g = X.createRadialGradient(W / 2, H * .45, H * .38, W / 2, H / 2, H * 1.08); g.addColorStop(0, 'rgba(60,30,15,0)'); g.addColorStop(1, 'rgba(60,30,15,.5)'); return g; })();
  X.fillRect(0, 0, W, H);
  X.globalCompositeOperation = 'overlay'; X.globalAlpha = .07; X.fillStyle = pat(X, 'grain');
  X.translate(-Math.floor(pmHash(F * 3) * 256), -Math.floor(pmHash(F * 7 + 1) * 256)); X.fillRect(0, 0, W + 256, H + 256);
  X.restore();
}
